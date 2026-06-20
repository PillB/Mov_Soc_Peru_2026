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

  // v3.5.1: helpers to clean placeholder/no-data strings and parse markdown links
  const PLACEHOLDER_RX = /^(?:n\/?d|n\.d\.|nd|sin dato[s]?|sin información|no verificado.*|no disponible|por confirmar|—|-)$/i;
  const cleanStr = (v) => {
    if (v == null) return '';
    const s = String(v).trim();
    if (!s) return '';
    if (PLACEHOLDER_RX.test(s)) return '';
    return s;
  };
  const cleanUrl = (v) => {
    const s = cleanStr(v);
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) return '';
    return s;
  };
  // Parse inline markdown links [text](url) → safe anchor HTML, escaping the rest.
  const parseInlineMd = (raw) => {
    if (raw == null) return '';
    const src = String(raw);
    const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
    let out = '', last = 0, m;
    while ((m = linkRe.exec(src)) !== null) {
      out += escapeHtml(src.slice(last, m.index));
      out += `<a href="${escapeHtml(m[2])}" target="_blank" rel="noopener noreferrer">${escapeHtml(m[1])}</a>`;
      last = m.index + m[0].length;
    }
    out += escapeHtml(src.slice(last));
    return out;
  };
  // Infer risk level from executive_alert text or risk pill prefix
  const inferRiskLevel = (alertText) => {
    const s = String(alertText || '').toUpperCase();
    if (s.includes('ROJA') || s.includes('ROJO')) return 'Alto';
    if (s.includes('NARANJA')) return 'Medio';
    if (s.includes('AMARILLA') || s.includes('AMARILLO')) return 'Bajo';
    return '';
  };
  // v3.5.2: normalize bando codes → side key + readable label
  const normalizeBando = (raw) => {
    const k = String(raw || '').toLowerCase().trim();
    if (!k) return { side: '', label: '' };
    if (/(pro[\s_-]?s[aá]nchez|pro[\s_-]?jpp|^jpp|izquier|defens|sanchez|s[aá]nchez)/.test(k)) return { side: 'jpp', label: 'Pro-Sánchez · Bloque A' };
    if (/(pro[\s_-]?fp|fuerza\s*popular|fujimori|keiko|^fp|derech|renovaci[oó]n)/.test(k)) return { side: 'fp', label: 'Pro-Fujimori · Bloque B' };
    if (/medio|periodis|prensa/.test(k))     return { side: 'medio', label: 'Medio / Prensa' };
    if (/instit|onpe|jne|defensor/.test(k))  return { side: 'institucion', label: 'Institucional' };
    if (/region|local/.test(k))              return { side: 'regional', label: 'Regional' };
    if (/desinformaci[oó]n|disinfo|bulo/.test(k)) return { side: 'disinformation', label: 'Desinformación' };
    if (/neutro|n\/a|indep/.test(k))         return { side: 'neutro', label: 'Neutral' };
    return { side: 'neutro', label: titleCase(k.replace(/[_-]/g, ' ')) };
  };
  // v3.5.2: normalize platform string "YouTube / TikTok" → array of canonical keys
  const PLATFORM_KEYS = ['x', 'twitter', 'tiktok', 'facebook', 'youtube', 'instagram'];
  const normalizePlatforms = (raw) => {
    if (!raw) return [];
    const tokens = String(raw).toLowerCase().split(/[\/,|+·•]+/).map(t => t.trim()).filter(Boolean);
    const out = [];
    tokens.forEach(t => {
      const k = t.replace(/[^a-z]/g, '');
      if (k === 'twitter') { if (!out.includes('x')) out.push('x'); return; }
      if (PLATFORM_KEYS.includes(k) && !out.includes(k)) out.push(k);
    });
    return out;
  };
  // v3.5.2: format big numbers "2400000" → "2,4 M seguidores"
  const fmtFollowers = (n) => {
    if (n == null || n === '') return '';
    const num = Number(n);
    if (!isFinite(num) || num <= 0) return '';
    if (num >= 1e6) return (num / 1e6).toFixed(num >= 1e7 ? 0 : 1).replace('.', ',') + ' M';
    if (num >= 1e3) return (num / 1e3).toFixed(num >= 1e5 ? 0 : 1).replace('.', ',') + ' K';
    return String(num);
  };
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
  const loadEvents = window.__EMBEDDED_EVENTS__
    ? Promise.resolve(window.__EMBEDDED_EVENTS__)
    : fetch('data/events.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('No se pudo cargar events.json (HTTP ' + r.status + ')'); return r.json(); });
  const loadMc = window.__EMBEDDED_MC__
    ? Promise.resolve(window.__EMBEDDED_MC__)
    : fetch('data/montecarlo.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null);
  Promise.all([loadEvents, loadMc])
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

    renderEditorialCopy(d);
    renderBluf(d.bluf || {});
    renderForecastML(d.forecast_ml || {}, d.escrutinio_realtime || {});
    renderExecutiveAlert(d.executive_alert || {});
    renderContext(d.context || {});
    renderPostElectoral(d.post_electoral || {}, d.escrutinio_realtime || {}, d.context || {});
    // v3.1: stash grassroots data for buildRegionContent to consume
    window.__grassroots = d.grassroots || {};
    renderRegions(d.regions || {});
    renderNationalGrassroots(window.__grassroots.nacional || {});
    renderSocialIntelligence(d.social_intelligence || {}, d);
    renderLiveStreams(d.live_streams || []);
    renderNarratives(d.narratives || []);
    renderAltMedia(d.alt_media || []);
    renderDisinfo(d.disinformation_cases || []);
    renderRiskMatrix(d.risk_matrix || []);
    renderReversion(d.montecarlo || null, d.escrutinio_realtime || null);
    renderEarlyWarning(d.early_warning_indicators || []);
    renderMethod(d.methodology || {});
    renderValidacionLectura(d.validacion || {}, d.montecarlo || null, d.escrutinio_realtime || null);
    renderSources(d.sources_index || []);
    updateElectionSectionFoldMeta(d);
    initHidePastToggle();
    flagPastRiskMatrix();
  }

  function updateElectionSectionFoldMeta(d) {
    const er = (d.escrutinio_realtime || {}).cifras_actuales || {};
    const fml = d.forecast_ml || {};
    const prob = fml.probabilidad_victoria || {};
    const pc = fml.punto_central || {};
    const revProb = document.getElementById('rev-prob');
    const revVentaja = document.getElementById('rev-ventaja');
    const revMeta = $('#rev-section-fold-meta');
    if (revMeta) {
      const parts = [];
      if (revProb && revProb.textContent.trim() !== '—') parts.push('P ' + revProb.textContent.trim());
      if (er.margen_actual != null) parts.push(formatSignedInt(er.margen_actual) + ' votos');
      else if (revVentaja && revVentaja.textContent.trim() !== '—') parts.push(revVentaja.textContent.trim());
      revMeta.textContent = parts.length ? parts.join(' · ') : 'resultado consolidado';
    }
    const fmlMeta = $('#fml-section-fold-meta');
    if (fmlMeta && pc.margen_final_votos != null) {
      fmlMeta.textContent = formatSignedInt(pc.margen_final_votos) + ' votos · P(F) ' + pct1(prob.fujimori);
    }
    const valMeta = $('#val-section-fold-meta');
    const valProb = document.getElementById('val-prob-ajustada');
    if (valMeta && valProb && valProb.textContent.trim() !== '—') {
      valMeta.textContent = valProb.textContent.trim() + ' ajustada';
    }
  }

  function countConvocatorias(regions) {
    let n = 0;
    Object.values(regions || {}).forEach(r => { n += (r.convocatorias_futuras || []).length; });
    return n;
  }
  function setMetaContent(sel, content) {
    if (!content) return;
    const node = document.querySelector(sel);
    if (node) node.setAttribute('content', content);
  }
  function pctFromVotes(vF, vS) {
    const total = (vF || 0) + (vS || 0);
    if (!total) return { f: '', s: '' };
    return {
      f: (vF / total * 100).toFixed(3).replace('.', ',') + ' %',
      s: (vS / total * 100).toFixed(3).replace('.', ',') + ' %'
    };
  }

  // ---------- v3.9.8: Editorial copy — static HTML slots from live data ----------
  function renderEditorialCopy(d) {
    const meta = d.meta || {};
    const er = (d.escrutinio_realtime || {}).cifras_actuales || {};
    const actasJee = er.actas_jee_pendientes != null ? er.actas_jee_pendientes : 346;
    const corteLabel = meta.fecha_corte ? formatDate(meta.fecha_corte).replace(/\s+\d{4}$/, '') : '19 jun';
    const fml = d.forecast_ml || {};
    const pc = fml.punto_central || {};
    const ic = (fml.intervalos_confianza || {}).ic_95 || [];
    const prob = fml.probabilidad_victoria || {};
    const convN = countConvocatorias(d.regions) || (d.bluf || {}).kpis?.find(k => /convocatoria/i.test(k.label || ''))?.value || '—';
    const pctActas = (er.pct_actas || '99,63 %').replace('.', ',').replace('%', ' %').replace(/ % %/, ' %').trim();
    const margen = er.margen_actual != null ? formatSignedInt(er.margen_actual) : '+41.565';
    const margenMl = pc.margen_final_votos != null ? formatSignedInt(pc.margen_final_votos) : '+44.800';
    const icLo = ic[0] != null ? formatSignedInt(ic[0]) : '+38.200';
    const icHi = ic[1] != null ? formatSignedInt(ic[1]) : '+51.400';
    const pF = prob.fujimori != null ? (prob.fujimori * 100).toFixed(1).replace('.', ',') : '99,4';

    const metaDesc = `Dossier OSINT v${meta.version || '3.9.8'} — BLUF + ML forecast. ${convN} convocatorias activas en 5 macroregiones. Margen ONPE ${margen} votos al ${pctActas}, proyección ML ${margenMl} votos Fujimori (IC95 [${icLo}, ${icHi}]), P(F)=${pF} %.`;
    setMetaContent('meta[name="description"]', metaDesc);
    setMetaContent('meta[property="og:title"]', `Dossier OSINT — Manifestaciones Perú · v${meta.version || '3.9.8'} BLUF + ML`);
    setMetaContent('meta[property="og:description"]', metaDesc);

    const brandSub = document.querySelector('.brand-sub');
    if (brandSub) brandSub.textContent = `BLUF + ML forecast · ${pctActas} escrutado`;

    const footerAbout = $('#footer-about');
    if (footerAbout) {
      const genDate = meta.generated_at ? formatDate(meta.generated_at) : '19 jun 2026';
      footerAbout.textContent = `Producto OSINT v${meta.version || '3.9.8'} preparado el ${genDate} para residentes y profesionales en las cinco macroregiones del Perú. Integra terreno, redes sociales y medios alternativos. Su propósito es informar, no movilizar. La información se contrasta exclusivamente con fuentes públicas verificadas.`;
    }

    text('#rev-section-h2', `Resultado consolidado: Fujimori ${margen} votos al ${pctActas} escrutado`);
    text('#rev-section-deck', `Monte Carlo sobre ~${actasJee} actas JEE pendientes y riesgo legal residual (amparo JP). Con ${pctActas} contabilizado, la reversión estadística es improbable; el foco operativo está en movilizaciones y resolución JNE.`);

    text('#validacion-deck', `Escrutinio al ${pctActas} con margen ${margen} pro-Fujimori. Cuatro especificaciones de modelo, mercados de predicción y siete escenarios adversariales confirman robustez de la señal post-reversión.`);

    const polyPct = (d.validacion || {}).mercados?.polymarket?.fujimori_pct;
    const mercDesc = polyPct != null
      ? `Polymarket ~${String(polyPct).replace('.', ',')} % Fujimori al corte ${corteLabel}; converge con modelos internos (P(F) ${pF} %) y margen observado ${margen}.`
      : `Mercados de predicción y modelos internos convergen en victoria Fujimori con margen observado ${margen}.`;
    text('#val-mercados-desc', mercDesc);

    const likeli = $('#val-bayes-legend-likeli');
    if (likeli) {
      likeli.innerHTML = '<span class="bayes-sw bayes-sw-likeli"></span> Likelihood · ~63,4 % Fujimori (exterior 100 % cerrado 12-jun)';
    }
  }

  // ---------- v3.6.0: BLUF renderer ----------
  function renderBluf(b) {
    const kpisRoot = $('#bluf-kpis');
    if (kpisRoot) {
      kpisRoot.innerHTML = '';
      (b.kpis || []).forEach(k => {
        const card = el('article', { class: 'bluf-kpi', role: 'listitem', 'data-tone': k.tone || 'blue' }, [
          el('span', { class: 'bluf-kpi-label' }, k.label || ''),
          el('span', { class: 'bluf-kpi-value' }, k.value || '—'),
          k.sub ? el('span', { class: 'bluf-kpi-sub' }, k.sub) : null
        ].filter(Boolean));
        kpisRoot.appendChild(card);
      });
    }
    const list = $('#bluf-crit-list');
    const critArr = b.manifestaciones_criticas_top || [];
    text('#bluf-crit-count', String(critArr.length));
    if (list) {
      list.innerHTML = '';
      critArr.forEach(m => {
        const card = el('article', { class: 'bluf-crit-card', 'data-side': m.side || '', 'data-es-pasado': isPastDate(m.fecha) ? 'true' : 'false' });
        card.appendChild(el('div', { class: 'bluf-crit-name' }, m.nombre || '—'));
        const meta = el('div', { class: 'bluf-crit-meta' });
        if (m.region) meta.appendChild(el('span', { class: 'bluf-crit-chip region' }, m.region));
        if (m.fecha) meta.appendChild(el('span', { class: 'bluf-crit-chip' }, formatDate(m.fecha)));
        if (m.estado) meta.appendChild(el('span', { class: 'bluf-crit-chip estado-' + String(m.estado).toLowerCase().replace(/[^a-z]/g,'') }, m.estado));
        if (m.riesgo) meta.appendChild(el('span', { class: 'bluf-crit-chip risk-' + String(m.riesgo).toLowerCase() }, 'riesgo ' + m.riesgo));
        if (m.ubicacion) meta.appendChild(el('span', null, m.ubicacion));
        if (m.region) {
          const a = el('a', { class: 'bluf-crit-link', href: '#regions', 'data-jump-region': m.region }, '→ ver región');
          a.addEventListener('click', (ev) => {
            const rid = a.getAttribute('data-jump-region');
            const btn = document.querySelector(`.tab-btn[data-region="${rid}"]`);
            if (btn) { ev.preventDefault(); btn.click(); document.getElementById('regions').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          });
          meta.appendChild(a);
        }
        card.appendChild(meta);
        if (m.cross_ref) card.appendChild(el('div', { class: 'bluf-crit-xref' }, 'Cross-ref: ' + m.cross_ref));
        list.appendChild(card);
      });
    }
    const watch = $('#bluf-watch-list');
    if (watch) {
      watch.innerHTML = '';
      (b.three_things_to_watch || []).forEach(t => {
        const li = el('li');
        if (typeof t === 'string') {
          li.textContent = t;
        } else {
          const titulo = cleanStr(t.titulo || t.title);
          const detalle = cleanStr(t.detalle || t.text || t.descripcion);
          if (titulo) {
            li.appendChild(el('strong', null, titulo));
            if (detalle) li.appendChild(document.createTextNode(' — ' + detalle));
          } else {
            li.textContent = detalle || JSON.stringify(t);
          }
        }
        watch.appendChild(li);
      });
    }
    if (b.forecast_one_liner) text('#bluf-forecast-line', b.forecast_one_liner);
  }

  // ---------- v3.6.0: Forecast ML renderer ----------
  function renderForecastML(f, er) {
    if (!f || !f.punto_central) return;
    const pc = f.punto_central || {};
    const ca = (er || {}).cifras_actuales || {};
    const pctEsc = (f.subtitulo || ca.pct_actas || '99,63 %').replace(/corte[^·]*·\s*/i, '').trim();
    const actasJee = ca.actas_jee_pendientes != null ? ca.actas_jee_pendientes : 346;
    const margenTxt = pc.margen_final_votos != null ? formatSignedInt(pc.margen_final_votos) : '—';
    const pctFDeck = pc.pct_fujimori_final != null ? pc.pct_fujimori_final.toFixed(3).replace('.', ',') + ' %' : '';
    const deckEl = $('#fml-deck');
    if (deckEl) {
      deckEl.innerHTML = `Modelo bayesiano condicional al <strong>${escapeHtml(pctEsc)}</strong> escrutado. Combina cómputo observado, actas JEE pendientes (~${actasJee}) y riesgo legal residual (amparo JP). <strong>Punto central: ${escapeHtml(margenTxt)} votos Fujimori${pctFDeck ? ' (' + escapeHtml(pctFDeck) + ')' : ''}.</strong>`;
    }
    const prob = f.probabilidad_victoria || {};
    const ic = f.intervalos_confianza || {};
    const kpisRoot = $('#fml-kpis');
    if (kpisRoot) {
      kpisRoot.innerHTML = '';
      const margenTxt = (pc.margen_final_votos != null) ? formatSignedInt(pc.margen_final_votos) + ' votos' : '—';
      const pctF = pc.pct_fujimori_final != null ? pc.pct_fujimori_final.toFixed(3).replace('.', ',') + ' %' : '';
      const ganador = pc.ganador_modelo_base || '';
      const kpis = [
        { kind: 'point', label: 'Margen final proyectado', value: margenTxt, sub: pctF ? `${ganador} · ${pctF}` : ganador },
        { kind: 'prob-f', label: 'P(gana Fujimori)', value: pct1(prob.fujimori), sub: 'modelo base' },
        { kind: 'prob-s', label: 'P(gana Sánchez)', value: pct1(prob.sanchez), sub: 'modelo base' },
        { kind: 'prob-tie', label: 'P(empate técnico)', value: pct1(prob.empate_tecnico_reconteo), sub: 'margen final |Δ| < 500 votos' }
      ];
      kpis.forEach(k => {
        const card = el('article', { class: 'fml-kpi', 'data-kind': k.kind, role: 'listitem' }, [
          el('span', { class: 'fml-kpi-label' }, k.label),
          el('span', { class: 'fml-kpi-value' }, k.value || '—'),
          k.sub ? el('span', { class: 'fml-kpi-sub' }, k.sub) : null
        ].filter(Boolean));
        kpisRoot.appendChild(card);
      });
    }
    // IC bars
    const icRoot = $('#fml-ic-bars');
    if (icRoot) {
      icRoot.innerHTML = '';
      const rows = [
        { name: 'IC 50 %', range: ic.ic_50 },
        { name: 'IC 80 %', range: ic.ic_80 },
        { name: 'IC 95 %', range: ic.ic_95 }
      ].filter(r => Array.isArray(r.range) && r.range.length === 2);
      // Determine global scale
      const allVals = rows.flatMap(r => r.range).concat([pc.margen_final_votos || 0]);
      const maxAbs = Math.max.apply(null, allVals.map(v => Math.abs(v))) || 1;
      const scale = Math.ceil(maxAbs * 1.05);
      rows.forEach(r => {
        const row = el('div', { class: 'fml-ic-row' });
        row.appendChild(el('span', { class: 'fml-ic-name' }, r.name));
        const track = el('div', { class: 'fml-ic-track' });
        const lo = r.range[0], hi = r.range[1];
        const leftPct = ((lo + scale) / (2 * scale)) * 100;
        const widthPct = ((hi - lo) / (2 * scale)) * 100;
        const fill = el('div', { class: 'fml-ic-fill', style: `left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%` });
        track.appendChild(fill);
        const pointPct = ((pc.margen_final_votos + scale) / (2 * scale)) * 100;
        const point = el('div', { class: 'fml-ic-point', style: `left:${pointPct.toFixed(2)}%` });
        track.appendChild(point);
        row.appendChild(track);
        row.appendChild(el('span', { class: 'fml-ic-bounds' }, `${formatSignedInt(lo)} → ${formatSignedInt(hi)}`));
        icRoot.appendChild(row);
      });
    }
    if (ic.nota_metodologica) text('#fml-ic-note', ic.nota_metodologica);
    // Escenarios
    const escRoot = $('#fml-escenarios');
    if (escRoot) {
      escRoot.innerHTML = '';
      const escList = Array.isArray(f.escenarios) ? f.escenarios : Object.entries(f.escenarios || {}).map(([k,v]) => Object.assign({ nombre: v.nombre || k }, v));
      escList.forEach(s => {
        const probability = s.probabilidad != null ? pct1(s.probabilidad) : (s.prob != null ? pct1(s.prob) : '');
        const tone = s.tono || s.tone || guessTone(s);
        const card = el('article', { class: 'fml-esc', 'data-tone': tone });
        const head = el('div', { class: 'fml-esc-head' });
        head.appendChild(el('span', { class: 'fml-esc-name' }, s.nombre || s.titulo || '—'));
        if (probability) head.appendChild(el('span', { class: 'fml-esc-prob' }, probability));
        card.appendChild(head);
        const desc = s.descripcion || s.desc || s.drivers || '';
        if (desc) card.appendChild(el('p', { class: 'fml-esc-desc' }, desc));
        let margenVal = s.margen_proyectado != null ? s.margen_proyectado : (s.margen_estimado != null ? s.margen_estimado : null);
        if (margenVal != null) {
          let rngTxt = '';
          if (Array.isArray(s.rango_margen) && s.rango_margen.length === 2) {
            rngTxt = ' · rango [' + formatSignedInt(s.rango_margen[0]) + ' → ' + formatSignedInt(s.rango_margen[1]) + ']';
          }
          card.appendChild(el('div', { class: 'fml-esc-margin' }, 'Margen: ' + formatSignedInt(margenVal) + ' votos' + rngTxt));
        } else if (s.margen) {
          card.appendChild(el('div', { class: 'fml-esc-margin' }, 'Margen: ' + s.margen));
        }
        escRoot.appendChild(card);
      });
    }
    // Drivers
    const drvRoot = $('#fml-drivers');
    if (drvRoot) {
      drvRoot.innerHTML = '';
      const drvList = Array.isArray(f.drivers_cuantificados)
        ? f.drivers_cuantificados
        : Object.entries(f.drivers_cuantificados || {}).map(([k, v]) => {
            const name = v.nombre || titleCase(String(k).replace(/_/g, ' '));
            const sub = v.descripcion || v.desc || v.detalle || v.base_estimacion || v.nota_patron || '';
            const sigma = v.sigma_votos != null ? v.sigma_votos
              : (v.std_impacto != null ? v.std_impacto
              : (v.std != null ? v.std : null));
            const impacto = v.impacto_margen_fuj != null ? v.impacto_margen_fuj
              : (v.impacto_margen_fuj_esperado != null ? v.impacto_margen_fuj_esperado : null);
            return { nombre: name, descripcion: sub, sigma_votos: sigma, impacto: impacto };
          });
      drvList.forEach(d => {
        const row = el('div', { class: 'fml-driver' });
        const left = el('div');
        left.appendChild(el('div', { class: 'fml-driver-name' }, d.nombre || d.driver || '—'));
        const sub = d.descripcion || d.desc || d.detalle || '';
        if (sub) left.appendChild(el('div', { class: 'fml-driver-sub' }, String(sub).slice(0, 280) + (String(sub).length > 280 ? '…' : '')));
        row.appendChild(left);
        const right = el('div', { class: 'fml-driver-var' });
        if (d.sigma_votos != null && !isNaN(d.sigma_votos)) right.textContent = 'σ ±' + Number(d.sigma_votos).toLocaleString('es-PE');
        else if (d.impacto != null) right.textContent = (d.impacto > 0 ? '+' : (d.impacto < 0 ? '−' : '')) + Math.abs(d.impacto).toLocaleString('es-PE');
        else right.textContent = d.contribucion || d.impacto || '';
        row.appendChild(right);
        drvRoot.appendChild(row);
      });
    }
    // Assumptions
    const asRoot = $('#fml-assumptions');
    if (asRoot) {
      asRoot.innerHTML = '';
      (f.assumptions || []).forEach(a => asRoot.appendChild(el('li', null, typeof a === 'string' ? a : (a.text || a.descripcion || JSON.stringify(a)))));
    }
    // Fuentes
    const fuRoot = $('#fml-fuentes');
    if (fuRoot && Array.isArray(f.fuentes)) {
      fuRoot.innerHTML = 'Fuentes: ';
      f.fuentes.forEach((s, i) => {
        if (i > 0) fuRoot.appendChild(document.createTextNode(' · '));
        const a = el('a', { href: s.url || '#', target: '_blank', rel: 'noopener' }, s.titulo || s.nombre || (s.url || '').replace(/^https?:\/\//, '').split('/')[0]);
        fuRoot.appendChild(a);
      });
    }
    const fm = $('#fml-fold-meta');
    const escCount = Array.isArray(f.escenarios) ? f.escenarios.length : Object.keys(f.escenarios || {}).length;
    const drvCount = Array.isArray(f.drivers_cuantificados) ? f.drivers_cuantificados.length : Object.keys(f.drivers_cuantificados || {}).length;
    if (fm) fm.textContent = `${escCount} escenarios · ${drvCount} drivers`;
  }

  function pct1(v) {
    if (v == null || isNaN(v)) return '—';
    return (v * 100).toFixed(1).replace('.', ',') + ' %';
  }
  function formatSignedInt(n) {
    if (n == null || isNaN(n)) return '—';
    const sign = n > 0 ? '+' : (n < 0 ? '−' : '');
    // Manual es-PE thousands separator (period). toLocaleString('es-PE') unreliable in some runtimes.
    const abs = Math.abs(Math.round(n));
    const formatted = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return sign + formatted;
  }
  function guessTone(s) {
    const txt = ((s.nombre||'') + ' ' + (s.descripcion||'')).toLowerCase();
    if (/(victoria fuj|fuj.*sobre|favorable.*fuj|base|central)/.test(txt)) return 'green';
    if (/(sánchez gana|sanchez gana|reversión.*sanchez|empate|recuento)/.test(txt)) return 'amber';
    if (/(nulidad|cisne|crisis|impugnación)/.test(txt)) return 'red';
    return '';
  }
  function isPastDate(iso) {
    if (!iso) return false;
    const s = String(iso).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) && s < '2026-06-12';
  }

  // ---------- v3.6.0: Hide-past toggle ----------
  function initHidePastToggle() {
    const chk = $('#hidePastToggle');
    if (!chk) return;
    const STORAGE_KEY = 'dossier_hidePast_v360';
    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* noop */ }
    if (stored !== null) chk.checked = (stored === '1');
    apply(chk.checked);
    chk.addEventListener('change', () => {
      apply(chk.checked);
      try { localStorage.setItem(STORAGE_KEY, chk.checked ? '1' : '0'); } catch (e) { /* noop */ }
    });
    function apply(hide) {
      document.body.classList.toggle('hide-past', !!hide);
    }
  }

  // ---------- v3.6.0: Mark risk-matrix rows whose timeframe is past ----------
  function flagPastRiskMatrix() {
    const tbody = document.getElementById('risk-tbody');
    if (!tbody) return;
    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
      const text = (tr.textContent || '').toLowerCase();
      // very conservative: only flag rows whose date string is strictly earlier than today
      const m = text.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (m && (m[0] < '2026-06-12')) tr.setAttribute('data-es-pasado', 'true');
    });
  }

  // v3.5.7: robust date formatter — anti-"Invalid Date"
  function formatDate(iso) {
    if (!iso) return 'Por confirmar';
    const s = String(iso).trim();
    // Pure YYYY-MM-DD (no time): treat as local date, no UTC shift
    const mDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (mDateOnly) {
      const dt = new Date(+mDateOnly[1], +mDateOnly[2]-1, +mDateOnly[3]);
      if (!isNaN(dt)) return dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
      return 'Por confirmar';
    }
    // Full ISO with time
    const mISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:?\d{2})?$/.test(s);
    if (mISO) {
      const dt = new Date(s);
      if (!isNaN(dt)) return dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    try {
      const dt = new Date(s);
      if (!isNaN(dt)) return dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { /* fallthrough */ }
    return 'Por confirmar';
  }

  // v3.5.7: returns combined human label including range and nota
  function formatEventDate(ev) {
    if (!ev) return 'Por confirmar';
    const f = ev.fecha || ev.date || '';
    const fin = ev.fecha_fin || '';
    const nota = ev.fecha_nota || '';
    const main = formatDate(f);
    let out = main;
    if (fin) {
      const finStr = formatDate(fin);
      if (finStr && finStr !== 'Por confirmar' && finStr !== main) out = `${main} – ${finStr}`;
    }
    if (nota) {
      // Only append nota if it adds info
      out = (out === 'Por confirmar') ? nota : `${out} · ${nota}`;
    }
    return out;
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
  function renderPostElectoral(p, er, ctx) {
    const dv = p.defensa_del_voto || {};
    const cf = p.contramarchas_fujimoristas || {};
    const ca = (er || {}).cifras_actuales || {};
    const es = (ctx || {}).election_state || {};
    let marginLine = '';
    if (ca.votos_F != null && ca.votos_S != null) {
      const pcts = pctFromVotes(ca.votos_F, ca.votos_S);
      marginLine = `Fujimori ${pcts.f} vs Sánchez ${pcts.s} · margen ${formatSignedInt(ca.margen_actual)} votos`;
      if (ca.pct_actas) marginLine += ` · ${ca.pct_actas.replace('.', ',')} actas`;
    } else if (es.fujimori_pct && es.sanchez_pct) {
      marginLine = `Fujimori ${es.fujimori_pct} vs Sánchez ${es.sanchez_pct} · ${es.difference_votes || ''}`;
    }
    text('#post-margin', marginLine || '—');
    const tail = $('#post-intro-tail');
    if (tail) {
      const pct = ca.pct_actas ? ca.pct_actas.replace('.', ',') : (es.scrutinized_pct || '99,63 %');
      const m = ca.margen_actual != null ? formatSignedInt(ca.margen_actual) : (es.difference_votes || '+41.565 votos');
      const actasJee = ca.actas_jee_pendientes != null ? ca.actas_jee_pendientes : 346;
      tail.textContent = `Con ${pct} escrutado y margen ${m} pro-Fujimori, la reversión estadística es improbable. ~${actasJee} actas en JEE y amparo PJ pendiente condicionan el riesgo operativo. Dos bloques movilizados en paralelo.`;
    }

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
    lima: 'Lima Metropolitana',
    norte: 'Norte',
    centro: 'Centro / Sierra',
    sur: 'Sur andino',
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

    // v3.5.1: bridge Spanish→English keys at render time (events.json uses Spanish)
    const events   = r.events     || r.eventos               || [];
    const zones    = r.zones      || r.puntos_riesgo         || [];
    const routes   = r.routes     || r.rutas                 || [];
    const corrs    = r.corridors  || r.corredores            || [];
    const actors   = r.actors     || r.actores               || [];
    const future   = r.events_future || r.convocatorias_futuras || [];
    const narrLoc  = r.narratives_local || r.narrativas_locales || [];

    // v3.5.7: assign stable evtid for map↔list interactivity
    // Mutates raw event objects with __evtid so buildEvents and buildRegionMap can correlate.
    function tagEvents(list, kind) {
      list.forEach((ev, i) => {
        if (!ev.__evtid) ev.__evtid = (ev.id ? ('ev_' + ev.id) : `${id}_${kind}_${i}`);
      });
    }
    tagEvents(events, 'e');
    tagEvents(future, 'f');
    const displayName = r.name || REGION_LABELS[id] || (r.region || id);
    const riskLvl = r.risk_level || inferRiskLevel(r.executive_alert);

    // Head
    const head = el('div', { class: 'region-head' });
    head.appendChild(el('h3', null, (r.icon ? r.icon + ' ' : '') + displayName));
    if (r.result) head.appendChild(el('p', { class: 'region-sub' }, 'Resultado 2da vuelta: ' + r.result));
    if (r.summary) head.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin-bottom:var(--s-3)' }, r.summary));

    const meta = el('div', { class: 'region-meta' });
    if (riskLvl) meta.appendChild(el('span', null, [el('span', { class: `region-risk-pill ${riskCls(riskLvl)}` }, riskLabel(riskLvl))]));
    if (events.length)  meta.appendChild(el('span', { html: `Eventos · <strong>${events.length}</strong>` }));
    if (future.length)  meta.appendChild(el('span', { html: `Convocatorias futuras · <strong>${future.length}</strong>` }));
    if (zones.length)   meta.appendChild(el('span', { html: `Zonas de riesgo · <strong>${zones.length}</strong>` }));
    if (routes.length)  meta.appendChild(el('span', { html: `Rutas · <strong>${routes.length}</strong>` }));
    if (corrs.length)   meta.appendChild(el('span', { html: `Corredores · <strong>${corrs.length}</strong>` }));
    if (actors.length)  meta.appendChild(el('span', { html: `Actores · <strong>${actors.length}</strong>` }));
    if (narrLoc.length) meta.appendChild(el('span', { html: `Narrativas locales · <strong>${narrLoc.length}</strong>` }));
    if (r.fecha_corte) {
      // v3.5.3: humanize ISO datetime in region meta
      const corteStr = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(r.fecha_corte))
        ? (function () { try { return formatDate(r.fecha_corte); } catch (_) { return r.fecha_corte; } })()
        : r.fecha_corte;
      meta.appendChild(el('span', { html: `Corte · <strong>${escapeHtml(corteStr)}</strong>` }));
    }
    if (meta.children.length) head.appendChild(meta);

    if (r.executive_alert) {
      // v3.5.1: render inline markdown links instead of raw text
      head.appendChild(el('div', { class: 'region-alert', html: '<strong>Executive Alert · </strong>' + parseInlineMd(r.executive_alert) }));
    }
    frag.appendChild(head);

    // v3.5.6: mapa interactivo con rutas, zonas y eventos
    try {
      const mapNode = buildRegionMap(id, { events: events, future: future, zones: zones, routes: routes, corridors: corrs });
      if (mapNode) frag.appendChild(mapNode);
    } catch (e) { console.warn('[map]', id, e); }

    if (events.length) {
      frag.appendChild(buildSub('Eventos', `Inventario regional · ${events.length} entradas`, buildEvents(events, id)));
    }
    if (future.length) {
      frag.appendChild(buildSub('Convocatorias futuras', `${future.length} convocatorias previstas`, buildEvents(future, id)));
    }
    if (zones.length) {
      frag.appendChild(buildSub('Zonas de foco', 'Geografía de riesgo y vías alternativas', buildZones(zones)));
    }
    if (routes.length) {
      frag.appendChild(buildSub('Rutas', 'Trayectorias documentadas o previstas', buildRoutes(routes)));
    }
    if (corrs.length) {
      frag.appendChild(buildSub('Corredores económicos', 'Vías críticas con impacto logístico', buildCorridors(corrs)));
    }
    if (actors.length) {
      frag.appendChild(buildSub('Actores', 'Convocantes, líderes e intereses', buildActors(actors)));
    }
    // v3.5.2: narrativas locales (string array with embedded markdown links)
    if (narrLoc.length) {
      frag.appendChild(buildSub('Narrativas locales', `${narrLoc.length} encuadres en circulación`, buildNarrLoc(narrLoc)));
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
      const name = cleanStr(a.name);
      const role = cleanStr(a.role);
      const handle = cleanStr(a.handle);
      const notes = cleanStr(a.notes);
      const platform = cleanStr(a.platform);
      const followers = cleanStr(a.followers);
      const verification = cleanStr(a.verification);
      const url = cleanUrl(a.url);
      // skip cards that would carry zero useful info
      if (!name && !role && !handle && !notes && !url) return;
      const card = el('article', { class: 'grass-card account' });
      const top = el('div', { class: 'g-top' });
      const left = el('div');
      if (name) left.appendChild(el('div', { class: 'g-name' }, name));
      if (role) left.appendChild(el('div', { class: 'g-role' }, role));
      if (handle) left.appendChild(el('div', { class: 'g-handle' }, handle));
      top.appendChild(left);
      card.appendChild(top);
      if (notes) card.appendChild(el('p', { class: 'g-notes' }, notes));
      const meta = el('div', { class: 'g-meta' });
      if (platform) meta.appendChild(el('span', { class: 'g-tag ' + platformClass(platform) }, platform));
      if (followers) meta.appendChild(el('span', { class: 'g-tag' }, followers));
      if (verification) meta.appendChild(el('span', { class: 'g-tag ' + verification }, verification));
      if (meta.children.length) card.appendChild(meta);
      if (url) {
        card.appendChild(el('a', { class: 'g-link', href: url, target: '_blank', rel: 'noopener noreferrer' }, '↗ ' + safeAnchorText(url)));
      }
      grid.appendChild(card);
    });
    return grid;
  }

  function buildColectivosGrid(items) {
    const grid = el('div', { class: 'grass-colectivos-grid' });
    items.forEach(c => {
      const name = cleanStr(c.name);
      const scope = cleanStr(c.scope);
      const type = cleanStr(c.type);
      const leaders = Array.isArray(c.leaders) ? c.leaders.map(cleanStr).filter(Boolean) : [];
      const notes = cleanStr(c.notes);
      const platform = cleanStr(c.platform);
      const verification = cleanStr(c.verification);
      const url = cleanUrl(c.url);
      if (!name && !type && !notes && !leaders.length && !url) return;
      const card = el('article', { class: 'grass-card colectivo' });
      const top = el('div', { class: 'g-top' });
      if (name) top.appendChild(el('div', { class: 'g-name' }, name));
      if (scope) top.appendChild(el('span', { class: 'g-scope' }, scope));
      card.appendChild(top);
      if (type) card.appendChild(el('div', { class: 'g-role' }, type));
      if (leaders.length) card.appendChild(el('div', { class: 'g-leaders' }, 'Líderes: ' + leaders.join(', ')));
      if (notes) card.appendChild(el('p', { class: 'g-notes' }, notes));
      const meta = el('div', { class: 'g-meta' });
      if (platform) meta.appendChild(el('span', { class: 'g-tag ' + platformClass(platform) }, platform));
      if (verification) meta.appendChild(el('span', { class: 'g-tag ' + verification }, verification));
      if (meta.children.length) card.appendChild(meta);
      if (url) card.appendChild(el('a', { class: 'g-link', href: url, target: '_blank', rel: 'noopener noreferrer' }, '↗ ' + safeAnchorText(url)));
      grid.appendChild(card);
    });
    return grid;
  }

  function buildLivesGrid(items) {
    const grid = el('div', { class: 'grass-lives-grid' });
    items.forEach(l => {
      const title = cleanStr(l.title);
      const host = cleanStr(l.host);
      const topic = cleanStr(l.topic);
      const platform = cleanStr(l.platform);
      const date = cleanStr(l.date);
      const audience = cleanStr(l.audience);
      const verification = cleanStr(l.verification);
      const url = cleanUrl(l.url);
      if (!title && !host && !topic && !url) return;
      const card = el('article', { class: 'grass-card live' });
      if (title) card.appendChild(el('div', { class: 'g-name' }, title));
      if (host) card.appendChild(el('div', { class: 'g-host' }, host));
      if (topic) card.appendChild(el('p', { class: 'g-notes' }, topic));
      const meta = el('div', { class: 'g-meta' });
      if (platform) meta.appendChild(el('span', { class: 'g-tag ' + platformClass(platform) }, platform));
      if (date) meta.appendChild(el('span', { class: 'g-date' }, '📅 ' + date));
      if (audience) meta.appendChild(el('span', { class: 'g-tag' }, audience));
      if (verification) meta.appendChild(el('span', { class: 'g-tag ' + verification }, verification));
      if (meta.children.length) card.appendChild(meta);
      if (url) card.appendChild(el('a', { class: 'g-link', href: url, target: '_blank', rel: 'noopener noreferrer' }, '▶ ' + safeAnchorText(url)));
      grid.appendChild(card);
    });
    return grid;
  }

  function buildHashtagsGrid(items) {
    const grid = el('div', { class: 'grass-hashtags-grid' });
    items.forEach(h => {
      const tag = cleanStr(h.tag);
      const context = cleanStr(h.context);
      const sources = Array.isArray(h.sources) ? h.sources.map(cleanUrl).filter(Boolean) : [];
      if (!tag && !context && !sources.length) return;
      const pill = el('div', { class: 'grass-hashtag' });
      const tagCls = h.verification && String(h.verification).startsWith('verified') ? 'h-tag verified' : 'h-tag';
      if (tag) pill.appendChild(el('div', { class: tagCls }, tag));
      if (context) pill.appendChild(el('div', { class: 'h-context' }, context));
      if (sources.length) {
        const linkWrap = el('div', { class: 'h-context' });
        sources.slice(0, 2).forEach((u, i) => {
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

  // v3.5.2: narrativas locales — array of plain strings (often with markdown links)
  // Some entries may be {texto, fuente_url} objects — handle both shapes.
  function buildNarrLoc(items) {
    const grid = el('div', { class: 'cards', role: 'list' });
    items.forEach(raw => {
      let text = '', sourceUrl = '', sourceLabel = '';
      if (typeof raw === 'string') {
        text = cleanStr(raw);
      } else if (raw && typeof raw === 'object') {
        const titulo = cleanStr(raw.titulo) || cleanStr(raw.title);
        const desc = cleanStr(raw.descripcion) || cleanStr(raw.description) || cleanStr(raw.texto) || cleanStr(raw.text) || cleanStr(raw.summary) || cleanStr(raw.narrative);
        text = desc || titulo;
        // promote titulo to a separate label if both present
        if (titulo && desc && titulo !== desc) raw.__titulo = titulo;
        sourceUrl = cleanUrl(raw.fuente_url) || cleanUrl(raw.source_url) || cleanUrl(raw.url);
        sourceLabel = cleanStr(raw.fuente_nombre) || cleanStr(raw.source_name) || '';
      }
      if (!text) return;
      const card = el('article', { class: 'card narrative-loc-card', role: 'listitem' });
      if (raw && raw.__titulo) {
        card.appendChild(el('h5', { style: 'margin:0 0 var(--s-2) 0;font-size:var(--text-sm);color:var(--c-ink-0)' }, raw.__titulo));
      }
      card.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-1);line-height:1.55;margin:0', html: parseInlineMd(text) }));
      if (sourceUrl) {
        const src = el('div', { class: 'card-sources', style: 'margin-top:var(--s-2)' });
        src.appendChild(el('a', { href: sourceUrl, target: '_blank', rel: 'noopener noreferrer' }, sourceLabel || safeAnchorText(sourceUrl)));
        card.appendChild(src);
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

  function buildEvents(events, regionId) {
    const grid = el('div', { class: 'cards', role: 'list' });
    events.forEach(raw => {
      const evtid = raw.__evtid || '';
      // v3.5.2: bridge Spanish event keys + fall back to bando for status/side
      // Prefer Spanish name field (e.g. "La toma de Lima") over tipo ("marcha")
      const tipo = cleanStr(raw.tipo);
      // v3.5.5: if only `tipo` is present, build a descriptive title "Tipo · primera frase de ubicación"
      const ubicacionShort = (function () {
        const u = cleanStr(raw.ubicacion) || cleanStr(raw.lugar) || cleanStr(raw.location);
        if (!u) return '';
        // primera parte antes de una coma o slash
        return u.split(/[,/]/)[0].trim();
      })();
      let title = cleanStr(raw.title) || cleanStr(raw.titulo) || cleanStr(raw.nombre) || cleanStr(raw.convocatoria);
      if (!title) {
        title = tipo && ubicacionShort ? `${titleCase(tipo)} · ${ubicacionShort}` : (tipo || ubicacionShort || '');
      }
      // Convocantes: array → "a, b, c" or string
      let convener = cleanStr(raw.convener) || cleanStr(raw.convocante);
      if (!convener && Array.isArray(raw.convocantes) && raw.convocantes.length) {
        convener = raw.convocantes.map(cleanStr).filter(Boolean).join(' · ');
      }
      const e = {
        status: cleanStr(raw.status) || cleanStr(raw.estado),
        risk: cleanStr(raw.risk) || cleanStr(raw.nivel_riesgo),
        title,
        type: tipo,
        bando: cleanStr(raw.bando),
        summary: cleanStr(raw.summary) || cleanStr(raw.notas) || cleanStr(raw.descripcion) || cleanStr(raw.nota),
        date: cleanStr(raw.date) || cleanStr(raw.fecha) || cleanStr(raw.fecha_hora) || cleanStr(raw.fecha_convocatoria) || cleanStr(raw.fecha_inicio),
        location: cleanStr(raw.location) || cleanStr(raw.place) || cleanStr(raw.ubicacion) || cleanStr(raw.lugar),
        convener,
        magnitude: cleanStr(raw.magnitude) || cleanStr(raw.participantes_est) || cleanStr(raw.participantes_est_proyectado) || cleanStr(raw.magnitud),
        id: cleanStr(raw.id)
      };
      // v3.5.3: handle string `fuente` (URL) + `fuente_secundaria` + nested {fuente:{url}}
      let sources = [];
      if (Array.isArray(raw.sources)) sources = raw.sources.filter(s => s && s.url);
      else if (raw.source && raw.source.url) sources = [raw.source];
      else if (raw.fuente_url) sources = [{ url: raw.fuente_url, name: raw.fuente_nombre || raw.fuente_url }];
      else if (Array.isArray(raw.fuentes)) sources = raw.fuentes.map(s => typeof s === 'string' ? { url: s } : s).filter(s => s && s.url);
      else if (typeof raw.fuente === 'string' && /^https?:\/\//.test(raw.fuente)) sources.push({ url: raw.fuente });
      else if (raw.fuente && typeof raw.fuente === 'object' && raw.fuente.url) sources.push(raw.fuente);
      if (typeof raw.fuente_secundaria === 'string' && /^https?:\/\//.test(raw.fuente_secundaria)) sources.push({ url: raw.fuente_secundaria });

      const cardAttrs = { class: 'card event-card', role: 'listitem', tabindex: '0' };
      if (evtid) cardAttrs['data-evtid'] = evtid;
      if (regionId) cardAttrs['data-region-id'] = regionId;
      // v3.6.0: data-es-pasado for hide-past toggle
      const pastFlag = (raw.es_pasado === true) || (raw.es_pasado === 'true') || isPastDate(raw.fecha || raw.fecha_inicio || raw.date);
      if (pastFlag) cardAttrs['data-es-pasado'] = 'true';
      const card = el('article', cardAttrs);
      const headerRow = el('div', { style: 'display:flex;gap:var(--s-3);justify-content:space-between;align-items:flex-start;flex-wrap:wrap;margin-bottom:var(--s-2)' });

      // Badge priority: explicit status → bando → tipo (so it's never "—")
      let badgeCls = '', badgeLabel = '';
      if (e.status) {
        const si = stateInfo(e.status);
        badgeCls = si.cls; badgeLabel = si.label;
      } else if (e.bando) {
        const nb = normalizeBando(e.bando);
        badgeCls = 'badge side-' + (nb.side || 'neutro');
        badgeLabel = nb.label || titleCase(e.bando.replace(/[_-]/g,' '));
      } else if (e.type) {
        badgeCls = 'badge-latente';
        badgeLabel = titleCase(e.type);
      }
      if (badgeLabel) headerRow.appendChild(el('span', { class: `badge ${badgeCls}` }, badgeLabel));
      // Show tipo as separate chip when we used bando for the main badge (keeps "marcha"/"plantón" visible)
      if (e.type && e.bando && !e.status && e.title.toLowerCase() !== e.type.toLowerCase()) {
        headerRow.appendChild(el('span', { class: 'badge badge-latente' }, titleCase(e.type)));
      }
      if (e.risk) headerRow.appendChild(el('span', { class: `risk ${riskCls(e.risk)}` }, riskLabel(e.risk)));
      if (headerRow.children.length) card.appendChild(headerRow);

      if (e.title) card.appendChild(el('h3', null, e.title));
      if (e.summary) card.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2)', html: parseInlineMd(e.summary) }));

      const meta = el('dl', { class: 'card-meta' });
      // v3.5.7: route through formatEventDate so fecha_nota and fecha_fin show up,
      // and broken/empty dates render as "Por confirmar" instead of "Invalid Date"
      const displayDate = formatEventDate(raw);
      const rows = [
        ['Fecha / hora', displayDate],
        ['Lugar', e.location],
        ['Convocante', e.convener],
        ['Magnitud', e.magnitude ? String(e.magnitude) : ''],
        ['ID', e.id]
      ];
      rows.forEach(([dt, dd]) => {
        if (!dd) return;
        meta.appendChild(el('div', null, [el('dt', null, dt), el('dd', null, dd)]));
      });
      if (meta.children.length) card.appendChild(meta);

      if (sources.length) {
        const src = el('div', { class: 'card-sources' });
        src.appendChild(el('h4', null, 'Fuente' + (sources.length > 1 ? 's' : '')));
        sources.forEach(s => {
          if (!s || !s.url) return;
          src.appendChild(el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.name || s.label || safeAnchorText(s.url)));
        });
        card.appendChild(src);
      }

      // v3.5.7: click → map flyTo + open popup. Ignore clicks on inner anchors/buttons.
      if (evtid && regionId) {
        const tryFly = (e) => {
          if (e.target && (e.target.closest('a') || e.target.closest('button'))) return;
          const handle = window.__regionMaps && window.__regionMaps[regionId];
          if (handle && typeof handle.focusEvent === 'function') {
            handle.focusEvent(evtid);
          }
        };
        card.addEventListener('click', tryFly);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tryFly(e); }
        });
      }

      grid.appendChild(card);
    });
    return grid;
  }

  function buildZones(zones) {
    const grid = el('div', { class: 'zones' });
    zones.forEach(raw => {
      // v3.5.3: bridge richer puntos_riesgo shape (centro/sur/oriente):
      //   {nombre, tipo (bloqueo_vial / ...), nivel (MEDIO-ALTO), descripcion, antecedente, fuente}
      // lima/norte:
      //   {nombre, tipo_riesgo (alto/medio), ubicacion, justificacion, puntos_calientes?}
      const z = {
        name: cleanStr(raw.name) || cleanStr(raw.nombre),
        risk: cleanStr(raw.risk) || cleanStr(raw.tipo_riesgo) || cleanStr(raw.nivel_riesgo) || cleanStr(raw.nivel),
        polygon: cleanStr(raw.polygon) || cleanStr(raw.ubicacion),
        zoneType: cleanStr(raw.tipo) && !/^(alto|medio|bajo|moderado|max|máximo)/i.test(cleanStr(raw.tipo)) ? cleanStr(raw.tipo) : '',
        hotspots: raw.hotspots || raw.key_points || raw.puntos_calientes,
        description: cleanStr(raw.descripcion) || cleanStr(raw.description),
        antecedent: cleanStr(raw.antecedente) || cleanStr(raw.antecedent),
        alternatives: raw.alternatives || raw.advice || raw.recomendacion || raw.justificacion,
        sourceUrl: cleanUrl(raw.fuente) || cleanUrl(raw.fuente_url) || cleanUrl(raw.source_url)
      };
      if (!z.name && !z.polygon && !z.hotspots && !z.alternatives && !z.description) return;
      const lvl = riskCls(z.risk);
      const zoneCls = lvl === 'risk-alto' || lvl === 'risk-maximo' ? 'zone-alto' : lvl === 'risk-bajo' ? 'zone-bajo' : 'zone-moderado';
      const card = el('div', { class: `zone ${zoneCls}` });
      if (z.name) card.appendChild(el('h3', null, z.name));
      // v3.5.3: risk + zone-type chips row
      const chips = el('div', { style: 'display:flex;gap:var(--s-2);flex-wrap:wrap;margin:var(--s-1) 0' });
      if (z.risk) chips.appendChild(el('span', { class: `risk ${lvl}` }, riskLabel(z.risk)));
      if (z.zoneType) chips.appendChild(el('span', { class: 'badge badge-latente', style: 'font-size:var(--text-xs)' }, titleCase(z.zoneType.replace(/[_-]/g,' '))));
      if (chips.children.length) card.appendChild(chips);
      if (z.polygon) card.appendChild(el('div', { class: 'zone-poly' }, z.polygon));
      if (z.description) card.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-1);margin:var(--s-2) 0', html: parseInlineMd(z.description) }));

      const hotspots = z.hotspots;
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
      const alts = z.alternatives;
      if (alts) {
        const b = el('div', { class: 'zone-block' });
        b.appendChild(el('h4', null, 'Justificación / recomendación'));
        if (Array.isArray(alts)) {
          const ul = el('ul', { class: 'zone-list' });
          alts.forEach(h => h && ul.appendChild(el('li', { html: parseInlineMd(String(h)) })));
          b.appendChild(ul);
        } else {
          b.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin:var(--s-2) 0 0', html: parseInlineMd(String(alts)) }));
        }
        card.appendChild(b);
      }
      // v3.5.3: antecedente + fuente
      if (z.antecedent) {
        const b = el('div', { class: 'zone-block' });
        b.appendChild(el('h4', null, 'Antecedente'));
        b.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin:var(--s-2) 0 0', html: parseInlineMd(String(z.antecedent)) }));
        card.appendChild(b);
      }
      if (z.sourceUrl) {
        const src = el('div', { class: 'card-sources', style: 'margin-top:var(--s-2)' });
        src.appendChild(el('a', { href: z.sourceUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Fuente ↗'));
        card.appendChild(src);
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

      // Derive title (v3.5.9): prefer explicit name, else compose from first puntos_clave / distritos
      // anchors, else extract "X — ..." head from descripcion. Never render an empty "—".
      const descRaw = cleanStr(r.descripcion) || '';
      const puntos = Array.isArray(r.puntos_clave) ? r.puntos_clave.filter(Boolean) : [];
      const distritos = Array.isArray(r.distritos) ? r.distritos.filter(Boolean) : [];
      let title = cleanStr(r.name) || cleanStr(r.titulo) || cleanStr(r.title) || '';
      if (!title) {
        // Try "Head — rest" or "Head:" pattern in descripcion
        const m = descRaw.match(/^([^:—–\-]{4,80})[\s]*[:—–\-]/);
        if (m) title = m[1].trim();
      }
      if (!title && puntos.length >= 2) title = puntos[0] + ' → ' + puntos[puntos.length - 1];
      if (!title && distritos.length) title = distritos.join(' → ');
      if (!title && descRaw) title = shortText(descRaw, 70);
      if (!title) title = 'Ruta ' + (i + 1);
      card.appendChild(el('h3', null, title));

      // Trayectoria — puntos_clave ("A → B → C") cuando existen, si no la descripción.
      let pathStr = '';
      if (puntos.length) {
        pathStr = puntos.join(' → ');
      } else if (descRaw && descRaw !== title) {
        pathStr = descRaw;
      }
      if (pathStr) card.appendChild(el('p', { class: 'route-path' }, pathStr));

      // Distritos chips
      if (distritos.length) {
        const chips = el('div', { class: 'route-distritos' });
        distritos.slice(0, 6).forEach(d => {
          chips.appendChild(el('span', { class: 'route-distrito-chip' }, d));
        });
        card.appendChild(chips);
      }

      // Stats / meta (bando, patrón histórico)
      const stats = el('div', { class: 'route-stats' });
      const bando = cleanStr(r.bando) || cleanStr(r.side);
      if (bando) stats.appendChild(el('div', null, [document.createTextNode('Bando '), el('strong', null, bando)]));
      const patron = cleanStr(r.patron_historico);
      if (patron) {
        const div = el('div', { class: 'route-patron' });
        div.appendChild(el('strong', null, 'Patrón histórico: '));
        div.appendChild(document.createTextNode(shortText(patron, 180)));
        card.appendChild(div);
      }
      // Legacy fields (no se rompen si llegan)
      if (r.distance) stats.appendChild(el('div', null, [document.createTextNode('Distancia '), el('strong', null, r.distance)]));
      if (r.duration) stats.appendChild(el('div', null, [document.createTextNode('Duración '), el('strong', null, r.duration)]));
      if (r.frequency) stats.appendChild(el('div', null, [document.createTextNode('Frecuencia '), el('strong', null, r.frequency)]));
      if (r.actors) stats.appendChild(el('div', null, [document.createTextNode('Actores '), el('strong', null, r.actors)]));
      if (stats.childNodes.length) card.appendChild(stats);

      // Fuente — link al primer source
      const fuenteUrl = cleanStr(r.fuente) || cleanStr(r.source) || '';
      if (/^https?:\/\//i.test(fuenteUrl)) {
        const link = el('a', { class: 'route-fuente', href: fuenteUrl, target: '_blank', rel: 'noopener noreferrer' }, '↗ ' + safeAnchorText(fuenteUrl));
        card.appendChild(link);
      }

      grid.appendChild(card);
    });
    return grid;
  }

  // ====================================================================
  // v3.5.6 — Mapa interactivo por región (Leaflet)
  // ====================================================================
  // Color palette por bando — coordinada con CSS .side-* y .badge-*
  const MAP_SIDE_COLORS = {
    oficialismo: '#c0392b',    // rojo
    oposicion:   '#1f5fa8',    // azul
    'oposición': '#1f5fa8',
    regional:    '#1d5f30',    // verde
    comunitario: '#0e7c86',    // teal
    indigena:    '#7a4ab8',    // púrpura
    'indígena':  '#7a4ab8',
    institucional:'#334155',   // slate
    institucion: '#334155',
    nacional:    '#7a4ab8',
    mixto:       '#8a6d3b',    // dorado
    grassroots:  '#0e7c86',
    unknown:     '#6b7280'     // gris
  };
  const MAP_RISK_COLORS = {
    'risk-maximo':   '#7a1a1a',
    'risk-alto':     '#b8761f',
    'risk-moderado': '#9c8b3a',
    'risk-bajo':     '#3a7d3c'
  };
  // Normalize a bando/posicion token → palette key
  function sideKeyForMap(raw) {
    const s = String(raw || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!s) return 'unknown';
    if (/oficial|gobierno|pro_san|pro san|sanchez/.test(s)) return 'oficialismo';
    if (/opos|anti|pro_fp|pro fp|fujim|keiko/.test(s))      return 'oposicion';
    if (/regional|local/.test(s))                            return 'regional';
    if (/comun|barrio|vecin/.test(s))                        return 'comunitario';
    if (/indig|aymara|quechua|originari/.test(s))            return 'indigena';
    if (/institucion|policia|ffaa|fuerza/.test(s))           return 'institucional';
    if (/nacional|multi|transv/.test(s))                     return 'nacional';
    if (/grass|colectivo|frente/.test(s))                    return 'grassroots';
    return 'unknown';
  }
  // Friendly label for legend
  const MAP_SIDE_LABELS = {
    oficialismo: 'Oficialismo',
    oposicion: 'Oposición',
    regional: 'Regional',
    comunitario: 'Comunitario',
    indigena: 'Indígena',
    institucional: 'Institucional',
    nacional: 'Multipartidario',
    grassroots: 'Grassroots',
    mixto: 'Mixto',
    unknown: 'Sin clasificar'
  };

  // v3.5.10 — Fuzzy match events to a route by location overlap.
  // Match strategy: tokenize route.distritos + route.puntos_clave, then check if any
  // event.ubicacion / event.titulo contains any of those tokens. Score by # matching
  // tokens; return top matches.
  function findRelatedEvents(route, allEvents) {
    if (!route || !Array.isArray(allEvents) || !allEvents.length) return [];
    const stop = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'a', 'al', 'en', 'por', 'lima', 'peru', 'perú']);
    const normTok = (s) => String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 4 && !stop.has(t));

    const tokens = new Set();
    (route.distritos || []).forEach(d => normTok(d).forEach(t => tokens.add(t)));
    (route.puntos_clave || []).forEach(p => normTok(p).forEach(t => tokens.add(t)));
    // Also extract location-y nouns from descripcion (capitalised words)
    const descMatches = String(route.descripcion || '').match(/[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{3,}/g) || [];
    descMatches.forEach(w => normTok(w).forEach(t => tokens.add(t)));
    if (!tokens.size) return [];

    const scored = [];
    allEvents.forEach(ev => {
      const hay = normTok((ev.ubicacion || '') + ' ' + (ev.titulo || '') + ' ' + (ev.descripcion || ''));
      if (!hay.length) return;
      const haySet = new Set(hay);
      let score = 0;
      tokens.forEach(t => { if (haySet.has(t)) score++; });
      if (score >= 1) scored.push({ ev, score });
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5).map(x => x.ev);
  }

  // Resolve coords for a route: try puntos_clave first, then distritos, then fuzzy on descripcion
  function resolveRouteCoords(route, regionId) {
    const gz = window.DOSSIER_GAZETTEER;
    if (!gz) return [];

    // v3.5.8: try corridor match first — returns dense polyline following the actual road geometry
    // (Panamericana Norte/Sur, Carretera Central, Fernando Beláunde Terry, urban avenues, etc.)
    if (typeof gz.resolveCorridor === 'function') {
      const corr = gz.resolveCorridor(route, regionId);
      if (corr && corr.length >= 2) {
        // Tag the route as corridor-resolved so the renderer can style it differently
        route.__corridor_resolved = true;
        return corr;
      }
    }

    let pts = [];
    if (Array.isArray(route.puntos_clave) && route.puntos_clave.length) {
      pts = gz.resolveMany(route.puntos_clave, regionId);
    }
    if (pts.length < 2 && Array.isArray(route.distritos) && route.distritos.length) {
      pts = gz.resolveMany(route.distritos, regionId);
    }
    if (pts.length < 2 && route.descripcion) {
      // Try splitting descripcion on arrows / dashes
      const tokens = String(route.descripcion).split(/→|->|—|–|:|,|;/).map(s => s.trim()).filter(Boolean);
      pts = gz.resolveMany(tokens, regionId);
    }
    // De-duplicate consecutive identical coords
    const dedup = [];
    for (let i = 0; i < pts.length; i++) {
      if (i === 0 || pts[i][0] !== pts[i-1][0] || pts[i][1] !== pts[i-1][1]) dedup.push(pts[i]);
    }
    return dedup;
  }

  function shortText(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  function buildRegionMap(regionId, data) {
    const gz = window.DOSSIER_GAZETTEER;
    if (!gz || typeof L === 'undefined' || typeof L.map !== 'function') {
      // Mapping libs missing — skip silently
      return null;
    }
    const regionMeta = gz.REGIONS[regionId] || { center: [-9.19, -75.02], zoom: 5 };

    // Pre-resolve everything BEFORE creating the map so we know if there's nothing to show
    const routesResolved = (data.routes || []).map((r, i) => ({
      idx: i, raw: r, coords: resolveRouteCoords(r, regionId), side: sideKeyForMap(r.bando || r.side)
    })).filter(x => x.coords.length >= 2);

    const zonesResolved = (data.zones || []).map((z, i) => {
      const c = gz.resolve(z.nombre, regionId) || gz.resolve(z.ubicacion, regionId);
      return c ? { idx: i, raw: z, coord: c } : null;
    }).filter(Boolean);

    const allEv = (data.events || []).concat(data.future || []);
    const eventsResolved = allEv.map((ev, i) => {
      const c = gz.resolve(ev.ubicacion, regionId) || gz.resolve(ev.titulo, regionId);
      return c ? { idx: i, raw: ev, coord: c, side: sideKeyForMap(ev.bando), evtid: ev.__evtid || '' } : null;
    }).filter(Boolean);

    const totalGeoItems = routesResolved.length + zonesResolved.length + eventsResolved.length;
    if (totalGeoItems === 0) return null;  // Nothing geolocatable — don't render an empty map

    // ----- DOM scaffolding -----
    const wrap = el('section', { class: 'region-map-block', 'aria-label': 'Mapa de rutas, zonas y eventos' });
    const head = el('div', { class: 'sub-head' });
    head.appendChild(el('h4', null, '🗺️ Mapa de rutas, zonas y eventos'));
    const eyebrow = `${routesResolved.length} rutas · ${zonesResolved.length} zonas · ${eventsResolved.length} eventos georeferenciados`;
    head.appendChild(el('p', { class: 'eyebrow' }, eyebrow));
    wrap.appendChild(head);

    const mapHolder = el('div', { class: 'region-map-holder' });
    const mapEl = el('div', { class: 'region-map', id: `map-${regionId}`, 'aria-label': `Mapa interactivo de ${regionId}`, tabindex: '0' });
    mapHolder.appendChild(mapEl);

    // QoL toolbar (fullscreen + reset + tile toggle)
    const toolbar = el('div', { class: 'region-map-toolbar' });
    const btnReset = el('button', { type: 'button', class: 'map-btn', title: 'Reencuadrar a todos los elementos', 'aria-label': 'Reencuadrar mapa' }, 'Reencuadrar');
    const btnFull = el('button', { type: 'button', class: 'map-btn', title: 'Pantalla completa', 'aria-label': 'Pantalla completa', 'aria-pressed': 'false' }, '⤢ Expandir');
    const btnStyle = el('button', { type: 'button', class: 'map-btn', title: 'Cambiar estilo de mapa', 'aria-label': 'Estilo de mapa' }, 'Estilo: Claro');
    toolbar.appendChild(btnReset);
    toolbar.appendChild(btnStyle);
    toolbar.appendChild(btnFull);
    mapHolder.appendChild(toolbar);

    // Legend (collapsible)
    const legend = el('div', { class: 'region-map-legend', role: 'group', 'aria-label': 'Leyenda y filtros del mapa' });
    const legendHead = el('div', { class: 'legend-head' }, [
      el('strong', null, 'Capas'),
      el('button', { type: 'button', class: 'legend-toggle', 'aria-expanded': 'true', 'aria-label': 'Colapsar leyenda', title: 'Colapsar' }, '−')
    ]);
    legend.appendChild(legendHead);
    const legendBody = el('div', { class: 'legend-body' });
    legend.appendChild(legendBody);
    mapHolder.appendChild(legend);

    wrap.appendChild(mapHolder);

    // ----- Initialize Leaflet -----
    // Defer init until in DOM (use setTimeout so element has dimensions)
    setTimeout(() => {
      const map = L.map(mapEl, {
        zoomControl: true,
        scrollWheelZoom: false,           // less aggressive scrolling QoL
        attributionControl: true,
        worldCopyJump: false
      }).setView(regionMeta.center, regionMeta.zoom);

      // Enable scroll-zoom only on focus/click — QoL pattern from Google Maps embeds
      map.on('focus click', () => map.scrollWheelZoom.enable());
      map.on('blur', () => map.scrollWheelZoom.disable());
      mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

      // Tile layers — Carto Light + Carto Voyager (no API key)
      const tileLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap · © CARTO',
        maxZoom: 19, subdomains: 'abcd'
      });
      const tileVoy = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap · © CARTO',
        maxZoom: 19, subdomains: 'abcd'
      });
      tileLight.addTo(map);
      let currentTile = 'light';

      btnStyle.addEventListener('click', () => {
        if (currentTile === 'light') {
          map.removeLayer(tileLight); tileVoy.addTo(map);
          currentTile = 'voyager'; btnStyle.textContent = 'Estilo: Detallado';
        } else {
          map.removeLayer(tileVoy); tileLight.addTo(map);
          currentTile = 'light'; btnStyle.textContent = 'Estilo: Claro';
        }
      });

      // ----- Layer groups (one per element type) -----
      const layerRoutes = L.layerGroup().addTo(map);
      const layerZones  = L.layerGroup().addTo(map);
      const layerEvents = L.layerGroup().addTo(map);

      // ----- Draw routes -----
      const allPoints = [];
      routesResolved.forEach((r, i) => {
        const color = MAP_SIDE_COLORS[r.side] || MAP_SIDE_COLORS.unknown;
        // v3.5.8: corridor-resolved routes follow real road geometry — use solid/thicker line.
        // Routes resolved via fallback (sparse waypoints → straight segments) keep dashed style
        // as a visual cue that the path is best-estimate, not road-accurate.
        const isCorridor = !!r.raw.__corridor_resolved;
        const polyline = L.polyline(r.coords, {
          color: color,
          weight: isCorridor ? 5 : 4,
          opacity: isCorridor ? 0.88 : 0.70,
          lineJoin: 'round',
          lineCap: 'round',
          smoothFactor: isCorridor ? 1.0 : 1.5,
          dashArray: isCorridor
            ? (r.side === 'regional' ? '10,6' : null)        // corridor: only regional gets dashes
            : '4,7'                                            // fallback: always dashed (less authoritative)
        });
        // ----- v3.5.10 — Rich route popup: title + descripción + patrón histórico + distritos + traza + eventos relacionados + fuente -----
        // Título derivado (mismo algoritmo que la tarjeta .route)
        const descRaw = cleanStr(r.raw.descripcion) || '';
        const puntos = Array.isArray(r.raw.puntos_clave) ? r.raw.puntos_clave.filter(Boolean) : [];
        const distritosArr = Array.isArray(r.raw.distritos) ? r.raw.distritos.filter(Boolean) : [];
        let ruTitle = cleanStr(r.raw.name) || cleanStr(r.raw.titulo) || cleanStr(r.raw.title) || '';
        if (!ruTitle) {
          const m = descRaw.match(/^([^:—–\-]{4,80})[\s]*[:—–\-]/);
          if (m) ruTitle = m[1].trim();
        }
        if (!ruTitle && puntos.length >= 2) ruTitle = puntos[0] + ' → ' + puntos[puntos.length - 1];
        if (!ruTitle && distritosArr.length) ruTitle = distritosArr.join(' → ');
        if (!ruTitle && descRaw) ruTitle = shortText(descRaw, 70);
        if (!ruTitle) ruTitle = 'Ruta ' + (i + 1);

        // Header tag: only show bando if known (no empty "—")
        const bandoLabel = (r.side && r.side !== 'unknown') ? MAP_SIDE_LABELS[r.side] : null;
        const tagText = bandoLabel ? ('Ruta · ' + bandoLabel) : 'Ruta';

        // Path string (puntos_clave joined with arrows, fallback to descripcion if no puntos)
        const pathHtml = puntos.length
          ? `<div class="mp-meta mp-path"><strong>Trayecto:</strong> ${puntos.map(escapeHtml).join(' → ')}</div>`
          : '';

        // Descripción: only show if it differs from the title and is informative
        const descHtml = (descRaw && descRaw !== ruTitle)
          ? `<div class="mp-body">${escapeHtml(shortText(descRaw, 260))}</div>`
          : '';

        // Patrón histórico (best-estimate context)
        const patron = cleanStr(r.raw.patron_historico);
        const patronHtml = patron
          ? `<div class="mp-meta mp-patron"><strong>Patrón histórico:</strong> ${escapeHtml(shortText(patron, 220))}</div>`
          : '';

        // Distritos chips
        const distritosHtml = distritosArr.length
          ? `<div class="mp-meta"><strong>Distritos:</strong> ${distritosArr.map(escapeHtml).join(' · ')}</div>`
          : '';

        // Eventos relacionados (fuzzy match by ubicacion overlap with distritos / puntos_clave)
        const relatedEvents = findRelatedEvents(r.raw, allEv);
        let relatedHtml = '';
        if (relatedEvents.length) {
          const items = relatedEvents.slice(0, 3).map(ev => {
            const elabel = escapeHtml(shortText(ev.titulo || ev.descripcion || ev.tipo || ev.ubicacion || 'Evento', 70));
            const efecha = ev.fecha ? escapeHtml(formatEventDate(ev.fecha, ev.fecha_nota)) : '';
            const evid = ev.__evtid ? escapeHtml(ev.__evtid) : '';
            return evid
              ? `<li><a href="#" class="mp-evt-link" data-evtid="${evid}" data-region-id="${escapeHtml(regionId)}">· ${elabel}</a>${efecha ? ` <span class="mp-evt-date">(${efecha})</span>` : ''}</li>`
              : `<li>· ${elabel}${efecha ? ` <span class="mp-evt-date">(${efecha})</span>` : ''}</li>`;
          }).join('');
          relatedHtml = `<div class="mp-meta mp-related"><strong>Eventos relacionados:</strong><ul class="mp-evt-list">${items}</ul></div>`;
        }

        // Traza badge
        const trace = isCorridor
          ? '<span class="mp-trace mp-trace-corr" title="Traza sigue la geometría real del corredor">Traza: corredor histórico</span>'
          : '<span class="mp-trace mp-trace-est" title="Estimación entre puntos de referencia">Traza: estimada</span>';

        // Fuente
        const fuente = cleanStr(r.raw.fuente);
        const fuenteHtml = /^https?:\/\//i.test(fuente)
          ? `<div class="mp-meta"><a href="${escapeHtml(fuente)}" target="_blank" rel="noopener noreferrer">↗ ${escapeHtml(safeAnchorText(fuente))}</a></div>`
          : '';

        polyline.bindPopup(
          `<div class="map-popup map-popup-route">` +
          `<div class="mp-tag" style="background:${color}">${escapeHtml(tagText)}</div>` +
          `<div class="mp-title">${escapeHtml(ruTitle)}</div>` +
          pathHtml +
          descHtml +
          patronHtml +
          distritosHtml +
          relatedHtml +
          `<div class="mp-meta">${trace}</div>` +
          fuenteHtml +
          `</div>`,
          { maxWidth: 360 }
        );
        // v3.5.10: wire "eventos relacionados" links → focusEvent on this region's map
        polyline.on('popupopen', (e) => {
          const root = e.popup.getElement();
          if (!root) return;
          root.querySelectorAll('a.mp-evt-link[data-evtid]').forEach(a => {
            a.addEventListener('click', (ev) => {
              ev.preventDefault();
              const evtid = a.getAttribute('data-evtid');
              const rm = window.__regionMaps && window.__regionMaps[regionId];
              if (rm && typeof rm.focusEvent === 'function') rm.focusEvent(evtid);
            });
          });
        });
        // Endpoint markers (origin = green dot, destination = arrow-ish marker)
        const start = L.circleMarker(r.coords[0], { radius: 6, color: color, weight: 2, fillColor: '#ffffff', fillOpacity: 1 })
          .bindTooltip('Inicio', { permanent: false, direction: 'top', className: 'map-tip' });
        const end = L.circleMarker(r.coords[r.coords.length - 1], { radius: 7, color: color, weight: 2, fillColor: color, fillOpacity: 0.9 })
          .bindTooltip('Punto final', { permanent: false, direction: 'top', className: 'map-tip' });
        polyline.addTo(layerRoutes);
        start.addTo(layerRoutes); end.addTo(layerRoutes);
        r.coords.forEach(c => allPoints.push(c));
      });

      // ----- Draw zones -----
      zonesResolved.forEach(z => {
        const lvl = String(z.raw.nivel || z.raw.tipo_riesgo || 'medio').toLowerCase();
        const cls = lvl.includes('alto') || lvl.includes('máx') ? 'risk-alto'
          : lvl.includes('medio') || lvl.includes('moder') ? 'risk-moderado'
          : lvl.includes('bajo') ? 'risk-bajo' : 'risk-moderado';
        const color = MAP_RISK_COLORS[cls] || MAP_RISK_COLORS['risk-moderado'];
        const marker = L.circleMarker(z.coord, {
          radius: 11, color: color, weight: 2.5, fillColor: color, fillOpacity: 0.30
        });
        const desc = escapeHtml(shortText(z.raw.descripcion || z.raw.justificacion || '', 220));
        const fuente = z.raw.fuente ? `<a href="${escapeHtml(z.raw.fuente)}" target="_blank" rel="noopener">Fuente</a>` : '';
        const zNombre = cleanStr(z.raw.nombre) || cleanStr(z.raw.ubicacion) || 'Zona sin nombre';
        marker.bindPopup(
          `<div class="map-popup">` +
          `<div class="mp-tag" style="background:${color}">Zona · ${escapeHtml((z.raw.nivel || z.raw.tipo_riesgo || 'medio').toUpperCase())}</div>` +
          `<div class="mp-title">${escapeHtml(zNombre)}</div>` +
          (desc ? `<div class="mp-body">${desc}</div>` : '') +
          (fuente ? `<div class="mp-meta">${fuente}</div>` : '') +
          `</div>`,
          { maxWidth: 320 }
        );
        marker.bindTooltip(z.raw.nombre || 'Zona', { direction: 'top', className: 'map-tip' });
        marker.addTo(layerZones);
        allPoints.push(z.coord);
      });

      // ----- Draw events -----
      // v3.5.7: keep a registry so list↔map clicks work
      const eventMarkers = Object.create(null);
      eventsResolved.forEach(ev => {
        const color = MAP_SIDE_COLORS[ev.side] || MAP_SIDE_COLORS.unknown;
        const marker = L.circleMarker(ev.coord, {
          radius: 7, color: '#0b1a2b', weight: 1.5, fillColor: color, fillOpacity: 0.95
        });
        const titulo = ev.raw.titulo || ev.raw.tipo || 'Evento';
        const fechaRaw = ev.raw.fecha || '';
        const fecha = /^\d{4}-\d{2}-\d{2}/.test(String(fechaRaw))
          ? (function () { try { return formatDate(fechaRaw); } catch (_) { return fechaRaw; } })()
          : fechaRaw;
        const desc = escapeHtml(shortText(ev.raw.descripcion || ev.raw.tipo || '', 200));
        const ubic = escapeHtml(ev.raw.ubicacion || '');
        const fuente = ev.raw.fuente || ev.raw.fuente_url;
        const fuenteHtml = fuente ? `<a href="${escapeHtml(fuente)}" target="_blank" rel="noopener">Fuente</a>` : '';
        const evBandoLabel = (ev.side && ev.side !== 'unknown') ? MAP_SIDE_LABELS[ev.side] : null;
        const evTagText = evBandoLabel ? ('Evento · ' + evBandoLabel) : 'Evento';
        marker.bindPopup(
          `<div class="map-popup">` +
          `<div class="mp-tag" style="background:${color}">${escapeHtml(evTagText)}</div>` +
          `<div class="mp-title">${escapeHtml(titulo)}</div>` +
          (fecha ? `<div class="mp-meta"><strong>${escapeHtml(fecha)}</strong></div>` : '') +
          (ubic ? `<div class="mp-meta">📍 ${ubic}</div>` : '') +
          (desc ? `<div class="mp-body">${desc}</div>` : '') +
          (fuenteHtml ? `<div class="mp-meta">${fuenteHtml}</div>` : '') +
          `</div>`,
          { maxWidth: 320 }
        );
        marker.bindTooltip(shortText(titulo, 60), { direction: 'top', className: 'map-tip' });
        // v3.5.7: marker click → scroll to list card + flash
        if (ev.evtid) {
          eventMarkers[ev.evtid] = { marker: marker, coord: ev.coord };
          marker.on('click', () => {
            const card = document.querySelector(`.event-card[data-evtid="${ev.evtid}"][data-region-id="${regionId}"]`);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              card.classList.add('is-flashed');
              setTimeout(() => card.classList.remove('is-flashed'), 1600);
            }
          });
        }
        marker.addTo(layerEvents);
        allPoints.push(ev.coord);
      });

      // ----- Fit bounds -----
      function fitAll() {
        if (allPoints.length) {
          const bounds = L.latLngBounds(allPoints).pad(0.18);
          map.fitBounds(bounds, { animate: true, maxZoom: 14 });
        } else {
          map.setView(regionMeta.center, regionMeta.zoom);
        }
      }
      fitAll();
      btnReset.addEventListener('click', fitAll);

      // ----- Legend rows (with toggles) -----
      const layerDefs = [
        { key: 'routes', label: 'Rutas',  layer: layerRoutes, count: routesResolved.length, swatch: 'line' },
        { key: 'zones',  label: 'Zonas de riesgo', layer: layerZones, count: zonesResolved.length, swatch: 'ring' },
        { key: 'events', label: 'Eventos', layer: layerEvents, count: eventsResolved.length, swatch: 'dot' }
      ];
      layerDefs.forEach(L_ => {
        if (!L_.count) return;
        const row = el('label', { class: 'legend-row' });
        const cb = el('input', { type: 'checkbox', checked: true, 'data-key': L_.key, 'aria-label': `Mostrar ${L_.label}` });
        cb.addEventListener('change', () => {
          if (cb.checked) L_.layer.addTo(map); else map.removeLayer(L_.layer);
        });
        const sw = el('span', { class: `legend-swatch swatch-${L_.swatch}` });
        row.appendChild(cb);
        row.appendChild(sw);
        row.appendChild(el('span', { class: 'legend-label' }, L_.label));
        row.appendChild(el('span', { class: 'legend-count' }, String(L_.count)));
        legendBody.appendChild(row);
      });

      // Color legend (bandos used in this region)
      const sidesPresent = new Set();
      routesResolved.forEach(r => sidesPresent.add(r.side));
      eventsResolved.forEach(ev => sidesPresent.add(ev.side));
      const sidesList = Array.from(sidesPresent).filter(s => s && s !== 'unknown');
      if (sidesList.length) {
        legendBody.appendChild(el('div', { class: 'legend-divider' }));
        legendBody.appendChild(el('div', { class: 'legend-subtitle' }, 'Bandos'));
        sidesList.forEach(side => {
          const row = el('div', { class: 'legend-row legend-row-static' });
          row.appendChild(el('span', { class: 'legend-swatch swatch-band', style: `background:${MAP_SIDE_COLORS[side] || MAP_SIDE_COLORS.unknown}` }));
          row.appendChild(el('span', { class: 'legend-label' }, MAP_SIDE_LABELS[side] || side));
          legendBody.appendChild(row);
        });
      }

      // v3.5.8: Traza legend — distinguish corridor-resolved from estimated
      if (routesResolved.length) {
        const nCorr = routesResolved.filter(r => r.raw.__corridor_resolved).length;
        const nEst  = routesResolved.length - nCorr;
        if (nCorr || nEst) {
          legendBody.appendChild(el('div', { class: 'legend-divider' }));
          legendBody.appendChild(el('div', { class: 'legend-subtitle' }, 'Traza de la ruta'));
          if (nCorr) {
            const row = el('div', { class: 'legend-row legend-row-static' });
            row.appendChild(el('span', { class: 'legend-swatch swatch-line legend-trace-corr' }));
            row.appendChild(el('span', { class: 'legend-label' }, 'Corredor histórico (geometría real)'));
            row.appendChild(el('span', { class: 'legend-count' }, String(nCorr)));
            legendBody.appendChild(row);
          }
          if (nEst) {
            const row = el('div', { class: 'legend-row legend-row-static' });
            row.appendChild(el('span', { class: 'legend-swatch swatch-line legend-trace-est' }));
            row.appendChild(el('span', { class: 'legend-label' }, 'Estimada (puntos de referencia)'));
            row.appendChild(el('span', { class: 'legend-count' }, String(nEst)));
            legendBody.appendChild(row);
          }
        }
      }

      // Risk levels legend (only if zones present)
      if (zonesResolved.length) {
        legendBody.appendChild(el('div', { class: 'legend-divider' }));
        legendBody.appendChild(el('div', { class: 'legend-subtitle' }, 'Nivel de riesgo'));
        [['Alto','risk-alto'],['Moderado','risk-moderado'],['Bajo','risk-bajo']].forEach(([lbl, key]) => {
          const row = el('div', { class: 'legend-row legend-row-static' });
          row.appendChild(el('span', { class: 'legend-swatch swatch-band', style: `background:${MAP_RISK_COLORS[key]}` }));
          row.appendChild(el('span', { class: 'legend-label' }, lbl));
          legendBody.appendChild(row);
        });
      }

      // Off-map count (items without coordinates)
      const offTotal = (data.routes || []).length - routesResolved.length
        + (data.zones || []).length - zonesResolved.length
        + allEv.length - eventsResolved.length;
      if (offTotal > 0) {
        legendBody.appendChild(el('div', { class: 'legend-divider' }));
        legendBody.appendChild(el('div', { class: 'legend-note' }, `${offTotal} sin geolocalizar (ver listados abajo)`));
      }

      // Collapse / expand legend
      const legendBtn = legendHead.querySelector('.legend-toggle');
      legendBtn.addEventListener('click', () => {
        const expanded = legendBtn.getAttribute('aria-expanded') === 'true';
        legendBtn.setAttribute('aria-expanded', String(!expanded));
        legendBtn.textContent = expanded ? '+' : '−';
        legendBtn.setAttribute('aria-label', expanded ? 'Expandir leyenda' : 'Colapsar leyenda');
        legendBody.style.display = expanded ? 'none' : '';
      });

      // Fullscreen toggle
      btnFull.addEventListener('click', () => {
        const isFull = mapHolder.classList.toggle('is-fullscreen');
        btnFull.setAttribute('aria-pressed', String(isFull));
        btnFull.textContent = isFull ? '⤡ Salir' : '⤢ Expandir';
        setTimeout(() => { map.invalidateSize(); fitAll(); }, 60);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mapHolder.classList.contains('is-fullscreen')) {
          mapHolder.classList.remove('is-fullscreen');
          btnFull.setAttribute('aria-pressed', 'false');
          btnFull.textContent = '⤢ Expandir';
          setTimeout(() => { map.invalidateSize(); fitAll(); }, 60);
        }
      });

      // Tab visibility: when region tab becomes active, invalidate size
      // (Leaflet measures incorrectly when initialized in a display:none element)
      const checkVisible = () => {
        if (mapEl.offsetParent !== null) {
          map.invalidateSize();
          fitAll();
        }
      };
      setTimeout(checkVisible, 200);
      const panelObs = mapEl.closest('.tab-panel');
      if (panelObs && 'MutationObserver' in window) {
        new MutationObserver(checkVisible).observe(panelObs, { attributes: true, attributeFilter: ['class'] });
      }

      // v3.5.7: expose external handle for list → map interactivity
      window.__regionMaps = window.__regionMaps || {};
      window.__regionMaps[regionId] = {
        map,
        focusEvent(evtid) {
          const entry = eventMarkers[evtid];
          if (!entry) return false;
          // Make sure events layer is visible
          if (!map.hasLayer(layerEvents)) layerEvents.addTo(map);
          mapHolder.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // After scroll, fly + open popup
          setTimeout(() => {
            map.invalidateSize();
            map.flyTo(entry.coord, Math.max(map.getZoom(), 12), { animate: true, duration: 0.6 });
            setTimeout(() => entry.marker.openPopup(), 700);
          }, 320);
          return true;
        },
        resetView: fitAll
      };
    }, 0);

    return wrap;
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
    actors.forEach(raw => {
      // v3.5.3: actors use heterogeneous shapes.
      //   lima/norte:   {nombre, rol, posicion (side key), redes[], fuente}
      //   centro/sur/oriente: {nombre, cargo, posicion (long descriptive text), region, fuente}
      const name = cleanStr(raw.name) || cleanStr(raw.nombre);
      const rawSide = cleanStr(raw.type) || cleanStr(raw.side) || cleanStr(raw.bando);
      const posicionStr = cleanStr(raw.posicion);
      // Treat posicion as a side ONLY when it's a short token (no spaces, snake_case)
      const posicionIsSide = posicionStr && posicionStr.length < 40 && !/\s/.test(posicionStr);
      const sideTok = rawSide || (posicionIsSide ? posicionStr : '');
      const nb = sideTok ? normalizeBando(sideTok) : { side: '', label: '' };
      const role = cleanStr(raw.role) || cleanStr(raw.rol) || cleanStr(raw.cargo);
      const leader = cleanStr(raw.leader) || cleanStr(raw.lider);
      // Interest text: long posicion takes priority over generic descripcion/rol
      const longPosicion = posicionStr && !posicionIsSide ? posicionStr : '';
      const interest = longPosicion ||
                       cleanStr(raw.interest) || cleanStr(raw.capacity) || cleanStr(raw.status) ||
                       cleanStr(raw.descripcion);
      const region = cleanStr(raw.region);
      const sourceUrl = cleanUrl(raw.fuente) || cleanUrl(raw.fuente_url) || cleanUrl(raw.source_url) || (raw.source && cleanUrl(raw.source.url));
      const redes = Array.isArray(raw.redes) ? raw.redes : [];
      if (!name && !nb.label && !interest && !role && !redes.length) return;
      const card = el('div', { class: 'actor side-' + (nb.side || 'neutro') });
      // Header chips row: side label + region
      if (nb.label || region) {
        const hdr = el('div', { class: 'actor-meta', style: 'display:flex;gap:var(--s-2);flex-wrap:wrap;margin-bottom:var(--s-1)' });
        if (nb.label) hdr.appendChild(el('span', { class: 'badge side-' + nb.side, style: 'font-size:var(--text-xs)' }, nb.label));
        if (region) hdr.appendChild(el('span', { class: 'badge badge-latente', style: 'font-size:var(--text-xs)' }, '📍 ' + region));
        card.appendChild(hdr);
      }
      if (name) card.appendChild(el('div', { class: 'actor-name' }, name));
      if (role) card.appendChild(el('div', { class: 'actor-role', style: 'font-size:var(--text-xs);color:var(--c-muted);margin-bottom:var(--s-1)' }, role));
      if (leader) card.appendChild(el('div', { class: 'actor-interest', style: 'margin-bottom:var(--s-1);font-size:var(--text-xs);color:var(--c-muted)' }, 'Líder: ' + leader));
      if (interest) card.appendChild(el('div', { class: 'actor-interest', html: parseInlineMd(interest) }));
      if (redes.length) {
        const linksWrap = el('div', { class: 'actor-interest', style: 'margin-top:var(--s-1);font-size:var(--text-xs)' });
        redes.forEach((r, i) => {
          const url = cleanUrl(r.url);
          const handle = cleanStr(r.handle) || cleanStr(r.plataforma);
          if (!url) {
            if (handle) {
              if (linksWrap.childNodes.length) linksWrap.appendChild(document.createTextNode(' · '));
              linksWrap.appendChild(document.createTextNode(handle));
            }
            return;
          }
          if (linksWrap.childNodes.length) linksWrap.appendChild(document.createTextNode(' · '));
          linksWrap.appendChild(el('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, handle || safeAnchorText(url)));
        });
        if (linksWrap.childNodes.length) card.appendChild(linksWrap);
      }
      if (sourceUrl) {
        card.appendChild(el('div', { class: 'actor-interest', style: 'margin-top:var(--s-1);font-size:var(--text-xs)' }, [
          el('a', { href: sourceUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Fuente ↗')
        ]));
      }
      grid.appendChild(card);
    });
    return grid;
  }

  // ---------- Risk matrix ----------
  function renderRiskMatrix(rows) {
    const tbody = $('#risk-tbody');
    if (!tbody) return;
    // v3.5.1: rebuild header to match actual data shape (escenario, categoría, probabilidad, impacto, ventana, triggers)
    const table = tbody.closest('table');
    if (table) {
      const thead = table.querySelector('thead');
      if (thead) {
        thead.innerHTML = '<tr>' +
          '<th scope="col">Escenario</th>' +
          '<th scope="col">Categoría</th>' +
          '<th scope="col">Probabilidad</th>' +
          '<th scope="col">Impacto</th>' +
          '<th scope="col">Ventana</th>' +
          '<th scope="col">Disparadores</th>' +
        '</tr>';
      }
    }
    tbody.innerHTML = '';
    (rows || []).forEach(r => {
      const scenarioTitle = cleanStr(r.title) || cleanStr(r.scenario) || cleanStr(r.vector);
      const scenarioBody  = cleanStr(r.scenario);
      const category   = cleanStr(r.category) || cleanStr(r.region);
      const probability = cleanStr(r.probability) || cleanStr(r.level);
      const impact     = cleanStr(r.impact) || cleanStr(r.severity) || cleanStr(r.level);
      const window_    = cleanStr(r.timeframe) || cleanStr(r.window);
      const triggers   = Array.isArray(r.triggers) ? r.triggers.map(cleanStr).filter(Boolean) : [];
      const zonesField = Array.isArray(r.zones) ? r.zones.map(cleanStr).filter(Boolean).join(' · ') : cleanStr(r.zones);
      // skip empty rows (no scenario at all)
      if (!scenarioTitle && !scenarioBody) return;
      const tr = el('tr');
      // Escenario cell: bold title + truncated body summary
      const scenarioCell = el('td', { 'data-label': 'Escenario' });
      if (scenarioTitle) scenarioCell.appendChild(el('strong', null, scenarioTitle));
      if (scenarioBody && scenarioBody !== scenarioTitle) {
        const short = scenarioBody.length > 220 ? scenarioBody.slice(0, 220).trim() + '…' : scenarioBody;
        scenarioCell.appendChild(el('div', { style: 'font-size:var(--text-xs);color:var(--c-ink-2);margin-top:4px;line-height:1.4' }, short));
      }
      tr.appendChild(scenarioCell);
      tr.appendChild(el('td', { 'data-label': 'Categoría' }, category || '—'));
      tr.appendChild(el('td', { 'data-label': 'Probabilidad' },
        probability ? [el('span', { class: `risk ${riskCls(probability)}` }, probability)] : '—'));
      tr.appendChild(el('td', { 'data-label': 'Impacto' },
        impact ? [el('span', { class: `risk ${riskCls(impact)}` }, impact)] : '—'));
      tr.appendChild(el('td', { 'data-label': 'Ventana' }, window_ || '—'));
      const trigCell = el('td', { 'data-label': 'Disparadores' });
      if (triggers.length) {
        const shown = triggers.slice(0, 2).join(' · ');
        trigCell.appendChild(document.createTextNode(shown + (triggers.length > 2 ? ` (+${triggers.length - 2})` : '')));
      } else if (zonesField) {
        trigCell.appendChild(document.createTextNode(zonesField));
      } else {
        trigCell.appendChild(document.createTextNode('—'));
      }
      tr.appendChild(trigCell);
      tbody.appendChild(tr);
    });
  }

  // ---------- Early warning ----------
  function renderEarlyWarning(items) {
    const grid = $('#ew-grid');
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(raw => {
      // v3.5.2: rich rendering of EW indicators (data has indicator/threshold/current_status/trend/data_source/rationale/next_check/sources)
      const title = cleanStr(raw.signal) || cleanStr(raw.indicator) || cleanStr(raw.title);
      if (!title) return;
      const status = cleanStr(raw.current_status) || cleanStr(raw.status);
      const trend  = cleanStr(raw.trend);
      const threshold = cleanStr(raw.threshold) || cleanStr(raw.value);
      const rationale = cleanStr(raw.rationale) || cleanStr(raw.description);
      const action = cleanStr(raw.action) || cleanStr(raw.next_check);
      const trigger = cleanStr(raw.trigger);
      const dataSrc = cleanStr(raw.data_source);
      const sources = Array.isArray(raw.sources) ? raw.sources.filter(s => s && s.url) : [];

      const c = el('div', { class: 'ew' });
      // Status pill
      const head = el('div', { style: 'display:flex;gap:var(--s-2);align-items:center;flex-wrap:wrap;margin-bottom:var(--s-2)' });
      if (status) {
        const sLow = status.toLowerCase();
        let bg = 'var(--c-amber, #f4c430)', fg = '#000';
        if (/rojo|rojos|alto|max/.test(sLow)) { bg = 'var(--c-risk-alto, #c0392b)'; fg = '#fff'; }
        else if (/amarillo|moder|medio/.test(sLow)) { bg = 'var(--c-amber, #f4c430)'; fg = '#000'; }
        else if (/verde|bajo|estable/.test(sLow)) { bg = 'var(--c-risk-bajo, #6abf69)'; fg = '#0a3a1a'; }
        const sCls = /rojo|alto|max/.test(sLow) ? 'rojo' : (/verde|bajo|estable/.test(sLow) ? 'verde' : 'amarillo');
        head.appendChild(el('span', { class: `badge status-pill ew-status pill ${sCls}`, style: `background:${bg};color:${fg};font-size:var(--text-xs);font-weight:600` }, status));
      }
      if (trend) head.appendChild(el('span', { style: 'font-size:var(--text-xs);color:var(--c-ink-2)' }, trend));
      if (head.children.length) c.appendChild(head);
      c.appendChild(el('h4', null, title));
      if (threshold) c.appendChild(el('p', { style: 'font-size:var(--text-sm);color:var(--c-ink-2);margin:var(--s-2) 0' }, '🎯 Umbral: ' + threshold));
      if (rationale) c.appendChild(el('p', { style: 'font-size:var(--text-sm)' }, rationale));
      if (action) c.appendChild(el('div', { class: 'ew-trigger' }, '→ ' + action));
      if (trigger) c.appendChild(el('div', { class: 'ew-trigger' }, '↑ ' + trigger));
      if (dataSrc) c.appendChild(el('div', { style: 'font-size:var(--text-xs);color:var(--c-muted);margin-top:var(--s-2)' }, 'Fuente de datos: ' + dataSrc));
      if (sources.length) {
        const src = el('div', { class: 'card-sources', style: 'margin-top:var(--s-2)' });
        src.appendChild(el('h4', null, 'Fuentes'));
        sources.forEach(s => src.appendChild(el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title || s.name || safeAnchorText(s.url))));
        c.appendChild(src);
      }
      grid.appendChild(c);
    });
  }

  // ---------- Methodology ----------
  function renderMethod(m) {
    const grid = $('#method-grid');
    if (!grid) return;
    const phaseMatch = String(m.phases || '').match(/(\d+)/);
    const phaseN = phaseMatch ? phaseMatch[1] : '18';
    text('#methodology-title', `${phaseN} fases de análisis OSINT`);
    text('#methodology-deck', m.phases || 'Doce fases base + seis de expansión social. Cada fase con preámbulo y retrospección. Síntesis verificada contra fuentes originales.');
    const foldLbl = document.querySelector('#methodology .fold-label');
    if (foldLbl) foldLbl.textContent = `Ver las ${phaseN} fases`;
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
    pro_sanchez: 'Pro-Sánchez',
    pro_fujimori: 'Pro-Fujimori',
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
    // v3.5.3: alt_media `type` field encodes editorial line, not coverage scope
    izq: 'Izquierda', der: 'Derecha', centro: 'Centro', anti: 'Antifujimorista',
    pro_fp: 'Pro-Fujimorismo', pro_sanchez: 'Pro-Sánchez',
    nacional: 'Nacional', regional: 'Regional', comunitario: 'Comunitario', indigena: 'Indígena'
  };
  const DISINFO_TYPE_LABEL = {
    // v3.5.3: add the actual types found in data (bulo / engano / manipulado / fuera_contexto)
    bulo: 'Bulo',
    engano: 'Engaño',
    engaño: 'Engaño',
    manipulado: 'Contenido manipulado',
    fuera_contexto: 'Fuera de contexto',
    comunicado_falso: 'Comunicado falso',
    acta_falsa: 'Acta falsa',
    deepfake: 'Deepfake / IA',
    video_reciclado: 'Video reciclado',
    encuesta_falsa: 'Encuesta apócrifa',
    bot_coordinacion: 'Coordinación de bots'
  };

  // ---------- Social Intelligence (stats + platforms + handles + hashtags) ----------
  function renderSocialIntelligence(si, d) {
    si = si || {};
    d = d || {};
    // v3.5.2: title/desc fall back to defaults (no early-return on missing title)
    if (si.title) text('#social-title', si.title);
    if (si.description) text('#social-desc', si.description);
    if (si.contexto) text('#social-desc', si.contexto);

    // Derive handles from cuentas_emergentes if not provided
    const handles = (Array.isArray(si.handles) && si.handles.length)
      ? si.handles
      : (Array.isArray(si.cuentas_emergentes) ? si.cuentas_emergentes.map(adaptCuentaToHandle) : []);

    // Hashtags: support both keys
    const hashtags = (Array.isArray(si.hashtags) ? si.hashtags : []);

    // Lives are top-level, not in si
    const lives = Array.isArray(d.live_streams) ? d.live_streams : [];

    renderSocialStats(si.stats || {}, { handles, hashtags, lives, narratives: d.narratives || [], disinfo: d.disinformation_cases || [] });
    renderPlatformsSummary(si.platforms_summary || derivePlatformsSummary(handles, hashtags, lives));
    renderHandles(handles);
    renderHashtags(hashtags);
  }

  // v3.5.2: adapt cuentas_emergentes record → handle card shape
  function adaptCuentaToHandle(c) {
    const platforms = normalizePlatforms(c.plataforma || c.platform);
    const handle = cleanStr(c.handle) || cleanStr(c.usuario);
    // v3.5.4: bridge perfil_url and url_contenido as URL sources
    const url = cleanUrl(c.url) || cleanUrl(c.fuente_url) || cleanUrl(c.perfil_url) || cleanUrl(c.url_contenido);
    // v3.5.4: bando_aparente is another common key for political side
    const nb = normalizeBando(c.posicion || c.bando || c.side || c.bando_aparente);
    return {
      name: cleanStr(c.nombre) || cleanStr(c.name) || handle,
      // v3.5.4: contenido_reciente is a richer description field used in many cuentas_emergentes entries
      role: cleanStr(c.descripcion) || cleanStr(c.rol) || cleanStr(c.role) || cleanStr(c.contenido_reciente),
      side: nb.side,
      sideLabel: nb.label,
      followers: c.seguidores_aprox || c.followers,
      region: cleanStr(c.region) || (cleanStr(c.cobertura) || ''),
      priority: c.priority || c.prioridad || '',
      platforms: platforms.length ? platforms.map(p => ({ platform: p, handle: handle || (c.nombre || ''), url: url || '', verified: !!c.verified })) : (url || handle ? [{ platform: '', handle: handle || '—', url, verified: !!c.verified }] : [])
    };
  }

  // v3.5.2: derive a per-platform summary if data didn't ship one
  function derivePlatformsSummary(handles, hashtags, lives) {
    const buckets = { x: 0, tiktok: 0, facebook: 0, youtube: 0, instagram: 0 };
    handles.forEach(h => (h.platforms || []).forEach(p => { if (buckets[p.platform] != null) buckets[p.platform]++; }));
    hashtags.forEach(h => normalizePlatforms(h.plataforma || h.platform).forEach(p => { if (buckets[p] != null) buckets[p]++; }));
    lives.forEach(lv => normalizePlatforms(lv.plataforma || lv.platform).forEach(p => { if (buckets[p] != null) buckets[p]++; }));
    const out = {};
    Object.keys(buckets).forEach(k => {
      if (buckets[k] === 0) return;
      out[k] = `${buckets[k]} entradas monitoreadas (handles + hashtags + lives)`;
    });
    return out;
  }

  function renderSocialStats(stats, derived) {
    const wrap = $('#social-stats');
    if (!wrap) return;
    wrap.innerHTML = '';
    derived = derived || {};
    // v3.5.2: prefer real counts from data when stats object is empty
    const items = [];
    if (stats && (stats.jne_alerts_total || stats.jne_tiktok_alerts || stats.anp_press_attacks || stats.journalists_killed)) {
      items.push({ num: stats.jne_alerts_total, lbl: 'Alertas de desinformación (JNE)', src: stats.source_jne, srcLbl: 'JNE' });
      items.push({ num: stats.jne_tiktok_alerts, lbl: 'Alertas reportadas en TikTok', src: stats.source_jne, srcLbl: 'JNE' });
      items.push({ num: typeof stats.anp_press_attacks === 'string' ? stats.anp_press_attacks.split(' ')[0] : stats.anp_press_attacks, lbl: 'Ataques a periodistas 2026 (ANP)', src: stats.source_anp, srcLbl: 'ANP' });
      items.push({ num: stats.journalists_killed, lbl: 'Periodistas asesinados', src: stats.source_anp, srcLbl: 'ANP' });
    } else {
      items.push({ num: (derived.handles || []).length, lbl: 'Handles / cuentas monitoreadas' });
      items.push({ num: (derived.hashtags || []).length, lbl: 'Hashtags activos' });
      items.push({ num: (derived.lives || []).length, lbl: 'Transmisiones en vivo' });
      items.push({ num: (derived.narratives || []).length, lbl: 'Narrativas dominantes' });
      items.push({ num: (derived.disinfo || []).length, lbl: 'Casos de desinformación verificados' });
    }
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
    Object.entries(ps || {}).forEach(([k, v]) => {
      const summary = typeof v === 'string' ? v : (v && v.summary) || '';
      if (!summary) return;
      const card = el('article', { class: 'platform-card' });
      const name = el('div', { class: 'p-name' });
      name.appendChild(el('span', { class: 'p-icon' }, PLATFORM_ICON[k] || k.slice(0,2).toUpperCase()));
      name.appendChild(document.createTextNode(' ' + (PLATFORM_LABEL[k] || k)));
      card.appendChild(name);
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
    const card = el('article', { class: 'handle-card side-' + (h.side || 'neutro') });
    if (h.name) card.appendChild(el('div', { class: 'h-name' }, h.name));
    if (h.role) card.appendChild(el('div', { class: 'h-role' }, h.role));
    const plats = el('div', { class: 'h-platforms' });
    (h.platforms || []).forEach(p => {
      if (!p.handle && !p.url) return;
      const linkAttrs = { class: 'h-handle' + (p.verified ? ' verified' : '') };
      if (p.url) { linkAttrs.href = p.url; linkAttrs.target = '_blank'; linkAttrs.rel = 'noopener noreferrer'; }
      const a = p.url ? el('a', linkAttrs) : el('span', linkAttrs);
      const icon = p.platform ? (PLATFORM_ICON[p.platform] || '·') : '↗';
      a.textContent = icon + ' ' + (p.handle || 'abrir');
      plats.appendChild(a);
    });
    if (plats.children.length) card.appendChild(plats);
    const tags = el('div', { class: 'h-tags' });
    if (h.sideLabel) tags.appendChild(el('span', { class: 'h-tag side-' + h.side }, h.sideLabel));
    else if (h.side) tags.appendChild(el('span', { class: 'h-tag side-' + h.side }, SIDE_LABEL[h.side] || h.side));
    const followers = fmtFollowers(h.followers);
    if (followers) tags.appendChild(el('span', { class: 'h-tag' }, '👥 ' + followers));
    if (h.priority) tags.appendChild(el('span', { class: 'h-tag priority-' + h.priority }, 'prioridad ' + h.priority));
    if (h.region && h.region.toLowerCase() !== 'nacional') tags.appendChild(el('span', { class: 'h-tag side-regional' }, h.region));
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
    hashtags.forEach(raw => {
      // v3.5.2: bridge Spanish keys (hashtag/plataforma/volumen_estimado/bando/fuente_url/nota)
      const tag = cleanStr(raw.tag) || cleanStr(raw.hashtag) || cleanStr(raw.name);
      if (!tag) return;
      const platforms = normalizePlatforms(raw.platform || raw.plataforma);
      const platformLbl = platforms.map(p => PLATFORM_LABEL[p] || p).join(' / ') || cleanStr(raw.platform) || cleanStr(raw.plataforma);
      const volume = cleanStr(raw.volume) || cleanStr(raw.volumen_estimado) || cleanStr(raw.volumen);
      const region = cleanStr(raw.region);
      const ctx = cleanStr(raw.context) || cleanStr(raw.nota) || cleanStr(raw.descripcion);
      const nb = normalizeBando(raw.side || raw.bando);
      const peak = cleanStr(raw.pico_observado) || cleanStr(raw.peak);
      // v3.5.4: bridge additional Spanish source-url keys (fuente / fuente_secundaria / fuente2 / ejemplo_url)
      const srcUrl = cleanUrl(raw.evidence_url) || cleanUrl(raw.fuente_url) || cleanUrl(raw.source_url) ||
                     cleanUrl(raw.fuente) || cleanUrl(raw.ejemplo_url) || cleanUrl(raw.fuente_secundaria) || cleanUrl(raw.fuente2) ||
                     cleanUrl(raw.example_url) || cleanUrl(raw.source_metricas);

      const card = el('article', { class: 'hashtag-card side-' + (nb.side || 'neutro') });
      card.appendChild(el('div', { class: 'ht-tag' }, tag.startsWith('#') ? tag : '#' + tag));
      if (ctx) card.appendChild(el('p', { class: 'ht-ctx' }, ctx));
      const meta = el('div', { class: 'ht-meta' });
      if (platformLbl) meta.appendChild(el('span', null, '📡 ' + platformLbl));
      if (volume) {
        const v = el('span'); v.innerHTML = 'Volumen: <strong>' + escapeHtml(volume) + '</strong>';
        meta.appendChild(v);
      }
      if (peak) {
        const v = el('span'); v.innerHTML = 'Pico: <strong>' + escapeHtml(peak.split('T')[0]) + '</strong>';
        meta.appendChild(v);
      }
      if (region) meta.appendChild(el('span', null, '📍 ' + region));
      if (nb.label) meta.appendChild(el('span', { class: 'badge side-' + nb.side, style: 'font-size:var(--text-xs)' }, nb.label));
      if (meta.children.length) card.appendChild(meta);
      if (srcUrl) {
        const s = el('div', { class: 'card-sources', style: 'margin-top:var(--s-2)' });
        s.appendChild(el('a', { href: srcUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Evidencia'));
        card.appendChild(s);
      }
      wrap.appendChild(card);
    });
  }

  // ---------- Live Streams ----------
  function renderLiveStreams(lives) {
    text('#lives-count', lives.length + ' canales');
    const wrap = $('#lives-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    lives.forEach(raw => {
      // v3.5.2: bridge Spanish keys (plataforma/canal/fecha_inicio/tema/bando/url/nota/activo_al_render)
      const platformsArr = normalizePlatforms(raw.platform || raw.plataforma);
      const platformLbl = platformsArr.map(p => PLATFORM_LABEL[p] || p).join(' / ') ||
                          cleanStr(raw.platform) || cleanStr(raw.plataforma) || '';
      // v3.5.2.1: alternate shapes — some live entries use nombre/host/canal_o_cuenta/cuenta;
      // v3.5.2.2: if all channel keys are empty strings, derive from URL hostname (e.g. "youtube.com")
      let channel = cleanStr(raw.channel) || cleanStr(raw.canal) ||
                    cleanStr(raw.nombre) || cleanStr(raw.host) ||
                    cleanStr(raw.canal_o_cuenta) || cleanStr(raw.cuenta);
      if (!channel && raw.url) {
        try {
          const h = new URL(raw.url).hostname.replace(/^www\./, '');
          if (h) channel = h;
        } catch (_) { /* invalid URL — leave channel empty */ }
      }
      const focus = cleanStr(raw.focus) || cleanStr(raw.tema) || cleanStr(raw.descripcion) || cleanStr(raw.titulo) || cleanStr(raw.title) || cleanStr(raw.topic);
      const url = cleanUrl(raw.url);
      const sched = cleanStr(raw.schedule) || cleanStr(raw.fecha_inicio) || cleanStr(raw.fecha) ||
                    cleanStr(raw.fecha_emision) || cleanStr(raw.fecha_aprox) || cleanStr(raw.date);
      const audience = cleanStr(raw.audience) || cleanStr(raw.espectadores_pico) || cleanStr(raw.alcance) || cleanStr(raw.vistas);
      const nb = normalizeBando(raw.side || raw.bando);
      // active state: bool, or estado="vivo|live|en vivo", or activo_al_corte bool
      const estadoStr = (cleanStr(raw.estado) || '').toLowerCase();
      const isActive = raw.activo_al_render === true || raw.activo_al_corte === true ||
                       /\b(vivo|live|en\s*vivo|directo|on\s*air)\b/.test(estadoStr);
      const isArchived = raw.activo_al_render === false || raw.activo_al_corte === false ||
                         /\b(archivad|finalizad|grabad|vod)\b/.test(estadoStr);
      const note = cleanStr(raw.note) || cleanStr(raw.nota);
      if (!channel && !focus && !url && !platformLbl) return;

      const card = el('article', { class: 'live-card side-' + (nb.side || 'neutro') });
      if (platformLbl) card.appendChild(el('div', { class: 'l-platform' }, platformLbl));
      if (channel) card.appendChild(el('div', { class: 'l-channel' }, channel));
      const chips = el('div', { class: 'l-meta', style: 'flex-wrap:wrap;gap:var(--s-2)' });
      if (nb.label) chips.appendChild(el('span', { class: 'badge side-' + nb.side, style: 'font-size:var(--text-xs)' }, nb.label));
      if (isActive)  chips.appendChild(el('span', { class: 'badge', style: 'background:var(--c-risk-bajo,#e6f7ec);color:#0d5c2a;font-size:var(--text-xs)' }, '● En vivo'));
      else if (isArchived) chips.appendChild(el('span', { class: 'badge badge-latente', style: 'font-size:var(--text-xs)' }, 'Archivado'));
      if (chips.children.length) card.appendChild(chips);
      if (sched) {
        // v3.5.3: humanize ISO datetime in live-card schedule
        const schedStr = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(sched)
          ? (function () { try { return formatDate(sched); } catch (_) { return sched; } })()
          : sched;
        card.appendChild(el('div', { class: 'l-schedule' }, '🕒 ' + schedStr));
      }
      if (focus) card.appendChild(el('p', { class: 'l-focus' }, focus));
      if (note && note !== focus) card.appendChild(el('p', { class: 'l-focus', style: 'color:var(--c-ink-2);font-size:var(--text-xs)' }, note));
      const meta = el('div', { class: 'l-meta' });
      if (audience) meta.appendChild(el('span', null, '👥 ' + audience));
      if (url) {
        const a = el('a', { href: url, target: '_blank', rel: 'noopener noreferrer', class: 'l-url' });
        a.textContent = '↗ Abrir canal';
        meta.appendChild(a);
      }
      if (meta.children.length) card.appendChild(meta);
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
      if (n.summary) card.appendChild(el('p', { class: 'n-summary', html: parseInlineMd(n.summary) }));
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

  function renderValidacionLectura(val, mc, er) {
    const ul = $('#val-lectura');
    if (!ul) return;
    const bullets = (val || {}).lectura_ejecutiva;
    if (!Array.isArray(bullets) || !bullets.length) return;
    ul.innerHTML = '';
    bullets.forEach(b => {
      const li = el('li');
      if (b.titulo) li.appendChild(el('strong', null, b.titulo + ': '));
      li.appendChild(document.createTextNode(b.texto || b.text || ''));
      ul.appendChild(li);
    });
    const histLead = $('#val-historico-lead');
    if (histLead && er && er.cifras_actuales) {
      const m = formatSignedInt(er.cifras_actuales.margen_actual);
      const pctVal = (er.cifras_actuales.pct_actas || '99,63%').replace('.', ',');
      histLead.innerHTML = `Fujimori obtuvo <strong>66,2&nbsp;%</strong> del voto exterior en 2021 y aun así perdió por <strong>44&thinsp;263</strong> votos. En 2026 el exterior ya está contabilizado al 100&nbsp;% y Fujimori lidera por <strong>${escapeHtml(m)}</strong> votos al ${escapeHtml(pctVal)} — la magnitud del margen actual supera ampliamente el umbral de empate técnico.`;
    }
    const bayesDesc = $('#val-bayes-desc');
    if (bayesDesc && er && er.cifras_actuales) {
      const mBayes = formatSignedInt(er.cifras_actuales.margen_actual);
      const pctBayes = (er.cifras_actuales.pct_actas || '99,63%').replace('.', ',');
      bayesDesc.textContent = `El voto exterior cerró al 100 % el 12-jun con ~63,4 % pro-Fujimori. El posterior bayesiano confirma sesgo pro-F favorable, ya materializado en el margen observado (${mBayes} votos al ${pctBayes}).`;
    }
  }

  // ---------- Reversion / Montecarlo ----------
  function renderReversion(mc, er) {
    const root = $('#reversion');
    if (!root) return;
    if (!mc) { root.style.display = 'none'; return; }

    // v3.7.0: manual es-PE thousands separator (period). toLocaleString('es-PE') retorna coma en Chromium.
    const fmt = (n) => {
      if (n == null || isNaN(n)) return '—';
      return String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    const sgn = (n) => (n >= 0 ? '+' : '−') + fmt(Math.abs(n));
    const pct = (n, dec = 2) => (Number(n) * 100).toFixed(dec).replace('.', ',') + ' %';

    const est = mc.estado_actual || {};
    const br = mc.breakeven || {};
    const m = mc.montecarlo || {};
    const hist = mc.histograma_margen || {};
    const paises = mc.breakdown_paises || [];
    const actasStatus = mc.actas_status || null;
    const sens = mc.sensibilidad || [];
    const interp = mc.interpretacion || {};
    const meta = mc.metadata || {};

    // KPIs
    const totalPend = (br.votos_pendientes && br.votos_pendientes.total) || 0;
    text('#rev-total-pend', fmt(Math.round(totalPend)));
    text('#rev-prob', pct(m.probabilidad_fujimori_gana || 0, 2));
    const probSubBase = 'Predicción ajustada · ensemble de 4 modelos + mercados de predicción';
    text('#rev-prob-sub', probSubBase);
    text('#rev-margen', sgn(Math.round(m.margen_final_media || 0)) + ' votos');
    text('#rev-margen-banda', 'Banda 90 %: [' + sgn(Math.round(m.margen_final_p5 || 0)) + ' ; ' + sgn(Math.round(m.margen_final_p95 || 0)) + ']');
    text('#rev-breakeven', fmt(br.votos_fujimori_necesarios || 0) + ' votos');
    text('#rev-breakeven-pct', '≥' + String(br.pct_pendiente_necesario || 0).replace('.', ',') + ' % del pendiente debe ir a Fujimori');
    // v3.4: si Fuj ya lleva la ventaja, mostrar valor absoluto con signo +
    const ventajaRaw = est.ventaja_fujimori_votos != null ? est.ventaja_fujimori_votos : (est.ventaja_sanchez_votos || br.ventaja_actual_sanchez || 0);
    text('#rev-ventaja', (ventajaRaw >= 0 ? '+' : '−') + fmt(Math.abs(ventajaRaw)) + ' votos');
    if (est.pct_escrutado != null) {
      const pe = (est.pct_escrutado * 100).toFixed(2).replace('.', ',') + ' % escrutado (ONPE)';
      text('#rev-ventaja-sub', 'al ' + pe);
    }
    if (er && er.cifras_actuales) {
      const ca = er.cifras_actuales;
      if (ca.margen_actual != null) text('#rev-ventaja', formatSignedInt(ca.margen_actual) + ' votos');
      if (ca.pct_actas) {
        const pe = ca.pct_actas.replace('.', ',').replace('%', ' %').replace(/ % %/, ' %').trim();
        text('#rev-ventaja-sub', 'al ' + pe + ' escrutado (ONPE)');
      }
    }

    renderHistogram(hist);
    // v3.5.11: actas pendientes + impugnadas reemplaza el Top 6 países
    if (actasStatus) {
      const stOverlay = Object.assign({}, actasStatus);
      if (er && er.cifras_actuales) {
        const ca = er.cifras_actuales;
        if (ca.margen_actual != null) stOverlay.margen_actual_votos = ca.margen_actual;
        const pctNum = parseFloat(String(ca.pct_actas || '').replace('%', '').replace(',', '.'));
        if (!isNaN(pctNum)) stOverlay.avance_nacional_pct = pctNum / 100;
      }
      renderActas(stOverlay);
    } else {
      renderPaises(paises);
    }
    renderSensibilidad(sens);
    renderValidacion(mc);

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

  // v3.5.11: render del estado de actas ONPE/JNE (reemplaza Top 6 países)
  function renderActas(st) {
    const fmt = (n) => (n == null || isNaN(n)) ? '—' : String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const pct = (n, dec) => (Number(n) * 100).toFixed(dec != null ? dec : 1).replace('.', ',') + ' %';

    // Header KPIs
    text('#rev-actas-margen', (st.margen_actual_votos >= 0 ? '+' : '') + fmt(st.margen_actual_votos || 0));
    text('#rev-actas-avance', pct(st.avance_nacional_pct || 0, 3));
    text('#rev-actas-fecha-oficial', (st.impacto && st.impacto.fecha_oficial_estimada) || '—');

    // Pendientes
    const pendTable = $('#rev-pendientes-table');
    const pendSum = $('#rev-pendientes-sum');
    if (pendTable) {
      pendTable.innerHTML = '';
      const pendientes = st.pendientes || [];
      const totPend = pendientes.reduce((s, p) => s + (p.count || 0), 0);
      if (pendSum) pendSum.textContent = fmt(totPend) + ' actas';
      const tbl = el('table', { class: 'rev-actas-tbl' });
      const thead = el('thead');
      const trh = el('tr');
      ['Origen', 'Actas', 'Detalle', 'Voto esperado'].forEach(h => trh.appendChild(el('th', null, h)));
      thead.appendChild(trh);
      tbl.appendChild(thead);
      const tbody = el('tbody');
      pendientes.forEach((p, idx) => {
        const hasDetalle = Array.isArray(p.detalle_paises) && p.detalle_paises.length > 0;
        const tr = el('tr', hasDetalle ? { class: 'rev-actas-row-foldable', 'data-foldable-idx': String(idx) } : null);
        const tdOrigen = el('td', { class: 'rev-actas-origen' });
        if (hasDetalle) {
          const caret = el('span', { class: 'rev-actas-caret', 'aria-hidden': 'true' }, '▸');
          tdOrigen.appendChild(caret);
          tdOrigen.appendChild(document.createTextNode(' ' + (p.origen || '—')));
        } else {
          tdOrigen.textContent = p.origen || '—';
        }
        tr.appendChild(tdOrigen);
        tr.appendChild(el('td', { class: 'num rev-actas-count' }, fmt(p.count || 0)));
        tr.appendChild(el('td', { class: 'rev-actas-detalle' }, p.detalle || ''));
        tr.appendChild(el('td', { class: 'rev-actas-voto' }, p.voto_esperado || '—'));
        tbody.appendChild(tr);

        if (hasDetalle) {
          tr.setAttribute('role', 'button');
          tr.setAttribute('tabindex', '0');
          tr.setAttribute('aria-expanded', 'false');
          // Sub-row
          const trSub = el('tr', { class: 'rev-actas-subrow', 'data-sub-of': String(idx), style: 'display:none' });
          const tdSub = el('td', { colspan: '4', class: 'rev-actas-subcell' });
          const subWrap = el('div', { class: 'rev-actas-sub-wrap' });
          const subHead = el('div', { class: 'rev-actas-sub-head' });
          subHead.appendChild(el('span', { class: 'rev-actas-sub-title' }, 'Desglose por país — ' + fmt(p.detalle_paises_total || 0) + ' países (datos ONPE en directo)'));
          if (p.fuente_directa) {
            subHead.appendChild(el('span', { class: 'rev-actas-sub-fuente' }, p.fuente_directa));
          }
          subWrap.appendChild(subHead);
          const subTbl = el('table', { class: 'rev-actas-sub-tbl' });
          const subTh = el('thead');
          const subTrh = el('tr');
          ['País', 'Total actas', 'Contab.', 'Obs. JEE', '% avance', 'Líder', '% líder', 'Votos F', 'Votos S'].forEach(h => subTrh.appendChild(el('th', null, h)));
          subTh.appendChild(subTrh);
          subTbl.appendChild(subTh);
          const subTbody = el('tbody');
          // v3.5.12: agrupar por continente — datos directos del portal ONPE
          const grouped = {};
          const contOrder = [];
          (p.detalle_paises || []).forEach(c => {
            const k = c.continente || 'OTROS';
            if (!grouped[k]) { grouped[k] = []; contOrder.push(k); }
            grouped[k].push(c);
          });
          // Orden de continentes
          const contRank = { 'ÁFRICA': 1, 'AMÉRICA': 2, 'ASIA': 3, 'EUROPA': 4, 'OCEANÍA': 5 };
          contOrder.sort((a, b) => (contRank[a] || 99) - (contRank[b] || 99));
          const ncols = 9;
          contOrder.forEach(cont => {
            const arr = grouped[cont];
            const totVotosF = arr.reduce((s, x) => s + (x.fujimori_votos || 0), 0);
            const totVotosS = arr.reduce((s, x) => s + (x.sanchez_votos || 0), 0);
            const totActas = arr.reduce((s, x) => s + (x.actas_total || 0), 0);
            const totCont = arr.reduce((s, x) => s + (x.actas_contabilizadas || 0), 0);
            // Encabezado del continente
            const trCont = el('tr', { class: 'rev-actas-sub-cont' });
            const tdCont = el('td', { colspan: String(ncols), class: 'rev-actas-sub-cont-cell' });
            tdCont.appendChild(el('span', { class: 'rev-actas-sub-cont-name' }, cont + ' (' + arr.length + ' países)'));
            const totalLider = totVotosF >= totVotosS ? 'Fujimori ' + pct(totVotosF / Math.max(1, totVotosF + totVotosS), 1) : 'Sánchez ' + pct(totVotosS / Math.max(1, totVotosF + totVotosS), 1);
            tdCont.appendChild(el('span', { class: 'rev-actas-sub-cont-meta' }, totCont + '/' + totActas + ' actas · ' + totalLider));
            trCont.appendChild(tdCont);
            subTbody.appendChild(trCont);
            // Ordenar países por votos totales (mayor primero)
            arr.slice().sort((a, b) => ((b.fujimori_votos || 0) + (b.sanchez_votos || 0)) - ((a.fujimori_votos || 0) + (a.sanchez_votos || 0))).forEach(c => {
              const cRow = el('tr');
              const tdPais = el('td', { class: 'rev-actas-sub-pais' });
              if (c.iso && c.iso !== '—') tdPais.appendChild(el('span', { class: 'rev-actas-sub-iso' }, c.iso));
              tdPais.appendChild(document.createTextNode(' ' + (c.pais || '—')));
              cRow.appendChild(tdPais);
              cRow.appendChild(el('td', { class: 'num' }, fmt(c.actas_total || 0)));
              cRow.appendChild(el('td', { class: 'num' }, fmt(c.actas_contabilizadas || 0)));
              const obs = c.actas_observadas || 0;
              const tdObs = el('td', { class: 'num' });
              if (obs > 0) {
                tdObs.appendChild(el('span', { class: 'rev-actas-sub-obs' }, String(obs)));
              } else {
                tdObs.textContent = '0';
              }
              cRow.appendChild(tdObs);
              cRow.appendChild(el('td', { class: 'num' }, ((c.avance_pct || 0)).toFixed(1).replace('.', ',') + ' %'));
              const liderCls = c.lider === 'Fujimori' ? 'rev-actas-lider rev-actas-lider-f'
                            : c.lider === 'Sánchez' ? 'rev-actas-lider rev-actas-lider-s'
                            : 'rev-actas-lider rev-actas-lider-m';
              cRow.appendChild(el('td', null, el('span', { class: liderCls }, c.lider || '—')));
              cRow.appendChild(el('td', { class: 'num' }, c.lider_pct != null ? pct(c.lider_pct, 1) : '—'));
              cRow.appendChild(el('td', { class: 'num rev-actas-sub-vf' }, fmt(c.fujimori_votos || 0)));
              cRow.appendChild(el('td', { class: 'num rev-actas-sub-vs' }, fmt(c.sanchez_votos || 0)));
              subTbody.appendChild(cRow);
            });
          });
          subTbl.appendChild(subTbody);
          subWrap.appendChild(subTbl);
          tdSub.appendChild(subWrap);
          trSub.appendChild(tdSub);
          tbody.appendChild(trSub);

          // Toggle handler
          const toggle = () => {
            const expanded = tr.getAttribute('aria-expanded') === 'true';
            tr.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            trSub.style.display = expanded ? 'none' : 'table-row';
            tr.classList.toggle('rev-actas-row-open', !expanded);
          };
          tr.addEventListener('click', toggle);
          tr.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
          });
        }
      });
      tbl.appendChild(tbody);
      pendTable.appendChild(tbl);
    }

    // Impugnadas
    const imp = st.impugnadas || {};
    const impTable = $('#rev-impugnadas-table');
    const impSum = $('#rev-impugnadas-sum');
    if (impTable) {
      impTable.innerHTML = '';
      if (impSum) impSum.textContent = fmt(imp.total || 0) + ' actas · ' + pct(imp.en_tramite_pct || 0, 0) + ' en trámite';
      const tbl = el('table', { class: 'rev-actas-tbl' });
      const thead = el('thead');
      const trh = el('tr');
      ['Región', 'Actas', 'Líder', '% líder'].forEach(h => trh.appendChild(el('th', null, h)));
      thead.appendChild(trh);
      tbl.appendChild(thead);
      const tbody = el('tbody');
      (imp.por_region || []).forEach(r => {
        const tr = el('tr');
        tr.appendChild(el('td', { class: 'rev-actas-region' }, r.region || '—'));
        tr.appendChild(el('td', { class: 'num rev-actas-count' }, fmt(r.count || 0)));
        const liderCls = r.lider === 'Fujimori' ? 'rev-actas-lider rev-actas-lider-f'
                      : r.lider === 'Sánchez' ? 'rev-actas-lider rev-actas-lider-s'
                      : 'rev-actas-lider rev-actas-lider-m';
        tr.appendChild(el('td', null, el('span', { class: liderCls }, r.lider || '—')));
        tr.appendChild(el('td', { class: 'num' }, r.lider_pct != null ? pct(r.lider_pct, 1) : '—'));
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      impTable.appendChild(tbl);
    }

    // Motivos
    const motivos = $('#rev-impugnadas-motivos');
    if (motivos) {
      motivos.innerHTML = '';
      const lbl = el('span', { class: 'rev-actas-motivos-lbl' }, 'Motivos principales:');
      motivos.appendChild(lbl);
      const ul = el('ul', { class: 'rev-actas-motivos-list' });
      (imp.motivos_principales || []).forEach(m => ul.appendChild(el('li', null, m)));
      motivos.appendChild(ul);
    }

    // Impacto
    const impacto = st.impacto || {};
    text('#rev-impact-votos', fmt(impacto.votos_en_juego_estimado || 0));
    const ratio = impacto.margen_vs_votos_en_juego_ratio || 0;
    text('#rev-impact-ratio', pct(ratio, 3));
    text('#rev-impact-recuento', (imp.recuento_programadas || 0) + ' de ' + (imp.recuento_total || 0));
    text('#rev-impact-pf', impacto.escenario_pro_fujimori || '—');
    text('#rev-impact-ps', impacto.escenario_pro_sanchez || '—');
    text('#rev-impact-critico', impacto.factor_critico || '');

    // Fuentes
    const fts = $('#rev-actas-fuentes');
    if (fts) {
      fts.innerHTML = '';
      const lbl = el('span', { class: 'rev-actas-fuentes-lbl' }, 'Fuentes:');
      fts.appendChild(lbl);
      (st.fuentes || []).forEach((f, i) => {
        const a = el('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer', class: 'rev-actas-fuente-link' }, f.nombre || f.url);
        fts.appendChild(a);
        if (i < (st.fuentes.length - 1)) fts.appendChild(document.createTextNode(' · '));
      });
    }
  }

  function renderPaises(paises) {
    const grid = $('#rev-paises-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!paises.length) return;
    const sorted = paises.slice().sort((a, b) => (b.margen_fujimori_media || 0) - (a.margen_fujimori_media || 0));
    const maxAbs = Math.max.apply(null, sorted.map(p => Math.abs(p.margen_fujimori_p95 || p.margen_fujimori_media || 0)));
    const fmt = (n) => (n == null || isNaN(n)) ? '—' : String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

  // ---------- Validación cruzada (Sección 2c) ----------
  function renderValidacion(mc) {
    const root = $('#validacion');
    if (!root) return;
    if (!mc || !mc.modelos || !mc.prediccion_final_v33) { root.style.display = 'none'; return; }

    const fmt = (n) => (n == null || isNaN(n)) ? '—' : String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const sgn = (n) => (n >= 0 ? '+' : '−') + fmt(Math.abs(Math.round(n)));
    const pct = (n, dec) => (Number(n) * 100).toFixed(dec != null ? dec : 1).replace('.', ',') + ' %';

    const pred = mc.prediccion_final_v33;
    const modelos = mc.modelos;
    const mercados = mc.benchmark_externo_mercado || {};
    const adv = mc.escenarios_adversariales || {};
    const cruzada = mc.validacion_cruzada || {};
    const lims = mc.limitaciones_residuales || [];

    // KPI headline
    text('#val-prob-ajustada', pct(pred.p_fujimori_revierte_ajustada_final, 1));
    text('#val-formula', '60 % ensemble (' + pct(pred.p_fujimori_revierte_ensemble_modelos, 1) + ') + 40 % mercados (' + pct(pred.p_fujimori_revierte_mercado_promedio, 0) + ')');
    text('#val-margen-mediano', sgn(pred.margen_final_mediano) + ' votos');
    const ic = pred.margen_ic90 || [0, 0];
    text('#val-margen-ic', '[' + sgn(ic[0]) + ' · ' + sgn(ic[1]) + ']');

    // Tabla de modelos
    const modelosInfo = [
      { key: 'M1_independencia', nombre: 'M1 · Independencia', supuesto: 'Países no correlacionados (línea base v3.2)' },
      { key: 'M2_correlacion', nombre: 'M2 · Correlación diaspórica', supuesto: 'Shock común ε ∼ N(0, 0,04) a toda la diáspora' },
      { key: 'M3_bayesiano', nombre: 'M3 · Posterior bayesiano', supuesto: 'Actualizado con 64 % exterior observado al 26 %' },
      { key: 'M4_bootstrap_2021', nombre: 'M4 · Bootstrap 2021', supuesto: 'Calibrado al desempeño real Castillo–Fujimori 2021' },
      { key: 'ensemble_ponderado', nombre: 'Ensemble ponderado', supuesto: 'Inversa de varianza sobre M1–M4', highlight: true },
    ];
    const tbody = root.querySelector('#val-modelos tbody');
    tbody.innerHTML = '';
    modelosInfo.forEach(info => {
      const m = modelos[info.key];
      if (!m) return;
      const tr = el('tr', info.highlight ? { class: 'val-modelo-highlight' } : null);
      tr.appendChild(el('td', { class: 'val-modelo-nombre' }, info.nombre));
      tr.appendChild(el('td', { class: 'val-modelo-supuesto' }, info.supuesto));
      tr.appendChild(el('td', { class: 'num' }, pct(m.p_fuj_gana, 2)));
      tr.appendChild(el('td', { class: 'num' }, sgn(m.margen_p50)));
      tr.appendChild(el('td', { class: 'num' }, '[' + sgn(m.margen_p5) + ' ; ' + sgn(m.margen_p95) + ']'));
      tbody.appendChild(tr);
    });

    // Bayesiano: dibujar prior + posterior
    renderBayesianUpdate(modelos.M3_bayesiano);

    // Adversarial bars
    renderAdversarial(adv);

    // Mercados
    renderMercados(mercados, pred.p_fujimori_revierte_ajustada_final);

    // Convergencias y limitaciones
    const conv = $('#val-convergencias');
    if (conv) {
      conv.innerHTML = '';
      const ordered = [
        ['Entre modelos', cruzada.consistencia_entre_modelos],
        ['Con el mercado', cruzada.convergencia_con_mercado],
        ['Con el experto Henry Rafael (Infobae)', cruzada.convergencia_con_experto_henry_rafael],
        ['Con el voto exterior observado', cruzada.convergencia_con_observado_exterior_26pct],
      ];
      ordered.forEach(([lbl, txt]) => {
        if (!txt) return;
        const li = el('li');
        li.appendChild(el('strong', null, lbl + ': '));
        li.appendChild(document.createTextNode(txt));
        conv.appendChild(li);
      });
    }
    const limUl = $('#val-limitaciones');
    if (limUl) {
      limUl.innerHTML = '';
      lims.forEach(l => limUl.appendChild(el('li', null, l)));
    }
  }

  function renderBayesianUpdate(m3) {
    const root = $('#val-bayes-canvas');
    if (!root || !m3) return;
    root.innerHTML = '';

    const W = 760, H = 300;
    const padL = 56, padR = 24, padT = 28, padB = 64;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    // Beta PDFs evaluados numéricamente sobre [0.50, 0.80]
    function beta_pdf(x, a, b) {
      // log B(a,b) por Stirling para no necesitar libreria
      const lgamma = (z) => {
        // Lanczos approximation
        const g = 7;
        const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
                   771.32342877765313, -176.61502916214059, 12.507343278686905,
                   -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
        if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI*z)) - lgamma(1-z);
        z -= 1;
        let x = p[0];
        for (let i = 1; i < g+2; i++) x += p[i]/(z+i);
        const t = z + g + 0.5;
        return 0.5*Math.log(2*Math.PI) + (z+0.5)*Math.log(t) - t + Math.log(x);
      };
      if (x <= 0 || x >= 1) return 0;
      const lnB = lgamma(a) + lgamma(b) - lgamma(a+b);
      const lnPdf = (a-1)*Math.log(x) + (b-1)*Math.log(1-x) - lnB;
      return Math.exp(lnPdf);
    }

    const xMin = 0.50, xMax = 0.80;
    const N = 100;
    const xs = [];
    for (let i = 0; i <= N; i++) xs.push(xMin + (xMax-xMin)*i/N);

    // Prior: Beta calibrado a 2021 (μ=0.662, σ=0.05) → a0≈59.5, b0≈30.4
    const muPrior = 0.662, sigmaPrior = 0.05;
    const kPr = muPrior*(1-muPrior)/(sigmaPrior*sigmaPrior) - 1;
    const a0 = muPrior*kPr, b0 = (1-muPrior)*kPr;

    // Posterior
    const aPost = m3.posterior_beta_alpha || a0 + 49266;
    const bPost = m3.posterior_beta_beta || b0 + 27713;
    // Para visualizar, escalamos posterior a la misma altura visual (su pdf real es enorme).
    // En su lugar, dibujamos la posterior como una Normal aproximada centrada en su media y σ.
    const muPost = aPost / (aPost + bPost);
    const varPost = (aPost*bPost) / ((aPost+bPost)*(aPost+bPost)*(aPost+bPost+1));
    // σ real es ≈0.0017 (posterior altamente informativo). Para visualizar la posición
    // y forma del posterior sin generar una delta, ampliamos visualmente a σ=0.012.
    const sigmaPost = Math.max(Math.sqrt(varPost), 0.012);

    function normal_pdf(x, mu, s) {
      return Math.exp(-0.5*((x-mu)/s)*((x-mu)/s)) / (s*Math.sqrt(2*Math.PI));
    }

    const priorVals = xs.map(x => beta_pdf(x, a0, b0));
    const postVals = xs.map(x => normal_pdf(x, muPost, sigmaPost));

    const yMax = Math.max(
      Math.max.apply(null, priorVals),
      Math.max.apply(null, postVals) * 0.85, // escalamos la posterior para que entre visualmente
      0.1
    );

    const xScale = (v) => padL + ((v - xMin) / (xMax - xMin)) * innerW;
    const yScale = (v) => padT + innerH - (v / yMax) * innerH;

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('class', 'val-bayes-svg');
    svg.setAttribute('role', 'img');

    // Eje X
    const axis = document.createElementNS(NS, 'line');
    axis.setAttribute('x1', padL); axis.setAttribute('x2', padL + innerW);
    axis.setAttribute('y1', padT + innerH); axis.setAttribute('y2', padT + innerH);
    axis.setAttribute('class', 'val-bayes-axis');
    svg.appendChild(axis);

    // Ticks X cada 5 pp
    for (let v = 0.50; v <= 0.80 + 1e-9; v += 0.05) {
      const x = xScale(v);
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', x); ln.setAttribute('x2', x);
      ln.setAttribute('y1', padT + innerH); ln.setAttribute('y2', padT + innerH + 5);
      ln.setAttribute('class', 'val-bayes-tick');
      svg.appendChild(ln);
      const lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('x', x); lbl.setAttribute('y', padT + innerH + 20);
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('class', 'val-bayes-axis-lbl');
      lbl.textContent = (v * 100).toFixed(0) + '%';
      svg.appendChild(lbl);
    }
    const xTitle = document.createElementNS(NS, 'text');
    xTitle.setAttribute('x', padL + innerW/2);
    xTitle.setAttribute('y', padT + innerH + 50);
    xTitle.setAttribute('text-anchor', 'middle');
    xTitle.setAttribute('class', 'val-bayes-axis-title');
    xTitle.textContent = '% del voto exterior para Fujimori';
    svg.appendChild(xTitle);

    // Marca μ prior debajo del eje (alineada con ticks)
    const xPriorMu0 = padL + ((muPrior - xMin) / (xMax - xMin)) * innerW;
    const muLineSmall = document.createElementNS(NS, 'line');
    muLineSmall.setAttribute('x1', xPriorMu0); muLineSmall.setAttribute('x2', xPriorMu0);
    muLineSmall.setAttribute('y1', padT); muLineSmall.setAttribute('y2', padT + innerH);
    muLineSmall.setAttribute('class', 'val-bayes-line-prior-mu');
    svg.appendChild(muLineSmall);
    const muLbl = document.createElementNS(NS, 'text');
    muLbl.setAttribute('x', xPriorMu0); muLbl.setAttribute('y', padT - 12);
    muLbl.setAttribute('text-anchor', 'middle');
    muLbl.setAttribute('class', 'val-bayes-likeli-lbl');
    muLbl.setAttribute('style', 'fill:#1f6f6b');
    muLbl.textContent = 'Prior μ 66,2%';
    svg.appendChild(muLbl);

    function curve(values, klass) {
      let d = '';
      values.forEach((v, i) => {
        const x = xScale(xs[i]);
        const y = yScale(v);
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
      });
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', klass);
      p.setAttribute('fill', 'none');
      svg.appendChild(p);
    }

    // Area prior
    let priorD = 'M' + xScale(xs[0]) + ',' + (padT + innerH);
    priorVals.forEach((v, i) => { priorD += 'L' + xScale(xs[i]) + ',' + yScale(v); });
    priorD += 'L' + xScale(xs[xs.length-1]) + ',' + (padT + innerH) + 'Z';
    const priorPath = document.createElementNS(NS, 'path');
    priorPath.setAttribute('d', priorD);
    priorPath.setAttribute('class', 'val-bayes-area-prior');
    svg.appendChild(priorPath);

    // Area posterior
    let postD = 'M' + xScale(xs[0]) + ',' + (padT + innerH);
    postVals.forEach((v, i) => { postD += 'L' + xScale(xs[i]) + ',' + yScale(v); });
    postD += 'L' + xScale(xs[xs.length-1]) + ',' + (padT + innerH) + 'Z';
    const postPath = document.createElementNS(NS, 'path');
    postPath.setAttribute('d', postD);
    postPath.setAttribute('class', 'val-bayes-area-post');
    svg.appendChild(postPath);

    curve(priorVals, 'val-bayes-line-prior');
    curve(postVals, 'val-bayes-line-post');

    // Línea vertical observado (likelihood)
    const xObs = xScale(0.64);
    const obsLine = document.createElementNS(NS, 'line');
    obsLine.setAttribute('x1', xObs); obsLine.setAttribute('x2', xObs);
    obsLine.setAttribute('y1', padT); obsLine.setAttribute('y2', padT + innerH);
    obsLine.setAttribute('class', 'val-bayes-line-likeli');
    svg.appendChild(obsLine);
    const obsLbl = document.createElementNS(NS, 'text');
    obsLbl.setAttribute('x', xObs); obsLbl.setAttribute('y', padT - 6);
    obsLbl.setAttribute('text-anchor', 'middle');
    obsLbl.setAttribute('class', 'val-bayes-likeli-lbl');
    obsLbl.textContent = 'Observado 64,0%';
    svg.appendChild(obsLbl);

    root.appendChild(svg);
  }

  function renderAdversarial(adv) {
    const root = $('#val-adversarial');
    if (!root) return;
    root.innerHTML = '';
    const order = [
      'Base (replica M3)',
      'JNE anula 50% actas observadas',
      'Participación exterior baja a 30%',
      'Cola izquierda: Fuj ext baja a 58%',
      'Doble shock adverso (Fuj 58% + JNE 50%)',
      'Triple shock (Fuj 58% + JNE 50% + partic 30%)',
      'Cisne negro (Fuj 55% + JNE 30% + partic 25% + rural fuerte Sánchez)',
    ];
    order.forEach(nombre => {
      const e = adv[nombre];
      if (!e) return;
      const p = e.p_fujimori_gana;
      const med = e.margen_mediano;
      const row = el('div', { class: 'val-adv-row' });
      row.appendChild(el('span', { class: 'val-adv-name' }, escapeHtml(nombre)));
      const barWrap = el('div', { class: 'val-adv-bar-wrap' });
      const w = Math.max(2, p * 100);
      const cls = p >= 0.85 ? 'val-adv-bar-hi' : p >= 0.55 ? 'val-adv-bar-mid' : 'val-adv-bar-lo';
      const bar = el('div', { class: 'val-adv-bar ' + cls, style: 'width:' + w + '%' });
      barWrap.appendChild(bar);
      // marca 50%
      const tick50 = el('div', { class: 'val-adv-tick50' });
      barWrap.appendChild(tick50);
      row.appendChild(barWrap);
      row.appendChild(el('span', { class: 'val-adv-val' }, (p * 100).toFixed(1).replace('.', ',') + ' %'));
      const medSgn = med >= 0 ? '+' : '−';
      row.appendChild(el('span', { class: 'val-adv-med' }, 'med ' + medSgn + Math.abs(Math.round(med)).toLocaleString('es-PE')));
      root.appendChild(row);
    });
  }

  function renderMercados(mercados, pAjustada) {
    const root = $('#val-mercados');
    if (!root) return;
    root.innerHTML = '';
    const entries = Object.keys(mercados).map(k => [k, mercados[k]]);
    entries.sort((a, b) => b[1] - a[1]);
    const maxV = 1.0;
    entries.forEach(([nombre, v]) => {
      const row = el('div', { class: 'val-merc-row' });
      row.appendChild(el('span', { class: 'val-merc-name' }, escapeHtml(nombre)));
      const barWrap = el('div', { class: 'val-merc-bar-wrap' });
      const w = Math.max(2, (v / maxV) * 100);
      const bar = el('div', { class: 'val-merc-bar', style: 'width:' + w + '%' });
      barWrap.appendChild(bar);
      row.appendChild(barWrap);
      row.appendChild(el('span', { class: 'val-merc-val' }, (v * 100).toFixed(0) + ' %'));
      root.appendChild(row);
    });
    if (pAjustada != null) {
      const note = el('p', { class: 'val-merc-note' });
      note.innerHTML = 'Nuestra predicción ajustada: <strong>' + (pAjustada*100).toFixed(1).replace('.', ',') + ' %</strong> — ubicada entre los modelos paramétricos y el promedio de mercados.';
      root.appendChild(note);
    }
  }

})();
