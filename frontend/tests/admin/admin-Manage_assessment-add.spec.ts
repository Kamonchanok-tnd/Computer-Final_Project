import { test } from '@playwright/test';

test('admin-Manage_assessment_add', async ({ page }) => {

    await page.goto('http://localhost:5173/admin/manageTestOrder');
    await page.waitForTimeout(1000); // ✅ delay 1 วิ

    await page.getByRole('button', { name: 'เพิ่มแบบสอบถาม' }).nth(1).click();
    await page.waitForTimeout(1000);

    await page.getByRole('listitem').filter({ hasText: 'แบบคัดกรองโรคซึมเศร้า 9Q' }).getByRole('button').click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เพิ่มแบบสอบถาม' }).nth(2).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('listitem').filter({ hasText: 'แบบวัดระดับสติ (State' }).getByRole('button').click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เพิ่มแบบสอบถาม' }).nth(2).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('listitem').filter({ hasText: 'แบบวัดระดับความเครียด (ST-5)' }).getByRole('button').click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เพิ่มแบบสอบถาม' }).nth(2).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('listitem').filter({ hasText: 'แบบคัดกรองโรคซึมเศร้า 2Q' }).getByRole('button').click();
    await page.waitForTimeout(1000);
    
});