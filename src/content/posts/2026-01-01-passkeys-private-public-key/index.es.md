---
title: "Como los passkeys dependen de la firma con clave privada y publica"
description: "Una explicacion para ingenieros de como la firma criptografica permite que los passkeys autentiquen usuarios usando la posesion de la clave en lugar de contrasenas."
date: 2026-01-01
tags: ["cryptography", "security"]
featured: true
draft: false
image:
  src: /images/posts/passkeys-signing.svg
  alt: "Escudo y llave que simbolizan la firma criptografica"
locale: es
translationKey: passkeys-private-public-key
slug: 2026-01-01-passkeys-private-public-key
---

Este articulo explica de forma simple como la criptografia de clave publica y privada se usa para **firmar mensajes** y luego **verificar** esas firmas. El objetivo es construir la intuicion correcta para ingenieros y lectores tecnicos que quieren entender *que ocurre realmente* cuando sistemas como los passkeys dependen de la firma criptografica.

---

## El problema central

Cuando un sistema recibe un mensaje, a menudo necesita responder una pregunta muy especifica:

> ¿Este mensaje exacto proviene de alguien que posee una clave privada determinada?

Esto *no* trata sobre secreto. El mensaje puede ser publico. Lo importante es la **autenticidad** y la **integridad**.

---

## El par de claves

La criptografia de clave publica siempre comienza con un **par de claves**:

* **Clave privada**

  * Secreta
  * Se almacena de forma segura
  * Nunca se comparte

* **Clave publica**

  * Se comparte libremente
  * Se almacena en servidores u otras partes

Las claves estan relacionadas matematicamente, pero en un solo sentido: conocer la clave publica no permite derivar la clave privada.

---

## Que significa "firmar un mensaje"

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

Los mensajes pueden tener cualquier tamano, pero los algoritmos criptograficos trabajan con entradas de tamano fijo. Para resolverlo, el mensaje se pasa por una **funcion hash**.

Una funcion hash:

* Produce una salida de tamano fijo
* Siempre da el mismo resultado para la misma entrada
* Cambia por completo si la entrada cambia aunque sea un poco

Ejemplo:

```
Mensaje: "Desafio de inicio de sesion: 938472"
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
* La firma esta ligada al hash exacto
* Cambiar el mensaje rompe la firma

Los esquemas modernos agregan aleatoriedad y formato en este paso para evitar ataques, pero la idea sigue siendo la misma.

---

## Paso 3 — Enviar mensaje y firma

El firmante envia:

* El mensaje original (o un desafio conocido)
* La firma

La clave privada **nunca** se transmite.

---

## Paso 4 — Verificar con la clave publica

La verificacion es la operacion espejo que realiza el receptor.

El verificador:

1. Hashea el mensaje recibido
2. Usa la clave publica para comprobar la firma
3. Confirma que ambos resultados coinciden

Conceptualmente:

```
hash_esperado = HASH(mensaje)
hash_verificado = VERIFICAR(firma, clave_publica)

si hash_esperado == hash_verificado:
    la firma es valida
```

La clave publica no revela la clave privada. Solo puede responder una pregunta:

> ¿Esta firma es matematicamente consistente con este mensaje y esta clave publica?

---

## Por que esto funciona

Las matematicas detras de la criptografia de clave publica son intencionalmente asimetricas:

* Crear una firma requiere informacion secreta
* Verificar una firma es facil y publico

Esta asimetria hace que la falsificacion sea inviable mientras mantiene la verificacion barata y escalable.

---

## Lo que firmar *no* es

Es importante evitar ideas equivocadas comunes:

* Firmar **no** oculta el mensaje
* Firmar **no** envia la clave privada
* Firmar **no** depende de secretos compartidos

Si se requiere secreto, se usa cifrado *ademas* de la firma, no en lugar de ella.

---

## Por que los sistemas modernos usan firma

La firma criptografica es un bloque central detras de los **passkeys**, donde los dispositivos prueban la posesion de una clave privada sin compartir secretos.

Este enfoque permite que los sistemas se basen en **pruebas matematicas**, en lugar de contrasenas o memoria humana.

---

## Idea final

Firmar un mensaje significa:

> Convertir un mensaje en una huella digital y usar una clave privada para producir una prueba que cualquiera pueda verificar despues usando la clave publica correspondiente.

Esta idea simple sustenta la mayoria de los sistemas seguros modernos.
