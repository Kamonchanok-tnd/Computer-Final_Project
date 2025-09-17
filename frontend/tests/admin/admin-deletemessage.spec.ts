import { test, expect } from '@playwright/test';
test.describe('Admin DeleteMessage — UAT', () => {
  test('ลบบทความสำเร็จ!"', async ({ page }) => {
   
  await page.goto('http://localhost:5173/admin/messagePage');
  await page.waitForTimeout(1000);  
   await page.getByRole('row', { name: '9 testx testx บทความ How-to' }).getByRole('button').nth(1).click();
  await page.waitForTimeout(1000); 
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  await page.waitForTimeout(1000); 
  

  });
});

