// await page.goto('http://localhost:5173/admin/sounds');
//   await page.getByRole('img', { name: 'Profile' }).click();
//   await page.getByRole('link', { name: 'แก้ไขข้อมูลส่วนตัว' }).click();
//   await page.locator('input[name="phone_number"]').click();
//   await page.locator('input[name="phone_number"]').fill('');
//   await page.locator('input[name="phone_number"]').press('CapsLock');
//   await page.locator('input[name="phone_number"]').fill('0652560639');
//   await page.getByRole('spinbutton').click();
//   await page.getByRole('spinbutton').fill('50');
//   await page.getByRole('combobox').selectOption('หญิง');
//   await page.getByRole('button', { name: 'บันทึก' }).click();
//   await page.getByText('Admin updated successfully').click();


import { test, expect } from '@playwright/test';

test('admin edit profile', async ({ page }) => {
  // ไปที่หน้า admin/sounds โดยตรง
  await page.goto('http://localhost:5173/admin/sounds');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  await page.getByRole('img', { name: 'Profile' }).click();
  await page.getByRole('link', { name: 'แก้ไขข้อมูลส่วนตัว' }).click();
  await page.locator('input[name="phone_number"]').click();
  await page.locator('input[name="phone_number"]').fill('');
  await page.locator('input[name="phone_number"]').press('CapsLock');
  await page.locator('input[name="phone_number"]').fill('0652560639');
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('50');
  await page.getByRole('combobox').selectOption('หญิง');
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // ✅ ตรวจสอบว่ามีข้อความสำเร็จขึ้นมา
  const message = page.getByText('แก้ไขข้อมูลสําเร็จ!');
  await expect(message).toBeVisible({ timeout: 5000 });

  // รอให้ข้อความแสดงสักพัก (ป้องกันหายก่อน)
  await page.waitForTimeout(2000);
});
