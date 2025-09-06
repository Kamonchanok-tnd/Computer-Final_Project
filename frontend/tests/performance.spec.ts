import { test, expect } from '@playwright/test';

test('Performance: โหลดหน้าแรกไม่เกิน 3 วิ', async ({ page }) => {
  await page.goto('/');
  const perf = await page.evaluate(() => JSON.stringify(window.performance.timing));
  const timing = JSON.parse(perf);
  const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
  console.log(`⏱️ Page Load Time: ${pageLoadTime} ms`);
  expect(pageLoadTime).toBeLessThan(3000);
});

test('Performance: ตรวจสอบ memory usage', async ({ page }) => {
  await page.goto('/');
  const client = await page.context().newCDPSession(page);
  const result = await client.send('Performance.getMetrics');
  const metrics: Record<string, number> = {};
  for (const m of result.metrics) metrics[m.name] = m.value;

  console.log(metrics);
  expect(metrics.JSHeapUsedSize).toBeLessThan(50_000_000); // < 50MB
});

test('Performance: ตรวจสอบ CPU usage', async ({ page }) => {
  await page.goto('/');
  const client = await page.context().newCDPSession(page);
  const result = await client.send('Performance.getMetrics');
  const metrics: Record<string, number> = {};
  for (const m of result.metrics) metrics[m.name] = m.value;

  console.log(metrics);
  expect(metrics.cpuUsage).toBeLessThan(50); // < 50%
});