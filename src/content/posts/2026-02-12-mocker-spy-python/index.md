---

title: "Spying Without Replacing with mocker.spy"
description: "How to watch real functions without faking them."
date: 2026-02-12
tags: ["python", "mocks"]
featured: true
draft: false
image:
  src: /images/posts/python-logo.svg
  alt: "Python Logo"
locale: en
translationKey: python-mocker-spy
slug: "2026-02-12-mocker-spy-python"
-----------------------------

Sometimes you want to verify that a function was called with the right arguments **without replacing it** with a fake. That's what `mocker.spy` does.

Where [`mocker.patch`](/blog/2025-11-29-mocker-python) swaps the real function for a `MagicMock`, `mocker.spy` wraps the real function so it still runs normally — but the wrapper records every call, argument, and return value.

---

## 1. Code Example

**converter.py**

```python file=./sandbox/converter.py
```

**weather.py**

```python file=./sandbox/weather.py
```

`weather.py` does `from converter import celsius_to_fahrenheit`, which creates a **local name binding** inside the `weather` module.

## 2. What should be spied?

The same ["patch where it's used"](/blog/2025-11-29-mocker-python#2-what-should-be-the-target) rule applies to spies.

`mocker.spy(obj, name)` works via `setattr` — it replaces `obj.name` with a wrapper that delegates to the original function. If the calling module imported the function with `from X import Y`, the name binding lives in **the caller's namespace**, not in the original module.

**Correct** — spy where the function is used:

```python
mocker.spy(weather, "celsius_to_fahrenheit")
```

**Wrong** — spy where the function is defined:

```python
mocker.spy(converter, "celsius_to_fahrenheit")
```

The wrong target replaces the attribute in `converter`, but `weather.celsius_to_fahrenheit` still points directly to the unwrapped function — the spy sees nothing.

## 3. Tests

**test_weather.py**

```python file=./sandbox/test_weather.py
```

**Test output**

```text file=./sandbox/test_weather.output.txt
```

The first test spies on the correct target and verifies the call was tracked. The second test shows that spying on the definition site misses the call entirely — `spy.call_count` stays at zero.

## 4. Spy-specific attributes

Beyond the standard `MagicMock` assertions (`assert_called_once_with`, `call_args`, `call_count`, …), a spy adds:

* **`spy.spy_return`** — the return value of the last real call.
* **`spy.spy_exception`** — the exception raised by the last real call (or `None`).

These let you inspect what the **real** function did, not just that it was called.
