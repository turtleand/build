import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	reporter: [['list']],
	use: {
		baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://127.0.0.1:4321',
		headless: true,
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1 --port 4321',
		url: 'http://127.0.0.1:4321',
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
		timeout: 120 * 1000,
	},
});
