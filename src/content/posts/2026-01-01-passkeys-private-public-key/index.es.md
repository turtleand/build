---
title: "Cómo los passkeys dependen de la firma con clave privada y pública"
description: "Una explicación para ingenieros de cómo la firma criptográfica permite que los passkeys autentiquen usuarios usando la posesión de la clave en lugar de contraseñas."
date: 2026-01-01
tags: ["cryptography", "security"]
featured: true
draft: false
image:
  src: /images/posts/security.svg
  alt: "Escudo representando seguridad"
locale: es
translationKey: passkeys-private-public-key
slug: 2026-01-01-passkeys-private-public-key-es
---

Este artículo explica de forma simple cómo la criptografía de clave pública y privada se usa para **firmar mensajes** y luego **verificar** esas firmas. El objetivo es construir la intuición correcta para ingenieros y lectores técnicos que quieren entender *qué ocurre realmente* cuando sistemas como los passkeys dependen de la firma criptográfica.

---

## El problema central

Cuando un sistema recibe un mensaje, a menudo necesita responder una pregunta muy específica:

> ¿Este mensaje exacto proviene de alguien que posee una clave privada determinada?

Esto *no* trata sobre secreto. El mensaje puede ser público. Lo importante es la **autenticidad** y la **integridad**.

---

## El par de claves

La criptografía de clave pública siempre comienza con un **par de claves**:

* **Clave privada**

  * Secreta
  * Se almacena de forma segura
  * Nunca se comparte

* **Clave pública**

  * Se comparte libremente
  * Se almacena en servidores u otras partes

Las claves están relacionadas matemáticamente, pero en un solo sentido: conocer la clave pública no permite derivar la clave privada.

---

## Qué significa "firmar un mensaje"

Firmar **no** significa encriptar el mensaje original.

En cambio, firmar significa:

1. Crear una **huella digital** del mensaje
2. Usar la clave privada para crear una **prueba** ligada a esa huella

El resultado se llama una **firma**.

La firma demuestra dos cosas a la vez:

* El mensaje no fue alterado
* El firmante posee la clave privada

---

## Paso 1 — Hashear el mensaje

Los mensajes pueden tener cualquier tamaño, pero los algoritmos criptográficos trabajan con entradas de tamaño fijo. Para resolverlo, el mensaje se pasa por una **función hash**.

Una funcion hash:

* Produce una salida de tamaño fijo
* Siempre da el mismo resultado para la misma entrada
* Cambia por completo si la entrada cambia aunque sea un poco

Ejemplo:

```
Mensaje: "Desafío de inicio de sesión: 938472"
Hash:    8F3A91...
```

Este hash es la **huella digital** del mensaje.

---

## Paso 2 — Firmar el hash con la clave privada

Luego, la clave privada se usa para transformar el hash en una firma.

Conceptualmente:

```
firma = FIRMAR(hash, clave_privada)
```

Propiedades importantes:

* Solo la clave privada puede producir esta firma
* La firma está ligada al hash exacto
* Cambiar el mensaje rompe la firma

Los esquemas modernos agregan aleatoriedad y formato en este paso para evitar ataques, pero la idea sigue siendo la misma.

---

## Paso 3 — Enviar mensaje y firma

El firmante envía:

* El mensaje original (o un desafio conocido)
* La firma

La clave privada **nunca** se transmite.

---

## Paso 4 — Verificar con la clave pública

La verificación es la operación espejo que realiza el receptor.

El verificador:

1. Hashea el mensaje recibido
2. Usa la clave pública para comprobar la firma
3. Confirma que ambos resultados coinciden

Conceptualmente:

```
hash_esperado = HASH(mensaje)
hash_verificado = VERIFICAR(firma, clave_publica)

si hash_esperado == hash_verificado:
    la firma es valida
```

La clave pública no revela la clave privada. Solo puede responder una pregunta:

> ¿Esta firma es matemáticamente consistente con este mensaje y esta clave pública?

---

## Por qué esto funciona

Las matemáticas detrás de la criptografía de clave pública son intencionalmente asimétricas:

* Crear una firma requiere información secreta
* Verificar una firma es fácil y público

Esta asimetría hace que la falsificación sea inviable mientras mantiene la verificación barata y escalable.

---

## Lo que firmar *no* es

Es importante evitar ideas equivocadas comunes:

* Firmar **no** oculta el mensaje
* Firmar **no** envia la clave privada
* Firmar **no** depende de secretos compartidos

Si se requiere secreto, se usa cifrado *ademas* de la firma, no en lugar de ella.

---

## Por qué los sistemas modernos usan firma

La firma criptográfica es un bloque central detrás de los **passkeys**, donde los dispositivos prueban la posesión de una clave privada sin compartir secretos.

Este enfoque permite que los sistemas se basen en **pruebas matemáticas**, en lugar de contraseñas o memoria humana.

---

## Idea final

Firmar un mensaje significa:

> Convertir un mensaje en una huella digital y usar una clave privada para producir una prueba que cualquiera pueda verificar después usando la clave pública correspondiente.

Esta idea simple sustenta la mayoría de los sistemas seguros modernos.
