---

title: "Patching the Right Thing with mocker"
description: "A quick tour on why “patch where it’s used” matters."
date: 2025-11-30
tags: ["python", "mocks"]
featured: true
draft: false
locale: en
translationKey: python-mocker
slug: "2025-11-29-mocker-python"
-----------------------------
<!-- snippet-hash: a52723d3f46e94af33bc205dcc90e2a2de446e90 -->

Short answer:
`mocker` is a **pytest fixture** provided by the [`pytest-mock`](https://github.com/pytest-dev/pytest-mock) plugin.

It provides a small helper object (usually called `mocker`) that wraps Python’s standard library [`unittest.mock`](https://docs.python.org/3/library/unittest.mock.html) so you can:

* **Replace (“patch”) real objects** (functions, methods, attributes) with controllable `MagicMock` fakes.
* **Track calls**: check how many times a fake ran, which arguments it saw, and related details.
* **Automatically undo all patches** at the end of each test so your code returns to normal.

---

## 1. Code Example

**email_gateway.py**

```python file=./sandbox/email_gateway.py
```


**email_service.py**

```python file=./sandbox/email_service.py
```

Because the high-level `notify_user` function imports `send_email` and closes over that name, tests patch `email_service.send_email`, instead of `email_gateway.send_email`.

## 2. What should be the target?

**Rule of thumb:**

> Patch the **name visible inside the module under test**, not the original place where the object was first defined. In other words, patch “where it is used” instead of “where it is defined”.


---

## 3. A minimal custom PocketMocker

Now let’s build a **mini version** of `mocker` to show all the moving parts.

We won’t touch `unittest.mock.patch`; instead we’ll do the work manually with:

* `importlib.import_module`
* `getattr` / `setattr`
* `unittest.mock.MagicMock`

**pocket_mocker.py**

```python file=./sandbox/pocket_mocker.py
```

### The low-level helpers explained

* `importlib.import_module(module_path)`

  * Takes a string such as `"email_service.send_email"` and returns the actual module object.
  * Relies on Python’s import machinery and `sys.modules`.

* `getattr(module, attr_name)`

  * Reads an attribute on an object.
  * Equivalent to `module.attr_name`.

* `setattr(module, attr_name, replacement)`

  * Sets an attribute on an object.
  * Equivalent to `module.attr_name = replacement`.
  * This is the literal “patch” step: we overwrite the original function with our fake.

* `MagicMock(**kwargs)`

  * Creates a flexible fake object that:

    * Records calls (so you can assert later).
    * Can be configured with `return_value` or `side_effect`.
    * Supports attributes and methods dynamically.

Building `PocketMocker` shows that `pytest-mock` plus `unittest.mock` are simply a nicer layer over this same core behavior.

## Tests

**test_email_service.py**

```python file=./sandbox/test_email_service.py
```

**Test output**

```text file=./sandbox/test_email_service.output.txt
```

The first test exercises the real `pytest-mock` fixture, while the second walks through the DIY implementation so you can trace every step.
