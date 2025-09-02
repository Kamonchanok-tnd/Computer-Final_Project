import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',       // เก็บ test case ทั้งหมดในโฟลเดอร์ tests
  timeout: 30 * 1000,
  use: {
    headless: false,        // false = เห็น browser จริง เหมาะกับ UAT
    baseURL: 'http://localhost:5173/', // vite dev server ปกติรันที่ 5173
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
