---
title: "Configurar múltiples cuentas de Github en Mac"
description: "Utiliza múltiples cuentas de GitHub en el mismo Mac usando SSH y configuradas por repositorio."
date: 2025-11-23
tags: ["git", "github", "mac"]
featured: false
draft: false
image:
  src: /images/posts/github-mark.svg
  alt: "Logo Github"
locale: es
translationKey: configure-multiple-github-accounts-mac
slug: configure-multiple-github-accounts-mac
---

## Objetivo

Configurar dos cuentas de GitHub en el mismo Mac — una como tu predeterminada global y otra aislada por repositorio usando alias SSH — para que puedas cambiar de cuenta sin conflictos:

* Una cuenta de GitHub configurada globalmente (`~/.gitconfig`).
* Otra cuenta de GitHub configurada **por repositorio** o mediante **alias SSH**, para evitar conflictos.

---

## Paso 1: Verifica tu configuración actual

```bash
git config --global user.name
git config --global user.email
cat ~/.ssh/config  # opcional
````

Esa es tu cuenta de GitHub *primaria* (predeterminada).

---

## Paso 2: Crea una nueva clave SSH para la segunda cuenta

Por ejemplo, si tu nueva cuenta de GitHub es **personal**, ejecuta:

```bash
ssh-keygen -t ed25519 -C "your_other_email@example.com" -f ~/.ssh/id_ed25519_personal
```

Cuando se te pida una passphrase, puedes dejarla vacía o usar una (recomendado por seguridad).

---

## Paso 3: Añade esa clave a tu agente SSH

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_personal
```

Esto almacena la clave en el llavero de macOS.

---

## Paso 4: Añade la **clave pública** a tu otra cuenta de GitHub

Cópiala y pégala en GitHub → Settings → SSH and GPG keys → **New SSH key**

```bash
cat ~/.ssh/id_ed25519_personal.pub
```

---

## Paso 5: Crea alias en la configuración de SSH

Edita (o crea) tu archivo `~/.ssh/config`:

```bash
# GitHub predeterminado (trabajo)
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  AddKeysToAgent yes
  UseKeychain yes

# GitHub personal
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  AddKeysToAgent yes
  UseKeychain yes
```

Esto te permite usar **`github-personal`** como un hostname falso para la segunda cuenta.

---

## Paso 6: Clona repositorios usando el alias

Para la cuenta *personal*:

```bash
git clone git@github-personal:username/repo.git
```

Para la cuenta *predeterminada/de trabajo*:

```bash
git clone git@github.com:workuser/repo.git
```

Cada una usa su propia clave.

---

## Paso 7: Configura la cuenta por repositorio (opcional pero recomendado)

Dentro del repositorio personal:

```bash
cd ~/code/personal-repo
git config user.name "Your Personal Name"
git config user.email "your_other_email@example.com"
```

Esto asegura que los commits se atribuyan a la cuenta de GitHub correcta.
