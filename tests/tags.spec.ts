import { test, expect } from '@playwright/test';

test.describe('Tags index', () => {
	test('displays all tag summaries with counts and links', async ({ page }) => {
		await page.goto('/tags');

		await expect(page.getByRole('heading', { name: 'Tags' })).toBeVisible();
		const tagItems = page.locator('.tag-list li');
		await expect(tagItems.first()).toBeVisible();

		const firstTagLink = tagItems.first().locator('a');
		const tagLabel = (await firstTagLink.locator('span').first().textContent())?.trim() ?? '';
		const tagCount = (await firstTagLink.locator('.count').textContent())?.trim() ?? '';

		expect(tagLabel.length).toBeGreaterThan(0);
		expect(tagCount).toMatch(/\d/);

		await firstTagLink.click();
		await expect(page).toHaveURL(/\/tags\//);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(tagLabel);
	});
});
