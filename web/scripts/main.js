// =====================================================================
// main.js — 진입 컨트롤러: 테마 / 네비 / 스크롤 / 데이터 로드 트리거
// =====================================================================

import { loadData } from './data-loader.js';

(() => {
  const root = document.documentElement;
  const STORAGE_KEY = 'skh-theme';

  // ---------- Theme toggle ----------
  function applyTheme(theme) {
    root.dataset.theme = theme;
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', theme === 'dark' ? '#070A14' : '#FBFCFE'
    );
  }

  function initTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'dark'); // default dark
    }

    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent('skh:theme-change', { detail: { theme: next } }));
    });
  }

  // ---------- Mobile menu toggle ----------
  function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('.site-header');
    if (!toggle || !header) return;

    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-mobile-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });

    // 네비 클릭 시 자동 닫기
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        header.classList.remove('is-mobile-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Sticky header state + scroll progress ----------
  function initScrollProgress() {
    const header = document.querySelector('.site-header');
    const bar = document.querySelector('.scroll-progress__bar');

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
      if (bar) bar.style.width = `${pct * 100}%`;
      if (header) header.classList.toggle('is-stuck', scrollTop > 24);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // ---------- Active nav link (IntersectionObserver) ----------
  function initActiveNav() {
    const sections = document.querySelectorAll('main > section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const idToLink = new Map();
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) idToLink.set(href.slice(1), a);
    });

    const setActive = (id) => {
      navLinks.forEach(a => a.classList.remove('is-active'));
      const target = idToLink.get(id);
      if (target) target.classList.add('is-active');
    };

    const observer = new IntersectionObserver((entries) => {
      // Largest intersection ratio wins
      let best = null;
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
      });
      if (best) setActive(best.target.id);
    }, {
      rootMargin: '-30% 0px -50% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    });

    sections.forEach(s => observer.observe(s));
  }

  // ---------- Enter animations (fallback if motion-designer JS not loaded) ----------
  let _enterIO = null;
  function observeEnter(el) {
    if (!_enterIO) return;
    if (el.classList.contains('is-visible')) return;
    _enterIO.observe(el);
  }
  function initEnterAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('[data-animate], [data-stagger]').forEach(el => el.classList.add('is-visible'));
      return;
    }

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-animate], [data-stagger]').forEach(el => el.classList.add('is-visible'));
      return;
    }

    _enterIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = parseInt(e.target.dataset.animateDelay || '0', 10);
          if (delay > 0) {
            setTimeout(() => e.target.classList.add('is-visible'), delay);
          } else {
            e.target.classList.add('is-visible');
          }
          _enterIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll('[data-animate], [data-stagger]').forEach(el => observeEnter(el));

    // Hero 첫 진입은 즉시 발동
    requestAnimationFrame(() => {
      document.querySelectorAll('.hero [data-animate], .hero [data-stagger]').forEach(el => {
        const delay = parseInt(el.dataset.animateDelay || el.dataset.staggerDelay || '0', 10);
        setTimeout(() => el.classList.add('is-visible'), Math.max(80, delay));
      });
    });

    // dom-injector가 데이터를 주입한 후 새 stagger/animate 요소 등록
    window.addEventListener('skh:dom-injected', () => {
      document.querySelectorAll('[data-animate]:not(.is-visible), [data-stagger]:not(.is-visible)').forEach(el => observeEnter(el));
    });
  }

  // ---------- Count-up (Hero metrics) ----------
  function initCountUp() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('[data-countup]');
    if (!els.length) return;

    const formatNumber = (n) => {
      // 정수면 천단위 콤마, 소수면 1자리
      if (Math.abs(n) >= 100) return Math.round(n).toLocaleString('en-US');
      return n.toFixed(2);
    };

    const animate = (el) => {
      const targetStr = el.dataset.countup;
      const target = parseFloat(targetStr);
      if (!isFinite(target)) return;
      const prefix = el.dataset.countupPrefix || '';
      const suffix = el.dataset.countupSuffix || '';
      const duration = parseInt(el.dataset.countupDuration || '1400', 10);

      if (prefersReduced) {
        el.textContent = `${prefix}${formatNumber(target)}${suffix}`;
        return;
      }

      const start = performance.now();
      const startVal = 0;
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        const value = startVal + (target - startVal) * eased;
        el.textContent = `${prefix}${formatNumber(value)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = `${prefix}${formatNumber(target)}${suffix}`;
      }
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      els.forEach(animate);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
  }

  // ---------- Init pipeline ----------
  function init() {
    initTheme();
    initMobileMenu();
    initScrollProgress();
    initActiveNav();
    initEnterAnimations();
    initCountUp();

    // Data load triggers downstream (dom-injector, charts)
    loadData()
      .then((data) => {
        console.log('[main] data loaded', { sources: data.sources?.length, events: data.events90d?.length });
      })
      .catch((err) => {
        console.error('[main] data load failed', err);
        document.querySelectorAll('.section .container').forEach(el => {
          if (el.querySelector('[data-data-error]')) return;
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
