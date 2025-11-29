## Testing

End-to-end coverage uses Playwright to exercise the main blog home, tags index, and tag detail flows.

- `npm run test` / `npm run test:e2e` — Starts `astro dev`, runs the browser checks, and shuts down automatically.

If Playwright browsers are missing, run `npx playwright install` once before executing the tests.
