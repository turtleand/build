---
title: "How Passkeys Rely on Private & Public Key Signing"
description: "An engineer-friendly explanation of how cryptographic signing enables passkeys to authenticate users using key ownership instead of passwords."
date: 2026-01-01
tags: ["cryptography", "security"]
featured: false
draft: false
image:
  src: /images/posts/security.svg
  alt: "Shield symbolizing security"
locale: en
translationKey: passkeys-private-public-key
slug: 2026-01-01-passkeys-private-public-key
---

This article explains simply how **private and public key cryptography** is used to **sign messages** and later **verify** those signatures. The goal is to build correct intuition for engineers and technical readers who want to understand *what actually happens* when systems like passkeys rely on cryptographic signing.

---

## The core problem

When a system receives a message, it often needs to answer a very specific question:

> Did this exact message come from someone who owns a particular private key?

This is *not* about secrecy. The message itself can be public. What matters is **authenticity** and **integrity**.

---

## The key pair

Public‑key cryptography always starts with a **key pair**:

* **Private key**

  * Secret
  * Stored securely
  * Never shared

* **Public key**

  * Shared freely
  * Stored by servers or other parties

The keys are mathematically related, but in a one‑way fashion: knowing the public key does not allow you to derive the private key.

---

## What “signing a message” really means

Signing does **not** mean encrypting the original message.

Instead, signing means:

1. Creating a **fingerprint** of the message
2. Using the private key to create a **proof** tied to that fingerprint

The output is called a **signature**.

The signature proves two things at once:

* The message was not altered
* The signer owns the private key

---

## Step 1 — Hash the message

Messages can be any size, but cryptographic algorithms work with fixed‑size inputs. To solve this, the message is passed through a **hash function**.

A hash function:

* Produces a fixed‑size output
* Always gives the same result for the same input
* Changes completely if the input changes even slightly

Example:

```
Message: "Login challenge: 938472"
Hash:    8F3A91...
```

This hash is the message’s **digital fingerprint**.

---

## Step 2 — Sign the hash with the private key

The private key is then used to transform the hash into a signature.

Conceptually:

```
signature = SIGN(hash, private_key)
```

Important properties:

* Only the private key can produce this signature
* The signature is tied to the exact hash
* Changing the message breaks the signature

Modern schemes add randomness and formatting at this step to prevent attacks, but the idea remains the same.

---

## Step 3 — Send message and signature

The signer sends:

* The original message (or a known challenge)
* The signature

The private key is **never** transmitted.

---

## Step 4 — Verify with the public key

Verification is the mirror operation performed by the receiver.

The verifier:

1. Hashes the received message
2. Uses the public key to check the signature
3. Confirms that both results match

Conceptually:

```
expected_hash = HASH(message)
verified_hash = VERIFY(signature, public_key)

if expected_hash == verified_hash:
    signature is valid
```

The public key does not reveal the private key. It can only answer one question:

> Is this signature mathematically consistent with this message and this public key?

---

## Why this works

The mathematics behind public‑key cryptography is intentionally asymmetric:

* Creating a signature requires secret information
* Verifying a signature is easy and public

This asymmetry makes forgery infeasible while keeping verification cheap and scalable.

---

## What signing is *not*

It is important to avoid common misconceptions:

* Signing does **not** hide the message
* Signing does **not** send the private key
* Signing does **not** rely on shared secrets

If secrecy is required, encryption is used *in addition* to signing, not instead of it.

---

## Why modern systems use signing

Cryptographic signing is a core building block behind **passkeys**, where devices prove ownership of a private key without sharing secrets.

This approach allows systems to rely on **mathematical proof**, rather than passwords or human memory.

---

## Final takeaway

Signing a message means:

> Turning a message into a fingerprint and using a private key to produce a proof that anyone can later verify using the matching public key.

This simple idea underpins most modern secure systems.
