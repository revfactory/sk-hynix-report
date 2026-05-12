// nvidia-supply.js — NVIDIA·AMD·Google·AWS HBM 공급 매트릭스 (ECharts heatmap)
// 데이터: data.nvidiaSupplyMatrix
// 컨테이너: <div id="chart-nvidia-supply"></div>  (ECharts는 div 마운트)
// 값: 0=미공급, 1=일부, 2=보조, 3=주력 — heat 토큰 0~5 단계 매핑

import { TOKENS, makeEChartsTheme, registerChart, observeResize, prefersReducedMotion } from './_chart-utils.js';

const VALUE_LABELS = ['미공급', '일부 (<20%)', '보조 (20~40%)', '주력 (~70%+)'];

export function initNvidiaSupply(data, { containerId = 'chart-nvidia-supply' } = {}) {
  const el = document.getElementById(containerId);
  if (!el) {
    console.warn(`[nvidia-supply] container #${containerId} not found`);
    return null;
  }
  if (typeof echarts === 'undefined') {
    console.warn('[nvidia-supply] ECharts not loaded');
    return null;
  }

  const matrix = data.nvidiaSupplyMatrix;
  const products = matrix.rows.map((r) => r.product);
  const vendors = matrix.vendors; // ["SK하이닉스", "삼성전자", "마이크론"]
  const vendorKeys = ['sk', 'samsung', 'micron'];

  // 데이터: [vendorIndex, productIndex, value]
  const seriesData = [];
  matrix.rows.forEach((row, prodIdx) => {
    vendorKeys.forEach((vKey, vIdx) => {
      const val = row.values[vKey];
      seriesData.push({
        value: [vIdx, prodIdx, val],
        hbm: row.hbm,
        product: row.product,
        vendor: vendors[vIdx],
        note: row.note,
      });
    });
  });

  // GPU별 HBM 용량 룩업
  const capacityMap = {};
  (matrix.gpuHBMCapacityGB || []).forEach((c) => {
    capacityMap[c.gpu] = c.hbm_GB;
  });

  const chart = echarts.init(el, null, { renderer: 'canvas' });

  const option = {
    ...makeEChartsTheme(),
    grid: {
      left: 160,
      right: 80,
      top: 30,
      bottom: 60,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: vendors,
      position: 'top',
      axisLine: { lineStyle: { color: TOKENS.border.subtle } },
      axisTick: { show: false },
      axisLabel: {
        color: TOKENS.text.secondary,
        fontSize: 12,
        fontWeight: 600,
        formatter: (val) => {
          const key = vendorKeys[vendors.indexOf(val)];
          const color = TOKENS.company[key];
          return `{${key}|${val}}`;
        },
        rich: {
          sk: { color: TOKENS.company.sk, fontWeight: 700 },
          samsung: { color: TOKENS.company.samsung, fontWeight: 700 },
          micron: { color: TOKENS.company.micron, fontWeight: 700 },
        },
      },
    },
    yAxis: {
      type: 'category',
      data: products,
      inverse: true,
      axisLine: { lineStyle: { color: TOKENS.border.subtle } },
      axisTick: { show: false },
      axisLabel: {
        color: TOKENS.text.secondary,
        fontSize: 11,
        width: 150,
        overflow: 'truncate',
      },
    },
    visualMap: {
      type: 'piecewise',
      min: 0,
      max: 3,
      pieces: [
        { value: 0, label: '미공급', color: TOKENS.heat[0] },
        { value: 1, label: '일부', color: TOKENS.heat[2] },
        { value: 2, label: '보조', color: TOKENS.heat[3] },
        { value: 3, label: '주력', color: TOKENS.heat[5] },
      ],
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      textStyle: { color: TOKENS.text.tertiary, fontSize: 11 },
      itemWidth: 16,
      itemHeight: 12,
      itemGap: 12,
    },
    tooltip: {
      ...makeEChartsTheme().tooltip,
      formatter: (params) => {
        const d = params.data;
        const val = d.value[2];
        const valLabel = VALUE_LABELS[val] || '-';
        const valColor = val === 3 ? TOKENS.heat[5] : val === 2 ? TOKENS.heat[3] : val === 1 ? TOKENS.heat[2] : TOKENS.text.muted;
        const gpuKey = d.product.replace(/.*\((.*?)\).*/, '$1');
        const capacity = capacityMap[d.product.split(' ')[1]] || capacityMap[gpuKey] || '';
        return `
          <div style="font-weight:600;color:${TOKENS.text.primary};margin-bottom:6px">${d.product}</div>
          <div style="color:${TOKENS.text.secondary};font-size:11px;margin-bottom:8px">HBM: ${d.hbm}${capacity ? ` · ${capacity}GB` : ''}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="width:10px;height:10px;border-radius:2px;background:${valColor};display:inline-block"></span>
            <span style="font-weight:600;color:${valColor}">${d.vendor}: ${valLabel}</span>
          </div>
          ${d.note ? `<div style="color:${TOKENS.text.tertiary};font-size:11px;margin-top:4px;max-width:240px;white-space:normal">${d.note}</div>` : ''}
        `;
      },
    },
    series: [
      {
        type: 'heatmap',
        data: seriesData.map((d) => ({ ...d, value: d.value })),
        label: {
          show: true,
          formatter: (params) => {
            const v = params.data.value[2];
            return v === 0 ? '·' : v === 3 ? '★' : v;
          },
          color: TOKENS.text.primary,
          fontWeight: 700,
          fontSize: 13,
        },
        itemStyle: {
          borderColor: TOKENS.bg.glass,
          borderWidth: 2,
          borderRadius: 4,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(6,182,212,0.6)',
            borderColor: TOKENS.text.primary,
            borderWidth: 2,
          },
          label: { fontSize: 15 },
        },
        animationDuration: prefersReducedMotion ? 0 : 800,
        animationEasing: 'cubicOut',
        animationDelay: (idx) => (prefersReducedMotion ? 0 : idx * 18),
      },
    ],
  };

  chart.setOption(option);

  registerChart(containerId, chart);
  observeResize(el, chart);

  // 클릭 이벤트 (셀 강조 + custom event)
  chart.on('click', (params) => {
    const detail = {
      product: params.data.product,
      vendor: params.data.vendor,
      hbm: params.data.hbm,
      value: params.data.value[2],
      note: params.data.note,
    };
    el.dispatchEvent(new CustomEvent('nvidia-cell-click', { detail, bubbles: true }));
  });

  return chart;
}
