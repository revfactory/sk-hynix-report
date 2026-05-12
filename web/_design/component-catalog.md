# Component Catalog — SK하이닉스 분석 보고서 웹

**owner**: design-lead
**version**: 1.0.0
**updated**: 2026-05-12

후속 팀원(frontend / visualization / motion)이 직접 구현·확장할 컴포넌트 명세. 모든 컴포넌트는 `design-tokens.json` 토큰만 사용하고 임의 하드코딩 금지. 모든 props는 옵셔널 기본값을 가지되, 의미상 필수인 것은 `(required)`로 표기.

명명 규칙: PascalCase 컴포넌트. 데이터 속성은 `data-*`. 상태 클래스는 `is-*`(예: `is-active`).

---

## 0. Atoms (공용)

### 0-1. Token-aware Box
- 페이지 모든 영역은 글래스 배경, 보더, 라운드 6/10/14/20/28의 5단계만 사용.
- 임의 색·radius 추가 금지 — design-tokens.json만 참조.

### 0-2. Tag / Chip
```html
<span class="chip" data-variant="bull|bear|neutral|warning|info|accent">
  <svg class="chip__icon" />라벨
</span>
```
- variants: `bull` (state.bull / bullSoft), `bear`, `neutral`, `warning`, `info`, `accent` (gradient text)
- size: `sm` (caption) / `default` (body-sm)
- 사용처: Strength evidence, Concern evidence, Source 카테고리, Risk Top 7 마커

### 0-3. Icon (lucide)
- 스트로크 1.75, 사이즈 토큰 xs/sm/default/lg/xl
- 의미 매핑: trending-up(강점·상승) / alert-triangle(우려) / shield-check(재무) / git-fork(고객·구조) / thermometer(과열) / trophy(시장 1위) / calendar(이벤트) / external-link(출처) / info(주의) / chevron-down(accordion)

### 0-4. NumberFormatter (헬퍼)
- 보고서 원수치 1:1. 반올림·생략 금지.
- KRW: `1,861,000원` (천단위 콤마 + "원" suffix)
- KRW 조: `1,319조원`
- USD: `$819B` / `$670B`
- %: `+871%`, `-1.01%` (부호 명시)
- 모노 폰트 권장 (mono-sm or metric)

---

## 1. StickyHeader

```html
<header class="sticky-header" data-theme="dark">
  <a href="#hero" class="sticky-header__logo">
    <Logo /> <span>SK하이닉스 분석</span>
  </a>
  <nav class="sticky-header__nav">
    <a href="#summary">Summary</a>
    <a href="#pillars">분석</a>
    <a href="#scenarios">시나리오</a>
    <a href="#monitoring">모니터링</a>
    <a href="#appendix">부록</a>
  </nav>
  <div class="sticky-header__live">
    <span class="overline">LIVE</span>
    <span class="metric mono">1,861,000</span>
    <Chip variant="bear">▾ 1.01%</Chip>
  </div>
  <ThemeToggle />
  <button class="sticky-header__menu" aria-label="Open menu" />
</header>
<div class="scroll-progress" />
```

**props**
- `currentPrice: number` (required) — `data.snapshot.price`
- `changePct: number` (required) — `data.snapshot.changePct`
- `theme: 'dark' | 'light'` (default `dark`)
- `sections: { id, label }[]` (default 5개)
- `onThemeToggle: () => void`

**variants**: `default` / `compact` (스크롤 80vh 이후 collapse)
**states**: `is-stuck` (스크롤 시), `is-mobile-open`
**a11y**: `<header role="banner">`, nav `aria-label="섹션 내비게이션"`, theme toggle `aria-pressed`

---

## 2. HeroSection

```html
<section id="hero" class="hero">
  <div class="hero__bg" data-motion="webgl-mesh">
    <canvas class="hero__canvas" />
  </div>
  <div class="hero__inner container--wide">
    <span class="overline">ANALYSIS · 2026-05-12 · KST</span>
    <h1 class="display-1">
      <span>1년에</span>
      <span class="text-gradient">9.6배</span>.
      <span class="display-2">SK하이닉스, 슈퍼사이클 정점에서.</span>
    </h1>
    <p class="body-lg">OPM 72%, 시가총액 1,319조원. 그리고 5월 13일·6월·7월 29일의 분기점.</p>
    <div class="hero__metrics">
      <MetricCard ... />
      <MetricCard ... />
      <MetricCard ... />
    </div>
    <ScrollIndicator />
  </div>
</section>
```

**props**
- `headline: string` (required) — 메인 카피
- `keyword: string` — 그라데이션 강조어 (기본 "9.6배")
- `subhead: string`
- `lead: string`
- `metrics: MetricCardProps[]` (length 3, required)
- `webglEnabled: boolean` (default `true` — `prefers-reduced-motion`이면 false)

**variants**: `default` / `with-ticker` (라이브 시세 추가)
**모션**: webgl mesh (motion-designer 책임) + Hero reveal (clip-path bottom-up)

---

## 3. MetricCard

```html
<article class="metric-card" data-tone="bull|bear|neutral|warning|accent">
  <header class="metric-card__head">
    <Icon name="trending-up" size="sm" />
    <span class="overline">현재가</span>
  </header>
  <div class="metric-card__value">
    <span class="metric-lg mono">1,861,000</span>
    <span class="metric-card__unit">원</span>
  </div>
  <footer class="metric-card__delta">
    <Chip variant="bear">▾ 1.01%</Chip>
    <span class="caption">전일 종가 1,880,000원</span>
  </footer>
</article>
```

**props**
- `label: string` (required)
- `value: string | number` (required)
- `unit?: string`
- `delta?: { value: number; type: 'pct' | 'krw' | 'usd' }`
- `tone?: 'bull' | 'bear' | 'neutral' | 'warning' | 'accent'` (default `neutral`)
- `icon?: string`
- `note?: string`
- `size?: 'sm' | 'default' | 'lg'`

**variants**: 
- `default` — 강조 카드 (Hero, KPI)
- `inline` — 사이드 패널용 (작은 mono)
- `kpi` — 1Q26 헤드라인 4-up

**states**: `is-loading` (스켈레톤), `is-highlighted` (glow)
**hover**: translateY(-2px) + shadow-default → glow

---

## 4. SummaryCard (Strength / Concern)

```html
<article class="summary-card" data-theme="strength|concern">
  <header class="summary-card__head">
    <Icon name="trending-up" size="lg" />
    <span class="caption">STRENGTH #1</span>
  </header>
  <div class="summary-card__metric metric-lg mono">OPM 72%</div>
  <h3 class="summary-card__title">HBM 슈퍼사이클 정점의 마진 폭발</h3>
  <p class="summary-card__body">1Q26 매출 52.6조원·영업이익 37.6조원·영업이익률 72% — 분기 사상 최고.</p>
  <ul class="summary-card__evidence">
    <Chip variant="bull">1Q26 매출 +198% YoY</Chip>
    <Chip variant="bull">OP +405% YoY</Chip>
    <Chip variant="bull">DRAM ASP +63~65% QoQ</Chip>
    <Chip variant="bull">NAND ASP +75% QoQ</Chip>
  </ul>
</article>
```

**props**
- `theme: 'strength' | 'concern'` (required)
- `title: string` (required)
- `metric: string`
- `body: string` (required)
- `icon: string`
- `evidence: string[]` (max 4)
- `index?: number`

**variants**: `strength` (state.bull tone + glow-bull subtle), `concern` (warning tone + glow-amber)
**hover**: evidence chips stagger fade-in (이미 화면에 있으면 idle)

---

## 5. AnalysisSection (Pillar 래퍼)

```html
<section id="pillar-1" class="pillar" data-index="1">
  <header class="pillar__head">
    <span class="overline">PILLAR #1 · 시장 데이터</span>
    <h2 class="h1">1년에 9.6배. 그러나 컨센은 이미 도달.</h2>
    <p class="body-lg">한 줄 리드…</p>
  </header>
  <div class="pillar__body" data-layout="chart-right">
    <div class="pillar__text">
      <p class="body">본문 단락…</p>
      <ul class="pillar__takeaways">
        <li>핵심 1</li>
        <li>핵심 2</li>
      </ul>
      <div class="pillar__sources">
        <SourceLink ... />
      </div>
    </div>
    <div class="pillar__chart">
      <ChartContainer ... />
    </div>
  </div>
</section>
```

**props**
- `index: 1 | 2 | 3 | 4 | 5` (required) — 색·레이아웃 결정
- `eyebrow: string` (required)
- `title: string` (required)
- `lead: string` (required)
- `layout: 'chart-right' | 'chart-left' | 'chart-full'` (default index에 따라 자동: 1·3·5 chart-left, 2·4 chart-right)
- `takeaways: string[]` (3개 권장)
- `sources: SourceLinkProps[]`
- `children` — ChartContainer

**responsive**: lg 미만 모두 chart-full 세로 스택
**스크롤 모션**: 진입 시 head → body → chart 순서 stagger fade-up

---

## 6. ChartContainer

```html
<figure class="chart-container" data-chart-id="price-history">
  <figcaption class="chart-container__head">
    <h3 class="h3">1년 가격 추이</h3>
    <p class="caption">2025-05-12 ~ 2026-05-12 · Investing.com</p>
    <div class="chart-container__legend">
      <Chip variant="accent">SK하이닉스</Chip>
    </div>
    <div class="chart-container__controls">
      <button>MA20</button><button>MA50</button>
    </div>
  </figcaption>
  <div class="chart-container__canvas" style="min-height: var(--chart-min-default)">
    <!-- D3/Chart.js/ECharts 등 visualization-engineer 선택 -->
  </div>
  <div class="chart-container__tooltip" role="status" />
  <details class="chart-container__a11y">
    <summary>차트 데이터 표 (스크린 리더용)</summary>
    <table>…</table>
  </details>
</figure>
```

**props**
- `chartId: string` (required) — `priceHistory | revenueByYear | hbmDonut | nvidiaMatrix | consensusScatter | riskMatrix | scenarioFan`
- `title: string`, `subtitle?: string`
- `legend?: { label, color }[]`
- `controls?: ToggleProps[]` (시리즈 토글, 데이터셋 전환 등)
- `minHeight: 'compact' | 'default' | 'wide' | 'hero'`
- `data: any` (required) — `data.json`에서 직접
- `a11yTable: TableData` (required) — 시각 장애인용 fallback

**variants 모두 한 컨테이너로 핸들링**. visualization-engineer가 내부 렌더러를 7종 구현.
**모션**: 진입 시 draw-in. 토글 시 transition.

---

## 7. ScenarioCard

```html
<article class="scenario-card" data-scenario="base" data-active="true">
  <header class="scenario-card__head">
    <span class="overline">SCENARIO · BASE</span>
    <span class="metric mono">57.5%</span>
  </header>
  <h3 class="h2">분점 정착 + Soft Landing</h3>
  <div class="scenario-card__range">
    <span class="metric-lg mono">1,500,000 ~ 2,100,000</span>
    <span class="caption">현재가 대비 -19% ~ +13%</span>
  </div>
  <div class="scenario-card__triggers">
    <h4>핵심 트리거</h4>
    <ul>
      <li><Chip variant="info">SK 50%·삼성 30~35%·마이크론 15% 분점</Chip></li>
      …
    </ul>
  </div>
  <p class="scenario-card__rationale">펀더멘털·산업 강력하나…</p>
</article>
```

**props**
- `scenario: 'bear' | 'base' | 'bull'` (required)
- `probability: [number, number]` (required)
- `title: string` (required)
- `priceRange: [number, number]` (required)
- `currentVsRangePct: [number, number]`
- `triggers: string[]` (required)
- `rationale: string`
- `isActive: boolean` (toggle 상태)

**variants**: bear / base / bull — 각각 scenario.bear/base/bull 토큰 사용
**hover**: 비활성 카드 opacity 0.6, hover 시 1.0
**활성 모션**: cross-fade + scale 0.98→1.0

### 7-1. ScenarioToggle (그룹)
- 3-pill 토글, 활성 pill은 gradient bg + glow
- 키보드 ← → 로 전환, `role="tablist"`

---

## 8. TimelineEvent

```html
<li class="timeline-event" data-impact="negative|positive|neutral">
  <div class="timeline-event__node" />
  <time class="caption mono">2026-05-13</time>
  <h4 class="h4">美 하원 외교위 MATCH Act 심의</h4>
  <Chip variant="warning">policy · negative</Chip>
  <p class="body-sm">통과 여부 / HBM 카테고리 확대 모니터링</p>
</li>
```

**props**
- `date: string` (required, ISO)
- `title: string` (required)
- `category: string` (required)
- `impact: 'positive' | 'negative' | 'neutral'` (required)
- `summary: string`

**Timeline (래퍼)**:
- `orientation: 'horizontal' | 'vertical'` (lg+ horizontal, 그 외 vertical)
- 자동 sort by date
- 키보드 화살표로 이벤트 이동

---

## 9. Accordion

```html
<details class="accordion" name="appendix">
  <summary class="accordion__head">
    <Icon name="chevron-down" />
    <span class="h3">데이터 출처 (16개)</span>
    <span class="caption">전체 펼치기</span>
  </summary>
  <div class="accordion__body">…</div>
</details>
```

**props**
- `id: string` (required)
- `title: string` (required)
- `defaultOpen?: boolean` (default `false`)
- `meta?: string`
- `children`

**states**: `is-open`, `is-hovering`
**모션**: height auto with `interpolate-size: allow-keywords`, chevron rotate 180deg

---

## 10. SourceLink

```html
<a class="source-link" href="https://..." target="_blank" rel="noopener">
  <Chip variant="info">company</Chip>
  <span class="source-link__label">SK하이닉스 뉴스룸 1Q26 실적</span>
  <time class="caption mono">2026-04-23</time>
  <Icon name="external-link" size="xs" />
</a>
```

**props**
- `label: string` (required)
- `url: string` (required)
- `date: string`
- `category: 'company' | 'market' | 'industry' | 'policy' | 'consensus' | 'news' | 'tech' | 'filings'`

**variants**: `inline` (Pillar 하단 row) / `grid-card` (부록)
**hover**: underline + accent color shift

---

## 11. Disclaimer

```html
<aside class="disclaimer" role="note">
  <Icon name="info" />
  <p class="body-sm">본 보고서는 정보 제공을 목적으로 작성되었으며 투자 자문이 아닙니다.…</p>
</aside>
```

**props**
- `severity: 'info' | 'warning'` (default `info`)
- `body: string` (required)

**variants**: `inline` (footer), `banner` (Hero 상단 또는 부록 끝)

---

## 12. ThemeToggle

```html
<button class="theme-toggle" aria-pressed="false" aria-label="다크/라이트 모드 전환">
  <Icon name="sun" class="theme-toggle__sun" />
  <Icon name="moon" class="theme-toggle__moon" />
</button>
```

**props**
- `theme: 'dark' | 'light'` (required, controlled)
- `onChange: (theme) => void`

**모션**: cross-fade icons + 글로벌 색 전환 280ms standard
**상태 저장**: localStorage `theme`, OS `prefers-color-scheme` fallback

---

## 13. ScrollIndicator

```html
<div class="scroll-indicator" aria-hidden="true">
  <span class="caption">SCROLL</span>
  <span class="scroll-indicator__dot" />
</div>
```

**모션**: 2s bounce 루프 (motion-designer)
**조건**: Hero 안에서만 표시, 스크롤 시 fade-out

---

## 14. VerdictDial

```html
<div class="verdict-dial" data-rating="4">
  <span class="overline">VERDICT</span>
  <div class="verdict-dial__stars">★★★★☆</div>
  <span class="h3">Neutral-to-Bullish</span>
  <span class="caption">Cycle Peak 인식</span>
  <div class="verdict-dial__dimensions">
    <!-- 레이더: 펀더 5 / 산업 5 / 심리 4 / 밸류 4 / 기술 2 / 정책 2 -->
  </div>
</div>
```

**props**
- `rating: number` (1~5, required)
- `stance: string` (required)
- `note?: string`
- `dimensions: { label, score }[]` (옵셔널 — 레이더 차트)

---

## 15. ConsensusBar

```html
<div class="consensus-bar">
  <div class="consensus-bar__segment buy" style="--w:36">Buy 36</div>
  <div class="consensus-bar__segment hold" style="--w:1">Hold 1</div>
  <div class="consensus-bar__segment sell" style="--w:0">Sell 0</div>
  <div class="consensus-bar__price">현재가 1,861,000 · 평균 TP 1,817,130 (-2.36%)</div>
</div>
```

**props**
- `buy: number`, `hold: number`, `sell: number` (required)
- `currentPrice: number`, `avgTp: number`

---

## 16. 컴포넌트 우선순위 (frontend MVP)

P0 (필수, 첫 출시): StickyHeader, HeroSection, MetricCard, SummaryCard, AnalysisSection, ChartContainer, ScenarioCard + ScenarioToggle, TimelineEvent + Timeline, Accordion, SourceLink, Disclaimer, ThemeToggle, ScrollIndicator
P1 (강력 추천): VerdictDial, ConsensusBar
P2 (옵션): Tooltip pop-over (ChartContainer 내부), KeyboardHelp 모달

---

## 17. 시맨틱 마크업 가이드

| 영역 | 권장 태그 |
|---|---|
| Sticky header | `<header>` (page-level이 아니라 site-level), nav `<nav aria-label>` |
| Hero | `<section id="hero">`, 메인 텍스트는 `<h1>` |
| Pillar | `<section>` + 내부 `<h2>` |
| Chart | `<figure>` + `<figcaption>`, 데이터 표 `<details><table>` |
| Strength/Concern card | `<article>` |
| Scenario card | `<article>` (tab panel role도 함께) |
| Timeline | `<ol class="timeline">` (시간 순서가 의미 있음) |
| Accordion | `<details>` + `<summary>` (네이티브 + 진보적 향상) |
| Footer | `<footer role="contentinfo">` |

`<main>`은 Hero부터 Footer 직전까지 감싼다. 스킵 링크 1개 추가 (`<a href="#main">본문 바로가기</a>`).

---

## 18. 토큰 매핑 빠른 참조 (스타일링 시)

| 컴포넌트 영역 | 토큰 |
|---|---|
| 페이지 bg | `--bg-primary` |
| 카드 bg | `--bg-glass` + backdrop-filter blur var(--blur) |
| 카드 보더 | 1px solid `--border-default` |
| 카드 패딩 | `--space-6 --space-7` (sm) / `--space-8` (default) |
| 카드 radius | `--radius-lg` (20px) |
| 강조 텍스트 | gradient `--gradient-accent` text-fill |
| 차트 보조선 | `--chart-grid-lineColor` |
| 차트 시리즈 | `--viz-1 ~ viz-8` 순서 |
| 호버 transform | translateY(-2px) duration default |
| 호버 shadow | `--shadow-default` → `--shadow-glow-cyan` |
| 섹션 사이 여백 | `--space-section-y-md` |
