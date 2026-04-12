import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000)); // wait for animations
await page.screenshot({ path: 'screenshot-dashboard.png', fullPage: true });
console.log('Screenshot saved: screenshot-dashboard.png');

// Check for console errors
const errors = [];
page.on('pageerror', err => errors.push(err.message));

// Try clicking "Commencer" on the first rule
const buttons = await page.$$('button');
let clicked = false;
for (const btn of buttons) {
  const text = await btn.evaluate(el => el.textContent);
  if (text.includes('Commencer') || text.includes('Continuer') || text.includes('Réviser')) {
    await btn.click();
    clicked = true;
    console.log('Clicked button:', text.trim());
    break;
  }
}

if (clicked) {
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshot-quiz.png', fullPage: true });
  console.log('Screenshot saved: screenshot-quiz.png');
}

if (errors.length) console.log('JS Errors:', errors);
else console.log('No JS errors detected');

await browser.close();
