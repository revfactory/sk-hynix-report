# Style Guide — SK하이닉스 분석 보고서 웹

**owner**: design-lead
**version**: 1.0.0
**updated**: 2026-05-12

본 가이드는 후속 팀원(frontend / visualization / motion / qa)이 자율적으로 엣지 케이스를 판단할 수 있도록 만든 의사결정 백서다. 모든 결정은 `design-tokens.json`의 토큰을 단일 진실로 따른다.

---

## 1. 디자인 철학 (한 줄)

> **Bloomberg의 데이터 밀도, Linear의 UI 정제, Stripe의 그라데이션 감각, Apple의 타이포 규율** — 다크 모드를 기본으로 두되 색상은 절제하고 데이터를 주인공으로 만든다.

채택 트렌드 (모두 의식적):
1. **글래스모피즘** — 카드/툴팁/header에 `backdrop-filter: blur()` + 반투명 bg
2. **다크 모드 우선** — 야간 트레이더·금융 데이터 톤
3. **큰 타이포** — Hero display-1 max 7.5rem까지
4. **네온 액센트 그라데이션** — Hero 키워드, accent gradient (cyan → purple → pink)
5. **마이크로 인터랙션** — 호버 translateY/glow, 차트 draw-in, 시나리오 morph

---

## 2. 카드 패딩 · 간격 규칙

| 컨텍스트 | padding | gap |
|---|---|---|
| Hero metric card (sm) | `--space-5 --space-6` (20/24px) | `--space-3` |
| Strength/Concern card (default) | `--space-7 --space-8` (28/32px) | `--space-4` |
| Pillar 내부 chart 카드 | `--space-6 --space-8` | `--space-6` |
| Scenario card (full) | `--space-8 --space-10` | `--space-6` |
| Accordion body | `--space-6` | `--space-4` |
| Source link grid item | `--space-4 --space-5` | `--space-2` |

**원칙**: 카드 안 콘텐츠 간 vertical gap은 모두 `--space-4 (16px)` 기본, 시각적 hierarchy 강조 필요 시 `--space-6 (24px)`. 절대 임의 px 값 사용 금지.

섹션 사이 간격은:
- 모바일: `--space-section-y-sm` (4~6rem)
- 데스크탑: `--space-section-y-md` (5~8rem)
- Hero ↔ Executive Summary: `--space-section-y-lg` (7~11rem) — 첫 전환 강조

---

## 3. 타이포 사용 규칙

### 위계
```
display-1     Hero 메인 1번만 사용
display-2     Hero 보조 또는 Pillar 헤딩 강조에 sparingly
h1            섹션 헤딩 (Hero 제외, 페이지 당 5~7개)
h2            서브섹션, 시나리오 카드 제목
h3            카드 타이틀
h4            리스트 헤더, 표 column header
body-lg       리드 문장 (각 섹션 첫 단락)
body          기본
body-sm       메타 정보, 보조 텍스트
caption       날짜·출처·메타
overline      라벨 (UPPERCASE + 0.14em letter-spacing)
metric-*      모든 숫자
mono-sm       표 내부 숫자, 툴팁
```

### 폰트 페어링
- 디스플레이·헤딩: `Inter Tight` + `Pretendard Variable` (한글)
- 본문: `Inter` + `Pretendard Variable`
- 숫자: `JetBrains Mono` + `IBM Plex Mono` fallback — 표·메트릭·코드·tick 모두 강제 mono

### 금지 사항
- `text-align: justify` 금지 (한글 가독성 저하)
- 본문은 `line-height: 1.6` 고정, h1~h3는 `1.2` 이하
- `font-family` 하드코딩 금지 — `--font-display`, `--font-body`, `--font-mono` CSS 변수만 사용
- 영문/숫자 단어 끊김 방지를 위해 `word-break: keep-all`, `overflow-wrap: anywhere` 한글 본문에 적용

### 강조
- 본문 내 강조 → `<strong>` + `color: var(--text-primary)` (다크) 또는 `color: var(--accent-primary)`
- 키워드 그라데이션 강조 (예: "9.6배")는 Hero에서 1회만 사용. 본문에서 남발 금지.
- 숫자 강조 → mono + 한 단계 높은 size

---

## 4. 컬러 사용 규칙

### 의미 체계
| 의미 | 다크 토큰 | 라이트 토큰 | 사용처 |
|---|---|---|---|
| 강세·상승 | `--state-bull` (#10B981) | `--state-bull` (#059669) | 상승 메트릭, Bull scenario, Strength evidence, 호재 이벤트 |
| 약세·하락 | `--state-bear` (#EF4444) | `--state-bear` (#DC2626) | 하락 메트릭, Bear scenario, 경고 이벤트, 리스크 high |
| 중립 | `--state-neutral` | 동일 | Hold 의견, 중립 이벤트 |
| 경고·주의 | `--state-warning` (앰버) | `--state-warning` | 정책 이벤트, 리스크 mid |
| 정보·강조 | `--accent-primary` (시안) | `--accent-primary` (#0891B2) | HBM 강조, 링크, focus ring |
| AI·기술 | `--accent-secondary` (퍼플) | 동일 | 산업 Pillar, AI 메트릭 |
| 데이터 액센트 | `--accent-tertiary` (앰버) | 동일 | 펀더멘털 매출/OP 막대 |

### 차트 시리즈 컬러 순서
1. **viz-1 시안** (#06B6D4) — SK하이닉스 항상 1번
2. **viz-2 퍼플** (#A78BFA) — 삼성전자
3. **viz-3 오렌지** (#FB923C) — 마이크론
4. **viz-4 앰버** (#FBBF24) — 4번째 시리즈
5. **viz-5 그린** (#4ADE80) — 5번째
6. **viz-6 핑크** (#F472B6) — 6번째
7. **viz-7 스카이** (#38BDF8) — 7번째
8. **viz-8 라벤더** (#C084FC) — 8번째

NVIDIA / AMD / Google / AWS 등 외부 회사 비교 시 `--viz-company-*` 매핑 사용 (NVIDIA = green #76B900 NVIDIA 브랜드 컬러 무리없이 인식).

### 시나리오 컬러
- Bear: 적색 + 그라데이션 (#EF4444 → #F59E0B) 글로우
- Base: 시안 + 그라데이션 (#06B6D4 단색 글로우)
- Bull: 녹색 + 그라데이션 (#10B981 → #06B6D4) 글로우

### 다크/라이트 모드 매핑 규칙
- 라이트 모드는 다크의 미러가 아니라 **공식 페어**: 토큰 키가 동일하되 값이 다름
- 컴포넌트는 토큰 이름만 참조 (`color: var(--text-primary)`). 모드별 분기 코드 작성 금지
- 모드 전환은 `[data-theme="dark|light"]` 루트 attribute 변경 + CSS 변수 cascade

---

## 5. 그라데이션 사용 예

| 그라데이션 | 사용처 |
|---|---|
| `--gradient-hero` | Hero 배경 (WebGL이 비활성일 때의 정적 fallback) |
| `--gradient-accent` | Hero 키워드 텍스트 fill, 활성 ScenarioToggle Base, ConsensusBar buy 세그먼트 |
| `--gradient-accentSubtle` | Strength card 좌상단 코너 글로우 |
| `--gradient-bull` | Bull ScenarioCard 헤더, 상승 메트릭 강조 라인 |
| `--gradient-bear` | Bear ScenarioCard 헤더 |
| `--gradient-neon` | Pillar 진입 시 1회 sweep 모션 (motion-designer 선택) |
| `--gradient-card` | 카드 vertical fade (위→아래 약간 어둡게) |

**금지**: 그라데이션을 본문 텍스트에 무차별 적용 금지. 의도된 1~2 keyword에 한해 사용.

---

## 6. 아이콘 사용 규칙

- **라이브러리**: Lucide 단일 (`lucide-react` 또는 SVG sprite)
- **스트로크**: 1.75 고정
- **사이즈**: xs(14)/sm(16)/default(20)/lg(24)/xl(32) 5단계만
- **색**: `currentColor` 상속, 별도 색 지정 시 `--text-secondary` 또는 의미 컬러

### 아이콘 → 의미 매핑 (표준 사전)
| icon | 의미 |
|---|---|
| `trending-up` | 상승, 강점 |
| `trending-down` | 하락 |
| `alert-triangle` | 우려, 경고 |
| `shield-check` | 재무 건전성, 헤지 |
| `trophy` | 1위, 시장 지배 |
| `thermometer` | 과열, 사이클 |
| `git-fork` | 구조 의존, 분기 |
| `calendar` | 이벤트, 일정 |
| `external-link` | 외부 출처 |
| `info` | 주의, 디스클레이머 |
| `chevron-down` | 아코디언 |
| `sun` / `moon` | 테마 토글 |
| `arrow-up-right` | 외부 링크 보조 |
| `target` | 컨센서스 목표가 |
| `activity` | 변동성 |
| `cpu` | HBM, GPU |

이외 아이콘 추가 시 design-lead 결정.

---

## 7. 마이크로 인터랙션 강도 가이드

| 인터랙션 | 효과 | duration | easing |
|---|---|---|---|
| 카드 호버 | translateY(-2px) + shadow → glow | 280ms | standard |
| 버튼 호버 | bg lighten 8% | 150ms | standard |
| 버튼 클릭 | scale(0.97) | 75ms | accelerate |
| 차트 점 호버 | scale(1.6) + 십자선 fade | 150ms | standard |
| 시나리오 토글 | 카드 cross-fade + glow shift | 280ms | emphasized |
| Hero 키워드 호버 | gradient slide 1.5s 한 번 | 800ms | outQuart |
| 섹션 진입 | opacity 0→1 + translateY(16px→0) | 280ms × stagger 80ms | decelerate |
| 차트 draw-in | path stroke-dashoffset / arc growth | 520ms | outQuart |
| accordion expand | height + chevron rotate | 280ms | standard |
| theme toggle | 모든 색 transition | 280ms | standard |

**원칙**:
- 페이지 동시 모션 ≤ 3개 (인지 부하 통제)
- 모든 모션 `prefers-reduced-motion` 대응 (duration 0 + ambient off)
- 호버 효과는 즉각 피드백, 입장 모션은 지연 가능
- 모션은 정보를 전달해야 함 — 장식만을 위한 모션 지양

---

## 8. 차트 디자인 규칙

### 공통
- 최소 높이: 모바일 240px, 데스크탑 320px, 강조 420px, Hero 차트 520px
- aspect-ratio 사용 권장 (`aspect-ratio: 16/9` 등)
- 모든 축 라벨은 `caption` 토큰, `--text-tertiary`
- 그리드 라인은 `--chart-grid-lineColor` (점선 2 4)
- 툴팁: 글래스 (blur + bg-glassHi), `radius-md (10px)`, padding `12px 14px`

### 차트별 권장 종류 (visualization-engineer 입력)
| 차트 | 권장 라이브러리 패턴 | viz colors | 특이사항 |
|---|---|---|---|
| 1Y 가격 (3-1) | Line + area gradient, 이벤트 마커 | viz-1, area subtle | 5/11·5/12 강조 마커, 52w 신고가 라벨 |
| 5년 매출/OP/OPM (3-2) | Combo (bar + line + secondary axis) | viz-1(매출 bar) viz-3(OP bar) viz-2(OPM line) | FY26E/27E stripe pattern |
| HBM 점유율 (3-3 A) | Donut + center label | viz-1/2/3 | 3 데이터셋 토글 시 arc morph |
| NVIDIA 매트릭스 (3-3 B) | 9×3 heatmap | viz heat 0~5 | 셀 호버 GPU 상세 |
| 컨센서스 분포 (3-4) | Scatter (날짜 × TP) + 평균선 + 현재가 가로선 | viz-1 점, viz-3 평균선, viz-2 현재가 | BNK 다운그레이드 점 강조 |
| 리스크 매트릭스 (3-5) | 3×3 grid heatmap + 라벨 점 | risk.high/mid/low | Top 7 글로우 |
| 시나리오 fan (4) | Area band + 3개 시나리오 stacked | scenario.bear/base/bull bg | 12개월 곡선 |

### 차트 인터랙션 표준
- 호버: 십자선 + 툴팁 (delay 100ms)
- 클릭: 데이터 포인트 강조 + 사이드 디테일
- 키보드: Tab으로 컨트롤, 화살표로 포인트 이동
- 모바일: 탭(터치) = 호버, 핀치 줌 금지 (확대 데이터 없음)

---

## 9. 글래스모피즘 적용 규칙

```css
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(var(--blur-default));
  -webkit-backdrop-filter: blur(var(--blur-default));
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-default), var(--shadow-innerHi);
}

.glass-card:hover {
  background: var(--bg-glassHi);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-lg), var(--shadow-glowCyan);
}
```

- 적용 컴포넌트: StickyHeader (스크롤 후), MetricCard, SummaryCard, ChartContainer, ScenarioCard, Tooltip
- 라이트 모드는 blur 16px → 24px (배경 더 흐리게), border 더 진하게
- Safari/Firefox `backdrop-filter` 지원 확인. 미지원 시 solid bg fallback (`@supports not`).

---

## 10. 반응형 결정 트리

```
< 640px (mobile)
  ├ Hero metric 3개 세로 스택
  ├ Strength/Concern 1열
  ├ Pillar chart-full 세로
  ├ Timeline 세로
  └ Scenario toggle 가로 스크롤

640~1023px (tablet)
  ├ Hero metric 가로 3개 (compact)
  ├ Strength/Concern 2열
  ├ Pillar chart-full (큰 차트만 100%)
  ├ Timeline 세로 또는 가로 (콘텐츠 길이 따라)
  └ Scenario toggle 가로 정렬

≥ 1024px (desktop)
  ├ Hero metric 가로 3개
  ├ Strength/Concern 3열
  ├ Pillar 7+5 또는 5+7 split (chart-left/right 자동 교차)
  ├ Timeline 가로
  └ Full feature
```

모든 폰트는 `clamp()` 내장이므로 폰트만으로는 추가 미디어쿼리 불필요. 레이아웃 분기점은 위 3개만 사용.

---

## 11. 컨테이너 너비 결정

| 컨테이너 | 사용처 |
|---|---|
| `--container-prose` (68ch) | 본문 단락만 있는 영역 (없을 가능성 큼) |
| `--container-narrow` (780px) | Hero 보조 카피, Executive Summary 리드 |
| `--container-default` (1180px) | 대부분 섹션 (Pillar, Summary, Footer) |
| `--container-wide` (1320px) | Pillar 중 차트가 큰 것 (3-2, 3-5), Timeline |
| `--container-full` (1480px) | Hero, Timeline 가로 스크롤 |

좌우 padding은 `--container-gutter` (clamp 1.25~2.5rem) 사용.

---

## 12. 데이터 표시 정확성 규칙 (qa 검증 항목)

**보고서 원수치 1:1 매칭 필수**:
- 현재가: 1,861,000원 (▾ 1.01%) — 양쪽 출처 시 1,846,000원 (StockAnalysis) 보조 기록
- 1Y 수익률: +871% (또는 +871.07%, 양쪽 가능)
- 시가총액: 1,319조원 (USD 819B / 글로벌 16위)
- 52주 고/저: 1,967,000 / 193,500 (9.6배)
- Forward PER: 5.93x (펀더 보고서 본문은 5.2x 표기 — 양쪽 합법)
- PBR: 7.06x / PBR 2026E: 3.1x
- ROE: 61.2% / EPS TTM: 106,603원 / 베타: 2.03
- 1Q26: 매출 52.58조 / OP 37.61조 / NP 40.35조 / OPM 72%
- HBM 2026 bit: SK 50% / 삼성 28% / 마이크론 22%
- HBM 2026 매출: SK 62% / 삼성 17% / 마이크론 21%
- HBM4: SK 54% / 삼성 28% / 마이크론 18%
- NVIDIA Rubin: SK ~70%
- 컨센서스 평균: 1,817,130원 (현재 -2.36% 디스카운트)
- Buy 36 / Hold 1 / Sell 0
- 시나리오: Bear 20~25% (1.0~1.3M) / Base 55~60% (1.5~2.1M) / Bull 20~25% (2.3~2.8M)
- 가중 12M 주가 범위: 1,750,000 ~ 1,900,000원

**금지**:
- 반올림 임의 수행 (예: 1,861,000 → 1.86M로 표시 금지)
- 단위 변환 임의 (예: 1,319조원 → 1.3 quadrillion 같은 부적절 변환)
- 출처 불일치 항목을 한쪽만 노출 (양쪽 모두 노출하거나 주석 처리)

---

## 13. 접근성 (a11y) 체크리스트

- [ ] 모든 텍스트 컬러 페어 WCAG AA 4.5:1 이상
- [ ] 모든 인터랙티브 요소 키보드 접근 가능
- [ ] Focus ring `--focus-ring` 일관 적용 (outline-offset 2px)
- [ ] 차트는 `<table>` semantic backup 제공
- [ ] 이미지·아이콘 `alt` 또는 `aria-label`
- [ ] `<button>` vs `<a>` 시맨틱 구분
- [ ] Skip link 1개 ("본문 바로가기")
- [ ] `prefers-reduced-motion: reduce` 시 모든 ambient 모션 off
- [ ] `prefers-color-scheme` 초기값 + localStorage 우선
- [ ] 최소 터치 타겟 44×44px
- [ ] 한글 단어 끊김 방지 `word-break: keep-all`
- [ ] `aria-live="polite"` 차트 툴팁

---

## 14. CSS 변수 네이밍

다음 패턴을 따른다 (CSS:DOM bridge):

```
--bg-primary, --bg-glass, --bg-glassHi
--text-primary, --text-secondary, --text-tertiary
--accent-primary, --accent-secondary, --accent-tertiary
--state-bull, --state-bear, --state-warning
--scenario-bear, --scenario-base, --scenario-bull
--risk-high, --risk-mid, --risk-low
--viz-1 ~ --viz-8
--viz-company-sk, --viz-company-samsung, --viz-company-micron
--space-1 ~ --space-64
--space-section-y-md
--radius-sm/md/lg/xl/2xl/pill
--shadow-sm/default/lg/xl
--shadow-glowCyan, --shadow-glowBull, --shadow-glowBear
--blur-default/lg
--duration-fast/default/slow/hero
--easing-standard/decelerate/emphasized/spring
--container-default/wide/full
--gutter
```

JSON 토큰 → CSS 변수 자동 변환은 frontend-engineer가 빌드 스크립트로 처리 (kebab-case + 평탄화).

---

## 15. 코드 품질 체크리스트 (qa/리뷰)

- [ ] 하드코딩된 색상값 없음 (`#xxx`, `rgba(...)`, `hsl(...)`)
- [ ] 하드코딩된 폰트 패밀리 없음
- [ ] 하드코딩된 spacing px 없음 (radius·border 제외)
- [ ] 모든 컴포넌트에 토큰 변수만 사용
- [ ] `<h1>` 페이지당 1개 (Hero)
- [ ] 차트는 ChartContainer 래핑 통일
- [ ] 외부 링크 모두 `target="_blank" rel="noopener noreferrer"`
- [ ] 모바일 가로 스크롤 발생 없음 (`overflow-x: clip`)
- [ ] 이미지 최적화 (next/image 또는 WebP/AVIF)
- [ ] Lighthouse Performance ≥ 85, Accessibility ≥ 95

---

## 16. 후속 팀원 의사결정 권한

| 결정 권한 | 담당 |
|---|---|
| 디자인 토큰 추가·변경 | **design-lead 단독 결정** |
| 차트 라이브러리 선택 (D3 vs ECharts vs Chart.js) | visualization-engineer |
| 차트별 인터랙션 디테일 | visualization-engineer (단, 표준 호버 패턴은 본 가이드 §7 준수) |
| 컴포넌트 내부 마크업 디테일 | frontend-engineer (단, 시맨틱 가이드 §17 준수) |
| WebGL shader 구체 알고리즘 | motion-designer |
| 모션 미세 조정 (timing) | motion-designer (단, duration 토큰만 사용) |
| 검증 우선순위 | web-qa |

토큰 변경·신규 토큰 요청은 design-lead에게 의견 제시 → 채택 시 본 문서·design-tokens.json 동시 업데이트.

---

## 17. 데이터·시각의 차이를 두는 곳

이 보고서의 "정성 판단" 항목(시나리오 확률, Verdict ★ 별점, 종합 진단)은 시각적으로 **분석가 의견임을 명시**해야 한다:

- 시나리오 카드 헤더에 "분석가 정성 판단" 캡션
- Verdict 별점 옆에 `info` 아이콘 + 툴팁: "정성 판단이며 통계적 확률값 아님"
- 한계 부록(Caveats)을 footer 직전 항상 노출

수치(가격·실적·점유율)는 출처 명시, 의견(시나리오·전망)은 정성 판단 명시. 이 구분이 신뢰의 핵심.
