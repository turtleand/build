import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
	test('renders the featured hero, archive panel, and post cards', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { level: 1, name: 'From Refactor Tools to Change Plans' })).toBeVisible();
		await expect(page.getByRole('heading', { level: 2, name: 'Engineering notes for changing software with care.' })).toBeVisible();
		await expect(page.getByText('10 posts')).toBeVisible();
		const changeLoop = page.getByLabel('Change loop');
		await expect(changeLoop.getByText('Inspect')).toBeVisible();
		await expect(changeLoop.getByText('Change')).toBeVisible();
		await expect(changeLoop.getByText('Verify')).toBeVisible();

		const postCards = page.locator('[data-post-grid] .post-card');
		await expect(postCards.first()).toBeVisible();
		expect(await postCards.count()).toBeGreaterThan(0);
		await expect(postCards.first().locator('.tags span').first()).toBeVisible();
	});

	test('navigates from a card to the article and into tag detail', async ({ page }) => {
		await page.goto('/');

		const firstCard = page.locator('[data-post-grid] .post-card').first();
		const postTitle = (await firstCard.locator('h3').textContent())?.trim() ?? '';
		expect(postTitle.length).toBeGreaterThan(0);

		await firstCard.click();
		await expect(page).toHaveURL(/\/blog\//);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(postTitle);

		const postTagLink = page.locator('.tags a').first();
		const tagLabel = (await postTagLink.textContent())?.trim() ?? '';
		expect(tagLabel.length).toBeGreaterThan(0);

		await postTagLink.click();
		await expect(page).toHaveURL(/\/tags\//);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(tagLabel);

		const tagPostCards = page.locator('.post-card');
		await expect(tagPostCards.first()).toBeVisible();
		expect(await tagPostCards.count()).toBeGreaterThan(0);
	});

		test('filters posts via search keywords without affecting the archive grid', async ({ page }) => {
			await page.goto('/');

			const allPostsGrid = page.locator('[data-post-grid] .post-card');
			const initialAllPostCount = await allPostsGrid.count();
			expect(initialAllPostCount).toBeGreaterThan(0);

			const searchInput = page.getByPlaceholder('Search titles, tags, or body text');
			await searchInput.fill('python');

			const resultsGrid = page.locator('[data-search-grid] .post-card');
			await expect(resultsGrid.first()).toBeVisible();
			const resultCount = await resultsGrid.count();
			expect(resultCount).toBeGreaterThanOrEqual(3);
			await expect(page.getByRole('heading', { level: 3, name: 'Spying Without Replacing with mocker.spy' })).toBeVisible();
			await expect(page.getByRole('heading', { level: 3, name: 'Dependency Injection' })).toBeVisible();
			await expect(page.getByRole('button', { name: 'Clear search' })).toBeVisible();
			await expect(page.locator('[data-search-count]')).toContainText('Found');
			await expect(page.locator('[data-pagination]')).toHaveCount(0);
			expect(await allPostsGrid.count()).toBe(initialAllPostCount);

			await searchInput.fill('asdf');
			await expect(page.locator('[data-search-grid] .post-card')).toHaveCount(0);
			await expect(page.getByText('No posts match your search.')).toBeVisible();
			expect(await allPostsGrid.count()).toBe(initialAllPostCount);
		});

	test('keeps the featured post out of the first archive grid when the first page fits', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('[data-search-count]')).toContainText('Found 10 results');
		await expect(page.locator('[data-pagination]')).toHaveCount(0);
		const archiveTitles = page.locator('[data-post-grid] h3');
		expect(await archiveTitles.count()).toBe(9);
		await expect(archiveTitles.filter({ hasText: 'From Refactor Tools to Change Plans' })).toHaveCount(0);
		await expect(archiveTitles.first()).toHaveText('Dependabot Is an Update Scout');
	});
});
