---
title: "Testeando el patrón Decorator"
description: "Entiende los decoradores como composición de funciones y pruébalos de forma segura."
date: 2026-01-04
tags: ["design patterns"]
featured: false
draft: false
image:
  src: /images/posts/go.svg
  alt: ""
locale: es
translationKey: testing-decorator
slug: 2026-01-04-testing-decorator-es
---

# El patrón Decorator y cómo probarlo

## 1. ¿Qué es el patrón Decorator?

El **patrón decorator** es un patrón de diseño en el que envuelves un objeto o función existente con otro componente (el *decorador*) que:

1. **Delega** en el objeto o función original (interno).
2. **Agrega comportamiento antes y/o después** de la llamada interna.
3. Mantiene la **misma interfaz** que el componente interno, para que los consumidores puedan usarlo de forma transparente.

El decorador **no** reemplaza la lógica central; en su lugar, superpone preocupaciones extra, como:

* Logging
* Caché
* Chequeos de autorización
* Métricas / temporización
* Lógica de reintentos

En términos de código:

* Sea **A** la función o servicio interno/central (ya probado).
* Sea **D** un decorador que envuelve a A.

Conceptualmente:

```python
# Forma conceptual de un decorador

def D(x):
    input = k(x)                  # comportamiento extra antes de llamar A
    result_operation = A(x)       # delega en la función interna
    output = h(result_operation)  # comportamiento extra después de la llamada
    return output                 # por lo general preserva el retorno de A
```

Los puntos clave:

* D **llama a A** con los mismos argumentos (o una transformación controlada).
* D **preserva el contrato** de A (mismo significado de entrada/salida), mientras agrega comportamiento extra.

---

## 2. Ejemplo simple (visión de composición de funciones)

En lugar de un ejemplo específico del dominio, podemos pensar en el patrón decorator en términos de **composición de funciones**.

Sea:

* `A` la **función interna** que ya está totalmente probada y es confiable.
* `D` la **función decoradora** que envuelve a `A`.

En términos matemáticos:

* `A: X → Y` (toma un valor de tipo `X` y devuelve un valor de tipo `Y`).
* `D: X → Y` (mismos tipos de entrada y salida que `A`).

Un decorador típico agrega comportamiento *alrededor* de una llamada a `A`, pero mantiene el mismo contrato externo:

> D(x) = h(A(k(x)))

Donde `k` y `h` representan comportamiento extra opcional ejecutado antes y después de la llamada interna.

En Go, podemos representar esta idea con tipos de función y un ejemplo numérico concreto.

Definimos tres funciones:

* `k: string → int`  (parsear un entero desde su forma de cadena de dígitos, por ejemplo "2" → 2)
* `A: int → int`     (la función interna confiable, por ejemplo multiplicar por 2, 2 → 4)
* `h: int → string`  (mapear un entero a su palabra en inglés, por ejemplo 4 → "four")

Entonces la función decorada `D` tiene el comportamiento compuesto:

> D = h ∘ A ∘ k

Por ejemplo:

* `k("2") = 2`
* `A(2) = 4`
* `h(4) = "four"`

y por lo tanto:

> D("2") = h(A(k("2"))) = "four".

En Go, podemos expresarlo con tipos de función:

```go
package decorator

import "strconv"

// InnerFunc es el tipo de la función interna: int -> int.
type InnerFunc func(int) int

// DecoratedFunc es la función externa/decorada: string -> string.
// Toma una cadena numérica (p. ej. "2") y devuelve el valor duplicado
// como palabra en inglés (p. ej. "four").
type DecoratedFunc func(string) string

// k parsea una cadena numérica en un int.
func k(s string) (int, error) {
    return strconv.Atoi(s)
}

// h mapea un int a una representación en inglés corta.
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
    return "" // vacío si está fuera de rango, por simplicidad
}

// A es nuestra función interna confiable: solo multiplica por 2.
func A(x int) int {
    return x * 2
}

// Decorator envuelve un InnerFunc y devuelve un DecoratedFunc
// que implementa D = h ∘ inner ∘ k.
func Decorator(inner InnerFunc) DecoratedFunc {
    return func(s string) string {
        n, err := k(s)
        if err != nil {
            return "" // en un sistema real, manejarías el error explícitamente
        }

        doubled := inner(n) // A(n)
        return h(doubled)   // h(A(k(s)))
    }
}
```

Aquí:

* `inner` es nuestro `A` (ya totalmente probado).
* `Decorator(inner)` produce una nueva función `D` que:

  * Parsea la entrada a un `int` (`k`).
  * Delega en la función interna numérica `A`.
  * Mapea el `int` resultante a una palabra (`h`).

Aunque los **tipos** de A y D difieren (`int -> int` vs `string -> string`), la idea de composición es explícita: `D = h ∘ A ∘ k`.

---

## 3. Cómo pensar las pruebas de un decorador (con composición)

Asumimos:

* La función interna **A** ya está **totalmente probada y correcta**.
* El decorador **D** se implementa mediante composición como:

  * `k` (string → int),
  * la llamada interna `A` (int → int), y
  * `h` (int → string).

En notación de composición, D es:

> D = h ∘ A ∘ k

Si confiamos en las pruebas de A, entonces D solo puede estar mal en uno de estos tres lugares:

1. **Cómo llama a A** (¿pasa el entero correcto producido por `k`?).
2. **Cómo maneja o devuelve el resultado de A** (¿`h` mapea el entero a la cadena correcta?).
3. **Su propio comportamiento extra o manejo de errores** (por ejemplo, ¿qué pasa cuando `k` no puede parsear?).

Por eso, nuestras pruebas del decorador se enfocan en estas preocupaciones en lugar de volver a probar la lógica interna de A.

---

## 4. Estrategia concreta de pruebas en Go

Ahora escribimos pruebas para la función `Decorator`, asumiendo que `A` ya está debidamente probada en otro lugar.

### 4.1. Probar que el decorador llama a la función interna con el entero correcto

Reemplazamos `inner` con un doble de prueba que registra el argumento que recibe. Esto nos permite verificar que el valor parseado por `k` es el que se pasa a la función interna.

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
        return 4 // valor fijo arbitrario
    }

    d := decorator.Decorator(inner)

    result := d("2") // k("2") debería ser 2

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

Esta prueba verifica la **delegación** y la composición:

* "2" se parsea a 2 con `k`.
* La función interna recibe 2.
* El resultado final pasa por `h` (aquí esperamos "four").

### 4.2. Probar que el decorador mapea el resultado interno correctamente via `h`

Aquí nos enfocamos en el **mapeo de salida** `h`. Controlamos la función interna para saber exactamente qué entero devuelve, y verificamos que el decorador lo convierta en la palabra correcta.

```go
func TestDecorator_MapsInnerResultWithH(t *testing.T) {
    inner := func(x int) int {
        return 8 // independientemente de la entrada
    }

    d := decorator.Decorator(inner)

    result := d("1") // k("1") = 1, inner(1) = 8, h(8) = "eight"

    if result != "eight" {
        t.Fatalf("expected 'eight', got %q", result)
    }
}
```

Esta prueba muestra que cualquier entero que salga de la función interna se pasa correctamente por `h`.

### 4.3. Probar el comportamiento del decorador con entrada inválida (manejo de errores alrededor de `k`)

Por último, podemos probar cómo se comporta el decorador cuando `k` no puede parsear la entrada (esto es parte de la responsabilidad extra de D, más allá de la lógica de A):

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

En un sistema real podrías elegir una estrategia diferente de manejo de errores (devolver un error, provocar un panic, etc.), pero la clave es que este comportamiento es **propiedad del decorador**, no de A, y se prueba por separado.

---

## 5. Resumen: cómo probar un decorador cuando el interno es confiable

Cuando la función interna **A** ya está bien probada, y el decorador **D** solo agrega comportamiento extra alrededor de ella:

1. **Confía en las pruebas de A.** No las dupliques en las pruebas del decorador.
2. **Prueba la delegación:** D llama a A con los argumentos correctos y la frecuencia adecuada.
3. **Prueba la preservación del resultado (o modificación controlada):** D devuelve lo que devuelve A, o lo cambia de una forma bien definida y probada.
4. **Prueba la preocupación extra:** logging, caché, autorización, métricas, reintentos, etc.

En otras palabras, las pruebas del decorador deben enfocarse en:

* Cómo el decorador usa la función interna.
* El nuevo comportamiento que introduce el decorador.
