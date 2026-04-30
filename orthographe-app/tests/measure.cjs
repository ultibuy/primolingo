const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('ortho_debug', '1');
    localStorage.setItem('debug_uid', 'puppeteer-test-uid');
  });
  await page.goto('http://localhost:5173/play/test-child', { waitUntil: 'networkidle2' });
  try { await page.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 10000 }); } catch(e) {}
  await new Promise(r => setTimeout(r, 1000));

  // Open 3rd rule (long title)
  const buttons = await page.$$('button');
  let count = 0;
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent.trim(), b);
    if (text === 'Découvrir' || text === 'Jouer') {
      if (count === 2) { await b.click(); break; }
      count++;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  const modalBtn = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Commencer');
    if (btn) { btn.click(); return true; }
    return false;
  });
  if (modalBtn) await new Promise(r => setTimeout(r, 1500));

  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const parent = h1 && h1.parentElement;
    const grandparent = parent && parent.parentElement;
    return {
      h1ScrollWidth: h1 ? h1.scrollWidth : null,
      h1OffsetWidth: h1 ? h1.offsetWidth : null,
      parentWidth: parent ? parent.offsetWidth : null,
      grandparentWidth: grandparent ? grandparent.offsetWidth : null,
      h1Text: h1 ? h1.textContent.trim() : null,
    };
  });
  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})().catch(e => console.error(e.message));
