import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  reporter: [['html', { open: 'never' }]],
  use: {
    headless: false,
    baseURL: 'http://localhost:5173/',
    screenshot: 'on',
    storageState: 'tests/auth.json',
  },
  globalSetup: './global-setup.ts', // <-- ใส่ path string
});
