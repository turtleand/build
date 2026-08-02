import { test, expect } from '@playwright/test';

const englishRoute = '/blog/2026-08-02-programs-processes-operating-system-execution/';
const spanishRoute = '/es/blog/2026-08-02-programas-procesos-ejecucion-sistema-operativo/';

test.describe('Programs to HTTP learning module', () => {
  test('presents lesson one as part of the complete module', async ({ page }) => {
    await page.goto(englishRoute);

    await expect(page.getByRole('heading', { level: 1, name: 'Programs, Processes, and Operating-System Execution' })).toBeVisible();
    await expect(page.getByText('Build module · Lesson 1 of 12')).toBeVisible();
    await expect(page.getByLabel('Concept path')).toContainText('Program');

    const module = page.locator('[data-learning-module]');
    await expect(module).toBeVisible();
    await expect(module.getByRole('heading', { level: 2, name: 'From program to HTTP' })).toBeVisible();
    await expect(module.getByRole('progressbar', { name: 'Lesson 1 of 12' })).toHaveAttribute('aria-valuenow', '1');
    await expect(module.getByText('Execution foundations')).toBeVisible();
    await expect(module.getByText('Up next')).toBeVisible();
    await expect(module.getByText('02 · Inter-process communication')).toBeVisible();

    const map = module.locator('details');
    await expect(map).not.toHaveAttribute('open', '');
    await module.getByText('Explore the complete program').click();
    await expect(map).toHaveAttribute('open', '');
    await expect(module.locator('.lesson-list > li')).toHaveCount(12);
    await expect(module.locator('[aria-current="step"]')).toContainText('Programs, processes, and the OS');
    await expect(module.locator('.lesson-list > li').last()).toContainText('The complete request lifecycle');
  });

  test('keeps the module hierarchy in Spanish', async ({ page }) => {
    await page.goto(spanishRoute);

    await expect(page.getByText('Módulo Build · Lección 1 de 12')).toBeVisible();
    const module = page.locator('[data-learning-module]');
    await expect(module.getByRole('heading', { level: 2, name: 'Del programa a HTTP' })).toBeVisible();
    await expect(module.getByText('A continuación')).toBeVisible();
    await expect(module.getByText('02 · Comunicación entre procesos')).toBeVisible();
  });

  test('does not overflow a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(englishRoute);
    await page.getByText('Explore the complete program').click();

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);
    await expect(page.locator('[data-learning-module]')).toBeVisible();
  });
});
