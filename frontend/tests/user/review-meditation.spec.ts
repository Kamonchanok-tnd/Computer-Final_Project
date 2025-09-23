
import { test, expect } from '@playwright/test';

test('visit audiohome as user', async ({ page }) => {
  await page.goto('/audiohome');
  await expect(page).toHaveTitle(/SUT HEALJAI/);

  await page.goto('http://localhost:5173/audiohome/meditation');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  await page.getByRole('button', { name: 'พื้นที่ผ่อนคลาย' }).click();
  await page.waitForTimeout(1000);

  await page.locator('div')
    .filter({ hasText: /^สมาธิบำบัดและฝึกลมหายใจหายใจเข้า\.\.\. แล้วปล่อยความเครียดออกไปดูกิจกรรม$/ })
    .getByRole('button')
    .click();
  await page.waitForTimeout(1000);

  await page.locator('.lucide.lucide-heart').first().click();
  await page.waitForTimeout(1000);

  await page.locator('.lucide.lucide-play').first().click();
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'รีวิวบทสวด' }).click();
  await page.waitForTimeout(1000);

  await page.locator('.flex.items-center.space-x-1 > button:nth-child(3)').click();
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'ส่งคะแนน' }).click();

  const successMessage = page.locator('.ant-message-notice-content');
  await expect(successMessage).toHaveText('ให้คะแนน "สมาธิบำบัดแบบ SKT ท่าที่ 1-2" 3 ดาว');

  await page.waitForTimeout(1000);

  // await page.goto('http://localhost:5173/audiohome/meditation/play/1');
  // await page.waitForTimeout(2000); // หน่วงยาวหน่อยตอนเปลี่ยนหน้า.  
});


