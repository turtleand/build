# Font Style Recommendations for the Tech Blog

## Selection principles
- Prioritize open-source families with permissive licenses so they can ship with the site bundle.
- Balance a modern sans-serif for long-form reading with a monospace face that displays code clearly.
- Choose forms with distinctive glyphs (clear `l` vs `1`, `0` vs `O`) to reduce misreads in snippets.
- Keep the families versatile across light/dark syntax themes and multiple device resolutions.

## Recommended stack

### 1. Inter — UI, body copy, and long-form sections
- Designed for digital interfaces, so paragraphs remain readable on dense technical pages.
- Large x-height keeps inline code, API names, and acronym-heavy prose legible.
- Variable font availability makes weight transitions (400 → 600) smooth for emphasis callouts.

**Usage**

```css
:root {
  --font-body: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
}

body {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.65;
}
```

### 2. JetBrains Mono — Code snippets and inline tokens
- Built for developers: distinctive glyph shapes, extra-ligature support, and tuned spacing.
- Optimized hinting keeps multi-line code blocks sharp on both Retina and standard displays.
- Includes stylistic alternates (e.g., dotted zero) if we want different aesthetics later.

**Usage**

```css
:root {
  --font-code: "JetBrains Mono", "Fira Code", "Source Code Pro", monospace;
}

pre,
code {
  font-family: var(--font-code);
  font-size: 0.95rem;
  font-feature-settings: "liga" 0; /* disable ligatures unless specifically desired */
}
```

### 3. Space Grotesk — Headings, pull quotes, and hero text
- Geometric yet technical look pairs well with charts, diagrams, and call-to-action sections.
- Wider letterforms allow higher tracking for uppercase headings without losing readability.
- Works in tandem with Inter since both share rationalist proportions, keeping hierarchy cohesive.

**Usage**

```css
:root {
  --font-heading: "Space Grotesk", "IBM Plex Sans", "Inter", sans-serif;
}

h1,
h2,
h3,
.hero-title {
  font-family: var(--font-heading);
  letter-spacing: 0.01em;
  font-weight: 600;
}
```

## Implementation checklist
- Host fonts locally (WOFF2 first, WOFF fallback) and declare `font-display: swap` to avoid flashes.
- Provide fallbacks shown above so system fonts take over gracefully on limited environments.
- Set consistent vertical rhythm: align heading/body line-heights so code blocks do not collapse spacing.
- Test on both light and dark themes; adjust font weights if the dark palette requires lighter strokes.
