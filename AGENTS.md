# AGENTS.md — build

See `CLAUDE.md` for architecture, commands, and testing details.

## Scope

Applies only to `build/`.

## Ecosystem role

- Build is the engineering grounding layer of Turtleand.
- It preserves software-engineering credibility through implementation notes, practical patterns, and developer-facing explanations.
- It complements AI Lab and OpenClaw by covering lower-level engineering detail rather than curriculum or agent operations.

## Project summary

- Stack: Astro 5, multilingual (`en` at `/`, `es` at `/es/`)
- Status: Active
- Primary content: technical blog posts and implementation-oriented writing

## Workflow

1. Read `CLAUDE.md`, `README.md`, and nearby docs before larger structural changes.
2. Prefer edits under `src/`, `public/`, `scripts/`, and content collections.
3. Keep English and Spanish content/routing conventions aligned when the change affects both locales.
4. Do not hand-edit generated output in `dist/`, `test-results/`, or other build artifacts unless explicitly asked.

## Content guidance

- Favor precise, implementation-oriented writing over broad ecosystem philosophy.
- Keep the site anchored in software engineering craft, debugging, architecture, and concrete build patterns.
- When documenting versions, counts, or inventories, avoid hardcoding values that will quickly go stale. Prefer `package.json` and actual content directories as the source of truth.

## Cross-project boundaries

- Route curriculum-style AI learning work to `ai-lab/`.
- Route persistent-agent operations and automation infrastructure material to `openclaw/`.
- Route identity, portfolio, or ecosystem navigation work to `portal/`.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Test: `npm run test`
