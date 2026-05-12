// consensus.js — 컨센서스 분포 (Chart.js horizontal scatter dot)
// 데이터: data.consensus.targets + min/max/avg + currentPrice
// 컨테이너: <canvas id="chart-consensus">
// X축: 목표가(KRW), Y축: 증권사 — Buy/Hold/Sell 색 + 현재가·평균 수직선
// BNK 다운그레이드 점 강조

import { TOKENS, fmt, makeChartJSDefaults, registerChart, observeResize, ensureCanvas } from './_chart-utils.js';

export function initConsensus(data, { canvasId = 'chart-consensus' } = {}) {
  const canvas = ensureCanvas(canvasId);
  if (!canvas) {
    console.warn(`[consensus] container #${canvasId} not found`);
    return null;
  }
  if (typeof Chart === 'undefined') {
    console.warn('[consensus] Chart.js not loaded');
    return null;
  }

  const targets = data.consensus.targets;
  const avg = data.consensus.average;
  const current = data.snapshot.price;
  const minVal = data.consensus.min;
  const maxVal = data.consensus.max;

  // 정렬: 목표가 내림차순 (높은 TP가 위로)
  const sorted = [...targets].sort((a, b) => b.tp - a.tp);
  const labels = sorted.map((t) => t.firm);

  // 점 컬러: Buy=bull, Hold=warning, Sell=bear, OW=info
  const colorByOpinion = (op) => {
    if (op === 'Buy') return TOKENS.state.bull;
    if (op === 'Hold') return TOKENS.state.warning;
    if (op === 'Sell') return TOKENS.state.bear;
    if (op === 'OW') return TOKENS.state.info;
    return TOKENS.text.tertiary;
  };

  const pointColors = sorted.map((t) => colorByOpinion(t.opinion));
  // BNK Hold = 다운그레이드 강조 (큰 점 + 보더)
  const pointRadius = sorted.map((t) => (t.firm.includes('BNK') ? 9 : 7));
  const pointBorderColors = sorted.map((t) => (t.firm.includes('BNK') ? TOKENS.text.primary : 'transparent'));
  const pointBorderWidths = sorted.map((t) => (t.firm.includes('BNK') ? 2 : 0));

  // 변경분(prevTp) 화살표/라인 표현 — 보조 dataset
  const previousPoints = sorted
    .map((t, i) => (t.prevTp ? { x: t.prevTp, y: i, firm: t.firm } : null))
    .filter(Boolean);

  const defaults = makeChartJSDefaults();

  const chart = new Chart(canvas, {
    type: 'scatter',
    data: {
      labels,
      datasets: [
        {
          label: '현재 목표가',
          data: sorted.map((t, i) => ({ x: t.tp, y: i, firm: t.firm, opinion: t.opinion, date: t.date, prevTp: t.prevTp, note: t.note })),
          backgroundColor: pointColors,
          borderColor: pointBorderColors,
          borderWidth: pointBorderWidths,
          pointRadius,
          pointHoverRadius: sorted.map((t) => (t.firm.includes('BNK') ? 12 : 10)),
          pointStyle: 'circle',
        },
        {
          label: '직전 목표가 (변경)',
          data: sorted.map((t, i) => (t.prevTp ? { x: t.prevTp, y: i, firm: t.firm } : null)).filter(Boolean),
          backgroundColor: 'transparent',
          borderColor: TOKENS.text.muted,
          borderWidth: 1.5,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointStyle: 'crossRot',
          showLine: false,
        },
      ],
    },
    options: {
      ...defaults,
      indexAxis: 'x',
      plugins: {
        ...defaults.plugins,
        legend: {
          ...defaults.plugins.legend,
          labels: {
            ...defaults.plugins.legend.labels,
            generateLabels: () => [
              { text: 'Buy', fillStyle: TOKENS.state.bull, strokeStyle: TOKENS.state.bull, pointStyle: 'circle', hidden: false },
              { text: 'Hold', fillStyle: TOKENS.state.warning, strokeStyle: TOKENS.state.warning, pointStyle: 'circle', hidden: false },
              { text: 'OW', fillStyle: TOKENS.state.info, strokeStyle: TOKENS.state.info, pointStyle: 'circle', hidden: false },
              { text: '직전 TP', fillStyle: 'transparent', strokeStyle: TOKENS.text.muted, pointStyle: 'crossRot', hidden: false },
            ],
          },
        },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            title: (items) => {
              const d = items[0].raw;
              return `${d.firm} · ${d.opinion || ''}`;
            },
            label: (item) => {
              const d = item.raw;
              const lines = [];
              if (item.datasetIndex === 0) {
                lines.push(`TP: ${fmt.krw(d.x)}`);
                if (d.prevTp) {
                  const diff = ((d.x - d.prevTp) / d.prevTp) * 100;
                  lines.push(`이전 TP: ${fmt.krw(d.prevTp)} (${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%)`);
                }
                lines.push(`일자: ${d.date || '-'}`);
                if (d.note) lines.push(d.note);
              } else {
                lines.push(`이전 TP: ${fmt.krw(d.x)}`);
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          min: Math.min(minVal, current) * 0.92,
          max: Math.max(maxVal, current) * 1.05,
          grid: { color: TOKENS.grid, borderDash: [2, 4] },
          ticks: {
            color: TOKENS.text.tertiary,
            font: { size: 11 },
            callback: (v) => `${(v / 10000).toFixed(0)}만`,
          },
          title: {
            display: true,
            text: '목표가 (원)',
            color: TOKENS.text.tertiary,
            font: { size: 11, weight: 500 },
          },
        },
        y: {
          type: 'linear',
          min: -0.5,
          max: sorted.length - 0.5,
          reverse: false,
          grid: { color: TOKENS.grid, borderDash: [2, 4] },
          ticks: {
            color: TOKENS.text.secondary,
            font: { size: 11, weight: 500 },
            stepSize: 1,
            callback: (v) => labels[v] || '',
          },
          afterFit: (axis) => {
            axis.width = 110;
          },
        },
      },
    },
    plugins: [
      // 현재가 + 평균 수직선
      {
        id: 'consensus-vlines',
        afterDatasetsDraw: (chart) => {
          const { ctx, chartArea, scales } = chart;
          const draw = (val, color, label, dashed = false) => {
            const x = scales.x.getPixelForValue(val);
            if (x < chartArea.left || x > chartArea.right) return;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            if (dashed) ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(x, chartArea.top);
            ctx.lineTo(x, chartArea.bottom);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = color;
            ctx.font = '600 11px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, chartArea.top - 4);
            ctx.restore();
          };
          draw(current, TOKENS.viz[2], `현재 ${(current / 10000).toFixed(0)}만`, false);
          draw(avg, TOKENS.viz[3], `평균 ${(avg / 10000).toFixed(0)}만`, true);
        },
      },
    ],
  });

  registerChart(canvasId, chart);
  observeResize(canvas.parentElement, chart);
  return chart;
}
