/* =====================================================
   Dossier OSINT v2 — render dinámico desde events.json
   Estructura: meta, executive_alert, context, regions,
   post_electoral, risk_matrix, early_warning_indicators,
   methodology, sources_index.
   ===================================================== */

(function () {
  'use strict';

  // ---------- Utils ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = (tag, attrs, children) => {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (v === true) n.setAttribute(k, '');
      else n.setAttribute(k, v);
    }
    if (children) (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  };
  const text = (sel, v) => { const n = $(sel); if (n) n.textContent = (v == null || v === '') ? '—' : v; };
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const STATE_BADGE = {
    'confirmado': { cls: 'badge-confirmado', label: 'Confirmado' },
    'en curso':   { cls: 'badge-confirmado', label: 'En curso' },
    'activo':     { cls: 'badge-confirmado', label: 'Activo' },
    'probable':   { cls: 'badge-probable',   label: 'Probable' },
    'latente':    { cls: 'badge-latente',    label: 'Latente' },
    'amenaza':    { cls: 'badge-latente',    label: 'Amenaza' },
    'espontaneo': { cls: 'badge-espontaneo', label: 'Espontáneo' },
    'espontáneo': { cls: 'badge-espontaneo', label: 'Espontáneo' }
  };
  const stateInfo = (s) => {
    const k = String(s || '').toLowerCase().trim();
    if (STATE_BADGE[k]) return STATE_BADGE[k];
    // partial match
    for (const key in STATE_BADGE) if (k.includes(key)) return STATE_BADGE[key];
    return { cls: 'badge-latente', label: s || '—' };
  };

  const riskCls = (lvl) => {
    const k = String(lvl || '').toLowerCase().trim();
    if (k.includes('máx') || k.includes('max')) return 'risk-maximo';
    if (k.includes('muy alto')) return 'risk-alto';
    if (k.includes('alto')) return 'risk-alto';
    if (k.includes('medio') || k.includes('moder')) return 'risk-moderado';
    if (k.includes('bajo')) return 'risk-bajo';
    return 'risk-moderado';
  };
  const titleCase = (s) => String(s || '').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
  const riskLabel = (lvl) => lvl ? String(lvl) : '—';

  // ---------- Header / menu ----------
  const menuBtn = $('#menuBtn');
  const nav = $('#primaryNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', e => {
      if (e.target.tagName === 'A' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- Load ----------
  Promise.all([
    fetch('data/events.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('No se pudo cargar events.json (HTTP ' + r.status + ')'); return r.json(); }),
    fetch('data/montecarlo.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null)
  ])
    .then(([events, mc]) => { if (mc) events.montecarlo = mc; return events; })
    .then(render)
    .catch(err => {
      console.error(err);
      const m = $('#main');
      if (m) m.insertAdjacentHTML('afterbegin',
        `<div class="container"><div class="alert" style="border-left-color:var(--c-risk-alto);margin:var(--s-10) 0;padding:var(--s-6)">
          <h2 style="font-size:var(--text-lg)">Error al cargar el dossier</h2>
          <p style="font-size:var(--text-sm);color:var(--c-ink-2)">${escapeHtml(err.message)}</p>
        </div></div>`);
    });

  // ---------- Render ----------
  function render(d) {
    const meta = d.meta || {};
    text('#meta-date', meta.generated_at ? formatDate(meta.generated_at) : '9 jun 2026');
    text('#meta-focus', '5 macroregiones · Perú');
    text('#meta-version', meta.version || '2.0');
    const srcCount = (d.sources_index || []).length;
    text('#meta-sources-count', srcCount || '—');
    text('#window-label', 'Ventana de monitoreo · ' + (meta.window || 'próximos 7-10 días'));
    text('#footer-meta', `Dossier OSINT · v${meta.version || '2.0'} · ${meta.scope ? 'Perú' : ''}`);

    renderExecutiveAlert(d.executive_alert || {});
    renderContext(d.context || {});
    renderPostElectoral(d.post_electoral || {});
    // v3.1: stash grassroots data for buildRegionContent to consume
    window.__grassroots = d.grassroots || {};
    renderRegions(d.regions || {});
    renderNationalGrassroots(window.__grassroots.nacional || {});
    renderSocialIntelligence(d.social_intelligence || {});
    renderLiveStreams(d.live_streams || []);
    renderNarratives(d.narratives || []);
    renderAltMedia(d.alt_media || []);
    renderDisinfo(d.disinformation_cases || []);
    renderRiskMatrix(d.risk_matrix || []);
    renderReversion(d.montecarlo || null);
    renderEarlyWarning(d.early_warning_indicators || []);
    renderMethod(d.methodology || {});
    renderSources(d.sources_index || []);
  }

  function formatDate(iso) {
    try { const d = new Date(iso); return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return iso; }
  }

  // ---------- Executive alert ----------
  function renderExecutiveAlert(a) {
    text('#alert-level-text', a.level || 'Alerta');
    text('#alert-headline', a.headline || '—');
    text('#alert-summary', a.key_finding || '—');

    // catalysts + top_risks → acciones inmediatas (top_risks tienen mayor prioridad operativa)
    const list = $('#alert-actions-list');
    if (list) {
      list.innerHTML = '';
      (a.top_risks_24_72h || []).forEach(act => list.appendChild(el('li', null, act)));
      (a.catalysts || []).slice(0, 3).forEach(act => list.appendChild(el('li', null, act)));
    }
    const badge = $('#alert-level-badge');
    if (badge) {
      const lvl = String(a.level || '').toLowerCase();
      badge.style.background = lvl.includes('máx') || lvl.includes('max') ? '#5c0d0d'
        : lvl.includes('alto') ? 'var(--c-risk-alto)'
        : lvl.includes('moder') || lvl.includes('medio') ? 'var(--c-amber)'
        : 'var(--c-amber)';
    }
    // emergency contacts (línea estándar)
    const emerg = $('#alert-emerg');
    if (emerg) {
      emerg.innerHTML = '';
      const contacts = [
        { label: 'Emergencias PNP', value: '105' },
        { label: 'Bomberos', value: '116' },
        { label: 'Cruz Roja', value: '115' },
        { label: 'Defensoría del Pueblo', value: '0800-15170' }
      ];
      contacts.forEach(c => emerg.appendChild(el('div', null, [
        el('span', null, c.label),
        el('strong', null, c.value)
      ])));
    }
  }

  // ---------- Context ----------
  function renderContext(ctx) {
    const grid = $('#context-grid');
    if (!grid) return;
    grid.innerHTML = '';
    // ctx puede ser objeto con secciones o array
    if (Array.isArray(ctx)) {
      ctx.forEach(c => grid.appendChild(buildCtxCard(c.title, c.points)));
      return;
    }
    // Objeto: convierto cada clave en una ctx card
    if (ctx.election_state) {
      const es = ctx.election_state;
      const points = [
        es.second_round && `2da vuelta: <strong>${escapeHtml(es.second_round)}</strong>`,
        es.scrutinized_pct && `Escrutado: <strong>${escapeHtml(es.scrutinized_pct)}</strong>`,
        es.sanchez_pct && es.fujimori_pct && `Resultado actual: Sánchez <strong>${escapeHtml(es.sanchez_pct)}</strong> vs Fujimori <strong>${escapeHtml(es.fujimori_pct)}</strong>`,
        es.difference_votes && `Diferencia: <strong>${escapeHtml(es.difference_votes)}</strong>`,
        es.exterior_vote && `Voto exterior: <strong>${escapeHtml(es.exterior_vote)}</strong>`,
        es.proclamation_expected && `Proclamación JNE: <strong>${escapeHtml(es.proclamation_expected)}</strong>`
      ].filter(Boolean);
      grid.appendChild(buildCtxCard('Estado electoral', points, true));
    }
    if (ctx.emergency_decrees) {
      grid.appendChild(buildCtxCard('Decretos de emergencia vigentes', ctx.emergency_decrees));
    }
    if (ctx.security_posture) {
      const sp = ctx.security_posture;
      const pts = Array.isArray(sp) ? sp : Object.entries(sp).map(([k, v]) => `<strong>${escapeHtml(titleCase(k.replace(/_/g, ' ')))}:</strong> ${escapeHtml(String(v))}`);
      grid.appendChild(buildCtxCard('Postura de seguridad', pts, true));
    }
    if (ctx.macro_drivers) {
      grid.appendChild(buildCtxCard('Vectores macro', ctx.macro_drivers));
    }
    // Cualquier otra clave no tratada
    Object.keys(ctx).forEach(k => {
      if (['election_state', 'emergency_decrees', 'security_posture', 'macro_drivers'].includes(k)) return;
      const v = ctx[k];
      if (Array.isArray(v)) grid.appendChild(buildCtxCard(titleCase(k.replace(/_/g, ' ')), v));
      else if (typeof v === 'object' && v) {
        const pts = Object.entries(v).map(([kk, vv]) => `<strong>${escapeHtml(titleCase(kk.replace(/_/g, ' ')))}:</strong> ${escapeHtml(String(vv))}`);
        grid.appendChild(buildCtxCard(titleCase(k.replace(/_/g, ' ')), pts, true));
      }
    });
  }
  function buildCtxCard(title, points, allowHtml) {
    const card = el('div', { class: 'ctx' });
    card.appendChild(el('h3', null, title));
    const ul = el('ul');
    (points || []).forEach(p => {
      const li = el('li');
      if (allowHtml) li.innerHTML = p; else li.textContent = p;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    return card;
  }

  // ---------- Post-electoral ----------
  function renderPostElectoral(p) {
    // Banner margen
    const dv = p.defensa_del_voto || {};
    const cf = p.contramarchas_fujimoristas || {};
    text('#post-margin', 'Sánchez 50,07% vs Fujimori 49,93% · diferencia ~20 426 votos · voto exterior Fujimori 65,44% pendiente');

    // Bloque A — defensa del voto
    const jpp = $('#post-jpp-body');
    if (jpp) {
      jpp.innerHTML = '';
      if (dv.narrative) jpp.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin-bottom:var(--s-3)' }, dv.narrative));
      const ul = el('ul', { class: 'post-list' });
      (dv.leaders_active || []).forEach(l => {
        const li = el('li');
        li.appendChild(el('strong', null, l.name || '—'));
        const details = [
          l.leader && `Líder: ${l.leader}`,
          l.status && `Estado: ${l.status}`,
          l.since && `Activo desde: ${l.since}`
        ].filter(Boolean).join(' · ');
        if (details) li.appendChild(document.createTextNode(details));
        if (l.url) {
          li.appendChild(document.createTextNode(' · '));
          li.appendChild(el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer' }, 'fuente'));
        }
        ul.appendChild(li);
      });
      jpp.appendChild(ul);
      if (dv.risk_assessment) {
        jpp.appendChild(el('p', { style: 'margin-top:var(--s-3);padding-top:var(--s-3);border-top:1px dashed var(--c-line);font-size:var(--text-sm);color:var(--c-ink-2)' }, [
          el('strong', { style: 'color:var(--c-risk-latente)' }, 'Evaluación de riesgo · '),
          document.createTextNode(dv.risk_assessment)
        ]));
      }
    }

    // Bloque B — contramarchas
    const fp = $('#post-fp-body');
    if (fp) {
      fp.innerHTML = '';
      if (cf.narrative) fp.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin-bottom:var(--s-3)' }, cf.narrative));
      const ul = el('ul', { class: 'post-list' });
      (cf.leaders_active || []).forEach(l => {
        const li = el('li');
        li.appendChild(el('strong', null, l.name || '—'));
        const details = [
          l.leader && `Líder: ${l.leader}`,
          l.status && `Estado: ${l.status}`
        ].filter(Boolean).join(' · ');
        if (details) li.appendChild(document.createTextNode(details));
        if (l.url) {
          li.appendChild(document.createTextNode(' · '));
          li.appendChild(el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer' }, 'fuente'));
        }
        ul.appendChild(li);
      });
      fp.appendChild(ul);

      if (cf.concentration_points && cf.concentration_points.length) {
        fp.appendChild(el('p', { style: 'margin-top:var(--s-3);padding-top:var(--s-3);border-top:1px dashed var(--c-line);font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.08em;color:var(--c-muted);font-weight:700' }, 'Puntos de concentración'));
        const pts = el('ul', { style: 'list-style:none;padding:0;margin:0;font-size:var(--text-sm);color:var(--c-ink-2)' });
        cf.concentration_points.forEach(cp => {
          const li = el('li', { style: 'padding:var(--s-1) 0 var(--s-1) var(--s-4);position:relative' });
          li.innerHTML = `<span style="position:absolute;left:0;color:var(--c-amber-text)">·</span>${escapeHtml(cp)}`;
          pts.appendChild(li);
        });
        fp.appendChild(pts);
      }
    }

    // Flashpoints (collision_risk)
    const flash = $('#post-flashpoints');
    if (flash && p.collision_risk) {
      flash.innerHTML = '';
      flash.appendChild(el('h4', null, `Riesgo de colisión entre bloques · probabilidad ${p.collision_risk.level || '—'}`));
      const wrap = el('div');
      if (p.collision_risk.scenario) wrap.appendChild(el('p', { style: 'font-size:var(--text-sm);margin:0 0 var(--s-2)' }, p.collision_risk.scenario));
      if (p.collision_risk.source && p.collision_risk.source.url) {
        wrap.appendChild(el('a', {
          href: p.collision_risk.source.url, target: '_blank', rel: 'noopener noreferrer',
          style: 'font-size:var(--text-xs);font-weight:700'
        }, 'Fuente: ' + (p.collision_risk.source.name || p.collision_risk.source.url)));
      }
      flash.appendChild(wrap);
    } else if (flash) {
      flash.style.display = 'none';
    }
  }

  // ---------- Regions with tabs ----------
  const REGION_LABELS = {
    lima: 'Lima',
    norte: 'Norte',
    centro: 'Centro / Sierra',
    sur: 'Sur',
    oriente: 'Oriente / Amazonía'
  };
  const REGION_ORDER = ['lima', 'norte', 'centro', 'sur', 'oriente'];

  function renderRegions(regions) {
    const tablist = $('#region-tablist');
    const panels = $('#region-panels');
    if (!tablist || !panels) return;
    tablist.innerHTML = '';
    panels.innerHTML = '';

    const order = REGION_ORDER.filter(id => regions[id]);
    if (!order.length) return;

    // Preferencia en memoria (la preview iframe bloquea localStorage)
    let activeId = (window.__dossierActiveTab && order.includes(window.__dossierActiveTab)) ? window.__dossierActiveTab : order[0];

    order.forEach(id => {
      const r = regions[id];
      const tabId = `tab-${id}`;
      const panelId = `panel-${id}`;
      const lvl = riskCls(r.risk_level);

      const btn = el('button', {
        type: 'button', class: 'tab-btn', role: 'tab',
        id: tabId, 'aria-controls': panelId,
        'aria-selected': id === activeId ? 'true' : 'false',
        tabindex: id === activeId ? '0' : '-1',
        'data-region': id
      }, [
        el('span', { class: `tab-risk-dot ${lvl}`, 'aria-hidden': 'true' }),
        document.createTextNode((r.icon ? r.icon + ' ' : '') + (REGION_LABELS[id] || r.name || id))
      ]);
      btn.addEventListener('click', () => activate(id));
      tablist.appendChild(btn);

      const panel = el('section', {
        class: 'tab-panel' + (id === activeId ? ' active' : ''),
        role: 'tabpanel', id: panelId,
        'aria-labelledby': tabId, tabindex: '0'
      });
      panel.appendChild(buildRegionContent(id, r));
      panels.appendChild(panel);
    });

    tablist.addEventListener('keydown', (e) => {
      const tabs = $$('.tab-btn', tablist);
      const idx = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      let next = idx;
      if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      const id = tabs[next].getAttribute('data-region');
      activate(id);
      tabs[next].focus();
    });

    function activate(id) {
      $$('.tab-btn', tablist).forEach(b => {
        const isActive = b.getAttribute('data-region') === id;
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        b.setAttribute('tabindex', isActive ? '0' : '-1');
      });
      $$('.tab-panel', panels).forEach(p => p.classList.toggle('active', p.id === `panel-${id}`));
      window.__dossierActiveTab = id;
    }
  }

  function buildRegionContent(id, r) {
    const frag = document.createDocumentFragment();

    // Head
    const head = el('div', { class: 'region-head' });
    head.appendChild(el('h3', null, (r.icon ? r.icon + ' ' : '') + (r.name || REGION_LABELS[id] || id)));
    if (r.result) head.appendChild(el('p', { class: 'region-sub' }, 'Resultado 2da vuelta: ' + r.result));
    if (r.summary) head.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin-bottom:var(--s-3)' }, r.summary));

    const meta = el('div', { class: 'region-meta' });
    meta.appendChild(el('span', null, [el('span', { class: `region-risk-pill ${riskCls(r.risk_level)}` }, riskLabel(r.risk_level))]));
    if (r.events) meta.appendChild(el('span', { html: `Eventos · <strong>${r.events.length}</strong>` }));
    if (r.zones) meta.appendChild(el('span', { html: `Zonas · <strong>${r.zones.length}</strong>` }));
    if (r.routes) meta.appendChild(el('span', { html: `Rutas · <strong>${r.routes.length}</strong>` }));
    if (r.actors) meta.appendChild(el('span', { html: `Actores · <strong>${r.actors.length}</strong>` }));
    head.appendChild(meta);

    if (r.executive_alert) {
      head.appendChild(el('div', { class: 'region-alert' }, [
        el('strong', null, 'Executive Alert · '),
        document.createTextNode(r.executive_alert)
      ]));
    }
    frag.appendChild(head);

    if (r.events && r.events.length) {
      frag.appendChild(buildSub('Eventos', `Inventario regional · ${r.events.length} entradas`, buildEvents(r.events)));
    }
    if (r.zones && r.zones.length) {
      frag.appendChild(buildSub('Zonas de foco', 'Geografía de riesgo y vías alternativas', buildZones(r.zones)));
    }
    if (r.routes && r.routes.length) {
      frag.appendChild(buildSub('Rutas', 'Trayectorias documentadas o previstas', buildRoutes(r.routes)));
    }
    if (r.corridors && r.corridors.length) {
      frag.appendChild(buildSub('Corredores económicos', 'Vías críticas con impacto logístico', buildCorridors(r.corridors)));
    }
    if (r.actors && r.actors.length) {
      frag.appendChild(buildSub('Actores', 'Convocantes, líderes e intereses', buildActors(r.actors)));
    }

    // v3.1: grassroots layer for this region
    const grass = (window.__grassroots && window.__grassroots[id]) || null;
    if (grass) {
      frag.appendChild(buildRegionGrassroots(id, grass));
    }
    return frag;
  }

  // ---------- v3.1 Grassroots: per-region block ----------
  function buildRegionGrassroots(regionId, g) {
    const wrap = el('div', { class: 'region-grassroots' });
    const head = el('div', { class: 'sub-head' });
    head.appendChild(el('h4', null, '🌿 Grassroots regional'));
    head.appendChild(el('p', { class: 'eyebrow' }, 'Cuentas individuales · frentes · lives · hashtags · rutas'));
    wrap.appendChild(head);

    if (g.key_finding) {
      wrap.appendChild(el('div', { class: 'grass-finding' }, g.key_finding));
    }

    // mini stats
    const stats = [
      ['Cuentas', (g.accounts || []).length],
      ['Frentes/colectivos', (g.colectivos || []).length],
      ['Lives', (g.lives || []).length],
      ['Hashtags', (g.hashtags || []).length],
      ['Rutas', (g.routes || []).length]
    ];
    const sgrid = el('div', { class: 'grass-stats' });
    stats.forEach(([lbl, n]) => {
      if (!n) return;
      sgrid.appendChild(el('div', { class: 'grass-stat' }, [
        el('span', { class: 'num' }, String(n)),
        el('span', { class: 'lbl' }, lbl)
      ]));
    });
    if (sgrid.children.length) wrap.appendChild(sgrid);

    if ((g.accounts || []).length) {
      wrap.appendChild(grassBlockHead('Cuentas', g.accounts.length));
      wrap.appendChild(buildAccountsGrid(g.accounts));
    }
    if ((g.colectivos || []).length) {
      wrap.appendChild(grassBlockHead('Frentes y colectivos', g.colectivos.length));
      wrap.appendChild(buildColectivosGrid(g.colectivos));
    }
    if ((g.lives || []).length) {
      wrap.appendChild(grassBlockHead('Transmisiones en vivo', g.lives.length));
      wrap.appendChild(buildLivesGrid(g.lives));
    }
    if ((g.hashtags || []).length) {
      wrap.appendChild(grassBlockHead('Hashtags', g.hashtags.length));
      wrap.appendChild(buildHashtagsGrid(g.hashtags));
    }
    if ((g.routes || []).length) {
      wrap.appendChild(grassBlockHead('Rutas / bloqueos / tomas', g.routes.length));
      wrap.appendChild(buildRoutesGrid(g.routes));
    }
    return wrap;
  }

  function grassBlockHead(title, n) {
    const h = el('div', { class: 'grass-block-head' });
    h.appendChild(el('h5', null, title));
    h.appendChild(el('span', { class: 'count-badge' }, String(n)));
    return h;
  }

  function platformClass(p) {
    const s = String(p || '').toLowerCase();
    if (s.includes('twitter') || s === 'x') return 'platform-x';
    if (s.includes('facebook')) return 'platform-facebook';
    if (s.includes('tiktok')) return 'platform-tiktok';
    if (s.includes('youtube')) return 'platform-youtube';
    if (s.includes('instagram')) return 'platform-instagram';
    if (s.includes('radio')) return 'platform-radio';
    if (s.includes('web')) return 'platform-web';
    return '';
  }

  function safeAnchorText(url) {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '') + (u.pathname && u.pathname !== '/' ? u.pathname : '');
    } catch (e) { return url; }
  }

  function buildAccountsGrid(accounts) {
    const grid = el('div', { class: 'grass-accounts-grid' });
    accounts.forEach(a => {
      const card = el('article', { class: 'grass-card account' });
      const top = el('div', { class: 'g-top' });
      const left = el('div');
      left.appendChild(el('div', { class: 'g-name' }, a.name || '—'));
      if (a.role) left.appendChild(el('div', { class: 'g-role' }, a.role));
      if (a.handle) left.appendChild(el('div', { class: 'g-handle' }, a.handle));
      top.appendChild(left);
      card.appendChild(top);
      if (a.notes) card.appendChild(el('p', { class: 'g-notes' }, a.notes));
      const meta = el('div', { class: 'g-meta' });
      if (a.platform) {
        const cls = platformClass(a.platform);
        meta.appendChild(el('span', { class: 'g-tag ' + cls }, a.platform));
      }
      if (a.followers) meta.appendChild(el('span', { class: 'g-tag' }, a.followers));
      if (a.verification) meta.appendChild(el('span', { class: 'g-tag ' + a.verification }, a.verification));
      card.appendChild(meta);
      if (a.url) {
        const link = el('a', { class: 'g-link', href: a.url, target: '_blank', rel: 'noopener noreferrer' }, '↗ ' + safeAnchorText(a.url));
        card.appendChild(link);
      }
      grid.appendChild(card);
    });
    return grid;
  }

  function buildColectivosGrid(items) {
    const grid = el('div', { class: 'grass-colectivos-grid' });
    items.forEach(c => {
      const card = el('article', { class: 'grass-card colectivo' });
      const top = el('div', { class: 'g-top' });
      top.appendChild(el('div', { class: 'g-name' }, c.name || '—'));
      if (c.scope) top.appendChild(el('span', { class: 'g-scope' }, c.scope));
      card.appendChild(top);
      if (c.type) card.appendChild(el('div', { class: 'g-role' }, c.type));
      if (Array.isArray(c.leaders) && c.leaders.length) {
        card.appendChild(el('div', { class: 'g-leaders' }, 'Líderes: ' + c.leaders.join(', ')));
      }
      if (c.notes) card.appendChild(el('p', { class: 'g-notes' }, c.notes));
      const meta = el('div', { class: 'g-meta' });
      if (c.platform) {
        const cls = platformClass(c.platform);
        meta.appendChild(el('span', { class: 'g-tag ' + cls }, c.platform));
      }
      if (c.verification) meta.appendChild(el('span', { class: 'g-tag ' + c.verification }, c.verification));
      card.appendChild(meta);
      if (c.url) {
        const link = el('a', { class: 'g-link', href: c.url, target: '_blank', rel: 'noopener noreferrer' }, '↗ ' + safeAnchorText(c.url));
        card.appendChild(link);
      }
      grid.appendChild(card);
    });
    return grid;
  }

  function buildLivesGrid(items) {
    const grid = el('div', { class: 'grass-lives-grid' });
    items.forEach(l => {
      const card = el('article', { class: 'grass-card live' });
      card.appendChild(el('div', { class: 'g-name' }, l.title || '—'));
      if (l.host) card.appendChild(el('div', { class: 'g-host' }, l.host));
      if (l.topic) card.appendChild(el('p', { class: 'g-notes' }, l.topic));
      const meta = el('div', { class: 'g-meta' });
      if (l.platform) {
        const cls = platformClass(l.platform);
        meta.appendChild(el('span', { class: 'g-tag ' + cls }, l.platform));
      }
      if (l.date) meta.appendChild(el('span', { class: 'g-date' }, '📅 ' + l.date));
      if (l.audience) meta.appendChild(el('span', { class: 'g-tag' }, l.audience));
      if (l.verification) meta.appendChild(el('span', { class: 'g-tag ' + l.verification }, l.verification));
      card.appendChild(meta);
      if (l.url) {
        const link = el('a', { class: 'g-link', href: l.url, target: '_blank', rel: 'noopener noreferrer' }, '▶ ' + safeAnchorText(l.url));
        card.appendChild(link);
      }
      grid.appendChild(card);
    });
    return grid;
  }

  function buildHashtagsGrid(items) {
    const grid = el('div', { class: 'grass-hashtags-grid' });
    items.forEach(h => {
      const pill = el('div', { class: 'grass-hashtag' });
      const tagCls = h.verification && h.verification.startsWith('verified') ? 'h-tag verified' : 'h-tag';
      pill.appendChild(el('div', { class: tagCls }, h.tag || '—'));
      if (h.context) pill.appendChild(el('div', { class: 'h-context' }, h.context));
      if (Array.isArray(h.sources) && h.sources.length) {
        const linkWrap = el('div', { class: 'h-context' });
        h.sources.slice(0, 2).forEach((u, i) => {
          if (!u) return;
          if (i > 0) linkWrap.appendChild(document.createTextNode(' · '));
          linkWrap.appendChild(el('a', { class: 'g-link', href: u, target: '_blank', rel: 'noopener noreferrer' }, safeAnchorText(u)));
        });
        pill.appendChild(linkWrap);
      }
      grid.appendChild(pill);
    });
    return grid;
  }

  function buildRoutesGrid(items) {
    const grid = el('div', { class: 'grass-routes-grid' });
    items.forEach(r => {
      const card = el('div', { class: 'grass-route' });
      card.appendChild(el('span', { class: 'r-name' }, r.name || '—'));
      if (r.location) card.appendChild(el('span', { class: 'r-loc' }, r.location));
      if (r.notes) card.appendChild(el('span', { class: 'r-loc' }, r.notes));
      if (r.date) card.appendChild(el('span', { class: 'r-loc' }, '📅 ' + r.date));
      if (r.status) {
        const cls = String(r.status).toLowerCase().replace(/\s+/g, '-');
        card.appendChild(el('span', { class: 'r-status ' + cls }, r.status));
      }
      if (Array.isArray(r.sources) && r.sources.length) {
        const u = r.sources[0];
        if (u) {
          const link = el('a', { class: 'g-link', href: u, target: '_blank', rel: 'noopener noreferrer' }, '↗ ' + safeAnchorText(u));
          card.appendChild(document.createElement('br'));
          card.appendChild(link);
        }
      }
      grid.appendChild(card);
    });
    return grid;
  }

  // ---------- v3.1 Grassroots: national block ----------
  function renderNationalGrassroots(g) {
    if (!g) return;
    // Stats
    const stats = $('#grass-nac-stats');
    if (stats) {
      stats.innerHTML = '';
      const items = [
        ['Cuentas', (g.accounts || []).length],
        ['Frentes', (g.colectivos || []).length],
        ['Lives', (g.lives || []).length],
        ['Hashtags', (g.hashtags || []).length],
        ['Comunicados', (g.comunicados || []).length]
      ];
      items.forEach(([lbl, n]) => {
        if (!n) return;
        const s = el('div', { class: 'grass-stat' }, [
          el('span', { class: 'num' }, String(n)),
          el('span', { class: 'lbl' }, lbl)
        ]);
        stats.appendChild(s);
      });
    }
    fillContainer('#grass-nac-accounts', '#grass-nac-accounts-count', g.accounts, buildAccountsGrid);
    fillContainer('#grass-nac-colectivos', '#grass-nac-colectivos-count', g.colectivos, buildColectivosGrid);
    fillContainer('#grass-nac-lives', '#grass-nac-lives-count', g.lives, buildLivesGrid);
    fillContainer('#grass-nac-hashtags', '#grass-nac-hashtags-count', g.hashtags, buildHashtagsGrid);
    fillContainer('#grass-nac-comunicados', '#grass-nac-comunicados-count', g.comunicados, buildComunicadosGrid);
  }

  function fillContainer(targetSel, countSel, items, builder) {
    const target = $(targetSel);
    if (!target) return;
    target.innerHTML = '';
    if (!Array.isArray(items) || !items.length) {
      target.parentNode.querySelector(countSel) && (target.parentNode.querySelector(countSel).textContent = '0');
      return;
    }
    const grid = builder(items);
    // Replace target with grid's content
    while (grid.firstChild) target.appendChild(grid.firstChild);
    // Copy class from grid wrapper if target lacks it
    if (grid.className) target.className = grid.className;
    const cnt = $(countSel);
    if (cnt) cnt.textContent = String(items.length);
  }

  function buildComunicadosGrid(items) {
    const grid = el('div', { class: 'grass-comunicados-grid' });
    items.forEach(c => {
      const card = el('article', { class: 'grass-card comunicado' });
      if (c.issuer) card.appendChild(el('div', { class: 'c-issuer' }, c.issuer));
      card.appendChild(el('div', { class: 'g-name' }, c.title || '—'));
      if (c.date) card.appendChild(el('div', { class: 'c-date' }, '📅 ' + c.date));
      if (c.summary) card.appendChild(el('p', { class: 'g-notes' }, c.summary));
      if (c.verification) {
        const meta = el('div', { class: 'g-meta' });
        meta.appendChild(el('span', { class: 'g-tag ' + c.verification }, c.verification));
        card.appendChild(meta);
      }
      if (c.url) {
        const link = el('a', { class: 'g-link', href: c.url, target: '_blank', rel: 'noopener noreferrer' }, '↗ ' + safeAnchorText(c.url));
        card.appendChild(link);
      }
      grid.appendChild(card);
    });
    return grid;
  }

  function buildSub(title, eyebrow, body) {
    const w = el('div', { class: 'region-subsection' });
    const h = el('div', { class: 'sub-head' });
    h.appendChild(el('h4', null, title));
    h.appendChild(el('p', { class: 'eyebrow' }, eyebrow));
    w.appendChild(h);
    w.appendChild(body);
    return w;
  }

  function buildEvents(events) {
    const grid = el('div', { class: 'cards', role: 'list' });
    events.forEach(e => {
      const card = el('article', { class: 'card', role: 'listitem' });
      const headerRow = el('div', { style: 'display:flex;gap:var(--s-3);justify-content:space-between;align-items:flex-start;flex-wrap:wrap;margin-bottom:var(--s-2)' });
      const si = stateInfo(e.status);
      headerRow.appendChild(el('span', { class: `badge ${si.cls}` }, si.label));
      if (e.risk) headerRow.appendChild(el('span', { class: `risk ${riskCls(e.risk)}` }, riskLabel(e.risk)));
      card.appendChild(headerRow);

      card.appendChild(el('h3', null, e.title || '—'));
      if (e.summary) card.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2)' }, e.summary));

      const meta = el('dl', { class: 'card-meta' });
      const rows = [
        ['Fecha / hora', e.date],
        ['Lugar', e.location || e.place],
        ['Convocante', e.convener],
        ['Magnitud', e.magnitude],
        ['ID', e.id]
      ];
      rows.forEach(([dt, dd]) => {
        if (!dd) return;
        meta.appendChild(el('div', null, [el('dt', null, dt), el('dd', null, dd)]));
      });
      card.appendChild(meta);

      // sources: puede ser objeto único o array
      const sources = Array.isArray(e.sources) ? e.sources : (e.source ? [e.source] : []);
      if (sources.length) {
        const src = el('div', { class: 'card-sources' });
        src.appendChild(el('h4', null, 'Fuente' + (sources.length > 1 ? 's' : '')));
        sources.forEach(s => {
          if (!s || !s.url) return;
          src.appendChild(el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.name || s.label || s.url));
        });
        card.appendChild(src);
      }
      grid.appendChild(card);
    });
    return grid;
  }

  function buildZones(zones) {
    const grid = el('div', { class: 'zones' });
    zones.forEach(z => {
      const lvl = riskCls(z.risk);
      const zoneCls = lvl === 'risk-alto' || lvl === 'risk-maximo' ? 'zone-alto' : lvl === 'risk-bajo' ? 'zone-bajo' : 'zone-moderado';
      const card = el('div', { class: `zone ${zoneCls}` });
      card.appendChild(el('h3', null, z.name || '—'));
      if (z.risk) card.appendChild(el('span', { class: `risk ${lvl}` }, riskLabel(z.risk)));
      if (z.polygon) card.appendChild(el('div', { class: 'zone-poly' }, z.polygon));

      const hotspots = z.hotspots || z.key_points;
      if (hotspots) {
        // Solo separar por comas si no hay abreviaciones (Jr./Av./Dr./Sr.) que las hagan ambiguas.
        // Para listas con esas abreviaciones, mostrar como párrafo.
        const b = el('div', { class: 'zone-block' });
        b.appendChild(el('h4', null, 'Puntos calientes'));
        if (Array.isArray(hotspots)) {
          const ul = el('ul', { class: 'zone-list' });
          hotspots.forEach(h => h && ul.appendChild(el('li', null, h)));
          b.appendChild(ul);
        } else {
          const txt = String(hotspots);
          // Heurística: si tiene punto medio o slash, partir por ese separador. Si hay coma sin abreviaciones, partir por coma.
          let arr = null;
          if (/[·•]/.test(txt)) arr = txt.split(/\s*[·•]\s*/);
          else if (/;/.test(txt)) arr = txt.split(/\s*;\s*/);
          else if (!/\b(?:Jr|Av|Dr|Sr|Sra|Lic|Dpto|Mz|Lt)\.\s/i.test(txt)) arr = txt.split(/\s*,\s*/);
          if (arr && arr.length > 1) {
            const ul = el('ul', { class: 'zone-list' });
            arr.forEach(h => h && ul.appendChild(el('li', null, h.trim())));
            b.appendChild(ul);
          } else {
            b.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin:var(--s-2) 0 0' }, txt));
          }
        }
        card.appendChild(b);
      }
      const alts = z.alternatives || z.advice;
      if (alts) {
        const b = el('div', { class: 'zone-block' });
        b.appendChild(el('h4', null, 'Recomendación operativa'));
        if (Array.isArray(alts)) {
          const ul = el('ul', { class: 'zone-list' });
          alts.forEach(h => h && ul.appendChild(el('li', null, h)));
          b.appendChild(ul);
        } else {
          // Texto continuo: párrafo (no romper por puntos para evitar dividir Jr. / Av.)
          b.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin:var(--s-2) 0 0' }, alts));
        }
        card.appendChild(b);
      }
      grid.appendChild(card);
    });
    return grid;
  }

  function buildRoutes(routes) {
    const grid = el('div', { class: 'routes' });
    routes.forEach((r, i) => {
      const card = el('div', { class: 'route' });
      card.appendChild(el('span', { class: 'route-code' }, String(i + 1).padStart(2, '0')));
      card.appendChild(el('h3', null, r.name || '—'));
      const path = r.path || r.trayecto;
      if (path) card.appendChild(el('p', { class: 'route-path' }, path));
      const stats = el('div', { class: 'route-stats' });
      if (r.distance) stats.appendChild(el('div', null, [document.createTextNode('Distancia '), el('strong', null, r.distance)]));
      if (r.duration) stats.appendChild(el('div', null, [document.createTextNode('Duración '), el('strong', null, r.duration)]));
      if (r.frequency) stats.appendChild(el('div', null, [document.createTextNode('Frecuencia '), el('strong', null, r.frequency)]));
      if (r.actors) stats.appendChild(el('div', null, [document.createTextNode('Actores '), el('strong', null, r.actors)]));
      if (stats.childNodes.length) card.appendChild(stats);
      grid.appendChild(card);
    });
    return grid;
  }

  function buildCorridors(corridors) {
    const grid = el('div', { class: 'corridors' });
    corridors.forEach(c => {
      const card = el('div', { class: 'corridor' });
      card.appendChild(el('h5', null, c.name || '—'));
      if (c.description) card.appendChild(el('p', null, c.description));
      if (c.impact) card.appendChild(el('div', { class: 'corridor-impact' }, c.impact));
      grid.appendChild(card);
    });
    return grid;
  }

  function buildActors(actors) {
    const grid = el('div', { class: 'actors' });
    actors.forEach(a => {
      const card = el('div', { class: 'actor' });
      const type = a.type || a.side;
      if (type) card.appendChild(el('div', { class: 'actor-type' }, type));
      card.appendChild(el('div', { class: 'actor-name' }, a.name || '—'));
      if (a.leader) card.appendChild(el('div', { class: 'actor-interest', style: 'margin-bottom:var(--s-1);font-size:var(--text-xs);color:var(--c-muted)' }, 'Líder: ' + a.leader));
      const interest = a.interest || a.capacity || a.status;
      if (interest) card.appendChild(el('div', { class: 'actor-interest' }, interest));
      grid.appendChild(card);
    });
    return grid;
  }

  // ---------- Risk matrix ----------
  function renderRiskMatrix(rows) {
    const tbody = $('#risk-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    rows.forEach(r => {
      const tr = el('tr');
      // scenario: usar vector si no hay scenario explícito
      tr.appendChild(el('td', { 'data-label': 'Escenario' }, [el('strong', null, r.scenario || r.vector || '—')]));
      tr.appendChild(el('td', { 'data-label': 'Región' }, r.region || '—'));
      tr.appendChild(el('td', { 'data-label': 'Probabilidad' }, [el('span', { class: `risk ${riskCls(r.probability || r.level)}` }, riskLabel(r.probability || r.level))]));
      tr.appendChild(el('td', { 'data-label': 'Severidad' }, [el('span', { class: `risk ${riskCls(r.severity || r.level)}` }, riskLabel(r.severity || r.level))]));
      tr.appendChild(el('td', { 'data-label': 'Ventana' }, r.window || '—'));
      tr.appendChild(el('td', { 'data-label': 'Zonas' }, r.zones || r.vector || '—'));
      tbody.appendChild(tr);
    });
  }

  // ---------- Early warning ----------
  function renderEarlyWarning(items) {
    const grid = $('#ew-grid');
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(i => {
      const c = el('div', { class: 'ew' });
      c.appendChild(el('h4', null, i.signal || i.title || '—'));
      if (i.description) c.appendChild(el('p', null, i.description));
      if (i.action) c.appendChild(el('div', { class: 'ew-trigger' }, '→ ' + i.action));
      if (i.trigger) c.appendChild(el('div', { class: 'ew-trigger' }, '↑ ' + i.trigger));
      grid.appendChild(c);
    });
  }

  // ---------- Methodology ----------
  function renderMethod(m) {
    const grid = $('#method-grid');
    if (!grid) return;
    grid.innerHTML = '';
    // m puede ser array (esperado) o objeto con phases/anti_hallucination/limits
    if (Array.isArray(m)) {
      m.forEach(p => grid.appendChild(buildMethodStep(p.phase || '', p.title || '', p.summary || '')));
      return;
    }
    const items = [
      ['Fases', m.phases],
      ['Anti-alucinación', m.anti_hallucination],
      ['Fuentes', m.sources_total]
    ].filter(([, v]) => v);
    items.forEach(([k, v]) => grid.appendChild(buildMethodStep(k, k, v)));
    if (Array.isArray(m.limits)) {
      const limStep = el('div', { class: 'method-step' });
      limStep.appendChild(el('div', { class: 'phase' }, 'Límites'));
      const body = el('div');
      body.appendChild(el('h4', null, 'Limitaciones reconocidas'));
      const ul = el('ul', { style: 'margin:var(--s-2) 0 0 var(--s-4);padding:0;font-size:var(--text-sm);color:var(--c-ink-2)' });
      m.limits.forEach(l => ul.appendChild(el('li', { style: 'padding:var(--s-1) 0' }, l)));
      body.appendChild(ul);
      limStep.appendChild(body);
      grid.appendChild(limStep);
    }
  }
  function buildMethodStep(phase, title, summary) {
    const row = el('div', { class: 'method-step' });
    row.appendChild(el('div', { class: 'phase' }, phase));
    const body = el('div');
    body.appendChild(el('h4', null, title));
    body.appendChild(el('p', null, summary));
    row.appendChild(body);
    return row;
  }

  // ---------- Sources ----------
  function renderSources(sources) {
    const list = $('#sources-list');
    if (!list) return;
    const draw = (filter) => {
      list.innerHTML = '';
      const q = (filter || '').trim().toLowerCase();
      const filtered = sources.filter(s => {
        if (!q) return true;
        return [s.name, s.label, s.url, s.region, s.topic].filter(Boolean).some(v => String(v).toLowerCase().includes(q));
      });
      filtered.forEach(s => {
        const a = el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' });
        a.innerHTML = `<strong>${escapeHtml(s.name || s.label || s.url)}</strong>`;
        const tags = [s.region, s.topic].filter(Boolean).join(' · ');
        if (tags) a.innerHTML += `<span style="display:block;font-size:var(--text-xs);color:var(--c-muted);margin-top:2px">${escapeHtml(tags)}</span>`;
        list.appendChild(a);
      });
      if (!list.children.length) list.appendChild(el('p', { style: 'color:var(--c-muted);font-size:var(--text-sm);padding:var(--s-4)' }, 'Sin coincidencias.'));
    };
    draw('');
    const input = $('#sources-filter');
    if (input) input.addEventListener('input', () => draw(input.value));
  }

  // ============================================================
  // v3 — Social Intelligence, Lives, Narratives, Alt Media, Disinfo
  // ============================================================

  const SIDE_LABEL = {
    jpp: 'Bloque A · JPP',
    fp: 'Bloque B · FP',
    medio: 'Medio',
    institucion: 'Institucional',
    regional: 'Regional',
    independiente: 'Independiente',
    defensa_voto: 'Defensa del voto',
    disinformation: 'Desinformación',
    neutro: 'Neutro'
  };
  const PLATFORM_LABEL = {
    x: 'X', tiktok: 'TikTok', facebook: 'Facebook', youtube: 'YouTube', instagram: 'Instagram'
  };
  const PLATFORM_ICON = {
    x: 'X', tiktok: 'TT', facebook: 'fb', youtube: 'YT', instagram: 'IG'
  };
  const ALT_TYPE_LABEL = {
    nacional: 'Nacional', regional: 'Regional', comunitario: 'Comunitario', indigena: 'Indígena'
  };
  const DISINFO_TYPE_LABEL = {
    comunicado_falso: 'Comunicado falso',
    acta_falsa: 'Acta falsa',
    deepfake: 'Deepfake / IA',
    video_reciclado: 'Video reciclado',
    encuesta_falsa: 'Encuesta apócrifa',
    bot_coordinacion: 'Coordinación de bots'
  };

  // ---------- Social Intelligence (stats + platforms + handles + hashtags) ----------
  function renderSocialIntelligence(si) {
    if (!si || !si.title) return;
    text('#social-title', si.title);
    text('#social-desc', si.description || '');
    renderSocialStats(si.stats || {});
    renderPlatformsSummary(si.platforms_summary || {});
    renderHandles(si.handles || []);
    renderHashtags(si.hashtags || []);
  }

  function renderSocialStats(stats) {
    const wrap = $('#social-stats');
    if (!wrap) return;
    wrap.innerHTML = '';
    const items = [
      { num: stats.jne_alerts_total, lbl: 'Alertas de desinformación (JNE)', src: stats.source_jne, srcLbl: 'JNE' },
      { num: stats.jne_tiktok_alerts, lbl: 'Alertas reportadas en TikTok', src: stats.source_jne, srcLbl: 'JNE' },
      { num: typeof stats.anp_press_attacks === 'string' ? stats.anp_press_attacks.split(' ')[0] : stats.anp_press_attacks, lbl: 'Ataques a periodistas 2026 (ANP)', src: stats.source_anp, srcLbl: 'ANP' },
      { num: stats.journalists_killed, lbl: 'Periodistas asesinados', src: stats.source_anp, srcLbl: 'ANP' }
    ];
    items.forEach(it => {
      if (!it.num) return;
      const card = el('div', { class: 'stat' });
      card.appendChild(el('span', { class: 'stat-num' }, String(it.num)));
      card.appendChild(el('span', { class: 'stat-lbl' }, it.lbl));
      if (it.src) {
        const a = el('a', { href: it.src, target: '_blank', rel: 'noopener noreferrer', class: 'stat-src' }, 'Fuente: ' + (it.srcLbl || 'enlace'));
        card.appendChild(a);
      }
      wrap.appendChild(card);
    });
  }

  function renderPlatformsSummary(ps) {
    const wrap = $('#platforms-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    Object.entries(ps).forEach(([k, v]) => {
      const card = el('article', { class: 'platform-card' });
      const name = el('div', { class: 'p-name' });
      name.appendChild(el('span', { class: 'p-icon' }, PLATFORM_ICON[k] || k.slice(0,2).toUpperCase()));
      name.appendChild(document.createTextNode(PLATFORM_LABEL[k] || k));
      card.appendChild(name);
      const summary = typeof v === 'string' ? v : (v && v.summary) || '';
      card.appendChild(el('p', { class: 'p-summary' }, summary));
      wrap.appendChild(card);
    });
  }

  // ---------- Handles (filter + search) ----------
  let _handlesState = { platform: 'all', side: 'all', q: '' };
  let _allHandles = [];

  function renderHandles(handles) {
    _allHandles = handles;
    text('#handles-count', handles.length + ' handles');
    drawHandles();
    wireFilterGroup('#handle-platform-filter', (v) => { _handlesState.platform = v; drawHandles(); });
    wireFilterGroup('#handle-side-filter', (v) => { _handlesState.side = v; drawHandles(); });
    const search = $('#handle-search');
    if (search) search.addEventListener('input', () => { _handlesState.q = search.value.trim().toLowerCase(); drawHandles(); });
  }

  function drawHandles() {
    const wrap = $('#handles-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    const filtered = _allHandles.filter(h => {
      if (_handlesState.side !== 'all' && h.side !== _handlesState.side) return false;
      if (_handlesState.platform !== 'all') {
        const has = (h.platforms || []).some(p => p.platform === _handlesState.platform);
        if (!has) return false;
      }
      if (_handlesState.q) {
        const blob = [h.name, h.role, h.region, h.type, ...(h.platforms || []).map(p => p.handle)].filter(Boolean).join(' ').toLowerCase();
        if (!blob.includes(_handlesState.q)) return false;
      }
      return true;
    });
    if (!filtered.length) {
      wrap.appendChild(el('p', { style: 'color:var(--c-muted);font-size:var(--text-sm);padding:var(--s-4);grid-column:1/-1' }, 'Sin handles que coincidan con los filtros.'));
      return;
    }
    // Sort: priority alta first
    const order = { alta: 0, media: 1, baja: 2 };
    filtered.sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
    filtered.forEach(h => wrap.appendChild(buildHandleCard(h)));
  }

  function buildHandleCard(h) {
    const card = el('article', { class: 'handle-card' });
    card.appendChild(el('div', { class: 'h-name' }, h.name || '—'));
    if (h.role) card.appendChild(el('div', { class: 'h-role' }, h.role));
    const plats = el('div', { class: 'h-platforms' });
    (h.platforms || []).forEach(p => {
      if (!p.handle) return;
      const linkAttrs = { class: 'h-handle' + (p.verified ? ' verified' : '') };
      if (p.url) { linkAttrs.href = p.url; linkAttrs.target = '_blank'; linkAttrs.rel = 'noopener noreferrer'; }
      const a = p.url ? el('a', linkAttrs) : el('span', linkAttrs);
      a.textContent = (PLATFORM_ICON[p.platform] || '?') + ' ' + p.handle;
      plats.appendChild(a);
    });
    card.appendChild(plats);
    const tags = el('div', { class: 'h-tags' });
    if (h.side) tags.appendChild(el('span', { class: 'h-tag side-' + h.side }, SIDE_LABEL[h.side] || h.side));
    if (h.priority) tags.appendChild(el('span', { class: 'h-tag priority-' + h.priority }, 'prioridad ' + h.priority));
    if (h.region && h.region !== 'nacional') tags.appendChild(el('span', { class: 'h-tag side-regional' }, h.region));
    if (tags.children.length) card.appendChild(tags);
    return card;
  }

  function wireFilterGroup(selector, onChange) {
    const group = $(selector);
    if (!group) return;
    group.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        onChange(btn.dataset.value);
      });
    });
  }

  // ---------- Hashtags ----------
  function renderHashtags(hashtags) {
    text('#hashtags-count', hashtags.length + ' hashtags');
    const wrap = $('#hashtags-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    hashtags.forEach(h => {
      const card = el('article', { class: 'hashtag-card side-' + (h.side || 'neutro') });
      card.appendChild(el('div', { class: 'ht-tag' }, h.tag || '—'));
      if (h.context) card.appendChild(el('p', { class: 'ht-ctx' }, h.context));
      const meta = el('div', { class: 'ht-meta' });
      if (h.platform) meta.appendChild(el('span', null, '📡 ' + (PLATFORM_LABEL[h.platform] || h.platform)));
      if (h.volume) {
        const v = el('span'); v.innerHTML = 'Volumen: <strong>' + escapeHtml(String(h.volume)) + '</strong>';
        meta.appendChild(v);
      }
      if (h.region) meta.appendChild(el('span', null, '📍 ' + h.region));
      if (h.side) meta.appendChild(el('span', null, SIDE_LABEL[h.side] || h.side));
      card.appendChild(meta);
      wrap.appendChild(card);
    });
  }

  // ---------- Live Streams ----------
  function renderLiveStreams(lives) {
    text('#lives-count', lives.length + ' canales');
    const wrap = $('#lives-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    lives.forEach(lv => {
      const card = el('article', { class: 'live-card' });
      card.appendChild(el('div', { class: 'l-platform' }, PLATFORM_LABEL[lv.platform] || lv.platform || ''));
      card.appendChild(el('div', { class: 'l-channel' }, lv.channel || '—'));
      if (lv.schedule) card.appendChild(el('div', { class: 'l-schedule' }, '🕒 ' + lv.schedule));
      if (lv.focus) card.appendChild(el('p', { class: 'l-focus' }, lv.focus));
      const meta = el('div', { class: 'l-meta' });
      if (lv.audience) meta.appendChild(el('span', null, '👥 ' + lv.audience));
      if (lv.url) {
        const a = el('a', { href: lv.url, target: '_blank', rel: 'noopener noreferrer', class: 'l-url' });
        a.textContent = '↗ Abrir canal';
        meta.appendChild(a);
      }
      card.appendChild(meta);
      wrap.appendChild(card);
    });
  }

  // ---------- Narratives ----------
  function renderNarratives(narratives) {
    text('#narratives-count', narratives.length + ' narrativas');
    const wrap = $('#narratives-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    narratives.forEach(n => {
      const card = el('article', { class: 'narrative-card' });
      if (n.side) card.appendChild(el('span', { class: 'n-side side-' + n.side }, SIDE_LABEL[n.side] || n.side));
      card.appendChild(el('h4', { class: 'n-title' }, n.title || '—'));
      if (n.summary) card.appendChild(el('p', { class: 'n-summary' }, n.summary));
      if (Array.isArray(n.platforms) && n.platforms.length) {
        const pf = el('div', { class: 'n-platforms' });
        n.platforms.forEach(p => pf.appendChild(el('span', { class: 'n-pf' }, PLATFORM_LABEL[p] || p)));
        card.appendChild(pf);
      }
      if (n.evidence_url) {
        const ev = el('div', { class: 'n-evidence' });
        const a = el('a', { href: n.evidence_url, target: '_blank', rel: 'noopener noreferrer' }, '↗ Ver evidencia documental');
        ev.appendChild(a);
        card.appendChild(ev);
      }
      wrap.appendChild(card);
    });
  }

  // ---------- Alt Media (filter type + region) ----------
  let _altState = { type: 'all', region: 'all' };
  let _allAlt = [];

  function renderAltMedia(items) {
    _allAlt = items;
    drawAltMedia();
    wireFilterGroup('#alt-type-filter', (v) => { _altState.type = v; drawAltMedia(); });
    wireFilterGroup('#alt-region-filter', (v) => { _altState.region = v; drawAltMedia(); });
  }

  function drawAltMedia() {
    const wrap = $('#alt-media-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    const filtered = _allAlt.filter(a => {
      if (_altState.type !== 'all' && a.type !== _altState.type) return false;
      if (_altState.region !== 'all' && a.region !== _altState.region) return false;
      return true;
    });
    if (!filtered.length) {
      wrap.appendChild(el('p', { style: 'color:var(--c-muted);font-size:var(--text-sm);padding:var(--s-4);grid-column:1/-1' }, 'Sin medios que coincidan con los filtros.'));
      return;
    }
    filtered.forEach(a => wrap.appendChild(buildAltCard(a)));
  }

  function buildAltCard(a) {
    const card = el('article', { class: 'alt-card' });
    const name = el('h4', { class: 'a-name' });
    if (a.url) {
      const link = el('a', { href: a.url, target: '_blank', rel: 'noopener noreferrer' }, a.name || '—');
      name.appendChild(link);
    } else {
      name.textContent = a.name || '—';
    }
    card.appendChild(name);
    const meta = el('div', { class: 'a-meta' });
    if (a.type) meta.appendChild(el('span', { class: 'a-tag type-' + a.type }, ALT_TYPE_LABEL[a.type] || a.type));
    if (a.region) meta.appendChild(el('span', { class: 'a-tag' }, '📍 ' + a.region));
    card.appendChild(meta);
    if (a.founder_editor) card.appendChild(el('div', { class: 'a-founder' }, a.founder_editor));
    if (a.focus) card.appendChild(el('p', { class: 'a-focus' }, a.focus));
    if (a.position_post_electoral) card.appendChild(el('div', { class: 'a-position' }, 'Postura post-electoral: ' + a.position_post_electoral));
    if (Array.isArray(a.social_links) && a.social_links.length) {
      const soc = el('div', { class: 'a-social' });
      a.social_links.forEach(sl => {
        if (!sl.url) return;
        const link = el('a', { href: sl.url, target: '_blank', rel: 'noopener noreferrer' }, PLATFORM_ICON[sl.platform] || sl.platform || '?');
        soc.appendChild(link);
      });
      if (a.recent_url) {
        const r = el('a', { href: a.recent_url, target: '_blank', rel: 'noopener noreferrer' }, '↗ artículo reciente');
        soc.appendChild(r);
      }
      card.appendChild(soc);
    }
    return card;
  }

  // ---------- Disinfo cases ----------
  function renderDisinfo(cases) {
    const wrap = $('#disinfo-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    cases.forEach(c => {
      const card = el('article', { class: 'disinfo-card type-' + (c.type || 'bulo') });
      card.appendChild(el('span', { class: 'd-type' }, DISINFO_TYPE_LABEL[c.type] || c.type || 'caso'));
      card.appendChild(el('h4', { class: 'd-title' }, c.title || '—'));
      if (c.summary) card.appendChild(el('p', { class: 'd-summary' }, c.summary));
      const meta = el('div', { class: 'd-meta' });
      if (Array.isArray(c.platforms) && c.platforms.length) {
        const pf = el('div', { class: 'd-platforms' });
        c.platforms.forEach(p => pf.appendChild(el('span', null, PLATFORM_LABEL[p] || p)));
        meta.appendChild(pf);
      }
      if (c.date) meta.appendChild(el('span', null, '📅 ' + c.date));
      if (c.verifier) {
        const vf = el('div', { class: 'd-verifier' });
        if (c.verifier_url) {
          const a = el('a', { href: c.verifier_url, target: '_blank', rel: 'noopener noreferrer' }, '✓ Verificado por ' + c.verifier);
          vf.appendChild(a);
        } else {
          vf.textContent = '✓ Verificado por ' + c.verifier;
        }
        meta.appendChild(vf);
      }
      card.appendChild(meta);
      wrap.appendChild(card);
    });
  }

  // ---------- Reversion / Montecarlo ----------
  function renderReversion(mc) {
    const root = $('#reversion');
    if (!root) return;
    if (!mc) { root.style.display = 'none'; return; }

    const fmt = (n) => Number(n).toLocaleString('es-PE', { maximumFractionDigits: 0 });
    const sgn = (n) => (n >= 0 ? '+' : '−') + fmt(Math.abs(n));
    const pct = (n, dec = 2) => (Number(n) * 100).toFixed(dec).replace('.', ',') + ' %';

    const est = mc.estado_actual || {};
    const br = mc.breakeven || {};
    const m = mc.montecarlo || {};
    const hist = mc.histograma_margen || {};
    const paises = mc.breakdown_paises || [];
    const sens = mc.sensibilidad || [];
    const interp = mc.interpretacion || {};
    const meta = mc.metadata || {};

    // KPIs
    const totalPend = (br.votos_pendientes && br.votos_pendientes.total) || 0;
    text('#rev-total-pend', fmt(Math.round(totalPend)));
    text('#rev-prob', pct(m.probabilidad_fujimori_gana || 0, 2));
    text('#rev-prob-sub', 'Fujimori supera a Sánchez al cierre del cómputo · ' + (m.n_simulaciones ? fmt(m.n_simulaciones) : '100 000') + ' iteraciones');
    text('#rev-margen', sgn(Math.round(m.margen_final_media || 0)) + ' votos');
    text('#rev-margen-banda', 'Banda 90 %: [' + sgn(Math.round(m.margen_final_p5 || 0)) + ' ; ' + sgn(Math.round(m.margen_final_p95 || 0)) + ']');
    text('#rev-breakeven', fmt(br.votos_fujimori_necesarios || 0) + ' votos');
    text('#rev-breakeven-pct', '≥' + String(br.pct_pendiente_necesario || 0).replace('.', ',') + ' % del pendiente debe ir a Fujimori');
    text('#rev-ventaja', fmt(est.ventaja_sanchez_votos || br.ventaja_actual_sanchez || 0) + ' votos');

    renderHistogram(hist);
    renderPaises(paises);
    renderSensibilidad(sens);

    // Limitaciones
    const lims = $('#rev-meta-lims');
    if (lims) {
      lims.innerHTML = '';
      (interp.limitaciones || []).forEach(li => lims.appendChild(el('li', null, li)));
    }
    const fuente = $('#rev-meta-fuente');
    if (fuente) {
      fuente.innerHTML = '';
      const small = el('span', null, 'Fuente principal: ');
      fuente.appendChild(small);
      fuente.appendChild(el('strong', null, meta.fuente_principal || 'ONPE'));
      fuente.appendChild(document.createTextNode(' · Semilla: ' + (meta.semilla_reproducibilidad || 42) + ' · Corte: ' + (meta.fecha_corte_datos || '—')));
    }
  }

  function renderHistogram(hist) {
    const root = $('#rev-histogram');
    if (!root) return;
    root.innerHTML = '';
    const edges = hist.bins_edges || [];
    const counts = hist.counts || [];
    if (edges.length < 2 || counts.length === 0) return;

    const W = 720, H = 280;
    const padL = 48, padR = 18, padT = 16, padB = 36;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const xMin = edges[0];
    const xMax = edges[edges.length - 1];
    const xRange = xMax - xMin || 1;
    const yMax = Math.max.apply(null, counts) || 1;

    const xScale = (v) => padL + ((v - xMin) / xRange) * innerW;
    const yScale = (v) => padT + innerH - (v / yMax) * innerH;

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('class', 'rev-hist-svg');
    svg.setAttribute('role', 'img');

    // Bandas p5–p95
    if (hist.x_p5 != null && hist.x_p95 != null) {
      const x1 = xScale(hist.x_p5);
      const x2 = xScale(hist.x_p95);
      const band = document.createElementNS(NS, 'rect');
      band.setAttribute('x', x1);
      band.setAttribute('y', padT);
      band.setAttribute('width', Math.max(0, x2 - x1));
      band.setAttribute('height', innerH);
      band.setAttribute('class', 'rev-hist-band');
      svg.appendChild(band);
    }

    // Barras
    for (let i = 0; i < counts.length; i++) {
      const e0 = edges[i];
      const e1 = edges[i + 1] != null ? edges[i + 1] : (e0 + (xRange / counts.length));
      const center = (e0 + e1) / 2;
      const x = xScale(e0);
      const w = Math.max(1, xScale(e1) - xScale(e0) - 0.5);
      const y = yScale(counts[i]);
      const h = padT + innerH - y;
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      rect.setAttribute('class', center >= 0 ? 'rev-hist-bar rev-hist-bar-f' : 'rev-hist-bar rev-hist-bar-s');
      svg.appendChild(rect);
    }

    // Línea cero
    if (xMin < 0 && xMax > 0) {
      const zx = xScale(0);
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', zx); ln.setAttribute('x2', zx);
      ln.setAttribute('y1', padT); ln.setAttribute('y2', padT + innerH);
      ln.setAttribute('class', 'rev-hist-zero');
      svg.appendChild(ln);
    }

    // Mediana
    if (hist.x_p50 != null) {
      const mx = xScale(hist.x_p50);
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', mx); ln.setAttribute('x2', mx);
      ln.setAttribute('y1', padT); ln.setAttribute('y2', padT + innerH);
      ln.setAttribute('class', 'rev-hist-median');
      svg.appendChild(ln);
      const lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('x', mx);
      lbl.setAttribute('y', padT - 4);
      lbl.setAttribute('class', 'rev-hist-median-lbl');
      lbl.setAttribute('text-anchor', 'middle');
      lbl.textContent = 'Mediana ' + (hist.x_p50 >= 0 ? '+' : '') + Math.round(hist.x_p50).toLocaleString('es-PE');
      svg.appendChild(lbl);
    }

    // Eje X: ticks principales
    const ticks = 5;
    for (let t = 0; t <= ticks; t++) {
      const v = xMin + (xRange * t / ticks);
      const x = xScale(v);
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', x); ln.setAttribute('x2', x);
      ln.setAttribute('y1', padT + innerH); ln.setAttribute('y2', padT + innerH + 4);
      ln.setAttribute('class', 'rev-hist-tick');
      svg.appendChild(ln);
      const lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('x', x);
      lbl.setAttribute('y', padT + innerH + 18);
      lbl.setAttribute('class', 'rev-hist-axis-lbl');
      lbl.setAttribute('text-anchor', 'middle');
      const sign = v >= 0 ? '+' : '';
      lbl.textContent = sign + Math.round(v / 1000) + 'k';
      svg.appendChild(lbl);
    }
    // Etiqueta eje X
    const xTitle = document.createElementNS(NS, 'text');
    xTitle.setAttribute('x', padL + innerW / 2);
    xTitle.setAttribute('y', H - 4);
    xTitle.setAttribute('class', 'rev-hist-axis-title');
    xTitle.setAttribute('text-anchor', 'middle');
    xTitle.textContent = 'Margen final (votos Fujimori − Sánchez)';
    svg.appendChild(xTitle);

    root.appendChild(svg);
  }

  function renderPaises(paises) {
    const grid = $('#rev-paises-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!paises.length) return;
    const sorted = paises.slice().sort((a, b) => (b.margen_fujimori_media || 0) - (a.margen_fujimori_media || 0));
    const maxAbs = Math.max.apply(null, sorted.map(p => Math.abs(p.margen_fujimori_p95 || p.margen_fujimori_media || 0)));
    const fmt = (n) => Number(n).toLocaleString('es-PE', { maximumFractionDigits: 0 });
    const sgn = (n) => (n >= 0 ? '+' : '−') + fmt(Math.abs(n));

    sorted.forEach((p, idx) => {
      const card = el('article', { class: 'rev-pais-card' });
      const head = el('header', { class: 'rev-pais-head' });
      head.appendChild(el('span', { class: 'rev-pais-rank' }, '#' + (idx + 1)));
      head.appendChild(el('h4', null, escapeHtml(p.pais || '—')));
      const badge = el('span', { class: 'rev-pais-iso' }, escapeHtml(p.iso || ''));
      head.appendChild(badge);
      card.appendChild(head);

      const stats = el('div', { class: 'rev-pais-stats' });
      stats.appendChild(buildStat('Electores hábiles', fmt(p.electores_habiles || 0)));
      stats.appendChild(buildStat('Votos esperados', fmt(p.votos_esperados || 0)));
      stats.appendChild(buildStat('% Fujimori medio', ((p.fujimori_pct_media || 0) * 100).toFixed(0).replace('.', ',') + ' %'));
      stats.appendChild(buildStat('% pendiente', ((p.actas_pendientes_pct || 0) * 100).toFixed(0).replace('.', ',') + ' %'));
      card.appendChild(stats);

      // Barra horizontal del margen
      const barWrap = el('div', { class: 'rev-pais-bar-wrap' });
      const center = 50; // % del contenedor
      const margen = p.margen_fujimori_media || 0;
      const w = maxAbs > 0 ? Math.abs(margen) / maxAbs * 48 : 0;
      const p5 = p.margen_fujimori_p5 || 0;
      const p95 = p.margen_fujimori_p95 || 0;
      const wP5 = maxAbs > 0 ? Math.abs(p5) / maxAbs * 48 : 0;
      const wP95 = maxAbs > 0 ? Math.abs(p95) / maxAbs * 48 : 0;

      const track = el('div', { class: 'rev-pais-bar-track' });
      track.appendChild(el('div', { class: 'rev-pais-bar-zero', style: 'left:' + center + '%' }));
      // banda p5–p95
      const bandLeft = p5 >= 0 ? center : center - wP5;
      const bandWidth = (p5 >= 0 ? wP5 : wP5) + (p95 >= 0 ? wP95 : wP95);
      const bandW = (p5 >= 0 && p95 >= 0) ? (wP95 - wP5) : (p5 < 0 && p95 < 0) ? (wP5 - wP95) : (wP5 + wP95);
      const bandL = p5 >= 0 ? center + wP5 : center - wP5;
      const band = el('div', { class: 'rev-pais-bar-band', style: 'left:' + bandL + '%;width:' + Math.max(0.5, bandW) + '%' });
      track.appendChild(band);
      // barra media
      const bar = el('div', { class: 'rev-pais-bar ' + (margen >= 0 ? 'rev-pais-bar-f' : 'rev-pais-bar-s'), style: (margen >= 0 ? 'left:' + center + '%;' : 'left:' + (center - w) + '%;') + 'width:' + w + '%' });
      track.appendChild(bar);
      barWrap.appendChild(track);
      const lbls = el('div', { class: 'rev-pais-bar-lbls' });
      lbls.appendChild(el('span', { class: 'rev-pais-bar-l' }, sgn(p5)));
      lbls.appendChild(el('span', { class: 'rev-pais-bar-c' }, sgn(margen) + ' votos'));
      lbls.appendChild(el('span', { class: 'rev-pais-bar-r' }, sgn(p95)));
      barWrap.appendChild(lbls);
      card.appendChild(barWrap);

      if (Array.isArray(p.ciudades_pivote) && p.ciudades_pivote.length) {
        const piv = el('div', { class: 'rev-pais-piv' });
        piv.appendChild(el('span', { class: 'rev-pais-piv-lbl' }, 'Ciudades pivote: '));
        piv.appendChild(document.createTextNode(p.ciudades_pivote.join(' · ')));
        card.appendChild(piv);
      }

      grid.appendChild(card);
    });
  }

  function buildStat(label, value) {
    const d = el('div', { class: 'rev-stat' });
    d.appendChild(el('span', { class: 'rev-stat-lbl' }, label));
    d.appendChild(el('span', { class: 'rev-stat-val' }, value));
    return d;
  }

  function renderSensibilidad(sens) {
    const root = $('#rev-sens-list');
    if (!root) return;
    root.innerHTML = '';
    sens.forEach(s => {
      const row = el('div', { class: 'rev-sens-row' });
      row.appendChild(el('span', { class: 'rev-sens-name' }, escapeHtml(s.escenario || '—')));
      const barWrap = el('div', { class: 'rev-sens-bar-wrap' });
      const p = Number(s.p_fujimori_gana || 0);
      const w = Math.max(2, p * 100);
      const bar = el('div', { class: 'rev-sens-bar ' + (p >= 0.95 ? 'rev-sens-bar-hi' : p >= 0.85 ? 'rev-sens-bar-mid' : 'rev-sens-bar-lo'), style: 'width:' + w + '%' });
      barWrap.appendChild(bar);
      row.appendChild(barWrap);
      row.appendChild(el('span', { class: 'rev-sens-val' }, (p * 100).toFixed(2).replace('.', ',') + ' %'));
      root.appendChild(row);
    });
  }

})();
