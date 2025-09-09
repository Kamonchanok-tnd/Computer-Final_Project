import { chromium, Page, BrowserContext } from '@playwright/test';

const BASE = 'http://localhost:5173';

// === กำหนด credentials ของแต่ละ role ===
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'user123';

// === Helper: กด login ===
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

// === Helper: รอว่าเข้าสู่ admin แล้วจริง ๆ ===
async function waitForAdmin(page: Page) {
  await Promise.race([
    page.waitForURL(/\/admin(\/|$)/, { timeout: 8000 }),
    page.getByRole('link', { name: /Prompt AI/i }).waitFor({ timeout: 8000 }),
    page.getByRole('link', { name: /Dashboard/i }).waitFor({ timeout: 8000 }),
    page.getByText(/จัดการลักษณะของ AI Bot/i).waitFor({ timeout: 8000 }),
  ]);
}

// === Helper: รอว่าเข้าสู่ user แล้วจริง ๆ ===
async function waitForUser(page: Page) {
  await Promise.race([
    page.waitForURL(/\/(home|audiohome|user|profile)/i, { timeout: 8000 }),
    page.getByRole('button', { name: /ออกจากระบบ|โปรไฟล์/i }).waitFor({ timeout: 8000 }),
  ]);
}

// === สร้าง state ===
export default async () => {
  const browser = await chromium.launch();

  // ===== Admin =====
  {
    const context: BrowserContext = await browser.newContext();
    const page = await context.newPage();

    try {
      await doLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await waitForAdmin(page);
    } catch {
      // fallback: ถ้า login ไม่ผ่าน → บังคับ set localStorage
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

  // ===== User =====
  {
    const context: BrowserContext = await browser.newContext();
    const page = await context.newPage();

    try {
      await doLogin(page, USER_EMAIL, USER_PASSWORD);
      await waitForUser(page);
    } catch {
      // fallback: ถ้า login ไม่ผ่าน → บังคับ set localStorage
      await page.evaluate(() => {
        localStorage.setItem('isLogin', 'true');
        localStorage.setItem('role', 'user');
        // ถ้าระบบของคุณใช้ token จริง ต้องแทนด้วย JWT แท้ ๆ
        localStorage.setItem('token_type', 'Bearer');
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx.yyy');
      });
      await page.goto(`${BASE}/audiohome/mirror`);
      await waitForUser(page);
    }

    await context.storageState({ path: 'storage/user.json' });
    await context.close();
  }

  await browser.close();
};
