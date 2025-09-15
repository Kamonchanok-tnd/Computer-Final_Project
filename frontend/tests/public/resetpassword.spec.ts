
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'ลืมรหัสผ่าน?' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).fill('user@example.com');
  await page.getByRole('button', { name: 'ส่งรหัสยืนยัน' }).click();
  await page.getByText('ส่งรหัสยืนยันไปที่อีเมลของคุณแล้ว').click();
  await page.locator('#uuid-input-0').click();
  await page.locator('#uuid-input-0').fill('6');
  await page.locator('#uuid-input-1').fill('7');
  await page.locator('#uuid-input-2').fill('4');
  await page.locator('#uuid-input-3').fill('2');
  await page.locator('#uuid-input-4').fill('4');
  await page.locator('#uuid-input-5').fill('8');
  await page.getByRole('button', { name: 'ยืนยันรหัส' }).click();
  await page.getByText('รหัสยืนยันถูกต้อง กรุณาตั้งรหัสผ่านใหม่').click();
  await page.getByRole('textbox', { name: 'รหัสผ่านใหม่', exact: true }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่านใหม่', exact: true }).fill('Suphutsorn&2546');
  await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่านใหม่' }).click();
  await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่านใหม่' }).fill('Suphutsorn&2546');
  await page.getByRole('button', { name: 'ตั้งรหัสผ่านใหม่' }).click();
  await page.locator('div').filter({ hasText: 'ตั้งรหัสผ่านใหม่สำเร็จ' }).nth(3).click();
  
});