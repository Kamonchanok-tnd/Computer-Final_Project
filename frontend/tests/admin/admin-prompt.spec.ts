import { test, expect } from '@playwright/test';

test.describe('Admin Prompt — UAT', () => {
  test('สร้างพร้อมพ์ → เห็น toast สำเร็จ → เปิด "พร้อมพ์ทั้งหมด" → ใช้พร้อมพ์ → เห็น "กำลังใช้งาน"', async ({ page }) => {
    // 1) ไปหน้า Admin Prompt
    await page.goto('http://localhost:5173/admin/prompt');
    await expect(page).toHaveURL(/\/admin\/prompt$/);

    // 2) กรอกฟอร์ม (ต้องมี "ชื่อ" และ "วัตถุประสงค์")
    const uniq = `uat-${Date.now()}`;

    await page.getByPlaceholder('ใส่ชื่อพร้อมพ์').fill(`UAT ${uniq}`);

    // ระบุตำแหน่ง TextArea ด้วยการหา form item ที่มี label ตรงภาษาไทย แล้วเจาะลง textarea ข้างใน
    await page.locator('.ant-form-item:has-text("วัตถุประสงค์") textarea').fill('ทดสอบ UAT: วัตถุประสงค์ของบอท');
    // ฟิลด์อื่นๆ ไม่บังคับ แต่จะกรอกเพิ่มสัก 1–2 ช่องให้ครอบคลุม
    await page.locator('.ant-form-item:has-text("บุคลิกผู้ช่วย") textarea').fill('ใจดี สุภาพ ช่วยเหลือเต็มที่');

    // 3) กดบันทึก
    await page.getByRole('button', { name: 'บันทึกพร้อมพ์' }).click();

    // 4) ต้องเห็นข้อความสำเร็จจาก AntD message
    const createToast = page.locator('.ant-message-notice-content');
    await expect(createToast).toContainText('เพิ่ม Prompt สำเร็จ', { timeout: 5000 });

    // 5) เปิด "พร้อมพ์ทั้งหมด"
    await page.getByRole('button', { name: 'พร้อมพ์ทั้งหมด' }).click();

    // 6) ค้นหาชื่อที่เพิ่งสร้าง
    const searchBox = page.getByPlaceholder('ค้นหาโดยชื่อ/ข้อความในพร้อมพ์…');
    await searchBox.fill(`UAT ${uniq}`);

    // คาดว่าจะเห็นการ์ดของพร้อมพ์ที่เพิ่งสร้าง (มีชื่อแสดงบนหัวการ์ด)
    await expect(page.getByText(`UAT ${uniq}`)).toBeVisible();

    // 7) กดปุ่ม "ใช้" บนการ์ดนั้น (ปุ่มมีข้อความ "ใช้")
    // ใช้ hasText เพื่อผูกปุ่มกับการ์ดของชื่อที่กรองไว้
    const card = page.locator('div.ant-card').filter({ hasText: `UAT ${uniq}` });
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'ใช้' }).click();

    // 8) หลัง nowPrompt สำเร็จ รายการจะรีเฟรช → เห็น badge "กำลังใช้งาน"
    const activeBadge = card.getByText('กำลังใช้งาน', { exact: true });
    await expect(activeBadge).toBeVisible({ timeout: 5000 });

    // (เสริมความชัวร์) ปิดโมดัล
    await page.keyboard.press('Escape');
  });
});
