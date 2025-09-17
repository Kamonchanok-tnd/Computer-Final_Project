// await page.locator('div').filter({ hasText: /^เพลยลิสต์สมาธิของฉันสมาธิ4$/ }).getByRole('button').click();
//   await page.getByText('ลบ').click();
//   await page.getByRole('button', { name: 'ลบ' }).click();
//   await page.getByText('ลบเพลย์ลิสต์แล้ว').click();

import { test, expect } from '@playwright/test';

test('การลบเพลย์ลิสต์สมาธิ', async ({ page }) => {
  // ไปที่หน้าเพลย์ลิสต์สมาธิ
  await page.goto('http://localhost:5173/audiohome/meditation');

  await page.getByRole('button', { name: 'สร้าง' }).click();

    const playlistInput = page.getByRole('textbox', { name: 'เช่น เสียงผ่อนคลายก่อนนอน' });
    await playlistInput.fill('สมาธิ');

    await page.getByRole('button', { name: 'บันทึก' }).click();

    const createSuccess = page.getByText('สร้างเพลย์ลิสต์สำเร็จ!');
    await expect(createSuccess).toBeVisible({ timeout: 1000 });
    await page.waitForTimeout(1000);

    await page.locator('div').filter({ hasText: /^เพลยลิสต์สมาธิของฉันสมาธิ$/ }).getByRole('button').click();
    await page.waitForTimeout(1000);
    await page.getByText('ลบ').click();
    await page.getByRole('button', { name: 'ลบ' }).click();
    await page.waitForTimeout(1000);
    await page.getByText('ลบเพลย์ลิสต์แล้ว').click();
    await page.waitForTimeout(1000);
  
});
