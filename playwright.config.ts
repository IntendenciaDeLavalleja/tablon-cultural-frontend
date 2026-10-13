import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', workers: 1, fullyParallel: false, timeout: 90000,
  expect: { timeout: 10000 }, retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8088', reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /public\.spec\.ts/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: /public\.spec\.ts/ },
  ],
});
