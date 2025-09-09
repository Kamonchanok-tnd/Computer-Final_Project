// frontend/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',

  projects: [
    {
      name: 'admin-tests',
      testDir: './tests/admin',
      use: {
        baseURL: 'http://localhost:5173/',
        storageState: './storage/admin.json',
        headless: false,
        screenshot: 'on',              // 📸 ถ่ายทุกเทสต์
        trace: 'on-first-retry',
        video: 'on-first-retry',       // 🎥 (เสริม) บันทึกวิดีโอเมื่อ retry
      },
    },
    {
      name: 'user-tests',
      testDir: './tests/user',
      use: {
        baseURL: 'http://localhost:5173/',
        storageState: './storage/user.json',
        headless: false,
        screenshot: 'on',
        trace: 'on-first-retry',
        video: 'on-first-retry',
      },
    },
    {
      name: 'public-tests',
      testDir: './tests/public',
      use: {
        baseURL: 'http://localhost:5173/',
        storageState: undefined,
        headless: false,
        screenshot: 'on',
        trace: 'on-first-retry',
        video: 'on-first-retry',
      },
    },
  ],
});
