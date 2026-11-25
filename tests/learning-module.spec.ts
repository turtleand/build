import { test, expect } from '@playwright/test';

const lessons = [
  {
    locale: 'en',
    home: '/',
    route: '/blog/2026-08-02-programs-processes-operating-system-execution/',
    title: 'The First Process of Our Python Web Server',
    search: 'web server',
    position: 'Part 1 of 12',
    series: 'Build a web server from scratch',
    map: 'See all 12 lessons',
    next: 'Next lesson',
    planned: 'Planned',
  },
  {
    locale: 'es',
    home: '/es/',
    route: '/es/blog/2026-08-02-programas-procesos-ejecucion-sistema-operativo/',
    title: 'El primer proceso de nuestro servidor web en Python',
    search: 'servidor web',
    position: 'Parte 1 de 12',
    series: 'Construye un servidor web desde cero',
    map: 'Ver las 12 lecciones',
    next: 'Siguiente lección',
    planned: 'Pendiente',
  },
];

test.describe('Web server series', () => {
  for (const lesson of lessons) {
    test(`finds the first installment and follows its roadmap in ${lesson.locale}`, async ({ page }) => {
      await page.goto(lesson.home);
      await page.getByRole('searchbox').fill(lesson.search);
      const results = page.locator('[data-search-grid]');
      await results.getByRole('link', { name: new RegExp(lesson.title) }).click();

      expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(lesson.route.slice(0, -1));
      await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
      await expect(page.locator('.post-body pre').filter({ hasText: 'PONG' }).first()).toBeVisible();
      await page.getByRole('link', { name: new RegExp(lesson.position) }).click();

      const series = page.locator('[data-learning-module]');
      await expect(series.getByRole('heading', { level: 2, name: lesson.series })).toBeInViewport();
      const roadmap = series.locator('details');
      await expect(roadmap).not.toHaveAttribute('open', '');
      await roadmap.locator('summary', { hasText: lesson.map }).click();
      await expect(roadmap).toHaveAttribute('open', '');

      const parts = roadmap.getByRole('listitem');
      await expect(parts).toHaveCount(12);
      await expect(parts.first()).toHaveAttribute('aria-current', 'step');
      await expect(parts.last()).toBeVisible();
      await expect(parts.filter({ hasText: lesson.planned }).getByRole('link')).toHaveCount(0);
      const neighbors = series.locator('.module-neighbors');
      await expect(neighbors).toContainText(lesson.next);
      await expect(neighbors.locator('a[rel="prev"]')).toHaveCount(0);
      if (await parts.nth(1).getByRole('link').count()) {
        const nextHref = await parts.nth(1).getByRole('link').getAttribute('href');
        await expect(neighbors.locator('a[rel="next"]')).toHaveAttribute('href', nextHref!);
      } else {
        await expect(parts.nth(1)).toContainText(lesson.planned);
        await expect(neighbors).toContainText(lesson.planned);
        await expect(neighbors.getByRole('link')).toHaveCount(0);
      }
    });
  }

  test('fits the expanded Spanish roadmap on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lessons[1].route);
    const roadmap = page.locator('[data-learning-module] details');
    await roadmap.locator('summary').click();
    await expect(roadmap.getByRole('listitem').last()).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);
  });

  test('keeps the reading frame on standalone articles', async ({ page }) => {
    await page.goto('/blog/2026-09-06-python-yield-one-next-at-a-time/');
    await expect(page.getByRole('heading', { level: 1, name: 'Python yield, One next() at a Time' })).toBeVisible();
    await expect(page.getByLabel('Reading frame')).toBeVisible();
    await expect(page.locator('[data-learning-module]')).toHaveCount(0);
  });
});
