import { test, expect ,chromium} from '@playwright/test';
(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:5173/');

  // ---------------------
  await context.close();
  await browser.close();
})();