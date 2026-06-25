---
title: "Git Worktrees Are Separate Desks"
description: "A simple mental model for Git worktrees: separate folders for the same repository history, each with its own files, staging area, and HEAD."
date: 2026-06-25
tags: ["git", "developer tools", "software engineering"]
featured: false
draft: false
image:
  src: /images/posts/github-mark.svg
  alt: "GitHub mark icon"
locale: en
translationKey: git-worktrees-separate-desks
slug: 2026-06-25-git-worktrees-separate-desks
---

Git worktrees sound more complicated than they are.

The simplest model is this:

> A worktree is another desk for the same project.

Your original folder is one desk. A second worktree is another folder connected to the same repository history. You can have one branch open on one desk and a different branch open on another desk, without stashing or moving unfinished files out of the way.

## Why this helps

The common problem is branch interruption.

You are halfway through work on one branch. Files are changed. Maybe some are staged. Then another task appears: review a pull request, test a bug, make a tiny fix, or inspect the current main branch.

Without worktrees, you usually have to choose between three awkward options:

1. Stash your work.
2. Commit something before it is ready.
3. Risk switching branches with a messy working directory.

A worktree gives you a fourth option:

> Keep the current desk exactly as it is. Open another desk for the other branch.

That is the practical value. Worktrees reduce context switching damage.

## The technical model

A Git repository has shared history: commits, objects, branches, and tags.

A worktree gives you a separate working folder connected to that shared history. Each worktree has its own:

- Working files
- Index, which is Git's staging area
- `HEAD`, which points to the current branch or commit

So the clean model is:

```text
index = Git's staging area
HEAD = pointer to the current branch or commit
worktree = separate working folder with its own files, index, and HEAD
```

The important detail is that worktrees share the repository's object database and history, but they do not share the exact checked-out files or staging area.

That is why one folder can be on `main` while another folder is on `fix/login-bug`.

## A small example

From inside an existing repository, list current worktrees:

```bash
git worktree list
```

Add another folder for a branch:

```bash
git worktree add ../project-fix fix/login-bug
```

Now you have another folder next to the original repository folder:

```text
project/
project-fix/
```

Both folders are connected to the same Git history. But they have separate checked-out files, separate staging areas, and separate `HEAD` pointers.

If you want to create a new branch while creating the worktree, use:

```bash
git worktree add -b fix/login-bug ../project-fix main
```

That creates `fix/login-bug` from `main` and checks it out in `../project-fix`.

## Useful commands

```bash
git worktree list
git worktree add ../folder-name branch-name
git worktree add -b new-branch ../folder-name base-branch
git worktree remove ../folder-name
git worktree prune
```

`git worktree remove` removes a linked working folder after you are done with it.

`git worktree prune` cleans up stale worktree metadata if a folder was deleted outside Git.

## One branch, one desk

Git normally prevents the same branch from being checked out in two worktrees at the same time.

That rule protects you from having two folders both claiming to be the live working copy of the same branch. If you need another desk for inspection only, you can check out a commit in detached `HEAD` state. If you need active work, create a separate branch.

## Bottom line

A Git worktree is a separate working folder connected to the same repository history, allowing different branches or commits to be checked out side by side, each with its own files, staging area, and `HEAD`.

The mental model is enough for most use:

> Same project history. Separate desks.

Use worktrees when you want to move to another branch without disturbing the work already open in front of you.
