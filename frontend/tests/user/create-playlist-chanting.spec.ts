import { test, expect } from '@playwright/test';

test.describe('สร้างเพลลิสย์สวดมนต์', () => {
  test('สร้างเพลลิสย์สวดมนต์', async ({ page }) => {
    // เข้า sounds page
    await page.goto('http://localhost:5173/audiohome/chanting');

    // ----------------- สร้างเพลย์ลิสต์ -----------------
    await page.getByRole('button', { name: 'สร้าง' }).click();

    const playlistInput = page.getByRole('textbox', { name: 'เช่น เสียงผ่อนคลายก่อนนอน' });
    await playlistInput.fill('สวดมนต์');

    await page.getByRole('button', { name: 'บันทึก' }).click();

    const createSuccess = page.getByText('สร้างเพลย์ลิสต์สำเร็จ');
    await expect(createSuccess).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
  });
});