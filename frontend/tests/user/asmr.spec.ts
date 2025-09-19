import { test } from '@playwright/test';

test('visit asmr', async ({ page }) => {

    await page.goto('http://localhost:5173/audiohome/asmr');
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('button', { name: 'พื้นที่ผ่อนคลาย' }).click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.locator('div').filter({ hasText: /^ASMRฟังเสียงกระซิบหรือเสียงเบา ๆ ให้ใจสงบดูกิจกรรม$/ }).getByRole('button').click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('button', { name: 'Backgrounds' }).click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('img', { name: 'Cockpit View Airplane' }).click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('main').getByRole('button').nth(4).click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('button', { name: 'Sounds' }).click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.locator('.p-2.md\\:p-2\\.5').first().click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('button', { name: 'Pause' }).click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.locator('.absolute.top-4').click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('button', { name: 'Timer' }).click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('button', { name: 'เริ่ม' }).click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.locator('.absolute.top-4').click();
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

});