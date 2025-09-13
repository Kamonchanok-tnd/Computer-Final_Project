import { test, expect } from '@playwright/test';

test('จัดการเพลย์ลิสต์สมาธิ', async ({ page }) => {
  // ไปที่หน้าเพลย์ลิสต์สมาธิ
  await page.goto('http://localhost:5173/audiohome/meditation');

  // เข้าไปที่เพลย์ลิสต์ "สมาธิ4"
  const playlist = page.getByText('สมาธิ', { exact: true });
  await expect(playlist).toBeVisible();
  await playlist.click();
  await page.waitForTimeout(1000);

  // // คลิกปุ่มแก้ไขชื่อเพลย์ลิสต์
  const editButton = page.locator('button:has(svg.lucide-pen-line)').first();
  await expect(editButton).toBeVisible();
  await editButton.click();
  await page.waitForTimeout(1000);

  // แก้ไขชื่อเพลย์ลิสต์
  const nameInput = page.locator('input[type="text"]');
  await expect(nameInput).toBeVisible({ timeout: 5000 });
  await nameInput.fill('สมาธิ4');
  await nameInput.press('Enter');
  await page.waitForTimeout(1000);

  // รอข้อความแจ้งเตือน
  const nameToast = page.getByText('เปลี่ยนชื่อเพลย์ลิสต์แล้ว');
  await expect(nameToast).toBeVisible();

  // ถ่าย screenshot ของข้อความแจ้งเตือน
  await page.screenshot({ path: 'toast-change-name.png', fullPage: true });;
  await page.waitForTimeout(1000);

  // -------------------------
  // เปลี่ยนพื้นหลังเพลย์ลิสต์
  // -------------------------
  await page.locator('.dark\\:text-text-dark.dark\\:hover\\:bg-midnight-blue').click(); 
  await page.getByText('ป่าไม้ร่มรื่น').first().click();
  await page.waitForTimeout(1000);

  // กดยืนยัน
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  await page.waitForTimeout(1000);

  // รอข้อความยืนยัน
  const bgToast = page.getByText('เปลี่ยนพื้นหลังเพลย์ลิสต์แล้ว');
  await expect(bgToast).toBeVisible({ timeout: 10000 });

  // ถ่าย screenshot ของข้อความแจ้งเตือน
   await page.screenshot({ path: 'page-change-bg.png', fullPage: true });;
   await page.waitForTimeout(1000);

  // -------------------------
  // ลบเสียงออกจากเพลย์ลิสต์
  // -------------------------
  const soundRow = page.getByRole('row', { name: /สมาธิบำบัดแบบ SKT/ });
  await soundRow.getByRole('button').nth(1).click();
  await page.waitForTimeout(1000);
  await page.getByText('ลบ').click();
  await page.getByRole('button', { name: 'นำออก' }).click();
  await page.waitForTimeout(1000);

  // -------------------------
  // ลบเพลย์ลิสต์
  // -------------------------
  const deleteToast = page.getByText('ลบออกจากเพลย์ลิสต์แล้ว');
  await expect(deleteToast).toBeVisible();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'toast-delete.png', fullPage: true });
  await page.waitForTimeout(2000);
  
});
