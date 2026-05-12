// revenue-trend.js — 5년 매출/OP/OPM 콤보 차트 (Chart.js)
// 데이터: data.revenueByYear
// 컨테이너: <canvas id="chart-revenue-trend">
// 바: 매출(viz-1) + OP(viz-3) / 라인: OPM(viz-2 보조축)
// FY23 음수 OP 표현 + FY26E/FY27E는 stripe 패턴

import { TOKENS, fmt, makeChartJSDefaults, registerChart, observeResize, ensureCanvas } from './_chart-utils.js';

// stripe pattern 생성 (FY26E/FY27E 추정치 표시)
function createStripePattern(ctx, color) {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 8;
  patternCanvas.height = 8;
  const pctx = patternCanvas.getContext('2d');
  pctx.fillStyle = color;
  pctx.fillRect(0, 0, 8, 8);
  pctx.strokeStyle = 'rgba(255,255,255,0.22)';
  pctx.lineWidth = 1.5;
  pctx.beginPath();
  pctx.moveTo(0, 8);
  pctx.lineTo(8, 0);
  pctx.moveTo(-2, 2);
  pctx.lineTo(2, -2);
  pctx.moveTo(6, 10);
  pctx.lineTo(10, 6);
  pctx.stroke();
  return ctx.createPattern(patternCanvas, 'repeat');
}

export function initRevenueTrend(data, { canvasId = 'chart-revenue-trend' } = {}) {
  const canvas = ensureCanvas(canvasId);
  if (!canvas) {
    console.warn(`[revenue-trend] container #${canvasId} not found`);
    return null;
  }
  if (typeof Chart === 'undefined') {
    console.warn('[revenue-trend] Chart.js not loaded');
    return null;
  }

  const rows = data.revenueByYear;
  const labels = rows.map((r) => r.fy);
  const revenue = rows.map((r) => r.revenue);
  const op = rows.map((r) => r.op);
  const opm = rows.map((r) => r.opm);
  const isEstimate = rows.map((r) => r.fy.endsWith('E'));

  const ctx = canvas.getContext('2d');
  const stripeRev = createStripePattern(ctx, TOKENS.viz[1]);
  const stripeOp = createStripePattern(ctx, TOKENS.viz[3]);

  const revColors = rows.map((_, i) => (isEstimate[i] ? stripeRev : TOKENS.viz[1]));
  const opColors = rows.map((r, i) => {
    if (r.op < 0) return TOKENS.state.bear;
    return isEstimate[i] ? stripeOp : TOKENS.viz[3];
  });

  const defaults = makeChartJSDefaults();

  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: '매출 (조원)',
          data: revenue,
          backgroundColor: revColors,
          borderColor: TOKENS.viz[1],
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'bar',
          label: '영업이익 (조원)',
          data: op,
          backgroundColor: opColors,
          borderColor: rows.map((r) => (r.op < 0 ? TOKENS.state.bear : TOKENS.viz[3])),
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line',
          label: 'OPM (%)',
          data: opm,
          borderColor: TOKENS.viz[2],
          backgroundColor: TOKENS.viz[2],
          borderWidth: 2.5,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: TOKENS.viz[2],
          pointBorderColor: TOKENS.text.primary,
          pointBorderWidth: 1.5,
          yAxisID: 'y1',
          order: 1,
          // FY23 음수 OPM 자동 표현
        },
      ],
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            title: (items) => {
              const fy = items[0].label;
              const row = rows[items[0].dataIndex];
              const phase = row.cyclePhase ? ` · ${row.cyclePhase}` : '';
              return `${fy}${phase}${isEstimate[items[0].dataIndex] ? ' (추정)' : ''}`;
            },
            label: (item) => {
              const row = rows[item.dataIndex];
              if (item.dataset.label.includes('OPM')) return `OPM ${item.parsed.y}%`;
              if (item.dataset.label.includes('매출')) {
                const range = row.revenueRangeLow ? ` (range ${row.revenueRangeLow}~${row.revenueRangeHigh}조)` : '';
                return `매출 ${item.parsed.y}조원${range}`;
              }
              if (item.dataset.label.includes('영업이익')) {
                const range = row.opRangeLow ? ` (range ${row.opRangeLow}~${row.opRangeHigh}조)` : '';
                return `OP ${item.parsed.y}조원${range}`;
              }
              return `${item.dataset.label} ${item.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          ...defaults.scales.x,
          grid: { display: false },
          ticks: {
            ...defaults.scales.x.ticks,
            color: (ctx) => (isEstimate[ctx.index] ? TOKENS.viz[2] : TOKENS.text.tertiary),
            font: (ctx) => ({
              size: 11,
              weight: isEstimate[ctx.index] ? 600 : 500,
            }),
          },
        },
        y: {
          ...defaults.scales.y,
          position: 'left',
          title: {
            display: true,
            text: '조원 (KRW trillion)',
            color: TOKENS.text.tertiary,
            font: { size: 11, weight: 500 },
          },
          ticks: {
            ...defaults.scales.y.ticks,
            callback: (v) => `${v}조`,
          },
        },
        y1: {
          type: 'linear',
          position: 'right',
          min: -30,
          max: 80,
          grid: { display: false },
          ticks: {
            color: TOKENS.viz[2],
            font: { size: 11, weight: 500 },
            callback: (v) => `${v}%`,
          },
          title: {
            display: true,
            text: 'OPM',
            color: TOKENS.viz[2],
            font: { size: 11, weight: 600 },
          },
        },
      },
    },
  });

  registerChart(canvasId, chart);
  observeResize(canvas.parentElement, chart);
  return chart;
}
