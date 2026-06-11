const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve('dossier_osint_v3.2.html'));
  await page.waitForSelector('.tab-btn[data-region]');
  await page.waitForTimeout(800);
  // Visit each region and pull every visible date-looking string
  const result = [];
  for (const rid of ['lima','norte','centro','sur','oriente']) {
    await page.evaluate(id => document.querySelector(`.tab-btn[data-region="${id}"]`).click(), rid);
    await page.waitForTimeout(500);
    const dates = await page.evaluate(id => {
      const panel = document.getElementById(`panel-${id}`);
      if (!panel) return [];
      // capture all text nodes that look like dates
      const all = panel.innerText.split('\n');
      return all.filter(line =>
        /\d{4}-\d{2}-\d{2}/.test(line) ||         // raw ISO
        /T\d{2}:\d{2}/.test(line) ||              // T-separator
        /:00-05:00/.test(line) ||                 // TZ suffix leak
        /\bal\b.*\d{4}/.test(line) ||             // "X al Y"
        /\(probable\)/.test(line) ||
        /\(riesgo latente\)/.test(line) ||
        /Permanente|TPor confirmar|TVariable/.test(line)
      );
    }, rid);
    if (dates.length) result.push({ region: rid, dates: dates.slice(0,15) });
  }
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
