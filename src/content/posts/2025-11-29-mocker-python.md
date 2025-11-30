---

title: "How does mocker in Python work?"
description: "Learn what mocker really does, how to patch the right targets, and build a tiny clone to understand the mechanics."
date: 2025-11-30
tags: ["python", "mocks"]
featured: true
draft: false
locale: en
translationKey: python-mocker
-----------------------------
<!-- snippet-hash: a52723d3f46e94af33bc205dcc90e2a2de446e90 -->

Short answer:
`mocker` is a **pytest fixture** provided by the [`pytest-mock`](https://github.com/pytest-dev/pytest-mock) plugin.

It gives you a small object (usually called `mocker`) that wraps Python’s standard library [`unittest.mock`](https://docs.python.org/3/library/unittest.mock.html) and lets you:

* **Replace (“patch”) real objects** (functions, methods, attributes) with controllable fakes (`MagicMock`).
* **Track calls**: how many times a fake was called, with what arguments, etc.
* **Automatically undo all patches** at the end of the test so your code goes back to normal.

> “For this test, temporarily swap this function with a fake one.”

---

## 1. Code Example

**email_gateway.py**

```python file=./2025-11-29-mocker-python-misc/email_gateway.py
```


**email_service.py**

```python file=./2025-11-29-mocker-python-misc/email_service.py
```

The high-level `notify_user` function imports `send_email` and closes over that name. Tests therefore patch `email_service.send_email`, not `email_gateway.send_email`.

## 2. Which should be the target?

**Rule of thumb:**

> Patch the **name visible inside the module under test**, not the original place where the object was first defined. In other words, patch “where it is used” instead of “where it is defined".


---

## 3. A minimal custom PocketMocker

Now let’s build our own **mini version** of `mocker` so you can see all the moving parts.

We won’t use `unittest.mock.patch` at all.
We’ll do the work manually with:

* `importlib.import_module`
* `getattr` / `setattr`
* `unittest.mock.MagicMock`

**pocket_mocker.py**

```python file=./2025-11-29-mocker-python-misc/pocket_mocker.py
```

### The low-level helpers explained

* `importlib.import_module(module_path)`

  * Takes a string like `"email_service.send_email"` and returns the actual module object.
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

By building `PocketMocker`, you can see that `pytest-mock` + `unittest.mock` are “just” a nicer layer over this same core behavior.

## Tests

**test_email_service.py**

```python file=./2025-11-29-mocker-python-misc/test_email_service.py
```

**Test output**

```text file=./2025-11-29-mocker-python-misc/test_email_service.output.txt
```

The first test shows the real `pytest-mock` fixture in action, while the second runs through the DIY implementation so you can trace every step.

## Additional Resources

### [Why your mock doesn’t work - Ned Batchelder](https://nedbatchelder.com/blog/201908/why_your_mock_doesnt_work.html)
