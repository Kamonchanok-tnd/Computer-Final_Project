// tests/admin/sound-edit.spec.ts
import { test, expect } from '@playwright/test';

test('admin edit sound and see success message', async ({ page }) => {
  // ไปที่หน้า admin/sounds โดยตรง
  await page.goto('http://localhost:5173/admin/sounds');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  // คลิกปุ่มแก้ไขแถวแรก (ตัวอย่าง row)
  await page.getByRole('row', { name: /ผ่อนคลาย/ }).getByRole('button').nth(1).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  // เคลียร์แล้วใส่ชื่อใหม่
  const nameInput = page.getByRole('textbox', { name: '* ชื่อ' });
  await nameInput.fill('');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await nameInput.fill('ปล่อยใจไปตามลม');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  // บันทึก
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  // ✅ ตรวจสอบว่ามีข้อความสำเร็จขึ้นมา
  const message = page.getByText('แก้ไขข้อมูลสําเร็จ!');
  await expect(message).toBeVisible({ timeout: 5000 });

  // รอให้ข้อความแสดงสักพัก (ป้องกันหายก่อน)
  await page.waitForTimeout(2000);
});
