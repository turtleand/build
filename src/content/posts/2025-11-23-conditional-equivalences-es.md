---
title: "Mapeo de condicionales de programación a compuertas lógicas"
description: "Cómo los if/else se corresponden con expresiones booleanas, compuertas lógicas y por qué se pueden reordenar las cláusulas."
date: 2025-11-23
tags: ["logic", "fundamentals"]
featured: true
draft: false
image:
  src: /images/posts/logic-gates.svg
  alt: "Logo de compuerta lógica"
locale: es
translationKey: conditional-equivalences
slug: conditional-equivalences
---

Las estructuras condicionales son uno de los mecanismos de control de flujo más comunes en la programación. Bajo el capó, se mapean directamente al álgebra booleana y a la lógica digital. De hecho, una sentencia `if / else` es funcionalmente equivalente a un **multiplexor 2 a 1** (MUX): selecciona una de dos entradas posibles en función de una señal de control.

Una característica clave de esta equivalencia es que **la lógica es reversible**. En álgebra booleana, el orden de las ramas OR no altera el resultado; el significado se mantiene. En código, solo se ejecuta una rama dependiendo de la condición booleana. Por ello, tanto el código como su representación con compuertas se pueden reordenar sin cambiar el resultado.

## Condicional if / else

```python
class LogicaCruceVehicular:
    def __init__(
        self,
        semaforo_en_verde: bool,
        calle_transversal_vacia: bool,
        tiene_semaforos: bool
    ):
        self.semaforo_en_verde: bool = semaforo_en_verde
        self.calle_transversal_vacia: bool = calle_transversal_vacia
        self.tiene_semaforos: bool = tiene_semaforos

    def puede_cruzar(self) -> bool:
        if self.tiene_semaforos:
            return self.semaforo_en_verde
        else:
            return self.calle_transversal_vacia

    def puede_cruzar_reordenado(self) -> bool:
        # Lógicamente equivalente; las cláusulas solo cambian de orden
        if not self.tiene_semaforos:
            return self.calle_transversal_vacia
        else:
            return self.semaforo_en_verde
```

Este método decide si un auto puede cruzar una intersección.

*Si la intersección tiene semáforos*, la regla es simple:

> Cruza solo si la luz está en verde.

*Si la intersección no tiene semáforos*, aplica la regla de prioridad:

> Cruza únicamente si la calle transversal está vacía.

## Compuertas lógicas: Multiplexor

Un multiplexor usa compuertas lógicas para seleccionar una de dos entradas posibles. Aquí, cada regla se implementa con una compuerta AND y los resultados se combinan con una compuerta OR.

Como `tiene_semaforos` y `¬tiene_semaforos` no pueden valer 1 al mismo tiempo, solo un camino se activa a la vez.

Esto es exactamente el comportamiento de un **multiplexor (MUX) de 2×1**.

```text
tiene_semaforos ─────┐
                     ├── AND ───────────┐
luz_verde ───────────┘                  │
                                        ├── OR ──> puede_cruzar
tiene_semaforos ── NOT ──┐              │
                         ├── AND ───────┘
cruce_vacio ─────────────┘
```

### Reordenado

```text
tiene_semaforos ── NOT ──┐
                         ├── AND ───────────┐
cruce_vacio ─────────────┘                  │
                                            ├── OR ──> puede_cruzar
tiene_semaforos ─────┐                      │
                     ├── AND ───────────────┘
luz_verde ───────────┘
```

## Expresión booleana 

```isabelle
puede_cruzar =
    (tiene_semaforos ∧ luz_verde)
                    ∨
    (¬ tiene_semaforos ∧ cruce_vacio)
```

### Reordenado

```isabelle
puede_cruzar_reordenado =
    (¬ tiene_semaforos ∧ cruce_vacio)
                    ∨
    (tiene_semaforos ∧ luz_verde)
```

## Tabla de verdad

```
| tiene_semaforos | luz_verde | cruce_vacio | puede_cruzar |
| --------------- | --------- | ----------- | ------------ |
| 0               | 0         | 0           | 0            |
| 0               | 0         | 1           | 1            |
| 0               | 1         | 0           | 0            |
| 0               | 1         | 1           | 1            |
| 1               | 0         | 0           | 0            |
| 1               | 0         | 1           | 0            |
| 1               | 1         | 0           | 1            |
| 1               | 1         | 1           | 1            |
```
