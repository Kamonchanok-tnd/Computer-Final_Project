import { test, expect } from '@playwright/test';
test.describe('Admin EditMessage — UAT', () => {
  test('เเก้ไขบทความ"', async ({ page }) => {
   
  await page.goto('http://localhost:5173/admin/messagePage');
  await page.waitForTimeout(1000);  
  await page.getByRole('row', { name: '9 test test บทความ How-to' }).getByRole('button').first().click();
  await page.waitForTimeout(1000);  
  await page.getByRole('textbox', { name: 'ชื่อข้อความหรือบทความ *' }).click();
  await page.waitForTimeout(1000);  
  await page.getByRole('textbox', { name: 'ชื่อข้อความหรือบทความ *' }).fill('testx');
  await page.waitForTimeout(1000);  
  await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).click();
  await page.waitForTimeout(1000);  
  await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).fill('testx');
  await page.waitForTimeout(1000);  
  await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).click();
  await page.waitForTimeout(1000);  
  await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).fill('testx');
  await page.waitForTimeout(1000);  
  await page.getByRole('button', { name: 'บันทึกบทความ' }).click();
  await page.waitForTimeout(1000);
    
  });
});
