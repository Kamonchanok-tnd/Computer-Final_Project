// await page.getByRole('link', { name: 'Sounds' }).click();
//   await page.getByRole('row', { name: '1 ปล่อยใจไปตามลม pp 0 0' }).getByRole('button').nth(2).click();
//   await page.getByRole('button', { name: 'ยืนยัน' }).click();
//   await page.getByText('ลบเสียง "ปล่อยใจไปตามลม" สำเร็จ').click();


// tests/admin/sound-edit.spec.ts
import { test, expect } from '@playwright/test';

test('admin delete sound', async ({ page }) => {
  // ไปที่หน้า admin/sounds โดยตรง
  await page.goto('http://localhost:5173/admin/sounds');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  await page.getByRole('link', { name: 'Sounds' }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('row', { name: '1 ปล่อยใจไปตามลม pp 0 0' }).getByRole('button').nth(2).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  const message = page.getByText('ลบเสียง "ปล่อยใจไปตามลม" สำเร็จ');
  await expect(message).toBeVisible({ timeout: 5000 });

  // รอให้ข้อความแสดงสักพัก (ป้องกันหายก่อน)
  await page.waitForTimeout(2000);
});
