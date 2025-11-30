# Article Folder Structure

Each blog article that needs extra assets now lives inside its own folder under `src/content/posts/`. Use the slug as the folder name so routing keeps working automatically.

```
src/content/posts/
  2025-11-29-mocker-python/
    index.md           # main article frontmatter + body
    research-notes.md  # inline Research Notes content (set isResearchNotes: true)
    sandbox/           # sample code, test fixtures, and other supporting files
```

## Adding a new article with Research Notes

1. **Create the folder**
   - Use the final slug you want in the URL, e.g. `2025-12-05-deep-dive/`.

2. **Add `index.md`**
   - Include the usual frontmatter (`title`, `description`, `date`, `tags`, etc.) plus `translationKey` if the post has companions.
   - Reference any local snippets with `file=./sandbox/<file>` so snippet-sync can hash them.

3. **Add `research-notes.md` (optional)**
   - Copy standard frontmatter, add `isResearchNotes: true`, and reuse the same `translationKey`.
   - Set a `slug` such as `"2025-12-05-deep-dive-research-notes"` so the inline panel and direct link both work.

4. **Populate `sandbox/`**
   - Drop demo scripts, fixtures, test outputs, etc. inside `sandbox/`. These files are not ignored by git and can be referenced from either markdown file.

5. **Wire up references**
   - In `index.md`, add the `dictionary` friendly link that points to the Research Notes (the system auto-detects via `translationKey`).
   - Use the inline component (already in `PostPage.astro`) to surface the Research Notes panel.

6. **Snippet hashing (optional but recommended)**
   - If you want the snippet watcher (`scripts/snippet-sync.mjs`) to cover the article, update the script’s `ARTICLE_PATH` to your article folder before running `npm run snippets:sync`.

Following these steps keeps the main article, Research Notes, and supporting code grouped in one location while avoiding `.gitignore` conflicts (the old `misc/` folder name was ignored). Whenever you need another article with attached notes, repeat the same pattern.
