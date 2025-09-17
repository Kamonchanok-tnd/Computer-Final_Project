import { test, expect } from '@playwright/test';
test.describe('User Like/Unlike Message — UAT', () => {
test('Like/Unlike บทความ', async ({ page, context }) => {
  
  await context.addCookies([{ name: 'dummy', value: 'dummy', domain: 'localhost', path: '/' }]); // ตัวอย่าง
  
  await page.goto('http://localhost:5173/audiohome');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'พื้นที่ผ่อนคลาย' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'ดูกิจกรรม' }).nth(1).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'บางครั้ง…เรากดดันตัวเองเหลือเกินว่าต้องเก่ง ต้องสำเร็จ ต้องผ่านมันไปให้ได้เร็วที' }).getByLabel('ถูกใจ').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'บางครั้ง…เรากดดันตัวเองเหลือเกินว่าต้องเก่ง ต้องสำเร็จ ต้องผ่านมันไปให้ได้เร็วที' }).getByLabel('ถูกใจ').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'บางครั้ง…เรากดดันตัวเองเหลือเกินว่าต้องเก่ง ต้องสำเร็จ ต้องผ่านมันไปให้ได้เร็วที' }).getByLabel('ถูกใจ').click();
  await page.waitForTimeout(2000);

  // ตรวจสอบ title ให้ตรงกับจริง
  await expect(page).toHaveTitle(/SUT HEALJAI/);
  });
});