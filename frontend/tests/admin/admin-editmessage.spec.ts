
// import { test, expect } from '@playwright/test';

// test.describe('Admin EditMessage — UAT', () => {
//   test('เเก้ไขข้อมูลบทความ → เห็น toast เเก้ไขบทความสำเร็จ!"', async ({ page }) => {
//     await page.goto('http://localhost:5173/admin/editMessagePage');
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).fill('test1');
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).fill('test1');
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).fill('test1');
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: 'เลือกไฟล์' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: 'เลือกไฟล์' }).setInputFiles('รักตัวเอง-nologo.jpg');
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'วันที่เผยแพร่ *' }).fill('2025-09-08');
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: 'บันทึกบทความ' }).click();
//     await page.waitForTimeout(1000);

//   });
// });


import { test, expect } from '@playwright/test';
test.describe('Admin EditMessage — UAT', () => {
  test('เเก้ไขข้อมูลบทความไม่สำเร็จ → บันทึกบทความไม่สำเร็จ!"', async ({ page }) => {
    // กันเวลาให้พอ
    test.setTimeout(180_000);
    page.setDefaultTimeout(60_000);
    page.setDefaultNavigationTimeout(60_000);

    // await page.goto('http://localhost:5173/admin/editMessagePage');
    // await page.waitForTimeout(1000);

    // await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).click();
    // await page.waitForTimeout(1000);
    // await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).fill('test1');
    // await page.waitForTimeout(1000);

    // await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).click();
    // await page.waitForTimeout(1000);
    // await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).fill('test1');
    // await page.waitForTimeout(1000);

    // await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).click();
    // await page.waitForTimeout(1000);
    // await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).fill('test1');
    // await page.waitForTimeout(1000);

    // // ============== อัปโหลดรูปจากไฟล์ในเครื่อง ==============
    // // แก้ path ให้ตรงกับเครื่องคุณ (แนะนำใช้ absolute path แบบด้านล่าง)
    // const filePath = String.raw`C:\Users\user\Pictures\Saved Pictures\131694421.jpg`;
    // await page.waitForTimeout(1000);

    // // 1) พยายามยิงใส่ input[type=file] โดยตรง (เช่นของ AntD)
    // const fileInput = page.locator('.ant-upload input[type="file"], input[type="file"]').first();
    // if (await fileInput.count()) {
    //   await fileInput.setInputFiles(filePath);
    //   await page.waitForTimeout(1000);
    // } else {
    //   // 2) Fallback: ใช้ filechooser กับปุ่ม "เลือกไฟล์"
    //   const [fc] = await Promise.all([
    //     page.waitForEvent('filechooser'),
    //     page.getByRole('button', { name: 'เลือกไฟล์' }).click(),
    //   ]);
    //   await fc.setFiles(filePath);
    //   await page.waitForTimeout(1000);
    // }
    // // (ออปชัน) ถ้ามีตัวพรีวิวไฟล์ ใช้อันนี้ตรวจแบบหลวม ๆ
    // // await expect(page.locator('.ant-upload-list-item, img[alt="preview"]')).toBeVisible({ timeout: 10000 });
    // // =========================================================

    // await page.getByRole('textbox', { name: 'วันที่เผยแพร่ *' }).click();
    // await page.waitForTimeout(1000);
    // await page.getByRole('textbox', { name: 'วันที่เผยแพร่ *' }).fill('2025-09-08');
    // await page.waitForTimeout(1000);
    // // บาง DatePicker ต้องกด Enter เพื่อ commit
    // await page.getByRole('textbox', { name: 'วันที่เผยแพร่ *' }).press('Enter');
    // await page.waitForTimeout(1000);

    // await page.getByRole('button', { name: 'บันทึกบทความ' }).click();
    // await page.waitForTimeout(1000);


  //    await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).click();
  // await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).fill('test');
  // await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).click();
  // await page.getByRole('textbox', { name: 'ผู้เขียน/อ้างอิง/แหล่งที่มา *' }).fill('test');
  // await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).click();
  // await page.getByRole('textbox', { name: 'เนื้อหาบทความ *' }).fill('test');
  // await page.getByRole('button', { name: 'บันทึกบทความ' }).click();
  // await page.getByText('บันทึกการแก้ไขข้อมูลบทความสำเร็จ!').click();




  await page.goto('http://localhost:5173/admin/messagePage');
  await page.waitForTimeout(1000);
  await page.getByRole('row', { name: 'คุณมีคุณค่า3' }).getByRole('button').first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'ชื่อบทความ *' }).fill('คุณมีคุณค่า4');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'บันทึกบทความ' }).click();
  await page.waitForTimeout(2000);
  await page.getByText('บันทึกการแก้ไขข้อมูลบทความสำเร็จ!').click();
  

  });
});
