# Visualization Notes — SK하이닉스 분석 보고서 웹

**owner**: visualization-engineer
**version**: 1.0.0
**updated**: 2026-05-12

`data.json`을 단일 진실로 사용해 구현한 인터랙티브 차트 7종의 라이브러리·매핑·인터랙션 명세. web-qa의 검증 자료.

---

## 1. 사용 라이브러리

| 라이브러리 | 버전 | CDN | 사용 차트 | 비고 |
|---|---|---|---|---|
| Chart.js | v4 | `https://cdn.jsdelivr.net/npm/chart.js@4` | price, revenue-trend, hbm-share, consensus, scenarios | 표준 차트 (line/bar/donut/scatter) |
| Apache ECharts | v5 | `https://cdn.jsdelivr.net/npm/echarts@5` | nvidia-supply, risk-matrix | heatmap·복잡 인터랙션 |

원칙: 단일 사이트에 라이브러리 2개로 제한. D3는 사용하지 않음 (Chart.js로 fan/scatter 모두 표현 가능).

### HTML 로드 순서
```html
<head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5"></script>
</head>
<body>
  ...
  <script type="module" src="/web/scripts/charts.js"></script>
</body>
```

`charts.js`는 ESM 모듈이며 `DOMContentLoaded` 시 자동으로 `initAllCharts()` 실행.

---

## 2. 파일 구조

```
web/scripts/
├── charts.js                       # 통합 진입점 (ESM)
├── data-loader.js                  # data.json 로더 (캐시 + custom event)
└── chart-configs/
    ├── _chart-utils.js             # 토큰·포맷터·툴팁·Chart.js defaults·ECharts theme
    ├── price-chart.js              # #chart-price
    ├── revenue-trend.js            # #chart-revenue-trend
    ├── hbm-share.js                # #chart-hbm-share
    ├── nvidia-supply.js            # #chart-nvidia-supply
    ├── consensus.js                # #chart-consensus
    ├── scenarios.js                # #chart-scenarios
    └── risk-matrix.js              # #chart-risk-matrix
```

---

## 3. 컨테이너 명세 (frontend-engineer가 HTML에 마운트)

모든 차트는 `[data-chart]` 컨테이너 안에 위치해야 IntersectionObserver lazy init이 동작.

### 3-1. 가격 차트
```html
<figure class="chart-container" data-chart data-chart-id="price-history">
  <figcaption class="chart-container__head">
    <h3 class="h3">1년 가격 추이</h3>
    <p class="caption">2025-05-12 ~ 2026-05-12 · Investing.com · 보고서 보조자료</p>
    <div class="chart-container__controls" role="tablist">
      <button data-period="1M" type="button">1M</button>
      <button data-period="3M" type="button">3M</button>
      <button data-period="6M" type="button">6M</button>
      <button data-period="1Y" class="is-active" type="button">1Y</button>
      <button data-period="YTD" type="button">YTD</button>
    </div>
  </figcaption>
  <div class="chart-container__canvas" style="min-height: var(--chart-min-default, 320px)">
    <canvas id="chart-price"></canvas>
  </div>
  <p class="chart-container__disclaimer caption">
    ※ 일별 종가 시리즈는 보고서 미수록 — 본문 확정 마일스톤(큰 점)과 합리적 추정 구간(작은 회색 점)을 병기. 추정치는 reasonable estimate 명시.
  </p>
</figure>
```

### 3-2. 매출 트렌드
```html
<figure class="chart-container" data-chart data-chart-id="revenue-by-year">
  <figcaption class="chart-container__head">
    <h3 class="h3">5년 매출·영업이익·OPM 추이</h3>
    <p class="caption">FY21 ~ FY27E · 단위 조원 · OPM 보조축 · FY26E/FY27E 추정 (stripe)</p>
  </figcaption>
  <div class="chart-container__canvas" style="min-height: 420px">
    <canvas id="chart-revenue-trend"></canvas>
  </div>
</figure>
```

### 3-3. HBM 점유율 도넛
토글 selector는 `data-toggle-dataset` (값은 data.json의 `hbmShare2026` 하위 키 그대로).
```html
<figure class="chart-container" data-chart-id="hbmShare">
  <figcaption class="chart-container__head">
    <h3 class="h3">HBM 시장 점유율 2026</h3>
    <div class="chart-container__controls" role="tablist">
      <button data-toggle-dataset="bit_basis" class="is-active" role="tab" aria-selected="true">2026 bit (TrendForce)</button>
      <button data-toggle-dataset="revenue_basis" role="tab" aria-selected="false">2026 매출 (Counterpoint)</button>
      <button data-toggle-dataset="hbm4_forecast" role="tab" aria-selected="false">HBM4 (Counterpoint)</button>
      <button data-toggle-dataset="nvidiaHBM4Allocation" role="tab" aria-selected="false">NVIDIA Rubin</button>
    </div>
  </figcaption>
  <div class="chart-container__canvas" style="min-height: 360px">
    <!-- <canvas> 권장. <div>여도 hbm-share.js가 내부에 canvas 자동 생성 (ensureCanvas) -->
    <canvas id="chart-hbm-share"></canvas>
  </div>
</figure>
```

### 3-4. NVIDIA 공급 매트릭스
```html
<figure class="chart-container" data-chart data-chart-id="nvidia-supply">
  <figcaption class="chart-container__head">
    <h3 class="h3">AI 가속기 HBM 공급 매트릭스</h3>
    <p class="caption">NVIDIA · AMD · Google · AWS 9개 제품 × 3개 공급사</p>
  </figcaption>
  <div class="chart-container__canvas" style="min-height: 480px">
    <div id="chart-nvidia-supply" style="width: 100%; height: 480px"></div>
  </div>
</figure>
```

### 3-5. 컨센서스 분포
```html
<figure class="chart-container" data-chart data-chart-id="consensus">
  <figcaption class="chart-container__head">
    <h3 class="h3">증권사 컨센서스 분포</h3>
    <p class="caption">10개사 · 현재 1,861,000원 · 평균 1,817,130원 (-2.36%) · Buy 36 / Hold 1 / Sell 0</p>
  </figcaption>
  <div class="chart-container__canvas" style="min-height: 480px">
    <canvas id="chart-consensus"></canvas>
  </div>
</figure>
```

### 3-6. 시나리오
시나리오 토글(`[data-scenario]`)은 chart-container 바깥(섹션 상단)에 있어도 OK — `scenarios.js`가 가장 가까운 `<section>`/`<article>`/`<main>` 범위에서 탐색.
```html
<section id="scenarios-section" data-scenario-section>
  <div class="scenario-toggle" role="tablist">
    <button class="scenario-toggle__pill" data-scenario="bear" role="tab" aria-selected="false">Bear 22.5%</button>
    <button class="scenario-toggle__pill is-active" data-scenario="base" role="tab" aria-selected="true">Base 57.5%</button>
    <button class="scenario-toggle__pill" data-scenario="bull" role="tab" aria-selected="false">Bull 22.5%</button>
  </div>
  <figure class="chart-container" data-chart-id="scenarios">
    <figcaption class="chart-container__head"><h3 class="h3">12개월 가중 주가 시나리오 Fan</h3></figcaption>
    <div class="chart-container__canvas" style="min-height: var(--chart-h-wide)">
      <!-- <canvas> 권장. <div>여도 scenarios.js가 내부에 canvas 자동 생성 (ensureCanvas) -->
      <canvas id="chart-scenarios"></canvas>
    </div>
  </figure>
</section>
```

### 3-7. 리스크 매트릭스
```html
<figure class="chart-container" data-chart data-chart-id="risk-matrix">
  <figcaption class="chart-container__head">
    <h3 class="h3">리스크 매트릭스 · 영향력 × 가능성</h3>
    <p class="caption">17개 리스크 · Top 7은 글로우 표시</p>
  </figcaption>
  <div class="chart-container__canvas" style="min-height: 480px">
    <div id="chart-risk-matrix" style="width: 100%; height: 480px"></div>
  </div>
</figure>
```

---

## 4. 차트별 데이터 매핑 (data.json → 차트)

| 차트 ID | data.json 키 | 시리즈 | 비고 |
|---|---|---|---|
| `chart-price` | `priceHistory.series[]` (date, close, milestone) + `snapshot.high52w/low52w` | 19개 포인트 라인 + 52w 마커 | milestone에 'estimate' 포함 시 작은 회색 점 |
| `chart-revenue-trend` | `revenueByYear[]` (fy, revenue, op, opm, cyclePhase) | 7년 (FY21~FY27E) 매출 bar + OP bar + OPM line | FY26E/27E stripe 패턴 + FY23 음수 OP/OPM |
| `chart-hbm-share` | `hbmShare2026.{bit_basis,revenue_basis,hbm4_forecast}.data[]` | 3사 도넛 (3 데이터셋 토글) | 중앙 라벨: SK 점유율 강조 + 출처 |
| `chart-nvidia-supply` | `nvidiaSupplyMatrix.rows[].values{sk,samsung,micron}` | 9×3 heatmap (값 0~3) | gpuHBMCapacityGB[] 룩업으로 툴팁에 용량 표시 |
| `chart-consensus` | `consensus.targets[]` + `snapshot.price` + `consensus.average` | 10개 도트 + 현재가 vline + 평균 vline | BNK Hold = 강조 (큰 점 + 흰 보더), prevTp = X 마크 |
| `chart-scenarios` | `scenarios.{bear,base,bull}` + `weightedExpected` | 3 horizontal bar [low,high] + 중간값 scatter | 현재가 vline + 가중 기댓값 음영 밴드 |
| `chart-risk-matrix` | `riskMatrix.items[]` (impact, likelihood, color, isTop) | 3×3 heatmap + scatter overlay | Top 7은 글로우 (shadowBlur 16) |

---

## 5. 컬러 토큰 매핑

차트별로 `design-tokens.json`의 어떤 토큰을 어디에 사용하는지 명시. 임의 색 추가 금지.

### 가격 차트
- 라인 stroke: `viz-1` (#06B6D4)
- 영역 채우기: viz-1 gradient (top 42% → bottom 0%)
- 신고가 마커 / 급등: `state.bull` (#10B981)
- 조정 / 다운그레이드: `state.bear` (#EF4444)
- 추정 점: `text.muted` (#5E6A82)
- 52주 고저 reference line: bull / bear

### 매출 트렌드
- 매출 bar: `viz-1` (#06B6D4) / 추정 stripe
- OP bar: `viz-3` (#FB923C) / 추정 stripe / 음수 = `state.bear`
- OPM line: `viz-2` (#A78BFA)

### HBM 점유율
- SK: `viz.company.sk` (#06B6D4)
- 삼성: `viz.company.samsung` (#A78BFA)
- 마이크론: `viz.company.micron` (#FB923C)
- 중앙 라벨 SK 강조: `viz.company.sk` 700/36px mono

### NVIDIA 매트릭스
- 셀: `viz.heat[0~5]` 단계 (0=미공급 → heat[0], 1=일부 → heat[2], 2=보조 → heat[3], 3=주력 → heat[5])
- 컬럼 헤더(공급사명): `viz.company.{sk,samsung,micron}`
- 셀 라벨: 0=`·`, 3=`★`, 1/2=숫자
- 호버 글로우: cyan shadowBlur

### 컨센서스
- Buy: `state.bull`
- Hold: `state.warning`
- OW: `state.info`
- Sell: `state.bear` (해당 없음)
- 현재가 vline: `viz-2`
- 평균 vline: `viz-3` (점선)
- BNK Hold 강조: 흰 보더 + 큰 점 (다운그레이드 단일 균열)

### 시나리오
- Bear: `scenario.bear` / `scenario.bearBg`
- Base: `scenario.base` / `scenario.baseBg`
- Bull: `scenario.bull` / `scenario.bullBg`
- 가중 기댓값 밴드: `viz-2` 점선 + 8% 음영
- 현재가 vline: `viz-1`
- 비활성 시: `text.muted` (opacity 잠금)

### 리스크 매트릭스
- 셀 음영: high/mid/low tier 별 risk.* 토큰 + 14~32% 알파
- 도트: `risk.high` (#EF4444) / `risk.mid` (#F59E0B) / `risk.low` (#10B981)
- Top 7 글로우: shadowBlur 16 + risk 색
- 도트 라벨(ID): `text.primary`

---

## 6. 인터랙션 명세

### 공통
- 호버: 차트별 툴팁 (delay 100ms, 글래스모피즘 backdrop blur 16px)
- 진입 애니메이션: 800ms `easeOutCubic` (heatmap은 셀별 stagger 18~30ms, scatter는 500ms 후 40ms stagger)
- `prefers-reduced-motion: reduce` 시 애니메이션 0ms

### 토글 인터랙션
| 차트 | 토글 selector | 값 | 동작 |
|---|---|---|---|
| price-chart | `[data-period]` | `1M` `3M` `6M` `1Y` `YTD` | 클릭 시 destroy + re-init |
| hbm-share | `[data-toggle-dataset]` | `bit_basis` `revenue_basis` `hbm4_forecast` `nvidiaHBM4Allocation` (data.json `hbmShare2026` 하위 키와 1:1) | 데이터 swap + chart.update('active'), arc morph |
| scenarios | `[data-scenario]` | `bear` `base` `bull` | 선택 시 해당 영역만 highlight (다른 영역 muted), 같은 거 재클릭 시 해제. 토글이 chart-container 바깥(섹션 상단)에 있어도 동작 |

### 클릭 이벤트 (frontend-engineer가 listener 추가 가능)
- `#chart-nvidia-supply` → `nvidia-cell-click` custom event (detail: product, vendor, hbm, value, note)
- `#chart-risk-matrix` → `risk-item-click` (도트 클릭) / `risk-cell-click` (셀 클릭)

### 키보드
- 모든 토글 버튼은 Tab 가능 (button 태그 권장)
- 차트 자체 키보드 네비게이션은 Chart.js v4 기본 미지원 → P1 작업 (필요 시 plugin)

---

## 7. 반응형 / 모바일

- 모든 차트: `responsive: true`, `maintainAspectRatio: false` → 부모 컨테이너 높이만 따라감
- 컨테이너 min-height (디자인 토큰):
  - compact 240px (mobile)
  - default 320px
  - wide 420px
  - hero 520px (NVIDIA · 리스크 매트릭스 권장)
- 모바일에서 x축 ticks `autoSkip: true` + `maxTicksLimit: 8`로 단순화
- ECharts는 ResizeObserver로 자동 resize (`_chart-utils.js`의 `observeResize`)

---

## 8. 데이터 미확보 / 추정치 처리

| 항목 | 표시 방법 |
|---|---|
| `priceHistory.series[].milestone == 'estimate'` | 작은 회색 점 (radius 2.5px, color text.muted) + 툴팁에 "(추정치 · reasonable estimate)" |
| `revenueByYear[].fy ∈ {FY26E, FY27E}` | bar는 stripe 패턴(`createStripePattern`), x축 라벨은 viz-2 색 + 600 weight |
| `nvidiaSupplyMatrix` 값 0 (미공급) | 셀 라벨 `·`, 음영 heat[0] (거의 투명) |
| `consensus.targets[].prevTp` 있는 경우 | 추가 dataset에 X 마크로 직전 TP 표시 |
| `riskMatrix` 빈 셀 | impact·likelihood 위치 기반 implied tier로 음영만 (도트 없음) |

차트 컨테이너 하단에 `<p class="chart-container__disclaimer">`로 추정치 사용 사실 명시 (price-chart 참조).

---

## 9. QA 검증 체크리스트 (web-qa용)

### 9-1. 데이터 1:1 매칭
- [ ] 가격 차트의 5/12 종가 `1,861,000원` 정확 표시
- [ ] 52주 고가 `1,967,000` / 저점 `193,500` 라인 표시
- [ ] FY26E 매출 `245조원`, OP `256조원`, OPM `71%` 1:1 매칭
- [ ] FY23 OP `-7.7조원` 음수 표현 (bar는 아래쪽)
- [ ] HBM bit 2026: SK `50%` / 삼성 `28%` / 마이크론 `22%` (TrendForce)
- [ ] HBM 매출 2026: SK `62%` / 삼성 `17%` / 마이크론 `21%` (Counterpoint)
- [ ] HBM4 forecast: SK `54%` / 삼성 `28%` / 마이크론 `18%`
- [ ] NVIDIA Rubin Ultra SK 값 `3` (주력), Samsung `1`, Micron `1`
- [ ] AMD MI355X/MI400 SK·삼성 모두 `3` (잭팟)
- [ ] 컨센서스: SK증권 TP `3,000,000`, BNK `1,300,000` Hold(다운그레이드)
- [ ] 현재가 -2.36% 디스카운트 라벨
- [ ] 시나리오 Bear 1.0~1.3M, Base 1.5~2.1M, Bull 2.3~2.8M
- [ ] 가중 기댓값 음영 1,750,000 ~ 1,900,000
- [ ] 리스크 매트릭스 Top 7: D, J1, A1, E, F1, F2, G1 (글로우 확인)

### 9-2. 인터랙션
- [ ] price-chart 기간 토글 (1M/3M/6M/1Y/YTD) 정상 동작
- [ ] hbm-share 3개 뷰 토글 시 중앙 라벨·색·legend·source 모두 갱신
- [ ] scenarios 토글 클릭 시 다른 영역 muted, 같은 거 재클릭 시 해제
- [ ] nvidia-supply 셀 호버 시 HBM 세대·용량(GB) 표시
- [ ] risk-matrix 도트 호버 시 ID, 라벨, 카테고리, 요약 노출
- [ ] 모든 차트 툴팁 글래스모피즘 효과 동작

### 9-3. 접근성
- [ ] `prefers-reduced-motion: reduce` 시 애니메이션 0ms 확인
- [ ] 모든 토글 button 태그 + 키보드 Tab 동작
- [ ] 차트 옆 `<details>` 데이터 테이블 (스크린리더용 — frontend-engineer 책임)

### 9-4. 반응형
- [ ] 모바일(360px) 차트 깨짐 없음 (canvas overflow 없음)
- [ ] 태블릿(768px) 정상 표시
- [ ] 데스크탑(1280px) full 표시

---

## 10. 협업 메모

- **data.json은 단일 진실**. 수정 필요 시 design-lead와 협의 → data.json 갱신 → 차트 자동 반영
- **테마 전환**: 현재 `_chart-utils.js`의 TOKENS는 다크 모드 하드코딩. light/dark 토글 시 `window.dispatchEvent(new CustomEvent('skh:theme-change'))` 발생시키면 `rebuildAllCharts()` 자동 호출 (frontend-engineer)
- **CDN 실패 대비**: charts.js에서 `typeof Chart === 'undefined'` / `typeof echarts === 'undefined'` 체크 후 console.warn (현 구현). fallback SVG는 P2
- **차트 진입 stagger**: 7개 차트가 IntersectionObserver(threshold 0.2)로 lazy init되므로 스크롤 진입 자체가 자연스러운 stagger. motion-designer의 섹션 진입 모션과 중복 없음 (차트는 자체 800ms 애니메이션이 트리거).
