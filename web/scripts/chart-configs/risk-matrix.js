// risk-matrix.js — 영향력 × 가능성 리스크 매트릭스 (ECharts 3x3 heatmap)
// 데이터: data.riskMatrix.items + axes
// 컨테이너: <div id="chart-risk-matrix"></div>
// 셀 안: 해당 셀에 속한 리스크 ID 점들 (scatter overlay) + Top 7은 글로우

import { TOKENS, makeEChartsTheme, registerChart, observeResize, prefersReducedMotion } from './_chart-utils.js';

const AXIS_INDEX = { low: 0, mid: 1, high: 2 };
const AXIS_LABEL = ['낮음', '중간', '높음'];

export function initRiskMatrix(data, { containerId = 'chart-risk-matrix' } = {}) {
  const el = document.getElementById(containerId);
  if (!el) {
    console.warn(`[risk-matrix] container #${containerId} not found`);
    return null;
  }
  if (typeof echarts === 'undefined') {
    console.warn('[risk-matrix] ECharts not loaded');
    return null;
  }

  const items = data.riskMatrix.items;

  // 3x3 heatmap 데이터: [likelihood, impact, riskTier]
  // riskTier: low=1, mid=2, high=3
  const TIER_VAL = { low: 1, mid: 2, high: 3 };
  const cellMap = {}; // "L,I" -> { tier, items: [...] }
  items.forEach((it) => {
    const lx = AXIS_INDEX[it.likelihood];
    const ly = AXIS_INDEX[it.impact];
    const key = `${lx},${ly}`;
    if (!cellMap[key]) cellMap[key] = { likelihood: lx, impact: ly, items: [] };
    cellMap[key].items.push(it);
  });

  // heatmap 셀 데이터: 각 셀의 색은 colorTier (impact × likelihood 정량 합성)
  // tier 결정: items 중 가장 높은 color 등급
  const heatmapData = [];
  for (let lx = 0; lx < 3; lx++) {
    for (let ly = 0; ly < 3; ly++) {
      const key = `${lx},${ly}`;
      const cell = cellMap[key];
      if (cell) {
        const maxTier = Math.max(...cell.items.map((i) => TIER_VAL[i.color]));
        heatmapData.push({ value: [lx, ly, maxTier], cellItems: cell.items });
      } else {
        // 빈 셀: low (계산 기반)
        const impactVal = ly; // 0~2
        const likeVal = lx;
        let impliedTier = 1;
        if (impactVal >= 2 || likeVal >= 2) impliedTier = 2;
        if (impactVal >= 2 && likeVal >= 2) impliedTier = 3;
        heatmapData.push({ value: [lx, ly, impliedTier], cellItems: [], empty: true });
      }
    }
  }

  // scatter overlay: 각 item을 셀 내부에 jitter 배치
  const scatterData = [];
  items.forEach((it) => {
    const lx = AXIS_INDEX[it.likelihood];
    const ly = AXIS_INDEX[it.impact];
    // jitter — 같은 셀에서 점 겹치지 않게
    const key = `${lx},${ly}`;
    const sameCellItems = cellMap[key].items;
    const idx = sameCellItems.indexOf(it);
    const count = sameCellItems.length;
    // 셀 내부 (1x1 정사각 가정) 분포
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const offsetX = ((col + 0.5) / cols - 0.5) * 0.7;
    const offsetY = ((row + 0.5) / rows - 0.5) * 0.7;
    scatterData.push({
      value: [lx + offsetX, ly + offsetY],
      id: it.id,
      label: it.label,
      category: it.category,
      isTop: it.isTop,
      color: it.color,
      summary: it.summary,
    });
  });

  const chart = echarts.init(el, null, { renderer: 'canvas' });

  const option = {
    ...makeEChartsTheme(),
    grid: {
      left: 80,
      right: 60,
      top: 50,
      bottom: 80,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: AXIS_LABEL,
      name: '발생 가능성 →',
      nameLocation: 'middle',
      nameGap: 36,
      nameTextStyle: { color: TOKENS.text.secondary, fontSize: 12, fontWeight: 600 },
      axisLine: { lineStyle: { color: TOKENS.border.subtle } },
      axisTick: { show: false },
      axisLabel: { color: TOKENS.text.secondary, fontSize: 12, fontWeight: 500 },
      splitArea: { show: false },
    },
    yAxis: {
      type: 'category',
      data: AXIS_LABEL,
      name: '영향력 →',
      nameLocation: 'middle',
      nameGap: 48,
      nameRotate: 90,
      nameTextStyle: { color: TOKENS.text.secondary, fontSize: 12, fontWeight: 600 },
      axisLine: { lineStyle: { color: TOKENS.border.subtle } },
      axisTick: { show: false },
      axisLabel: { color: TOKENS.text.secondary, fontSize: 12, fontWeight: 500 },
      splitArea: { show: false },
    },
    tooltip: {
      ...makeEChartsTheme().tooltip,
      formatter: (params) => {
        if (params.seriesType === 'scatter') {
          const d = params.data;
          const c = d.color === 'high' ? TOKENS.risk.high : d.color === 'mid' ? TOKENS.risk.mid : TOKENS.risk.low;
          return `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="background:${c};color:#fff;font-weight:700;font-size:10px;padding:2px 6px;border-radius:4px">${d.id}</span>
              <span style="font-weight:600;color:${TOKENS.text.primary}">${d.label}</span>
              ${d.isTop ? `<span style="background:rgba(245,158,11,0.2);color:${TOKENS.state.warning};font-size:10px;padding:2px 6px;border-radius:4px">TOP</span>` : ''}
            </div>
            <div style="color:${TOKENS.text.tertiary};font-size:11px;margin-bottom:4px">${d.category}</div>
            <div style="color:${TOKENS.text.secondary};font-size:11px;max-width:260px;white-space:normal;line-height:1.45">${d.summary}</div>
          `;
        }
        // heatmap cell
        const d = params.data;
        if (!d.cellItems || d.cellItems.length === 0) {
          return `<div style="color:${TOKENS.text.tertiary};font-size:11px">해당 영역 리스크 없음</div>`;
        }
        const itemList = d.cellItems
          .map((i) => {
            const c = i.color === 'high' ? TOKENS.risk.high : i.color === 'mid' ? TOKENS.risk.mid : TOKENS.risk.low;
            return `<li style="margin-bottom:3px"><span style="background:${c};color:#fff;font-weight:700;font-size:10px;padding:1px 5px;border-radius:3px;margin-right:6px">${i.id}</span>${i.label}</li>`;
          })
          .join('');
        return `<div style="font-weight:600;color:${TOKENS.text.primary};margin-bottom:6px">${d.cellItems.length}개 리스크</div><ul style="margin:0;padding-left:0;list-style:none;font-size:11px;color:${TOKENS.text.secondary}">${itemList}</ul>`;
      },
    },
    visualMap: {
      show: false,
      min: 1,
      max: 3,
      inRange: {
        color: [
          'rgba(16,185,129,0.18)',
          'rgba(245,158,11,0.24)',
          'rgba(239,68,68,0.32)',
        ],
      },
    },
    series: [
      {
        name: 'cells',
        type: 'heatmap',
        data: heatmapData,
        label: { show: false },
        itemStyle: {
          borderColor: TOKENS.border.default,
          borderWidth: 1.5,
          borderRadius: 8,
        },
        emphasis: {
          itemStyle: { borderColor: TOKENS.text.primary, borderWidth: 2 },
        },
        animationDuration: prefersReducedMotion ? 0 : 600,
        animationDelay: (idx) => (prefersReducedMotion ? 0 : idx * 30),
        z: 1,
      },
      {
        name: 'risks',
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        data: scatterData,
        symbolSize: (val, params) => (params.data.isTop ? 32 : 22),
        symbol: 'circle',
        itemStyle: {
          color: (params) => {
            const c = params.data.color;
            return c === 'high' ? TOKENS.risk.high : c === 'mid' ? TOKENS.risk.mid : TOKENS.risk.low;
          },
          borderColor: (params) => (params.data.isTop ? TOKENS.text.primary : 'rgba(255,255,255,0.4)'),
          borderWidth: (params) => (params.data.isTop ? 2 : 1),
          shadowBlur: (params) => (params.data.isTop ? 16 : 0),
          shadowColor: (params) => {
            const c = params.data.color;
            const base = c === 'high' ? TOKENS.risk.high : c === 'mid' ? TOKENS.risk.mid : TOKENS.risk.low;
            return params.data.isTop ? base : 'transparent';
          },
        },
        label: {
          show: true,
          formatter: (params) => params.data.id,
          color: TOKENS.text.primary,
          fontWeight: 700,
          fontSize: 11,
        },
        emphasis: {
          scale: 1.3,
          itemStyle: { shadowBlur: 24 },
          label: { fontSize: 13 },
        },
        animationDelay: (idx) => (prefersReducedMotion ? 0 : 500 + idx * 40),
        z: 2,
      },
    ],
  };

  chart.setOption(option);

  registerChart(containerId, chart);
  observeResize(el, chart);

  // 클릭 시 detail event
  chart.on('click', (params) => {
    if (params.seriesType === 'scatter') {
      el.dispatchEvent(new CustomEvent('risk-item-click', { detail: params.data, bubbles: true }));
    } else if (params.seriesType === 'heatmap' && params.data.cellItems) {
      el.dispatchEvent(new CustomEvent('risk-cell-click', { detail: params.data, bubbles: true }));
    }
  });

  return chart;
}
