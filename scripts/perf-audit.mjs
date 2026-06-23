import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.PERF_BASE_URL || 'http://127.0.0.1:5184';
const outFile = process.env.PERF_OUT || 'test-results/perf-audit.json';
const routes = (process.env.PERF_ROUTES || '/,/es/,/blog/2026-06-21-ec2-disk-swap-resilience/,/tags/,/tags/python/')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);

const searchQueries = ['python', 'github', 'dependency', 'swapfile', 'asdf'];

async function routeSnapshot(page, route) {
  const consoleMessages = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => {
    consoleMessages.push({ type: 'pageerror', text: error.message });
  });

  const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle').catch(() => {});

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource').map((resource) => ({
      name: resource.name.replace(location.origin, ''),
      type: resource.initiatorType,
      transferSize: Math.round(resource.transferSize || 0),
      encodedBodySize: Math.round(resource.encodedBodySize || 0),
      duration: Math.round(resource.duration || 0),
    }));
    return {
      title: document.title,
      htmlBytes: new TextEncoder().encode(document.documentElement.outerHTML).length,
      domNodes: document.querySelectorAll('*').length,
      nav: nav
        ? {
            domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
            loadMs: Math.round(nav.loadEventEnd),
            transferSize: Math.round(nav.transferSize || 0),
            encodedBodySize: Math.round(nav.encodedBodySize || 0),
            durationMs: Math.round(nav.duration || 0),
          }
        : null,
      resources: resources.sort((a, b) => b.encodedBodySize - a.encodedBodySize).slice(0, 12),
      resourceCount: resources.length,
    };
  });

  const scroll = await page.evaluate(async () => {
    const startY = window.scrollY;
    const target = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const start = performance.now();
    window.scrollTo({ top: target, behavior: 'instant' });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const bottom = window.scrollY;
    window.scrollTo({ top: startY, behavior: 'instant' });
    return {
      scrollHeight: document.documentElement.scrollHeight,
      bottom,
      smokeMs: Number((performance.now() - start).toFixed(2)),
    };
  });

  let search = null;
  if (route === '/' || route === '/es/') {
    search = await page.evaluate(async (queries) => {
      const input = document.querySelector('[data-search-input]');
      if (!input) return { error: 'missing search input' };
      const waitForSearchSettle = async (query) => {
        const deadline = performance.now() + 2000;
        while (performance.now() < deadline) {
          await new Promise((resolve) => setTimeout(resolve, 0));
          const count = document.querySelector('[data-search-count]');
          const empty = document.querySelector('[data-search-empty]');
          if (
            (count && !count.hidden && count.dataset.searchQuery === query) ||
            (empty && !empty.hidden && empty.dataset.searchQuery === query)
          ) return;
        }
      };
      const timings = [];
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      for (const query of queries) {
        const start = performance.now();
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await waitForSearchSettle(query);
        timings.push({
          query,
          ms: Number((performance.now() - start).toFixed(2)),
          resultCount: document.querySelectorAll('[data-search-grid] .post-card').length,
          domNodes: document.querySelectorAll('*').length,
          engine: document.querySelector('[data-search-count]')?.dataset.searchEngine || null,
        });
      }
      return timings;
    }, searchQueries);
  }

  return {
    route,
    status: response?.status() ?? null,
    consoleMessages,
    ...metrics,
    search,
    scroll,
  };
}

async function main() {
  const browser = await chromium.launch();
  const results = [];
  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    try {
      results.push(await routeSnapshot(page, route));
    } finally {
      await page.close();
      await context.close();
    }
  }
  await browser.close();

  const payload = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    routes: results,
  };
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(payload, null, 2)}\n`);

  const summary = results.map((route) => ({
    route: route.route,
    status: route.status,
    htmlBytes: route.htmlBytes,
    domNodes: route.domNodes,
    resourceCount: route.resourceCount,
    dclMs: route.nav?.domContentLoadedMs ?? null,
    loadMs: route.nav?.loadMs ?? null,
    consoleMessages: route.consoleMessages.length,
    searchMs: Array.isArray(route.search) ? route.search.map((item) => `${item.query}:${item.ms}`).join(', ') : null,
  }));
  console.table(summary);
  console.log(`Wrote ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
