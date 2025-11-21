---
title: "Configurar varias cuentas de GitHub en Mac"
description: "Configurar varias cuentas de GitHub en Mac sin conflictos."
date: 2025-11-17
tags: ["github", "mac"]
featured: true
draft: false
locale: es
translationKey: setup-multiple-github
slug: configurar-varias-cuentas-github
---

## 🧭 Objetivo

Terminarás con:

* Una cuenta de GitHub configurada de forma global (`~/.gitconfig`).
* Otra cuenta configurada **por repositorio** o mediante **alias de SSH**, sin conflictos.

---

## 🧩 Paso 1: revisa tu configuración actual

```bash
git config --global user.name
git config --global user.email
cat ~/.ssh/config  # opcional
```

Esa es tu identidad de GitHub principal.

---

## 🧰 Paso 2: crea una nueva llave SSH para la segunda cuenta

Por ejemplo, si tu nueva cuenta es **personal**, ejecuta:

```bash
ssh-keygen -t ed25519 -C "tu_otro_email@example.com" -f ~/.ssh/id_ed25519_personal
```

Cuando te pida un passphrase puedes dejarlo vacío o usar uno (recomendado por seguridad).

---

## 🪪 Paso 3: agrega la llave al agente SSH

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_personal
```

Esto guarda la llave en el llavero de macOS.

---

## ☁️ Paso 4: agrega la **llave pública** a tu otra cuenta de GitHub

Copia y pega en GitHub → Configuración → SSH and GPG keys → **New SSH key**

```bash
cat ~/.ssh/id_ed25519_personal.pub
```

---

## 🧩 Paso 5: crea alias en tu configuración de SSH

Edita (o crea) tu archivo `~/.ssh/config`:

```bash
# GitHub por defecto (trabajo)
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

Esto te permite usar **`github-personal`** como hostname falso para la segunda identidad.

---

## 🧭 Paso 6: clona repos usando el alias

Para la cuenta *personal*:

```bash
git clone git@github-personal:usuario/repo.git
```

Para la cuenta *predeterminada/trabajo*:

```bash
git clone git@github.com:usuario-trabajo/repo.git
```

Cada una usa su propia llave.

---

## 🧾 Paso 7: define la identidad por repositorio (opcional pero recomendado)

Dentro del repo personal:

```bash
cd ~/code/repo-personal
git config user.name "Tu nombre personal"
git config user.email "tu_otro_email@example.com"
```

Así aseguras que los commits se atribuyen a la cuenta correcta.
