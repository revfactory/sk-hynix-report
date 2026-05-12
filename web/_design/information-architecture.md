# Information Architecture — SK하이닉스 분석 보고서 웹

**owner**: design-lead
**version**: 1.0.0
**updated**: 2026-05-12
**입력**: `reports/SK하이닉스_분석보고서_20260512.md` + `data.json`
**채택 트렌드**: 글래스모피즘 · 다크 모드 우선 · 큰 타이포 · 네온 액센트 그라데이션 · 마이크로 인터랙션 + 스크롤 시그널

---

## 0. 내러티브 (Narrative Spine)

> "1년 +871%, OPM 72% — 분기 사상 최고. 그러나 컨센서스 목표가는 이미 도달했고, 5/13 MATCH Act 심의·6월 삼성 HBM4 공급 개시·Q2 실적이라는 세 개의 분기점이 다가온다."

**전체 호흡 (8섹션)**: Hook (현재) → Verdict (결론) → Pillars (5개 깊이) → Scenarios (앞으로) → Monitoring (시간) → Appendix (출처/한계)

내러티브 톤은 **Bloomberg Terminal × Stripe Atlas × Linear** — 데이터를 두려워하지 않으면서도 컨텍스트와 정성 판단을 함께 노출한다. 사용자가 어느 섹션에서든 "지금 우리는 cycle peak에 있다"는 단일 명제로 회귀할 수 있어야 한다.

---

## 1. 섹션 흐름 (Top→Bottom)

```
┌─ [00] Sticky Header (z=100) ─────────────────────────────────────┐
│  로고 · 섹션 nav · 다크/라이트 토글 · "현재가 1,861,000원" 미니피커 │
├─ [01] Hero — 풀뷰포트 ────────────────────────────────────────────┤
│  WebGL 그라데이션 메시 + 입자 네트워크 (모션팀)                    │
│  Display-1 "1년에 9.6배" / 보조 "SK하이닉스 다각도 분석 보고서"   │
│  Impact 3 메트릭: 현재가 / 1Y 수익률 / 시가총액                  │
│  스크롤 인디케이터 + 보고일 메타                                  │
├─ [02] Executive Summary ──────────────────────────────────────────┤
│  한 줄 결론 + Verdict 다이얼 (★★★★ / Neutral-to-Bullish)        │
│  Strength 3 / Concern 3 카드 그리드                              │
│  Consensus 신호 바 (Buy 36 / Hold 1 / Sell 0)                    │
├─ [03] 5개 분석 영역 (Pillars) ─────────────────────────────────────┤
│  3-1. 시장 데이터 — 1Y 가격 인터랙티브 차트                       │
│  3-2. 펀더멘털 — 5년 매출/OP/OPM 콤보                            │
│  3-3. 산업 — HBM 점유율 도넛 + NVIDIA 공급 매트릭스 히트맵        │
│  3-4. 시장 심리 — 컨센서스 분포 점도 + 이벤트 캘린더 미니         │
│  3-5. 리스크 — 영향력×가능성 매트릭스                             │
├─ [04] 시나리오 ───────────────────────────────────────────────────┤
│  Bear / Base / Bull 인터랙티브 토글                              │
│  Fan chart (12개월 가중 주가 범위)                               │
├─ [05] 90일 모니터링 ──────────────────────────────────────────────┤
│  타임라인 (5/13 → 12/31, 11개 이벤트)                            │
├─ [06] 부록 (Accordion) ───────────────────────────────────────────┤
│  데이터 출처 · 분석 한계 · 데이터 불일치                          │
├─ [07] Footer ─────────────────────────────────────────────────────┤
│  작성자 / 다음 갱신 / Disclaimer                                  │
└──────────────────────────────────────────────────────────────────┘
```

스크롤 길이 예상: 모바일 ~12 viewport / 데스크탑 ~9 viewport. **섹션 사이 spacing은 `--space-section-y-md` 통일**.

---

## 2. 섹션별 와이어프레임 텍스트 묘사

### [00] StickyHeader

```
| [SKH] SK하이닉스 분석 보고서          [Summary] [분석] [시나리오] [부록]   [LIVE 1,861,000 ▾1.01%]   [☾]|
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
- 좌측: 로고 마크(SKH 그래픽 + 텍스트), 우측: 섹션 앵커 nav + 라이브 시세 미니피커 + 테마 토글
- 스크롤 시 배경 `backdrop-filter: blur(16px)` + bg-overlay 적용 (글래스)
- 모바일: 햄버거로 nav 축소, 라이브 시세는 유지
- 스크롤 진행 표시 바 (헤더 하단 1px, accent gradient)

### [01] Hero

```
                        [overline]  ANALYSIS · 2026-05-12 · KST
                        [display-1]  1년에 9.6배.
                                     SK하이닉스, 슈퍼사이클 정점에서.
                        [body-lg]    OPM 72%, 시가총액 1,319조원.
                                     그리고 5월 13일, 6월, 7월 29일의 분기점.

   ┌─ Metric ─┐  ┌─ Metric ─┐  ┌─ Metric ─┐
   │ 현재가    │  │ 1Y 수익률 │  │ 시가총액  │
   │ 1,861,000│  │ +871%    │  │ 1,319조원 │
   │ ▾ -1.01%│  │ Cycle Pk │  │ 글로벌 16위│
   └──────────┘  └──────────┘  └──────────┘

                                  ⌄ 스크롤
```
- 배경: WebGL fragment shader (radial gradient mesh + noise + 그라데이션 호흡, 20s 루프)
- 입자 네트워크 8~16개 노드, 마우스 위치 따라 약한 parallax
- Display-1은 grain·glow filter. 핵심 키워드 "9.6배" 만 accent gradient text-fill
- Metric 카드는 글래스(border 1px subtle + blur), 호버 시 glow + translateY(-2px)
- 모바일: Metric 카드 세로 스택, 폰트 clamp 자동 축소

### [02] Executive Summary

```
[overline]  EXECUTIVE SUMMARY
[h1]        분기 사상 최고, 컨센 평균 도달. 이제 ‘버틸 수 있느냐’의 게임.

[body-lg]   현재가 1,861,000원은 컨센서스 평균(1,817,130원)에서 -2.36%.
            펀더멘털은 ★★★★★, 기술적 위치는 ★★. 추가 상방은 추가 카탈리스트에 의존.

┌──────────── Verdict Card ────────────┐
│ Stance  Neutral-to-Bullish            │
│ Rating  ★★★★ (out of 5)              │
│ 12M 가중 주가  1,750,000 ~ 1,900,000 │
│ Base 중심     1,500,000 ~ 2,100,000  │
└───────────────────────────────────────┘

[h2] 핵심 강점
┌─ Strength ─┬─ Strength ─┬─ Strength ─┐
│ OPM 72%   │ Rubin 70% │ 순현금 35조│   ← 카드 hover시 evidence chip 펼침
└────────────┴────────────┴────────────┘

[h2] 핵심 우려
┌─ Concern ──┬─ Concern ──┬─ Concern ──┐
│ 삼성 추격  │ 베타 2.03  │ NVIDIA 의존│
└────────────┴────────────┴────────────┘

[Consensus bar]   Buy 36 ▓▓▓▓▓▓▓▓▓▓▓░  Hold 1 ░  Sell 0
```
- Verdict는 별점 dial을 SVG 호로 표현. 단순 5점이 아닌 6개 dimension(펀더·산업·심리·밸류·기술·정책) 레이더 차트와 호환되도록 데이터 구조 준비
- 카드 hover: shadow-default → shadow-default + glow-cyan, body 옆에 evidence chip 3개 fade-in (stagger 80ms)

### [03] Pillars (5개 분석 영역)

각 Pillar는 동일한 골격을 공유한다 — **눈과 뇌가 같은 카덴스로 정보를 받게**:

```
[overline] PILLAR #N · YYYY 키워드
[h1]       타이틀 (HBM 슈퍼사이클 정점의 마진 폭발 등)
[body-lg]  리드 한 문장 (요약 결론)

[ChartContainer]
  ┌──────────────────────────────────────────────────────┐
  │ [chart title]                                         │
  │ [chart subtitle, legend chip row]                     │
  │ ╭──────────── canvas / svg ──────────────╮            │
  │ │                                          │            │
  │ ╰──────────────────────────────────────────╯            │
  │ tooltip ↗                                              │
  └──────────────────────────────────────────────────────┘

[Key Takeaways 3-bullet]
  • 핵심 1
  • 핵심 2
  • 핵심 3

[SourceLink row]  Investing.com · StockAnalysis · FnGuide ↗
```

#### 3-1. 시장 데이터 — Pillar
- 차트: **1Y 가격 인터랙티브 라인 차트**. priceHistory 19포인트 + 5/11(+13.4%)·5/12(신고가) 강조 마커
- 보조: 52주 고/저 라벨, 이동평균선 4종(MA20/50/100/200) 토글, 거래량 하단 미니 바
- 인터랙션: 호버 시 십자선 + 툴팁(날짜·종가·이벤트 라벨)
- 데이터 라벨: "9.6배 (193,500 → 1,967,000)", "5/11 +13.4% 급등", "5/12 신고가"
- 우측 사이드 카드: Forward PER 5.93x / PBR 7.06 / ROE 61.2% / 베타 2.03 (mono 타이포)

#### 3-2. 펀더멘털 — Pillar
- 차트: **5년 매출/OP/NP 콤보 (FY21~FY26E)**. 막대는 매출, 라인은 OPM, OP는 면적 또는 보조 막대
- 사이클 페이즈 컬러 매핑: 호황 → 다운 → 회복 → 슈퍼 → 정점
- FY26E·FY27E는 stripe 패턴으로 추정 표기
- 보조: 1Q26 헤드라인 4 미니 KPI (매출 52.6 / OP 37.6 / NP 40.4 / OPM 72%)
- 인터랙션: FY 호버 시 부문별 분해(DRAM 78% / NAND 21%) 사이드 패널 슬라이드 인

#### 3-3. 산업 — Pillar
- 차트 A: **HBM 점유율 도넛** (TrendForce 2026 bit / Counterpoint 매출 / HBM4 forecast 3개 데이터셋 토글)
- 차트 B: **NVIDIA 공급 매트릭스 히트맵** (행: 9개 GPU/ASIC × 열: SK/삼성/마이크론)
- 보조: AI 서버 출하 +28%, 하이퍼스케일러 CAPEX $670B 등 산업 메트릭 4개
- 인터랙션: 토글 시 도넛 morph 애니메이션 (motion-designer 협의), 히트맵 셀 호버 시 GPU 상세 카드 팝

#### 3-4. 시장 심리 — Pillar
- 차트: **컨센서스 분포 점도** — X축 발표일, Y축 TP. 10개 증권사 점 + BNK 다운그레이드 강조 + 현재가 1,861,000 가로선 + 컨센 평균선
- 보조: Buy 36/Hold 1/Sell 0 분포 바, 단기 카탈리스트 vs 우려 매트릭스 미니
- 인터랙션: 점 호버 시 증권사·의견·이전 TP 변화 카드

#### 3-5. 리스크 — Pillar
- 차트: **영향력 × 가능성 매트릭스 히트맵** (3x3 셀, Top 7 강조 글로우)
- 라벨 위치: D(고/상), J1(고/상), A1(중/상), E(고/중), F1(고/중), F2(중/상), G1(중/상) 등
- 인터랙션: 셀 호버 시 해당 리스크 카드 (요약·트리거) 옆 슬라이드
- 보조: 헤지 가능성 표 (재무 / 환율 / 공급망 / 고객 / 사이클 / 외부)

### [04] 시나리오

```
[overline] SCENARIO
[h1]      앞으로 12개월, 세 가지 길.

[ScenarioToggle]   [ Bear 22.5% ]  [ Base 57.5% ]  [ Bull 22.5% ]
                    └ red glow ─┘   └ cyan glow ──┘  └ green glow ──┘

[Active card 풀폭]
  ┌─── BASE ──────────────────────── 55~60% ─┐
  │ 분점 정착 + Soft Landing                    │
  │ 1,500,000 ~ 2,100,000원                    │
  │ 현재 대비 -19% ~ +13%                      │
  │ 트리거:                                     │
  │  • SK 50% · 삼성 30~35% · 마이크론 15%       │
  │  • Q3 가격 정점 후 soft landing             │
  │  • 환율 1,400~1,450 박스권 …                 │
  └───────────────────────────────────────────┘

[FanChart] — Bear/Base/Bull 12개월 가중 주가 범위 시각화 (Bull 상단 2.8M, Bear 하단 1.0M)
```
- 토글은 큰 pill 3개, 활성 색 그라데이션 + glow
- 시나리오 전환 시 카드 + Fan chart 동시 morph (motion-designer)
- 모바일: 토글 가로 스크롤, 카드 세로 스택

### [05] 모니터링 (90일 타임라인)

```
[overline] NEXT 90 DAYS
[h1]      세 개의 분기점, 그리고 여덟 개의 시그널.

   ─●────────●─────●────●────●─────●────●────●─────●─────────●─→
    5/13   5/15  5/31 6/2 6/18  6/25 7/15 7/29 8/25  9/15   12/31
    MATCH  삼성  M15X CTX FOMC ADR  BOK  Q2    Hot   삼성   우시
   ↑ -     ↑ -   ↑ +  ↑ +  ↑ ±  ↑ ± ↑ ± ↑ +   ↑ +  ↑ -    ↑ ±
```
- 가로 타임라인 (데스크탑) / 세로 (모바일)
- 각 이벤트 노드 색: positive(녹) / negative(적) / neutral(회/시안)
- 호버: 카드 팝 (날짜·요약·카테고리)
- 키보드 ← → 로 이벤트 간 이동 가능

### [06] 부록 (Accordion)

```
[h1] 부록

[Accordion]  데이터 출처 (16개) ▾
[Accordion]  분석 한계 — 데이터 시점·시차 ▾
[Accordion]  데이터 불일치 — 양쪽 기록 ▾
[Accordion]  Disclaimer ▾
```
- 모든 아코디언 기본 닫힘. 사용자 의도적 확장 시에만 정보 노출
- 출처는 카테고리별 칩(company/market/industry/policy/consensus) + 외부 링크 아이콘
- 한계는 보고서 부록 B를 그대로 옮기되, "추정", "N/A", "불일치" 태그 표시

### [07] Footer

```
SK Hynix Analysis Team — 5인 분석가 + 통합 오케스트레이터
다음 갱신: 2026-06-05 · 2026-06-18 · 2026-07-29
정보 제공 목적이며 투자 자문이 아닙니다.
© 2026
```

---

## 3. 스크롤 행동

| 트리거 위치 (vh 기준) | 모션 시그널 | duration | 비고 |
|---|---|---|---|
| 0~100vh (Hero) | WebGL 입자 마우스 parallax, Display-1 fade+rise, Metric stagger 80ms | hero=1200ms | 첫 로드 단 1회 |
| 100~120vh | Sticky header bg blur fade-in, progress bar 시작 | fast=150ms | scroll-driven |
| Pillar 진입 (in-view) | overline + h1 → body 순 stagger fade-up | default=280ms × stagger 80ms | IntersectionObserver |
| Chart in-view | 차트 draw-in (라인/막대 path stroke-dashoffset, donut arc growth) | slow=520ms | once-only |
| Scenario toggle | 카드 morph + FanChart re-curve | default=280ms easing-emphasized | 상호작용 |
| Risk matrix cell hover | 셀 scale 1.05 + neighbor dim 0.6 | fast=150ms | hover |
| Timeline event hover | 노드 scale 1.2 + glow, 카드 fade | fast=150ms | hover |
| 부록 accordion expand | height auto, body fade | default=280ms | UI |
| Theme toggle | 토큰 cross-fade (모든 색 transition 280ms) | default=280ms | global |

`prefers-reduced-motion: reduce` 시 모든 motion duration=0, ambient WebGL은 정적 그라데이션으로 대체.

---

## 4. 그리드 & 반응형

### Breakpoints
- xs `360px` — 휴대폰 좁음
- sm `640px` — 휴대폰 가로
- md `768px` — 태블릿
- lg `1024px` — 노트북
- xl `1280px` — 데스크탑 (기본 디자인)
- 2xl `1536px` — 큰 모니터
- ultra `1920px` — 최대 컨텐츠 너비 통제

### 컨테이너 너비
- prose `68ch` — 본문 단락 (가독성 최우선)
- narrow `780px` — Hero 보조 카피
- default `1180px` — 대부분 섹션
- wide `1320px` — 차트가 큰 Pillar
- full `1480px` — Timeline / Hero 백그라운드

### 그리드 패턴
- Hero metric: 1 col (xs) → 3 col (md+)
- Strength/Concern: 1 col → 3 col (md+)
- Pillar 본문: 1 col (chart 100%) → 7+5 split (lg+, 차트 좌·텍스트 우 또는 반대로 각 Pillar 다른 방향으로 리듬)
- Sources: 2 col → 4 col
- Timeline: 세로 (mobile) → 가로 (lg+)

---

## 5. 모션 트리거 위치 요약 (motion-designer 입력)

```
[Hero 배경]            WebGL gradient mesh, 20s ambient loop, mouse parallax (감도 0.3)
[Hero 입자]            12 노드 네트워크, 호흡 0.6s 사인파, mouse repulsion radius 120px
[Display-1]            Reveal: clip-path inset from bottom + opacity, hero duration 1200ms
[Metric 3]             Stagger 80ms, scale-from 0.96 + opacity 0→1
[Section 진입]         IntersectionObserver 0.2 threshold, body stagger 60ms
[Chart draw-in]        Line: stroke-dashoffset, 520ms emphasized
                       Donut: arc growth 0→target, 520ms outQuart
                       Bar: scaleY origin bottom, stagger 50ms
[Scenario toggle]      Card cross-fade 200ms + FanChart spring transition
[Risk matrix]          Top 7 셀에 ambient subtle glow (pulse 3s)
[Timeline]             Marker scale draw + connector line stroke 800ms once
[Accordion]            Height auto + chevron rotate 280ms standard
[Theme toggle]         Global color cross-fade 280ms; 1회 라디얼 wipe (옵션)
[ScrollIndicator]      Hero 하단 마우스 휠 아이콘 + 2s bounce 루프
```

---

## 6. 콘텐츠 우선순위 (모바일 우선 컷)

모바일에서 가장 먼저 보여야 할 정보 순서:

1. **현재가·1Y +871%·시총 1,319조** (Hero metric)
2. **Verdict** ★★★★ + 한 줄 결론
3. **강점 1개 (OPM 72%)** + 우려 1개 (삼성 추격)
4. **1Y 가격 차트** (interactive)
5. **HBM 점유율 도넛**
6. **시나리오 토글**
7. **컨센서스 분포**
8. **리스크 매트릭스**
9. **90일 이벤트**
10. 부록·출처

차트가 좁은 폭에서 깨지지 않도록 모든 차트는 `min-width: 0; aspect-ratio` 베이스로 작성.

---

## 7. 접근성 & 다크/라이트

- 모든 텍스트 컬러 페어 (text-primary on bg-primary)는 WCAG AA 4.5:1 이상 확보 (design-tokens.json 다크/라이트 모두 검증 기준 통과)
- 차트 viz-1~8 컬러는 색맹 친화 팔레트 위주(시안/퍼플/주황/앰버 — 적·녹 단독 의존 금지)
- 키보드 탐색: Skip to content → Header nav → 각 섹션 앵커 → 차트 인터랙션은 화살표키
- Focus ring: accent-primary 2px outline + 4px soft glow
- `prefers-reduced-motion`: 모든 ambient·scroll-driven 모션 비활성, WebGL은 정적 백업 이미지
- 차트 데이터는 `<table>` semantic backup 제공 (스크린 리더용 visually-hidden)

---

## 8. 후속 팀원이 받는 입력

| 팀원 | 입력 파일 |
|---|---|
| visualization-engineer | `design-tokens.json`(컬러 viz-1~8/heat/company) + `data.json`(7개 차트 데이터셋) + `component-catalog.md`(ChartContainer 인터페이스) |
| frontend-engineer | `design-tokens.json` 전체 + `information-architecture.md` 섹션 흐름·반응형 + `component-catalog.md` 컴포넌트 명세 + `style-guide.md` |
| motion-designer | `design-tokens.json` motion 토큰 + 본 문서 §3·§5 트리거 표 + Hero WebGL 컨셉 ("radial gradient mesh + 입자 네트워크 + noise") |
| web-qa | 본 문서 §7 + `style-guide.md` 검증 항목 + `data.json` 원본 수치 매칭 검증 리스트 |

---

## 9. 디자인 결정 Why-노트

- **다크 모드 우선**: 금융 데이터 시각화 톤(Bloomberg/Robinhood)·야간 트레이더 컨텍스트·네온 액센트 효과 극대화. 라이트 모드는 인쇄/회의실 시연용 옵션.
- **Hero에서 "9.6배" 단일 키워드 강조**: 보고서의 첫 정보 시그널(193,500 → 1,861,000)이 1년 변동률 +871% 보다 직관적이므로 9.6배를 시각 hook으로 채택.
- **5개 Pillar 통일 골격**: 다섯 영역 모두 [overline → h1 → 리드 → 차트 → 3-bullet → 출처] 동일 카덴스 — 사용자의 인지 부담 감소 + 모션팀이 단일 진입 시퀀스 정의 가능.
- **Pillar 좌/우 교차 split**: 1·3·5번 차트 좌측, 2·4번 차트 우측 — 스크롤 리듬을 만들어 단조로움 방지.
- **Verdict를 Executive Summary 안에**: 사용자가 첫 화면에서 결론(Neutral-to-Bullish ★★★★)을 얻고, 이후 Pillar들은 근거 탐색. 결론 후행 구조보다 직관적.
- **시나리오를 Pillar 뒤에 분리**: 5개 Pillar(현재 데이터)와 시나리오(앞으로)를 분리하여 시간축 전환을 명시.
- **부록은 Accordion 기본 닫힘**: 출처·한계는 사용자 의도 시 노출. 첫 화면 노이즈 최소화.
