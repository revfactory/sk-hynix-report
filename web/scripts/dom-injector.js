// =====================================================================
// dom-injector.js — data.json을 받아 DOM에 텍스트/카드/리스트 주입
// =====================================================================

import { loadData } from './data-loader.js';

const KRW = (n) => n.toLocaleString('ko-KR');
const USD = (n) => `$${n.toLocaleString('en-US')}`;
const PCT = (n, signed = false) => {
  const sign = n > 0 ? '+' : '';
  return `${signed ? sign : (n < 0 ? '' : '')}${n.toFixed(2)}%`;
};

const escapeHTML = (str) => String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

// ---------- Strengths / Concerns ----------
function renderSummaryCards(data) {
  const strengthsGrid = document.getElementById('strengths-grid');
  const concernsGrid = document.getElementById('concerns-grid');
  if (!strengthsGrid || !concernsGrid || !data.strengths || !data.concerns) return;

  const iconMap = {
    'trending-up': `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>`,
    'trophy': `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>`,
    'shield-check': `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
    'alert-triangle': `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    'thermometer': `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>`,
    'git-fork': `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 01-2 2H8a2 2 0 01-2-2V9M12 12v3"/></svg>`,
  };

  const renderCard = (item, theme, idx) => {
    const chipVariant = theme === 'strength' ? 'bull' : 'warning';
    const evidence = (item.evidence || []).map(ev =>
      `<li><span class="chip" data-variant="${chipVariant}">${escapeHTML(ev)}</span></li>`
    ).join('');
    const icon = iconMap[item.icon] || iconMap['alert-triangle'];

    return `
      <article class="summary-card" data-theme="${theme}">
        <header class="summary-card__head">
          <span class="summary-card__icon" aria-hidden="true">${icon}</span>
          <span class="caption">${theme === 'strength' ? 'STRENGTH' : 'CONCERN'} #${idx + 1}</span>
        </header>
        <div class="summary-card__metric metric-lg mono">${escapeHTML(item.metric || '')}</div>
        <h4 class="summary-card__title">${escapeHTML(item.title)}</h4>
        <p class="summary-card__body">${escapeHTML(item.body)}</p>
        <ul class="summary-card__evidence">${evidence}</ul>
      </article>
    `;
  };

  strengthsGrid.innerHTML = data.strengths.map((s, i) => renderCard(s, 'strength', i)).join('');
  concernsGrid.innerHTML = data.concerns.map((c, i) => renderCard(c, 'concern', i)).join('');
}

// ---------- Verdict Dimensions ----------
function renderVerdictDimensions(data) {
  const list = document.querySelector('.verdict-dial__dimensions');
  if (!list || !data.verdict?.dimensions) return;

  list.innerHTML = data.verdict.dimensions.map(d => {
    const dots = [1, 2, 3, 4, 5].map(n =>
      `<span class="dimension-row__dot ${n <= d.score ? 'is-on' : ''}"></span>`
    ).join('');
    return `
      <li class="dimension-row" title="${escapeHTML(d.note || '')}">
        <span class="dimension-row__label">${escapeHTML(d.label)}</span>
        <span class="dimension-row__score" aria-label="${d.score} out of 5">${dots}</span>
      </li>
    `;
  }).join('');
}

// ---------- Scenarios ----------
let _activeScenario = 'base';

function renderScenarioCard(scenario) {
  const stage = document.getElementById('scenario-stage');
  if (!stage || !scenario) return;
  const probabilityText = `${scenario.probability[0]}~${scenario.probability[1]}%`;
  const priceText = `${KRW(scenario.priceRange[0])} ~ ${KRW(scenario.priceRange[1])}`;
  const vsRange = scenario.currentVsRangePct
    ? `현재 대비 ${scenario.currentVsRangePct[0]}% ~ ${scenario.currentVsRangePct[1]> 0 ? '+' : ''}${scenario.currentVsRangePct[1]}%`
    : '';
  const triggers = (scenario.triggers || []).map(t =>
    `<li>${escapeHTML(t)}</li>`
  ).join('');

  stage.innerHTML = `
    <article class="scenario-card" data-scenario="${scenario.key}" data-active="true" id="scenario-${scenario.key}" role="tabpanel">
      <header class="scenario-card__head">
        <span class="overline">SCENARIO · ${scenario.label.toUpperCase()}</span>
        <span class="metric mono">${probabilityText}</span>
      </header>
      <h3 class="scenario-card__title">${escapeHTML(scenario.title)}</h3>
      <div class="scenario-card__range">
        <span class="metric-lg mono">${priceText}</span>
        <span class="caption">${escapeHTML(vsRange)}</span>
      </div>
      <div class="scenario-card__triggers">
        <h4>핵심 트리거</h4>
        <ul>${triggers}</ul>
      </div>
      <p class="scenario-card__rationale">${escapeHTML(scenario.rationale || '')}</p>
    </article>
  `;
}

function bindScenarioToggle(data) {
  const buttons = document.querySelectorAll('.scenario-toggle__pill');
  if (!buttons.length || !data.scenarios) return;

  // 초기 render: base
  renderScenarioCard(data.scenarios.base);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.scenario;
      if (!key || _activeScenario === key) return;
      _activeScenario = key;
      buttons.forEach(b => {
        const active = b.dataset.scenario === key;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const sc = data.scenarios[key];
      if (sc) {
        renderScenarioCard(sc);
        window.dispatchEvent(new CustomEvent('skh:scenario-change', { detail: { key, scenario: sc } }));
      }
    });
    // Keyboard arrow nav
    btn.addEventListener('keydown', (e) => {
      const order = ['bear', 'base', 'bull'];
      const cur = order.indexOf(btn.dataset.scenario);
      let next = null;
      if (e.key === 'ArrowRight') next = order[(cur + 1) % order.length];
      else if (e.key === 'ArrowLeft') next = order[(cur - 1 + order.length) % order.length];
      if (next) {
        e.preventDefault();
        const nextBtn = document.querySelector(`.scenario-toggle__pill[data-scenario="${next}"]`);
        nextBtn?.click();
        nextBtn?.focus();
      }
    });
  });
}

// ---------- Timeline ----------
function renderTimeline(data) {
  const ol = document.getElementById('timeline');
  if (!ol || !data.events90d) return;

  const items = data.events90d.map(ev => {
    const dateLabel = ev.date;
    return `
      <li class="timeline-event" data-impact="${ev.impact}">
        <span class="timeline-event__node" aria-hidden="true"></span>
        <header class="timeline-event__head">
          <time class="timeline-event__date" datetime="${ev.date}">${dateLabel}</time>
          <span class="chip" data-variant="${ev.impact === 'positive' ? 'bull' : ev.impact === 'negative' ? 'bear' : 'neutral'}">${escapeHTML(ev.category)}</span>
        </header>
        <h4 class="timeline-event__title">${escapeHTML(ev.title)}</h4>
        <p class="timeline-event__summary">${escapeHTML(ev.summary || '')}</p>
      </li>
    `;
  }).join('');

  ol.innerHTML = items;
}

// ---------- Catalysts ----------
function renderCatalysts(data) {
  const posUl = document.getElementById('catalysts-positive');
  const negUl = document.getElementById('catalysts-negative');
  if (!data.catalysts) return;
  if (posUl) posUl.innerHTML = data.catalysts.positive.map(c => `<li>${escapeHTML(c)}</li>`).join('');
  if (negUl) negUl.innerHTML = data.catalysts.negative.map(c => `<li>${escapeHTML(c)}</li>`).join('');
}

// ---------- Sources ----------
function renderSources(data) {
  const grid = document.getElementById('sources-grid');
  if (!grid || !data.sources) return;
  grid.innerHTML = data.sources.map(s => `
    <a class="source-link" href="${encodeURI(s.url)}" target="_blank" rel="noopener noreferrer">
      <span class="chip" data-variant="info">${escapeHTML(s.category)}</span>
      <span class="source-link__label">${escapeHTML(s.label)}</span>
      <span class="source-link__date">${escapeHTML(s.date)}</span>
    </a>
  `).join('');

  // Pillar 내 inline source 표시 (categoryDB grouping)
  document.querySelectorAll('.pillar__sources[data-sources-category]').forEach(el => {
    const cat = el.dataset.sourcesCategory;
    const sub = data.sources.filter(s => s.category === cat).slice(0, 4);
    if (!sub.length) return;
    const caption = el.querySelector('.caption');
    const captionHTML = caption ? caption.outerHTML : '<span class="caption">출처</span>';
    el.innerHTML = captionHTML + sub.map(s => `
      <a class="source-link" href="${encodeURI(s.url)}" target="_blank" rel="noopener noreferrer">
        <span class="chip" data-variant="info">${escapeHTML(s.category)}</span>
        <span class="source-link__label">${escapeHTML(s.label)}</span>
        <span class="source-link__date">${escapeHTML(s.date)}</span>
      </a>
    `).join('');
  });
}

// ---------- Caveats ----------
function renderCaveats(data) {
  const ul = document.getElementById('caveats-list');
  if (!ul || !data.caveats) return;
  ul.innerHTML = data.caveats.map(c => `
    <li data-category="${escapeHTML(c.category)}">
      <span class="caveats-list__cat">${escapeHTML(c.category)}</span>
      <p class="caveats-list__body">${escapeHTML(c.body)}</p>
    </li>
  `).join('');
}

// ---------- Live price (header) ----------
function renderLivePrice(data) {
  const priceEl = document.querySelector('[data-live-price]');
  const deltaEl = document.querySelector('[data-live-delta]');
  if (!data.snapshot) return;
  if (priceEl) priceEl.textContent = KRW(data.snapshot.price);
  if (deltaEl) {
    const pct = data.snapshot.changePct;
    deltaEl.textContent = `${pct < 0 ? '▾' : '▴'} ${Math.abs(pct).toFixed(2)}%`;
    deltaEl.setAttribute('data-variant', pct < 0 ? 'bear' : 'bull');
  }
}

// ---------- A11y table (chart-priceHistory) ----------
function renderA11yTables(data) {
  const t1 = document.getElementById('a11y-table-priceHistory');
  if (t1 && data.priceHistory?.series) {
    const rows = data.priceHistory.series.map(p =>
      `<tr><td>${p.date}</td><td class="mono">${KRW(p.close)}원</td><td>${escapeHTML(p.milestone || '')}</td></tr>`
    ).join('');
    t1.innerHTML = `<table><thead><tr><th>날짜</th><th>종가</th><th>마일스톤</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  const t2 = document.getElementById('a11y-table-revenueTrend');
  if (t2 && data.revenueByYear) {
    const rows = data.revenueByYear.map(r =>
      `<tr><td>${r.fy}</td><td class="mono">${r.revenue ?? '—'}</td><td class="mono">${r.op ?? '—'}</td><td class="mono">${r.opm ?? '—'}%</td><td>${escapeHTML(r.cyclePhase)}</td></tr>`
    ).join('');
    t2.innerHTML = `<table><thead><tr><th>FY</th><th>매출(조)</th><th>OP(조)</th><th>OPM</th><th>사이클</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
}

// ---------- Main pipeline ----------
async function init() {
  try {
    const data = await loadData();
    renderLivePrice(data);
    renderVerdictDimensions(data);
    renderSummaryCards(data);
    bindScenarioToggle(data);
    renderTimeline(data);
    renderCatalysts(data);
    renderSources(data);
    renderCaveats(data);
    renderA11yTables(data);

    // Stagger 그룹들 재관찰 (새로 주입된 요소 포함)
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('skh:dom-injected'));
    });
  } catch (e) {
    console.error('[dom-injector] inject failed', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
