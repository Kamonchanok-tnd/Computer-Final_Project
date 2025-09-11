import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/signup');
  await page.waitForTimeout(1500);

  await page.getByRole('button', { name: 'ยอมรับ', exact: true }).click();
  await page.waitForTimeout(2000);

  await page.getByRole('textbox', { name: '* ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: '* ชื่อผู้ใช้งาน' }).fill('opern');
  await page.waitForTimeout(1000);

  await page.getByRole('textbox', { name: '* อีเมล' }).click();
  await page.getByRole('textbox', { name: '* อีเมล' }).fill('b6526435@g.sut.ac.th');
  await page.waitForTimeout(1000);

  await page.getByRole('textbox', { name: '* รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: '* รหัสผ่าน' }).fill('Suphutsorn&2546');
  await page.waitForTimeout(1000);

  await page.getByRole('img', { name: 'eye-invisible' }).locator('path').first().click();
  await page.waitForTimeout(1000);

  await page.locator('.ant-picker-input').click();
  await page.getByTitle('-09-09').locator('div').click();
  await page.waitForTimeout(1000);

  await page.getByRole('combobox', { name: '* เพศ' }).click();
  await page.getByTitle('หญิง').locator('div').click();
  await page.waitForTimeout(1000);

  await page.getByRole('textbox', { name: '* เบอร์โทรศัพท์' }).click();
  await page.getByRole('textbox', { name: '* เบอร์โทรศัพท์' }).fill('0652560639');
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
  await page.waitForTimeout(1000);

  // รอ message แสดงขึ้นมา
//   await expect(page.locator('.ant-message')).toContainText('ลงทะเบียนสำเร็จ!', { timeout: 5000 });

const successMessage = page.locator('.ant-message-notice-content');
await expect(successMessage).toHaveText('ลงทะเบียนสำเร็จ!');

await page.waitForTimeout(1000);

});
