import { test, expect } from '@playwright/test';

test('visit audiohome as user', async ({ page }) => {
  await page.goto('http://localhost:5173/admin');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  await page.getByRole('link', { name: 'Sounds' }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
 
  
   
  await page.getByRole('button', { name: 'สร้าง' }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('textbox', { name: '* ชื่อ' }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('textbox', { name: '* ชื่อ' }).fill('ผ่อนคลาย');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.locator('#sound').getByRole('textbox').click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.locator('#sound').getByRole('textbox').fill('https://youtu.be/CxFAU6x9gso?si=IPaEZCYXZgV0H_UU');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.locator('.ant-select-selector').click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByText('สมาธิ').click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('textbox', { name: '* จัดทำโดย' }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('textbox', { name: '* จัดทำโดย' }).fill('');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('textbox', { name: '* จัดทำโดย' }).press('CapsLock');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('textbox', { name: '* จัดทำโดย' }).fill('pp');
  await page.waitForTimeout(1000); // ✅ delay 1 วิ
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.waitForTimeout(1000); // ✅ delay 1 วิ

  
//   const successMessage = page.locator('.ant-message-notice-content');
// await successMessage.waitFor({ state: 'visible', timeout: 10000 });
// await expect(successMessage).toContainText('เพิ่มข้อมูลสำเร็จ!');

// รอ message container ใด ๆ
await page.getByRole('button', { name: 'บันทึก' }).click();

const message = page.locator('.ant-message-notice-content');
await expect(message.first()).toHaveText('เพิ่มข้อมูลสำเร็จ!', { timeout: 5000 });

//   await page.getByText('เพิ่มข้อมูลสำเร็จ!').click();
//   await expect(page.locator('body')).toContainText('เพิ่มข้อมูลสำเร็จ!');
await page.waitForTimeout(1000); // ✅ delay 1 วิ. เพิ่มข้อมูลสำเร็จ!

});

