---
title: Research Notes display concepts
description: Three UI patterns for surfacing extended Research Notes content from a blog post.
lastUpdated: 2025-??-??
---

# Goal

When a reader clicks the “Research Notes” (a.k.a. DeepSeek) link on a post, surface the long-form content without forcing them to leave the current context. Below are three patterns tuned for the blog’s current Astro stack and component library.

## 1. Full-screen modal overlay

* **Trigger:** Use the existing “Research Notes companion post” link, but intercept it with a client-side click handler.
* **Behavior:** Open a modal overlay that fills ~90% of the viewport, with scrollable body content and persistent close/back controls.
* **Implementation notes:**
  * Lazy-load the Research Notes markdown via an API route/edge function and render inside the modal with the same Markdown component the blog already uses.
  * Trap focus within the modal for accessibility; ensure Escape closes it.
  * Persist the current scroll on the base page so the reader can close and resume exactly where they left off.
* **Pros:** Keeps the reader anchored to the original article; reinforces that the Research Notes is a supplemental layer.
* **Cons:** The modal can feel heavy on mobile; long-form content inside a modal needs careful typography to avoid “wall of text” vibes.

## 2. Slide-in “Research Drawer”

* **Trigger:** Clicking the Research Notes CTA opens a side drawer that slides from the right (desktop) or bottom (mobile).
* **Behavior:** Drawer covers ~40% width on desktop, 90% height on mobile, and displays the Research Notes article with its own scroll.
* **Implementation notes:**
  * Use CSS `dialog`/`<aside>` plus Astro islands to hydrate only the drawer component.
  * Provide a quick “pop out” link within the drawer for readers who prefer a dedicated page.
  * Remember to hide the underlying page from screen readers while the drawer is open (`aria-hidden`).
* **Pros:** Lighter weight than a full modal, visually conveys “peek at the research” while still seeing the main article.
* **Cons:** Limited width can make dense reference sections harder to read; requires responsive tweaks for tablets.

## 3. Inline expansion (“Research Section”)

* **Trigger:** Clicking the Research Notes link smoothly scrolls to an accordion-like section injected directly below the CTA.
* **Behavior:** The section expands in-place, renders the Research Notes markdown, and includes “Collapse” / “Open in new tab” controls.
* **Implementation notes:**
  * Preload the Research Notes content during build (both posts share a `translationKey`), so expanding only toggles visibility and avoids client fetches.
  * Use Astro’s conditional rendering or client-side island to mount/unmount the block, preserving SSR for SEO.
  * Consider a sticky “Back to summary” button once the section is open, since it can be several screens tall.
* **Pros:** Zero overlay, best continuity for long reads, fully compatible with server-rendered HTML for crawlers.
* **Cons:** Expanding adds a large chunk to the page, which could disrupt the main article’s visual flow if the reader isn’t expecting it.

---

**Recommendation:** Prototype the inline expansion first (concept 3) because it fits the content-heavy nature of Research Notes articles and keeps SSR. Use the modal or drawer when you need a stronger separation or want analytics on “engaged research mode” sessions. Each approach should share a single Research Notes data source so content stays in sync regardless of presentation.

## Current failure (why the inline expansion is still broken)

* The Research Notes link in the main post continues to navigate to the companion URL and returns 404 instead of expanding inline. That means the client-side interception isn’t firing for that anchor (likely because the rendered href doesn’t exactly match the string we’re watching, or the DOM is different when Markdown renders the link).
* The companion page exists (`2025-11-29-mocker-python/research-notes.md` with `slug: "2025-11-29-mocker-python-research-notes"`), so the 404 is a routing/refresh issue rather than missing content. The inline accordion depends on the pre-rendered research-notes entry; navigation shouldn’t happen at all.

## Plan to fix the inline accordion

1) Make the Research Notes CTA a button that never navigates: render a semantic button (or an `<a>` with `role="button"` and no href) that always calls the open/close logic; keep a separate “Open full post” anchor for new-tab use.
2) Normalize href matching and event binding: instead of matching a hard-coded href string, bind the toggle to a dedicated data attribute (e.g., `data-research-notes-trigger`) so Markdown link variations or basePath differences don’t break the handler.
3) Guard against stale builds/paths: ensure the research-notes slug is passed into PostPage (already done) and add a console warning if `researchNotesPost` is missing so we know to re-run `astro sync`/`dev`.
4) Add a regression test plan: manual checklist—load the main post, click the CTA (should expand), click “Open full post” (should open new tab), refresh page and repeat; verify no navigation when clicking the CTA.
5) Ship the fix: update PostPage to use the new trigger, remove the href from the inline CTA, and keep the “Open full post” link for external navigation.

## How the inline Research Notes now works (implemented behavior)

1. **Server setup**
   * `getStaticPaths` loads the main post plus its Research Notes companion via shared `translationKey`.
   * `PostPage` receives both entries and renders the companion markdown with `await researchNotesPost.render()`.
   * The inline block is rendered **after** the article content so it visually feels like a footnote.
2. **CTA & controls**
   * The “Open Research Notes” button is a pure `<button>` with `data-research-notes-toggle`; no href means no accidental navigation.
   * The “Open full post” link still points to `/blog/<research-notes-slug>` for new-tab reading.
   * Collapsing controls live inside the panel (`data-research-notes-collapse`, `data-research-notes-back`).
3. **Client script**
   * On DOM ready, script finds the section/panel/toggle by IDs derived from the post slug.
   * `syncLabel()` updates `aria-expanded` and button text when opened/closed.
   * `open()` unhides the panel, scrolls to it, and adds `.is-open`; `close()` hides it and scrolls back to the section header.
   * Any link marked with `data-research-notes-trigger` (e.g., Markdown CTA) calls `open()` instead of navigating.
4. **User flow**
   * Reader clicks “Open Research Notes” → panel expands in place with references.
   * “Open full post” opens the companion in a new tab if they prefer full-page reading.
   * At any time they can collapse or jump back to the summary via the sticky buttons.
