// frontend/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',

  projects: [
    {
      name: 'superadmin-tests',
      testDir: './tests/superadmin',
      use: {
        baseURL: 'http://localhost:5173/',
        storageState: './storage/superadmin.json',    // ✅ เปลี่ยนกลับมาใช้ state ผู้ใช้จริง
        headless: false,
        screenshot: 'on',
        trace: 'on-first-retry',
        video: 'on-first-retry',
      },
    },
    {
      name: 'admin-tests',
      testDir: './tests/admin',
      use: {
        baseURL: 'http://localhost:5173/',
        storageState: './storage/admin.json',   // ✅ ใช้ session แอดมินจริง
        headless: false,
        screenshot: 'on',
        trace: 'on-first-retry',
        video: 'on-first-retry',
      },
    },
    {
      name: 'user-tests',
      testDir: './tests/user',
      use: {
        baseURL: 'http://localhost:5173/',
        storageState: './storage/user.json',    // ✅ เปลี่ยนกลับมาใช้ state ผู้ใช้จริง
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
        storageState: undefined,                // public ไม่ต้อง login
        headless: false,
        screenshot: 'on',
        trace: 'on-first-retry',
        video: 'on-first-retry',
      },
    },
  ],
});
