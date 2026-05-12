---
name: web-design-system
description: "모던 데이터 시각화 웹페이지의 디자인 시스템(컬러·타이포·스페이싱·모션 토큰)과 정보 아키텍처(섹션 구조·내러티브)를 설계하고, 보고서 데이터를 시각화용 data.json으로 추출하는 스킬. 디자인 시스템 정의, 정보 아키텍처 설계, data.json 추출, 컴포넌트 카탈로그 작성 요청 시 반드시 사용."
---

# Web Design System Skill

모던 웹페이지의 디자인 시스템·정보 아키텍처·데이터 구조를 단일 진실(single source of truth)로 정의하는 워크플로우. design-lead가 후속 팀원(visualization/frontend/motion/qa) 모두의 작업 기준을 만든다.

## 워크플로우

### Step 1: 보고서 콘텐츠 정독
- `reports/SK하이닉스_분석보고서_20260512.md` Read
- `_workspace/01~05_*.md` Read (시각화 가능한 정량 데이터 추출용)
- 핵심 임팩트 메트릭 식별:
  - 현재가, 시가총액, 1Y 수익률
  - 1Q26 OPM 72% (분기 사상 최고)
  - HBM 점유율 50%+ (2026E)
  - Forward PER 5.93x
  - 시나리오 확률 (Bear 20~25% / Base 55~60% / Bull 20~25%)
  - 컨센서스 목표가 분포

### Step 2: 디자인 토큰 정의

**컬러 팔레트 (다크 모드 우선):**
```
배경
- bg-primary: #0a0e1a (깊은 네이비)
- bg-secondary: #111827 (카드 배경)
- bg-elevated: #1f2937 (호버/액티브)

텍스트
- text-primary: #f8fafc (헤딩)
- text-secondary: #cbd5e1 (본문)
- text-tertiary: #94a3b8 (caption)

브랜드/강조
- accent-primary: #06b6d4 (시안 네온, HBM 강조)
- accent-secondary: #8b5cf6 (퍼플, AI 강조)
- accent-tertiary: #f59e0b (앰버, 데이터 강조)

상태
- bull/up: #10b981 (에메랄드)
- bear/down: #ef4444 (레드)
- neutral: #6b7280 (그레이)
- warning: #f59e0b (앰버)

데이터 시각화 (8색 시리즈)
- viz-1: #06b6d4 (sk-hynix)
- viz-2: #a78bfa (samsung)
- viz-3: #fb923c (micron)
- viz-4: #fbbf24
- viz-5: #4ade80
- viz-6: #f472b6
- viz-7: #38bdf8
- viz-8: #c084fc
```

**타이포그래피:**
```
폰트
- sans-display: 'Inter', 'Pretendard', sans-serif (영문·한글 페어)
- sans-body: 'Inter', 'Pretendard', sans-serif
- mono: 'JetBrains Mono', 'D2Coding', monospace (숫자·코드)

크기 (clamp 반응형)
- display-1: clamp(48px, 8vw, 96px) — Hero 메인
- display-2: clamp(36px, 6vw, 72px) — Hero 보조
- h1: clamp(32px, 4vw, 48px) — 섹션 헤딩
- h2: clamp(24px, 3vw, 36px) — 서브섹션
- h3: 20px — 카드 타이틀
- body-lg: 18px
- body: 16px
- body-sm: 14px
- caption: 12px

weight: 300/400/500/600/700
line-height: 1.1 (display), 1.3 (heading), 1.6 (body)
letter-spacing: -0.02em (display), 0 (body)
```

**스페이싱 그리드 (8px base):**
```
space-1: 4px / space-2: 8px / space-3: 12px / space-4: 16px / space-5: 20px / space-6: 24px / space-8: 32px / space-10: 40px / space-12: 48px / space-16: 64px / space-20: 80px / space-24: 96px / space-32: 128px
```

**반경·그림자·블러:**
```
radius-sm: 6px / radius: 12px / radius-lg: 20px / radius-xl: 32px / radius-full: 9999px
shadow-sm: 0 1px 3px rgba(0,0,0,0.3)
shadow: 0 4px 16px rgba(0,0,0,0.4)
shadow-lg: 0 16px 48px rgba(0,0,0,0.6)
shadow-glow: 0 0 32px rgba(6,182,212,0.25)
blur-sm: 8px / blur: 16px / blur-lg: 32px (글래스모피즘)
```

**모션:**
```
duration-fast: 150ms
duration: 300ms
duration-slow: 600ms
duration-hero: 1200ms

easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1)
easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1)
easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1)
easing-emphasized: cubic-bezier(0.2, 0.0, 0, 1)

stagger: 80ms (요소 간 stagger)
```

이 토큰을 `web/_design/design-tokens.json`에 JSON으로 저장.

### Step 3: 정보 아키텍처 — 섹션 흐름

```
[0] Sticky Header
   - 로고/제목 + 섹션 nav + 다크/라이트 토글

[1] Hero (Full viewport)
   - 배경: WebGL/Canvas 모션
   - 메인: "SK하이닉스 다각도 분석" + 보조 (2026-05-12)
   - 임팩트 메트릭 3개: 현재가 / 1Y 수익률 / 시가총액
   - 스크롤 인디케이터

[2] Executive Summary
   - 한 줄 요약
   - 강점 3 카드 + 우려 3 카드 (그리드)
   - 합의 신호 (Neutral-to-Bullish)

[3] 5개 분석 영역 (세로 스택, 또는 탭)
   3-1. 시장 데이터 — 차트: 1Y 가격 차트
   3-2. 펀더멘털 — 차트: 5년 매출/OP/OPM 콤보
   3-3. 산업 — 차트: HBM 점유율 도넛 + NVIDIA 공급 매트릭스
   3-4. 시장 심리 — 차트: 컨센서스 분포 도트 + 이벤트 캘린더
   3-5. 리스크 — 차트: 영향력 × 가능성 매트릭스 히트맵

[4] 시나리오 (인터랙티브 카드)
   - Bear / Base / Bull 토글
   - 각 시나리오의 트리거·확률·주가 범위·근거
   - Fan chart로 12개월 주가 시나리오

[5] 모니터링 타임라인
   - 향후 90일 핵심 이벤트 (5/13 → 12/31)
   - 가로 스크롤 또는 세로 타임라인

[6] 부록 (Accordion)
   - 데이터 출처 (그리드 링크)
   - 분석 한계 (Caveats)
   - 데이터 불일치 (양쪽 기록)

[7] Footer
   - 작성자 / 다음 갱신 시점 / disclaimer
```

`web/_design/information-architecture.md`에 저장 (각 섹션의 와이어프레임 텍스트 묘사 포함).

### Step 4: 컴포넌트 카탈로그

```
- StickyHeader (logo, nav, theme-toggle)
- HeroSection (background-canvas, headline, meta-metrics, scroll-indicator)
- MetricCard (label, value, delta, icon, theme: bull/bear/neutral)
- SummaryCard (icon, title, body, theme: strength/concern)
- AnalysisSection (heading, body, chart-slot, source-list)
- ChartContainer (title, subtitle, chart-canvas, legend, tooltip)
- ScenarioCard (label: bear/base/bull, probability, price-range, triggers, body)
- TimelineEvent (date, title, body, impact-indicator)
- Accordion (header, body, expand-icon)
- SourceLink (label, url, date)
- Disclaimer (icon, body)
- ThemeToggle
- ScrollIndicator
```

각 컴포넌트의 props·variants·예시 마크업을 `web/_design/component-catalog.md`에 명시.

### Step 5: data.json 추출

보고서에서 시각화 가능한 데이터를 JSON 구조로 정리:

```json
{
  "meta": {
    "reportDate": "2026-05-12",
    "asOfDate": "2026-05-12",
    "ticker": "000660.KS",
    "name": "SK하이닉스"
  },
  "snapshot": {
    "price": 1861000,
    "change": -19000,
    "changePct": -1.01,
    "marketCap_KRW_trillion": 1319,
    "marketCap_USD_billion": 819,
    "yearReturnPct": 871,
    "high52w": 1967000,
    "low52w": 193500,
    "forwardPER": 5.93,
    "trailingPER": [12.06, 17.64],
    "PBR": 7.06,
    "ROE": 61.2,
    "beta": 2.03
  },
  "priceHistory": [ /* 1Y 일별 종가 (대표 포인트만) */ ],
  "revenueByYear": [
    {"fy": "FY21", "revenue": 43.0, "op": 12.4, "np": 9.6, "opm": 29},
    {"fy": "FY22", "revenue": 44.6, "op": 7.0, "np": 2.4, "opm": 16},
    {"fy": "FY23", "revenue": 32.8, "op": -7.7, "np": -9.1, "opm": -24},
    {"fy": "FY24", "revenue": 66.2, "op": 23.5, "np": 19.8, "opm": 35},
    {"fy": "FY25", "revenue": 97.1, "op": 47.2, "np": 42.9, "opm": 49},
    {"fy": "FY26E", "revenue": 245, "op": 256, "np": 200, "opm": 71}
  ],
  "hbmShare2026": {
    "bit_basis": {"sk": 50, "samsung": 28, "micron": 22},
    "revenue_basis": {"sk": 62, "samsung": 17, "micron": 21},
    "hbm4_forecast": {"sk": 54, "samsung": 28, "micron": 18}
  },
  "nvidiaSupplyMatrix": [ /* GPU별 공급사 */ ],
  "consensus": {
    "average": 1817130,
    "min": 1300000,
    "max": 3000000,
    "buyHoldSell": {"buy": 36, "hold": 1, "sell": 0},
    "targets": [
      {"firm": "SK증권", "tp": 3000000, "date": "2026-05-07", "opinion": "Buy"},
      /* ... */
    ]
  },
  "scenarios": {
    "bear": {"probability": [20, 25], "priceRange": [1000000, 1300000], "triggers": ["..."]},
    "base": {"probability": [55, 60], "priceRange": [1500000, 2100000], "triggers": ["..."]},
    "bull": {"probability": [20, 25], "priceRange": [2300000, 2800000], "triggers": ["..."]}
  },
  "riskMatrix": [ /* {category, impact: 'high/mid/low', likelihood: 'high/mid/low', label} */ ],
  "events90d": [
    {"date": "2026-05-13", "title": "美 하원 외교위 MATCH Act 심의", "impact": "negative"},
    /* ... 11개 이벤트 */
  ],
  "strengths": [ /* Top 3 */ ],
  "concerns": [ /* Top 3 */ ],
  "sources": [ /* 부록 A 출처 링크 */ ],
  "caveats": [ /* 부록 B 한계 */ ]
}
```

`web/_design/data.json`에 저장. 보고서 정수 값을 임의로 가공하지 말고 가능한 한 원형 보존.

### Step 6: Style Guide 작성

후속 팀원이 일관된 디자인 결정을 내릴 수 있도록 가이드라인 작성:
- 카드 패딩·간격
- 차트 최소 높이·max-width
- 아이콘 사용 규칙 (Heroicons, Phosphor, Lucide 중 1개)
- 그라데이션 사용 예 (Hero 배경, accent gradient)
- 마이크로 인터랙션 강도 (호버 transform: translateY(-2px), 호버 shadow 증가)
- 다크/라이트 모드 토큰 매핑

`web/_design/style-guide.md`에 저장.

## 작업 원칙
- **디자인 토큰은 단일 진실**: 후속 팀원이 임의로 추가 못 함. 변경 시 design-lead 결정
- **데이터 원형 보존**: 단위·소수점·반올림 임의 변경 금지
- **트렌드 채택**: 글래스모피즘 / 다크 모드 / 큰 타이포 / 미세 그라데이션 / 모션 시그널 — 이 5요소를 의식적으로 사용
- **모바일 우선**: clamp/min/max로 반응형 자체 내장

## 팀 통신
- visualization-engineer에게 컬러 viz-1~8 + 차트별 권장 종류 + 데이터 매핑 SendMessage
- frontend-engineer에게 컴포넌트 카탈로그·반응형 breakpoint·시맨틱 마크업 가이드 SendMessage
- motion-designer에게 모션 토큰 + 배경 컨셉 (WebGL gradient / Canvas particle network 중 권장) SendMessage
- web-qa에게 검증 기준 (토큰 누락·하드코딩 검출 항목) SendMessage

## 후속 실행 시
이전 `web/_design/*.json/md` 존재 시 Read 후, 변경 사항만 갱신. 토큰 변경 시 후속 팀원에게 영향 분석 후 일괄 알림.
