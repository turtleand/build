---
title: "Python yield, One next() at a Time"
description: "Follow a three-number example to see how yield pauses a Python generator, how next() resumes it, and how iteration ends."
date: 2026-09-06T12:00:00Z
tags: ["python", "generators"]
featured: false
draft: false
image:
  src: /images/posts/python-logo.svg
  alt: "Python logo"
locale: en
translationKey: python-yield-one-next-at-a-time
slug: 2026-09-06-python-yield-one-next-at-a-time
---

`yield` lets a function hand a value back to its caller and pause. When the caller asks for another value, execution resumes where it paused.

A function defined with `def` that contains `yield` is a **generator function**. Calling it creates a generator object, which produces values as you request them.

## Start with the output

Run this example with Python 3:

```python
def generate_numbers():
    print("Preparing 10")
    yield 10
    print("Preparing 20")
    yield 20
    print("Preparing 30")
    yield 30


numbers = generate_numbers()
print("Generator created")
print("Received:", next(numbers))
print("Received:", next(numbers))
print("Received:", next(numbers))
```

It prints:

```text
Generator created
Preparing 10
Received: 10
Preparing 20
Received: 20
Preparing 30
Received: 30
```

Notice that `Generator created` comes first. None of the function body has run when `generate_numbers()` returns the generator.

## One request at a time

Follow the same `numbers` object through the program:

1. **Creation:** `numbers = generate_numbers()` creates the generator. No `Preparing` message appears yet.
2. **First `next(numbers)`:** execution starts at the top of the function. It prints `Preparing 10`, reaches `yield 10`, and pauses. The call to `next()` returns `10`, so the outer `print()` prints `Received: 10`.
3. **Second `next(numbers)`:** execution continues after `yield 10`. It prints `Preparing 20`, yields `20`, and pauses again.
4. **Third `next(numbers)`:** execution continues after `yield 20`. It prints `Preparing 30`, yields `30`, and pauses there.

Python evaluates `next(numbers)` before the surrounding `print()` can print its arguments. That is why each `Preparing` line appears before its corresponding `Received` line.

The generator remembers its position and local variables between requests. It resumes the same execution rather than starting the function again. These are the suspension rules described in Python's [yield reference](https://docs.python.org/3/reference/expressions.html#yield-expressions).

## How is yield different from return?

`return` ends the current function execution. In an ordinary function, `return 10` gives the caller `10` and finishes that call.

`yield 10` gives the caller of `next()` a value while preserving the generator's execution so it can continue later. A `return` inside a generator finishes it; it does not yield another item.

The pause does not start a background task. In this example, no more preparation happens until you ask for another value.

## What happens on the fourth next()?

After the third call, the generator is paused at `yield 30`. Append this line to the original example:

```python
next(numbers)
```

Execution resumes, reaches the end of the function, and raises `StopIteration`. That exception signals that there are no more items. Further calls on the exhausted generator also raise `StopIteration`; they do not restart it.

If you want a fallback value instead of that exception, use the optional second argument to [`next()`](https://docs.python.org/3/library/functions.html#next):

```python
print(next(numbers, "Done"))
```

Placed immediately after the original example, this prints `Done`.

## Let a for loop request the values

Usually, a `for` loop handles the requests and stops automatically when the generator is exhausted. Keep the function definition and replace the code below it with:

```python
for number in generate_numbers():
    print("Received:", number)
```

This creates a fresh generator and prints the same alternating `Preparing` and `Received` lines, without `Generator created`. Calling `generate_numbers()` again gives you a new sequence to consume.

Generators are useful when you want to process values as they become available without first collecting every result in a list. That can save memory for large sequences, although the generator and the consumer still use memory. The three numbers here make the timing visible: each request advances execution only as far as the next value.
