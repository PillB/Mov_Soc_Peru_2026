/* UI enhancements — scroll-spy, back-to-top, foldable defaults, sources pagination,
   smooth anchor scroll with sticky-header offset. Pure vanilla JS, no deps. */
(function () {
  'use strict';

  // ---------- Smooth scroll with sticky header offset ----------
  function headerHeight() {
    const h = document.querySelector('.site-header');
    return h ? h.offsetHeight : 0;
  }
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const offset = headerHeight() + 12;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
    history.replaceState(null, '', href);
    // close mobile menu if open
    const nav = document.getElementById('primaryNav');
    const btn = document.getElementById('menuBtn');
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  // ---------- Scroll-spy: highlight active nav link ----------
  const navLinks = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
  const targets = navLinks
    .map(l => ({ link: l, el: document.getElementById(l.getAttribute('href').slice(1)) }))
    .filter(x => x.el);

  function updateActive() {
    const y = window.scrollY + headerHeight() + 80;
    let current = null;
    for (const t of targets) {
      const top = t.el.getBoundingClientRect().top + window.pageYOffset;
      if (top <= y) current = t;
      else break;
    }
    navLinks.forEach(l => l.classList.remove('is-active'));
    if (current) current.link.classList.add('is-active');
  }
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { updateActive(); rafPending = false; });
  }, { passive: true });
  updateActive();

  // ---------- Back-to-top ----------
  const btt = document.getElementById('back-to-top');
  if (btt) {
    function toggleBtt() {
      if (window.scrollY > 600) btt.hidden = false;
      else btt.hidden = true;
    }
    window.addEventListener('scroll', toggleBtt, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    toggleBtt();
  }

  // ---------- Foldable defaults: collapse heavy sections on mobile ----------
  const HEAVY = ['risk-matrix', 'methodology', 'sources', 'alt-media', 'disinfo', 'early-warning'];
  function applyMobileDefaults() {
    const isMobile = window.innerWidth < 768;
    document.querySelectorAll('details.foldable[data-fold]').forEach(d => {
      const id = d.getAttribute('data-fold');
      if (isMobile && HEAVY.includes(id) && !d.hasAttribute('data-user-toggled')) {
        d.open = false;
      }
    });
  }
  // Mark as user-toggled so we don't auto-close after they open
  document.querySelectorAll('details.foldable').forEach(d => {
    d.addEventListener('toggle', () => d.setAttribute('data-user-toggled', '1'));
  });
  applyMobileDefaults();
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(applyMobileDefaults, 200);
  });

  // ---------- Foldable counters: derive counts after main.js renders ----------
  function setCount(elId, n) {
    const el = document.getElementById(elId);
    if (el && typeof n === 'number') el.textContent = n + (n === 1 ? ' entrada' : ' entradas');
  }
  function pollAndPopulateCounts() {
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      const altN = document.querySelectorAll('#alt-media-grid > *').length;
      const disN = document.querySelectorAll('#disinfo-grid > *').length;
      const riskN = document.querySelectorAll('#risk-tbody > tr').length;
      const ewN = document.querySelectorAll('#ew-grid > *').length;
      const methN = document.querySelectorAll('#method-grid > *').length;
      const srcN = document.querySelectorAll('#sources-list > *').length;
      if (altN || disN || riskN || ewN || methN || srcN || tries > 30) {
        setCount('alt-media-count', altN);
        setCount('disinfo-count', disN);
        setCount('risk-matrix-count', riskN);
        setCount('ew-count', ewN);
        setCount('method-count', methN);
        const tot = document.getElementById('sources-total-count');
        if (tot) tot.textContent = srcN + ' fuentes';
        if (srcN) initSourcesPager(srcN);
        if (altN || disN || srcN || tries > 30) clearInterval(t);
      }
    }, 250);
  }
  document.addEventListener('DOMContentLoaded', pollAndPopulateCounts);
  // also fire in case DOMContentLoaded already passed
  if (document.readyState !== 'loading') pollAndPopulateCounts();

  // ---------- Sources pager: hide rows past initial limit ----------
  const SRC_INITIAL = 50;
  const SRC_STEP = 50;
  function initSourcesPager(total) {
    const list = document.getElementById('sources-list');
    const pager = document.getElementById('sources-pager');
    const btn = document.getElementById('sources-more');
    const info = document.getElementById('sources-pager-info');
    if (!list || !pager || !btn) return;
    if (list.dataset.pagerInit === '1') return;
    list.dataset.pagerInit = '1';
    const items = Array.from(list.children);
    let shown = Math.min(SRC_INITIAL, items.length);
    function apply() {
      items.forEach((el, i) => { el.style.display = i < shown ? '' : 'none'; });
      if (shown >= items.length) {
        pager.hidden = true;
      } else {
        pager.hidden = false;
        if (info) info.textContent = 'Mostrando ' + shown + ' de ' + items.length;
      }
    }
    apply();
    btn.addEventListener('click', () => { shown = Math.min(shown + SRC_STEP, items.length); apply(); });

    // Hook into sources-filter input: when user types, show all matches
    const search = document.getElementById('sources-filter');
    if (search) {
      search.addEventListener('input', () => {
        if (search.value.trim().length > 0) {
          // reveal all so existing filter logic (in main.js) can match
          items.forEach(el => { el.style.display = ''; });
          pager.hidden = true;
        } else {
          shown = Math.min(SRC_INITIAL, items.length);
          apply();
        }
      });
    }
  }

})();
