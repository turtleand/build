---
title: "yield en Python, un next() a la vez"
description: "Seguí un ejemplo de tres números para entender cómo yield pausa un generador de Python, cómo next() lo reanuda y cómo termina la iteración."
date: 2026-09-06T12:00:00Z
tags: ["python", "generators"]
featured: false
draft: false
image:
  src: /images/posts/python-logo.svg
  alt: "Logo de Python"
locale: es
translationKey: python-yield-one-next-at-a-time
slug: 2026-09-06-python-yield-one-next-at-a-time-es
---

`yield` permite que una función entregue un valor a quien la llamó y se pause. Cuando se solicita otro valor, la ejecución continúa desde donde quedó.

Una función definida con `def` que contiene `yield` es una **función generadora**. Llamarla crea un objeto generador, que produce valores a medida que se los pedís.

## Empecemos por la salida

Ejecutá este ejemplo con Python 3:

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

Imprime:

```text
Generator created
Preparing 10
Received: 10
Preparing 20
Received: 20
Preparing 30
Received: 30
```

Observá que `Generator created` aparece primero. Cuando `generate_numbers()` devuelve el generador, todavía no se ejecutó ninguna instrucción del cuerpo de la función.

## Un pedido a la vez

Seguí el mismo objeto `numbers` a lo largo del programa:

1. **Creación:** `numbers = generate_numbers()` crea el generador. Todavía no aparece ningún mensaje `Preparing`.
2. **Primer `next(numbers)`:** la ejecución empieza al principio de la función. Imprime `Preparing 10`, llega a `yield 10` y se pausa. La llamada a `next()` devuelve `10`, así que el `print()` externo imprime `Received: 10`.
3. **Segundo `next(numbers)`:** la ejecución continúa después de `yield 10`. Imprime `Preparing 20`, entrega `20` y vuelve a pausarse.
4. **Tercer `next(numbers)`:** la ejecución continúa después de `yield 20`. Imprime `Preparing 30`, entrega `30` y se pausa ahí.

Python evalúa `next(numbers)` antes de que el `print()` que lo contiene pueda imprimir sus argumentos. Por eso cada línea `Preparing` aparece antes de su correspondiente línea `Received`.

El generador recuerda su posición y sus variables locales entre pedidos. Retoma la misma ejecución en lugar de empezar la función de nuevo. Estas son las reglas de suspensión descritas en la [referencia de yield de Python](https://docs.python.org/3/reference/expressions.html#yield-expressions).

## ¿En qué se diferencia yield de return?

`return` termina la ejecución actual de la función. En una función común, `return 10` entrega `10` a quien la llamó y finaliza esa llamada.

`yield 10` entrega un valor a quien llamó a `next()` y conserva la ejecución del generador para poder continuar más adelante. Un `return` dentro de un generador lo termina; no entrega otro elemento mediante `yield`.

La pausa no inicia una tarea en segundo plano. En este ejemplo, no se prepara nada más hasta que pedís otro valor.

## ¿Qué pasa con el cuarto next()?

Después de la tercera llamada, el generador está pausado en `yield 30`. Agregá esta línea al ejemplo original:

```python
next(numbers)
```

La ejecución se reanuda, llega al final de la función y lanza `StopIteration`. Esa excepción indica que no quedan elementos. Las siguientes llamadas sobre el generador agotado también lanzan `StopIteration`; no lo reinician.

Si querés recibir un valor alternativo en lugar de esa excepción, usá el segundo argumento opcional de [`next()`](https://docs.python.org/3/library/functions.html#next):

```python
print(next(numbers, "Done"))
```

Ubicada inmediatamente después del ejemplo original, esta línea imprime `Done`.

## Dejá que un for pida los valores

Normalmente, un bucle `for` se encarga de los pedidos y se detiene automáticamente cuando se agota el generador. Conservá la definición de la función y reemplazá el código que viene después por:

```python
for number in generate_numbers():
    print("Received:", number)
```

Esto crea un generador nuevo e imprime las mismas líneas alternadas de `Preparing` y `Received`, sin `Generator created`. Volver a llamar a `generate_numbers()` te da una secuencia nueva para consumir.

Los generadores sirven cuando querés procesar valores a medida que están disponibles sin reunir primero todos los resultados en una lista. Eso puede ahorrar memoria con secuencias grandes, aunque el generador y quien lo consume siguen usando memoria. Los tres números de este ejemplo hacen visible el momento de ejecución: cada pedido avanza solo hasta el próximo valor.
