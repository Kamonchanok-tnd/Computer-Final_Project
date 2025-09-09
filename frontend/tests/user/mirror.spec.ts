// frontend/tests/user/mirror.spec.ts
import { test, expect } from '@playwright/test';

test.describe('MirrorPage — UAT (real backend)', () => {
  // ใช้ session จาก storage/user.json (ตั้งใน project user-tests แล้ว)
  test('เขียนบันทึกและเลือกอารมณ์สำเร็จ', async ({ page }) => {
    await page.goto('/audiohome/mirror');

    // ยืนยันหน้าโหลดสำเร็จ (ต้องเห็นหัวข้อ)
    await expect(page.getByRole('heading', { name: /วันนี้เป็นไงบ้าง/i })).toBeVisible();

    // เลือกวันที่วันนี้ ถ้ามี UI ให้เลือก (ไม่บังคับ)
    const dateBtn = page.getByRole('button', { name: /เลือกวันที่|วันที่/i });
    if (await dateBtn.isVisible().catch(() => false)) {
      await dateBtn.click();
      const today = page.getByRole('button', { name: /วันนี้|today/i });
      if (await today.isVisible().catch(() => false)) await today.click();
    }

    // กล่องกระจก (contentEditable role="textbox")
    const mirrorBox = page.getByRole('textbox');
    await mirrorBox.click();
    const text = 'วันนี้อากาศดีมาก กำลังทำ UAT Test';
    await mirrorBox.fill(text);

    // รอแถบอีโมจิขึ้น (ดึงจาก backend จริง)
    const emojiList = page.locator('ul'); // ปรับให้ตรง DOM ได้หากจำเป็น
    await emojiList.waitFor({ state: 'visible', timeout: 10000 });

    const firstEmotionBtn = emojiList.locator('button').first();
    await firstEmotionBtn.waitFor({ state: 'visible', timeout: 10000 });
    await firstEmotionBtn.click();

    // ตรวจผลบนหน้า
    await expect(mirrorBox).toContainText(text);
    await expect(firstEmotionBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
