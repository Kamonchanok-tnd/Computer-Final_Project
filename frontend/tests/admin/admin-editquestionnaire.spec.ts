import { test, expect } from '@playwright/test';

test.describe('Admin EditQuestionnaire — UAT', () => {
  test('เเก้ไขเเบบทดสอบ"', async ({ page }) => {
    
    // ไปหน้า Admin EditQuestionnaire
    await page.goto('http://localhost:5173/admin/questionnairePage');
    await page.waitForTimeout(1000);

    await page.getByRole('row', { name: 'test' }).getByRole('button').first().click();
    await page.waitForTimeout(1000);
    await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').click();
    await page.waitForTimeout(1000);
    await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').fill('testx');
     await page.waitForTimeout(1000);
    await page.getByText('test').click();
     await page.waitForTimeout(1000);
    await page.getByText('test').fill('testx');
     await page.waitForTimeout(1000);
    

    // ================== อัปโหลดรูปจากไฟล์ในเครื่อง (แก้ตรงนี้) ==================
    const filePath = String.raw`C:\Users\user\Pictures\Saved Pictures\IMG_2791.webp`;
    await page.waitForTimeout(1000);

    // 1) ยิงใส่ input[type="file"] โดยตรง (เช่นของ AntD)
    const fileInput = page.locator('.ant-upload input[type="file"], input[type="file"]').first();
    if (await fileInput.count()) {
      await fileInput.setInputFiles(filePath);
      await page.waitForTimeout(1000);
    } else {
      // 2) Fallback: ใช้ filechooser กับปุ่ม "เลือกไฟล์"
      const [fc] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'เลือกไฟล์' }).click(),
      ]);
      await fc.setFiles(filePath);
      await page.waitForTimeout(1000);
    }

    await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();
    await page.waitForTimeout(1000);

  });
});





