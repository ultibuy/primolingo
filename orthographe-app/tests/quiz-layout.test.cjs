const puppeteer = require('puppeteer');

async function findAndClickButton(page, labels) {
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent.trim(), b);
    if (labels.includes(text)) {
      await b.click();
      return text;
    }
  }
  return null;
}

async function launchQuiz(page, ruleIndex = 0) {
  // Click the Nth "Découvrir" button
  const buttons = await page.$$('button');
  let count = 0;
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent.trim(), b);
    if (text === 'Découvrir' || text === 'Jouer') {
      if (count === ruleIndex) { await b.click(); return; }
      count++;
    }
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  // Auth bypass
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('ortho_debug', '1');
    localStorage.setItem('debug_uid', 'puppeteer-test-uid');
  });
  await page.goto('http://localhost:5173/play/test-child', { waitUntil: 'networkidle2' });
  try {
    await page.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 10000 });
  } catch(e) {}
  await new Promise(r => setTimeout(r, 1000));

  // Launch the 3rd rule (-er · -é · -ez · -ais · -ait)
  await launchQuiz(page, 2);
  await new Promise(r => setTimeout(r, 800));

  // Handle "Bonus du jour" modal
  const modal = await findAndClickButton(page, ['Commencer']);
  if (modal) { console.log('Modal: Commencer'); await new Promise(r => setTimeout(r, 1500)); }

  await page.screenshot({ path: '/tmp/quiz-long-title.png' });
  console.log('Screenshot saved');

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
