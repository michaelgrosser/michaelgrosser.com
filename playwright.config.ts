import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // In CI: annotations inline on the PR, plus an HTML report the workflow keeps on failure.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && node scripts/serve-dist.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    // Always start fresh. Reusing a server left over from an earlier build silently
    // tests stale output, which can hide a break as easily as invent one.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
