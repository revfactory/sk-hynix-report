// price-chart.js — 1Y 가격 추이 (Chart.js line + area gradient)
// 데이터: data.priceHistory.series + snapshot.high52w / low52w
// 컨테이너: <canvas id="chart-price">
// 마일스톤 마커 + 52주 신고가/저점 강조 + 추정치(estimate) 구간 점선 표시

import { TOKENS, fmt, makeChartJSDefaults, registerChart, observeResize, ensureCanvas } from './_chart-utils.js';

export function initPriceChart(data, { canvasId = 'chart-price', period = '1Y' } = {}) {
  const canvas = ensureCanvas(canvasId);
  if (!canvas) {
    console.warn(`[price-chart] container #${canvasId} not found`);
    return null;
  }
  if (typeof Chart === 'undefined') {
    console.warn('[price-chart] Chart.js not loaded');
    return null;
  }

  const series = data.priceHistory.series;
  const high52w = data.snapshot.high52w;
  const low52w = data.snapshot.low52w;

  // 기간 필터
  const now = new Date('2026-05-12');
  const periodMonths = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, 'YTD': null }[period] ?? 12;
  const filtered = series.filter((pt) => {
    const d = new Date(pt.date);
    if (period === 'YTD') return d.getFullYear() === 2026;
    const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return diffMonths <= periodMonths;
  });

  const labels = filtered.map((pt) => pt.date);
  const prices = filtered.map((pt) => pt.close);
  const milestones = filtered.map((pt) => pt.milestone || '');
  const isEstimate = filtered.map((pt) => (pt.milestone || '').includes('estimate'));

  // 영역 그라데이션 (gain/loss 색)
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 400);
  gradient.addColorStop(0, 'rgba(6,182,212,0.42)');
  gradient.addColorStop(0.6, 'rgba(6,182,212,0.10)');
  gradient.addColorStop(1, 'rgba(6,182,212,0.00)');

  // 마일스톤 마커 점 (큰 점) — 본문 확정 포인트 vs estimate 구분
  const pointRadius = filtered.map((pt) => {
    const m = (pt.milestone || '').toLowerCase();
    if (m.includes('보고서 확인') || m.includes('52주') || m.includes('신고가') || m.includes('실적') || m.includes('급등') || m.includes('다운그레이드') || m.includes('300만') || m.includes('확산') || m.includes('확산')) return 6;
    if (m.includes('estimate')) return 2.5;
    return 4;
  });
  const pointBgColors = filtered.map((pt) => {
    const m = (pt.milestone || '').toLowerCase();
    if (m.includes('신고가') || m.includes('급등')) return TOKENS.state.bull;
    if (m.includes('다운그레이드') || m.includes('조정') || m.includes('-1.01')) return TOKENS.state.bear;
    if (m.includes('52주 저점')) return TOKENS.state.bear;
    if (m.includes('estimate')) return TOKENS.text.muted;
    return TOKENS.viz[1];
  });
  const pointBorderColors = filtered.map((pt) => {
    const m = (pt.milestone || '').toLowerCase();
    if (m.includes('estimate')) return TOKENS.text.muted;
    return TOKENS.text.primary;
  });

  const defaults = makeChartJSDefaults();

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'SK하이닉스 종가',
          data: prices,
          borderColor: TOKENS.viz[1],
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.32,
          pointRadius,
          pointHoverRadius: 8,
          pointBackgroundColor: pointBgColors,
          pointBorderColor: pointBorderColors,
          pointBorderWidth: 1.5,
          // estimate 구간을 borderDash로 표시할 수 없어 라인은 전체 solid 유지,
          // 점 색·반경으로 confirmed vs estimate를 구분 (disclaimer에서 보충)
        },
      ],
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: { display: false },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            title: (items) => fmt.date(items[0].label),
            label: (item) => {
              const price = item.parsed.y;
              const ms = milestones[item.dataIndex];
              const est = isEstimate[item.dataIndex];
              const lines = [`${fmt.krw(price)}`];
              if (ms) {
                const cleaned = ms.replace(/^estimate;?\s*/, '').trim();
                if (cleaned) lines.push(cleaned);
              }
              if (est) lines.push('(추정치 · reasonable estimate)');
              return lines;
            },
          },
        },
        // 52주 고저 + 현재가 horizontal line (annotation 없이 afterDraw)
      },
      scales: {
        ...defaults.scales,
        x: {
          ...defaults.scales.x,
          ticks: {
            ...defaults.scales.x.ticks,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
            callback: function (val, idx) {
              const label = this.getLabelForValue(val);
              return fmt.monthYear(label);
            },
          },
        },
        y: {
          ...defaults.scales.y,
          ticks: {
            ...defaults.scales.y.ticks,
            callback: (v) => `${(v / 10000).toFixed(0)}만`,
          },
        },
      },
    },
    plugins: [
      // 52주 신고가/저점 horizontal line plugin (인라인)
      {
        id: 'price-reference-lines',
        afterDatasetsDraw: (chart) => {
          const { ctx, chartArea, scales } = chart;
          if (!scales.y) return;
          const drawLine = (val, color, label) => {
            const y = scales.y.getPixelForValue(val);
            if (y < chartArea.top || y > chartArea.bottom) return;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = color;
            ctx.font = '11px "JetBrains Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(label, chartArea.right - 6, y - 5);
            ctx.restore();
          };
          drawLine(high52w, TOKENS.state.bull, `52주 신고가 ${(high52w / 10000).toFixed(0)}만`);
          // low52w는 1Y 기간에서만 의미 — 너무 낮으면 생략
          if (low52w >= scales.y.min) {
            drawLine(low52w, TOKENS.state.bear, `52주 저점 ${(low52w / 10000).toFixed(0)}만`);
          }
        },
      },
    ],
  });

  registerChart(canvasId, chart);
  observeResize(canvas.parentElement, chart);

  // 기간 토글 버튼 (있으면 바인딩) — data-chart 또는 data-chart-id 컨테이너 검색
  const container = canvas.closest('[data-chart], [data-chart-id]');
  if (container) {
    const buttons = container.querySelectorAll('[data-period]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
        const newPeriod = btn.dataset.period;
        chart.destroy();
        initPriceChart(data, { canvasId, period: newPeriod });
      });
      if (btn.dataset.period === period) btn.classList.add('is-active');
    });
  }

  return chart;
}
