import { test, expect } from '@playwright/test';

test('visit audiohome', async ({ page, context }) => {
  // โหลด session
  await context.addCookies([{ name: 'dummy', value: 'dummy', domain: 'localhost', path: '/' }]); // ตัวอย่าง
  await page.goto('http://localhost:5173/chat/2');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'พูดคุยกัน' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'พิมพ์ข้อความของคุณ' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'พิมพ์ข้อความของคุณ' }).fill('ดีจ้า');
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'พิมพ์ข้อความของคุณ' }).press('Enter');
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'พิมพ์ข้อความของคุณ' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'พิมพ์ข้อความของคุณ' }).fill('วันนี้วันอะไร');
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'พิมพ์ข้อความของคุณ' }).press('Enter');
  await page.waitForTimeout(1000);
  // ตรวจสอบ title ให้ตรงกับจริง
  await expect(page).toHaveTitle(/SUT HEALJAI/);
});
