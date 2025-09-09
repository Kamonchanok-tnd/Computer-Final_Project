// frontend/e2e/global-setup.ts
import { chromium, Page, BrowserContext } from '@playwright/test';

const BASE = 'http://localhost:5173';

// === กำหนด credentials ของแต่ละ role ===
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'user123';

// ช่วยหา input + กด login (รองรับ TH/EN)
async function doLogin(page: Page, email: string, password: string) {
  await page.goto(BASE);
  await page.waitForLoadState('domcontentloaded');

  const emailInput = page.locator(
    'input[placeholder="อีเมล"], input[placeholder*="email" i], input[type="email"]'
  ).first();
  const passInput = page.locator(
    'input[placeholder="รหัสผ่าน"], input[placeholder*="password" i], input[type="password"]'
  ).first();

  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await passInput.waitFor({ state: 'visible', timeout: 10000 });

  await emailInput.fill(email);
  await passInput.fill(password);

  await page.getByRole('button', { name: /เข้าสู่ระบบ|login|sign ?in/i }).click();
}

// รอ “หลักฐาน” ว่าเข้า role นั้น ๆ ได้จริง (ไม่ผูกกับ URL อย่างเดียว)
async function waitForAdmin(page: Page) {
  await Promise.race([
    page.waitForURL(/\/admin(\/|$)/, { timeout: 8000 }),
    page.getByRole('link', { name: /Prompt AI/i }).waitFor({ timeout: 8000 }),
    page.getByRole('link', { name: /Dashboard/i }).waitFor({ timeout: 8000 }),
    page.getByText(/จัดการลักษณะของ AI Bot/i).waitFor({ timeout: 8000 }),
  ]);
}

async function waitForUser(page: Page) {
  // ปรับ marker ให้ตรงกับหน้า user ของคุณ เช่น “สมัครสมาชิก”, “โปรไฟล์”, เมนูทั่วไปที่ user เท่านั้นเห็น
  await Promise.race([
    page.waitForURL(/\/(home|user|profile)?$/i, { timeout: 8000 }),
    page.getByRole('button', { name: /สมัครสมาชิก|ออกจากระบบ|โปรไฟล์/i }).waitFor({ timeout: 8000 }),
  ]);
}

export default async () => {
  const browser = await chromium.launch();

  // ===== ทำ state แอดมิน =====
  {
    const context: BrowserContext = await browser.newContext();
    const page = await context.newPage();
    await doLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    try {
      await waitForAdmin(page);
    } catch {
      // fallback dev: บังคับ role แอดมินผ่าน localStorage ถ้าแอปของคุณรับค่าเหล่านี้
      await page.evaluate(() => {
        localStorage.setItem('isLogin', 'true');
        localStorage.setItem('role', 'admin');
      });
      await page.goto(`${BASE}/admin`);
      await waitForAdmin(page);
    }

    await context.storageState({ path: 'storage/admin.json' });
    await context.close();
  }

  // ===== ทำ state ผู้ใช้ทั่วไป =====
  {
    const context: BrowserContext = await browser.newContext();
    const page = await context.newPage();
    await doLogin(page, USER_EMAIL, USER_PASSWORD);

    try {
      await waitForUser(page);
    } catch {
      // fallback dev: บังคับ role user ถ้าแอปรองรับ
      await page.evaluate(() => {
        localStorage.setItem('isLogin', 'true');
        localStorage.setItem('role', 'user');
      });
      await page.goto(BASE);
      await waitForUser(page);
    }

    await context.storageState({ path: 'storage/user.json' });
    await context.close();
  }

  await browser.close();
};
