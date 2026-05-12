---
name: web-data-visualization
description: "보고서 데이터(시세 추이·HBM 점유율·5년 실적·시나리오·컨센서스·리스크 매트릭스·NVIDIA 공급 매트릭스)를 인터랙티브 차트로 시각화하는 스킬. Chart.js·ECharts·D3.js 라이브러리 선택, 호버 툴팁·스크롤 진입 애니메이션·반응형 차트 구현. 차트 빌드, 데이터 시각화, 인터랙티브 그래프 요청 시 반드시 사용."
---

# Web Data Visualization Skill

`web/_design/data.json`을 입력으로 받아 인터랙티브 차트를 `web/scripts/`에 구현하는 워크플로우.

## 워크플로우

### Step 1: 라이브러리 선택 (CDN 사용)

| 차트 유형 | 권장 라이브러리 | CDN |
|---|---|---|
| 라인/바/도넛/콤보 | **Chart.js v4** | `cdn.jsdelivr.net/npm/chart.js@4` |
| 히트맵·sankey·복잡 인터랙션 | **Apache ECharts v5** | `cdn.jsdelivr.net/npm/echarts@5` |
| 커스텀 fan chart·복합 SVG | D3.js v7 (필요 시만) | `d3js.org/d3.v7.min.js` |
| 보조: 트윈 애니메이션 | GSAP (motion-designer가 사용 중이면 공유) | - |

**원칙**: 단일 사이트에 라이브러리 1~2개만. 표준 차트는 Chart.js, 특수 차트(매트릭스·sankey)는 ECharts.

### Step 2: 차트 컴포넌트 매핑

| 차트 ID | 데이터 소스 | 라이브러리 | 차트 종류 |
|---|---|---|---|
| `chart-price` | `data.priceHistory` + `data.snapshot.high52w/low52w` | Chart.js | 라인 + 영역 채우기 + 마커 |
| `chart-revenue-trend` | `data.revenueByYear` | Chart.js | 콤보 (바: 매출/OP, 라인: OPM 보조축) |
| `chart-hbm-share` | `data.hbmShare2026` | Chart.js | 도넛 3개 (bit / revenue / hbm4 토글) |
| `chart-nvidia-supply` | `data.nvidiaSupplyMatrix` | ECharts | 히트맵 (행: GPU, 열: 공급사) |
| `chart-consensus` | `data.consensus.targets` | Chart.js | 가로 도트 차트 + 평균 라인 |
| `chart-scenarios` | `data.scenarios` | Chart.js or D3 | Fan chart 또는 박스 (Bear/Base/Bull) |
| `chart-risk-matrix` | `data.riskMatrix` | ECharts | 3×3 히트맵 + 라벨 |

### Step 3: 차트별 구현 (각 파일 `web/scripts/chart-configs/`)

#### 3-1. price-chart.js — 1Y 가격 차트
- 영역 채우기(기간 토글: 1M/3M/6M/1Y/YTD)
- 호버 시 정확한 가격·날짜·등락 표시
- 52주 고저점 마커
- 라인 컬러: bull(#10b981) / bear(#ef4444) 그라데이션 (gain/loss 영역별)

#### 3-2. revenue-trend.js — 5년 매출/OP/OPM
- 매출·OP 막대 (그룹 또는 스택), OPM 보조축 라인
- FY26E는 점선 또는 패턴으로 추정 표시
- FY23 적자는 음수 표현

#### 3-3. hbm-share.js — HBM 점유율 도넛
- 토글: bit / revenue / HBM4 forecast
- SK 50%·삼성 28%·마이크론 22% (bit 2026)
- 중앙: 현재 선택된 항목명·SK 점유율 강조

#### 3-4. nvidia-supply.js — NVIDIA 공급사 매트릭스
- ECharts heatmap
- 행: H100/H200/B100/B200/B300/Rubin/Rubin Ultra
- 열: SK / Samsung / Micron
- 값: 0=공급 없음, 1=보조, 2=주력, 3=단독
- 셀 클릭 시 상세 (HBM 세대·용량 등)

#### 3-5. consensus.js — 컨센서스 분포
- 가로 도트 차트 (각 증권사 1점)
- X축: 목표가, Y축: 증권사명
- 현재가 vertical line + 평균 vertical line
- 색: Buy=초록 / Hold=주황 / Sell=빨강

#### 3-6. scenarios.js — Bear/Base/Bull
- Fan chart: 가로축=현재가→12개월, 세로축=주가 범위
- 3개 시나리오 영역을 색상별로 (Bear=빨강 / Base=회청 / Bull=초록)
- 각 시나리오 확률 백분율 라벨
- 인터랙티브: 시나리오 토글 시 해당만 강조

#### 3-7. risk-matrix.js — 영향력 × 가능성 히트맵
- ECharts heatmap 3×3
- 셀 안 라벨: 리스크 항목명 (예: "(D) NVIDIA 단일 고객")
- 우측 패널: 셀 클릭 시 상세 리스크 정보

### Step 4: 공통 인터랙션 패턴

```js
// 스크롤 진입 시 애니메이션 (motion-designer와 협업)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      initChartFor(entry.target.id);  // 진입 시점에 차트 생성
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('[data-chart]').forEach(el => observer.observe(el));
```

```js
// prefers-reduced-motion 대응
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chartOptions = {
  animation: prefersReducedMotion ? false : { duration: 800, easing: 'easeOutCubic' },
  // ...
};
```

### Step 5: 차트 컨테이너 명세 (frontend-engineer와 공유)

각 차트는 다음 HTML 구조에 마운트:
```html
<div class="chart-container" data-chart>
  <header class="chart-header">
    <h3 class="chart-title">차트 제목</h3>
    <p class="chart-subtitle">설명</p>
    <!-- 토글 버튼 (필요 시) -->
  </header>
  <div class="chart-body">
    <canvas id="chart-price"></canvas>  <!-- 또는 <div id="..."> for ECharts -->
  </div>
  <footer class="chart-footer">
    <p class="chart-source">출처: ...</p>
  </footer>
</div>
```

이 마크업 명세를 frontend-engineer에게 SendMessage로 공유.

### Step 6: 통합 진입점 — `web/scripts/charts.js`

```js
import { initPriceChart } from './chart-configs/price-chart.js';
import { initRevenueTrend } from './chart-configs/revenue-trend.js';
// ... 7개 차트 import

export async function initAllCharts() {
  const data = await fetch('/web/_design/data.json').then(r => r.json());
  
  // IntersectionObserver로 lazy init
  const chartInitializers = {
    'chart-price': () => initPriceChart(data),
    'chart-revenue-trend': () => initRevenueTrend(data),
    // ...
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.querySelector('canvas, div[id]')?.id;
      if (entry.isIntersecting && chartInitializers[id]) {
        chartInitializers[id]();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  document.querySelectorAll('[data-chart]').forEach(el => observer.observe(el));
}
```

### Step 7: 시각화 노트 작성

`web/_design/visualization-notes.md`에 다음 정리:
- 사용 라이브러리·버전·CDN URL
- 7개 차트의 데이터 매핑·인터랙션 명세
- 색상 토큰 매핑
- 모바일 단순화 규칙
- 데이터 미확보(N/A) 항목 처리 방식

## 작업 원칙
- **데이터 정확성**: data.json을 단일 소스로. 임의 가공 금지. 수정 필요 시 design-lead에게 요청
- **컬러 토큰만 사용**: viz-1~8 외 컬러 임의 추가 금지
- **반응형 차트**: ResponsiveContainer 또는 Chart.js `responsive: true` + `maintainAspectRatio: false`. 모바일에서 레이블 단순화
- **접근성**: 차트 옆에 텍스트 요약(스크린리더용 `<table>` 또는 `aria-label`) 제공
- **성능**: lazy init (스크롤 진입 시), 차트 인스턴스는 재사용 가능하면 재사용

## 팀 통신
- design-lead로부터 data.json·color tokens·차트 권장 종류 수신
- frontend-engineer에게 차트 컨테이너 HTML 구조 + 초기화 함수 명세 SendMessage
- motion-designer와 스크롤 진입 stagger 조율 (모션 충돌 방지)
- web-qa에게 visualization-notes.md 제공 + 데이터 정합성 검증 요청

## 후속 실행 시
이전 차트 코드 보존, 변경 필요 차트만 수정. data.json 변경 시 영향받는 차트만 갱신.
