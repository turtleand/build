---
title: "Use .git/info/exclude for Local Notes in a Shared Repo"
description: "How Git's local exclude file keeps personal notes, AI research, scratch scripts, and temporary files out of shared repository history."
date: 2026-06-18
tags: ["git", "developer tools", "software engineering"]
featured: false
draft: false
image:
  src: /images/posts/github-mark.svg
  alt: "GitHub mark icon"
locale: en
translationKey: git-info-exclude-local-workspace
slug: 2026-06-18-git-info-exclude-local-workspace
---

A shared repository should stay clean enough for other people to clone, review, search, and trust.

That gets harder when the repo also becomes your thinking space.

AI research notes, prompt drafts, temporary scripts, debugging scraps, local checklists, generated experiments, and half-formed ideas can all be useful while working. But most of them should not show up in every `git status`, every pull request, or every teammate's checkout.

Git has a quiet tool for this boundary:

```bash
.git/info/exclude
```

It lets you ignore local files in one clone without changing the shared repository.

## The difference from .gitignore

A project `.gitignore` is part of the repository. It is usually committed, reviewed, and shared with everyone.

`.git/info/exclude` is different. It lives inside your local `.git` directory, so it is not committed with the project.

Use this simple distinction:

- `.gitignore` is for patterns the project agrees on.
- `.git/info/exclude` is for patterns only your clone needs.

Both files use the same ignore pattern style. The difference is the audience.

## When this is useful

Use `.git/info/exclude` for personal working artifacts that help you think near the code, but do not belong in the shared project.

Good examples:

- Local research notes
- AI prompt drafts
- Scratch scripts
- Temporary analysis outputs
- Personal task checklists
- Local debugging files
- Generated experiment folders
- One-off files from tools you are testing

This is especially useful in AI-assisted development. Agents and copilots can produce extra notes, alternate implementations, probes, transcripts, and temporary scripts. Some of that material should become real documentation, tests, or source code. Most of it should stay out of the repository history.

`.git/info/exclude` gives you a local workspace boundary.

## A practical setup

Open the file from the repository root:

```bash
nano .git/info/exclude
```

Then add patterns the same way you would in `.gitignore`:

```text
# Local thinking space
local-notes/
ai-research/
prompt-drafts/
*.local.md

# Local experiments
scratch/
scripts-local/
outputs-local/
```

After that, Git will ignore those paths in your clone.

For example, this file:

```text
local-notes/refactor-ideas.md
```

will no longer appear as an untracked file if `local-notes/` is listed in `.git/info/exclude`.

## Verify the rule

You can check a specific path with:

```bash
git check-ignore -v local-notes/refactor-ideas.md
```

A successful result should point back to `.git/info/exclude`, showing which rule matched.

You can also inspect ignored files with:

```bash
git status --ignored
```

That is useful when you want to confirm Git is ignoring the right things without accidentally hiding something important.

## When not to use it

Do not use `.git/info/exclude` as a substitute for project hygiene.

If every developer should ignore a pattern, put it in `.gitignore`.

If a file is required to build, test, understand, or reproduce the project, it probably belongs in the repository.

If a file contains secrets, do not rely on ignore rules as your main safety mechanism. Keep secrets out of the project directory when possible, use environment variables or secret managers, and assume mistakes happen.

Ignored files are not tracked by Git, but they still exist on disk. That matters for backups, sync tools, terminal history, shell scripts, AI tools, and accidental copy-paste.

## A good local pattern

For research-heavy or AI-assisted work, a small local structure can be enough:

```text
local-notes/
prompt-drafts/
scratch/
scripts-local/
outputs-local/
```

Then add those paths to `.git/info/exclude`.

The result is simple: your thinking stays close to the code, but the shared repository stays focused on project artifacts.

## The principle

`.git/info/exclude` is not a hiding place for careless work.

It is a local workspace boundary.

Use it when a file is useful to your process, but not useful to the project. Keep the repo clean, keep your notes nearby, and promote only the artifacts that deserve to become shared context.
