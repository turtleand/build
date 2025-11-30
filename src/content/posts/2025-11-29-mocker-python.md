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

You don’t have to change your production code. You just tell `mocker`:

> “For this test, temporarily swap this function with a fake one.”

---

## 1. Big picture: what happens when you call `mocker.patch`?

### Pseudocode

Think like this:

```text
test_function(mocker):
    # 1. Choose what to fake
    target = "package.module.Class.method"

    # 2. Replace it with a MagicMock
    fake = mocker.patch(target)

    # 3. Configure expected behavior
    fake.return_value = desired_value

    # 4. Run the code that uses that method
    call_code_that_uses_method()

    # 5. Assert how the fake was used
    fake.assert_called_with(expected_args)
```

Key ideas:

* `target` is a *string* telling `mocker` where to find the attribute (like `"module.submodule.attr"`).
* `mocker.patch(target)`:

  * Locates the module.
  * Reads the original attribute.
  * Stores the original somewhere.
  * Replaces it with a `MagicMock`.
* When the test ends, `pytest-mock` **restores the original** attribute automatically.

### Simple pytest example

```python
# services/signup.py
from notifications import mailer

def process_signup(user_id: int) -> bool:
    # ... create the user, log, etc. ...
    return mailer.send_mail(user_id=user_id)
```

```python
# tests/test_signup.py
from services.signup import process_signup

def test_sends_email(mocker):
    # 1. Patch where the code *looks* it up: notifications.mailer.send_mail
    send_mail = mocker.patch(
        "notifications.mailer.send_mail",
        return_value=True,   # 2. Fake returns True instead of actually sending an email
    )

    # 3. Run the code under test
    result = process_signup(user_id=42)

    # 4. Assert how the fake was used
    send_mail.assert_called_once_with(user_id=42)
    assert result is True
```

What’s happening:

* `process_signup` imports `mailer` and calls `mailer.send_mail`.
* `mocker.patch("notifications.mailer.send_mail", ...)` **replaces that exact attribute** inside the `notifications.mailer` module.
* When `process_signup` runs, it calls the **fake** instead of the real `send_mail`.
* The fake is a `MagicMock`, so it:

  * Remembers that it was called.
  * Remembers the arguments.
  * Returns the value you configured (`True`).

---

## 2. Why patch “where it is used” instead of “where it is defined”?

Imagine:

```python
# notifications/mailer.py
from vendor.email_service import EmailService

service = EmailService()

def send_mail(user_id: int) -> bool:
    payload = {"template": "welcome", "user_id": user_id}
    service.send(payload)
    return True
```

```python
# services/signup.py
from notifications import mailer

def process_signup(user_id: int) -> bool:
    # ...
    return mailer.send_mail(user_id=user_id)
```

The important detail:

* Inside `services/signup.py`, the code doesn’t call `vendor.email_service.EmailService.send`.
* It calls `mailer.send_mail`, where `mailer` is the module imported from `notifications`.

So in the test, you must patch exactly what `process_signup` uses:

```python
mocker.patch("notifications.mailer.send_mail", return_value=True)
```

If you instead patched `"vendor.email_service.EmailService.send"`, but `mailer.py` already created `service = EmailService()` earlier, your patch might not affect that existing instance.

**Rule of thumb:**

> Patch the **name visible inside the module under test**, not the original place where the object was first defined.


## 3. How pytest gives you the `mocker` fixture

Under the hood, pytest works like this:

* You write tests that **accept arguments** (fixture names).
* Pytest sees a test parameter (e.g. `mocker`) and tries to find a fixture with that name.
* `pytest-mock` registers a fixture called `mocker` that returns a special object (`MockerFixture`).

Roughly:

```python
# inside pytest-mock (simplified, not exact code)

import pytest
from ._mock import MockerFixture  # imaginary location


@pytest.fixture
def mocker():
    mf = MockerFixture()
    try:
        # this is what your test receives
        yield mf
    finally:
        # after the test, restore everything that was patched
        mf.stopall()
```

So in your test:

```python
def test_something(mocker):
    # mocker is a MockerFixture instance
    ...
```

When the test returns (or raises), `mf.stopall()` is called and all patches are undone.

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

A simplified version of `MockerFixture` might look like this:

```python
# this is *not* the real code; it's a mental model
import unittest.mock as _mock


class MockerFixture:
    def __init__(self):
        # keep track of all active patchers
        self._patchers = []

    def patch(self, target, **kwargs):
        """
        target: string "package.module.attr"
        kwargs: all arguments that `unittest.mock.patch` accepts,
        like return_value, side_effect, autospec, etc.
        """
        patcher = _mock.patch(target, **kwargs)
        self._patchers.append(patcher)

        # start() applies the patch and returns the MagicMock (or new object)
        mock = patcher.start()
        return mock

    def stopall(self):
        """Undo every patch in reverse order."""
        while self._patchers:
            patcher = self._patchers.pop()
            patcher.stop()
```

Your pytest test gets an instance of `MockerFixture` as `mocker`, so:

```python
def test_example(mocker):
    fake = mocker.patch("some.module.func", return_value=123)
    # uses unittest.mock.patch under the hood
```

Under the hood, this is basically:

* Call `unittest.mock.patch(...)`.
* Call `.start()` to apply the patch and get the fake object.
* Remember the patcher in an internal list so `.stopall()` can undo everything later.

---

## 5. A minimal custom `TinyMocker`

Now let’s build our own **mini version** of `mocker` so you can see all the moving parts.

We won’t use `unittest.mock.patch` at all.
We’ll do the work manually with:

* `importlib.import_module`
* `getattr` / `setattr`
* `unittest.mock.MagicMock`

### Code

```python
# tiny_mocker.py
import importlib
from unittest.mock import MagicMock


class TinyMocker:
    def __init__(self):
        # Each entry: (module_object, attr_name, original_value)
        self._undo_stack = []

    def patch(self, target: str, replacement=None, **kwargs):
        """
        target: string like 'package.module.attr'
        replacement: optional object to install instead.
                     If None, we'll create a MagicMock for you.
        kwargs: extra keyword args passed to MagicMock
                (e.g. return_value=..., side_effect=...)
        """
        # 1. Split "notifications.mailer.send_mail"
        module_path, attr_name = target.rsplit(".", 1)

        # 2. Import the module object
        module = importlib.import_module(module_path)

        # 3. Fetch the original attribute
        original = getattr(module, attr_name)

        # 4. If no replacement given, build a MagicMock
        if replacement is None:
            replacement = MagicMock(**kwargs)
        else:
            # If you pass a replacement AND kwargs, kwargs are ignored here.
            # (Real pytest-mock is more flexible; this is minimal.)
            pass

        # 5. Set the module attribute to the new replacement
        setattr(module, attr_name, replacement)

        # 6. Remember how to undo this
        self._undo_stack.append((module, attr_name, original))

        # 7. Return the fake object so the test can assert on it
        return replacement

    def stopall(self):
        """Undo every patch (LIFO order)."""
        while self._undo_stack:
            module, attr_name, original = self._undo_stack.pop()
            setattr(module, attr_name, original)
```

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

## 6. Copy-paste runnable demonstration

This is a single file you can run with:

```bash
python demo_mocker.py
```

It will:

1. Dynamically create fake modules (`notifications`, `notifications.mailer`) so we don’t need real files.
2. Implement a real `send_mail` function.
3. Implement `process_signup` that imports and calls `mailer.send_mail`.
4. Implement `TinyMocker`.
5. Run a “test” that patches `send_mail`, checks that it was called, and restores it.

### `demo_mocker.py`

```python
import importlib
import sys
import types
from unittest.mock import MagicMock


# --- Build fake modules dynamically so imports work in one file ---

# Create a "notifications" package-like module
notifications = types.ModuleType("notifications")

# Create a "notifications.mailer" submodule
mailer = types.ModuleType("notifications.mailer")


def real_send_mail(user_id: int) -> bool:
    print(f"[mailer] Actually sending welcome email to user {user_id}")
    return True


# Attach the real function to the mailer module
mailer.send_mail = real_send_mail

# Make `notifications.mailer` accessible
notifications.mailer = mailer

# Register both modules in sys.modules so importlib / import can find them
sys.modules["notifications"] = notifications
sys.modules["notifications.mailer"] = mailer


# --- Application code that imports the module like production code would ---

from notifications import mailer as imported_mailer


def process_signup(user_id: int) -> bool:
    print(f"[service] Registering user {user_id}")
    # This call will go through whatever is currently in mailer.send_mail
    return imported_mailer.send_mail(user_id)


# --- Tiny mocker implementation (from previous section) ---


class TinyMocker:
    def __init__(self):
        self._undo = []

    def patch(self, target, replacement=None, **kwargs):
        """
        target: 'notifications.mailer.send_mail'
        replacement: optional fake. If None, we create a MagicMock.
        kwargs: forwarded to MagicMock().
        """
        module_path, attr_name = target.rsplit(".", 1)
        module = importlib.import_module(module_path)
        original = getattr(module, attr_name)

        if replacement is None:
            replacement = MagicMock(**kwargs)

        setattr(module, attr_name, replacement)
        self._undo.append((module, attr_name, original))
        return replacement

    def stopall(self):
        """Restore all patched attributes to their original values."""
        while self._undo:
            module, attr_name, original = self._undo.pop()
            setattr(module, attr_name, original)


# --- Demo / "test" harness ---


def run_demo():
    mocker = TinyMocker()

    print("=== Before patching ===")
    # This should call the real_send_mail and print from [mailer]
    process_signup(user_id=1)

    print("\n=== Applying patch ===")
    fake_mailer = mocker.patch(
        "notifications.mailer.send_mail",
        return_value=True,  # our fake will now just return True
    )

    # This call now uses the MagicMock instead of real_send_mail
    result = process_signup(user_id=99)

    print("\n=== Assertions on the fake ===")
    print("fake_mailer.called:", fake_mailer.called)
    print("fake_mailer.call_args:", fake_mailer.call_args)

    # This should pass: it was called exactly once with argument 99
    fake_mailer.assert_called_once_with(99)

    print(f"[test] Fake mailer called correctly, result from process_signup: {result}")

    print("\n=== Restoring original ===")
    mocker.stopall()
    print("Restored real mailer:",
          imported_mailer.send_mail is real_send_mail)

    # This should now call the real function again
    process_signup(user_id=2)


if __name__ == "__main__":
    run_demo()
```

### What you should see when you run it

You’ll see something like:

```text
=== Before patching ===
[service] Registering user 1
[mailer] Actually sending welcome email to user 1

=== Applying patch ===
[service] Registering user 99

=== Assertions on the fake ===
fake_mailer.called: True
fake_mailer.call_args: call(99)
[test] Fake mailer called correctly, result from process_signup: True

=== Restoring original ===
Restored real mailer: True
[service] Registering user 2
[mailer] Actually sending welcome email to user 2
```

Notice:

* When *not* patched, you see the `[mailer] Actually sending...` line.
* When patched, there is **no mailer print**, because we replaced `send_mail` with a `MagicMock` that just returns `True`.
* Our assertions on `fake_mailer` (call count and arguments) pass.
* After `stopall()`, the real function is back.

---

## 7. Connecting this back to `pytest-mock`'s `mocker`

Now map our `TinyMocker` to real `pytest-mock`:

* `TinyMocker.patch(...)` ≈ `mocker.patch(...)`

  * Both:

    * Parse the `"module.attr"` string.
    * Use `importlib.import_module`.
    * Use `getattr` and `setattr`.
    * Use `MagicMock` when you don’t provide a replacement.
* `TinyMocker.stopall()` ≈ `mocker.stopall()`

  * Both restore all patched attributes.
* In real pytest:

  * You don’t call `stopall()` yourself.
  * The fixture wrapper calls `stopall()` in a `finally` block after each test.

So mentally, when you write:

```python
def test_signup_triggers_mailer(mocker):
    fake_send = mocker.patch("notifications.mailer.send_mail", return_value=True)

    assert process_signup(user_id=7) is True
    fake_send.assert_called_once_with(user_id=7)
```

You can imagine it as:

```python
def test_signup_triggers_mailer():
    mocker = TinyMocker()

    try:
        fake_send = mocker.patch("notifications.mailer.send_mail", return_value=True)
        assert process_signup(user_id=7) is True
        fake_send.assert_called_once_with(user_id=7)
    finally:
        mocker.stopall()
```

`pytest-mock` just integrates this with pytest fixtures, adds more helpers (`spy`, `stub`, `resetall`, scope variants), and piggybacks on all the power of `unittest.mock`.

---

## 8. Things you can try on your own machine

To deepen understanding, tweak `demo_mocker.py`:

1. **Remove the patch line**

   Comment out:

   ```python
   fake_mailer = mocker.patch("notifications.mailer.send_mail", return_value=True)
   ```

   Now you should see the real mailer function being called both before and after.

2. **Change the target string**

   Mistype it:

   ```python
   mocker.patch("notifications.mailer.sendmail", return_value=True)
   ```

   You should get an `AttributeError` when `getattr(module, attr_name)` runs.
   This shows how sensitive patching is to the **exact attribute name**.

3. **Patch the wrong place**

   Try patching `"real_send_mail"` directly instead of the module attribute:

   ```python
   mocker.patch("__main__.real_send_mail", return_value=True)
   ```

   Notice that `process_signup` *still* calls whatever is stored in `mailer.send_mail`, so your patch doesn’t change behavior.
   This demonstrates why you must patch **where the code looks up the function**.

4. **Inspect multiple calls**

   Call `process_signup` twice after patching and check:

   ```python
   process_signup(user_id=100)
   process_signup(user_id=101)
   print(fake_mailer.call_count)        # should be 2
   print(fake_mailer.call_args_list)    # list of all calls
   ```

   This helps you see how `MagicMock` stores call history.

Once you’re comfortable with this tiny mocker, reading `pytest-mock` source and using the real `mocker` fixture will feel much less magical: it’s “just” a nicer, more robust version of the same ideas.

---

## Deep Search companion

Want the giant research dump, references, and best practices? Jump to the [Deep Search companion post](/blog/2025-11-29-mocker-python-deep-search) to read every source and comparison we collected while building this guide.
****
