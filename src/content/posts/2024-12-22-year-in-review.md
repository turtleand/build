---
title: "Setup multiple Github accounts mac"
description: "Setup multiple Github accounts mac"
date: 2025-11-17
tags: ["github", "mac"]
featured: true
draft: false
locale: en
translationKey: setup-multiple-github
---

## 🧭 GOAL

You’ll end up with:

* One GitHub account configured globally (`~/.gitconfig`).
* Another GitHub account configured **per-repository** or via **SSH alias**, so they don’t conflict.

---

## 🧩 Step 1: Check your current setup

```bash
git config --global user.name
git config --global user.email
cat ~/.ssh/config  # optional
```

That’s your *primary* (default) GitHub identity.

---

## 🧰 Step 2: Create a new SSH key for the second account

For example, if your new GitHub account is **personal**, do:

```bash
ssh-keygen -t ed25519 -C "your_other_email@example.com" -f ~/.ssh/id_ed25519_personal
```

When asked for a passphrase, you can leave it empty or use one (recommended for security).

---

## 🪪 Step 3: Add that key to your SSH agent

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_personal
```

This stores the key in macOS Keychain.

---

## ☁️ Step 4: Add the **public key** to your other GitHub account

Copy and paste it into GitHub → Settings → SSH and GPG keys → **New SSH key**

```bash
cat ~/.ssh/id_ed25519_personal.pub
```

---

## 🧩 Step 5: Create SSH config aliases

Edit (or create) your `~/.ssh/config` file:

```bash
# Default (work) GitHub
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  AddKeysToAgent yes
  UseKeychain yes

# Personal GitHub
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  AddKeysToAgent yes
  UseKeychain yes
```

This lets you use **`github-personal`** as a fake hostname for the second identity.

---

## 🧭 Step 6: Clone repositories using the alias

For the *personal* account:

```bash
git clone git@github-personal:username/repo.git
```

For the *default/work* one:

```bash
git clone git@github.com:workuser/repo.git
```

Each uses its own key.

---

## 🧾 Step 7: Set per-repo identity (optional but recommended)

Inside the personal repo:

```bash
cd ~/code/personal-repo
git config user.name "Your Personal Name"
git config user.email "your_other_email@example.com"
```

This ensures commits are attributed to the right GitHub account.

---

## ⚙️ Step 8: (Optional) Use HTTPS + Personal Access Token

If you prefer HTTPS instead of SSH, you can store different credentials via `git credential-osxkeychain`, but SSH is cleaner for multi-account setups.

---

## ✅ Quick Summary

| Task                | Command / File                                        | Example                |
| ------------------- | ----------------------------------------------------- | ---------------------- |
| Generate second key | `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_personal` | —                      |
| SSH config alias    | `~/.ssh/config`                                       | `Host github-personal` |
| Clone with alias    | `git@github-personal:...`                             | —                      |
| Per-repo identity   | `git config user.email`                               | —                      |
