---

title: "How does mocker in Python work?"
description: "How does mocker in Python works under the hood and how to build a tiny version of it yourself."
date: 2025-11-23
tags: ["python", "mocks"]
featured: true
draft: false
locale: en
translationKey: python-mocker
-----------------------------

# How does `mocker` in Python work?

Short answer:
`mocker` is a **pytest fixture** provided by the [`pytest-mock`](https://github.com/pytest-dev/pytest-mock) plugin.

It gives you a small object (usually called `mocker`) that wraps Python’s standard library [`unittest.mock`](https://docs.python.org/3/library/unittest.mock.html) and lets you:

* **Replace (“patch”) real objects** (functions, methods, attributes) with controllable fakes (`MagicMock`).
* **Track calls**: how many times a fake was called, with what arguments, etc.
* **Automatically undo all patches** at the end of the test so your code goes back to normal.

> “For this test, temporarily swap this function with a fake one.”

---

## 2. Why patch “where it is used” instead of “where it is defined”?

**Rule of thumb:**

> Patch the **name visible inside the module under test**, not the original place where the object was first defined.

**email_service.py**

```python
from email_gateway import send_email


def notify_user(recipient: str, message: str) -> str:
    """Send the standard account-update email copy to a user."""
    subject = "Account update"
    body = f"Hello!\n\n{message}"
    return send_email(recipient, subject, body)
```

The high-level `notify_user` function imports `send_email` and closes over that name. Tests therefore patch `email_service.send_email`, not `email_gateway.send_email`.

**email_gateway.py**

```python
import hashlib
import smtplib
from email.message import EmailMessage


def send_email(recipient: str, subject: str, body: str) -> str:
    """Deliver transactional email through our SMTP relay."""
    if "@" not in recipient:
        raise ValueError("Recipient must be an email address")

    domain = recipient.split("@", 1)[1]
    normalized_subject = subject.strip().capitalize()
    checksum = hashlib.sha1(body.encode()).hexdigest()[:6]
    snippet = body.strip().splitlines()[0][:24] if body.strip() else ""

    computed_subject = f"[{domain}] {normalized_subject} • {checksum}"
    if snippet:
        computed_subject += f" | {snippet}"

    message = EmailMessage()
    message["From"] = "noreply@example.com"
    message["To"] = recipient
    message["Subject"] = computed_subject
    message.set_content(body)

    try:
        with smtplib.SMTP("mail.example.com", 587, timeout=3) as client:
            client.starttls()
            client.login("noreply@example.com", "super-secret")
            client.send_message(message)
    except OSError:
        pass

    return f"sent:{recipient}:{computed_subject}"
```

This “scary” dependency is exactly why tests reach for `mocker`: they can replace the SMTP call with something deterministic.

---

## 4. Under the hood: a tiny version of `MockerFixture`

The real `MockerFixture` is more complex, but conceptually it wraps `unittest.mock.patch`.

### How `unittest.mock.patch` works (simplified mental model)

`unittest.mock.patch("module.attr", new=...)`:

1. Splits `"module.attr"` into:

   * module: `"module"`
   * attribute: `"attr"`
2. Imports the module.
3. Stores the original `module.attr`.
4. Replaces `module.attr` with your fake (`new` / `MagicMock`).
5. Returns a “patcher” object that can later `.stop()` to restore the original.

---

## 5. A minimal custom `TinyMocker`

Now let’s build our own **mini version** of `mocker` so you can see all the moving parts.

We won’t use `unittest.mock.patch` at all.
We’ll do the work manually with:

* `importlib.import_module`
* `getattr` / `setattr`
* `unittest.mock.MagicMock`

### Code

**pocket_mocker.py**

```python
import importlib
from unittest.mock import MagicMock


class PocketMocker:
    """Tiny helper to mimic the patching API readers see from pytest-mock."""

    def __init__(self):
        self._stack = []

    def patch(self, target: str, replacement=None, **kwargs):
        module_path, attribute = target.rsplit(".", 1)
        module = importlib.import_module(module_path)
        original = getattr(module, attribute)
        if replacement is None:
            replacement = MagicMock(**kwargs)
        setattr(module, attribute, replacement)
        self._stack.append((module, attribute, original))
        return replacement

    def stopall(self):
        while self._stack:
            module, attribute, original = self._stack.pop()
            setattr(module, attribute, original)
```

**test_email_service.py**

```python
import email_service
from pocket_mocker import PocketMocker


def test_notify_user_with_pytest_mocker(mocker):
    mocker.patch(
        "email_service.send_email", return_value="sent:me@example.com:Account update"
    )
    result = email_service.notify_user("me@example.com", "You have a new badge!")
    assert result == "sent:me@example.com:Account update"


def test_notify_user_with_pocket_mocker():
    pocket = PocketMocker()
    pocket.patch(
        "email_service.send_email", return_value="sent:you@example.com:Account update"
    )

    result = email_service.notify_user("you@example.com", "Password changed")
    assert result == "sent:you@example.com:Account update"

    pocket.stopall()
```

The first test shows the real `pytest-mock` fixture in action, while the second runs through the DIY implementation so you can trace every step.

### The low-level helpers explained

* `importlib.import_module(module_path)`

  * Takes a string like `"notifications.mailer"` and returns the actual module object.
  * Internally uses Python’s import machinery and `sys.modules`.

* `getattr(module, attr_name)`

  * Reads an attribute from an object.
  * Equivalent to `module.attr_name`.

* `setattr(module, attr_name, replacement)`

  * Assigns an attribute on an object.
  * Equivalent to `module.attr_name = replacement`.
  * This is literally the “patch” step: we overwrite the original function with our fake.

* `MagicMock(**kwargs)`

  * Creates a highly flexible fake object that:

    * Records calls (so you can assert later).
    * Can be configured with `return_value` or `side_effect`.
    * Supports attributes and methods dynamically.

By building `TinyMocker`, you can see that `pytest-mock` + `unittest.mock` are “just” a nicer layer over this same core behavior.

---

## Deep Search companion

Want the giant research dump, references, and best practices? Jump to the [Deep Search companion post](/blog/2025-11-29-mocker-python-deep-search) to read every source and comparison we collected while building this guide.
****
