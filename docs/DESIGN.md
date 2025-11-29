# Build — Design Direction

Purpose: align the barebones Build blog with the polished Portal experience while keeping room for lighter reading-friendly surfaces. This plan covers brand usage, light/dark themes, UI structure, i18n, and four viable style alternatives.

## 1) Alignment With Portal
- Borrow typography: Playfair Display for headings, Inter for body (loaded once in the layout). Keep font weights 500–600 for headings, 400–500 for body.
- Base dark palette reference (from Portal): deep navy background, teal accent, off-white text, muted copy, card variants per domain. Reuse the animated radial gradient when choosing the dark-forward option.
- Motion: reuse the gentle hero wave and fade-up card stagger; respect the mobile static fallback already used in Portal.
- Navigation and footer density: match Portal’s spacing (large top padding, generous gutters) so cross-nav between portal/ and build/ feels intentional.

## 2) Brand Assets
- Logo: source from `public/logo.svg`; place in the header at 32–40px height, paired with the wordmark “Build” or “Turtleand Build”.
- Favicon: keep `public/favicon.svg` wired in the layout `<head>` for both themes.
- Social/OG: set monochrome SVG on light backgrounds; add a glow or outline on dark to maintain contrast.

## 3) Theming (Light + Dark)
- Theme toggle: add a header toggle with `prefers-color-scheme` detection and cookie/localStorage persistence mirroring Portal’s locale handling.
- Token sets (CSS variables in `:root` with `.theme-light` / `.theme-dark`):
  - Light: background `#f6f7fb`, surface `#ffffff`, text `#121622`, muted `#4b5563`, accent `#1f6feb`, accent-2 `#6fe1c3`, border `#e5e7eb`.
  - Dark: background `#0e1e2b`, surface `#0b1823`, text `#f4f4f4`, muted `#a8b3ba`, accent `#6fe1c3`, accent-2 `#2e8373`, border `#11283a`.
- Elevation: soft shadow on light (`0 10px 30px -18px #0b1823`), subtle outline on dark (1px border + outer glow with accent-2 at 12% opacity).
- Apply tokens to BlogLayout: body background/text, card surfaces, tag pills, pagination links, focus rings.

## 4) Layout & Components
- Header: left-aligned logo + product name; right-aligned nav (Home, Tags, About/Portal) plus language and theme controls. Sticky behavior past hero.
- Hero: two-line headline matching Portal’s tone (“Where builders and ideas ship together”); include a CTA cluster (View latest posts / Subscribe) and a gradient backdrop on dark or a soft vignette on light.
- Cards: convert PostCard to a portal-like surface (rounded `20px`, border + glow on hover, subtle translation). Keep metadata grouping (date, tags) consistent between languages.
- Grid behavior: single column mobile; 2-up small screens; 3-up at `lg` for light theme; 2-up with wider gutters for dark gradient to match Portal density.
- Pagination: capsule buttons with accent outlines; maintain focus-visible rings.
- Footer: mirror Portal spacing; include cross-links back to Portal quadrants and language switcher duplication.

## 5) i18n Plan (EN/ES)
- Mirror Portal’s approach: `src/content/i18n/en.json` and `src/content/i18n/es.json` plus `Locale` utilities (cookie name `lang`, fallback `en`). Expose `lang` query param and cookie persistence.
- UI copy keys: site title/description, nav labels, hero headline, CTA labels, pagination strings, footer text, tag labels (“Tags”, “Featured”, “All Posts”).
- Blog translations:
  - Store localized posts under `src/content/posts/en/` and `src/content/posts/es/`, or keep top-level files with `locale` and `translationKey` fields to pair EN/ES variants.
  - Add `translations: { es: 'slug-es', en: 'slug-en' }` in frontmatter to cross-link versions.
  - Filter collections by locale when generating pages; provide language switch per post that resolves via `translationKey`.
- Default routing: `/` uses locale resolution (param, cookie, fallback); include localized paths or query (`/blog/[slug]?lang=es`) consistently across index, tags, and pagination.

## 6) Four Style Alternatives for Build
1. Portal Parity (Dark Gradient): Deep navy base, teal/aqua accents, animated hero gradient, glowing cards borrowing Portal’s hover state. Best for full brand coherence.
2. [AI: use this one] Light Editorial: Off-white canvas, navy ink text, cobalt accents, faint paper texture behind hero. Cards use thin borders and subtle shadows; pairs well with long-form reading.
3. Blueprint Neon: Midnight background, electric blue primary, lime accent-2, dotted grid overlay in hero. Cards outlined with dashed borders that solidify on hover; evokes engineering schematics.
4. Minimal Monochrome: Warm gray background, charcoal text, single accent in teal. Very calm visuals; relies on spacing and typography rather than gradients, ideal if content-first is preferred.

## 7) Immediate Implementation Steps
- Add global theme tokens and toggle plumbing to `BlogLayout.astro`; update body class per theme.
- Replace system fonts with Playfair/Inter, wire logo.svg into the header, and mirror Portal spacing.
- Port Portal’s i18n utility + dictionaries scaffold; split or annotate posts for EN/ES; add language switcher to nav, hero, and post pages.
- Restyle PostCard, hero, and pagination to use the chosen theme variant; add hover/focus states consistent with Portal interactions.
