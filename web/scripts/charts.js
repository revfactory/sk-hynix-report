// charts.js — 통합 진입점 (ESM)
// 모든 차트의 IntersectionObserver lazy init + data.json 단일 로딩
// 사용법:
//   <script type="module" src="/web/scripts/charts.js"></script>
//   HTML에서 [data-chart] 또는 [data-chart-id] 컨테이너 내부에 <canvas id="chart-..."> 또는 <div id="chart-..."> 가 있으면 자동 init

import { loadData } from './data-loader.js';
import { initPriceChart } from './chart-configs/price-chart.js';
import { initRevenueTrend } from './chart-configs/revenue-trend.js';
import { initHbmShare } from './chart-configs/hbm-share.js';
import { initNvidiaSupply } from './chart-configs/nvidia-supply.js';
import { initConsensus } from './chart-configs/consensus.js';
import { initScenarios } from './chart-configs/scenarios.js';
import { initRiskMatrix } from './chart-configs/risk-matrix.js';
import { prefersReducedMotion, destroyChart } from './chart-configs/_chart-utils.js';

// chart-container selector: data-chart 또는 data-chart-id 둘 다 허용
const CONTAINER_SELECTOR = '[data-chart], [data-chart-id]';

// 차트 ID → 초기화 함수 매핑
const CHART_INITIALIZERS = {
  'chart-price': (data) => initPriceChart(data),
  'chart-revenue-trend': (data) => initRevenueTrend(data),
  'chart-hbm-share': (data) => initHbmShare(data),
  'chart-nvidia-supply': (data) => initNvidiaSupply(data),
  'chart-consensus': (data) => initConsensus(data),
  'chart-scenarios': (data) => initScenarios(data),
  'chart-risk-matrix': (data) => initRiskMatrix(data),
};

const _initialized = new Set();

export async function initAllCharts({ eager = false } = {}) {
  let data;
  try {
    data = await loadData();
  } catch (err) {
    console.error('[charts] failed to load data', err);
    document.querySelectorAll(CONTAINER_SELECTOR).forEach((el) => {
      el.classList.add('is-error');
      el.setAttribute('data-error', '데이터 로드 실패');
    });
    return;
  }

  if (eager || prefersReducedMotion) {
    // reduced-motion 또는 명시적 eager: 모두 즉시 init
    document.querySelectorAll(CONTAINER_SELECTOR).forEach((containerEl) => {
      _tryInit(containerEl, data);
    });
    return;
  }

  // 지연 초기화: IntersectionObserver (threshold 0.2)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (_tryInit(entry.target, data)) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );

  document.querySelectorAll(CONTAINER_SELECTOR).forEach((el) => observer.observe(el));
}

function _tryInit(containerEl, data) {
  // 컨테이너 내부의 canvas 또는 [id^="chart-"] div 찾기
  const target = containerEl.querySelector('canvas[id^="chart-"], div[id^="chart-"]');
  if (!target) return false;
  const id = target.id;
  if (_initialized.has(id)) return true;
  const initFn = CHART_INITIALIZERS[id];
  if (!initFn) {
    console.warn(`[charts] no initializer for #${id}`);
    return false;
  }
  try {
    initFn(data);
    _initialized.add(id);
    containerEl.classList.add('is-chart-ready');
    return true;
  } catch (err) {
    console.error(`[charts] init failed for #${id}`, err);
    containerEl.classList.add('is-error');
    return false;
  }
}

// 테마 전환 시 차트 재구성 (light/dark 시 토큰 변경 — 단순화: 전체 destroy + re-init)
export function rebuildAllCharts() {
  const data = window.SKHData;
  if (!data) return;
  _initialized.forEach((id) => destroyChart(id));
  _initialized.clear();
  document.querySelectorAll(CONTAINER_SELECTOR).forEach((containerEl) => {
    _tryInit(containerEl, data);
  });
}

// theme-change 커스텀 이벤트 리스닝 (frontend-engineer가 dispatch)
window.addEventListener('skh:theme-change', () => {
  rebuildAllCharts();
});

// auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initAllCharts());
} else {
  initAllCharts();
}

// 글로벌 노출 (디버깅용)
window.SKHCharts = {
  initAllCharts,
  rebuildAllCharts,
  CHART_INITIALIZERS,
};
