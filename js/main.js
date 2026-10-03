/* ============================================================
   BROS IT SOLUTIONS — static site behaviour
   Converted 1:1 from the Angular components (same logic,
   same timings, same DOM classes) — page-appropriate parts
   run automatically based on document.body[data-page].
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const page = document.body.dataset.page;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     FOOTER — current year
     ========================================================== */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ==========================================================
     AOS (data-aos="...") — same library the Angular app used
     ========================================================== */
  if (window.AOS) {
    AOS.init({ once: true, duration: 600, easing: 'ease-out-cubic' });
  }

  /* ==========================================================
     NAVBAR — scroll shadow, mobile menu, downloads dropdown
     ========================================================== */
  (function navbar() {
    const header = document.querySelector('.navbar-wrap');
    if (!header) return;

    const menuToggle = header.querySelector('.menu-toggle');
    const navLinks = header.querySelector('.nav-links');
    const backdrop = header.querySelector('.nav-backdrop');
    const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;
    const downloadDropdown = header.querySelector('.download-dropdown');
    const downloadBtn = header.querySelector('.download-btn');
    const downloadMenu = header.querySelector('.download-menu');
    const downloadCaret = downloadBtn ? downloadBtn.querySelector('.caret') : null;

    let isMenuOpen = false;
    let isDownloadOpen = false;

    function setScrolled() {
      header.classList.toggle('scrolled', window.scrollY > 12);
    }
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });

    function setMenu(open) {
      isMenuOpen = open;
      header.classList.toggle('menu-active', isMenuOpen);
      navLinks && navLinks.classList.toggle('open', isMenuOpen);
      backdrop && backdrop.classList.toggle('show', isMenuOpen);
      menuToggle && menuToggle.setAttribute('aria-expanded', String(isMenuOpen));
      if (menuIcon) menuIcon.className = 'bi ' + (isMenuOpen ? 'bi-x-lg' : 'bi-list');
    }

    menuToggle && menuToggle.addEventListener('click', () => setMenu(!isMenuOpen));
    backdrop && backdrop.addEventListener('click', () => setMenu(false));
    header.querySelectorAll('.nav-list a, .brand').forEach(a =>
      a.addEventListener('click', () => setMenu(false))
    );

    function setDownload(open) {
      isDownloadOpen = open;
      downloadBtn && downloadBtn.setAttribute('aria-expanded', String(isDownloadOpen));
      downloadMenu && downloadMenu.classList.toggle('show', isDownloadOpen);
      downloadCaret && downloadCaret.classList.toggle('rotated', isDownloadOpen);
    }

    downloadDropdown && downloadDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      setDownload(!isDownloadOpen);
    });
    document.addEventListener('click', () => { if (isDownloadOpen) setDownload(false); });

    /* mark current-page nav link active (routerLinkActive replacement) */
    const current = location.pathname.split('/').pop() || 'index.html';
    header.querySelectorAll('.nav-list a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === current) a.classList.add('active');
    });


    /* download items: PDFs -> real file download, external -> open in new tab */
const DOWNLOADS = [

  {
    label: 'Software Brochure (PDF)',
    file: 'assets/downloads/BROSITSOLUTIONSNEW.pdf',
    external: false
  },

  {
    label: 'Hardware Brochure (PDF)',
    file: 'assets/downloads/BROSITSOLUTIONSPRINTERHARDWARE.pdf',
    external: false
  },

  {
    label: 'UltraViewer (Remote Support)',
    url: 'https://www.ultraviewer.net/en/UltraViewer_setup_6.6_en.exe',
    external: true
  },

  {
    label: 'AnyDesk (Remote Support)',
    url: 'https://anydesk.com/en/downloads/thank-you?dv=win_exe',
    external: true
  }

];


header.querySelectorAll('.download-item').forEach((btn, i) => {

  btn.addEventListener('click', function (e) {

    e.preventDefault();
    e.stopPropagation();

    const item = DOWNLOADS[i];

    if (!item) {
      return;
    }


    // =====================================================
    // EXTERNAL FILE
    // UltraViewer / AnyDesk
    // =====================================================

    if (item.external) {

      const link = document.createElement('a');

      link.href = item.url;

      link.target = '_blank';

      link.rel = 'noopener noreferrer';

      document.body.appendChild(link);

      link.click();

      link.remove();

    }


    // =====================================================
    // LOCAL PDF
    // =====================================================

    else {

      const link = document.createElement('a');

      link.href = item.file;

      link.download = item.file.split('/').pop();

      link.setAttribute('download', '');

      link.style.display = 'none';

      document.body.appendChild(link);

      link.click();

      link.remove();

    }


    // Close dropdown

    setDownload(false);

  });

});


  })();

  /* ==========================================================
     SCROLL-TOP FAB
     ========================================================== */
  (function scrollTop() {
    const btn = document.querySelector('.scroll-top-fab');
    if (!btn) return;
    const update = () => btn.classList.toggle('visible', window.scrollY > 400);
    update();
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  })();

  /* ==========================================================
     GENERIC .reveal SCROLL-REVEAL
     (about / services / product / industries / customers-band)
     ========================================================== */
  function setupReveal(root = document, selector = '.reveal', removeDelay = false) {
    const targets = Array.from(root.querySelectorAll(selector + ':not(.in)'));
    if (!targets.length) return null;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('in'));
      return null;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
        if (removeDelay) {
          setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1100);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => io.observe(el));
    return io;
  }

  /* generic count-up used by home / services / customers */
  function countUp(el, target, duration, suffix, onTick) {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(target * eased);
      onTick ? onTick(val) : (el.textContent = val + (suffix || ''));
      if (progress < 1) requestAnimationFrame(step);
      else { onTick ? onTick(target) : (el.textContent = target + (suffix || '')); }
    }
    requestAnimationFrame(step);
  }

  /* ==========================================================
     HOME — hero slider + stats counters
     ========================================================== */
  if (page === 'index') {
    (function home() {
      const hero = document.querySelector('.hero-banner');
      if (!hero) return;

      const slides = Array.from(hero.querySelectorAll('.slide'));
      const dots = Array.from(hero.querySelectorAll('.banner-dots .dot'));
      const counterCurrent = hero.querySelector('.slide-counter .current');
      let current = slides.findIndex(s => s.classList.contains('active'));
      if (current < 0) current = 0;
      let timer;

      function render() {
        slides.forEach((s, i) => s.classList.toggle('active', i === current));
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        if (counterCurrent) counterCurrent.textContent = current + 1;
      }
      function startAuto() {
        stopAuto();
        if (slides.length > 1) timer = setInterval(() => next(), 5000);
      }
      function stopAuto() { if (timer) clearInterval(timer); }
      function next() { current = (current + 1) % slides.length; render(); }
      function prev() { current = (current - 1 + slides.length) % slides.length; render(); }
      function goTo(i) { current = i; render(); startAuto(); }

      hero.querySelector('.banner-arrow.left').addEventListener('click', () => { prev(); startAuto(); });
      hero.querySelector('.banner-arrow.right').addEventListener('click', () => { next(); startAuto(); });
      dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

      startAuto();

      /* stats counters */
      const statsSection = document.querySelector('.stats-strip');
      if (statsSection && ('IntersectionObserver' in window) && !prefersReduced) {
        const values = Array.from(statsSection.querySelectorAll('.stat-value'));
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            values.forEach(v => {
              const target = parseInt(v.dataset.target, 10);
              const rawSuffix = v.textContent.replace(/[\d\s]/g, '');
              countUp(v, target, 1700, rawSuffix);
            });
            io.disconnect();
          });
        }, { threshold: 0.35 });
        io.observe(statsSection);
      } else if (statsSection) {
        statsSection.querySelectorAll('.stat-value').forEach(v => {
          const target = v.dataset.target;
          const rawSuffix = v.textContent.replace(/[\d\s]/g, '');
          v.textContent = target + rawSuffix;
        });
      }
    })();
  }

  /* ==========================================================
     ABOUT / TECH — plain scroll reveal
     ========================================================== */
  if (page === 'about' || page === 'tech') {
    setupReveal(document, '.reveal');
  }

  /* ==========================================================
     SERVICES — reveal + stat counters + detail modal (Esc closes)
     ========================================================== */
  if (page === 'services' && window.SERVICES) {
    (function services() {
      const services = window.SERVICES;
      const modal = document.querySelector('.mod-modal');
      const panel = modal ? modal.querySelector('.mod-modal-panel') : null;
      let activeIndex = null;

      function openService(i) {
        if (!modal) return;
        activeIndex = i;
        const svc = services[i];
        panel.className = 'mod-modal-panel tone-' + (i % 6);
        panel.querySelector('.mod-modal-icon i').className = 'bi ' + svc.icon;
        panel.querySelector('.mod-modal-headtext h3').textContent = svc.title;
        panel.querySelector('.mod-modal-long').textContent = svc.long;
        const list = panel.querySelector('.mod-modal-list');
        list.innerHTML = '';
        svc.features.forEach((f, fi) => {
          const li = document.createElement('li');
          li.style.animationDelay = (0.12 + fi * 0.06) + 's';
          li.innerHTML = '<i class="bi bi-check-circle-fill"></i><span></span>';
          li.querySelector('span').textContent = f;
          list.appendChild(li);
        });
        modal.classList.remove('closing');
        modal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';
      }
      function closeService() {
        if (activeIndex === null || !modal) return;
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.setProperty('display', 'none', 'important');
          modal.classList.remove('closing');
          document.body.style.overflow = '';
          activeIndex = null;
        }, 280);
      }

      document.querySelectorAll('.service-card').forEach((card, i) => {
        card.addEventListener('click', () => openService(i));
        const learnMore = card.querySelector('.learn-more');
        learnMore && learnMore.addEventListener('click', (e) => { e.stopPropagation(); openService(i); });
      });
      if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        modal.addEventListener('click', closeService);
        panel.addEventListener('click', (e) => e.stopPropagation());
        modal.querySelector('.mod-modal-close').addEventListener('click', closeService);
        modal.querySelectorAll('.mod-modal-btn.primary').forEach(b => b.addEventListener('click', closeService));
      }
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeService(); });

      /* reveal + counters */
      const targets = Array.from(document.querySelectorAll('.reveal:not(.in)'));
      let countersStarted = false;
      function runCounters() {
        document.querySelectorAll('.stats-bar .stat-item h3[data-count]').forEach(h3 => {
          const target = parseInt(h3.dataset.count, 10);
          const suffix = h3.textContent.replace(/[\d\s]/g, '');
          countUp(h3, target, 1600, suffix);
        });
      }
      if (prefersReduced || !('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('in'));
        runCounters();
      } else {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('in');
            if (el.classList.contains('stats-bar') && !countersStarted) {
              countersStarted = true;
              runCounters();
            }
            io.unobserve(el);
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
        targets.forEach(el => io.observe(el));
      }
    })();
  }

  /* ==========================================================
     PRODUCT — category tabs, module modal, reveal
     ========================================================== */
  if (page === 'product' && window.PRODUCT_CATEGORIES) {
    (function product() {
      const categories = window.PRODUCT_CATEGORIES;
      const tabs = Array.from(document.querySelectorAll('.category-tab'));
      const rows = Array.from(document.querySelectorAll('.row[data-cat]'));
      const modal = document.querySelector('.mod-modal');
      const panel = modal ? modal.querySelector('.mod-modal-panel') : null;
      let selectedCategory = 0;
      let activeIndex = null;

      /* deep-link ?tab=N */
      const params = new URLSearchParams(location.search);
      const tabParam = parseInt(params.get('tab'), 10);
      if (!isNaN(tabParam) && tabParam >= 0 && tabParam < categories.length) {
        selectedCategory = tabParam;
      }

      function renderTabs() {
        tabs.forEach((t, i) => t.classList.toggle('active', i === selectedCategory));
        rows.forEach((r, i) => { r.style.display = i === selectedCategory ? '' : 'none'; });
      }
      renderTabs();

      tabs.forEach((tab, i) => tab.addEventListener('click', () => {
        if (selectedCategory === i) return;
        selectedCategory = i;
        renderTabs();
        setupReveal(rows[selectedCategory], '.reveal');
      }));

      function openModule(catIndex, modIndex) {
        if (!modal) return;
        const mod = categories[catIndex].modules[modIndex];
        activeIndex = modIndex;
        panel.className = 'mod-modal-panel tone-' + (modIndex % 6);
        panel.querySelector('.mod-modal-icon i').className = 'bi ' + mod.icon;
        panel.querySelector('.mod-modal-eyebrow').textContent = categories[catIndex].title;
        panel.querySelector('.mod-modal-headtext h3').textContent = mod.title;
        panel.querySelector('.mod-modal-long').textContent = mod.long;
        const list = panel.querySelector('.mod-modal-list');
        list.innerHTML = '';
        mod.features.forEach((f, fi) => {
          const li = document.createElement('li');
          li.style.animationDelay = (0.12 + fi * 0.06) + 's';
          li.innerHTML = '<i class="bi bi-check-circle-fill"></i><span></span>';
          li.querySelector('span').textContent = f;
          list.appendChild(li);
        });
        modal.classList.remove('closing');
        modal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';
      }
      function closeModule() {
        if (activeIndex === null || !modal) return;
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.setProperty('display', 'none', 'important');
          modal.classList.remove('closing');
          document.body.style.overflow = '';
          activeIndex = null;
        }, 280);
      }

      rows.forEach((row, catIndex) => {
        Array.from(row.querySelectorAll('.module-card')).forEach((card, modIndex) => {
          card.addEventListener('click', () => openModule(catIndex, modIndex));
        });
      });
      if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        modal.addEventListener('click', closeModule);
        panel.addEventListener('click', (e) => e.stopPropagation());
        modal.querySelector('.mod-modal-close').addEventListener('click', closeModule);
        modal.querySelectorAll('.mod-modal-btn.primary').forEach(b => b.addEventListener('click', closeModule));
      }
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModule(); });

      setupReveal(document, '.reveal');
    })();
  }

  /* ==========================================================
     INDUSTRIES — cards -> modal, reveal (delay reset after reveal)
     ========================================================== */
  if (page === 'industries' && window.INDUSTRIES) {
    (function industries() {
      const solutions = window.INDUSTRIES;
      const modal = document.querySelector('.mod-modal');
      const panel = modal ? modal.querySelector('.mod-modal-panel') : null;
      let activeItem = null;

      const DEFAULT_FEATURES = [
        'Smart business workflow management',
        'Fast and easy billing',
        'Inventory and stock management',
        'Reports and business insights',
      ];

      function openIndustry(i) {
        if (!modal) return;
        const item = solutions[i];
        activeItem = item;
        panel.className = 'mod-modal-panel tone-' + (i % 6);
        panel.querySelector('.mod-modal-icon i').className = item.icon;
        panel.querySelector('.mod-modal-headtext h3').textContent = item.title;
        panel.querySelector('.mod-modal-long').textContent = item.long || item.description;
        const list = panel.querySelector('.mod-modal-list');
        list.innerHTML = '';
        (item.features || DEFAULT_FEATURES).forEach((f, fi) => {
          const li = document.createElement('li');
          li.style.animationDelay = (0.12 + fi * 0.06) + 's';
          li.innerHTML = '<i class="bi bi-check-circle-fill"></i><span></span>';
          li.querySelector('span').textContent = f;
          list.appendChild(li);
        });
        modal.classList.remove('closing');
        modal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';
      }
      function closeIndustry() {
        if (!activeItem || !modal) return;
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.setProperty('display', 'none', 'important');
          modal.classList.remove('closing');
          document.body.style.overflow = '';
          activeItem = null;
        }, 300);
      }

      document.querySelectorAll('.industry-card').forEach((card, i) => {
        card.addEventListener('click', () => openIndustry(i));
        const link = card.querySelector('.card-link');
        link && link.addEventListener('click', (e) => { e.stopPropagation(); openIndustry(i); });
      });
      if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        modal.addEventListener('click', closeIndustry);
        panel.addEventListener('click', (e) => e.stopPropagation());
        modal.querySelector('.mod-modal-close').addEventListener('click', closeIndustry);
        modal.querySelectorAll('.mod-modal-btn.primary').forEach(b => b.addEventListener('click', closeIndustry));
      }
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeIndustry(); });

      setupReveal(document, '.reveal', true);
    })();
  }

  /* ==========================================================
     CUSTOMERS — industry filter, animated counters, 3D tilt
     ========================================================== */
  if (page === 'customers') {
    (function customers() {
      const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
      const grid = document.querySelector('.dir-grid');
      const cards = grid ? Array.from(grid.querySelectorAll('.dir-card')) : [];

      let selected = 'All';
      function applyFilter() {
        cards.forEach((card) => {
          const match = selected === 'All' || card.dataset.industry === selected;
          card.style.display = match ? '' : 'none';
        });
      }
      filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const name = chip.dataset.industry;
          if (name === selected) return;
          selected = name;
          filterChips.forEach(c => c.classList.toggle('active', c === chip));
          if (grid) grid.style.display = 'none';
          setTimeout(() => {
            applyFilter();
            if (grid) grid.style.display = '';
          }, 30);
        });
      });

      /* animated counters */
      const counters = document.querySelectorAll('.hero-counters .counter h3[data-target]');
      if (counters.length) {
        const steps = 40;
        let n = 0;
        const targets = Array.from(counters).map(h3 => parseInt(h3.dataset.target, 10));
        const suffixes = Array.from(counters).map(h3 => h3.querySelector('em') ? h3.querySelector('em').textContent : '');
        const timer = setInterval(() => {
          n++;
          const p = 1 - Math.pow(1 - n / steps, 3);
          counters.forEach((h3, i) => {
            h3.innerHTML = Math.round(targets[i] * p) + (suffixes[i] ? '<em>' + suffixes[i] + '</em>' : '');
          });
          if (n >= steps) clearInterval(timer);
        }, 35);
      }

      /* 3D tilt on directory cards */
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty('--ry', (x * 12).toFixed(2) + 'deg');
          card.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
          card.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%');
          card.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
        });
        card.addEventListener('mouseleave', () => {
          card.style.setProperty('--ry', '0deg');
          card.style.setProperty('--rx', '0deg');
        });
      });
    })();
  }

  /* ==========================================================
     CONTACT — client-side validation + fake async submit
     ========================================================== */
  if (page === 'contact') {
    (function contact() {
      const form = document.querySelector('.contact-form');
      if (!form) return;

      const fields = {
        name: form.querySelector('#c-name'),
        email: form.querySelector('#c-email'),
        phone: form.querySelector('#c-phone'),
        message: form.querySelector('#c-message'),
      };
      const errors = {
        name: form.querySelector('#c-name').closest('.col-md-6').querySelector('.invalid-feedback'),
        email: form.querySelector('#c-email').closest('.col-md-6').querySelector('.invalid-feedback'),
        phone: form.querySelector('#c-phone').closest('.col-md-6').querySelector('.invalid-feedback'),
        message: form.querySelector('#c-message').closest('.col-12').querySelector('.invalid-feedback'),
      };
      const submitBtn = form.querySelector('.submit-btn');
      const successBanner = document.querySelector('.success-banner');
      const touched = {};

      function isValid(key) {
        const v = fields[key].value.trim();
        if (key === 'name') return v.length >= 2;
        if (key === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (key === 'phone') return /^[0-9]{10}$/.test(v);
        if (key === 'message') return v.length >= 10;
        return true;
      }

      function updateField(key) {
        const invalid = touched[key] && !isValid(key);
        fields[key].classList.toggle('is-invalid', invalid);
        if (errors[key]) errors[key].style.display = invalid ? 'block' : 'none';
      }

      Object.keys(fields).forEach(key => {
        fields[key].addEventListener('blur', () => { touched[key] = true; updateField(key); });
        fields[key].addEventListener('input', () => { if (touched[key]) updateField(key); });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        Object.keys(fields).forEach(key => { touched[key] = true; updateField(key); });
        const allValid = Object.keys(fields).every(isValid);
        if (!allValid) return;

        submitBtn.disabled = true;
        submitBtn.querySelectorAll('span').forEach(s => s.style.display = 'none');
        const sendingSpan = submitBtn.querySelector('span:last-child');
        if (sendingSpan) sendingSpan.style.display = '';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.querySelectorAll('span').forEach(s => s.style.display = '');
          if (sendingSpan) sendingSpan.style.display = 'none';
          if (successBanner) successBanner.style.display = 'flex';
          form.reset();
          Object.keys(fields).forEach(key => { touched[key] = false; updateField(key); });
        }, 1200);
      });
    })();
  }


/* ================= HEADER HEIGHT FIX (hero banner maraiyaama) ================= */
(function () {
  var header = document.querySelector('.navbar-wrap');
  var main = document.querySelector('main');
  if (!header || !main) return;

  function applyHeaderSpace() {
    var h = header.offsetHeight;
    var pos = window.getComputedStyle(header).position;

    document.documentElement.style.setProperty('--header-h', h + 'px');

    // header fixed / absolute na mattum main-ku space; sticky / static na venam
    main.style.paddingTop = (pos === 'fixed' || pos === 'absolute') ? h + 'px' : '0px';
  }

  applyHeaderSpace();
  window.addEventListener('load', applyHeaderSpace);
  window.addEventListener('resize', applyHeaderSpace);

  // topbar / menu / fonts load aagi height maarina kooda auto update
  if ('ResizeObserver' in window) {
    new ResizeObserver(applyHeaderSpace).observe(header);
  }
})();







});
