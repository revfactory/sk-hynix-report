// _chart-utils.js — 차트 공통 유틸 (토큰·포맷터·툴팁 스타일·prefers-reduced-motion)

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const ANIM_DURATION = prefersReducedMotion ? 0 : 800;
export const ANIM_EASING = 'easeOutCubic';

// design-tokens.json 다크 모드 기준 (frontend-engineer가 CSS 변수로 노출 시 getComputedStyle 가능)
// 토큰 키와 1:1 매칭 — 임의 색 추가 금지
export const TOKENS = {
  viz: {
    1: '#06B6D4',
    2: '#A78BFA',
    3: '#FB923C',
    4: '#FBBF24',
    5: '#4ADE80',
    6: '#F472B6',
    7: '#38BDF8',
    8: '#C084FC',
  },
  company: {
    sk: '#06B6D4',
    samsung: '#A78BFA',
    micron: '#FB923C',
    nvidia: '#76B900',
    amd: '#ED1C24',
    google: '#F472B6',
    aws: '#FBBF24',
  },
  state: {
    bull: '#10B981',
    bullSoft: 'rgba(16,185,129,0.16)',
    bear: '#EF4444',
    bearSoft: 'rgba(239,68,68,0.18)',
    neutral: '#6B7280',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  scenario: {
    bear: '#EF4444',
    bearBg: 'rgba(239,68,68,0.12)',
    base: '#06B6D4',
    baseBg: 'rgba(6,182,212,0.12)',
    bull: '#10B981',
    bullBg: 'rgba(16,185,129,0.12)',
  },
  risk: {
    high: '#EF4444',
    mid: '#F59E0B',
    low: '#10B981',
  },
  heat: ['#0E1322', '#1E3A5F', '#1E5F7A', '#06B6D4', '#22D3EE', '#6FE6FF'],
  text: {
    primary: '#F4F7FB',
    secondary: '#C7D0E0',
    tertiary: '#8B95A9',
    muted: '#5E6A82',
  },
  bg: {
    glass: 'rgba(20,26,45,0.55)',
    glassHi: 'rgba(27,34,56,0.70)',
  },
  border: {
    default: 'rgba(255,255,255,0.10)',
    subtle: 'rgba(255,255,255,0.06)',
  },
  grid: 'rgba(255,255,255,0.05)',
};

// 포맷터 — 보고서 1:1, 임의 반올림 금지
export const fmt = {
  krw: (n) => `${Math.round(n).toLocaleString('ko-KR')}원`,
  krwShort: (n) => {
    if (n >= 1e8) return `${(n / 1e8).toFixed(0)}억원`;
    return `${Math.round(n).toLocaleString('ko-KR')}원`;
  },
  krwTrillion: (n) => `${n}조원`,
  pct: (n, withSign = true) => {
    const sign = n > 0 && withSign ? '+' : '';
    return `${sign}${n}%`;
  },
  date: (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  monthYear: (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  },
  usdBn: (n) => `$${n}B`,
};

// Chart.js v4 공통 옵션 (글래스 툴팁 + 그리드 + 폰트)
export function makeChartJSDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReducedMotion ? false : { duration: ANIM_DURATION, easing: ANIM_EASING },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: {
          color: TOKENS.text.secondary,
          font: { family: "'Inter', 'Pretendard', system-ui, sans-serif", size: 12, weight: 500 },
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: TOKENS.bg.glassHi,
        titleColor: TOKENS.text.primary,
        bodyColor: TOKENS.text.secondary,
        borderColor: TOKENS.border.default,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        titleFont: { family: "'Inter', sans-serif", size: 12, weight: 600 },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 13, weight: 500 },
      },
    },
    scales: {
      x: {
        grid: { color: TOKENS.grid, borderDash: [2, 4] },
        ticks: { color: TOKENS.text.tertiary, font: { size: 11 } },
        border: { color: TOKENS.border.subtle },
      },
      y: {
        grid: { color: TOKENS.grid, borderDash: [2, 4] },
        ticks: { color: TOKENS.text.tertiary, font: { size: 11 } },
        border: { color: TOKENS.border.subtle },
      },
    },
  };
}

// ECharts 공통 (테마)
export function makeEChartsTheme() {
  return {
    textStyle: {
      color: TOKENS.text.secondary,
      fontFamily: "'Inter', 'Pretendard', system-ui, sans-serif",
    },
    tooltip: {
      backgroundColor: TOKENS.bg.glassHi,
      borderColor: TOKENS.border.default,
      borderWidth: 1,
      textStyle: {
        color: TOKENS.text.primary,
        fontFamily: "'Inter', sans-serif",
      },
      extraCssText: 'backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.45); padding: 12px 14px;',
    },
  };
}

// Chart.js는 canvas 필요. frontend가 <div>로 만들었어도 내부에 canvas를 자동 생성해 반환
export function ensureCanvas(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  if (el.tagName === 'CANVAS') return el;
  // div인 경우: 내부에 이미 canvas가 있으면 재사용
  let canvas = el.querySelector('canvas');
  if (canvas) return canvas;
  // 새 canvas 생성 (id는 부여하지 않음 — 부모 div의 id가 selector 역할)
  canvas = document.createElement('canvas');
  canvas.setAttribute('data-chart-canvas', id);
  el.style.position = el.style.position || 'relative';
  // 부모 div가 inline 사이즈를 갖도록 폴백
  if (!el.style.height && !el.style.minHeight) el.style.minHeight = '320px';
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  el.appendChild(canvas);
  return canvas;
}

// 컨테이너(canvas|div) 자체 ResizeObserver 대상으로 사용할 부모 반환
export function getRoot(id) {
  return document.getElementById(id);
}

// 차트 진입 시 1회 실행 (canvas 또는 div에 마운트 후 인스턴스 반환)
const _chartInstances = new Map();

export function registerChart(id, instance) {
  // 기존 인스턴스 dispose
  const prev = _chartInstances.get(id);
  if (prev) {
    if (typeof prev.destroy === 'function') prev.destroy();
    else if (typeof prev.dispose === 'function') prev.dispose();
  }
  _chartInstances.set(id, instance);
  return instance;
}

export function getChart(id) {
  return _chartInstances.get(id);
}

export function destroyChart(id) {
  const inst = _chartInstances.get(id);
  if (inst) {
    if (typeof inst.destroy === 'function') inst.destroy();
    else if (typeof inst.dispose === 'function') inst.dispose();
    _chartInstances.delete(id);
  }
}

// resize 옵저버
let _resizeObserver = null;
export function observeResize(el, instance) {
  if (!_resizeObserver) {
    _resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const inst = entry.target.__chartInstance__;
        if (!inst) continue;
        if (typeof inst.resize === 'function') inst.resize();
      }
    });
  }
  el.__chartInstance__ = instance;
  _resizeObserver.observe(el);
}
