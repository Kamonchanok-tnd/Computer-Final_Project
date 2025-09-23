import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'อีเมล' }).click();
  await page.getByRole('textbox', { name: 'อีเมล' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('admin123');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

  const successMessage = page.locator('.ant-message-notice-content');
await expect(successMessage).toHaveText('เข้าสู่ระบบสำเร็จ', { timeout: 5000 });
});