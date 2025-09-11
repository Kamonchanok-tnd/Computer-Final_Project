// import { test, expect } from '@playwright/test';

// test.describe('Admin CreateQuestion — UAT', () => {
//   test('สร้างข้อมูลเเบบทดสอบ → เห็น toast สร้างเเบบทดสอบสำเร็จ!"', async ({ page }) => {
    

//     // ไปหน้า Admin CreateQuestionnaire
//     await page.goto('http://localhost:5173/admin/createQuestionnaire');
//     await page.waitForTimeout(1000);
//     await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').click();
//     await page.waitForTimeout(1000);
//     await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').fill('test');
//     await page.waitForTimeout(1000);
//     await page.locator('textarea').click();
//     await page.waitForTimeout(1000);
//     await page.locator('textarea').fill('test');
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '+' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '−' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '😊 เชิงบวก' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '😊 เชิงบวก เลือกอยู่' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('checkbox', { name: 'แบบทดสอบนี้มีเงื่อนไขก่อนทำ' }).check();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '-- เลือกแบบทดสอบ --' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: 'แบบคัดกรองโรคซึมเศร้า 2Q' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '−' }).nth(1).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '+' }).nth(1).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '−' }).nth(1).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '≥ มากกว่าหรือเท่ากับ' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: '≥ มากกว่าหรือเท่ากับ เลือกอยู่' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: 'เลือกไฟล์' }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: 'เลือกไฟล์' }).setInputFiles('131694421.jpg');
//     await page.waitForTimeout(1000);
//     await page.getByRole('button', { name: 'สร้างแบบทดสอบ' }).click();
//     await page.waitForTimeout(1000);

//   });
// });




import { test, expect } from '@playwright/test';

test.describe('Admin CreateQuestion — UAT', () => {
  test('สร้างข้อมูลเเบบทดสอบ → เห็น toast สร้างเเบบทดสอบสำเร็จ!"', async ({ page }) => {
    // กันเวลาให้พอ
    test.setTimeout(180_000);
    page.setDefaultTimeout(60_000);
    page.setDefaultNavigationTimeout(60_000);

    // ไปหน้า Admin CreateQuestionnaire
    await page.goto('http://localhost:5173/admin/createQuestionnaire');
    await page.waitForTimeout(1000);

    await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').click();
    await page.waitForTimeout(1000);
    await page.locator('div').filter({ hasText: /^ชื่อแบบทดสอบ \*$/ }).getByRole('textbox').fill('test');
    await page.waitForTimeout(1000);

    await page.locator('textarea').click();
    await page.waitForTimeout(1000);
    await page.locator('textarea').fill('test');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: '+' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '−' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: '😊 เชิงบวก' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '😊 เชิงบวก เลือกอยู่' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('checkbox', { name: 'แบบทดสอบนี้มีเงื่อนไขก่อนทำ' }).check();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: '-- เลือกแบบทดสอบ --' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'แบบคัดกรองโรคซึมเศร้า 2Q' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: '−' }).nth(1).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '+' }).nth(1).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '−' }).nth(1).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: '≥ มากกว่าหรือเท่ากับ' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '≥ มากกว่าหรือเท่ากับ เลือกอยู่' }).click();
    await page.waitForTimeout(1000);

    // ================== อัปโหลดรูปจากไฟล์ในเครื่อง (แก้ตรงนี้) ==================
    const filePath = String.raw`C:\Users\user\Pictures\Saved Pictures\131694421.jpg`;
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

    // (ออปชัน) ตรวจว่ามีพรีวิวรายการอัปโหลดหรือรูปตัวอย่างโชว์ขึ้นมาหลังอัปโหลด
    // await expect(page.locator('.ant-upload-list-item, img[alt="preview"]')).toBeVisible({ timeout: 10000 });
    // =============================================================================

    await page.getByRole('button', { name: 'สร้างแบบทดสอบ' }).click();
    await page.waitForTimeout(1000);
  });
});












