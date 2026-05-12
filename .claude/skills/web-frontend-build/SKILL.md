---
name: web-frontend-build
description: "디자인 토큰 기반의 HTML 시맨틱 마크업, 모듈화된 CSS, Vanilla JS 인터랙션, 반응형 레이아웃, 다크/라이트 모드, 스크롤 기반 네비게이션을 구현하는 프론트엔드 빌드 스킬. 정적 사이트(no build step) HTML/CSS/JS 빌드 요청 시 반드시 사용."
---

# Web Frontend Build Skill

`web/_design/*`를 입력으로 받아 `web/index.html`, `web/styles/*.css`, `web/scripts/main.js`를 빌드하는 워크플로우. 빌드 도구 없이 정적 파일로 동작.

## 워크플로우

### Step 1: 진입점 HTML 구조 (`web/index.html`)

```html
<!DOCTYPE html>
<html lang="ko" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>SK하이닉스 다각도 분석 보고서 — 2026-05-12</title>
  <meta name="description" content="..." />
  <meta name="theme-color" content="#0a0e1a" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Styles -->
  <link rel="stylesheet" href="./styles/main.css">
  <link rel="stylesheet" href="./styles/components.css">
  <link rel="stylesheet" href="./styles/animations.css">
  <link rel="stylesheet" href="./styles/responsive.css">
  
  <!-- Chart libraries (CDN) -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5"></script>
</head>
<body>
  <!-- Hero 배경 캔버스 (motion-designer 마운트 포인트) -->
  <canvas id="bg-canvas" aria-hidden="true"></canvas>
  
  <header class="site-header" id="site-header">
    <nav class="site-nav" aria-label="섹션 네비게이션">
      <a href="#hero" class="logo">SK하이닉스 분석</a>
      <ul class="nav-links">
        <li><a href="#summary">요약</a></li>
        <li><a href="#analysis">분석</a></li>
        <li><a href="#scenarios">시나리오</a></li>
        <li><a href="#monitoring">모니터링</a></li>
      </ul>
      <button class="theme-toggle" aria-label="테마 전환">🌙</button>
    </nav>
  </header>
  
  <main>
    <section id="hero" class="hero">
      <h1 class="hero-title">
        <span class="display-1">SK하이닉스</span>
        <span class="hero-subtitle">다각도 분석 보고서 · 2026-05-12</span>
      </h1>
      <div class="meta-metrics" data-stagger>
        <div class="metric-card">
          <span class="metric-label">현재가</span>
          <span class="metric-value" data-countup="1861000">1,861,000</span>
          <span class="metric-unit">원</span>
          <span class="metric-delta delta-down">▼1.01%</span>
        </div>
        <!-- 1Y 수익률, 시가총액 카드 -->
      </div>
      <div class="scroll-indicator" aria-hidden="true">scroll</div>
    </section>
    
    <section id="summary" class="section">
      <h2>Executive Summary</h2>
      <p class="tldr">현재가 약 1,861,000원 · 시가총액 1,319조원 · 1Y +871% ...</p>
      <div class="summary-grid">
        <div class="summary-card strength">
          <h3>핵심 강점 3</h3>
          <ul>...</ul>
        </div>
        <div class="summary-card concern">
          <h3>핵심 우려 3</h3>
          <ul>...</ul>
        </div>
      </div>
    </section>
    
    <section id="analysis" class="section">
      <h2>5개 분석 영역</h2>
      <!-- 5개 sub-section: 시세/펀더/산업/심리/리스크 -->
      <article class="analysis-block" id="analysis-market">
        <header><h3>1. 시장 데이터</h3></header>
        <div class="chart-container" data-chart>
          <canvas id="chart-price"></canvas>
        </div>
        <p class="analysis-body">...</p>
      </article>
      <!-- ... -->
    </section>
    
    <section id="scenarios" class="section">
      <h2>시나리오 분석</h2>
      <!-- 3 ScenarioCard + Fan chart -->
    </section>
    
    <section id="monitoring" class="section">
      <h2>모니터링 타임라인</h2>
      <!-- 향후 90일 이벤트 -->
    </section>
    
    <section id="appendix" class="section">
      <h2>부록</h2>
      <details>
        <summary>데이터 출처</summary>
        <!-- ... -->
      </details>
      <details>
        <summary>분석 한계 (Caveats)</summary>
        <!-- ... -->
      </details>
    </section>
  </main>
  
  <footer class="site-footer">
    <p>작성: SK Hynix Analysis Team · 2026-05-12 · 정보 제공 목적이며 투자 자문이 아닙니다</p>
  </footer>
  
  <!-- Scripts -->
  <script type="module" src="./scripts/main.js"></script>
  <script type="module" src="./scripts/background-animation.js"></script>
  <script type="module" src="./scripts/scroll-animations.js"></script>
  <script type="module" src="./scripts/microinteractions.js"></script>
  <script type="module" src="./scripts/charts.js"></script>
</body>
</html>
```

### Step 2: CSS 디자인 시스템 (`web/styles/main.css`)

```css
:root[data-theme="dark"] {
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-elevated: #1f2937;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --accent-primary: #06b6d4;
  /* ... 모든 토큰 */
}

:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  /* ... */
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', 'Pretendard', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Typography scale */
.display-1 { font-size: clamp(48px, 8vw, 96px); font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; }
.display-2 { font-size: clamp(36px, 6vw, 72px); font-weight: 600; line-height: 1.1; }
h1 { font-size: clamp(32px, 4vw, 48px); font-weight: 600; }
h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 600; margin-bottom: 24px; }
h3 { font-size: 20px; font-weight: 500; }

/* Layout grid */
main { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.section { padding: 96px 0; }

/* Sticky header with glassmorphism */
.site-header {
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(16px);
  background: color-mix(in srgb, var(--bg-primary) 70%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--text-tertiary) 20%, transparent);
}

/* 배경 캔버스 */
#bg-canvas {
  position: fixed; inset: 0; z-index: -1;
  pointer-events: none;
}

/* Reduced motion fallback */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Step 3: 컴포넌트 CSS (`web/styles/components.css`)

```css
/* Metric Card with glow on hover */
.metric-card {
  padding: 24px;
  background: color-mix(in srgb, var(--bg-secondary) 60%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--text-tertiary) 15%, transparent);
  border-radius: 20px;
  transition: transform 300ms cubic-bezier(0.2, 0, 0, 1), box-shadow 300ms;
}
.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 32px rgba(6, 182, 212, 0.15);
}

.metric-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 600;
}
.delta-up { color: var(--bull); }
.delta-down { color: var(--bear); }

/* Summary card glass */
.summary-card {
  padding: 32px;
  background: color-mix(in srgb, var(--bg-elevated) 50%, transparent);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent);
}
.summary-card.strength { border-color: color-mix(in srgb, var(--bull) 30%, transparent); }
.summary-card.concern { border-color: color-mix(in srgb, var(--bear) 30%, transparent); }

/* Chart container */
.chart-container {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 32px;
  min-height: 400px;
}

/* Scenario cards */
.scenario-card[data-scenario="bear"] { border-left: 4px solid var(--bear); }
.scenario-card[data-scenario="base"] { border-left: 4px solid var(--accent-primary); }
.scenario-card[data-scenario="bull"] { border-left: 4px solid var(--bull); }

/* Timeline event */
.timeline { display: grid; gap: 16px; }
.timeline-event {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 16px;
  padding: 16px;
  border-left: 2px solid var(--accent-primary);
}
```

### Step 4: 반응형 CSS (`web/styles/responsive.css`)

```css
/* Mobile-first base in main.css. 여기서는 확장. */

@media (min-width: 768px) {
  .meta-metrics { grid-template-columns: repeat(3, 1fr); }
  .summary-grid { grid-template-columns: 1fr 1fr; }
  .nav-links { display: flex; gap: 32px; }
}

@media (min-width: 1280px) {
  main { padding: 0 48px; }
  .section { padding: 128px 0; }
}

/* Container queries 활용 (지원 브라우저) */
@container (min-width: 600px) {
  .chart-container { padding: 48px; }
}
```

### Step 5: 진입 JS (`web/scripts/main.js`)

```js
// 다크/라이트 모드 토글
const toggle = document.querySelector('.theme-toggle');
const root = document.documentElement;
const stored = localStorage.getItem('theme');
if (stored) root.dataset.theme = stored;
toggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
  toggle.textContent = next === 'dark' ? '🌙' : '☀️';
});

// 스크롤 기반 active 네비
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => navObserver.observe(s));

// 데이터 로드 후 차트·동적 콘텐츠 주입
import { initAllCharts } from './charts.js';
import { populateData } from './data-loader.js';
(async () => {
  const data = await fetch('./_design/data.json').then(r => r.json());
  populateData(data);  // 텍스트·리스트 주입
  initAllCharts(data);  // 차트 초기화 (IntersectionObserver lazy)
})();
```

### Step 6: 데이터 로더 (`web/scripts/data-loader.js`)

`data.json`에서 텍스트·리스트·테이블 데이터를 DOM에 주입. 강점/우려/시나리오/타임라인 등.

## 작업 원칙
- **No build step**: ESM modules + CDN libs로 직접 로드
- **시맨틱 마크업**: `<section>`, `<article>`, `<nav>`, `<main>` 정확히. heading 위계 H1→H2→H3 일관성
- **CSS Custom Properties로 토큰**: 하드코딩 컬러·사이즈 금지
- **접근성**: 키보드 focus visible, alt 텍스트, ARIA labels, prefers-reduced-motion
- **성능**: 이미지 lazy loading, font-display: swap, 차트는 IntersectionObserver로 lazy init
- **모바일 우선**: 320px 기준, breakpoint 768·1280

## 팀 통신
- design-lead로부터 토큰·IA·카탈로그 수신
- visualization-engineer로부터 차트 컨테이너 ID 명세 수신 → HTML에 정확히 배치
- motion-designer로부터 배경 캔버스·인터랙션 트리거 클래스 명세 수신
- web-qa로부터 마크업/접근성/반응형 검증 결과 수신 → 수정

## 후속 실행 시
이전 HTML/CSS/JS 보존, 변경 부분만 수정. 새 컴포넌트 추가 시 component-catalog 갱신 확인.
