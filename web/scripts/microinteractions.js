/**
 * microinteractions.js
 * 카운트업 · 3D tilt · 인터랙티브 마이크로 모션
 *
 * 트리거 클래스/속성:
 *   [data-countup="<value>"]                숫자 카운트업 (IntersectionObserver, threshold 0.6, 한 번만)
 *   [data-countup-format="percent|signed|currency|krw"]  포맷 옵션
 *   [data-countup-decimals="2"]              소수점 자리수 (기본 0)
 *   [data-countup-prefix], [data-countup-suffix]  접두/접미
 *   .metric-card, .summary-card, [data-tilt]  3D tilt (mousemove → perspective rotate)
 *   .nav-link, [data-magnetic]               magnetic hover (옵션)
 */

const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// 1) Count-up
// ---------------------------------------------------------------------------
const FORMATTERS = {
  krw: (v, decimals = 0) =>
    v.toLocaleString('ko-KR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }),
  currency: (v, decimals = 0) =>
    v.toLocaleString('ko-KR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }),
  percent: (v, decimals = 1) =>
    v.toLocaleString('ko-KR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + '%',
  signed: (v, decimals = 1) => {
    const sign = v >= 0 ? '+' : '';
    return sign + v.toLocaleString('ko-KR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
  },
  signedPercent: (v, decimals = 1) => {
    const sign = v >= 0 ? '+' : '';
    return sign + v.toLocaleString('ko-KR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + '%';
  },
  number: (v, decimals = 0) =>
    v.toLocaleString('ko-KR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }),
};

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function countUp(el, target, duration = 1500) {
  const format = el.dataset.countupFormat || inferFormat(el);
  const decimals = parseInt(el.dataset.countupDecimals || '0', 10);
  const { prefix, suffix } = effectiveAffix(el, format);
  const formatter = FORMATTERS[format] || FORMATTERS.number;

  // 음수에서 시작하지 않고 0 또는 target 의 일부에서 시작
  const start = 0;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    const value = start + (target - start) * eased;
    el.textContent = prefix + formatter(value, decimals) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = prefix + formatter(target, decimals) + suffix;
    }
  }

  requestAnimationFrame(tick);
}

function inferFormat(el) {
  if (el.dataset.countupFormat) return el.dataset.countupFormat;
  const prefix = el.dataset.countupPrefix || '';
  const suffix = el.dataset.countupSuffix || '';
  if (prefix.includes('+') && suffix.includes('%')) return 'signedPercent';
  if (suffix.includes('%')) return 'percent';
  if (prefix.includes('+')) return 'signed';
  const t = parseFloat(el.dataset.countup);
  if (Number.isFinite(t) && Math.abs(t) >= 1000) return 'krw';
  return 'number';
}

/**
 * 자동 추론된 포맷이 이미 sign 또는 % 를 출력하면, 사용자가 명시한 prefix/suffix 와 중복된다.
 * (예: HTML 에 data-countup-prefix="+" data-countup-suffix="%" 가 있을 때 inferFormat = signedPercent)
 * 이 경우 prefix/suffix 를 무시해 깔끔하게 한 번만 붙도록 보정한다.
 */
function effectiveAffix(el, format) {
  let prefix = el.dataset.countupPrefix || '';
  let suffix = el.dataset.countupSuffix || '';
  if (format === 'signedPercent') { prefix = ''; suffix = ''; }
  else if (format === 'percent')  { suffix = ''; }
  else if (format === 'signed')   { prefix = ''; }
  return { prefix, suffix };
}

function initCountUps() {
  const els = document.querySelectorAll('[data-countup]');
  if (!els.length) return;

  const renderFinal = (el) => {
    const target = parseFloat(el.dataset.countup);
    if (!Number.isFinite(target)) return;
    const format = inferFormat(el);
    const decimals = parseInt(el.dataset.countupDecimals || '0', 10);
    const { prefix, suffix } = effectiveAffix(el, format);
    const formatter = FORMATTERS[format] || FORMATTERS.number;
    el.textContent = prefix + formatter(target, decimals) + suffix;
  };

  if (PREFERS_REDUCED) {
    els.forEach(renderFinal);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        const target = parseFloat(entry.target.dataset.countup);
        if (Number.isFinite(target)) {
          // dataset에 format을 추론 결과로 굳혀서 countUp 이 안전하게 사용
          if (!entry.target.dataset.countupFormat) {
            entry.target.dataset.countupFormat = inferFormat(entry.target);
          }
          countUp(entry.target, target);
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  els.forEach((el) => {
    // 초기 상태: textContent가 미리 정답으로 차있을 수 있으므로 0 으로 덮어쓰지 않고
    // viewport 안에 있는지 먼저 확인. viewport 밖일 때만 0 으로 초기화 (Hero 카운트업 깜빡임 방지).
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) {
      const format = inferFormat(el);
      const decimals = parseInt(el.dataset.countupDecimals || '0', 10);
      const { prefix, suffix } = effectiveAffix(el, format);
      const formatter = FORMATTERS[format] || FORMATTERS.number;
      el.textContent = prefix + formatter(0, decimals) + suffix;
    }
    io.observe(el);
  });
}

// ---------------------------------------------------------------------------
// 2) 3D Tilt
// ---------------------------------------------------------------------------
function initTilt() {
  if (PREFERS_REDUCED) return;

  const cards = document.querySelectorAll('.metric-card, .summary-card, .strength-card, .concern-card, [data-tilt]');
  cards.forEach((card) => {
    // 마우스 트래킹 디바운스를 위해 RAF 사용
    let rafId = null;
    let pending = null;

    function apply() {
      if (!pending) return;
      const { x, y } = pending;
      pending = null;
      card.style.transform = `perspective(1000px) rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 6).toFixed(2)}deg) translateY(-2px)`;
      // 광택 (선택): card 안에 .tilt-shine 이 있으면 위치 갱신
      const shine = card.querySelector('.tilt-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${((x + 0.5) * 100).toFixed(1)}% ${((y + 0.5) * 100).toFixed(1)}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)`;
      }
      rafId = null;
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      pending = { x, y };
      if (rafId === null) rafId = requestAnimationFrame(apply);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      pending = null;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      card.style.transform = '';
      const shine = card.querySelector('.tilt-shine');
      if (shine) shine.style.background = '';
    });

    // 키보드 포커스 시에도 살짝 lift
    card.addEventListener('focusin', () => {
      card.style.transform = 'perspective(1000px) translateY(-2px)';
    });
    card.addEventListener('focusout', () => {
      card.style.transform = '';
    });
  });
}

// ---------------------------------------------------------------------------
// 3) Magnetic links (선택 — 헤더 nav 등에 사용)
// ---------------------------------------------------------------------------
function initMagnetic() {
  if (PREFERS_REDUCED) return;
  const targets = document.querySelectorAll('[data-magnetic]');
  targets.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// ---------------------------------------------------------------------------
// 4) 텍스트 reveal (scroll-animations.js 와 별도, JS only fallback)
//    DOM 에 .reveal-on-scroll 이 직접 있을 때 IntersectionObserver 로 add('is-visible')
// ---------------------------------------------------------------------------
function initRevealOnScroll() {
  const els = document.querySelectorAll('.reveal-on-scroll');
  if (!els.length) return;
  if (PREFERS_REDUCED) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// 5) Highlight pulse — 강조 메트릭에 IntersectionObserver 로 .highlight 추가
// ---------------------------------------------------------------------------
function initHighlightPulse() {
  if (PREFERS_REDUCED) return;
  const els = document.querySelectorAll('[data-highlight-on-view]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('highlight');
      }
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
function init() {
  initCountUps();
  initTilt();
  initMagnetic();
  initRevealOnScroll();
  initHighlightPulse();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { countUp, FORMATTERS };
