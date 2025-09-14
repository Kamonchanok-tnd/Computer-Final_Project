import { test, expect } from '@playwright/test';

test.describe('Admin CreateMessage — UAT', () => {
  test('สร้างข้อมูลบทความ → เห็น toast สร้างบทความสำเร็จ!"', async ({ page }) => {
    // กันหลุดเวลา
    test.setTimeout(120_000);

    await page.goto('http://localhost:5173/admin/createMessagePage');
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).fill('test');
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).fill('test');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'บทความ How-to' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: 'บทความการเงิน แชร์ความรู้ ข้อมูล เกี่ยวกับการเงิน' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).fill('test');
    await page.waitForTimeout(1000);

    // -------- อัปโหลดรูปจากไฟล์ในเครื่อง --------
    const filePath = String.raw`C:\Users\user\Pictures\Saved Pictures\131694421.jpg`;
    await page.waitForTimeout(1000);

    // พยายามยิงใส่ input[type="file"] โดยตรง (แนะนำสุด)
    const fileInput = page.locator('.ant-upload input[type="file"], input[type="file"]').first();
    if (await fileInput.count()) {
      await fileInput.setInputFiles(filePath);
    } else {
      // Fallback: ถ้าหา input ไม่เจอ ให้ใช้ filechooser กับปุ่ม "เลือกไฟล์"
      const [fc] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'เลือกไฟล์' }).click(),
      ]);
      await fc.setFiles(filePath);
    }
    await page.waitForTimeout(1000);
    // ---------------------------------------------

    await page.getByRole('textbox', { name: 'วันที่เผยแพร่ *' }).fill('2025-09-09');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'บันทึกบทความ' }).click();
    await page.waitForTimeout(1000);

    // (ออปชัน) ตรวจ URL/Toast ตามระบบของคุณ
    // await expect(page.locator('.ant-message-notice-content')).toHaveText(/สร้างบทความ.*สำเร็จ/i);
  });
});



