# AGENTS.md - build

See `CLAUDE.md` for architecture, commands, and testing details. This file gives repository-level guidance for Codex automatic PR reviews and other AI agents.

## Scope

Applies only to `build/`.

## Ecosystem role

- Build is the engineering craft and technical credibility layer of Turtleand.
- It preserves software-engineering seriousness through implementation notes, reproducible patterns, debugging practice, and developer-facing explanations.
- It complements AI Lab and OpenClaw by covering lower-level engineering detail rather than curriculum or agent operations.
- Route curriculum-style AI learning to `ai-lab/`, persistent-agent operations to `openclaw-lab/` or `hermes-lab/`, identity routing to `portal/`, compact doctrine to `handbook/`, and tool maps to `ai-atlas/`.

## Project summary

- Stack: Astro 5, multilingual (`en` at `/`, `es` at `/es/`)
- Status: Active
- Primary content: technical blog posts and implementation-oriented writing

## Workflow

1. Read `CLAUDE.md`, `README.md`, and nearby docs before larger structural changes.
2. Prefer edits under `src/`, `public/`, `scripts/`, and content collections.
3. Keep English and Spanish content and routing conventions aligned when the change affects both locales.
4. Do not hand-edit generated output in `dist/`, `test-results/`, or other build artifacts unless explicitly asked.

## Public-safety review

Reject changes that expose secrets, credentials, private infrastructure details, internal paths, specific vulnerabilities, or operational weaknesses. Safe public lessons are allowed when they describe general patterns, architecture trade-offs, defensive principles, or non-sensitive implementation choices.

Keep private things private. Share learnings, not exposure.

## Technical and content quality review

- Favor technical accuracy, reproducibility, and implementation detail.
- Separate facts, assumptions, inferences, and recommendations in technical writing.
- Check code examples, commands, package versions, generated LLM artifacts, and routes.
- Flag private implementation details, unsafe security specifics, untested claims, or copy that overstates certainty.
- Preserve Turtleand voice: calm, precise, direct, reflective when useful, practical when needed.
- Do not introduce em dashes in public writing.
- Keep humans responsible for direction, judgment, taste, ethics, and consequences.

## Repository integrity review

- Keep changes focused to the branch purpose.
- Keep English and Spanish conventions aligned when relevant.
- Do not silently modify generated or build output unless the repo explicitly tracks it or the change requires regeneration.
- Keep AI-readable artifacts such as `llms.txt`, `llms-full.txt`, sitemaps, indexes, translated routes, and generated discovery files in sync when the repo uses them.
- Run local validation before PR creation.

## PR review checklist

Codex and other agents should check:

- Does the change strengthen Build as an engineering credibility surface?
- Are technical claims grounded, reproducible, and non-hype?
- Is anything private, unsafe, or operationally sensitive exposed?
- Are commands, examples, routes, generated files, translations, and indexes still correct?
- Is the diff small, coherent, and free from unrelated cleanup?

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Test: `npm run test`
