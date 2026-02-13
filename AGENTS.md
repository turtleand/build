# AGENTS.md — build

See `CLAUDE.md` for architecture, commands, and conventions.

## Documentation guidelines

Avoid hardcoding exact version numbers or counts in instruction files (CLAUDE.md, AGENTS.md). These go stale as dependencies upgrade and content grows. Refer to `package.json` for current versions and to `src/content/posts/` for the actual post list.
