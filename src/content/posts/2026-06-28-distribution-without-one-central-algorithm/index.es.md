---
title: "Distribución sin un algoritmo central"
description: "Una explicación técnica sobre cómo el contenido en Mastodon viaja por seguidores, boosts, hashtags, federación, visibilidad y moderación en vez de depender de un ranking global."
date: 2026-06-28
tags: ["protocolos", "web", "distribución"]
featured: false
draft: false
locale: es
translationKey: distribution-without-one-central-algorithm
slug: 2026-06-28-distribution-without-one-central-algorithm-es
---

Mastodon no es un feed gigante controlado por un sistema central de ranking.

Un primer modelo más útil es el de barrios conectados. Una publicación empieza en el servidor de origen de la persona que la escribe. Desde ahí puede viajar por seguidores, boosts, hashtags, búsqueda, cachés de servidores, ajustes de visibilidad y reglas de moderación.

Eso no significa que no haya algoritmos en ningún lado. Los servidores y clientes todavía ordenan, filtran, cachean, buscan y muestran información. El punto es más específico: la distribución no pertenece a un único feed global de plataforma.

## El servidor de origen es el primer punto de publicación

Cada cuenta pertenece a un servidor de origen.

Cuando Alice publica desde `server-a.example`, ese servidor guarda la publicación y la muestra según su visibilidad. Las personas del mismo servidor pueden verla mediante timelines locales o búsqueda. Las personas en otros servidores normalmente la conocen cuando los caminos de federación conectan los servidores.

En simple:

```text
Alice publica -> su servidor la guarda -> otros servidores la conocen por relaciones y federación
```

La publicación vive en una dirección, pero el alcance depende de qué servidores la conocen y tienen permiso para mostrarla.

## Los seguidores crean caminos de distribución

Seguir a alguien es uno de los carriles principales.

Si Ben en `server-b.example` sigue a Alice en `server-a.example`, el servidor de Ben tiene una razón para recibir las publicaciones públicas de Alice. Esa relación crea un camino entre los dos barrios.

Por eso la distribución federada no es global por defecto. Un servidor no conoce automáticamente cada publicación pública de cada otro servidor. Conoce las publicaciones que le llegan por seguidores, interacciones, búsquedas, relays, cachés y otros caminos de federación.

## Los boosts redistribuyen

Un boost no es solo una señal de aprecio. También es una acción de redistribución.

En el lenguaje de ActivityPub, una acción de compartir puede representarse con una actividad `Announce`. En el lenguaje de usuario de Mastodon, el resultado es más simple: alguien boostea una publicación, y esa publicación puede aparecer ante una audiencia más amplia por las relaciones de la cuenta que la boosteó.

```text
Alice publica -> Ben boostea -> la audiencia de Ben puede ver la publicación de Alice
```

Los boosts importan porque crean nuevos caminos por la red sin necesitar que un recomendador central decida qué debe ver todo el mundo.

## Los hashtags y la búsqueda son carriles de descubrimiento

Los hashtags les dan a las personas y al software una etiqueta para buscar o seguir.

Una publicación pública con hashtag puede volverse más fácil de descubrir para quienes buscan esa etiqueta. La documentación de Mastodon también describe los hashtags seguidos como una forma de que publicaciones aparezcan en el feed de inicio aunque no sigas a la autora.

Pero los hashtags no son una transmisión global mágica. El descubrimiento todavía depende del conocimiento del servidor, la indexación, la visibilidad, la moderación y las funciones del cliente.

## La visibilidad cambia cuánto puede viajar una publicación

Los ajustes de visibilidad moldean la distribución.

Una publicación pública puede aparecer en timelines públicos y puede ser boosteada. Una publicación no listada todavía puede alcanzarse, pero no aparece en las mismas superficies públicas. Las publicaciones solo para seguidores se limitan a seguidores y no pueden ser boosteadas por otras personas. Las publicaciones solo por mención son todavía más estrechas.

Esos ajustes no son cosméticos. Cambian los caminos que una publicación puede usar.

## La moderación y las reglas de federación moldean el alcance

La federación no es permiso automático para llegar a todo el mundo.

Los servidores pueden aplicar reglas de moderación, bloquear otros servidores, limitar contenido o rechazar cierto tráfico. Las personas pueden bloquear o silenciar cuentas. Las comunidades pueden tener normas distintas.

Esto es parte del intercambio. Mastodon da más agencia local que una plataforma central única, pero eso también hace que el alcance sea menos predecible.

## El modelo mental útil

Pensá en una publicación de Mastodon como un aviso que empieza en un barrio.

Puede viajar por:

1. Seguidores.
2. Boosts.
3. Hashtags.
4. Búsqueda y URLs directas.
5. Federación servidor a servidor.
6. Ajustes de visibilidad.
7. Reglas de moderación.

La red es lo bastante abierta para que las publicaciones crucen límites entre servidores, pero no lo bastante plana como para que cada publicación sea visible globalmente por defecto.

## En resumen

La distribución en Mastodon tiene forma de relaciones y servidores.

Eso la diferencia de un feed central de plataforma. Puede dar más agencia a personas y comunidades, pero también exige entender los carriles: seguidores, boosts, hashtags, visibilidad, moderación y federación.

La lección durable no es solo sobre Mastodon. Todo sistema de distribución tiene una forma. Si querés construir conocimiento público durable, entendé esa forma antes de asumir que el algoritmo va a cargar con el trabajo.

## Fuentes

- Documentación de Mastodon sobre red, visibilidad de publicaciones, hashtags, boosts y descubrimiento.
- Documentación de ActivityPub en Mastodon sobre `Create`, `Announce`, `Follow` y federación de publicaciones.
- Recomendación ActivityPub del W3C sobre redes sociales descentralizadas, inboxes, outboxes, actores, comportamiento cliente-servidor y federación servidor-servidor.
