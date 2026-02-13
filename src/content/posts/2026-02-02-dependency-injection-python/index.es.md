---
title: "Inyección de Dependencias"
description: "Comprendiendo la inyección de dependencias a través de ejemplos prácticos de Flask y evitando errores comunes."
date: 2026-02-02
tags: ["python", "design patterns"]
featured: false
draft: false
image:
  src: /images/posts/python-logo.svg
  alt: "Logo de Python"
locale: es
translationKey: dependency-injection-python
slug: 2026-02-02-dependency-injection-python-es
---

La inyección de dependencias es un patrón de diseño donde los objetos reciben sus dependencias desde fuentes externas en lugar de crearlas internamente. Aunque el concepto suena abstracto, resuelve problemas concretos relacionados con pruebas, flexibilidad y organización del código.

Este artículo explica por qué importa la inyección de dependencias y muestra cómo implementarla correctamente en aplicaciones Flask usando la biblioteca `dependency-injector`.

---

## 1. El Problema Central

Considera un servicio simple de saludos que obtiene datos de usuarios:

```python
class GreetingService:
    def __init__(self):
        self.repo = UserRepository()  # Dependencia codificada

    def generate_greeting(self, user_id: int) -> str:
        user = self.repo.get_user(user_id)
        return f"Hola, {user.name}!"
```

Este código tiene varios problemas:

* **Las pruebas son difíciles**: No puedes probar `GreetingService` sin crear también un `UserRepository` real, que podría requerir una conexión a base de datos.
* **Inflexible**: Si necesitas intercambiar `UserRepository` por una implementación diferente (ej: capa de caché, mock para pruebas), debes modificar el código de `GreetingService`.
* **Dependencias ocultas**: Al leer el código, no puedes ver inmediatamente que `GreetingService` depende de `UserRepository` sin inspeccionar el cuerpo del constructor.

---

## 2. La Solución: Inyectar Dependencias

En lugar de crear dependencias internamente, las pasamos como parámetros:

```python
class GreetingService:
    def __init__(self, repo: UserRepository):
        self.repo = repo  # La dependencia es inyectada

    def generate_greeting(self, user_id: int) -> str:
        user = self.repo.get_user(user_id)
        return f"Hola, {user.name}!"
```

Ahora:

* **Las pruebas son simples**: Pasa un repositorio simulado al probar.
* **Flexible**: Intercambia implementaciones sin cambiar `GreetingService`.
* **Contrato claro**: La firma del constructor muestra explícitamente lo que el servicio necesita.

Esto es **inyección por constructor** — la forma más común de inyección de dependencias.

---

## 3. ¿Por Qué Usar un Contenedor de DI?

Para aplicaciones pequeñas, la inyección manual funciona bien:

```python
repo = UserRepository()
service = GreetingService(repo)
```

Pero a medida que las aplicaciones crecen, manejar estas dependencias manualmente se vuelve tedioso:

```python
# Las cadenas profundas de dependencias se vuelven inmanejables
db = Database()
cache = Cache()
repo = UserRepository(db, cache)
validator = UserValidator()
service = GreetingService(repo, validator)
notifier = EmailNotifier()
controller = UserController(service, notifier)
# ... y así sucesivamente
```

Un **contenedor de DI** automatiza este cableado. Declaras tus dependencias una vez, y el contenedor maneja la instanciación e inyección.

---

## 4. Ejemplo Práctico: Flask con dependency-injector

Construyamos una aplicación Flask con inyección de dependencias usando la biblioteca `dependency-injector`.

### 4.1. Define Tus Servicios

**services.py**

```python
class UserRepository:
    def get_user_name(self, user_id: int):
        users = {1: "Alice", 2: "Bob"}
        return users.get(user_id, "User Not Found")

class GreetingService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def generate_greeting(self, user_id: int):
        name = self.repo.get_user_name(user_id)
        return f"Hello {name}!"
```

### 4.2. Crea un Contenedor

El contenedor define cómo crear y cablear tus dependencias.

**containers.py**

```python
from dependency_injector import containers, providers
from . import services

class Container(containers.DeclarativeContainer):
    # Configura el cableado para apuntar al módulo de vistas
    wiring_config = containers.WiringConfiguration(modules=[".views"])

    user_repo = providers.Singleton(services.UserRepository)

    greeting_service = providers.Factory(
        services.GreetingService,
        repo=user_repo,
    )
```

Puntos clave:

* `wiring_config`: Declara qué módulos contienen puntos de inyección (rutas con `@inject`).
* `Singleton`: Una instancia compartida en toda la aplicación.
* `Factory`: Crea una nueva instancia cada vez que se solicita.
* `repo=user_repo`: Cablea el `UserRepository` dentro de `GreetingService`.

### 4.3. Define Rutas en un Módulo de Vistas Separado

**views.py**

```python
from flask import jsonify
from dependency_injector.wiring import inject, Provide
from .services import GreetingService
from .containers import Container

@inject
def index(user_id: int, service: GreetingService = Provide[Container.greeting_service]):
    message = service.generate_greeting(user_id)
    return jsonify({"result": message})
```

### 4.4. Conecta Todo en la Aplicación

**app.py**

```python
from flask import Flask
from .containers import Container
from . import views

def create_app():
    # Inicializa el contenedor de DI
    container = Container()

    app = Flask(__name__)
    app.container = container

    # Registra rutas desde el módulo de vistas
    app.add_url_rule("/<int:user_id>", view_func=views.index)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
```

---

## 5. Por Qué Funciona Esto

El decorador `@inject` y el marcador `Provide[...]` trabajan juntos:

1. Cuando defines `service: GreetingService = Provide[Container.greeting_service]`, le estás diciendo al framework de DI: "Reemplaza este parámetro con una instancia del contenedor."
2. El `wiring_config` en el Contenedor le dice al framework qué módulos escanear en busca de decoradores `@inject`.
3. Cuando se instancia el contenedor, automáticamente cablea los módulos especificados.
4. Cuando se llama a la ruta, `service` es automáticamente una instancia real de `GreetingService`, no un objeto `Provide`.

### Error Común: "AttributeError: 'Provide' object..."

Este error ocurre cuando el cableado falla o la inyección no ocurre. El marcador `Provide` nunca fue reemplazado con un objeto real.

**Causas comunes:**

* El contenedor no fue instanciado.
* El módulo que contiene decoradores `@inject` no está listado en `wiring_config`.
* Error tipográfico en la ruta del módulo (ej: `".views"` vs `"views"`).
* La función de vista nunca fue importada o registrada.

**La solución:** Usa `wiring_config` en tu clase Container para declarar qué módulos contienen puntos de inyección. Esto es más confiable que el cableado manual porque el contenedor lo maneja automáticamente al instanciarse.

---

## 6. Conclusiones Clave

La inyección de dependencias resuelve problemas reales:

* Facilita las pruebas al desacoplar la creación de objetos de su uso.
* Hace las dependencias explícitas en las firmas de constructores.
* Permite intercambiar implementaciones sin cambiar código.
