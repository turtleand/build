import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
	test('renders featured and all posts sections with cards', async ({ page }) => {
		await page.goto('/');

		const featuredHeading = page.getByRole('heading', { name: 'Featured' });
		await expect(featuredHeading).toBeVisible();
		const featuredCards = page.locator('#featured .post-card');
		await expect(featuredCards.first()).toBeVisible();

		const featuredTag = featuredCards.first().locator('.tags span').first();
		await expect(featuredTag).toBeVisible();

		const allSection = page
			.locator('section')
			.filter({ has: page.getByRole('heading', { name: 'All posts' }) });
		const allPostCards = allSection.locator('.post-card');

		await expect(allPostCards.first()).toBeVisible();
		expect(await allPostCards.count()).toBeGreaterThan(0);
	});

	test('navigates from a card to the article and into tag detail', async ({ page }) => {
		await page.goto('/');

		const allSection = page
			.locator('section')
			.filter({ has: page.getByRole('heading', { name: 'All posts' }) });
		const firstCard = allSection.locator('.post-card').first();
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

		test('filters posts via search keywords without affecting the All posts grid', async ({ page }) => {
			await page.goto('/');

			const allPostsGrid = page.locator('[data-post-grid] .post-card');
			const initialAllPostCount = await allPostsGrid.count();
			expect(initialAllPostCount).toBeGreaterThan(0);

			const searchInput = page.getByPlaceholder('Search titles, tags, or body text');
			await searchInput.fill('pagination');

			const resultsGrid = page.locator('[data-search-grid] .post-card');
			await expect(resultsGrid.first()).toBeVisible();
			const resultCount = await resultsGrid.count();
			expect(resultCount).toBeGreaterThanOrEqual(2);
			await expect(page.getByRole('heading', { level: 3, name: 'Pagination Playbook' })).toBeVisible();
			await expect(page.getByRole('heading', { level: 3, name: 'Pagination Load Testing' })).toBeVisible();
			await expect(page.getByRole('button', { name: 'Clear search' })).toBeVisible();
			await expect(page.locator('[data-search-count]')).toContainText('Found');
			await expect(page.locator('[data-pagination]')).toBeVisible();
			expect(await allPostsGrid.count()).toBe(initialAllPostCount);

			await searchInput.fill('asdf');
			await expect(page.locator('[data-search-grid] .post-card')).toHaveCount(0);
			await expect(page.getByText('No posts match your search.')).toBeVisible();
			expect(await allPostsGrid.count()).toBe(initialAllPostCount);
		});

	test('shows more posts on the second page of pagination', async ({ page }) => {
		await page.goto('/');
		const nextLink = page.getByRole('link', { name: 'Next' });
		await expect(nextLink).toBeVisible();
		await nextLink.click();
		await expect(page).toHaveURL(/\/page\/2$/);
		await expect(page.getByText('Page 2 /')).toBeVisible();
		const pageCards = page.locator('.post-card');
		await expect(pageCards.first()).toBeVisible();
		expect(await pageCards.count()).toBeGreaterThan(0);
	});
});
