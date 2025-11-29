# Home Page Text Search — Top Implementation Paths

Search must surface any article whose body copy, frontmatter fields, or tag list contains the user’s query. Below are the three most practical approaches for the current Astro/Markdown stack, ordered from simplest to most scalable.

## 1. Build-Time Client Index (Lunr/Fuse)
- Generate a JSON index during `astro build` by traversing Markdown content, concatenating title + excerpt + body + tags.
- Ship the index with the home page bundle and wire up a lightweight client search (Lunr.js, Fuse.js, MiniSearch) to filter posts in memory.
- Works offline, avoids extra services, and is ideal for <~1k posts. Use field weighting to boost tag matches slightly and keep payload under ~300 KB by stripping HTML and truncating body text.

## 2. Hosted Search-as-a-Service (Algolia/Typesense Cloud)
- Push structured records (slug, title, summary, tags, raw text) to a hosted index during deployment using their REST API or GitHub Action.
- Use their instant-search widgets on the home page to get typo tolerance, ranking profiles, analytics, and synonyms “for free”.
- Costs money but scales effortlessly, supports highlighted tag matches, and keeps page bundles light because queries run over HTTPS to the service.

## 3. Self-Hosted Edge/Search API
- Store the article corpus (including tags) in a search-ready datastore (e.g., Meilisearch, Typesense self-hosted, or Postgres + Trigram) and expose a `/api/search` endpoint (Astro server route, Vercel Edge Function, etc.).
- Home page search box calls this endpoint; the server handles text normalization, stemming, and filtering before returning ranked hits with highlighted fields.
- Adds infra to maintain but gives full control over schema, ranking weights (e.g., tag exact match > body), auth, and future features like per-user personalization.

## Implementation Snapshot (Option 1)
- Astro now emits a JSON payload (`home-search-data`) at build time containing slug, metadata, tags, and stripped body text for every localized post.
- Fuse.js (shipped via `client:load` script on the home page) indexes those records with weighted keys so body matches and tag hits both count.
- The home page renders a dedicated **Search posts** section with its own grid that only shows results when a query is present, plus a separate **All posts** section that always shows the paginated slice.
- Because the two sections are independent, filtering never hides pagination and visitors can compare search hits with the standard list side-by-side.

### Suggested Fuse Configuration (and why)
- **Keys/weights:** Keep `title: 0.4`, `body: 0.3`, `description: 0.2`, `tags: 0.1`. Those weights align with how people scan posts (title first, tag hits as tiebreakers) and match what the UI highlights.
- **`threshold: 0.3`** remains a good baseline—it lets mildly fuzzy matches through without flooding the grid with noise.
- **`ignoreLocation: false`** (the Fuse default) should be used here. Leaving it `true` lets any two-character overlap (e.g., the `as` inside “asdf”) score as a match because distance penalties are skipped. Requiring location awareness forces the overall query to appear in roughly the same order as typed, which stops garbage strings from matching long bodies.
- **`minMatchCharLength: 4`** keeps accidental matches down by insisting on a longer contiguous hit before Fuse scores a document. This still allows short, real queries (“git”, “mac”) because the code path falls back to the default list unless the user types at least four characters.
- **UX implication:** With the two toggles above (`ignoreLocation: false`, `minMatchCharLength: 4`), nonsense queries like `asdf` yield the empty state as expected, but legitimate phrases ("git config", "mac ssh") continue to match thanks to the weighted fields. That balance avoids the confusing “everything matches anything” behavior we observed during manual testing.

### QA Rules & Test Cases
1. Keep at least a dozen obviously titled English posts ("Pagination Playbook", "Search Debugging Checklist", etc.) published so `/page/2` always exists and the search corpus remains predictable.
2. Typing `pagination` must surface the pagination-specific articles **inside the search results grid** while the "All posts" grid and its pagination stay unchanged.
3. Typing `asdf` (or other garbage) must empty the search grid, reveal the "No posts match" empty state, and reset the results when the query is cleared—again without affecting the All posts grid.

Automated coverage for the three behaviors above lives in `tests/home.spec.ts` under `filters posts via search keywords...` and `shows more posts on the second page...`. Those Playwright specs assert the happy path query, confirm the All posts list stays steady, validate the zero-results state, and exercise navigation to `/page/2`.

### Selection Notes
- Start with option 1 if the content set is small and static; migrate to 2 or 3 once bundle size or query performance becomes an issue.
- Regardless of path, normalize tags and body text the same way (lowercase, diacritics removed) so “UX” matches “ux” and tag hits behave like body hits.

## How Matching Works (and Why "email" Misses)
- When Astro builds the index it runs `stripMarkdown` (see `src/page-templates/IndexPage.astro`) which removes fenced code blocks, inline code, images, and Markdown syntax before storing the `body` string.
- Fuse.js receives each record with four weighted fields (title 0.4, description 0.2, body 0.3, tags 0.1), a `threshold` of 0.3, and `minMatchCharLength` of 4. Matches come from whatever plain text survives the stripping step.
- In `2025-11-23-configure-multiple-github-accounts-mac.md` the term “email” appears only inside the fenced code samples (e.g., `git config --global user.email`), so it is stripped out and never indexed.
- To make “email” searchable you can either mention it in the article body outside of code fences (“Set your git email via `git config --global user.email`”) or adjust `stripMarkdown`/indexing to keep code text (at the expense of a larger payload).
