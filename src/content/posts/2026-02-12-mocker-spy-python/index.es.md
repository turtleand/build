---

title: "Espiar sin reemplazar con mocker.spy"
description: "Cómo observar funciones reales sin sustituirlas por fakes."
date: 2026-02-12
tags: ["python", "mocks"]
featured: true
draft: false
image:
  src: /images/posts/python-logo.svg
  alt: "Python logo"
locale: es
translationKey: python-mocker-spy
slug: "2026-02-12-mocker-spy-python-es"
---
-----------------------------

A veces querés verificar que una función fue llamada con los argumentos correctos **sin reemplazarla** por un fake. Para eso existe `mocker.spy`.

Donde [`mocker.patch`](/es/blog/2025-11-29-mocker-python-es) reemplaza la función real por un `MagicMock`, `mocker.spy` envuelve la función real para que siga ejecutándose normalmente — pero el wrapper registra cada llamada, argumento y valor de retorno.

---

## 1. Ejemplo de código

**converter.py**

```python file=./sandbox/converter.py
```

**weather.py**

```python file=./sandbox/weather.py
```

`weather.py` hace `from converter import celsius_to_fahrenheit`, lo que crea un **name binding local** dentro del módulo `weather`.

## 2. ¿Qué se debe espiar?

La misma regla de ["parchear donde se usa"](/es/blog/2025-11-29-mocker-python-es#2-cuál-debería-ser-el-objetivo) aplica a los espías.

`mocker.spy(obj, name)` funciona con `setattr` — reemplaza `obj.name` con un wrapper que delega a la función original. Si el módulo que llama importó la función con `from X import Y`, el name binding vive en **el namespace del módulo que llama**, no en el módulo original.

**Correcto** — espiar donde la función se usa:

```python
mocker.spy(weather, "celsius_to_fahrenheit")
```

**Incorrecto** — espiar donde la función se define:

```python
mocker.spy(converter, "celsius_to_fahrenheit")
```

El objetivo incorrecto reemplaza el atributo en `converter`, pero `weather.celsius_to_fahrenheit` sigue apuntando directamente a la función sin envolver — el espía no ve nada.

## 3. Pruebas

**test_weather.py**

```python file=./sandbox/test_weather.py
```

**Salida de pruebas**

```text file=./sandbox/test_weather.output.txt
```

La primera prueba espía sobre el objetivo correcto y verifica que la llamada fue registrada. La segunda muestra que espiar sobre el sitio de definición no detecta la llamada — `spy.call_count` queda en cero.

## 4. Atributos específicos del espía

Además de los asserts estándar de `MagicMock` (`assert_called_once_with`, `call_args`, `call_count`, …), un espía agrega:

* **`spy.spy_return`** — el valor de retorno de la última llamada real.
* **`spy.spy_exception`** — la excepción lanzada por la última llamada real (o `None`).

Estos permiten inspeccionar qué hizo la función **real**, no solo que fue llamada.
