---
title: "RSS como protocolo simple de distribución"
description: "Un modelo técnico breve para RSS: una URL estable del feed, muchas entradas, enlaces a artículos, fechas y GUIDs estables para que los lectores detecten trabajo nuevo."
date: 2026-06-30
tags: ["protocolos", "web", "distribución"]
featured: false
draft: false
locale: es
translationKey: rss-simple-distribution-protocol
slug: 2026-06-30-rss-simple-distribution-protocol-es
---

RSS parece más complicado de lo que es porque se ve como XML antiguo.

El modelo útil es más simple:

> RSS es una señal pública de actualización para software.

Una página web existe sobre todo para humanos. Un feed existe sobre todo para lectores, agregadores, bots y otro software que quiere saber qué cambió.

## El feed es el buzón

Una URL de feed es la dirección estable del feed completo, muchas veces algo como:

```text
https://example.com/rss.xml
```

Esa URL no es un artículo. Es el buzón.

Un lector de feeds revisa ese buzón periódicamente. Cuando el XML contiene un item que el lector no vio antes, el lector puede mostrar ese item a sus suscriptores.

Ese es el protocolo de distribución en lenguaje simple:

```text
el publicador actualiza el feed -> el lector revisa el feed -> el item nuevo aparece para suscriptores
```

No hace falta que un feed social central decida que el artículo es importante. El publicador expone una señal estable. El lector la observa.

## Un item es una entrada dentro del feed

Dentro del feed, cada artículo está representado como un item.

Un item RSS simplificado podría verse así:

```xml
<item>
  <title>RSS como protocolo simple de distribución</title>
  <link>https://example.com/posts/rss-simple-distribution-protocol/</link>
  <guid>https://example.com/posts/rss-simple-distribution-protocol/</guid>
  <pubDate>Tue, 30 Jun 2026 00:00:00 GMT</pubDate>
  <description>Un modelo breve para la distribución por RSS.</description>
</item>
```

Los nombres importan:

- `title` le dice al lector cómo se llama el item.
- `link` apunta al artículo real.
- `guid` le da al lector una identidad estable para el item.
- `pubDate` le dice al lector cuándo fue publicado.
- `description` da un resumen corto.

El item no es el feed. El item es una entrada dentro del feed.

## El GUID es cómo recuerda el lector

El detalle mecánico más importante es la identidad.

Un lector puede revisar el mismo feed muchas veces. Necesita una forma de decidir si una entrada es nueva o si ya fue vista. Para eso existe el GUID.

En muchos feeds, el GUID es la URL del artículo. En otros feeds, puede ser un identificador estable separado. La elección exacta importa menos que la regla:

> No cambies el identificador sin necesidad.

Si un publicador cambia el GUID de un item después de publicarlo, un lector puede tratar el mismo artículo como si fuera nuevo. Si un publicador reutiliza un GUID para artículos distintos, un lector puede perder actualizaciones reales.

La buena distribución depende de una identidad estable.

## RSS normalmente funciona por revisión periódica

RSS normalmente no es push.

La mayoría de los lectores hacen polling. Revisan el feed en un intervalo, comparan los items con lo que ya guardaron y muestran lo nuevo.

Eso hace que RSS sea aburrido en el buen sentido. No exige una cuenta, un algoritmo de timeline, una API propietaria ni una relación con una plataforma. Exige una URL de feed alcanzable y entradas bien formadas.

El intercambio es demora y variabilidad. Un lector puede revisar cada pocos minutos. Otro puede revisar cada varias horas. RSS da alcance durable, no alcance instantáneo garantizado.

## La checklist práctica

Para que un feed sea útil, estas piezas deben estar claras:

1. Una URL estable de feed, como `/rss.xml`.
2. Un item por artículo o actualización.
3. Un enlace de item que apunte al artículo legible por humanos.
4. Un GUID o ID estable para cada item.
5. Una fecha de publicación.
6. Un título y una descripción corta que tengan sentido fuera del sitio web.

Ese último punto importa. Los items RSS viajan fuera de la página original. Un título débil o un resumen vago se convierten en metadata de distribución débil.

## En resumen

RSS no es solo una función vieja de blogs. Es un pequeño protocolo de distribución.

La URL del feed dice dónde debe mirar el software. Los items dicen qué cambió. Los enlaces llevan a los lectores al artículo completo. Los GUIDs ayudan a los lectores a recordar qué ya vieron.

Si publicás conocimiento público durable, RSS es una de las formas más limpias de hacer que ese conocimiento sea suscribible fuera de cualquier feed de plataforma.

## Fuentes

- RSS 2.0 Specification, RSS Advisory Board.
- RSS Best Practices Profile, RSS Advisory Board.
