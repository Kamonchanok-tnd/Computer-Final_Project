import { test, expect, Page } from '@playwright/test';

async function waitForToast(page: Page, patterns: RegExp[], timeout = 4000) {
  const toast = page.locator('.ant-message-notice-content');
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const txt = (await toast.allTextContents()).join(' ');
    if (txt) {
      for (const p of patterns) if (p.test(txt)) return true;
    }
    await page.waitForTimeout(150);
  }
  return false;
}

test.describe('Admin Prompt — Delete existing', () => {
  test('เปิด "พร้อมพ์ทั้งหมด" → ลบ prompt ใบแรก → สำเร็จ (ไม่ต้องสร้างใหม่)', async ({ page }) => {
    // 1) ไปหน้า Admin Prompt
    await page.goto('http://localhost:5173/admin/prompt');
    await expect(page).toHaveURL(/\/admin\/prompt$/);

    // 2) เปิด "พร้อมพ์ทั้งหมด"
    await page.getByRole('button', { name: 'พร้อมพ์ทั้งหมด' }).click();

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();
    const body = modal.locator('.ant-modal-body');

    // เคลียร์ช่องค้นหา (กันกรองค้าง) แล้วรอสปินเนอร์ (ถ้ามี)
    const search = body.getByPlaceholder('ค้นหาโดยชื่อ/ข้อความในพร้อมพ์…');
    if (await search.isVisible().catch(() => false)) {
      await search.fill('');
      await search.press('Enter').catch(() => {});
    }
    await body.locator('.ant-spin-spinning').waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});

    // ฟังก์ชันคืน locator ของปุ่มลบภายในโมดัล
    const deleteBtns = () =>
      body.locator('button:has(.anticon-delete), .ant-btn:has(.anticon-delete)');

    let countBefore = await deleteBtns().count();

    // ถ้ายังไม่มี ลองสลับสวิตช์ "กำลังใช้งาน" เผื่อฟิลเตอร์บัง
    if (countBefore === 0) {
      const activeSwitch = body.locator('.ant-switch');
      if (await activeSwitch.first().isVisible().catch(() => false)) {
        await activeSwitch.first().click();
        await body.locator('.ant-spin-spinning').waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
        countBefore = await deleteBtns().count();
      }
    }

    expect(countBefore, 'ไม่พบรายการ Prompt ให้ลบ').toBeGreaterThan(0);

    // 3) ลบใบทันที (กดปุ่มถังขยะ)
    await deleteBtns().first().click();

    // 3.1) ถ้ามี Popconfirm → กดยืนยัน
    const confirmPrimary = page.locator('.ant-popconfirm-buttons .ant-btn-primary');
    if (await confirmPrimary.isVisible({ timeout: 800 }).catch(() => false)) {
      await confirmPrimary.click();
    }

    // 4) รอผลลบ: toast หรือนับจำนวนปุ่มลบลดลง 1
    await waitForToast(page, [/ลบ.*สำเร็จ/i, /ลบข้อมูล.*สำเร็จ/i, /deleted?/i, /removed?/i], 5000)
      .catch(() => {});
    await expect(deleteBtns()).toHaveCount(countBefore - 1, { timeout: 5000 });

    // 5) ปิดโมดัล + เก็บภาพ
    await page.keyboard.press('Escape');
    await page.screenshot({
      path: `test-artifacts/uat-delete-existing-${Date.now()}.png`,
      fullPage: true,
    });
  });
});
