import { test, expect } from '@playwright/test';
test.describe('Admin DeleteQuestionnaire — UAT', () => {
  test('ลบเเบบทดสอบ"', async ({ page }) => {
   
  await page.goto('http://localhost:5173/admin/questionnairePage');
  await page.waitForTimeout(1000);  
  
  await page.getByRole('row', { name: '6 testx testx 1 admin setting' }).getByRole('button').nth(2).click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'พิมพ์: ลบtestx' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'พิมพ์: ลบtestx' }).fill('ลบtestx');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  await page.waitForTimeout(1000);
    
  });
});
