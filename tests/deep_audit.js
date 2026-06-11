#!/usr/bin/env node
/* Deep audit — section by section, element by element.
   Prints anomalies; does not assert. */
const path = require('path');
const { chromium } = require('playwright');
const HTML_PATH = path.resolve(__dirname, '..', 'dossier_osint_v3.2.html');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type()==='error') errors.push('console:'+m.text()); });
  await page.goto('file://' + HTML_PATH, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const report = await page.evaluate(() => {
    const out = {};
    const trim = s => (s||'').trim();
    const dashy = t => t==='' || t==='—' || t==='-' || /^N\/?D$/i.test(t);

    // Helper: check all visible elements within scope for issues
    function inspect(scopeSel, label) {
      const root = document.querySelector(scopeSel);
      if (!root) return { found: false };
      const issues = [];
      // text nodes with N/D, "null", "undefined", "[object Object]"
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const p = n.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (p.tagName==='SCRIPT'||p.tagName==='STYLE') return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let n=0;
      while (tw.nextNode()) {
        const t = tw.currentNode.textContent;
        if (/\bnull\b|\bundefined\b|\[object Object\]|NaN/.test(t) && t.length < 200) {
          issues.push({ kind:'bad-token', sample:t.trim().slice(0,120) });
        }
        if (/\bN\/?D\b/i.test(t)) issues.push({ kind:'nd-leak', sample:t.trim().slice(0,80) });
        // raw markdown
        if (/\[[^\]]+\]\(https?:\/\/[^)]+\)/.test(t)) issues.push({ kind:'raw-markdown', sample:t.trim().slice(0,120) });
      }
      // dash-only badges/pills/chips
      const badges = root.querySelectorAll('.badge, .pill, .chip, .tag, .label, .meta-chip');
      let dashBadges = 0;
      badges.forEach(b => { if (dashy(trim(b.textContent))) dashBadges++; });
      // empty links
      const emptyLinks = Array.from(root.querySelectorAll('a')).filter(a => !trim(a.textContent) && !a.querySelector('img,svg')).length;
      // broken href like "undefined" or "#"
      const badHrefs = Array.from(root.querySelectorAll('a[href]')).filter(a => {
        const h = a.getAttribute('href');
        return h==='undefined' || h==='null' || h==='[object Object]';
      }).length;
      return { found:true, issues: issues.slice(0,8), dashBadges, emptyLinks, badHrefs, cardCount: root.querySelectorAll('.card, .actor, .zone, .ew, .narrative-card, .handle-card, .hashtag-card, .live-card, .alt-card, .disinfo-card, .stat, .platform-card').length };
    }

    // ===== Per-region (lima only since we audit shape, not data) =====
    const regions = ['lima','norte','centro','sur','oriente'];
    out.regions = {};
    regions.forEach(rid => {
      const t = document.querySelector(`.tab-btn[data-region="${rid}"]`);
      if (t) t.click();
      const panel = document.getElementById(`panel-${rid}`);
      if (!panel) { out.regions[rid] = { found:false }; return; }
      const res = inspect(`#panel-${rid}`, rid);
      // sub-sections present
      const subs = Array.from(panel.querySelectorAll('.region-subsection h4')).map(h => trim(h.textContent));
      // zone cards
      const zones = Array.from(panel.querySelectorAll('.zone')).map(z => ({
        text: trim(z.textContent).slice(0,80),
        children: z.children.length
      }));
      // actor cards
      const actors = Array.from(panel.querySelectorAll('.actor')).map(a => ({
        text: trim(a.textContent).slice(0,80),
        hasName: !!a.querySelector('.a-name, h4, h5'),
        hasMeta: !!a.querySelector('.a-meta, .meta')
      }));
      // events with risk/side labels
      const events = Array.from(panel.querySelectorAll('.cards .card')).slice(0,20).map(c => ({
        title: trim(c.querySelector('h4,h5,.e-title,.title')?.textContent || ''),
        badgeTexts: Array.from(c.querySelectorAll('.badge,.pill,.chip')).map(b=>trim(b.textContent)),
        hasDate: !!c.querySelector('.e-date, .date'),
        hasLink: !!c.querySelector('a[href^="http"]')
      }));
      // routes/corridors
      const routes = panel.querySelectorAll('.route, .route-card, .corridor').length;
      out.regions[rid] = { ...res, subs, zonesSample: zones.slice(0,3), actorsSample: actors.slice(0,3), eventsSample: events.slice(0,4), routes };
    });

    // ===== Global sections =====
    out.executiveAlert = inspect('#executive-alert, .executive-alert, [data-section="executive_alert"]', 'alert');
    out.context = inspect('#context, .context-section', 'context');
    out.postElectoral = inspect('#post-electoral, .post-electoral, [data-section="post_electoral"]', 'post');
    out.narratives = inspect('#narratives-grid', 'narratives');
    out.altMedia = inspect('#alt-grid, #altmedia-grid, .alt-grid', 'alt');
    out.disinfo = inspect('#disinfo-grid, .disinfo-grid', 'disinfo');
    out.riskMatrix = inspect('#risk-matrix, .risk-matrix-section', 'risk');
    out.method = inspect('#method-grid, #methodology-grid', 'method');
    out.sources = inspect('#sources-list, .sources-list, #sources-grid', 'sources');
    out.montecarlo = inspect('#montecarlo, .montecarlo-section, [data-section="montecarlo"]', 'mc');
    out.early = inspect('#ew-grid, .ew-grid', 'ew');
    out.handles = inspect('#handles-grid', 'handles');
    out.hashtags = inspect('#hashtags-grid', 'hashtags');
    out.platforms = inspect('#platforms-grid', 'platforms');
    out.lives = inspect('#lives-grid', 'lives');
    out.stats = inspect('#social-stats', 'stats');

    // Detail: narratives cards anatomy
    out.narrativeCards = Array.from(document.querySelectorAll('#narratives-grid .narrative-card')).slice(0,3).map(c => ({
      sideBadge: trim(c.querySelector('.n-side')?.textContent || ''),
      title: trim(c.querySelector('h4,h5,.n-title')?.textContent || ''),
      summary: trim(c.querySelector('.n-summary, p')?.textContent || '').slice(0,100),
      hasReach: !!c.querySelector('.n-reach, .reach'),
      hasSources: !!c.querySelector('a[href^="http"]'),
      keys: Array.from(c.children).map(ch=>ch.className||ch.tagName).slice(0,8)
    }));
    out.altCards = Array.from(document.querySelectorAll('#alt-grid .alt-card, #altmedia-grid .alt-card')).slice(0,3).map(c => ({
      title: trim(c.querySelector('h4,h5')?.textContent || ''),
      text: trim(c.textContent).slice(0,120),
      hasLink: !!c.querySelector('a[href^="http"]'),
      children: c.children.length
    }));
    out.disinfoCards = Array.from(document.querySelectorAll('#disinfo-grid .disinfo-card, #disinfo-grid .card')).slice(0,3).map(c => ({
      title: trim(c.querySelector('h4,h5,.d-title')?.textContent || ''),
      text: trim(c.textContent).slice(0,140),
      hasLink: !!c.querySelector('a[href^="http"]'),
      children: c.children.length
    }));
    out.handleCardsSample = Array.from(document.querySelectorAll('#handles-grid .handle-card, #handles-grid .card')).slice(0,3).map(c => ({
      name: trim(c.querySelector('.h-name, h4, h5')?.textContent || ''),
      handle: trim(c.querySelector('.h-handle, .handle')?.textContent || ''),
      followers: trim(c.querySelector('.h-followers, .followers')?.textContent || ''),
      hasLink: !!c.querySelector('a[href^="http"]')
    }));
    out.sourceRows = Array.from(document.querySelectorAll('#sources-list li, #sources-grid li, #sources-list .source')).slice(0,3).map(li => ({
      text: trim(li.textContent).slice(0,140),
      hasLink: !!li.querySelector('a[href^="http"]')
    }));

    // Histogram, paises, sensibilidad
    out.histogram = !!document.querySelector('#histogram, .histogram, canvas');
    out.paises = document.querySelectorAll('#paises-tbody tr, .paises tr').length;
    out.sensibilidad = document.querySelectorAll('#sens-tbody tr, .sensibilidad tr').length;
    out.validacion = document.querySelectorAll('#validacion-list li, .validacion li').length;
    out.bayesian = !!document.querySelector('#bayesian, [id*="bayesian"], .bayesian');
    out.adversarial = !!document.querySelector('#adversarial, [id*="adversarial"]');
    out.mercados = !!document.querySelector('#mercados, [id*="mercados"]');

    return out;
  });

  console.log('JS errors during load:', errors.length);
  if (errors.length) errors.slice(0,5).forEach(e => console.log('  -', e));

  // Print summary
  console.log('\n========== REGION SUMMARY ==========');
  for (const [rid, r] of Object.entries(report.regions)) {
    console.log(`\n[${rid}] dashBadges=${r.dashBadges} emptyLinks=${r.emptyLinks} cards=${r.cardCount} routes=${r.routes} subs=${r.subs.join('|')}`);
    if (r.issues.length) r.issues.forEach(i => console.log(`  ISSUE [${i.kind}] ${i.sample}`));
    console.log('  events:', JSON.stringify(r.eventsSample.slice(0,2), null, 0).slice(0,300));
    console.log('  actors:', JSON.stringify(r.actorsSample.slice(0,2), null, 0).slice(0,200));
    console.log('  zones:', JSON.stringify(r.zonesSample.slice(0,2), null, 0).slice(0,200));
  }

  console.log('\n========== GLOBAL SECTIONS ==========');
  const sectionKeys = ['executiveAlert','context','postElectoral','narratives','altMedia','disinfo','riskMatrix','method','sources','montecarlo','early','handles','hashtags','platforms','lives','stats'];
  sectionKeys.forEach(k => {
    const s = report[k];
    if (!s) { console.log(`${k}: missing`); return; }
    console.log(`\n${k}: found=${s.found} cards=${s.cardCount} dashBadges=${s.dashBadges} emptyLinks=${s.emptyLinks} badHrefs=${s.badHrefs}`);
    if (s.issues && s.issues.length) s.issues.forEach(i => console.log(`  ISSUE [${i.kind}] ${i.sample}`));
  });

  console.log('\n========== CARDS DETAIL ==========');
  console.log('narrativeCards:', JSON.stringify(report.narrativeCards, null, 0).slice(0,800));
  console.log('altCards:', JSON.stringify(report.altCards, null, 0).slice(0,800));
  console.log('disinfoCards:', JSON.stringify(report.disinfoCards, null, 0).slice(0,800));
  console.log('handleCardsSample:', JSON.stringify(report.handleCardsSample, null, 0).slice(0,800));
  console.log('sourceRows:', JSON.stringify(report.sourceRows, null, 0).slice(0,500));
  console.log('\nmc-related: hist=', report.histogram, 'paises=', report.paises, 'sens=', report.sensibilidad, 'valid=', report.validacion, 'bayes=', report.bayesian, 'adv=', report.adversarial, 'merc=', report.mercados);

  await browser.close();
})();
