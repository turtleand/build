---
title: "Dependency Injection"
description: "Understanding dependency injection through practical Flask examples and avoiding common pitfalls."
date: 2026-02-02
tags: ["python", "design patterns"]
featured: true
draft: false
image:
  src: /images/posts/python-logo.svg
  alt: "Python Logo"
locale: en
translationKey: dependency-injection-python
slug: 2026-02-02-dependency-injection-python
---

Dependency injection is a design pattern where objects receive their dependencies from external sources rather than creating them internally. While the concept sounds abstract, it solves concrete problems around testing, flexibility, and code organization.

This article explains why dependency injection matters and shows how to implement it correctly in Flask applications using the `dependency-injector` library.

---

## 1. The Core Problem

Consider a simple greeting service that retrieves user data:

```python
class GreetingService:
    def __init__(self):
        self.repo = UserRepository()  # Hard-coded dependency

    def generate_greeting(self, user_id: int) -> str:
        user = self.repo.get_user(user_id)
        return f"Hello, {user.name}!"
```

This code has several issues:

* **Testing is difficult**: You cannot test `GreetingService` without also creating a real `UserRepository`, which might require a database connection.
* **Inflexible**: If you need to swap `UserRepository` for a different implementation (e.g., caching layer, mock for testing), you must modify the `GreetingService` code.
* **Hidden dependencies**: By reading the code, you cannot immediately see that `GreetingService` depends on `UserRepository` without inspecting the constructor body.

---

## 2. The Solution: Inject Dependencies

Instead of creating dependencies internally, we pass them in:

```python
class GreetingService:
    def __init__(self, repo: UserRepository):
        self.repo = repo  # Dependency is injected

    def generate_greeting(self, user_id: int) -> str:
        user = self.repo.get_user(user_id)
        return f"Hello, {user.name}!"
```

Now:

* **Testing is simple**: Pass a mock repository when testing.
* **Flexible**: Swap implementations without changing `GreetingService`.
* **Clear contract**: The constructor signature explicitly shows what the service needs.

This is **constructor injection** — the most common form of dependency injection.

---

## 3. Why Use a DI Container?

For small applications, manual injection works fine:

```python
repo = UserRepository()
service = GreetingService(repo)
```

But as applications grow, managing these dependencies manually becomes tedious:

```python
# Deep dependency chains become unmanageable
db = Database()
cache = Cache()
repo = UserRepository(db, cache)
validator = UserValidator()
service = GreetingService(repo, validator)
notifier = EmailNotifier()
controller = UserController(service, notifier)
# ... and so on
```

A **DI container** automates this wiring. You declare your dependencies once, and the container handles instantiation and injection.

---

## 4. Practical Example: Flask with dependency-injector

Let's build a Flask application with dependency injection using the `dependency-injector` library.

### 4.1. Define Your Services

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

### 4.2. Create a Container

The container defines how to create and wire your dependencies.

**containers.py**

```python
from dependency_injector import containers, providers
from . import services

class Container(containers.DeclarativeContainer):
    # Configure wiring to point to the views module
    wiring_config = containers.WiringConfiguration(modules=[".views"])

    user_repo = providers.Singleton(services.UserRepository)

    greeting_service = providers.Factory(
        services.GreetingService,
        repo=user_repo,
    )
```

Key points:

* `wiring_config`: Declares which modules contain injection points (routes with `@inject`).
* `Singleton`: One instance shared across the application.
* `Factory`: Creates a new instance each time it's requested.
* `repo=user_repo`: Wires the `UserRepository` into `GreetingService`.

### 4.3. Define Routes in a Separate Views Module

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

### 4.4. Wire Everything Together in the App

**app.py**

```python
from flask import Flask
from .containers import Container
from . import views

def create_app():
    # Initialize the DI container
    container = Container()

    app = Flask(__name__)
    app.container = container

    # Register routes from the views module
    app.add_url_rule("/<int:user_id>", view_func=views.index)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
```

---

## 5. Why This Works

The `@inject` decorator and `Provide[...]` marker work together:

1. When you define `service: GreetingService = Provide[Container.greeting_service]`, you're telling the DI framework: "Replace this parameter with an instance from the container."
2. The `wiring_config` in the Container tells the framework which modules to scan for `@inject` decorators.
3. When the container is instantiated, it automatically wires the specified modules.
4. When the route is called, `service` is automatically a real `GreetingService` instance, not a `Provide` object.

### Common Error: "AttributeError: 'Provide' object..."

This error happens when wiring fails or the injection doesn't occur. The `Provide` marker was never replaced with a real object.

**Common causes:**

* Container was not instantiated.
* The module containing `@inject` decorators is not listed in `wiring_config`.
* Typo in the module path (e.g., `".views"` vs `"views"`).
* The view function was never imported or registered.

**The fix:** Use `wiring_config` in your Container class to declare which modules contain injection points. This is more reliable than manual wiring because the container handles it automatically when instantiated.

---

## 6. Key Takeaways

Dependency injection solves real problems:

* Makes testing easier by decoupling object creation from usage.
* Makes dependencies explicit in constructor signatures.
* Allows swapping implementations without changing code.
