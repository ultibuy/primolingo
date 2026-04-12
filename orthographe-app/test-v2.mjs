import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });

// Collect console errors
const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

// Clear localStorage for fresh start
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Screenshot 1: Fresh dashboard
await page.screenshot({ path: 'v2-1-dashboard-fresh.png', fullPage: true });
console.log('✓ Screenshot 1: Fresh dashboard');

// Click first "Découvrir" button
const buttons = await page.$$('button');
let clicked = false;
for (const btn of buttons) {
  const text = await btn.evaluate(el => el.textContent);
  if (text.includes('Découvrir') || text.includes('Commencer')) {
    await btn.click();
    clicked = true;
    console.log('  Clicked:', text.trim());
    break;
  }
}

if (clicked) {
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'v2-2-quiz.png', fullPage: true });
  console.log('✓ Screenshot 2: Quiz in progress');

  // Answer all 20 questions (click first answer button for each)
  for (let i = 0; i < 25; i++) {
    // Find answer buttons (those in the answer grid)
    const answerBtns = await page.$$('button');
    let answeredOrNext = false;

    for (const btn of answerBtns) {
      const text = await btn.evaluate(el => el.textContent);
      const disabled = await btn.evaluate(el => el.disabled);

      // Click "Question suivante" or "Voir le resultat"
      if (text.includes('suivante') || text.includes('résultat') || text.includes('resultat')) {
        await btn.click();
        answeredOrNext = true;
        await new Promise(r => setTimeout(r, 300));
        break;
      }
    }

    if (answeredOrNext) continue;

    // Click an answer choice (short text, not navigation buttons)
    for (const btn of answerBtns) {
      const text = await btn.evaluate(el => el.textContent.trim());
      const disabled = await btn.evaluate(el => el.disabled);
      if (!disabled && text.length < 20 && !text.includes('suivante') && !text.includes('Continuer') && !text.includes('Retour')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 400));
        break;
      }
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'v2-3-end-screen.png', fullPage: true });
  console.log('✓ Screenshot 3: End screen');

  // Click "Continuer" to go back to dashboard
  const continueButtons = await page.$$('button');
  for (const btn of continueButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text.includes('Continuer') || text.includes('tableau')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'v2-4-dashboard-after.png', fullPage: true });
  console.log('✓ Screenshot 4: Dashboard after session');
}

// Report errors
if (errors.length) {
  console.log('\n⚠ JS Errors:');
  errors.forEach(e => console.log('  ', e));
} else {
  console.log('\n✓ No JS errors');
}

await browser.close();
