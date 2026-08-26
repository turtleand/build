---
title: "Revisiones de alineación con la intención: cómo usar IA para justificar cada línea de código"
description: "Un método práctico de revisión asistida por IA para vincular el código con la intención, detectar complejidad accidental y justificar lo que permanece."
date: 2026-08-25
tags: ["artificial intelligence", "code review", "software engineering"]
featured: true
draft: false
locale: es
translationKey: proof-of-necessity
slug: 2026-08-25-proof-of-necessity-es
---

Un programa puede producir la respuesta correcta y aun así contener trabajo que no lo ayuda a llegar a ella. Las pruebas pasan, la salida es correcta y los cálculos innecesarios sobreviven porque parecen inofensivos.

Esto puede pasar con mayor facilidad en código generado por IA. Un modelo produce una implementación plausible en segundos, pero ese código suele incluir variables, conversiones o ramas que el requisito nunca pidió.

Una **revisión de alineación con la intención** agrega una pregunta al chequeo habitual de corrección:

> ¿Cada instrucción ayuda a alcanzar o explicar el objetivo declarado?

Esto no requiere una prueba formal ni un ejercicio exhaustivo línea por línea. El resultado útil puede ser conciso.

## Corrección e intención

La corrección pregunta si el comportamiento observable coincide con la especificación. La alineación con la intención busca código que no aporta comportamiento ni claridad útil.

El objetivo no es escribir la menor cantidad posible de líneas. Una constante con nombre o una función auxiliar pueden ser valiosas aunque el programa pudiera ejecutarse sin ellas. El problema es la complejidad accidental: código que sugiere requisitos o decisiones de diseño que en realidad no existen.

La IA puede ayudar leyendo el requisito y la implementación en conjunto. Puede confirmar el comportamiento correcto, identificar instrucciones innecesarias y explicar si son dañinas o simplemente no aportan valor.

## Un pequeño ejemplo con Fibonacci

Consideremos esta especificación:

> La función debe imprimir en stdout los primeros cien elementos de la secuencia de Fibonacci.

La frase "primeros cien" no especifica si la secuencia comienza con `0, 1` o con `1, 1`. Para esta revisión, asumimos que la convención esperada comienza con `0, 1` e imprime un valor por línea.

```python
def print_fibonacci_100():
    a, b = 0, 1

    sequence_limit = 100
    display_width = len(str(sequence_limit))

    for index in range(sequence_limit):
        current_value = int(a)
        print(current_value)

        a, b = b, a + b

        checkpoint = (index + 1) % 10 == 0

    final_pair = (a, b)


print_fibonacci_100()
```

## Revisión

La implementación puede revisarse con un hallazgo conciso:

> La generación de Fibonacci imprime correctamente 100 valores comenzando con `0, 1`. `display_width`, `checkpoint`, `final_pair` e `int(a)` son innecesarios, pero no afectan la corrección.

El hallazgo separa el comportamiento correcto del ruido de implementación.

`display_width`, `checkpoint` y `final_pair` calculan valores que nunca se usan. `int(a)` participa en el flujo activo de salida, pero la conversión es redundante porque `a` permanece como entero durante todo el bucle. Una vez eliminado `checkpoint`, el índice del bucle también es innecesario.

## Una implementación más limpia como referencia

```python
def print_fibonacci_100():
    a, b = 0, 1

    for _ in range(100):
        print(a)
        a, b = b, a + b


print_fibonacci_100()
```

Las versiones original y simplificada producen el mismo stdout: 100 valores que comienzan con `0, 1, 1, 2, 3, 5`, cumplen la recurrencia de Fibonacci y terminan en `218922995834555169026`.

La versión más corta es útil porque todas las instrucciones restantes tienen un propósito evidente: inicializar la secuencia, repetir 100 veces, imprimir el valor actual y avanzar el par.

## Un estándar práctico de revisión

Una revisión de alineación con la intención puede mantenerse simple:

* Confirmar si la implementación cumple el requisito.
* Señalar instrucciones que no agregan comportamiento requerido ni claridad útil.
* Distinguir la redundancia inofensiva de los problemas de corrección.

A medida que el código generado por IA ocupa una proporción mayor del software, este tipo de análisis se vuelve más necesario. El comportamiento correcto todavía puede ocultar complejidad accidental. El resultado sigue siendo una revisión, no una garantía formal: requisitos ocultos o el comportamiento del sistema completo pueden justificar código que parece innecesario de forma aislada.

La corrección nos dice que el código funciona. La alineación con la intención pregunta si la implementación contiene solo ideas que podemos explicar y defender. En muchos casos, un párrafo preciso y una referencia más limpia son todo lo necesario.
