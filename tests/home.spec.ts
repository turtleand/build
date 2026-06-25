import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
	test('renders the featured hero, search bar, and post cards', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { level: 1, name: 'From Refactor Tools to Change Plans' })).toBeVisible();
		await expect(page.getByRole('searchbox', { name: 'Search posts' })).toBeVisible();
		await expect(page.getByPlaceholder('Search posts')).toBeVisible();
		await expect(page.getByText('Engineering notes for changing software with care.')).toHaveCount(0);
		await expect(page.locator('main').getByText('Inspect', { exact: true })).toHaveCount(0);

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
		await expect(page.getByText('Build note')).toBeVisible();
		await expect(page.getByLabel('Reading frame')).toContainText('Context');

		const postTagLink = page.locator('.tags a').first();
		const tagLabel = (await postTagLink.textContent())?.trim() ?? '';
		expect(tagLabel.length).toBeGreaterThan(0);

		await postTagLink.click();
		await expect(page).toHaveURL(/\/tags\//);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(tagLabel);
		await expect(page.getByText('Topic archive')).toBeVisible();

		const tagPostCards = page.locator('.post-card');
		await expect(tagPostCards.first()).toBeVisible();
		expect(await tagPostCards.count()).toBeGreaterThan(0);
	});

	test('orients the tags index as a Build topic map', async ({ page }) => {
		await page.goto('/tags/');

		await expect(page.getByText('Build map')).toBeVisible();
		await expect(page.getByRole('heading', { level: 1, name: 'Tags' })).toBeVisible();
		await expect(page.getByLabel('Cluster')).toContainText('Language');
		await expect(page.locator('.tag-list a').first()).toBeVisible();
	});

		test('filters posts via search keywords without affecting the archive grid', async ({ page }) => {
			await page.goto('/');

			const allPostsGrid = page.locator('[data-post-grid] .post-card');
			const initialAllPostCount = await allPostsGrid.count();
			expect(initialAllPostCount).toBeGreaterThan(0);

			const searchInput = page.getByPlaceholder('Search posts');
			await searchInput.fill('python');

			const resultsGrid = page.locator('[data-search-grid] .post-card');
			await expect(resultsGrid.first()).toBeVisible();
			const resultCount = await resultsGrid.count();
			expect(resultCount).toBeGreaterThanOrEqual(3);
			expect(await resultsGrid.first().locator('.card-link').evaluate((node) => getComputedStyle(node).display)).toBe('grid');
			expect(await resultsGrid.first().evaluate((node) => getComputedStyle(node).borderTopStyle)).toBe('solid');
			await expect(page.getByRole('heading', { level: 3, name: 'Spying Without Replacing with mocker.spy' })).toBeVisible();
			await expect(page.getByRole('heading', { level: 3, name: 'Dependency Injection' })).toBeVisible();
			await expect(page.getByRole('button', { name: 'Clear search' })).toBeVisible();
			await expect(page.locator('[data-search-count]')).toContainText('Found');
			await expect(page.locator('[data-pagination]')).toBeHidden();
			expect(await allPostsGrid.count()).toBe(initialAllPostCount);

			await searchInput.fill('asdf');
			await expect(page.locator('[data-search-grid] .post-card')).toHaveCount(0);
			await expect(page.getByText('No posts match your search.')).toBeVisible();
			expect(await allPostsGrid.count()).toBe(initialAllPostCount);

			await searchInput.fill('swapfile');
			await expect(page.getByRole('heading', { level: 3, name: 'EC2 Disk and Swap Resilience: Headroom Before Emergencies' })).toBeVisible();
			expect(await resultsGrid.count()).toBeGreaterThanOrEqual(1);
		});

	test('keeps the featured post out while showing pagination when the archive continues', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('[data-search-count]')).toBeHidden();
		await expect(page.locator('[data-pagination]')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Next' })).toBeVisible();
		const archiveTitles = page.locator('[data-post-grid] h3');
		expect(await archiveTitles.count()).toBe(9);
		await expect(archiveTitles.filter({ hasText: 'From Refactor Tools to Change Plans' })).toHaveCount(0);
		await expect(archiveTitles.first()).toHaveText('Git Worktrees Are Separate Desks');
	});
});
