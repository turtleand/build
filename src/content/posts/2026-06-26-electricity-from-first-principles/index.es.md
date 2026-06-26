---
title: "Electricidad desde primeros principios"
description: "Una nota de ingeniería para principiantes que explica la electricidad con empuje, flujo, trabajo y loop antes de introducir voltaje, corriente, resistencia, potencia, ley de Ohm y transferencia de energía."
date: 2026-06-26
tags: ["fundamentos", "lógica", "ingeniería de software"]
featured: false
draft: false
image:
  src: /images/posts/logic-gates.svg
  alt: "Ícono de diagrama de compuertas lógicas"
locale: es
translationKey: electricity-from-first-principles
slug: 2026-06-26-electricity-from-first-principles-es
---

La electricidad es más fácil de entender cuando no empezás con ecuaciones.

Empezá con cuatro anclas:

1. **Empuje**: la fuente le da a la carga eléctrica una razón para moverse.
2. **Flujo**: la carga se mueve por un camino.
3. **Trabajo**: una carga útil convierte energía eléctrica en luz, calor, movimiento, computación o señal.
4. **Loop**: el camino tiene que estar completo para que haya corriente sostenida.

Un circuito simple no es solo una batería y un cable. Es una fuente, un camino, una carga útil y un camino de regreso. Si rompés el loop, el flujo estable se detiene.

## La analogía del agua es una ayuda inicial

Una primera metáfora común es agua en tuberías.

El voltaje se parece a la presión. La corriente se parece al caudal. La resistencia se parece a una tubería angosta o a fricción en el camino.

La metáfora ayuda, pero no es exacta. Los circuitos eléctricos no son literalmente sistemas de agua. La idea es construir la primera intuición: el empuje hace posible el flujo, la resistencia limita el flujo y la carga útil recibe energía útil.

Cuando esa forma queda clara, los términos reales se vuelven menos misteriosos.

## El voltaje es empuje

El voltaje es diferencia de potencial eléctrico. Una forma práctica de decirlo es:

> El voltaje es energía por unidad de carga.

Un voltio significa un julio de energía por cada culombio de carga.

Más voltaje no significa, por sí solo, que la electricidad se mueva más rápido. Significa que cada unidad de carga tiene más energía disponible para transferir mientras se mueve por el circuito.

## La corriente es flujo

La corriente es la tasa de flujo de carga.

Un amperio significa un culombio de carga pasando por un punto cada segundo.

La corriente necesita un camino cerrado. Si el camino está abierto, la fuente todavía puede tener voltaje, pero la corriente sostenida no puede recorrer el circuito.

## La resistencia limita el flujo

La resistencia es oposición a la corriente.

Para un voltaje dado, más resistencia significa menos corriente. Menos resistencia significa más corriente.

La resistencia no hace desaparecer la energía. Define dónde se transfiere la energía. En muchos componentes, esa transferencia aparece como calor. En una carga útil, puede convertirse en luz, movimiento, sonido, computación o señal.

## La potencia es trabajo por segundo

La potencia es la tasa de transferencia de energía.

Un dispositivo con más potencia no solo contiene más energía. Usa o entrega energía más rápido.

Por eso una lámpara brillante, un calefactor caliente y un motor girando pueden describirse con potencia. Son distintas formas de convertir energía eléctrica en trabajo a lo largo del tiempo.

## Las dos ecuaciones que conviene guardar

Después del modelo mental, dos ecuaciones explican mucho.

Ley de Ohm:

```text
V = I × R
```

El voltaje es igual a corriente por resistencia. Si la resistencia se mantiene igual, más voltaje crea más corriente. Si el voltaje se mantiene igual, más resistencia reduce la corriente.

Potencia eléctrica:

```text
P = V × I
```

La potencia es igual a voltaje por corriente. La transferencia de energía depende del empuje y del flujo.

Un ejemplo chico:

```text
5 V × 2 A = 10 W
```

Eso significa que el circuito transfiere 10 julios de energía cada segundo.

## Confusiones comunes al empezar

**El voltaje no es corriente.** El voltaje es energía por carga. La corriente es carga por segundo.

**Puede haber voltaje sin corriente sostenida.** Una batería puede tener voltaje aunque no esté conectada a un circuito completo.

**La corriente necesita un loop.** Un camino roto detiene el flujo sostenido.

**La potencia no es energía almacenada.** La potencia es la tasa de transferencia de energía. La energía es la cantidad acumulada a lo largo del tiempo.

**La resistencia no destruye energía.** Limita la corriente y afecta dónde se transfiere la energía.

## En resumen

Pensá en este orden:

1. La fuente crea empuje.
2. El loop cerrado permite flujo.
3. La resistencia limita el flujo.
4. La carga útil recibe energía y hace trabajo útil.
5. La potencia dice qué tan rápido ocurre ese trabajo.

Las ecuaciones importan, pero la estructura importa primero. La electricidad es empuje, flujo, trabajo y loop.
