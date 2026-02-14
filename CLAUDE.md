# CLAUDE.md — Turtleand Build

## Project overview

Astro multilingual tech blog (English + Spanish). Static site with content collections, tag system, pagination, and client-side search via Fuse.js.

## Commands

```bash
npm run dev        # Start dev server (port 4321) + snippet-sync watcher
npm run build      # Sync snippets + production build
npm run preview    # Preview production build
npm run test       # Playwright E2E tests (auto-starts dev server)
```

## Architecture

### Content collections (`src/content/config.ts`)

Two collections:
- **posts** — Markdown articles with frontmatter schema (title, description, date, tags, featured, draft, slug, image, locale, translationKey, isResearchNotes)
- **i18n** — JSON translation dictionaries (`src/content/i18n/en.json`, `es.json`)

### i18n routing

English is the default locale (root `/`). Spanish lives under `/es/`. Pages are duplicated per locale:

```
src/pages/index.astro          → /
src/pages/es/index.astro       → /es/
src/pages/blog/[slug].astro    → /blog/:slug
src/pages/es/blog/[slug].astro → /es/blog/:slug
src/pages/tags/...             → /tags/, /tags/:tag
src/pages/es/tags/...          → /es/tags/, /es/tags/:tag
src/pages/page/[page].astro    → /page/:n  (pagination)
src/pages/es/page/[page].astro → /es/page/:n
```

### Key utilities

- **`src/utils/i18n.ts`** — `Locale` type (`'en' | 'es'`), `createTranslator()`, `getDictionary()`, `otherLocale()`, `formatDateForLocale()`
- **`src/utils/blog.ts`** — `filterPublished()`, `filterByLocale()`, `sortPosts()`, `getPostSlug()`, `paginatePosts()`, `buildTagSummaries()`, `findTranslationForLocale()`

### Custom scripts

- **`scripts/remark-code-import.mjs`** — Remark plugin: replaces `` ```lang file=path ``` `` code blocks with actual file contents at build time. Configured in `astro.config.mjs`.
- **`scripts/snippet-sync.mjs`** — Watches snippet source files and updates a `<!-- snippet-hash: ... -->` comment in the article markdown to trigger rebuilds when external code changes.

### Layout & components

- `src/layouts/BlogLayout.astro` — Main blog post layout
- `src/components/PostCard.astro` — Post card component

## Content conventions

### Post naming

Posts live in `src/content/posts/`. Two patterns:
1. **Single file:** `YYYY-MM-DD-slug.md` (en) / `YYYY-MM-DD-slug-es.md` (es)
2. **Directory:** `YYYY-MM-DD-slug/index.md` (en) / `index.es.md` (es) — used when the post has associated files (code snippets, images)

Research notes use: `research-notes.md` / `research-notes.es.md` inside the post directory with `isResearchNotes: true`.

### Frontmatter

Required fields: `title`, `description`, `date`, `locale`

Translations are linked via matching `translationKey` values across locales. The `slug` field explicitly sets the URL path segment.

### Code snippets from external files

Use the remark-code-import syntax in markdown:

````
```python file=./snippets/example.py
```
````

The plugin injects the file contents at build time.

## Testing

Playwright E2E tests in `tests/`. Config in `playwright.config.ts`. Tests auto-start the dev server on `127.0.0.1:4321`.

```bash
npm test                    # Run all tests
npx playwright test --ui    # Interactive UI mode
```

## Agent-Friendly PR Checklist
Every content PR must:
- [ ] Post frontmatter complete: title, description, date, tags, locale
- [ ] Description is meaningful (agents use it to decide relevance)
- [ ] Build succeeds (llms.txt and llms-full.txt auto-generated)
- [ ] JSON-LD Article schema auto-included via PostPage template
- [ ] Author always "Turtleand" (pseudonymous, no real name, no LinkedIn)

## Bot Translation Layer
- `/llms.txt` — Auto-generated at build time listing all English posts
- `/llms-full.txt` — Auto-generated, all English post content concatenated
- `/_headers` — Content Signals
- JSON-LD Article in every post page

## Auto-Generation
`scripts/generate-llms.mjs` runs before every build:
- Reads `src/content/posts/**/*.md` (English, non-draft, non-research-notes only)
- Generates `public/llms.txt` (index) and `public/llms-full.txt` (full content)
- No manual updating needed — just add posts normally

## Agent-Friendly PR Checklist
Every content PR must:
- [ ] Post frontmatter complete: title, description, date, locale, tags
- [ ] Description is meaningful (agents use it to decide relevance)
- [ ] Build succeeds (llms.txt and llms-full.txt auto-generated)
- [ ] JSON-LD Article schema auto-included via layout
- [ ] Author always "Turtleand" (pseudonymous, no real name, no LinkedIn)

## Bot Translation Layer
- `/llms.txt` — Auto-generated at build time listing all posts
- `/llms-full.txt` — Auto-generated, all post content concatenated
- `/_headers` — Content Signals (ai-train=yes, search=yes, ai-input=yes)
- JSON-LD Article schema in blog post layout
- Auto-generation: `scripts/generate-llms.mjs` runs before `astro build`
