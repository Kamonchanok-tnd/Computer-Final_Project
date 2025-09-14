import { test, expect } from '@playwright/test';

test.describe('Admin EditQuestion — UAT', () => {
  test('เเก้ไขข้อมูลเเบบทดสอบ → เห็น toast เเก้ไขเเบบทดสอบสำเร็จ!"', async ({ page }) => {

  await page.goto('http://http://localhost:5173/admin/editQuestionnaire');
  await page.waitForTimeout(1000);
  await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').click();
  await page.waitForTimeout(1000);
  await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').fill('test1');
  await page.waitForTimeout(1000);
  await page.getByText('test').click();
  await page.waitForTimeout(1000);
  await page.getByText('test').fill('test1');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '+' }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '−' }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '😊 เชิงบวก' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '😟 เชิงลบ' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'แบบคัดกรองโรคซึมเศร้า 2Q' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'แบบคัดกรองโรคซึมเศร้า 9Q' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '+' }).nth(1).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '−' }).nth(1).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '≥ มากกว่าหรือเท่ากับ' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '＜ น้อยกว่า' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'เลือกไฟล์' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'เลือกไฟล์' }).setInputFiles('รักตัวเอง-nologo.jpg');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();
  await page.waitForTimeout(1000);
  });
});





// import { test, expect } from '@playwright/test';

// test.describe('Admin EditQuestion — UAT', () => {
//   test('เเก้ไขข้อมูลเเบบทดสอบ → เห็น toast เเก้ไขเเบบทดสอบสำเร็จ!"', async ({ page }) => {
//     test.setTimeout(180_000);
//     page.setDefaultTimeout(60_000);
//     page.setDefaultNavigationTimeout(60_000);

//     await page.goto('http://localhost:5173/');
//     await page.waitForTimeout(1000);

//     await page.getByRole('textbox', { name: 'อีเมล' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'อีเมล' }).fill('admin@example.com');
//     await page.waitForTimeout(1000);

//     await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('admin123');
//     await page.waitForTimeout(1000);

//     await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
//     await page.waitForTimeout(1000);

//     await page.getByRole('link', { name: 'Questionnaire' }).click();
//     await page.waitForTimeout(1000);

//     // ไปหน้าแก้ไขของแถวที่ต้องการ
//     await page.getByRole('row', { name: '7 test1 test1 1 admin setting' }).getByRole('button').first().click();
//     await page.waitForTimeout(1000);

//     // ฟอร์มพื้นฐาน
//     await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').click();
//     await page.waitForTimeout(1000);
//     await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').fill('test');
//     await page.waitForTimeout(1000);

//     await page.getByText('test1').click();
//     await page.waitForTimeout(1000);
//     await page.getByText('test1').fill('test');
//     await page.waitForTimeout(1000);

//     await page.getByRole('button', { name: '+' }).first().click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '−' }).first().click();
//     await page.waitForTimeout(1000);

//     await page.getByRole('button', { name: '😟 เชิงลบ' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '😟 เชิงลบ เลือกอยู่' }).click();
//     await page.waitForTimeout(1000);

//     await page.getByRole('button', { name: 'แบบคัดกรองโรคซึมเศร้า 9Q' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: 'แบบคัดกรองโรคซึมเศร้า 2Q' }).click();
//     await page.waitForTimeout(1000);

//     await page.getByRole('button', { name: '+' }).nth(1).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '−' }).nth(1).click();
//     await page.waitForTimeout(1000);

//     await page.getByRole('button', { name: '＜ น้อยกว่า' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '≥ มากกว่าหรือเท่ากับ' }).click();
//     await page.waitForTimeout(1000);

//     // ============== อัปโหลดรูป (แก้ตรงนี้) ==============
//     const filePath = String.raw`C:\Users\user\Pictures\Saved Pictures\131694421.jpg`;
//     await page.waitForTimeout(1000);

//     // ยิงใส่ input[type=file] โดยตรงก่อน (รองรับ AntD)
//     const fileInput = page.locator('.ant-upload input[type="file"], input[type="file"]').first();
//     if (await fileInput.count()) {
//       await fileInput.setInputFiles(filePath);
//       await page.waitForTimeout(1000);
//     } else {
//       // Fallback: ใช้ filechooser กับปุ่ม "เลือกไฟล์"
//       const [fc] = await Promise.all([
//         page.waitForEvent('filechooser'),
//         page.getByRole('button', { name: 'เลือกไฟล์' }).click(),
//       ]);
//       await fc.setFiles(filePath);
//       await page.waitForTimeout(1000);
//     }
//     // (ออปชัน) ตรวจพรีวิวขึ้นแบบหลวม ๆ
//     // await expect(page.locator('.ant-upload-list-item, img[alt="preview"]')).toBeVisible({ timeout: 10000 });
//     // ===============================================

//     await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();
//     await page.waitForTimeout(1000);
//   });
// });


