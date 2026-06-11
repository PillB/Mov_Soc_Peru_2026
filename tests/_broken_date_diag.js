const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve('dossier_osint_v3.2.html'));
  await page.waitForSelector('.tab-btn[data-region]');
  await page.waitForTimeout(800);
  // Lima futuras
  await page.evaluate(() => document.querySelector('.tab-btn[data-region="lima"]').click());
  await page.waitForTimeout(700);
  const limaResults = await page.evaluate(() => {
    const panel = document.getElementById('panel-lima');
    // find sub-sections labeled "Convocatorias futuras"
    const subs = Array.from(panel.querySelectorAll('.region-subsection, .sub-section'));
    const out = [];
    subs.forEach(s => {
      const h = s.querySelector('h4, h5');
      if (h && /convocatori/i.test(h.textContent)) {
        const cards = s.querySelectorAll('.event-card, .event, article');
        cards.forEach((c,i) => {
          out.push({
            i,
            html_preview: c.innerHTML.substring(0,200),
            text_preview: c.innerText.substring(0,300)
          });
        });
      }
    });
    return out;
  });
  console.log('Lima futuras cards:', limaResults.length);
  limaResults.slice(0, 5).forEach((r,i) => {
    console.log(`\n--- card ${i} ---`);
    console.log(r.text_preview);
  });
  await browser.close();
})();
