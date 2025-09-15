import { test, expect } from '@playwright/test';
test.describe('Admin EditMessage — UAT', () => {
  test('แก้ไขข้อมูลบทความสำเร็จ"', async ({ page }) => {
 
  await page.goto('http://localhost:5173/admin/messagePage');
  await page.waitForTimeout(1000);
  await page.getByRole('row', { name: 'test' }).getByRole('button').first().click();
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
   
  // -------- อัปโหลดรูปจากไฟล์ในเครื่อง --------
    const filePath = String.raw`C:\Users\user\Pictures\Saved Pictures\รักตัวเอง-nologo.jpg`;
    await page.waitForTimeout(1000);

    // พยายามยิงใส่ input[type="file"] โดยตรง (แนะนำสุด)
    const fileInput = page.locator('.ant-upload input[type="file"], input[type="file"]').first();
    if (await fileInput.count()) {
      await fileInput.setInputFiles(filePath);
    } else {
      // Fallback: ถ้าหา input ไม่เจอ ให้ใช้ filechooser กับปุ่ม "เลือกไฟล์"
      const [fc] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'เลือกไฟล์' }).click(),
      ]);
      await fc.setFiles(filePath);
    }
    await page.waitForTimeout(1000);
    // ---------------------------------------------
  
  await page.locator('#date').fill('2025-09-12');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'บันทึกบทความ' }).click();
  await page.waitForTimeout(1000);

 
  });
});



