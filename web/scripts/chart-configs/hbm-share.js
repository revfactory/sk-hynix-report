// hbm-share.js — HBM 점유율 도넛 (Chart.js)
// 데이터: data.hbmShare2026 (bit_basis / revenue_basis / hbm4_forecast / nvidiaHBM4Allocation)
// 컨테이너: <canvas id="chart-hbm-share"> 또는 <div id="chart-hbm-share">
// 토글 selector: [data-hbm-view] 또는 [data-toggle-dataset] 둘 다 지원
// 토글 값 alias: bit↔bit_basis, revenue↔revenue_basis, hbm4↔hbm4_forecast, nvidia↔nvidiaHBM4Allocation
// 중앙 라벨: 선택 데이터셋명 + SK 점유율 강조

import { TOKENS, makeChartJSDefaults, registerChart, observeResize, prefersReducedMotion, ensureCanvas } from './_chart-utils.js';

// 표준 키 = data.json의 hbmShare2026 하위 키
const VIEWS = {
  bit_basis: { label: 'Bit 기준 2026', source: 'TrendForce' },
  revenue_basis: { label: '매출 기준 2026', source: 'Counterpoint' },
  hbm4_forecast: { label: 'HBM4 forecast 2026', source: 'Counterpoint' },
  nvidiaHBM4Allocation: { label: 'NVIDIA Rubin HBM4 할당', source: 'UBS / TrendForce' },
};

// HTML 단축 토큰 ↔ data.json 표준 키
const KEY_ALIAS = {
  bit: 'bit_basis',
  revenue: 'revenue_basis',
  hbm4: 'hbm4_forecast',
  nvidia: 'nvidiaHBM4Allocation',
};

function normalizeKey(raw) {
  if (!raw) return null;
  if (VIEWS[raw]) return raw;
  if (KEY_ALIAS[raw]) return KEY_ALIAS[raw];
  return null;
}

// 중앙 라벨 plugin
function makeCenterLabelPlugin() {
  return {
    id: 'hbm-center-label',
    afterDraw: (chart) => {
      const { ctx, chartArea } = chart;
      const ds = chart.data.datasets[0];
      const cfg = chart.$_currentCfg || VIEWS.bit_basis;
      const skIndex = chart.data.labels.findIndex((l) => l.includes('SK'));
      const skVal = skIndex >= 0 ? ds.data[skIndex] : 0;

      const cx = (chartArea.left + chartArea.right) / 2;
      const cy = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = '700 36px "JetBrains Mono", monospace';
      ctx.fillStyle = TOKENS.company.sk;
      ctx.fillText(`${skVal}%`, cx, cy - 10);

      ctx.font = '600 12px "Inter", sans-serif';
      ctx.fillStyle = TOKENS.text.secondary;
      ctx.fillText('SK하이닉스', cx, cy + 18);

      ctx.font = '500 10px "Inter", sans-serif';
      ctx.fillStyle = TOKENS.text.muted;
      ctx.fillText(cfg.label, cx, cy + 36);

      ctx.restore();
    },
  };
}

export function initHbmShare(data, { canvasId = 'chart-hbm-share', view = 'bit_basis' } = {}) {
  const canvas = ensureCanvas(canvasId);
  if (!canvas) {
    console.warn(`[hbm-share] container #${canvasId} not found`);
    return null;
  }
  if (typeof Chart === 'undefined') {
    console.warn('[hbm-share] Chart.js not loaded');
    return null;
  }

  let currentView = normalizeKey(view) || 'bit_basis';

  function getViewData(v) {
    const key = normalizeKey(v);
    if (!key) return null;
    const cfg = VIEWS[key];
    const dataset = data.hbmShare2026[key];
    if (!dataset || !dataset.data) return null;
    return { key, cfg, dataset };
  }

  const viewData = getViewData(currentView);
  if (!viewData) {
    console.warn(`[hbm-share] no data for initial view: ${view}`);
    return null;
  }
  const { cfg, dataset } = viewData;
  const labels = dataset.data.map((d) => d.company);
  const values = dataset.data.map((d) => d.share);
  const colors = dataset.data.map((d) => TOKENS.company[d.key] || TOKENS.viz[1]);

  const defaults = makeChartJSDefaults();

  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: TOKENS.bg.glassHi,
          borderWidth: 3,
          hoverOffset: 12,
          hoverBorderColor: TOKENS.text.primary,
          hoverBorderWidth: 2,
        },
      ],
    },
    options: {
      ...defaults,
      cutout: '68%',
      animation: prefersReducedMotion ? false : { animateRotate: true, animateScale: true, duration: 800, easing: 'easeOutCubic' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: TOKENS.text.secondary,
            font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            generateLabels: (chart) => {
              const ds = chart.data.datasets[0];
              return chart.data.labels.map((label, i) => ({
                text: `${label} ${ds.data[i]}%`,
                fillStyle: ds.backgroundColor[i],
                strokeStyle: ds.backgroundColor[i],
                pointStyle: 'circle',
                hidden: false,
                index: i,
              }));
            },
          },
        },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: (item) => `${item.label}: ${item.parsed}%`,
            afterLabel: (item) => {
              const c = item.chart.$_currentCfg || VIEWS.bit_basis;
              return `출처: ${c.source}`;
            },
          },
        },
      },
      scales: { x: { display: false }, y: { display: false } },
    },
    plugins: [makeCenterLabelPlugin()],
  });

  chart.$_currentCfg = cfg;

  registerChart(canvasId, chart);
  observeResize(canvas.parentElement, chart);

  // 토글 버튼 바인딩 — `data-hbm-view` 또는 `data-toggle-dataset` 둘 다 지원
  const container = canvas.closest('[data-chart], [data-chart-id]');
  if (container) {
    const buttons = container.querySelectorAll('[data-hbm-view], [data-toggle-dataset]');
    function readBtnKey(btn) {
      return btn.dataset.hbmView || btn.dataset.toggleDataset;
    }
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const raw = readBtnKey(btn);
        const next = getViewData(raw);
        if (!next) {
          console.warn(`[hbm-share] unknown dataset key: ${raw}`);
          return;
        }
        if (next.key === currentView) return;
        buttons.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle('is-active', isActive);
          if (b.getAttribute('role') === 'tab') b.setAttribute('aria-selected', String(isActive));
        });
        currentView = next.key;
        chart.data.labels = next.dataset.data.map((d) => d.company);
        chart.data.datasets[0].data = next.dataset.data.map((d) => d.share);
        chart.data.datasets[0].backgroundColor = next.dataset.data.map((d) => TOKENS.company[d.key] || TOKENS.viz[1]);
        chart.$_currentCfg = next.cfg;
        chart.update('active');
      });
      // 초기 active 표시: 버튼의 키를 normalize해서 currentView와 비교
      const btnNorm = normalizeKey(readBtnKey(btn));
      if (btnNorm === currentView) btn.classList.add('is-active');
    });
  }

  return chart;
}
