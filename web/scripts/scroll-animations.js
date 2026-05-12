/**
 * scroll-animations.js
 * GSAP ScrollTrigger 기반 스크롤 진입 + 텍스트 reveal + Hero 시퀀스
 *
 * 마크업 컨벤션 (frontend-engineer)
 *   data-animate="fade-up"           → opacity 0→1, y 24→0, duration 700ms
 *   data-animate="reveal"            → 글자 단위 reveal (Hero 헤드라인용)
 *   data-animate-delay="600"         → ms 단위 진입 지연
 *   data-stagger                     → 직접 자식들에 fade-up + stagger 80ms
 *   data-stagger-delay="600"         → stagger 시작 지연 ms
 *   data-text-reveal                 → 단어 단위 reveal (스크롤 진입 시)
 *
 * 차트 컨테이너(.chart-container)는 자체 800ms draw-in 과 충돌 방지를 위해 fade only.
 * prefers-reduced-motion: 즉시 최종 상태, ScrollTrigger 사용 안 함.
 */

import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm';

const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger);

// 진입 트리거 공통
const TRIGGER_START = 'top 82%';
const TOGGLE_ACTIONS = 'play none none none';

// ---------------------------------------------------------------------------
// 1) 텍스트 split util
// ---------------------------------------------------------------------------
function splitTextNode(textNode, byWord, frag) {
  const text = textNode.nodeValue;
  if (byWord) {
    text.split(/(\s+)/).forEach((token) => {
      if (token === '') return;
      if (/^\s+$/.test(token)) {
        frag.appendChild(document.createTextNode(token));
      } else {
        const span = document.createElement('span');
        span.className = 'reveal-word';
        span.textContent = token;
        frag.appendChild(span);
      }
    });
  } else {
    for (const ch of text) {
      if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
      if (ch === '\n') { frag.appendChild(document.createElement('br')); continue; }
      const span = document.createElement('span');
      span.className = 'reveal-char';
      span.textContent = ch;
      frag.appendChild(span);
    }
  }
}

/**
 * 자식 노드를 순회하며 글자/단어 단위로 span 으로 split.
 * 인라인 자식(<span class="text-gradient">9.6배</span>)은 보존하되 내부 텍스트만 split.
 */
function splitText(el, { byWord = false } = {}) {
  if (!el || el.dataset.split === 'true') return;

  const children = Array.from(el.childNodes);
  const frag = document.createDocumentFragment();

  children.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      splitTextNode(node, byWord, frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 인라인 강조 요소(예: .text-gradient)는 wrapper 유지, 내부 텍스트 split
      const innerFrag = document.createDocumentFragment();
      Array.from(node.childNodes).forEach((cn) => {
        if (cn.nodeType === Node.TEXT_NODE) splitTextNode(cn, byWord, innerFrag);
        else innerFrag.appendChild(cn);
      });
      node.textContent = '';
      node.appendChild(innerFrag);
      frag.appendChild(node);
    } else {
      frag.appendChild(node);
    }
  });

  el.textContent = '';
  el.appendChild(frag);
  el.dataset.split = 'true';
}

// ---------------------------------------------------------------------------
// 2) Hero 시퀀스
// ---------------------------------------------------------------------------
function initHero() {
  const hero = document.querySelector('#hero, .hero, [data-section="hero"]');
  if (!hero) return;

  // display-1 글자 reveal 준비
  const revealTargets = hero.querySelectorAll('[data-animate="reveal"]');
  revealTargets.forEach((el) => splitText(el, { byWord: false }));

  if (PREFERS_REDUCED) {
    // 모든 요소를 최종 상태로
    hero.querySelectorAll('[data-animate], [data-stagger]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    hero.querySelectorAll('.reveal-char, .reveal-word').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Hero 진입 시퀀스 (페이지 로드 직후 1회)
  // clearProps: 'transform,opacity' — 종료 후 inline transform 잔류 방지 (Playwright 검증 이슈 대응)
  const tl = gsap.timeline({
    defaults: { ease: 'power4.out', clearProps: 'transform,opacity' },
  });

  // 0) overline (data-animate="fade-up" 또는 .overline)
  const overline = hero.querySelector('.hero__inner > .overline, [data-hero-overline]');
  if (overline) {
    tl.from(overline, { opacity: 0, y: 16, duration: 0.6 }, 0);
  }

  // 1) display-1 글자
  revealTargets.forEach((el, i) => {
    const chars = el.querySelectorAll('.reveal-char');
    if (!chars.length) return;
    tl.from(chars, {
      y: 120,
      opacity: 0,
      rotate: 6,
      duration: 1.0,
      stagger: 0.035,
    }, 0.1 + i * 0.05);
  });

  // 2) hero__subtitle / hero__lead — data-animate="fade-up" + data-animate-delay
  const fadeUps = hero.querySelectorAll('[data-animate="fade-up"]');
  fadeUps.forEach((el) => {
    if (el === overline) return;
    const delayMs = parseInt(el.dataset.animateDelay || '0', 10);
    tl.from(el, {
      opacity: 0,
      y: 28,
      duration: 0.7,
      ease: 'power3.out',
    }, 0.1 + delayMs / 1000);
  });

  // 3) hero__metrics 자식 stagger
  const heroMetrics = hero.querySelector('.hero__metrics, [data-hero-metrics]');
  if (heroMetrics) {
    const items = heroMetrics.querySelectorAll(':scope > .metric-card, :scope > article');
    if (items.length) {
      const baseDelay = parseInt(heroMetrics.dataset.staggerDelay || '600', 10) / 1000;
      tl.from(items, {
        y: 40,
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      }, baseDelay);
      heroMetrics.dataset.staggerHandled = 'true';
    }
  }

  // 4) scroll-indicator
  const scrollHint = hero.querySelector('.scroll-indicator, [data-scroll-indicator]');
  if (scrollHint) {
    tl.from(scrollHint, { opacity: 0, y: -8, duration: 0.6 }, 1.2);
  }
}

// ---------------------------------------------------------------------------
// 3) 일반 [data-animate="fade-up"] 진입 (Hero 밖)
// ---------------------------------------------------------------------------
function initFadeUps() {
  if (PREFERS_REDUCED) {
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  document.querySelectorAll('[data-animate="fade-up"]').forEach((el) => {
    if (el.closest('#hero, .hero, [data-section="hero"]')) return; // hero 는 위에서 처리

    const delayMs = parseInt(el.dataset.animateDelay || '0', 10);

    gsap.from(el, {
      opacity: 0,
      y: 32,
      duration: 0.7,
      ease: 'power3.out',
      delay: delayMs / 1000,
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: el,
        start: TRIGGER_START,
        toggleActions: TOGGLE_ACTIONS,
      },
    });
  });

  // 일반 reveal (Hero 밖에도 있을 경우)
  document.querySelectorAll('[data-animate="reveal"]').forEach((el) => {
    if (el.closest('#hero, .hero, [data-section="hero"]')) return;
    splitText(el, { byWord: false });
    const chars = el.querySelectorAll('.reveal-char');
    if (!chars.length) return;
    gsap.from(chars, {
      y: 60,
      opacity: 0,
      duration: 0.7,
      stagger: 0.025,
      ease: 'power4.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: el,
        start: TRIGGER_START,
        toggleActions: TOGGLE_ACTIONS,
      },
    });
  });
}

// ---------------------------------------------------------------------------
// 4) [data-stagger] 부모 → 자식 fade-up stagger
// ---------------------------------------------------------------------------
function initStaggerGroups() {
  if (PREFERS_REDUCED) {
    document.querySelectorAll('[data-stagger] > *').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  document.querySelectorAll('[data-stagger]').forEach((parent) => {
    if (parent.dataset.staggerHandled === 'true') return;
    if (parent.closest('#hero, .hero, [data-section="hero"]')) return; // hero 메트릭은 처리됨

    const children = Array.from(parent.children).filter((el) => !el.matches('script, style, br'));
    if (!children.length) return;

    const delayMs = parseInt(parent.dataset.staggerDelay || '0', 10);

    gsap.from(children, {
      y: 36,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
      delay: delayMs / 1000,
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: parent,
        start: TRIGGER_START,
        toggleActions: TOGGLE_ACTIONS,
      },
    });
  });
}

// ---------------------------------------------------------------------------
// 5) 차트 컨테이너 진입 — figcaption/head 만 fade-up, canvas 영역은 차트 자체 800ms 에 위임
//    (visualization-engineer 조율 §1: 외곽만 모션, canvas 는 차트 자체 easeOutCubic draw-in 으로 위임)
// ---------------------------------------------------------------------------
function initChartFades() {
  if (PREFERS_REDUCED) return;

  document.querySelectorAll('.chart-container, [data-chart-container]').forEach((chart) => {
    // 컨테이너 본체: 짧은 fade-in 만 (400ms, 차트 800ms 보다 먼저 끝나 깜빡임 방지)
    gsap.from(chart, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      clearProps: 'opacity',
      scrollTrigger: {
        trigger: chart,
        start: 'top 88%',
        toggleActions: TOGGLE_ACTIONS,
      },
    });

    // 외곽(헤더·캡션·컨트롤)만 살짝 위로 이동하며 등장
    const outer = chart.querySelectorAll(
      ':scope > .chart-container__head, :scope > figcaption, :scope > .chart-container__controls, :scope > header'
    );
    if (outer.length) {
      gsap.from(outer, {
        y: 14,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.08,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: chart,
          start: 'top 88%',
          toggleActions: TOGGLE_ACTIONS,
        },
      });
    }
    // canvas 영역(.chart-container__canvas, canvas)은 의도적으로 건드리지 않음
    // → Chart.js / ECharts 의 800ms easeOutCubic draw-in 이 그대로 보임
  });
}

// ---------------------------------------------------------------------------
// 6) 단어 단위 reveal — [data-text-reveal] (Hero 밖)
// ---------------------------------------------------------------------------
function initWordReveals() {
  if (PREFERS_REDUCED) return;

  document.querySelectorAll('[data-text-reveal]').forEach((el) => {
    if (el.closest('#hero, .hero, [data-section="hero"]')) return;
    splitText(el, { byWord: true });
    const words = el.querySelectorAll('.reveal-word');
    if (!words.length) return;
    gsap.from(words, {
      y: 22,
      opacity: 0,
      duration: 0.6,
      stagger: 0.022,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: TOGGLE_ACTIONS,
      },
    });
  });
}

// ---------------------------------------------------------------------------
// 7) 스크롤 진행 바 (frontend BEM: .scroll-progress__bar 가 자식)
// ---------------------------------------------------------------------------
function initScrollProgressBar() {
  if (PREFERS_REDUCED) return;
  const bar = document.querySelector('.scroll-progress__bar, .scroll-progress > span, [data-scroll-progress]');
  if (!bar) return;

  // BEM 마크업이 width 0% 로 시작하므로 width 또는 transform 둘 다 안전
  gsap.set(bar, { transformOrigin: '0% 50%' });
  gsap.to(bar, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.2,
    },
  });
}

// ---------------------------------------------------------------------------
// 8) Sticky header is-stuck 토글 (main.css 에 .is-stuck 정의됨)
// ---------------------------------------------------------------------------
function initStickyHeader() {
  const header = document.querySelector('.site-header, #site-header');
  if (!header) return;
  ScrollTrigger.create({
    trigger: document.body,
    start: '64 top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const stuck = self.scroll() > 64;
      header.classList.toggle('is-stuck', stuck);
    },
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
function init() {
  initHero();
  initFadeUps();
  initStaggerGroups();
  initChartFades();
  initWordReveals();
  initScrollProgressBar();
  initStickyHeader();

  // 폰트 로드 후 트리거 위치 재계산
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { splitText };
