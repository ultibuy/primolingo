import puppeteer from 'puppeteer';

const baseUrl = process.env.APP_URL || 'http://localhost:5173/';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto(baseUrl, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

await page.screenshot({ path: 'debug-01-dashboard.png', fullPage: true });

const buttons = await page.$$('button');
let clicked = false;
for (const btn of buttons) {
  const text = await btn.evaluate(el => el.textContent || '');
  if (text.includes('Découvrir') || text.includes("S'entraîner")) {
    await btn.click();
    clicked = true;
    break;
  }
}

if (clicked) {
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'debug-02-quiz.png', fullPage: true });

  for (let i = 0; i < 25; i += 1) {
    const answerButtons = await page.$$('button');
    let advanced = false;

    for (const btn of answerButtons) {
      const text = await btn.evaluate(el => el.textContent || '');
      if (text.includes('Question suivante') || text.includes('Voir le résultat final')) {
        await btn.click();
        advanced = true;
        await new Promise(r => setTimeout(r, 250));
        break;
      }
    }

    if (advanced) continue;

    for (const btn of answerButtons) {
      const text = await btn.evaluate(el => (el.textContent || '').trim());
      const disabled = await btn.evaluate(el => el.disabled);
      if (!disabled && text.length < 20 && !text.includes('Continuer') && !text.includes('Retour')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 250));
        break;
      }
    }
  }

  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'debug-03-end-screen.png', fullPage: true });

  const continueButtons = await page.$$('button');
  for (const btn of continueButtons) {
    const text = await btn.evaluate(el => el.textContent || '');
    if (text.includes('Continuer')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'debug-04-dashboard-after.png', fullPage: true });
}

if (errors.length) {
  console.log(JSON.stringify({ ok: false, errors }, null, 2));
} else {
  console.log(JSON.stringify({ ok: true, errors: [] }, null, 2));
}

await browser.close();
