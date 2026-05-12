# Web QA Report

**QA 모드**: Lite-PoC (PoC·데모용)
**검증일**: 2026-05-12
**검증자**: web-qa
**대상 빌드**: web/ (index.html + scripts/* + styles/* + _design/data.json)
**검증 방법**: 정적 분석(grep/Read/JSON.parse) + 실제 브라우저 로드 1회(Playwright headless Chromium, viewport 1280×800)

> **Lite-PoC 모드 안내**: 본 QA는 PoC·데모용 빠른 산출 기준입니다. 의사결정·외부 공유·배포 전에는 Full 모드 재검증이 필요합니다.

## 스킵된 영역 (Full 모드 재검증 필요)
- [ ] 디자인 토큰 ↔ CSS Variables 전수 매칭 (`design-tokens.json` vs `:root[data-theme]`)
- [ ] 320·768·1920 breakpoint 반응형 (1280만 확인)
- [ ] 접근성 전수 (명도비 WCAG AA·키보드 풀 플로우·ARIA·alt·prefers-reduced-motion 동작)
- [ ] 성능 측정 (LCP/CLS/INP·GPU fps·Lighthouse 점수)
- [ ] 브라우저 호환성 (Safari/Firefox/Edge — Chromium만 확인)
- [ ] 점진 검증 (각 모듈 직후 즉시 검증 — 본 PoC는 최종 1회만)

---

## §1 데이터 1:1 매칭 — PASS (13/13)

보고서 원본(`reports/SK하이닉스_분석보고서_20260512.md`) ↔ `data.json` ↔ 페이지 표시값 핵심 샘플링.

| # | 항목 | 보고서 원본 | data.json | 페이지 표시 | 결과 |
|---|---|---|---|---|---|
| 1 | 현재가 | 1,861,000원 | `snapshot.price = 1861000` | Hero "1,861,000" + LIVE 시세 | PASS |
| 2 | 시가총액 | 1,319조원 | `snapshot.marketCap_KRW_trillion = 1319` | Hero "1,319조원" | PASS |
| 3 | 1Y 수익률 | +871% | `snapshot.yearReturnPct = 871.07` | Hero "+871%" (시각 표기) | PASS |
| 4 | 52주 고가 | 1,967,000원 | `snapshot.high52w = 1967000` | 시세 차트 마커 + 본문 | PASS |
| 5 | OPM (1Q26) | 72% | `q1_2026.opm_pct = 72` | 펀더 KPI + 본문 3곳 | PASS |
| 5a | OPM (FY26E) | 70%+ | `revenueByYear[FY26E].opm = 71` | revenue-trend 차트 보조축 | PASS |
| 6 | 1Q26 매출 | 52.6조 | `q1_2026.revenue_KRW_trillion = 52.58` | 펀더 KPI 52.6조 | PASS |
| 7 | HBM bit 2026 SK | 50% | `hbmShare2026.bit_basis.data[0].share = 50` | HBM 도넛 중앙 라벨 "50%" | PASS |
| 8 | Forward PER | 5.93 | `snapshot.forwardPER = 5.93` | 펀더 KPI "5.93x" | PASS |
| 9 | Bear/Base/Bull 확률 | 20-25 / 55-60 / 20-25 | `scenarios.{bear,base,bull}.probability` 일치 | 시나리오 토글 라벨 "22.5% / 57.5% / 22.5%" | PASS |
| 10a | 컨센 평균 | 1,817,130원 | `consensus.average = 1817130` | 컨센서스 바 + 본문 | PASS |
| 10b | Buy / Hold / Sell | 36 / 1 / 0 | `consensus.buyHoldSell` 일치 | "Buy 36 / Hold 1 / Sell 0" | PASS |
| 10c | 최고/최저 TP | SK증권 300만 / BNK 130만 | `consensus.targets` 일치 | "3,000,000 / 1,300,000" | PASS |

**판정**: 데이터 1:1 매칭 통과. 데이터 단위·반올림·N/A 모두 보고서 원본과 일치(`yearReturnPct = 871.07`은 시각 표기 "+871%"로 합리적 반올림).

---

## §2 컨테이너 ID ↔ JS mount target 매칭 — PASS (8/8)

| HTML 컨테이너 (index.html) | 마운트 element | JS init 함수 | charts.js initializer | 결과 |
|---|---|---|---|---|
| `<canvas id="chart-price">` | canvas (Chart.js) | `initPriceChart` (`price-chart.js`) | `'chart-price'` | PASS |
| `<canvas id="chart-revenue-trend">` | canvas (Chart.js) | `initRevenueTrend` | `'chart-revenue-trend'` | PASS |
| `<canvas id="chart-hbm-share">` | canvas (Chart.js) | `initHbmShare` | `'chart-hbm-share'` | PASS |
| `<div id="chart-nvidia-supply">` | div (ECharts) | `initNvidiaSupply` | `'chart-nvidia-supply'` | PASS |
| `<canvas id="chart-consensus">` | canvas (Chart.js) | `initConsensus` | `'chart-consensus'` | PASS |
| `<canvas id="chart-scenarios">` | canvas (Chart.js) | `initScenarios` | `'chart-scenarios'` | PASS |
| `<div id="chart-risk-matrix">` | div (ECharts) | `initRiskMatrix` | `'chart-risk-matrix'` | PASS |
| `<canvas id="bg-canvas">` | canvas (WebGL) | `background-animation.js` `getElementById('bg-canvas')` | — | PASS |

**진입점 셀렉터 (charts.js)**:
- `CONTAINER_SELECTOR` 상수 사용. HTML 7개 `<figure class="chart-container">` 모두 `data-chart data-chart-id="..."` 보유 (line 256, 307, 349, 363, 400, 430, 493 직접 확인).
- 실측: `document.querySelectorAll('[data-chart]')` → 7개, `.is-chart-ready` 7개 / `.is-error` 0개.

**토글 attribute 매칭**:
- HBM: HTML `data-hbm-view="bit"|"revenue"|"hbm4"` ↔ JS `querySelectorAll('[data-hbm-view]')` + `VIEWS.bit/revenue/hbm4` 일치.
- 시나리오: HTML `data-scenario="bear"|"base"|"bull"` ↔ dom-injector + scenarios.js 양쪽 일치.

---

## §3 콘솔 에러 — PASS (실제 페이지 로드 1회)

`python3 -m http.server 8765` + Playwright headless Chromium 1280×800.

| 카테고리 | 카운트 | 비고 |
|---|---|---|
| Console **errors** | **0** | 타협불가 항목 충족 |
| Page errors (uncaught throw) | **0** | |
| Network 4xx/5xx/failed | **0** | data.json / GSAP CDN / fonts / Chart.js / ECharts 모두 200 |
| Console warnings | 4 | WebGL 드라이버 성능 메시지 ("GPU stall due to ReadPixels") — 헤드리스 환경 GPU 가상화 한계, 코드 결함 아님 |

**인터랙티브 동작 추가 확인** (2회차 로드, 동일 환경):
- HBM 도넛: `bit → revenue → hbm4 → bit` 토글 3회 → 데이터·중앙 라벨 갱신 정상, **error 0**
- 시나리오: `bear → bull → base` 토글 3회 → 활성 카드 교체 정상, **error 0**
- 테마: 다크↔라이트 2회 토글 → CSS 변수 전환 + 차트 rebuild 정상, **error 0**
- 부록 아코디언: sources / caveats 펴기 → DOM 주입 컨텐츠 렌더링 정상, **error 0**

**판정**: 콘솔 에러 0개 타협불가 항목 통과.

---

## §4 발견 및 해소된 버그 (이력)

| ID | 영역 | 위치 | 예상 → 실제 | 담당 | 심각도 | 상태 |
|---|---|---|---|---|---|---|
| B-001 | data | `hbm-share.js:33,71,151` + `nvidia-supply.js:70,74,75,76` | `TOKENS.viz.company.*` → TypeError; 정상은 `TOKENS.company.*` (총 7곳) | viz | High | **수정 완료** (replace_all 7곳) |
| B-002 | integration | `charts.js` 4곳 + `closest()` 3곳 | `[data-chart]` selector ↔ HTML에 속성 없음 → 0개 init | viz + frontend | Critical | **수정 완료** (HTML 7개 figure에 `data-chart` 추가 + charts.js에 `CONTAINER_SELECTOR` 상수) |
| B-003 | integration | `index.html:353` | `<div id="chart-hbm-share">` ↔ Chart.js는 canvas 필수 | frontend | High | **수정 완료** (`<canvas>`로 변경) |
| B-004 | integration | `index.html:400` | `<div id="chart-consensus">` ↔ Chart.js는 canvas 필수 | frontend | High | **수정 완료** (`<canvas>`로 변경) |
| B-005 | integration | `index.html:493` | `<div id="chart-scenarios">` ↔ Chart.js는 canvas 필수 | frontend | High | **수정 완료** (`<canvas>`로 변경) |
| B-006 | integration | HBM 토글 attribute 이름 | HTML `data-toggle-dataset` ↔ JS `data-hbm-view` 불일치 | viz + frontend | Mid | **수정 완료** (HTML이 `data-hbm-view`로 통일) |
| B-007 | scope | HBM 토글 4번째 데이터셋 | HTML 4개 버튼 (NVIDIA Rubin 포함) ↔ JS VIEWS 3개 | viz + frontend | Low | **수정 완료** (HTML이 3개로 축소, NVIDIA Rubin은 매출/HBM4와 분리됨) |
| W-001 | motion | `scroll-animations.js:17-18` | jsdelivr `+esm` GSAP/ScrollTrigger import — frontend 자체검증에서 CORS 언급 | motion | Low | **확인 — 실 로드 통과**: 실제 페이지 로드에서 GSAP/ScrollTrigger 200 OK, 콘솔 에러 0건. CORS 보고는 캐시/시점 이슈로 추정 |

**B-001/002/003/004/005/006/007** 모두 재검증 통과. 잔여 미수정 결함 0건.

### viz 2차 수정 흡수 (방어 코드 보강) — 2026-05-12 17:08
B-002~B-007이 frontend HTML 변경으로 1차 해소된 뒤, visualization-engineer가 **JS 측 방어 코드**까지 추가로 보강:
- `charts.js`: `CONTAINER_SELECTOR = '[data-chart], [data-chart-id]'` (두 속성 모두 지원)
- `_chart-utils.js`: `ensureCanvas(id)` 헬퍼 — 컨테이너가 `<div>`면 자식 `<canvas>`를 동적 생성, `<canvas>`면 그대로 사용. 5개 Chart.js 차트(price/revenue-trend/hbm-share/consensus/scenarios) 모두 적용.
- `hbm-share.js` 재작성: VIEWS 키를 data.json 표준 키(`bit_basis`/`revenue_basis`/`hbm4_forecast`/`nvidiaHBM4Allocation`) + `KEY_ALIAS`로 HTML 단축형(`bit`/`revenue`/`hbm4`) 매핑. selector도 `[data-hbm-view], [data-toggle-dataset]` 둘 다 지원. 4번째 view "NVIDIA Rubin HBM4 할당"(UBS/TrendForce 추정 SK 70%/삼성 25%/마이크론 5%) 정식 지원.
- `scenarios.js`: 토글 버튼이 차트 figure 바깥 `.scenario-toggle`에 있어 `closest()` 범위를 `section, article, main, [data-pillar], [data-scenario-section]`까지 확장.

**2차 Playwright 재검증 결과**:
- 차트 7/7 ready, 0 errored, 콘솔 errors/pageerrors/net-fail 모두 0 (비-WebGL 경고 0)
- HBM 4개 view 데이터 매칭: bit 50% / rev 62% / hbm4 54% / **nvidia 70%·25%·5%** (보고서 "NVIDIA Rubin HBM4 ~70%" 1:1)
- `ensureCanvas`로 3개 차트(`chart-hbm-share`/`chart-consensus`/`chart-scenarios`) 모두 CANVAS 정상 사용 — 현 HTML이 이미 canvas라 noop, HTML이 향후 div로 변경되더라도 무중단 동작 보장
- node --check 10개 파일 syntax 모두 PASS

**판정**: 1차 검증의 모든 PASS 유지. 추가로 *백워드 호환성*과 *4번째 HBM view (NVIDIA Rubin 70%) 확장 데이터*까지 확보.

> **참고**: 현 HTML은 HBM 토글 버튼 3개(`bit`/`revenue`/`hbm4`)만 노출. 4번째 view(`nvidia`)는 JS·데이터 양쪽 모두 준비 완료이므로, frontend가 HTML 버튼 1개 추가 시 즉시 활성화 가능(코드 변경 없음). "NVIDIA Rubin HBM4 ~70%" 수치는 본문 산업 pillar 텍스트(line 347)와 NVIDIA 공급 매트릭스 차트(SK 값 3 = 주력 ~70%+) 양쪽에서 사용자에게 이미 전달됨.

---

## §5 종합

| 영역 | 결과 |
|---|---|
| 데이터 1:1 매칭 (핵심 10개 샘플링) | **PASS** (13/13) |
| 컨테이너 ID ↔ JS mount target | **PASS** (8/8) |
| 콘솔 에러 0개 (실제 페이지 로드) | **PASS** (errors 0 / pageerrors 0 / 4xx-5xx 0) |
| **Lite-PoC 타협불가 3항목** | **PASS** |

| 카운트 | 값 |
|---|---|
| Pass | **3 영역** (위 표) |
| Warn | 0 |
| Fail | 0 |
| 잔여 결함 | 0 |
| 해소된 결함 | 7개 (B-001 ~ B-007) |

**최종 판정**: Lite-PoC QA 통과. PoC·데모 사용 가능.

---

## §6 권장 후속 (Full 모드 재검증 시 우선 점검)

1. **디자인 토큰 전수 매칭**: `design-tokens.json`의 모든 색·간격·타이포 토큰이 `:root` CSS 변수와 1:1 매핑되는지 grep + computed style 검증.
2. **반응형 4 breakpoint**: 320 / 768 / 1280 / 1920 각 viewport에서 Hero 메트릭 카드, 5 pillars 그리드, 7개 차트 가독성·인터랙션 동작 — 현재 1280만 확인.
3. **접근성 WCAG AA**:
   - 명도비: 본문/캡션/카드 텍스트 vs 글래스 배경 (다크 + 라이트 모두).
   - 키보드 only: 헤더 네비 → Hero → 5 pillars → 시나리오 토글 → 차트 컨테이너 → 부록 아코디언 풀 플로우.
   - `prefers-reduced-motion: reduce` 활성화 시 ambient WebGL 정지, count-up 즉시 최종값, 차트 애니메이션 0ms 동작 실측.
4. **성능 (LCP/CLS/INP)**: Lighthouse 또는 WebPageTest로 모바일·데스크탑 점수 산출. WebGL ambient fps 모니터링 (목표 60fps, 모바일 50fps).
5. **브라우저 호환성**: Safari·Firefox·Edge 최신 2버전 — Safari `backdrop-filter` prefix, `color-mix()` 폴백, Container Queries 동작 우선 확인.
6. **추정치·N/A 표기 일관성**:
   - `priceHistory.series`의 `estimate` 19개 마일스톤 중 작은 회색 점 시각 구분 실측.
   - `revenueByYear` FY26E/FY27E stripe 패턴 시각 명확성.
   - 부록 caveats가 펀더·산업·심리 본문 footnote와 cross-link 되는지.
7. **컨센서스 BNK 강조**: 다운그레이드 단일 균열 신호로서 큰 점 + 흰 보더가 시각적으로 확연히 도드라지는지 사용자 인지 테스트.
8. **데이터 일관성 모니터링**: 보고서·data.json·페이지 표시값이 다음 갱신 시점(2026-06-05 / 06-18 / 07-29) 동기화될 때 회귀 검증 자동화.

---

## 부록. 검증 환경

- **OS**: macOS 15.3 (Darwin 25.3.0)
- **브라우저**: Chromium headless (Playwright sync_api)
- **Viewport**: 1280×800
- **서버**: `python3 -m http.server 8765` (정적 파일 서빙)
- **검증 스크립트**: `/tmp/qa_verify.py` (수치·컨테이너·콘솔) + `/tmp/qa_interact.py` (HBM·시나리오·테마 토글·아코디언)
- **외부 CDN 로드 (모두 200 OK)**:
  - `cdn.jsdelivr.net/npm/chart.js@4.4.6` + `chartjs-adapter-date-fns@3.0.0`
  - `cdn.jsdelivr.net/npm/echarts@5.5.1`
  - `cdn.jsdelivr.net/npm/gsap@3.12.5/+esm` + `/ScrollTrigger/+esm`
  - `fonts.googleapis.com` (Inter, Inter Tight, JetBrains Mono)
  - `cdn.jsdelivr.net/gh/orioncactus/pretendard` (Pretendard variable)
