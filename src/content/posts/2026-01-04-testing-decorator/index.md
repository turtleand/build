---
title: "Testing the Decorator Pattern"
description: "Understand decorators as function composition and test them safely."
date: 2026-01-04
tags: ["design patterns"]
featured: false
draft: false
image:
  src: /images/posts/go.svg
  alt: ""
locale: en
translationKey: testing-decorator
slug: 2026-01-04-testing-decorator
---

# The Decorator Pattern and How to Test It

## 1. What is the Decorator Pattern?

The **decorator pattern** is a design pattern where you wrap an existing object or function with another component (the *decorator*) that:

1. **Delegates** to the original (inner) object or function.
2. **Adds behavior before and/or after** the inner call.
3. Keeps the **same interface** as the inner component, so callers can use it transparently.

The decorator does **not** replace the core logic; instead, it layers extra concerns on top, such as:

* Logging
* Caching
* Authorization checks
* Metrics / timing
* Retry logic

In code terms:

* Let **A** be the inner/core function or service (already tested).
* Let **D** be a decorator that wraps A.

Conceptually:

```python
# Conceptual shape of a decorator

def D(x):
    input = k(x)                  # extra behavior before calling A
    result_operation = A(x)       # delegate to the inner function
    output = h(result_operation)  # extra behavior after calling A
    return output                 # usually preserves A's return
```

The key points:

* D **calls A** with the same arguments (or a controlled transformation).
* D **preserves the contract** of A (same meaning of input/output), while layering extra behavior.

---

## 2. Simple Example (Function Composition View)

Instead of a domain-specific example, we can think of the decorator pattern purely in terms of **function composition**.

Let:

* `A` be the **inner function** that is already fully tested and trusted.
* `D` be the **decorator function** that wraps `A`.

In mathematical terms:

* `A: X → Y` (takes a value of type `X`, returns a value of type `Y`).
* `D: X → Y` (same input and output types as `A`).

A typical decorator adds some behavior *around* a call to `A`, but keeps the same external contract:

> D(x) = h(A(k(x)))

Where `k` and `h` represent optional extra behavior executed before and after the inner call.

In Go, we can represent this idea with function types and a concrete numeric example.

We define three functions:

* `k: string → int`  (parse an integer from its digit-string form, e.g. "2" → 2)
* `A: int → int`     (the trusted inner function, e.g. multiply by 2, 2 → 4)
* `h: int → string`  (map an integer to its English word, e.g. 4 → "four")

Then the decorated function `D` has the composed behavior:

> D = h ∘ A ∘ k

So for example:

* `k("2") = 2`
* `A(2) = 4`
* `h(4) = "four"`

and therefore:

> D("2") = h(A(k("2"))) = "four".

In Go, we can express this with function types:

```go
package decorator

import "strconv"

// InnerFunc is the type of the inner function: int -> int.
type InnerFunc func(int) int

// DecoratedFunc is the outer/decorated function: string -> string.
// It takes a numeric string (e.g. "2") and returns the doubled value
// as an English word (e.g. "four").
type DecoratedFunc func(string) string

// k parses a numeric string into an int.
func k(s string) (int, error) {
    return strconv.Atoi(s)
}

// h maps an int to a small English word representation.
func h(n int) string {
    words := map[int]string{
        0:  "zero",
        1:  "one",
        2:  "two",
        3:  "three",
        4:  "four",
        5:  "five",
        6:  "six",
        7:  "seven",
        8:  "eight",
        9:  "nine",
        10: "ten",
    }
    if w, ok := words[n]; ok {
        return w
    }
    return "" // empty if out of range, for simplicity
}

// A is our trusted inner function: it just multiplies by 2.
func A(x int) int {
    return x * 2
}

// Decorator wraps an InnerFunc and returns a DecoratedFunc
// that implements D = h ∘ inner ∘ k.
func Decorator(inner InnerFunc) DecoratedFunc {
    return func(s string) string {
        n, err := k(s)
        if err != nil {
            return "" // in a real system, you'd handle the error explicitly
        }

        doubled := inner(n) // A(n)
        return h(doubled)   // h(A(k(s)))
    }
}
```

Here:

* `inner` is our `A` (already fully tested).
* `Decorator(inner)` produces a new function `D` that:

  * Parses the input string to an `int` (`k`).
  * Delegates to the inner numeric function `A`.
  * Maps the resulting `int` back to a word (`h`).

Even though the **types** of A and D differ (`int -> int` vs `string -> string`), the idea of composition is explicit: `D = h ∘ A ∘ k`.

---

## 3. How to Think About Testing a Decorator (with Composition)

We assume:

* The inner function **A** is **already fully tested and correct**.
* The decorator **D** is implemented via composition as:

  * `k` (string → int),
  * the inner call `A` (int → int), and
  * `h` (int → string).

In composition notation, D is:

> D = h ∘ A ∘ k

If we trust A’s tests, then D can only be incorrect in one of three places:

1. **How it calls A** (does it pass the right integer produced by `k`?).
2. **How it handles or returns A’s result** (does `h` map the integer to the correct string?).
3. **Its own extra behavior or error handling** (e.g. what happens when `k` fails to parse?).

So our decorator tests focus on these concerns instead of re-testing A’s internal logic.

---

## 4. Concrete Testing Strategy in Go

We now write tests for the `Decorator` function, assuming `A` itself is properly tested elsewhere.

### 4.1. Test that the decorator calls the inner function with the correct integer

We replace `inner` with a small test double that records the argument it receives. This lets us verify that the parsed value from `k` is what gets passed into the inner function.

```go
package decorator_test

import (
    "testing"

    "example.com/yourmodule/decorator"
)

func TestDecorator_CallsInnerWithParsedInt(t *testing.T) {
    called := false
    var received int

    inner := func(x int) int {
        called = true
        received = x
        return 4 // arbitrary fixed value
    }

    d := decorator.Decorator(inner)

    result := d("2") // k("2") should be 2

    if !called {
        t.Fatalf("expected inner to be called")
    }
    if received != 2 {
        t.Fatalf("expected inner to be called with 2, got %d", received)
    }
    if result != "four" {
        t.Fatalf("expected result 'four', got %q", result)
    }
}
```

This test checks the **delegation** and composition:

* `"2"` is parsed to `2` by `k`.
* The inner function receives `2`.
* The final result goes through `h` (here, we expect `"four"`).

### 4.2. Test that the decorator maps the inner result correctly via `h`

Here we focus on the **output mapping** `h`. We control the inner function so that we know exactly which integer it returns, and we assert that the decorator converts it to the correct word.

```go
func TestDecorator_MapsInnerResultWithH(t *testing.T) {
    inner := func(x int) int {
        return 8 // regardless of input
    }

    d := decorator.Decorator(inner)

    result := d("1") // k("1") = 1, inner(1) = 8, h(8) = "eight"

    if result != "eight" {
        t.Fatalf("expected 'eight', got %q", result)
    }
}
```

This test shows that whatever integer comes out of the inner function is passed through `h` correctly.

### 4.3. Test the decorator's behavior on invalid input (error handling around `k`)

Finally, we can test how the decorator behaves when `k` fails to parse the input (this is part of D’s extra responsibility, beyond A’s logic):

```go
func TestDecorator_InvalidInput(t *testing.T) {
    inner := func(x int) int {
        return x * 2
    }

    d := decorator.Decorator(inner)

    result := d("not-a-number")

    if result != "" {
        t.Fatalf("expected empty string for invalid input, got %q", result)
    }
}
```

In a real system you might choose a different error-handling strategy (returning an error, panicking, etc.), but the key is that this behavior is **owned by the decorator**, not by A, and is tested separately.

---

## 5. Summary: Testing a Decorator When the Inner is Trusted

When the inner function **A** is already well tested, and the decorator **D** only adds extra behavior around it:

1. **Trust A's tests.** Do not duplicate them in decorator tests.
2. **Test delegation:** D calls A with the correct arguments and frequency.
3. **Test result preservation (or controlled modification):** D returns what A returns, or changes it in a well-defined, tested way.
4. **Test the extra concern:** logging, caching, authorization, metrics, retries, etc.

In other words, the decorator's tests should focus on:

* How the decorator uses the inner function.
* The new behavior the decorator introduces.

Everything else (core business logic) remains the responsibility of A’s own test suite.
