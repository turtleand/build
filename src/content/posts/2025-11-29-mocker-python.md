---
title: "How does mocker in Python work?"
description: "How does mocker in Python work?"
date: 2025-11-23
tags: ["python", "mocks"]
featured: true
draft: false
locale: en
translationKey: python-mocker
---

How does mocker in Python work?

`mocker` is a pytest fixture that gives you access to the `unittest.mock` helpers so you can replace objects with controllable doubles during a test without changing your production code.

Here is a rough idea of the flow in pseudocode:

```text
test_function_receives_mocker(mocker):
    target = "package.module.Class.method"
    fake = mocker.patch(target)
    fake.return_value = desired_value
    call_code_that_uses_method()
    assert fake.called_with_expected_args()
```

Example using `pytest-mock`:

```python
def test_sends_email(mocker):
    send_mail = mocker.patch("notifications.mailer.send_mail", return_value=True)

    result = process_signup(user_id=42)

    send_mail.assert_called_once_with(user_id=42)
    assert result is True
```

In this snippet the `test_sends_email` function is our test that **uses** the `mocker` fixture, while `notifications.mailer.send_mail` is the function being replaced. When `mocker.patch` runs it swaps out the real `send_mail` implementation inside `notifications.mailer` with a `MagicMock` instance, so any code (such as `process_signup`) that imports `send_mail` from that module now receives the fake object instead of the original function.

The key is that you patch the object at the place where it is looked up, not where it was originally defined. If `process_signup` does `from notifications import mailer` and then calls `mailer.send_mail`, you must target `notifications.mailer.send_mail`. That way, when the production code executes, it interacts with your mocked object, letting you assert how it was called without invoking the real external dependency.

### What the production code looks like

`notifications.mailer.send_mail` is usually a thin wrapper that delegates to an infrastructure provider and returns whether the operation succeeded:

```python
# notifications/mailer.py
from vendor.email_service import EmailService

service = EmailService()

def send_mail(user_id: int) -> bool:
    payload = {"template": "welcome", "user_id": user_id}
    service.send(payload)  # talks to the external provider
    return True
```

Your application code calls it to avoid duplicating integration logic:

```python
# services/signup.py
from notifications import mailer

def process_signup(user_id: int) -> bool:
    # ... create user, log metrics, etc.
    return mailer.send_mail(user_id=user_id)
```

### How the pytest test ties everything together

The test injects a fake `send_mail` so you can assert how the service acts without reaching a real SMTP provider:

```python
# tests/test_signup.py
from services.signup import process_signup

def test_signup_triggers_mailer(mocker):
    fake_send = mocker.patch("notifications.mailer.send_mail", return_value=True)

    assert process_signup(user_id=7) is True
    fake_send.assert_called_once_with(user_id=7)
```

This test calls `mocker.patch` on the import path the service uses (`notifications.mailer.send_mail`). The fixture stores the original function, swaps it with a `MagicMock`, and automatically restores it when the test ends.

### A minimal custom mocker

Under the hood, `pytest-mock` leans on the `unittest.mock.patch` helper. A bare-bones version only needs to resolve a string target, replace the attribute, and remember how to undo it:

```python
# tiny_mocker.py
import importlib

class TinyMocker:
    def __init__(self):
        self._undo = []

    def patch(self, target, replacement=None, **kwargs):
        module_path, attr_name = target.rsplit(".", 1)
        module = importlib.import_module(module_path)
        original = getattr(module, attr_name)

        if replacement is None:
            from unittest.mock import MagicMock
            replacement = MagicMock(**kwargs)

        setattr(module, attr_name, replacement)
        self._undo.append((module, attr_name, original))
        return replacement

    def stopall(self):
        while self._undo:
            module, attr_name, original = self._undo.pop()
            setattr(module, attr_name, original)
```

This simplified class mirrors the fixture: `patch` splits the target string, imports the module, and swaps the attribute with a `MagicMock`. `stopall` restores the originals, just like the fixture’s cleanup hook.

### Copy-paste runnable demonstration

Paste the following into `demo_mocker.py` and run `python demo_mocker.py`. It builds a fake `notifications.mailer` module, a `process_signup` function, our `TinyMocker`, and a demonstration test so you can watch everything interact:

```python
import importlib
import sys
import types
from unittest.mock import MagicMock


# --- Build fake modules dynamically so imports work in one file ---
notifications = types.ModuleType("notifications")
mailer = types.ModuleType("notifications.mailer")

def real_send_mail(user_id: int) -> bool:
    print(f"[mailer] Actually sending welcome email to user {user_id}")
    return True

mailer.send_mail = real_send_mail
notifications.mailer = mailer
sys.modules["notifications"] = notifications
sys.modules["notifications.mailer"] = mailer


# --- Application code that imports the module like production code would ---
from notifications import mailer as imported_mailer

def process_signup(user_id: int) -> bool:
    print(f"[service] Registering user {user_id}")
    return imported_mailer.send_mail(user_id)


# --- Tiny mocker implementation ---
class TinyMocker:
    def __init__(self):
        self._undo = []

    def patch(self, target, replacement=None, **kwargs):
        module_path, attr_name = target.rsplit(".", 1)
        module = importlib.import_module(module_path)
        original = getattr(module, attr_name)

        if replacement is None:
            replacement = MagicMock(**kwargs)

        setattr(module, attr_name, replacement)
        self._undo.append((module, attr_name, original))
        return replacement

    def stopall(self):
        while self._undo:
            module, attr_name, original = self._undo.pop()
            setattr(module, attr_name, original)


# --- Demo / test harness ---
def run_demo():
    mocker = TinyMocker()
    fake_mailer = mocker.patch("notifications.mailer.send_mail", return_value=True)

    result = process_signup(user_id=99)

    fake_mailer.assert_called_twice()
    print(f"[test] fake mailer called: {fake_mailer.called}, result: {result}")

    mocker.stopall()
    print("[test] Restored real mailer:", imported_mailer.send_mail is real_send_mail)

if __name__ == "__main__":
    run_demo()
```

Running the script prints the “test” output, and you can comment out the `mocker.patch` call to see the real `real_send_mail` print statement run. This demonstrates how `pytest-mock` swaps the function at the lookup site, how the fake tracks calls, and how everything is restored afterward.
