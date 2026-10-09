// Temporary: captures README screenshots of the app running in demo mode.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('docs/screenshots', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
const settle = () => page.waitForTimeout(1500); // let chart animations finish

// Dashboard: first sample project (Payments API)
await page.goto('http://localhost:4173/');
await page.getByText('Quality Gate:').waitFor();
await page.getByText('Quality Trend').waitFor();
// Grow the window to the page height so the fixed sidebar spans the whole capture.
const height = await page.evaluate(() => document.documentElement.scrollHeight);
await page.setViewportSize({ width: 1280, height });
await settle();
await page.screenshot({ path: 'docs/screenshots/dashboard.png' });
await page.setViewportSize({ width: 1280, height: 800 });

// Dashboard: a failing project (Web Storefront)
await page.getByRole('button', { name: /Payments API/ }).first().click();
await page.getByRole('button', { name: /Web Storefront/ }).click();
await page.getByText('Quality Gate: FAILED').waitFor();
await settle();
await page.screenshot({ path: 'docs/screenshots/dashboard-failing.png' });

// Issues page
await page.getByRole('link', { name: /Issues/ }).click();
await page.getByText(/issues found/).waitFor();
await settle();
await page.screenshot({ path: 'docs/screenshots/issues.png' });

await browser.close();
console.log('screenshots done');
