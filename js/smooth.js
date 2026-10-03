/* ============================================================
   SMOOTH.JS — smooth page-to-page transition + smooth scrolling
   (new file — existing main.js / page code is NOT touched)
   Needs: js/lenis.min.js (loaded before this file)
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = null;

  /* ----------------------------------------------------------
     1) SMOOTH SCROLL (mouse-wheel / trackpad / keyboard)
     Touch devices keep their normal native momentum scrolling.
     ---------------------------------------------------------- */
  if (!reduce && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.1,                       // higher = floatier
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      allowNestedScroll: true              // inner scroll areas keep working
    });

    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());

    /* modal / mobile menu lock the page with body.style.overflow='hidden'
       (existing main.js code) -> pause Lenis while that is active */
    function syncLock() {
      var locked = document.body.style.overflow === 'hidden';
      if (locked && !lenis.isStopped) lenis.stop();
      if (!locked && lenis.isStopped) lenis.start();
    }
    new MutationObserver(syncLock).observe(document.body,
      { attributes: true, attributeFilter: ['style'] });
    syncLock();

    /* modal panels / mobile menu: let them scroll natively */
    document.querySelectorAll(
      '.mod-modal, .mod-modal-panel, .nav-links, .download-menu'
    ).forEach(function (el) { el.setAttribute('data-lenis-prevent', ''); });

    /* back-to-top button -> same smooth engine */
    var fab = document.querySelector('.scroll-top-fab');
    if (fab) {
      fab.addEventListener('click', function (e) {
        e.stopImmediatePropagation();
        lenis.scrollTo(0, { duration: 1.3 });
      }, true);
    }

    /* same-page #anchor links -> smooth, below the fixed header */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var h = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 80;
      lenis.scrollTo(target, { offset: -(h + 8), duration: 1.2 });
    });
  }

  /* ----------------------------------------------------------
     2) Click on a link to the page you are ALREADY on -> smooth to top
     (page -> page fade is pure CSS in smooth.css, no JS delay)
     ---------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin === location.origin && url.pathname === location.pathname &&
        url.search === location.search && !url.hash) {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  /* Back / forward button (bfcache) -> never stay stuck on the cover */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      if (lenis) lenis.start();
    }
  });
})();
