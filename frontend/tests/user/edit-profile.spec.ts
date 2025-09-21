// await page.getByRole('banner').locator('a').click();
//   await page.getByText('โปรไฟล์').click();
//   await page.getByRole('textbox', { name: '* วันเกิด' }).click();
//   await page.getByRole('textbox', { name: '* วันเกิด' }).fill('2002-09-09');
//   await page.getByText('ผู้หญิง').click();
//   await page.getByText('ชาย').click();
//   await page.getByRole('button', { name: 'save บันทึกข้อมูล' }).click();
//   await page.getByText('แก้ไขข้อมูลสำเร็จ').click();


import { test, expect } from '@playwright/test';

test('user edit profile', async ({ page }) => {
  // ไปที่หน้า user โดยตรง
  await page.goto('http://localhost:5173/user', { waitUntil: 'networkidle' });

  // คลิก banner -> profile
  await page.getByRole('banner').locator('a').click();
  await page.getByRole('menuitem', { name: 'โปรไฟล์' }).click();
  await page.waitForTimeout(1000); // รอโหลดหน้า profile

  // แก้ไขข้อมูล
  await page.getByRole('textbox', { name: '* วันเกิด' }).fill('2002-09-09');
  await page.getByRole('button', { name: 'save บันทึกข้อมูล' }).click();

  // ตรวจสอบข้อความสำเร็จ
  await expect(page.getByText('แก้ไขข้อมูลสำเร็จ')).toBeVisible({ timeout: 5000 });

  // รอให้ข้อความแสดงสักพัก (ป้องกันหายก่อน)
  await page.waitForTimeout(2000);
});
