---
title: "Los Git worktrees son escritorios separados"
description: "Un modelo mental simple para Git worktrees: carpetas separadas para la misma historia del repositorio, cada una con sus propios archivos, staging area y HEAD."
date: 2026-06-25
tags: ["git", "herramientas de desarrollo", "ingeniería de software"]
featured: false
draft: false
image:
  src: /images/posts/github-mark.svg
  alt: "Ícono de GitHub"
locale: es
translationKey: git-worktrees-separate-desks
slug: 2026-06-25-git-worktrees-separate-desks-es
---

Los Git worktrees suenan más complicados de lo que son.

El modelo más simple es este:

> Un worktree es otro escritorio para el mismo proyecto.

Tu carpeta original es un escritorio. Un segundo worktree es otra carpeta conectada a la misma historia del repositorio. Podés tener una rama abierta en un escritorio y otra rama distinta en otro escritorio, sin hacer stash ni mover trabajo incompleto fuera del camino.

## Por qué ayuda

El problema común es la interrupción entre ramas.

Estás a mitad de trabajo en una rama. Hay archivos modificados. Quizás algunos están staged. Entonces aparece otra tarea: revisar un pull request, probar un bug, hacer un arreglo chico o inspeccionar el estado actual de `main`.

Sin worktrees, normalmente tenés que elegir entre tres opciones incómodas:

1. Hacer stash del trabajo.
2. Committear algo antes de que esté listo.
3. Cambiar de rama con un working directory desordenado.

Un worktree te da una cuarta opción:

> Dejá el escritorio actual exactamente como está. Abrí otro escritorio para la otra rama.

Ese es el valor práctico. Los worktrees reducen el daño del cambio de contexto.

## El modelo técnico

Un repositorio Git tiene historia compartida: commits, objetos, ramas y tags.

Un worktree te da una carpeta de trabajo separada conectada a esa historia compartida. Cada worktree tiene su propio:

- Archivos de trabajo
- Index, que es la staging area de Git
- `HEAD`, que apunta a la rama o commit actual

Entonces el modelo limpio es:

```text
index = la staging area de Git
HEAD = puntero a la rama o commit actual
worktree = carpeta de trabajo separada con sus propios archivos, index y HEAD
```

El detalle importante es que los worktrees comparten la base de objetos y la historia del repositorio, pero no comparten exactamente los archivos checked out ni la staging area.

Por eso una carpeta puede estar en `main` mientras otra carpeta está en `fix/login-bug`.

## Un ejemplo chico

Desde un repositorio existente, listá los worktrees actuales:

```bash
git worktree list
```

Agregá otra carpeta para una rama:

```bash
git worktree add ../project-fix fix/login-bug
```

Ahora tenés otra carpeta al lado de la carpeta original del repositorio:

```text
project/
project-fix/
```

Las dos carpetas están conectadas a la misma historia de Git. Pero tienen archivos checked out separados, staging areas separadas y punteros `HEAD` separados.

Si querés crear una rama nueva al crear el worktree, usá:

```bash
git worktree add -b fix/login-bug ../project-fix main
```

Eso crea `fix/login-bug` desde `main` y la abre en `../project-fix`.

## Comandos útiles

```bash
git worktree list
git worktree add ../folder-name branch-name
git worktree add -b new-branch ../folder-name base-branch
git worktree remove ../folder-name
git worktree prune
```

`git worktree remove` elimina una carpeta de trabajo vinculada cuando ya terminaste con ella.

`git worktree prune` limpia metadata vieja de worktrees si una carpeta fue borrada por fuera de Git.

## Una rama, un escritorio

Git normalmente impide que la misma rama esté checked out en dos worktrees al mismo tiempo.

Esa regla evita que dos carpetas digan ser la copia de trabajo activa de la misma rama. Si necesitás otro escritorio solo para inspeccionar, podés abrir un commit en estado detached `HEAD`. Si necesitás trabajo activo, creá una rama separada.

## Bottom line

Un Git worktree es una carpeta de trabajo separada conectada a la misma historia del repositorio, que permite tener distintas ramas o commits checked out lado a lado, cada uno con sus propios archivos, staging area y `HEAD`.

El modelo mental alcanza para la mayoría de los casos:

> Misma historia del proyecto. Escritorios separados.

Usá worktrees cuando quieras moverte a otra rama sin alterar el trabajo que ya tenés abierto enfrente.
