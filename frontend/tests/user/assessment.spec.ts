import { test, expect } from '@playwright/test';

test('assessment', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เริ่มทำแบบทดสอบ' }).nth(4).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เป็นบางครั้ง เป็นบางครั้ง' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เป็นบ่อยครั้ง เป็นบ่อยครั้ง' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เป็นน้อยมากหรือแทบไม่มี เป็นน้อยมากหรือแทบไม่มี' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เป็นประจำ เป็นประจำ' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'เป็นบางครั้ง เป็นบางครั้ง' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'กลับหน้าแรก' }).click();
    await page.waitForTimeout(1000);
});