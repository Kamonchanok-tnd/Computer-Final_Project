import { test, expect } from '@playwright/test';

test('visit audiohome', async ({ page, context }) => {
  // โหลด session
  await context.addCookies([{ name: 'dummy', value: 'dummy', domain: 'localhost', path: '/' }]); // ตัวอย่าง
  await page.goto('http://localhost:5173/audiohome/chanting');
  await page.getByRole('button', { name: 'สร้าง' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('textbox', { name: 'เช่น เสียงผ่อนคลายก่อนนอน' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('textbox', { name: 'เช่น เสียงผ่อนคลายก่อนนอน' }).fill('สมาธิ');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.waitForTimeout(2000);
  await page.goto('http://localhost:5173/audiohome/chanting');
  await page.locator('div').filter({ hasText: /^เพลยลิสต์ของฉันสมาธิ$/ }).getByRole('button').nth(1).click();
  await page.waitForTimeout(2000);
  await page.getByText('ลบ').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'ลบ' }).click();

  // ตรวจสอบ title ให้ตรงกับจริง
  await expect(page).toHaveTitle(/SUT HEALJAI/);
});
