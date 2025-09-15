// tests/admin-prompt.edit-existing-screenshot.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Prompt — แก้ไขของเดิม + เก็บภาพ toast สำเร็จ', () => {
  test('เลือก prompt เดิม → แก้ไข → บันทึกการแก้ไข → รอ toast → ถ่ายภาพ', async ({ page }) => {
    // ชะลอจังหวะดูทัน (ปรับได้ด้วย env UAT_SLOW_MS; ดีฟอลต์ 400ms)
    const SLOW = Number(process.env.UAT_SLOW_MS || 400);
    const nap = () => page.waitForTimeout(SLOW);

    // 1) ไปหน้า Admin Prompt
    await page.goto('http://localhost:5173/admin/prompt');
    await expect(page).toHaveURL(/\/admin\/prompt$/);
    await nap();

    // 2) เปิด "พร้อมพ์ทั้งหมด" (เป็นปุ่มข้อความตรงตัว)
    await page.getByRole('button', { name: 'พร้อมพ์ทั้งหมด' }).click();  // :contentReference[oaicite:0]{index=0}
    await expect(page.getByPlaceholder('ค้นหาโดยชื่อ/ข้อความในพร้อมพ์…')).toBeVisible(); // :contentReference[oaicite:1]{index=1}
    await nap();

    // 3) เลือกการ์ดใบแรก แล้วกด "แก้ไข"
    const firstCard = page.locator('div.ant-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.locator('button:has([aria-label="edit"])').click();   // ปุ่มไอคอน EditOutlined :contentReference[oaicite:2]{index=2}
    await nap();

    // (ปิดโมดัลรายการ เพื่อโฟกัสฟอร์มข้างหลัง)
    await page.keyboard.press('Escape');
    await nap();

    // 4) ฟอร์มถูก prefill → แก้นิดหน่อย
    const nameInput = page.getByPlaceholder('ใส่ชื่อพร้อมพ์');            // :contentReference[oaicite:3]{index=3}
    await expect(nameInput).toBeVisible();
    const currentName = await nameInput.inputValue();
    await nameInput.fill(`${currentName} (แก้ไข)`);

    const objectiveArea = page.getByLabel(/วัตถุประสงค์/);                // :contentReference[oaicite:4]{index=4}
    await objectiveArea.click();
    await page.keyboard.press('Control+A');
    await objectiveArea.type('อัปเดตวัตถุประสงค์สำหรับ UAT');

    await nap();

    // 5) กด "บันทึกการแก้ไข" แล้วรอ toast ข้อความ "แก้ไข Prompt สำเร็จ"
    await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();   // :contentReference[oaicite:5]{index=5}
    const toast = page.locator('.ant-message-notice-content');
    await expect(toast).toContainText('แก้ไข Prompt สำเร็จ', { timeout: 5000 }); // :contentReference[oaicite:6]{index=6}
    await nap();

    // 6) เก็บภาพสุดท้ายตอน toast แสดงอยู่ (ไม่ทำ action อื่นอีก)
    await page.screenshot({ path: 'test-results/prompt-edit-success-full.png', fullPage: true });
    await toast.screenshot({ path: 'test-results/prompt-edit-success-toast.png' });
  });
});
