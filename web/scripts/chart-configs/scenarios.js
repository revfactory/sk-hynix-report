// scenarios.js — Bear/Base/Bull 시나리오 (Chart.js fan bar)
// 데이터: data.scenarios.{bear,base,bull}
// 컨테이너: <canvas id="chart-scenarios"> + 토글 [data-scenario]
// 현재가 → 12개월 가격 범위. 3개 시나리오 horizontal band + 확률 라벨

import { TOKENS, fmt, makeChartJSDefaults, registerChart, observeResize, ensureCanvas } from './_chart-utils.js';

export function initScenarios(data, { canvasId = 'chart-scenarios', activeScenario = null } = {}) {
  const canvas = ensureCanvas(canvasId);
  if (!canvas) {
    console.warn(`[scenarios] container #${canvasId} not found`);
    return null;
  }
  if (typeof Chart === 'undefined') {
    console.warn('[scenarios] Chart.js not loaded');
    return null;
  }

  const { bear, base, bull, weightedExpected } = data.scenarios;
  const current = data.snapshot.price;
  const scenarios = [
    { key: 'bull', label: 'Bull · 슈퍼사이클 연장', data: bull, color: TOKENS.scenario.bull, bg: TOKENS.scenario.bullBg },
    { key: 'base', label: 'Base · 분점 + Soft Landing', data: base, color: TOKENS.scenario.base, bg: TOKENS.scenario.baseBg },
    { key: 'bear', label: 'Bear · 사이클 천장 + 셰어 잠식', data: bear, color: TOKENS.scenario.bear, bg: TOKENS.scenario.bearBg },
  ];

  const labels = scenarios.map((s) => s.label);

  // floating bar: [low, high]
  const ranges = scenarios.map((s) => s.data.priceRange);
  const mids = scenarios.map((s) => s.data.priceMid);
  const probs = scenarios.map((s) => s.data.probabilityMean);

  const defaults = makeChartJSDefaults();

  function bgWithOpacity(s) {
    if (!activeScenario || activeScenario === s.key) return s.bg;
    return 'rgba(120,120,140,0.06)';
  }
  function borderWithOpacity(s) {
    if (!activeScenario || activeScenario === s.key) return s.color;
    return TOKENS.text.muted;
  }

  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '주가 범위 (원)',
          data: ranges, // [low, high] floating bar
          backgroundColor: scenarios.map(bgWithOpacity),
          borderColor: scenarios.map(borderWithOpacity),
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.55,
          categoryPercentage: 0.85,
        },
        {
          label: '중간값 (priceMid)',
          type: 'scatter',
          data: scenarios.map((s, i) => ({ x: s.data.priceMid, y: i })),
          backgroundColor: scenarios.map((s) => (!activeScenario || activeScenario === s.key ? s.color : TOKENS.text.muted)),
          borderColor: TOKENS.text.primary,
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 11,
          pointStyle: 'rectRot',
        },
      ],
    },
    options: {
      ...defaults,
      indexAxis: 'y',
      plugins: {
        ...defaults.plugins,
        legend: { display: false },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              const s = scenarios[idx];
              return `${s.label} · ${probs[idx]}%`;
            },
            label: (item) => {
              const idx = item.dataIndex;
              const s = scenarios[idx];
              if (item.datasetIndex === 1) {
                return `중간값: ${fmt.krw(s.data.priceMid)}`;
              }
              const [lo, hi] = s.data.priceRange;
              const [loPct, hiPct] = s.data.currentVsRangePct;
              return [
                `범위: ${fmt.krw(lo)} ~ ${fmt.krw(hi)}`,
                `현재 대비: ${loPct >= 0 ? '+' : ''}${loPct}% ~ ${hiPct >= 0 ? '+' : ''}${hiPct}%`,
                `확률: ${s.data.probability[0]}~${s.data.probability[1]}%`,
              ];
            },
            afterLabel: (item) => {
              if (item.datasetIndex !== 0) return '';
              const s = scenarios[item.dataIndex];
              return `\n${s.data.title}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          position: 'top',
          min: 900000,
          max: 3100000,
          grid: { color: TOKENS.grid, borderDash: [2, 4] },
          ticks: {
            color: TOKENS.text.tertiary,
            font: { size: 11 },
            callback: (v) => `${(v / 10000).toFixed(0)}만`,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: TOKENS.text.secondary,
            font: { size: 12, weight: 600 },
            callback: (v, i) => {
              const s = scenarios[i];
              return `${s.label}  (${probs[i]}%)`;
            },
          },
          afterFit: (axis) => {
            axis.width = 220;
          },
        },
      },
    },
    plugins: [
      // 현재가 vertical line + weighted expected band
      {
        id: 'scenario-vlines',
        afterDatasetsDraw: (chart) => {
          const { ctx, chartArea, scales } = chart;
          const drawV = (val, color, label, dashed = false) => {
            const x = scales.x.getPixelForValue(val);
            if (x < chartArea.left || x > chartArea.right) return;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            if (dashed) ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(x, chartArea.top);
            ctx.lineTo(x, chartArea.bottom);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = color;
            ctx.font = '600 11px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, chartArea.bottom + 16);
            ctx.restore();
          };
          drawV(current, TOKENS.viz[1], `현재 ${(current / 10000).toFixed(0)}만`);
          // weighted expected band (음영)
          if (weightedExpected) {
            const x1 = scales.x.getPixelForValue(weightedExpected.low);
            const x2 = scales.x.getPixelForValue(weightedExpected.high);
            ctx.save();
            ctx.fillStyle = 'rgba(167,139,250,0.10)';
            ctx.fillRect(x1, chartArea.top, x2 - x1, chartArea.bottom - chartArea.top);
            ctx.strokeStyle = TOKENS.viz[2];
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1;
            ctx.strokeRect(x1, chartArea.top, x2 - x1, chartArea.bottom - chartArea.top);
            ctx.setLineDash([]);
            ctx.fillStyle = TOKENS.viz[2];
            ctx.font = '600 10px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`가중 기댓값 ${(weightedExpected.low / 10000).toFixed(0)}~${(weightedExpected.high / 10000).toFixed(0)}만`, (x1 + x2) / 2, chartArea.top - 6);
            ctx.restore();
          }
        },
      },
    ],
  });

  registerChart(canvasId, chart);
  observeResize(canvas.parentElement, chart);

  // 토글 버튼 바인딩 — 시나리오 토글은 chart-container 바깥 (section 상단)에 위치할 수도 있음
  // 검색 범위: 가장 가까운 section/article 또는 main, 없으면 document 전역
  const scope =
    canvas.closest('section, article, main, [data-pillar], [data-scenario-section]') ||
    document;
  const buttons = scope.querySelectorAll('[data-scenario]');
  if (buttons.length > 0) {
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.scenario;
        const newActive = activeScenario === key ? null : key; // 같은 거 다시 누르면 해제
        activeScenario = newActive;
        buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.scenario === newActive));

        // dataset bg/border 갱신
        chart.data.datasets[0].backgroundColor = scenarios.map(bgWithOpacity);
        chart.data.datasets[0].borderColor = scenarios.map(borderWithOpacity);
        chart.data.datasets[1].backgroundColor = scenarios.map((s) => (!activeScenario || activeScenario === s.key ? s.color : TOKENS.text.muted));
        chart.update('active');
      });
      if (btn.dataset.scenario === activeScenario) btn.classList.add('is-active');
    });
  }

  return chart;
}
