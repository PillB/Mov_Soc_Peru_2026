#!/usr/bin/env node
/* =============================================================
   Dossier OSINT — Regression test suite
   Run: node tests/run_tests.js
   Exits with code 1 if any assertion fails.
   ============================================================= */

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const REPO_ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(REPO_ROOT, 'dossier_osint_v3.2.html');
const DATA_PATH = path.join(REPO_ROOT, 'web', 'data', 'events.json');

const REGIONS = ['lima', 'norte', 'centro', 'sur', 'oriente'];

// ---------- tiny test harness ----------
let passed = 0;
let failed = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  \u2713 ${name}`);
  } else {
    failed++;
    failures.push({ name, detail });
    console.log(`  \u2717 ${name}${detail ? '  \u2014  ' + detail : ''}`);
  }
}

function section(title) {
  console.log(`\n\u2500\u2500 ${title} \u2500\u2500`);
}

// ---------- main ----------
(async () => {
  if (!fs.existsSync(HTML_PATH)) {
    console.error(`Standalone HTML not found: ${HTML_PATH}`);
    console.error('Run: python3 build_standalone.py first.');
    process.exit(2);
  }
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Data file not found: ${DATA_PATH}`);
    process.exit(2);
  }

  console.log(`\nRunning regression tests against:\n  ${HTML_PATH}\n`);

  // ============ A. STATIC DATA-SHAPE CONTRACT ============
  section('A. Data-shape contract (events.json)');
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  ok('events.json has regions object', data && typeof data.regions === 'object' && data.regions !== null);

  for (const id of REGIONS) {
    const r = data.regions[id];
    ok(`region "${id}" exists`, !!r);
    if (!r) continue;
    // Either English or Spanish keys must populate the core arrays.
    const events  = r.events     || r.eventos      || [];
    const actors  = r.actors     || r.actores      || [];
    const zones   = r.zones      || r.puntos_riesgo || [];
    ok(`region "${id}" has \u22651 event`,  events.length  >= 1, `len=${events.length}`);
    ok(`region "${id}" has \u22651 actor`,  actors.length  >= 1, `len=${actors.length}`);
    ok(`region "${id}" has \u22651 zone`,   zones.length   >= 1, `len=${zones.length}`);
    ok(`region "${id}" has executive_alert`, typeof r.executive_alert === 'string' && r.executive_alert.trim().length > 0);
  }

  // Risk matrix shape
  const rm = data.risk_matrix || [];
  ok('risk_matrix has \u22655 rows', rm.length >= 5, `len=${rm.length}`);
  rm.slice(0, 14).forEach((row, i) => {
    const scenarioOK = !!(row.title || row.scenario || row.vector);
    ok(`risk_matrix[${i}] has scenario`, scenarioOK);
  });

  // ============ B. DOM RENDER (Playwright) ============
  section('B. Rendered DOM (Playwright, headless)');

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', msg => {
    if (msg.type() === 'error') pageErrors.push('console.error: ' + msg.text());
  });

  await page.goto('file://' + HTML_PATH, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  ok('page loaded without JS errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));

  // ---- per-region tests ----
  for (const id of REGIONS) {
    await page.evaluate(rid => {
      const t = document.querySelector(`.tab-btn[data-region="${rid}"]`);
      if (t) t.click();
    }, id);
    await page.waitForTimeout(400);

    const r = await page.evaluate(rid => {
      const panel = document.getElementById(`panel-${rid}`);
      if (!panel) return null;
      const meta = panel.querySelector('.region-meta');
      const alert_ = panel.querySelector('.region-alert');
      // count meaningful meta chips (anything that isn't an empty/dash-only risk pill)
      let metaChipCount = 0;
      if (meta) {
        Array.from(meta.children).forEach(c => {
          const txt = c.textContent.trim();
          if (txt && txt !== '\u2014') metaChipCount++;
        });
      }
      // Detect empty grass cards: only a "—" name and nothing else useful.
      const emptyAcct = Array.from(panel.querySelectorAll('.grass-card.account')).filter(c => {
        const name = c.querySelector('.g-name');
        const link = c.querySelector('.g-link');
        const notes = c.querySelector('.g-notes');
        const role = c.querySelector('.g-role');
        return (!name || name.textContent.trim() === '\u2014' || name.textContent.trim() === '')
          && !link && !notes && !role;
      }).length;
      const emptyLives = Array.from(panel.querySelectorAll('.grass-card.live')).filter(c => {
        const name = c.querySelector('.g-name');
        const link = c.querySelector('.g-link');
        const notes = c.querySelector('.g-notes');
        const host = c.querySelector('.g-host');
        return (!name || name.textContent.trim() === '\u2014' || name.textContent.trim() === '')
          && !link && !notes && !host;
      }).length;
      // Detect raw markdown links anywhere in the panel (visible text)
      const visibleText = panel.innerText || '';
      const rawMdMatches = visibleText.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || [];
      // Detect "N/D" placeholder leaking into rendered text
      const ndCount = (visibleText.match(/\bN\/?D\b/gi) || []).length;
      // Region-alert link count (executive_alert markdown should be parsed)
      const alertLinks = alert_ ? alert_.querySelectorAll('a').length : 0;
      const alertHasMdSyntax = alert_ ? /\[[^\]]+\]\(https?:\/\//.test(alert_.innerHTML) : false;
      return {
        metaChipCount,
        alertText: alert_ ? alert_.textContent.slice(0, 80) : '',
        alertLinks,
        alertHasMdSyntax,
        emptyAcct,
        emptyLives,
        rawMdMatches: rawMdMatches.slice(0, 3),
        ndCount,
        hasMeta: !!meta,
        // For each panel, also collect counts to sanity-check rendering happened
        eventCards: panel.querySelectorAll('.cards .card').length,
        actorCards: panel.querySelectorAll('.actors .actor').length,
        zoneCards:  panel.querySelectorAll('.zones .zone').length
      };
    }, id);

    ok(`[${id}] region meta renders \u22653 meaningful chips`, r && r.metaChipCount >= 3, `chips=${r && r.metaChipCount}`);
    ok(`[${id}] no empty account cards (only \u2014 name)`, r && r.emptyAcct === 0, `empty=${r && r.emptyAcct}`);
    ok(`[${id}] no empty live cards`, r && r.emptyLives === 0, `empty=${r && r.emptyLives}`);
    ok(`[${id}] no raw markdown link syntax visible`, r && r.rawMdMatches.length === 0, JSON.stringify(r && r.rawMdMatches));
    ok(`[${id}] no literal "N/D" in rendered text`, r && r.ndCount === 0, `count=${r && r.ndCount}`);
    ok(`[${id}] event cards rendered`,  r && r.eventCards  >= 1, `n=${r && r.eventCards}`);
    ok(`[${id}] actor cards rendered`,  r && r.actorCards  >= 1, `n=${r && r.actorCards}`);
    ok(`[${id}] zone cards rendered`,   r && r.zoneCards   >= 1, `n=${r && r.zoneCards}`);
    // Executive Alert: if source contains markdown links, rendered alert MUST have <a> elements (not raw text).
    const source = (data.regions[id] && data.regions[id].executive_alert) || '';
    const sourceHasMd = /\[[^\]]+\]\(https?:\/\//.test(source);
    if (sourceHasMd) {
      ok(`[${id}] executive_alert markdown parsed to <a>`, r && r.alertLinks >= 1 && !r.alertHasMdSyntax,
         `links=${r && r.alertLinks} raw=${r && r.alertHasMdSyntax}`);
    } else {
      ok(`[${id}] executive_alert has no raw markdown syntax`, r && !r.alertHasMdSyntax);
    }
  }

  // ---- Risk matrix ----
  section('C. Risk matrix');
  const risk = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#risk-tbody tr'));
    // Identify columns by data-label so renderer changes don't break tests
    const dashCells = []; // empty or "\u2014" in REQUIRED columns
    const required = new Set(['Escenario', 'Categor\u00eda', 'Probabilidad', 'Impacto']);
    rows.forEach((tr, i) => {
      Array.from(tr.children).forEach((td, j) => {
        const label = td.getAttribute('data-label');
        const txt = td.textContent.trim();
        if (required.has(label) && (txt === '' || txt === '\u2014')) {
          dashCells.push({ row: i, col: j, label });
        }
      });
    });
    return { rows: rows.length, dashCells };
  });
  ok('risk matrix has \u22655 rows rendered', risk.rows >= 5, `n=${risk.rows}`);
  ok('risk matrix: no empty cells in required columns', risk.dashCells.length === 0,
     JSON.stringify(risk.dashCells.slice(0, 5)));

  // ---- Hashtag overflow ----
  section('D. Hashtag pills do not overflow horizontally');
  const overflow = await page.evaluate(() => {
    const pills = Array.from(document.querySelectorAll('.grass-hashtag'));
    return pills.filter(p => p.scrollWidth > p.offsetWidth + 1).length;
  });
  ok('no hashtag pill overflows its container', overflow === 0, `overflowing=${overflow}`);

  // ---- Global N/D leak check ----
  section('E. Global placeholder leakage');
  const globalNd = await page.evaluate(() => {
    // Walk all rendered text nodes except SCRIPT/STYLE
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n = 0; const samples = [];
    while (tw.nextNode()) {
      const t = tw.currentNode.textContent;
      if (/\bN\/?D\b/i.test(t)) {
        n++;
        if (samples.length < 5) samples.push(t.trim().slice(0, 80));
      }
    }
    return { count: n, samples };
  });
  ok('no "N/D" leaks into any rendered text outside <script>', globalNd.count === 0,
     `count=${globalNd.count} samples=${JSON.stringify(globalNd.samples)}`);

  await browser.close();

  // ---------- summary ----------
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
  if (failed > 0) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log(`  \u2717 ${f.name}\n      ${f.detail || ''}`));
    process.exit(1);
  }
  process.exit(0);
})().catch(err => {
  console.error('Test runner error:', err);
  process.exit(2);
});
