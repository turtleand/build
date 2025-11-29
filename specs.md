# 🧩 Build MVP – Product Specification (Astro Minimal Template)

## 1. Context & Goal

**Context:**  
`npm create astro@latest` has already been generated with the **minimal template** as the base.  
This spec defines the **initial scaffolding** for a clean blog system inside the **build** repository.

**Goal (MVP):**

- A functional **blog** that:
  - Lists posts from **latest to oldest** with **pagination**.
  - Shows **featured posts** (`featured: true` in frontmatter).
  - Supports **tags** on posts.
  - Has a **tags index** page and **per-tag filtering pages**.

No design requirements here — this is only **product + routing/specification**.

---

## 2. Tech Stack & Base Template

- Framework: **Astro**
- Already Installed via: `npm create astro@latest`
- Already Template: **Minimal**
- Rendering: Static site (SSG)
- Content: Markdown/MDX files stored locally
- Recommended: Astro **Content Collections**

---

## 3. Information Architecture & URL Structure

### 3.1. Blog Home

- `GET /`
  - The main landing page for the repository.
  - Contains:
    - Featured posts section.
    - Paginated list of all posts.

### 3.2. Individual Blog Post

- `GET /blog/[slug]`

### 3.3. Tags

- `GET /tags`
  - Tags index page.

- `GET /tags/[tag]`
  - Page listing all posts associated with that tag.

---

## 4. Content Model (Blog Posts)

Posts are stored under `src/content/posts/` (recommended).

### 4.1. Frontmatter schema

Required fields:

- `title: string`
- `description: string`
- `date: string` (ISO format)
- `tags: string[]`

Optional fields:

- `featured: boolean` (default `false`)
- `draft: boolean` (default `false`)
- `slug: string` (optional override)

### 4.2. Example frontmatter

```md
---
title: "How Turtleand Builds with Astro"
description: "A walkthrough of the scaffolding using Astro's minimal template."
date: "2025-11-16"
tags: ["astro", "build", "meta"]
featured: true
draft: false
---
````

---

## 5. Page Specifications

### 5.1. `/` – Blog Landing (Home)

**Sections:**

1. **Header**

   * Title + short explanation.

2. **Featured Posts**

   * Shows posts with `featured: true`.
   * Sorted by `date` desc.
   * Omit the entire section if no featured posts exist.
   * Each card shows:

     * Title (linked)
     * Date
     * Short description
     * Tags (optional but available as data)

3. **Paginated Blog List**

   * Shows all posts (non-drafts), sorted by `date` desc.
   * Featured posts **also appear here** unless excluded intentionally.
   * Pagination:

     * First page: `/`
     * Next pages: `/page/[page]`
     * Page size: configurable (default 10).

4. **Tag links**

   * Every post card displays its tags.
   * Clicking a tag leads to `/tags/[tag]`.

**Acceptance criteria:**

* Visiting `/` shows featured (if any) + the paginated list.
* Draft posts are excluded.
* Pagination works.

---

### 5.2. `/blog/[slug]` – Blog Post Page

**Contains:**

* Title
* Date
* Tags (linking to `/tags/[tag]`)
* Full MD/MDX content
* Optional breadcrumb back to `/`

**Acceptance criteria:**

* Renders the correct post.
* Draft posts cannot be accessed unless in dev mode.

---

### 5.3. `/tags` – Tags Index Page

**Purpose:**

* Show all tags used by posts (excluding drafts).

**Content:**

* Grid or list of tags.
* Each tag shows the number of posts that use it.
* Each tag links to `/tags/[tag]`.

**Acceptance criteria:**

* All tags appear.
* Clicking a tag goes to its tag detail page.

---

### 5.4. `/tags/[tag]` – Tag Detail Page

**Contains:**

* Title, e.g., `Tag: astro`
* List of posts that include `[tag]`
* Sorted by `date` desc
* Pagination optional, but page must support large tag lists.

**Acceptance criteria:**

* Only posts with the tag appear.
* Draft posts never appear.
* Each card links to `/blog/[slug]`.

---

## 6. Pagination Requirements

* Default: 10 posts per page (configurable).
* Works for:

  * Main blog index (`/`, `/page/[n]`)
  * Tag pages (`/tags/[tag]`)

**Rules:**

* Page ordering is deterministic (descending by date).
* No duplicates or missing posts.
* Invalid pages (e.g. `/page/999`) either:

  * 404, or
  * Redirect to last page (implementation choice).

---

## 7. Tag Filtering Requirements

**Minimum functionality:**

1. Posts include `tags: []`.
2. Tags display in:

   * Post cards
   * Post pages
   * Tags index
3. Clicking a tag filters posts via:

   * `/tags/[tag]`

Optional enhancement:

* On `/`, include a small tag filter UI.

---

## 8. SEO Requirements (Basic MVP)

At minimum, every page should include:

* `<title>` tag
* Meta description

Blog post pages:

* Title: `${title} | Blog`
* Description from frontmatter
* Canonical URL: `/blog/[slug]`

---

## 9. Non-Goals (MVP)

Not included for now:

* RSS feed
* Author profiles
* Search
* Related posts
* Multi-language/i18n
* External CMS
* Theming or visual design system

---

## 10. Suggested File Structure

```text
src/
  layouts/
    BlogLayout.astro
  pages/
    index.astro               # Main blog index (/)
    page/
      [page].astro            # Pagination (/page/2)
    blog/
      [slug].astro            # /blog/[slug]
    tags/
      index.astro             # /tags
      [tag].astro             # /tags/[tag]
  content/
    posts/
      2025-11-16-astro-intro.md
      2025-11-20-tag-system.md
      ...
  content/config.ts           # Content collection schema
```

---

## 11. Acceptance Checklist

* [ ] `/` loads successfully with:

  * [ ] Featured posts section (if any).
  * [ ] Paginated list of posts.
* [ ] `/blog/[slug]` renders each individual post.
* [ ] `/tags` shows all tags with counts.
* [ ] `/tags/[tag]` filters posts correctly.
* [ ] Tags are clickable everywhere.
* [ ] Draft posts never appear in production.
* [ ] Pagination is correct and stable.
