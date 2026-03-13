import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3099',
    headless: true,
  },
  projects: [
    {
      name: 'api',
      testMatch: /api\.spec\.ts/,
    },
    {
      name: 'ui',
      testMatch: /ui\.spec\.ts/,
      use: { browserName: 'chromium' },
    },
  ],
});
