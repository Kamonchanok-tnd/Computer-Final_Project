import { test, expect } from '@playwright/test';

test.describe('User View Message — UAT', () => {
  test('กดอ่าน บทความ และเลื่อนขึ้นลงได้', async ({ page, context }) => {
    // cookie ตัวอย่าง
    await context.addCookies([{ name: 'dummy', value: 'dummy', domain: 'localhost', path: '/' }]);

    await page.goto('http://localhost:5173/audiohome', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'พื้นที่ผ่อนคลาย' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'ดูกิจกรรม' }).nth(1).click();
    await page.waitForTimeout(2000);

    // เปิดบทความ (คง selector เดิมของคุณ)
    await page
      .getByRole('button', {
        name:
          'อนุญาตให้ตัวเองอ่อนแอได้บ้าง เพราะนั่นคือธรรมชาติของมนุษย์ ไม่มีอ้างอิง • วันนี้',
      })
      .getByRole('button')
      .nth(2)
      .click();
      await page.waitForTimeout(2000);

    // รอให้ modal แสดงก่อน
    const modal = page.locator('div[role="dialog"]');
    await page.waitForTimeout(2000);
    await expect(modal).toBeVisible();
    await page.waitForTimeout(2000);

    // หา container ที่เลื่อนจริง ๆ (รองรับทั้ง class tailwind และเคส fallback)
    const scroller = modal
      .locator('.h-full.overflow-y-auto, .ant-modal-body :is(.overflow-y-auto, [data-scrollable])')
      .first();
    await expect(scroller).toBeVisible();
    await page.waitForTimeout(2000);

    // ตรวจว่ามีความยาวให้เลื่อน
    const canScroll = await scroller.evaluate((el: HTMLElement) => el.scrollHeight > el.clientHeight);
    expect(canScroll, 'บทความต้องยาวพอให้เลื่อน').toBeTruthy();
    await page.waitForTimeout(2000);

    // เลื่อนด้วยการ set scrollTop (ใส่ชนิด HTMLElement ให้ TS ไม่แดง)
    await scroller.evaluate((el: HTMLElement) => { el.scrollTop = 0; });
    await scroller.evaluate((el: HTMLElement) => { el.scrollTop = el.scrollHeight; });
    await scroller.evaluate((el: HTMLElement) => { el.scrollTop = 0; });
    

    // สำรอง: เลียนแบบผู้ใช้ด้วยเมาส์ wheel (บาง layout ต้อง hover ก่อน)
    await scroller.hover();
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, -1200)
    await page.waitForTimeout(2000);;

    // ปิดบทความ
    await page.getByRole('button', { name: 'Close' }).click()
    await page.waitForTimeout(2000);;

    // ตรวจ title
    await expect(page).toHaveTitle(/SUT HEALJAI/);
  });
});
