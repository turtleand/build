---

title: "¿Cómo funciona mocker en Python?"
description: "Aprende qué hace realmente mocker, cómo parchear los objetivos correctos y construye un clon diminuto para entender la mecánica."
date: 2025-11-30
tags: ["python", "mocks"]
featured: true
draft: false
locale: es
translationKey: python-mocker
slug: "2025-11-29-mocker-python-es"
---
-----------------------------

Respuesta corta:
`mocker` es un **fixture de pytest** proporcionado por el plugin [`pytest-mock`](https://github.com/pytest-dev/pytest-mock).

Entrega un pequeño helper (normalmente llamado `mocker`) que envuelve a [`unittest.mock`](https://docs.python.org/3/library/unittest.mock.html) de la biblioteca estándar, para que puedas:

* **Reemplazar ("parchear") objetos reales** (funciones, métodos, atributos) con `MagicMock` controlables.
* **Registrar llamadas**: verificar cuántas veces se invocó un doble, qué argumentos recibió y más detalles.
* **Deshacer todos los parches automáticamente** al final de cada prueba para que tu código vuelva a su estado original.

---

## 1. Ejemplo de código

**email_gateway.py**

```python file=./sandbox/email_gateway.py
```


**email_service.py**

```python file=./sandbox/email_service.py
```

Como la función de alto nivel `notify_user` importa `send_email` y cierra sobre ese nombre, las pruebas parchean `email_service.send_email` en lugar de `email_gateway.send_email`.

## 2. ¿Cuál debería ser el objetivo?

**Regla general:**

> Parchea el **nombre visible dentro del módulo bajo prueba**, no el lugar original donde se definió el objeto. En otras palabras, parchea “donde se usa” en lugar de “donde se definió”.

---

## 3. Un PocketMocker mínimo

Ahora construyamos una **versión mini** de `mocker` para mostrar todas las piezas en movimiento.

No tocaremos `unittest.mock.patch`; en su lugar haremos el trabajo manualmente con:

* `importlib.import_module`
* `getattr` / `setattr`
* `unittest.mock.MagicMock`

**pocket_mocker.py**

```python file=./sandbox/pocket_mocker.py
```

### Explicación de los helpers de bajo nivel

* `importlib.import_module(module_path)`

  * Recibe una cadena como `"email_service.send_email"` y devuelve el objeto de módulo real.
  * Se apoya en el sistema de importación de Python y en `sys.modules`.

* `getattr(module, attr_name)`

  * Lee un atributo de un objeto.
  * Equivalente a `module.attr_name`.

* `setattr(module, attr_name, replacement)`

  * Asigna un atributo sobre un objeto.
  * Equivalente a `module.attr_name = replacement`.
  * Este es el paso literal de “patch”: sobrescribimos la función original con nuestro doble.

* `MagicMock(**kwargs)`

  * Crea un objeto falso flexible que:

    * Registra llamadas (para que puedas hacer asserts luego).
    * Puede configurarse con `return_value` o `side_effect`.
    * Soporta atributos y métodos dinámicos.

Construir `PocketMocker` demuestra que `pytest-mock` y `unittest.mock` son simplemente una capa más agradable sobre este mismo comportamiento base.

## Pruebas

**test_email_service.py**

```python file=./sandbox/test_email_service.py
```

**Salida de pruebas**

```text file=./sandbox/test_email_service.output.txt
```

La primera prueba ejercita el fixture real de `pytest-mock`, mientras que la segunda recorre la implementación casera para que puedas seguir cada paso.
