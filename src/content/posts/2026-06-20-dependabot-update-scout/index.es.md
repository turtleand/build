---
title: "Dependabot es un explorador de actualizaciones"
description: "Una explicación para principiantes sobre cómo Dependabot mira dependencias, abre pull requests de actualización y deja los tests y la revisión humana al mando."
date: 2026-06-20
tags: ["github", "herramientas de desarrollo", "ingeniería de software", "mantenimiento"]
featured: false
draft: false
image:
  src: /images/posts/github-mark.svg
  alt: "Ícono de GitHub"
locale: es
translationKey: dependabot-update-scout
slug: 2026-06-20-dependabot-update-scout-es
---

Las dependencias envejecen en silencio.

Un paquete que funcionaba el mes pasado puede tener una versión más segura hoy. Una GitHub Action fijada a una versión vieja puede seguir corriendo, pero alejarse del camino mantenido. La mayoría de los equipos no necesita más heroísmo. Necesita que las piezas que envejecen se vuelvan visibles.

Ese es el modelo mental útil para Dependabot:

> Dependabot es un explorador de actualizaciones. Mira los bloques de construcción del proyecto y levanta cambios chicos para revisar.

## Qué mira

Dependabot puede mirar manifiestos de dependencias y referencias de workflows. En un proyecto JavaScript, eso suele significar archivos como `package.json` y un lockfile. En un repositorio con GitHub Actions, también puede mirar referencias a acciones dentro de los workflows.

El detalle importante es que Dependabot no reconstruye el proyecto en silencio. Abre pull requests.

Esa diferencia mantiene la automatización en el lugar correcto. El bot detecta drift. CI prueba el cambio propuesto. Una persona decide si la actualización pertenece al proyecto.

## El workflow seguro

Un loop simple de mantenimiento se ve así:

1. El repositorio tiene archivos de dependencias o archivos de workflow.
2. Dependabot revisa actualizaciones disponibles según un schedule.
3. Dependabot abre un pull request con una actualización propuesta.
4. CI corre los tests y checks de build del proyecto.
5. Una persona revisa el diff, las release notes y el riesgo.
6. La actualización se mergea, se agrupa, se difiere o se cierra.

El valor no es mergear automáticamente. El valor es visibilidad automática.

## Una configuración mínima

La documentación actual de GitHub muestra `dependabot.yml` con `version: 2`, una lista `updates`, un `package-ecosystem`, un `directory` y un `schedule`.

Una forma mínima podría verse así:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

Para GitHub Actions, la documentación de GitHub indica que `directory: "/"` cubre los archivos de workflow en la ubicación default `.github/workflows`.

Tomalo como punto de partida, no como política universal. Proyectos reales pueden necesitar reglas de agrupación, versiones ignoradas, responsables de revisión, directorios específicos por ecosistema o un schedule más lento.

## Qué no es Dependabot

Dependabot no reemplaza los tests.

No prueba que una versión nueva sea segura.

No es una razón para mergear major updates a ciegas.

No es un programa de seguridad completo.

Una actualización de dependencias puede cambiar comportamiento, romper compatibilidad, alterar dependencias transitivas o mostrar nuevos warnings. Por eso el pull request es el límite correcto. Le da al equipo un cambio concreto para inspeccionar en lugar de un problema invisible de drift.

## Cómo revisar PRs de actualización

Para una actualización chica, preguntá:

1. ¿Es patch, minor o major?
2. ¿El lockfile cambió de una manera esperable?
3. ¿Las release notes mencionan breaking changes?
4. ¿CI corrió los checks que importan para este proyecto?
5. ¿Es una sola actualización o conviene agruparla con otras relacionadas?
6. ¿Hay una razón para diferirla?

Un buen sistema de mantenimiento automatizado crea decisiones revisables. No elimina el juicio del sistema.

## Bottom line

Dependabot es útil porque convierte el drift de dependencias en trabajo visible.

Dejá que el bot explore. Dejá que CI pruebe. Dejá que una persona decida.

Esa es una forma más segura de automatizar mantenimiento.
