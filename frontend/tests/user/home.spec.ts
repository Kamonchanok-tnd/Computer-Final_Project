// import { chromium } from 'playwright';

// (async () => {
//   const browser = await chromium.launch({ headless: false });
//   const context = await browser.newContext({
//     storageState: 'user.json'  // โหลด session
//   });
//   const page = await context.newPage();
//   await page.goto('http://localhost:5173/audiohome/meditation');
//   await page.getByRole('button', { name: 'พื้นที่ผ่อนคลาย' }).click();
//   await page.locator('div').filter({ hasText: /^ทำสมาธิและฝึกลมหายใจหายใจเข้า\.\.\. แล้วปล่อยความเครียดออกไปดูกิจกรรม$/ }).getByRole('button').click();
//   await page.locator('.lucide.lucide-heart').first().click();
//   await page.locator('.lucide.lucide-play').first().click();
//   await page.getByRole('button', { name: 'รีวิวบทสวด' }).click();
//   await page.locator('.flex.items-center.space-x-1 > button:nth-child(3)').click();
//   await page.getByRole('button', { name: 'ส่งคะแนน' }).click();
//   await page.locator('.p-4').click();
//   await page.goto('http://localhost:5173/audiohome/meditation/play/1');
// })();


import { test, expect } from '@playwright/test';

test('visit audiohome', async ({ page, context }) => {
  // โหลด session
  await context.addCookies([{ name: 'dummy', value: 'dummy', domain: 'localhost', path: '/' }]); // ตัวอย่าง
  await page.goto('http://localhost:5173/audiohome');

  // ตรวจสอบ title ให้ตรงกับจริง
  await expect(page).toHaveTitle(/SUT HEALJAI/);
});
