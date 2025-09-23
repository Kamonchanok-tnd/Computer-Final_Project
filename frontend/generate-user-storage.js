import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE = 'http://localhost:5173';
const STORAGE_FILE = './storage/user.json';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // preload localStorage / cookies
  if (fs.existsSync(STORAGE_FILE)) {
    const storage = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
    if (storage.origins) {
      for (const origin of storage.origins) {
        if (origin.origin === BASE) {
          for (const item of origin.localStorage) {
            await context.addInitScript(([key, value]) => {
              localStorage.setItem(key, value);
            }, [item.name, item.value]);
          }
        }
      }
    }
  }

  const page = await context.newPage();

  // เปิดหน้า meditation
  await page.goto(`${BASE}/audiohome/meditation`);

  // console.log('✅ Browser พร้อม session! ใช้ Playwright Inspector สำหรับ codegen action');
})();
