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
