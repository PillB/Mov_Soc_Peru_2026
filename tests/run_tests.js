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
const DATA_PATH = path.join(REPO_ROOT, 'data', 'events.json');

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

  // ============ F. v3.5.2 — Section-by-section render contracts ============
  section('F. Region events badge — never a bare dash');
  for (const id of REGIONS) {
    await page.evaluate(rid => {
      const t = document.querySelector(`.tab-btn[data-region="${rid}"]`);
      if (t) t.click();
    }, id);
    await page.waitForTimeout(250);
    const dashBadges = await page.evaluate(rid => {
      const panel = document.getElementById(`panel-${rid}`);
      if (!panel) return -1;
      const badges = Array.from(panel.querySelectorAll('.cards .card .badge, .cards .card .pill, .cards .card .chip, .cards .card .status, .cards .card .side'));
      return badges.filter(b => {
        const t = (b.textContent || '').trim();
        return t === '' || t === '\u2014' || t === '-';
      }).length;
    }, id);
    ok(`[${id}] no event badge is a bare dash`, dashBadges === 0, `dash-badges=${dashBadges}`);
  }

  section('G. Region narrativas_locales subsection rendered when data present');
  for (const id of REGIONS) {
    const r = data.regions[id] || {};
    const nl = r.narrativas_locales || r.local_narratives || [];
    if (!Array.isArray(nl) || nl.length === 0) continue;
    await page.evaluate(rid => {
      const t = document.querySelector(`.tab-btn[data-region="${rid}"]`);
      if (t) t.click();
    }, id);
    await page.waitForTimeout(250);
    const info = await page.evaluate(rid => {
      const panel = document.getElementById(`panel-${rid}`);
      if (!panel) return null;
      const text = (panel.innerText || '').toLowerCase();
      const hasHeader = /narrativas locales|narrativas_locales|local narratives/.test(text);
      const cards = panel.querySelectorAll('.narrative-loc-card, .narr-loc-card, .narr-local').length;
      // Also accept rendering inside a section with class hint
      const altCards = panel.querySelectorAll('[data-section="narrativas-locales"] .card, .narrativas-locales .card').length;
      return { hasHeader, cards: cards + altCards };
    }, id);
    ok(`[${id}] narrativas_locales subsection present`, info && info.hasHeader, `header=${info && info.hasHeader}`);
    ok(`[${id}] narrativas_locales has \u22651 card`, info && info.cards >= 1, `cards=${info && info.cards}`);
  }

  section('H. Social — live streams have non-dash channel');
  // Switch to social section (if it's a tab/section visible by id)
  await page.evaluate(() => {
    const el = document.getElementById('social') || document.getElementById('panel-social');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(300);
  const lives = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.live-card, .lives .card, #lives-grid .card'));
    let dashChannels = 0;
    cards.forEach(c => {
      const ch = c.querySelector('.l-channel, .live-channel, .channel');
      const txt = ch ? (ch.textContent || '').trim() : '';
      if (txt === '\u2014' || txt === '-' || txt === '') dashChannels++;
    });
    return { total: cards.length, dashChannels };
  });
  ok(`live-stream cards rendered`, lives.total >= 1, `n=${lives.total}`);
  ok(`no live-card has a dash/empty channel`, lives.dashChannels === 0, `dash=${lives.dashChannels} of ${lives.total}`);

  section('I. Social — handles grid rendered from cuentas_emergentes');
  const handles = await page.evaluate(() => {
    const grid = document.querySelector('#handles-grid, .handles-grid');
    if (!grid) return { found: false, cards: 0 };
    const cards = grid.querySelectorAll('.handle-card, .card').length;
    return { found: true, cards };
  });
  ok('handles grid exists', handles.found);
  ok('handles grid has \u22651 card', handles.cards >= 1, `n=${handles.cards}`);

  section('J. Social — hashtags grid rendered from data');
  const tags = await page.evaluate(() => {
    const grid = document.querySelector('#hashtags-grid, .hashtags-grid');
    if (!grid) return { found: false, cards: 0, nonHash: 0 };
    const cards = Array.from(grid.querySelectorAll('.hashtag-card, .card'));
    let nonHash = 0;
    cards.forEach(c => {
      const tag = c.querySelector('.h-tag, .tag, .hashtag');
      const txt = tag ? (tag.textContent || '').trim() : '';
      if (txt && !txt.startsWith('#')) nonHash++;
    });
    return { found: true, cards: cards.length, nonHash };
  });
  ok('hashtags grid exists', tags.found);
  ok('hashtags grid has \u22651 card', tags.cards >= 1, `n=${tags.cards}`);
  ok('every hashtag tag starts with #', tags.nonHash === 0, `non-hash=${tags.nonHash}`);

  section('K. Social — stats banner has cards');
  const stats = await page.evaluate(() => {
    const banner = document.querySelector('#social-stats, .social-stats');
    if (!banner) return { found: false, cards: 0 };
    const cards = banner.querySelectorAll('.stat, .stat-card, .card').length;
    return { found: true, cards };
  });
  ok('social stats banner exists', stats.found);
  ok('social stats has \u22651 stat card', stats.cards >= 1, `n=${stats.cards}`);

  section('L. Social — platforms grid derived');
  const platforms = await page.evaluate(() => {
    const grid = document.querySelector('#platforms-grid, .platforms-grid');
    if (!grid) return { found: false, cards: 0 };
    const cards = grid.querySelectorAll('.platform-card, .card').length;
    return { found: true, cards };
  });
  ok('platforms grid exists', platforms.found);
  ok('platforms grid has \u22651 platform card', platforms.cards >= 1, `n=${platforms.cards}`);

  section('M. Early-warning cards — rich rendering');
  const ew = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#ew-grid .ew, .ew-grid .ew, .ew-card'));
    if (cards.length === 0) {
      const fallback = Array.from(document.querySelectorAll('[id*="early"] .card, [id*="warning"] .card'));
      return { total: fallback.length, thin: fallback.length, hasStatusPill: 0, hasSources: 0 };
    }
    let thin = 0, hasStatusPill = 0, hasSources = 0;
    cards.forEach(c => {
      // Count meaningful children (title + at least one more block)
      const children = Array.from(c.children).filter(ch => (ch.textContent || '').trim().length > 0);
      if (children.length <= 1) thin++;
      if (c.querySelector('.status-pill, .ew-status, .pill.rojo, .pill.amarillo, .pill.verde')) hasStatusPill++;
      if (c.querySelector('a[href^="http"], .ew-sources, .sources')) hasSources++;
    });
    return { total: cards.length, thin, hasStatusPill, hasSources };
  });
  ok('EW cards rendered', ew.total >= 1, `n=${ew.total}`);
  ok('no EW card is title-only (\u22652 meaningful children)', ew.thin === 0, `thin=${ew.thin}/${ew.total}`);
  ok('majority of EW cards have a status pill', ew.hasStatusPill >= Math.ceil(ew.total * 0.5),
     `pills=${ew.hasStatusPill}/${ew.total}`);
  ok('majority of EW cards link to a source', ew.hasSources >= Math.ceil(ew.total * 0.5),
     `sources=${ew.hasSources}/${ew.total}`);

  section('N1. v3.5.3 — Event cards: ISO dates humanized (centro/sur/oriente)');
  // Cycle through regions to render their panels first
  for (const id of ['centro', 'sur', 'oriente']) {
    await page.evaluate(rid => {
      const t = document.querySelector(`.tab-btn[data-region="${rid}"]`);
      if (t) t.click();
    }, id);
    await page.waitForTimeout(200);
  }
  const eventCheck = await page.evaluate(() => {
    const out = { totalEv: 0, rawIso: 0, withSource: 0 };
    // events sub-grid is the region card grid for events; just scan all cards inside region panels
    const evCards = Array.from(document.querySelectorAll('#panel-centro .card, #panel-sur .card, #panel-oriente .card'));
    evCards.forEach(c => {
      const txt = (c.textContent || '');
      out.totalEv++;
      if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(txt)) out.rawIso++;
      if (c.querySelector('a[href^="http"]')) out.withSource++;
    });
    return out;
  });
  ok('event cards: zero raw ISO datetime leaks', eventCheck.rawIso === 0, `raw=${eventCheck.rawIso}/${eventCheck.totalEv}`);

  section('N2. v3.5.3 — Actor cards: long posicion not used as tiny side chip');
  const actorCheck = await page.evaluate(() => {
    const out = { totalActors: 0, longInChip: 0 };
    const cards = Array.from(document.querySelectorAll('#panel-centro .actor, #panel-sur .actor, #panel-oriente .actor, #panel-centro .actor-card, #panel-sur .actor-card, #panel-oriente .actor-card'));
    cards.forEach(c => {
      out.totalActors++;
      const sideEl = c.querySelector('.side, .actor-side, .chip.side');
      if (sideEl && (sideEl.textContent || '').trim().length > 60) out.longInChip++;
    });
    return out;
  });
  ok('no actor card uses long descriptive text as side chip', actorCheck.longInChip === 0, `long=${actorCheck.longInChip}/${actorCheck.totalActors}`);

  section('N3. v3.5.3 — Zone cards: centro/sur/oriente have descripcion rendered');
  const zoneCheck = await page.evaluate(() => {
    const out = { totalZones: 0, withDesc: 0 };
    const cards = Array.from(document.querySelectorAll('#panel-centro .zone, #panel-sur .zone, #panel-oriente .zone, #panel-centro .zone-card, #panel-sur .zone-card, #panel-oriente .zone-card'));
    cards.forEach(c => {
      out.totalZones++;
      // any descriptive text > 20 chars in card body (excluding name h3/h4)
      const allText = (c.textContent || '').trim();
      const nameEl = c.querySelector('h3, h4, .zone-name');
      const nameText = nameEl ? (nameEl.textContent || '').trim() : '';
      const bodyText = allText.replace(nameText, '').trim();
      if (bodyText.length > 30) out.withDesc++;
    });
    return out;
  });
  ok('zone cards rendered for centro/sur/oriente', zoneCheck.totalZones >= 1, `n=${zoneCheck.totalZones}`);
  ok('majority of zone cards have body text >30 chars', zoneCheck.withDesc >= Math.ceil(zoneCheck.totalZones * 0.5), `withDesc=${zoneCheck.withDesc}/${zoneCheck.totalZones}`);

  section('N5. v3.5.3 — Live-card schedule and region-meta: no raw ISO datetime');
  const isoLeakCheck = await page.evaluate(() => {
    const out = { liveCardIso: 0, regionMetaIso: 0 };
    const reIso = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
    document.querySelectorAll('.l-schedule').forEach(el => {
      if (reIso.test((el.textContent || '').trim())) out.liveCardIso++;
    });
    document.querySelectorAll('.region-meta').forEach(el => {
      if (reIso.test((el.textContent || '').trim())) out.regionMetaIso++;
    });
    return out;
  });
  ok('live-card schedule: zero raw ISO datetime', isoLeakCheck.liveCardIso === 0, `n=${isoLeakCheck.liveCardIso}`);
  ok('region-meta corte: zero raw ISO datetime', isoLeakCheck.regionMetaIso === 0, `n=${isoLeakCheck.regionMetaIso}`);

  section('N4. v3.5.3 — Disinfo/Alt-media: no raw underscore-token chips');
  const labelCheck = await page.evaluate(() => {
    // only raw underscore tokens (definitely unmapped) — 'centro'/'izq'/'der' can be legit labels in some contexts
    const rawTokens = ['fuera_contexto', 'pro_fp', 'pro_sanchez'];
    const chips = Array.from(document.querySelectorAll('#social .chip, #social .pill, #social .type, #social .h-tag, #social .g-tag'));
    let raw = 0;
    const samples = [];
    chips.forEach(ch => {
      const t = (ch.textContent || '').trim().toLowerCase();
      // only flag exact-match raw tokens (not when they're part of a longer label)
      if (rawTokens.includes(t)) {
        raw++;
        if (samples.length < 5) samples.push(t);
      }
    });
    return { raw, samples };
  });
  ok('no raw type tokens in social chips', labelCheck.raw === 0, `raw=${labelCheck.raw} samples=${labelCheck.samples.join(',')}`);

  section('N6. v3.5.4 — Hashtags and handles: majority have source links');
  const linkCoverage = await page.evaluate(() => {
    const r = {};
    const hash = Array.from(document.querySelectorAll('.hashtag-card'));
    r.hashTotal = hash.length;
    r.hashWithLink = hash.filter(c => c.querySelector('a[href^="http"]')).length;
    const handle = Array.from(document.querySelectorAll('.handle-card'));
    r.handleTotal = handle.length;
    r.handleWithLink = handle.filter(c => c.querySelector('a[href^="http"]')).length;
    return r;
  });
  ok('≥90% of hashtag cards have a source link', linkCoverage.hashWithLink >= Math.floor(linkCoverage.hashTotal * 0.9), `${linkCoverage.hashWithLink}/${linkCoverage.hashTotal}`);
  // v3.5.4: only 16/59 cuentas have URLs in raw data; renderer surfaces all of them
  ok('≥25% of handle cards have a profile link (raw data ceiling)', linkCoverage.handleWithLink >= Math.floor(linkCoverage.handleTotal * 0.25), `${linkCoverage.handleWithLink}/${linkCoverage.handleTotal}`);

  section('N7. v3.5.4 — Platforms grid: no hardcoded version string');
  const platformsTextCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.platform-card, #platforms-grid .card'));
    let withHardcoded = 0;
    cards.forEach(c => { if (/dossier OSINT \(v3\.\d+/.test(c.textContent || '')) withHardcoded++; });
    return { total: cards.length, withHardcoded };
  });
  ok('platform cards: no hardcoded "dossier OSINT (vX.Y)" string', platformsTextCheck.withHardcoded === 0, `bad=${platformsTextCheck.withHardcoded}/${platformsTextCheck.total}`);

  section('N8. v3.5.5 — Event card titles: descriptive (not bare "plantón"/"marcha")');
  const evTitleCheck = await page.evaluate(() => {
    // gather all event card h3 titles in any region
    const titles = Array.from(document.querySelectorAll('#regions article h3, #regions .card h3'))
      .map(h => (h.textContent || '').trim()).filter(Boolean);
    const rawTypeTitles = ['plantón', 'planton', 'marcha', 'bloqueo', 'declaración', 'declaracion', 'convocatoria', 'paro', 'mitin'];
    const bare = titles.filter(t => rawTypeTitles.includes(t.toLowerCase()));
    return { total: titles.length, bare: bare.length, bareSamples: bare.slice(0, 5) };
  });
  ok('no event card title is a bare type token', evTitleCheck.bare === 0, `bare=${evTitleCheck.bare}/${evTitleCheck.total} samples=${evTitleCheck.bareSamples.join(',')}`);

  section('N9. v3.5.5 — Risk matrix has ≥16 rows (v3.5.5 additions)');
  const rmRows = await page.evaluate(() => {
    const tbody = document.querySelector('#risk-matrix tbody, .risk-matrix tbody, table.matrix tbody');
    if (!tbody) return -1;
    return tbody.querySelectorAll('tr').length;
  });
  ok('risk matrix has ≥16 rows', rmRows >= 16, `rows=${rmRows}`);

  section('N10. v3.5.6 — Mapa Leaflet por región (al menos 4 de 5 con mapa)');
  const mapResults = [];
  for (const rid of REGIONS) {
    // Activate the region tab
    await page.evaluate((id) => {
      const btn = document.querySelector(`.tab-btn[data-region="${id}"]`);
      if (btn) btn.click();
    }, rid);
    await page.waitForTimeout(700);  // wait for setTimeout(0) + tile init
    const r = await page.evaluate((id) => {
      const mapEl = document.getElementById(`map-${id}`);
      if (!mapEl) return { exists: false };
      const hasLeafletContainer = mapEl.classList.contains('leaflet-container');
      const polylines = mapEl.querySelectorAll('path.leaflet-interactive').length;
      // include all interactive paths (polylines + circles)
      const tileImgs = mapEl.querySelectorAll('img.leaflet-tile').length;
      const legend = mapEl.closest('.region-map-holder')?.querySelector('.region-map-legend');
      const legendRows = legend ? legend.querySelectorAll('.legend-row').length : 0;
      const checkboxes = legend ? legend.querySelectorAll('input[type="checkbox"]').length : 0;
      return { exists: true, hasLeafletContainer, polylines, tileImgs, legendRows, checkboxes };
    }, rid);
    mapResults.push({ region: rid, ...r });
  }
  const mapsWithContainer = mapResults.filter(r => r.exists && r.hasLeafletContainer).length;
  ok(`≥4 de 5 regiones tienen contenedor Leaflet inicializado (got ${mapsWithContainer})`, mapsWithContainer >= 4,
     JSON.stringify(mapResults));

  section('N11. v3.5.6 — Mapas dibujan rutas/zonas/eventos como SVG paths');
  const totalPaths = mapResults.reduce((s, r) => s + (r.polylines || 0), 0);
  ok('≥10 paths SVG entre todas las regiones', totalPaths >= 10, `total=${totalPaths}`);
  const regionsWithGeo = mapResults.filter(r => (r.polylines || 0) >= 1).length;
  ok('≥4 de 5 regiones con al menos un path geo', regionsWithGeo >= 4, `n=${regionsWithGeo}`);

  section('N12. v3.5.6 — Leyenda con toggles por capa');
  const regionsWithLegend = mapResults.filter(r => (r.legendRows || 0) >= 1 && (r.checkboxes || 0) >= 1).length;
  ok('≥4 de 5 regiones tienen leyenda con checkboxes', regionsWithLegend >= 4,
     JSON.stringify(mapResults.map(r => ({region:r.region, rows:r.legendRows, cb:r.checkboxes}))));

  section('N13. v3.5.6 — Tiles cargan (al menos una región con imágenes de tile)');
  const totalTiles = mapResults.reduce((s, r) => s + (r.tileImgs || 0), 0);
  // Tiles may fail offline-only contexts; just require at least *attempt* (the img elements get created
  // by Leaflet regardless of network). file://-loaded HTML may have 0 successful loads but elements exist.
  ok('Leaflet creó elementos <img class=leaflet-tile>', totalTiles >= 1, `total=${totalTiles}`);

  // ============================================================
  // v3.5.7 — Date validation + map↔list interactivity
  // ============================================================

  section('N14. v3.5.7 — Sin "Invalid Date" en ninguna tarjeta de evento');
  const invalidDateCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.event-card .card-meta'));
    let n = 0;
    cards.forEach(meta => {
      if (/Invalid Date/i.test(meta.textContent || '')) n++;
    });
    return n;
  });
  ok('Ninguna tarjeta de evento muestra "Invalid Date"', invalidDateCount === 0, `n=${invalidDateCount}`);

  section('N15. v3.5.7 — Eventos sin fecha muestran "Por confirmar" o fecha_nota');
  const porConfirmarCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.event-card .card-meta'));
    let porConf = 0, totalFecha = 0;
    cards.forEach(meta => {
      const txt = meta.textContent || '';
      if (/Fecha/i.test(txt)) {
        totalFecha++;
        if (/Por confirmar|Sin fecha confirmada/i.test(txt)) porConf++;
      }
    });
    return { porConf, totalFecha };
  });
  ok('Hay tarjetas con "Por confirmar" (las que no tenían fecha)', porConfirmarCount.porConf >= 1, JSON.stringify(porConfirmarCount));

  section('N16. v3.5.7 — Tarjetas de evento tienen data-evtid y data-region-id');
  const evtAttrs = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.event-card'));
    const withBoth = cards.filter(c => c.getAttribute('data-evtid') && c.getAttribute('data-region-id')).length;
    return { total: cards.length, withBoth };
  });
  ok('≥ 80% de event-cards tienen data-evtid + data-region-id', evtAttrs.total > 0 && (evtAttrs.withBoth / evtAttrs.total) >= 0.8, JSON.stringify(evtAttrs));

  section('N17. v3.5.7 — window.__regionMaps expone focusEvent para 4+ regiones');
  // Visit each region tab so its map initializes
  for (const rid of REGIONS) {
    await page.click(`.tab-btn[data-region="${rid}"]`).catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(500);
  const regionMaps = await page.evaluate(() => {
    const rm = window.__regionMaps || {};
    return Object.keys(rm).filter(k => typeof rm[k].focusEvent === 'function');
  });
  ok('≥ 4 regiones registraron focusEvent en window.__regionMaps', regionMaps.length >= 4, `keys=${regionMaps.join(',')}`);

  section('N18. v3.5.7 — Click en tarjeta dispara focusEvent del mapa');
  await page.click('.tab-btn[data-region="lima"]').catch(() => {});
  await page.waitForTimeout(500);
  const focusResult = await page.evaluate(() => {
    // find a lima event card with a valid evtid that's also in the map registry
    const handle = (window.__regionMaps || {})['lima'];
    if (!handle) return { ok: false, reason: 'no_lima_handle' };
    const cards = Array.from(document.querySelectorAll('.event-card[data-region-id="lima"]'));
    for (const card of cards) {
      const id = card.getAttribute('data-evtid');
      if (id && handle.focusEvent(id)) return { ok: true, id };
    }
    return { ok: false, reason: 'no_matching_event' };
  });
  ok('al menos un evento de Lima es enfocable vía focusEvent', focusResult.ok === true, JSON.stringify(focusResult));

  section('N19. v3.5.7 — AGENT.md existe con secciones clave');
  const agentPath = path.join(REPO_ROOT, 'AGENT.md');
  let agentContent = '';
  try { agentContent = fs.readFileSync(agentPath, 'utf8'); } catch (e) {}
  ok('AGENT.md existe', agentContent.length > 0, `len=${agentContent.length}`);
  ok('AGENT.md cubre arquitectura', /## 1\. Arquitectura/.test(agentContent));
  ok('AGENT.md cubre shapes de datos', /## 2\. Shape de datos/.test(agentContent));
  ok('AGENT.md cubre interdependencias', /## 3\. Interdependencias/.test(agentContent));
  ok('AGENT.md cubre QA checklist', /## 4\. QA checklist/.test(agentContent));
  ok('AGENT.md cubre errores comunes', /## 5\. Errores comunes/.test(agentContent));

  section('N20. v3.5.7 — events.json sin fechas mal formadas (`YYYY-MM-DDT<garbage>`)');
  const dataRaw_v357 = fs.readFileSync(DATA_PATH, 'utf8');
  const data_v357 = JSON.parse(dataRaw_v357);
  let weirdDates = 0; const weirdSamples = [];
  function checkList(list) {
    (list || []).forEach(ev => {
      const f = ev.fecha || '';
      if (typeof f === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(f)) {
        // Only valid if matches full ISO
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:?\d{2})?$/.test(f)) {
          weirdDates++;
          if (weirdSamples.length < 3) weirdSamples.push(f);
        }
      }
    });
  }
  for (const rid of Object.keys(data_v357.regions || {})) {
    const r = data_v357.regions[rid];
    checkList(r.eventos || r.events || []);
    checkList(r.convocatorias_futuras || r.events_future || []);
  }
  ok('no quedan fechas malformadas tipo YYYY-MM-DDT<garbage>', weirdDates === 0, `n=${weirdDates} samples=${JSON.stringify(weirdSamples)}`);

  section('N21. v3.9.3 — meta.version = 3.9.3');
  const metaVersion = data_v357.meta && data_v357.meta.version;
  ok('meta.version es 3.9.3', metaVersion === '3.9.3', `got=${metaVersion}`);

  section('N22. v3.5.8 — gazetteer expone CORRIDORS con polylines de avenidas reales');
  const corridorsInfo = await page.evaluate(() => {
    const gz = window.DOSSIER_GAZETTEER;
    if (!gz || !gz.CORRIDORS) return { ok:false, count:0, maxLen:0 };
    const keys = Object.keys(gz.CORRIDORS);
    let maxLen = 0;
    keys.forEach(k => { const arr = gz.CORRIDORS[k]; if (Array.isArray(arr) && arr.length > maxLen) maxLen = arr.length; });
    return { ok:true, count: keys.length, maxLen };
  });
  ok('window.DOSSIER_GAZETTEER.CORRIDORS existe', corridorsInfo.ok === true, JSON.stringify(corridorsInfo));
  ok('CORRIDORS tiene >=15 entradas', corridorsInfo.count >= 15, `count=${corridorsInfo.count}`);
  ok('al menos un corredor tiene >=6 vértices', corridorsInfo.maxLen >= 6, `maxLen=${corridorsInfo.maxLen}`);

  section('N23. v3.5.8 — alguna polyline en el mapa tiene >=6 vértices (corridor-resolved)');
  const polyVertices = await page.evaluate(() => {
    // Leaflet renders polylines as <path d="M x,y L x,y L x,y ..."/> inside #map-* > .leaflet-overlay-pane svg
    const maps = document.querySelectorAll('[id^="map-"]');
    let maxVerts = 0;
    maps.forEach(m => {
      const paths = m.querySelectorAll('.leaflet-overlay-pane svg path');
      paths.forEach(p => {
        const d = p.getAttribute('d') || '';
        // Count M + L commands = vertices
        const verts = (d.match(/[MLml]/g) || []).length;
        if (verts > maxVerts) maxVerts = verts;
      });
    });
    return maxVerts;
  });
  ok('alguna polyline renderizada tiene >=6 vértices', polyVertices >= 6, `maxVerts=${polyVertices}`);

  section('N24. v3.5.8 — leyenda incluye subtítulo "Traza de la ruta"');
  const hasTrazaLegend = await page.evaluate(() => {
    const txt = (document.body.innerText || '').toLowerCase();
    return txt.includes('traza de la ruta');
  });
  ok('leyenda menciona "Traza de la ruta"', hasTrazaLegend === true, `hasTrazaLegend=${hasTrazaLegend}`);

  section('N25. v3.5.9 — tarjetas .route NO muestran solo "—" como título');
  const routeCardCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.routes .route'));
    const total = cards.length;
    let emptyDash = 0;
    cards.forEach(c => {
      const h3 = (c.querySelector('h3')?.textContent || '').trim();
      if (h3 === '—' || h3 === '-' || h3 === '') emptyDash++;
    });
    return { total, emptyDash };
  });
  ok('hay tarjetas .route renderizadas', routeCardCheck.total > 0, JSON.stringify(routeCardCheck));
  ok('ninguna tarjeta .route muestra solo "—" como h3', routeCardCheck.emptyDash === 0, JSON.stringify(routeCardCheck));

  section('N26. v3.5.9 — CORRIDORS_REAL expuesto con geometría densa (OSRM-precomputado)');
  const corridorsRealInfo = await page.evaluate(() => {
    const gz = window.DOSSIER_GAZETTEER;
    if (!gz || !gz.CORRIDORS_REAL) return { ok:false, count:0, total:0 };
    const keys = Object.keys(gz.CORRIDORS_REAL);
    let total = 0, urbanMax = 0;
    const urbanKeys = ['toma_de_lima', 'corredor_historico_lima', 'eje_norte_lima', 'cusco_urbano'];
    keys.forEach(k => {
      const arr = gz.CORRIDORS_REAL[k];
      if (Array.isArray(arr)) {
        total += arr.length;
        if (urbanKeys.indexOf(k) >= 0 && arr.length > urbanMax) urbanMax = arr.length;
      }
    });
    return { ok:true, count: keys.length, total, urbanMax };
  });
  ok('CORRIDORS_REAL existe', corridorsRealInfo.ok === true, JSON.stringify(corridorsRealInfo));
  ok('CORRIDORS_REAL tiene >=15 corredores', corridorsRealInfo.count >= 15, JSON.stringify(corridorsRealInfo));
  ok('CORRIDORS_REAL tiene >=1000 vertices totales (geom dense)', corridorsRealInfo.total >= 1000, JSON.stringify(corridorsRealInfo));
  ok('algun corredor urbano tiene >=20 vertices reales', corridorsRealInfo.urbanMax >= 20, JSON.stringify(corridorsRealInfo));

  section('N28. v3.5.10 — popup de ruta NO contiene "· —" vacío');
  const popupCheck = await page.evaluate(() => {
    const m = window.__regionMaps && window.__regionMaps.lima && window.__regionMaps.lima.map;
    if (!m) return { ok:false, reason:'no-map' };
    const polylines = [];
    m.eachLayer(l => { if (l instanceof L.Polyline && l.getPopup) polylines.push(l); });
    if (!polylines.length) return { ok:false, reason:'no-polylines' };
    let dashOffense = 0, popups = 0, withRelated = 0, withSource = 0, withPatron = 0;
    const samples = [];
    polylines.forEach(pl => {
      const c = pl.getPopup() && pl.getPopup().getContent();
      if (!c) return;
      popups++;
      if (/\u00b7\s*\u2014/.test(c) || /\u00b7\s*-\s*<\/div>/.test(c)) dashOffense++;
      if (/mp-related/.test(c)) withRelated++;
      if (/href="https?:/.test(c)) withSource++;
      if (/mp-patron/.test(c)) withPatron++;
      if (samples.length < 2) samples.push(c.slice(0,300));
    });
    return { ok:true, popups, dashOffense, withRelated, withSource, withPatron, samples };
  });
  ok('hay popups de ruta', popupCheck.ok && popupCheck.popups > 0, JSON.stringify(popupCheck));
  ok('ningún popup de ruta tiene "· —" vacío', popupCheck.dashOffense === 0, JSON.stringify(popupCheck));

  section('N29. v3.5.10 — popup de ruta linkea a eventos relacionados (al menos 1 en Lima)');
  ok('al menos 1 popup en Lima tiene "Eventos relacionados"', popupCheck.withRelated >= 1, JSON.stringify(popupCheck));

  section('N30. v3.5.10 — popup de ruta tiene link a fuente externa');
  ok('al menos 1 popup tiene link a fuente https://', popupCheck.withSource >= 1, JSON.stringify(popupCheck));

  section('N27. v3.5.9 — polyline urbana renderizada en Lima sigue geometría densa');
  const limaPolyMax = await page.evaluate(() => {
    const map = document.querySelector('#map-lima');
    if (!map) return 0;
    const paths = map.querySelectorAll('.leaflet-overlay-pane svg path');
    let maxV = 0;
    paths.forEach(p => {
      const d = p.getAttribute('d') || '';
      const v = (d.match(/[MLml]/g) || []).length;
      if (v > maxV) maxV = v;
    });
    return maxV;
  });
  ok('polyline en #map-lima tiene >=20 vertices (real road geometry)', limaPolyMax >= 20, `maxV=${limaPolyMax}`);

  section('N31. v3.5.11 — sección Top 6 países fue reemplazada por actas');
  const actasCheck = await page.evaluate(() => {
    const oldGrid = document.querySelector('#rev-paises-grid');
    const newSection = document.querySelector('.rev-actas');
    const oldH3 = Array.from(document.querySelectorAll('.rev-paises h3, .rev-actas h3')).map(h => h.textContent || '');
    const hasTop6 = oldH3.some(t => /Top 6 países/i.test(t));
    return {
      oldGridExistsAndPopulated: !!(oldGrid && oldGrid.children && oldGrid.children.length > 0),
      newSectionExists: !!newSection,
      hasTop6Heading: hasTop6
    };
  });
  ok('NO hay Top 6 países renderizado', !actasCheck.oldGridExistsAndPopulated && !actasCheck.hasTop6Heading, JSON.stringify(actasCheck));
  ok('sección .rev-actas existe', actasCheck.newSectionExists, JSON.stringify(actasCheck));

  section('N32. v3.5.11 — tabla de actas pendientes renderizada con filas');
  const pendCheck = await page.evaluate(() => {
    const tbl = document.querySelector('#rev-pendientes-table table');
    const rows = tbl ? tbl.querySelectorAll('tbody tr').length : 0;
    const sum = (document.querySelector('#rev-pendientes-sum') || {}).textContent || '';
    return { rows, sum };
  });
  ok('al menos 3 filas en actas pendientes', pendCheck.rows >= 3, JSON.stringify(pendCheck));
  ok('sum de actas pendientes no está vacío', /\d/.test(pendCheck.sum), JSON.stringify(pendCheck));

  section('N33. v3.5.11 — tabla de actas impugnadas renderizada con regiones + escenarios');
  const impCheck = await page.evaluate(() => {
    const tbl = document.querySelector('#rev-impugnadas-table table');
    const rows = tbl ? tbl.querySelectorAll('tbody tr').length : 0;
    const sum = (document.querySelector('#rev-impugnadas-sum') || {}).textContent || '';
    const pf = (document.querySelector('#rev-impact-pf') || {}).textContent || '';
    const ps = (document.querySelector('#rev-impact-ps') || {}).textContent || '';
    const critico = (document.querySelector('#rev-impact-critico') || {}).textContent || '';
    const fuentes = document.querySelectorAll('#rev-actas-fuentes a').length;
    return { rows, sum, pfLen: pf.length, psLen: ps.length, criticoLen: critico.length, fuentes };
  });
  ok('al menos 4 filas en actas impugnadas', impCheck.rows >= 4, JSON.stringify(impCheck));
  ok('escenario pro-Fujimori y pro-Sánchez tienen texto', impCheck.pfLen > 30 && impCheck.psLen > 30, JSON.stringify(impCheck));
  ok('factor crítico renderizado', impCheck.criticoLen > 30, JSON.stringify(impCheck));
  ok('al menos 3 fuentes linkeadas', impCheck.fuentes >= 3, JSON.stringify(impCheck));

  section('N34. v3.5.12 — row foldable de Extranjero existe y se expande');
  const foldCheck = await page.evaluate(async () => {
    const rows = document.querySelectorAll('.rev-actas-row-foldable');
    if (rows.length === 0) return { rows: 0 };
    let extRow = null;
    rows.forEach(r => {
      if ((r.querySelector('.rev-actas-origen') || {}).textContent && /Extranjero/i.test(r.querySelector('.rev-actas-origen').textContent)) extRow = r;
    });
    if (!extRow) return { rows: rows.length, extFound: false };
    extRow.click();
    await new Promise(r => setTimeout(r, 60));
    const subrow = document.querySelector('.rev-actas-subrow');
    const visible = subrow && subrow.style.display !== 'none';
    const subTbl = document.querySelector('.rev-actas-sub-tbl');
    const countryRows = subTbl ? subTbl.querySelectorAll('tbody tr:not(.rev-actas-sub-cont)').length : 0;
    const contRows = subTbl ? subTbl.querySelectorAll('tbody tr.rev-actas-sub-cont').length : 0;
    const hasONPE = !!(document.querySelector('.rev-actas-sub-fuente') && /ONPE/i.test(document.querySelector('.rev-actas-sub-fuente').textContent));
    return { rows: rows.length, extFound: true, visible, countryRows, contRows, hasONPE };
  });
  ok('al menos 1 row foldable existe', foldCheck.rows >= 1, JSON.stringify(foldCheck));
  ok('row Extranjero encontrada', foldCheck.extFound === true, JSON.stringify(foldCheck));
  ok('sub-row se vuelve visible al click', foldCheck.visible === true, JSON.stringify(foldCheck));
  ok('al menos 70 países listados', foldCheck.countryRows >= 70, JSON.stringify(foldCheck));
  ok('al menos 5 grupos de continente', foldCheck.contRows >= 5, JSON.stringify(foldCheck));
  ok('fuente directa ONPE etiquetada', foldCheck.hasONPE === true, JSON.stringify(foldCheck));

  section('N35. v3.6.0 — BLUF section renders with KPIs and manifestaciones críticas');
  const blufCheck = await page.evaluate(() => {
    const sec = document.getElementById('bluf');
    const kpis = document.querySelectorAll('#bluf-kpis .bluf-kpi');
    const crits = document.querySelectorAll('#bluf-crit-list .bluf-crit-card');
    const watch = document.querySelectorAll('#bluf-watch-list li');
    return { hasSec: !!sec, kpis: kpis.length, crits: crits.length, watch: watch.length };
  });
  ok('sección #bluf existe', blufCheck.hasSec === true, JSON.stringify(blufCheck));
  ok('BLUF tiene ≥6 KPIs', blufCheck.kpis >= 6, JSON.stringify(blufCheck));
  ok('BLUF tiene ≥3 manifestaciones críticas', blufCheck.crits >= 3, JSON.stringify(blufCheck));
  ok('BLUF tiene 3 things-to-watch', blufCheck.watch >= 3, JSON.stringify(blufCheck));

  section('N36. v3.6.0 — Forecast ML section con punto central, IC, escenarios y drivers');
  const fmlCheck = await page.evaluate(() => {
    const sec = document.getElementById('forecast-ml');
    const kpis = document.querySelectorAll('#fml-kpis .fml-kpi');
    const icRows = document.querySelectorAll('#fml-ic-bars .fml-ic-row');
    const escs = document.querySelectorAll('#fml-escenarios .fml-esc');
    const drvs = document.querySelectorAll('#fml-drivers .fml-driver');
    const hasPoint = !!document.querySelector('#fml-kpis .fml-kpi[data-kind="point"] .fml-kpi-value');
    return { hasSec: !!sec, kpis: kpis.length, icRows: icRows.length, escs: escs.length, drvs: drvs.length, hasPoint };
  });
  ok('sección #forecast-ml existe', fmlCheck.hasSec === true, JSON.stringify(fmlCheck));
  ok('Forecast ML tiene ≥4 KPIs', fmlCheck.kpis >= 4, JSON.stringify(fmlCheck));
  ok('Forecast ML tiene punto central renderizado', fmlCheck.hasPoint === true, JSON.stringify(fmlCheck));
  ok('Forecast ML tiene 3 IC bars (50/80/95)', fmlCheck.icRows === 3, JSON.stringify(fmlCheck));
  ok('Forecast ML tiene ≥5 escenarios', fmlCheck.escs >= 5, JSON.stringify(fmlCheck));
  ok('Forecast ML tiene ≥5 drivers cuantificados', fmlCheck.drvs >= 5, JSON.stringify(fmlCheck));

  section('N37. v3.6.0 — Toggle ocultar-eventos-pasados activo por defecto y persistente');
  const hidePastCheck = await page.evaluate(() => {
    const chk = document.getElementById('hidePastToggle');
    const initiallyChecked = !!(chk && chk.checked);
    const bodyHasClass = document.body.classList.contains('hide-past');
    // Count past events visible vs hidden
    const pastEls = Array.from(document.querySelectorAll('[data-es-pasado="true"]'));
    const pastTotal = pastEls.length;
    const pastHidden = pastEls.filter(e => {
      const cs = window.getComputedStyle(e);
      return cs.display === 'none';
    }).length;
    return { initiallyChecked, bodyHasClass, pastTotal, pastHidden };
  });
  ok('checkbox #hidePastToggle existe y está marcado por defecto', hidePastCheck.initiallyChecked === true, JSON.stringify(hidePastCheck));
  ok('body.hide-past activo al cargar', hidePastCheck.bodyHasClass === true, JSON.stringify(hidePastCheck));
  ok('hay ≥5 eventos marcados como pasados', hidePastCheck.pastTotal >= 5, JSON.stringify(hidePastCheck));
  ok('todos los eventos pasados ocultos visualmente', hidePastCheck.pastHidden === hidePastCheck.pastTotal && hidePastCheck.pastTotal > 0, JSON.stringify(hidePastCheck));

  section('N38. v3.6.0 — Foldable detail sections cerradas por defecto (pirámide BCG)');
  const foldDefaultCheck = await page.evaluate(() => {
    const targets = ['reversion-section', 'forecast-ml-section', 'validacion-section', 'reversion-detail', 'validacion-detail', 'alt-media', 'disinfo', 'risk-matrix', 'early-warning', 'fml-detail'];
    const states = targets.map(t => {
      const d = document.querySelector(`details.foldable[data-fold="${t}"]`);
      return { name: t, exists: !!d, open: d ? d.hasAttribute('open') : null };
    });
    return states;
  });
  const allClosed = foldDefaultCheck.every(s => s.exists && s.open === false);
  ok('al menos 10 detalles foldable existen', foldDefaultCheck.filter(s => s.exists).length >= 10, JSON.stringify(foldDefaultCheck));
  ok('todos los foldables del landing están cerrados por defecto', allClosed === true, JSON.stringify(foldDefaultCheck));

  section('N52. v3.8.1 — Secciones electorales 2b/2b·ML/2c plegadas por defecto');
  const electionFoldCheck = await page.evaluate(() => {
    const inClosedSection = (el) => !!(el && el.closest('details.section-foldable:not([open])'));
    const ids = ['reversion-section', 'forecast-ml-section', 'validacion-section'];
    const targets = [
      document.querySelector('#reversion .reversion-kpis'),
      document.getElementById('fml-kpis'),
      document.querySelector('#validacion .val-headline')
    ];
    return ids.map((id, i) => {
      const d = document.querySelector(`details.foldable[data-fold="${id}"]`);
      return { id, exists: !!d, open: d ? d.hasAttribute('open') : null, contentInClosed: inClosedSection(targets[i]) };
    });
  });
  ok('reversion-section existe y cerrada', electionFoldCheck[0].exists && electionFoldCheck[0].open === false, JSON.stringify(electionFoldCheck[0]));
  ok('forecast-ml-section existe y cerrada', electionFoldCheck[1].exists && electionFoldCheck[1].open === false, JSON.stringify(electionFoldCheck[1]));
  ok('validacion-section existe y cerrada', electionFoldCheck[2].exists && electionFoldCheck[2].open === false, JSON.stringify(electionFoldCheck[2]));
  ok('contenido electoral dentro de sección plegada', electionFoldCheck.every(s => s.contentInClosed === true), JSON.stringify(electionFoldCheck));

  section('N39. v3.6.1 — Brand title bump + ML KPI block layout + es-PE number formatting');
  const v361Check = await page.evaluate(() => {
    const title = document.title;
    const brandTitle = document.querySelector('.brand-title')?.textContent.trim();
    const fmlValues = [...document.querySelectorAll('#fml-kpis .fml-kpi-value')].map(v => v.textContent.trim());
    const fmlValueDisplay = document.querySelector('#fml-kpis .fml-kpi-value');
    const valueDisplay = fmlValueDisplay ? getComputedStyle(fmlValueDisplay).display : null;
    const icBounds = [...document.querySelectorAll('.fml-ic-bounds')].map(b => b.textContent.trim());
    const navOrder = [...document.querySelectorAll('#primaryNav a')].map(a => a.getAttribute('href'));
    return { title, brandTitle, fmlValues, valueDisplay, icBounds, navOrder };
  });
  ok('brand title actualizado a v3.9.3', /v3\.9\.3/.test(v361Check.brandTitle || ''), v361Check.brandTitle);
  ok('document.title actualizado a v3.9.3', /v3\.9\.3/.test(v361Check.title), v361Check.title);
  ok('fml-kpi-value renderiza como block', v361Check.valueDisplay === 'block', `display=${v361Check.valueDisplay}`);
  const hasEsThousands = (v361Check.fmlValues.find(v => /\d{1,3}\.\d{3}/.test(v)) || '');
  ok('formato es-PE con punto en miles (ej: +1.886)', /\d{1,3}\.\d{3}/.test(hasEsThousands), hasEsThousands || JSON.stringify(v361Check.fmlValues));
  ok('IC bounds usan formato es-PE con punto', v361Check.icBounds.some(b => /\d{1,3}\.\d{3}/.test(b)), JSON.stringify(v361Check.icBounds));
  ok('nav order: BLUF primero', v361Check.navOrder[0] === '#bluf', JSON.stringify(v361Check.navOrder));
  ok('nav order: Forecast después de Reversión (DOM-aligned)', v361Check.navOrder.indexOf('#forecast-ml') > v361Check.navOrder.indexOf('#reversion'), JSON.stringify(v361Check.navOrder));

  section('N40. v3.7.0 — forecast_ml margen central ≥ 18.000 votos');
  const fmlData = data_v357.forecast_ml || {};
  const margenCentral = (fmlData.punto_central || {}).margen_final_votos;
  ok('forecast_ml.punto_central.margen_final_votos ≥ 18000', typeof margenCentral === 'number' && margenCentral >= 18000, `got=${margenCentral}`);

  section('N41. v3.7.0 — P(Fujimori) ≥ 0,95 e IC95 lower bound > 0');
  const probF = (fmlData.probabilidad_victoria || {}).fujimori;
  ok('P(Fujimori) ≥ 0.95', typeof probF === 'number' && probF >= 0.95, `got=${probF}`);
  const ic95 = (fmlData.intervalos_confianza || {}).ic_95;
  ok('IC95 es array de 2 elementos', Array.isArray(ic95) && ic95.length === 2, JSON.stringify(ic95));
  ok('IC95 lower bound > 0 (ya no cruza cero)', Array.isArray(ic95) && ic95[0] > 0, `lower=${ic95 && ic95[0]}`);

  section('N42. v3.7.0 — bloque escrutinio_realtime con cifras_actuales');
  const er = data_v357.escrutinio_realtime || {};
  ok('escrutinio_realtime existe', Object.keys(er).length > 0, `keys=${Object.keys(er).length}`);
  ok('escrutinio_realtime.cifras_actuales presente', !!er.cifras_actuales, JSON.stringify(Object.keys(er)));
  ok('cifras_actuales.margen_actual numérico', typeof (er.cifras_actuales || {}).margen_actual === 'number', `got=${(er.cifras_actuales || {}).margen_actual}`);

  section('N43. v3.7.0 — bloque prediccion_7dias con 5 regiones');
  const p7 = data_v357.prediccion_7dias || {};
  const p7Regions = ['lima','norte','centro','sur','oriente'].filter(k => k in p7);
  ok('prediccion_7dias cubre lima+norte+centro+sur+oriente', p7Regions.length === 5, `found=${JSON.stringify(p7Regions)}`);

  section('N44. v3.7.0 — ≥ 150 convocatorias_futuras agregadas en regions');
  let totalConv = 0;
  for (const rid of Object.keys(data_v357.regions || {})) {
    const r = data_v357.regions[rid];
    totalConv += (r.convocatorias_futuras || r.events_future || []).length;
  }
  ok('total convocatorias_futuras ≥ 150', totalConv >= 150, `total=${totalConv}`);

  section('N45. v3.7.0 — risk_matrix y early_warning_indicators ampliados');
  ok('risk_matrix ≥ 19 entradas', (data_v357.risk_matrix || []).length >= 19, `len=${(data_v357.risk_matrix || []).length}`);
  ok('early_warning_indicators ≥ 19 entradas', (data_v357.early_warning_indicators || []).length >= 19, `len=${(data_v357.early_warning_indicators || []).length}`);

  section('N46. v3.8.0 — escrutinio margen ≥ 33.000 votos');
  const er38 = data_v357.escrutinio_realtime || {};
  const margen38 = (er38.cifras_actuales || {}).margen_actual;
  ok('escrutinio_realtime margen ≥ 33000', typeof margen38 === 'number' && margen38 >= 33000, `got=${margen38}`);

  section('N47. v3.8.0 — forecast_ml margen central ≥ 40.000');
  const fml38 = data_v357.forecast_ml || {};
  const margenCentral38 = (fml38.punto_central || {}).margen_final_votos;
  ok('forecast_ml margen central ≥ 40000', typeof margenCentral38 === 'number' && margenCentral38 >= 40000, `got=${margenCentral38}`);

  section('N48. v3.8.0 — risk_matrix ≥ 26 y BLUF sin CGTP 17-jun');
  ok('risk_matrix ≥ 26 entradas', (data_v357.risk_matrix || []).length >= 26, `len=${(data_v357.risk_matrix || []).length}`);
  const blufCrit = (data_v357.bluf || {}).manifestaciones_criticas_top || [];
  const hasCgtp17 = blufCrit.some(c => /CGTP/i.test(c.nombre || '') && /17/.test(c.fecha || ''));
  ok('BLUF críticas no incluye CGTP 17-jun erróneo', hasCgtp17 === false, `criticas=${blufCrit.length}`);

  section('N49. v3.9.0 — escrutinio ≥ 41.500 y Ilave inactivo en BLUF');
  const er391 = data_v357.escrutinio_realtime || {};
  const m391 = (er391.cifras_actuales || {}).margen_actual;
  ok('escrutinio margen ≥ 41500', typeof m391 === 'number' && m391 >= 41500, `got=${m391}`);
  const ilaveCrit = blufCrit.find(c => /Ilave/i.test(c.nombre || ''));
  ok('BLUF Ilave marcado inactivo/no verificado', ilaveCrit && /inactivo|incierto|NO verificado/i.test((ilaveCrit.estado || '') + (ilaveCrit.nombre || '')), JSON.stringify(ilaveCrit));

  section('N50. v3.8.1 — convocatoria Piura 23-jun en norte');
  const norteConv = (data_v357.regions || {}).norte || {};
  const hasPiura23 = (norteConv.convocatorias_futuras || []).some(c =>
    /23/.test(String(c.fecha || c.fecha_convocatoria || '')) && /piura|arrocer/i.test(JSON.stringify(c).toLowerCase())
  );
  ok('norte tiene convocatoria Piura/arrocera 23-jun', hasPiura23 === true, `found=${hasPiura23}`);

  section('N51. v3.8.1 — editorial pass: sin copy obsoleto y slots data-driven');
  const editorialCheck = await page.evaluate(() => {
    const body = document.body.innerText;
    const stale = [
      /98,26\s*%/,
      /\+1\.886/,
      /50,07\s*%/,
      /95,84\s*%/,
      /v3\.1 preparado/,
      /1\s*514 actas observadas mantienen el margen incierto/,
      /P\s*>\s*93\s*%/,
      /26\s*% escrutado/,
      /¿puede Fujimori mantener la ventaja/,
      /358\.060 votos pendientes/,
      /P\(Fuj revierte\)/
    ].map(rx => rx.test(body));
    return {
      postMargin: document.getElementById('post-margin')?.textContent.trim() || '',
      fmlDeck: document.getElementById('fml-deck')?.textContent.trim() || '',
      revVentajaSub: document.getElementById('rev-ventaja-sub')?.textContent.trim() || '',
      footerAbout: document.getElementById('footer-about')?.textContent.trim() || '',
      valLectura: document.querySelectorAll('#val-lectura li').length,
      metaDesc: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      staleHits: stale.filter(Boolean).length
    };
  });
  ok('sin strings obsoletos en body (98,26 / 1.886 / 50,07 / 95,84 / v3.1 / 1514 / P>93)', editorialCheck.staleHits === 0, `hits=${editorialCheck.staleHits}`);
  ok('#post-margin refleja margen ≥41.500', /41\.5\d{2}|41\.565/.test(editorialCheck.postMargin), editorialCheck.postMargin);
  ok('#fml-deck refleja proyección ≥44.000', /44\.8\d{2}|44\.800/.test(editorialCheck.fmlDeck), editorialCheck.fmlDeck);
  ok('#rev-ventaja-sub refleja 99,63 % escrutado', /99,63/.test(editorialCheck.revVentajaSub), editorialCheck.revVentajaSub);
  ok('#footer-about actualizado a v3.9.3', /v3\.9\.3/.test(editorialCheck.footerAbout) && !/v3\.1/.test(editorialCheck.footerAbout), editorialCheck.footerAbout.slice(0, 80));
  ok('#val-lectura tiene 4 bullets dinámicos', editorialCheck.valLectura === 4, `n=${editorialCheck.valLectura}`);
  ok('meta description incluye margen actualizado', /41\.565|41\.5/.test(editorialCheck.metaDesc), editorialCheck.metaDesc.slice(0, 100));
  const revH2Live = await page.evaluate(() => document.getElementById('rev-section-h2')?.textContent.trim() || '');
  ok('#rev-section-h2 refleja margen consolidado', /41\.5|Resultado consolidado/i.test(revH2Live), revH2Live);

  section('N53. v3.8.1 — Playwright editorial QA multi-viewport');
  const viewports = [
    { name: 'mobile-375', width: 375, height: 812 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1440', width: 1440, height: 900 }
  ];
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(350);
    const vpCheck = await page.evaluate(() => {
      const bodyW = document.body.scrollWidth;
      const viewW = document.documentElement.clientWidth;
      const slot = (id) => {
        const n = document.getElementById(id);
        const t = (n && n.textContent || '').trim();
        return { ok: t && t !== '—' && t.length > 8, text: t.slice(0, 70) };
      };
      return {
        overflow: bodyW > viewW + 4,
        bodyW, viewW,
        brandSub: (document.querySelector('.brand-sub')?.textContent || '').trim(),
        revH2: slot('rev-section-h2'),
        valDeck: slot('validacion-deck'),
        mercDesc: slot('val-mercados-desc'),
        alertHead: (document.getElementById('alert-headline')?.textContent || '').trim(),
        metaVer: (document.getElementById('meta-version')?.textContent || '').trim(),
        thProb: (document.getElementById('val-th-prob-fuj')?.textContent || '').trim(),
        blufKpis: document.querySelectorAll('#bluf-kpis .bluf-kpi').length,
        renderErrors: [/Invalid Date/, /\[object Object\]/].filter(rx => rx.test(document.body.innerText)).length
      };
    });
    ok(`${vp.name}: sin overflow horizontal`, vpCheck.overflow === false, `body=${vpCheck.bodyW} view=${vpCheck.viewW}`);
    ok(`${vp.name}: brand-sub con 99,63 %`, /99,63/.test(vpCheck.brandSub), vpCheck.brandSub);
    ok(`${vp.name}: rev-section-h2 poblado`, vpCheck.revH2.ok === true, vpCheck.revH2.text);
    ok(`${vp.name}: validacion-deck poblado`, vpCheck.valDeck.ok === true, vpCheck.valDeck.text);
    ok(`${vp.name}: val-mercados-desc poblado`, vpCheck.mercDesc.ok === true, vpCheck.mercDesc.text);
    ok(`${vp.name}: alert-headline poblado`, vpCheck.alertHead.length > 20, vpCheck.alertHead.slice(0, 50));
    ok(`${vp.name}: meta-version 3.9.3`, vpCheck.metaVer === '3.9.3', vpCheck.metaVer);
    ok(`${vp.name}: P(Fuj mantiene) en tabla`, /mantiene/i.test(vpCheck.thProb), vpCheck.thProb);
    ok(`${vp.name}: BLUF ≥6 KPIs`, vpCheck.blufKpis >= 6, `n=${vpCheck.blufKpis}`);
    ok(`${vp.name}: sin Invalid Date / [object Object]`, vpCheck.renderErrors === 0, `hits=${vpCheck.renderErrors}`);
  }

  section('N55. magnitude_methodology v1.1 — 9 plataformas');
  const platCount = (data_v357.magnitude_methodology || {}).plataformas || [];
  ok('magnitude_methodology.plataformas tiene 9 entradas', platCount.length === 9, `n=${platCount.length}`);
  ok('magnitude_methodology version 1.1', (data_v357.magnitude_methodology || {}).version === '1.1', (data_v357.magnitude_methodology || {}).version);
  const tier1 = (data_v357.magnitude_methodology || {}).tier_1 || [];
  ok('tier_1 incluye x, facebook, youtube', tier1.includes('x') && tier1.includes('facebook') && tier1.includes('youtube'), JSON.stringify(tier1));
  const methHtml = fs.readFileSync(path.join(REPO_ROOT, 'methodology', 'magnitude_methodology.html'), 'utf8');
  ok('magnitude_methodology.html tiene #plataformas', methHtml.includes('id="plataformas"'), 'missing');
  ok('magnitude_methodology.html v1.1', /v1\.1/.test(methHtml), 'version string');

  section('N56. v3.9.2 — cross-update risk_matrix / EW / executive_alerts');
  const rm392 = data_v357.risk_matrix || [];
  const ew392 = data_v357.early_warning_indicators || [];
  ok('risk_matrix ≥ 29 entradas', rm392.length >= 29, `len=${rm392.length}`);
  ok('early_warning_indicators ≥ 27 entradas', ew392.length >= 27, `len=${ew392.length}`);
  const rm27 = rm392.find(r => r.id === 'RM-27');
  ok('RM-27 JNE nulidad 2.408 actas existe', !!rm27 && /2\.408/.test(rm27.scenario || ''), rm27?.scenario?.slice(0, 60));
  const ew27 = ew392.find(e => e.id === 'EW-27');
  ok('EW-27 resolución JNE nulidad existe', !!ew27, ew27?.indicator);
  const surAlert = (data_v357.regions?.sur?.executive_alert || '');
  ok('sur executive_alert sin bloqueado activo', !/bloqueado activo/i.test(surAlert), surAlert.slice(0, 80));
  ok('lima executive_alert menciona marcha 19-jun ejecutada', /19-jun.*ejecutada|ejecutada.*19-jun/i.test(data_v357.regions?.lima?.executive_alert || ''), 'lima alert');
  const rm24 = rm392.find(r => r.id === 'RM-24');
  ok('RM-24 estado realizada', rm24?.estado === 'realizada', rm24?.estado);
  const bayesDesc392 = await page.evaluate(() => document.getElementById('val-bayes-desc')?.textContent || '');
  ok('#val-bayes-desc data-driven (41.565)', /41\.565/.test(bayesDesc392), bayesDesc392.slice(0, 80));

  section('N57. v3.9.3 — Round 3 per-entity + pre-22-jun');
  const p7r3 = data_v357.prediccion_7dias || {};
  ok('prediccion_7dias nota v3.9.3 Round 3', /v3\.9\.3|Round 3/i.test(p7r3.nota_metodologica || ''), p7r3.nota_metodologica);
  ok('norte prob_bloqueo_panamericana ≥ 0,65', (p7r3.norte || {}).prob_bloqueo_panamericana_norte >= 0.65, String((p7r3.norte || {}).prob_bloqueo_panamericana_norte));
  const norteCf = (data_v357.regions?.norte?.convocatorias_futuras || []).find(c => c.id === 'NORTE-PARO-023');
  ok('NORTE-PARO-023 prob realizacion ≥ 0,85', (norteCf?.probabilidad_realizacion || 0) >= 0.85, String(norteCf?.probabilidad_realizacion));
  ok('NORTE-PARO-023 magnitud M', norteCf?.magnitud_codigo === 'M', norteCf?.magnitud_codigo);
  const si393 = data_v357.social_intelligence || {};
  ok('social_intelligence fecha_corte 19-jun', /2026-06-19/.test(si393.fecha_corte || ''), si393.fecha_corte);
  const aguaTag = (si393.hashtags || []).find(h => h.hashtag === '#AguaSiMinaNo');
  ok('#AguaSiMinaNo round 3 presente', !!aguaTag && aguaTag.validacion_ronda === 3, aguaTag?.hashtag);
  const pachama = (si393.cuentas_emergentes || []).find(c => c.handle === '@PachamamaRadio_');
  ok('@PachamamaRadio_ round 3 presente', !!pachama && pachama.validacion_ronda === 3, pachama?.handle);
  const rm27r3 = (data_v357.risk_matrix || []).find(r => r.id === 'RM-27');
  ok('RM-27 menciona dejó al voto', /dejó al voto|dejo al voto/i.test(rm27r3?.scenario || ''), rm27r3?.scenario?.slice(0, 60));
  const rutasPiura = (data_v357.rutas_recurrentes_v370 || []).some(r => /El Trébol|Trebol/i.test(r.descripcion || ''));
  ok('ruta Piura El Trébol en rutas_recurrentes', rutasPiura === true, String(rutasPiura));
  const staleCatalysts = (data_v357.executive_alert?.catalysts || []).some(c => /Campo de Marte|bloqueado activo|99,07/i.test(c));
  ok('executive_alert catalysts sin copy stale', staleCatalysts === false, JSON.stringify((data_v357.executive_alert?.catalysts || []).slice(0, 2)));

  section('N54. magnitude methodology subsite link');
  const subsiteCheck = await page.evaluate(() => {
    const fold = document.getElementById('magnitude-methodology-subsite');
    const link = fold?.querySelector('.subsite-link');
    const footerLink = document.querySelector('.footer-subsite-link');
    return {
      foldExists: !!fold,
      href: link?.getAttribute('href') || '',
      footerHref: footerLink?.getAttribute('href') || '',
      target: link?.getAttribute('target') || '',
    };
  });
  ok('#magnitude-methodology-subsite existe en metodología', subsiteCheck.foldExists === true);
  ok('subsite-link apunta a methodology/magnitude_methodology.html', subsiteCheck.href === 'methodology/magnitude_methodology.html', subsiteCheck.href);
  ok('footer-subsite-link misma ruta', subsiteCheck.footerHref === 'methodology/magnitude_methodology.html', subsiteCheck.footerHref);
  ok('subsite abre en pestaña nueva', subsiteCheck.target === '_blank', subsiteCheck.target);

  section('N. Global — no dash-only badge anywhere in regions/social/EW');
  const allDashBadges = await page.evaluate(() => {
    const scope = Array.from(document.querySelectorAll(
      '#regions .badge, #regions .pill, #regions .chip, #regions .side, ' +
      '#social .badge, #social .pill, #social .chip, ' +
      '#ew-grid .badge, #ew-grid .pill, #ew-grid .chip, ' +
      '.live-card .badge, .live-card .pill, .handle-card .badge, .handle-card .pill'
    ));
    return scope.filter(b => {
      const t = (b.textContent || '').trim();
      return t === '\u2014' || t === '-' || t === '';
    }).length;
  });
  ok('no dash-only badge across regions/social/EW', allDashBadges === 0, `n=${allDashBadges}`);

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
