# SK하이닉스(000660.KS) 다각도 주가 분석 & 인터랙티브 리포트

[![Live Demo](https://img.shields.io/badge/Live-Demo-1F8FFF?style=flat-square)](https://revfactory.github.io/sk-hynix-report/)
![Status](https://img.shields.io/badge/Status-Snapshot%202026--05--12-12B886?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-Vanilla%20HTML%20%2F%20Chart.js%20%2F%20ECharts%20%2F%20GSAP-555?style=flat-square)

> Claude Code 기반의 **다중 에이전트 하네스**가 SK하이닉스 주가를 5축(시세·펀더멘털·산업·심리·리스크)으로 분석한 보고서와, 그 보고서를 **인터랙티브 단일 페이지(SPA-like 정적 사이트)** 로 시각화한 결과물입니다. 작성 시점 스냅샷이며 투자 자문이 아닙니다.

---

## 🔗 라이브 데모

**👉 https://revfactory.github.io/sk-hynix-report/**

> `index.html` 단일 파일로 동작. CSS·JS·`data.json` 이 인라인되어 있어 별도 빌드/서버 없이 그대로 호스팅 가능.

---

## 📂 디렉토리 구조

```
kakaopay-research/
├── index.html                              # 🎯 최종 인터랙티브 페이지 (인라인 CSS·JS·data)
├── reports/
│   └── SK하이닉스_분석보고서_20260512.md   # 📊 통합 분석 보고서 (단일 소스 오브 트루스)
├── _workspace/                             # 5인 분석가의 중간 산출물
│   ├── 00_input.md                         #  - 오케스트레이터 입력
│   ├── 01_market_data.md                   #  - 시세·기술적 지표
│   ├── 02_fundamentals.md                  #  - 실적·밸류에이션
│   ├── 03_industry.md                      #  - 메모리 사이클·HBM 점유율
│   ├── 04_sentiment.md                     #  - 뉴스·컨센서스·심리
│   └── 05_risk.md                          #  - 지정학·환율·기술 리스크·시나리오
├── web/                                    # 빌드 원본 (디자인 토큰·모듈 CSS/JS·data.json)
│   ├── _design/                            #  - 디자인 시스템·IA·data.json
│   ├── styles/                             #  - main / components / animations / responsive
│   └── scripts/                            #  - charts / scroll / microinteractions / bg
├── .claude/
│   ├── agents/                             # 🤖 10인 에이전트 정의
│   └── skills/                             # 🛠️ 13개 스킬 (분석 6 + 웹 6 + 오케스트레이터 2)
└── CLAUDE.md                               # 하네스 운영 규칙
```

---

## 🤖 하네스 구성

이 워크스페이스에는 **두 개의 독립 하네스**가 구축되어 있으며, 보고서 갱신과 웹 시각화가 분리되어 동작합니다.

### 하네스 1 — SK하이닉스 주가 분석

5인의 전문 분석가 에이전트를 오케스트레이터가 병렬 호출 → 결과를 통합 보고서로 합성합니다.

```
                 ┌─────────────────────────────────────────────┐
                 │   📋 hynix-stock-analysis  (Orchestrator)   │
                 └─────────────────────────────────────────────┘
                                      │ (병렬 호출)
   ┌────────────────┬──────────────┼──────────────┬────────────────┐
   ▼                ▼              ▼              ▼                ▼
┌─────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐
│ market  │  │fundamentals│  │ industry │  │ sentiment  │  │   risk   │
│  data   │  │            │  │          │  │            │  │          │
└─────────┘  └────────────┘  └──────────┘  └────────────┘  └──────────┘
 시세/수급    실적/밸류에이션  사이클/HBM    뉴스/컨센서스   지정학/시나리오
   │              │              │              │              │
   ▼              ▼              ▼              ▼              ▼
              _workspace/0N_*.md  (중간 산출물 5종)
                              │
                              ▼
              reports/SK하이닉스_분석보고서_{YYYYMMDD}.md
```

| 역할 | 에이전트 | 스킬 | 산출물 |
|---|---|---|---|
| 시장 데이터 | `market-data-analyst` | `hynix-market-data` | `_workspace/01_market_data.md` |
| 펀더멘털 | `fundamentals-analyst` | `hynix-fundamentals` | `_workspace/02_fundamentals.md` |
| 산업 | `industry-analyst` | `hynix-industry` | `_workspace/03_industry.md` |
| 심리/뉴스 | `sentiment-analyst` | `hynix-sentiment` | `_workspace/04_sentiment.md` |
| 리스크/시나리오 | `risk-analyst` | `hynix-risk` | `_workspace/05_risk.md` |
| **오케스트레이션** | — | **`hynix-stock-analysis`** | `reports/...md` |

**트리거 예시**
- 초기 실행: `"하이닉스 주가 분석해줘"`, `"SK하이닉스 보고서 작성"`, `"000660 다각도 분석"`
- 부분 재실행: `"리스크 섹션만 다시"`, `"실적 반영해서 펀더멘털만 업데이트"`

---

### 하네스 2 — 보고서 → 인터랙티브 웹페이지 빌드

5인의 웹 전문가 에이전트가 보고서를 시각화 가능한 정적 사이트로 변환합니다. `report-to-webpage` 오케스트레이터가 디자인 → 데이터 추출 → 차트 → 마크업/모션 → QA 순서로 조율.

```
   reports/...md  ─────────►  📋 report-to-webpage (Orchestrator)
                                              │
       ┌──────────────────────────────────────┼──────────────────────────────────┐
       ▼                                      ▼                                  ▼
┌─────────────┐  ┌──────────────────────┐ ┌────────────────────┐  ┌─────────────────┐
│ design-lead │  │visualization-engineer│ │ frontend-engineer  │  │ motion-designer │
└─────────────┘  └──────────────────────┘ └────────────────────┘  └─────────────────┘
 컬러/타이포        Chart.js·ECharts          HTML·CSS·반응형        Canvas/WebGL·GSAP
 IA·토큰·data.json   8종 차트 + 인터랙션      vanilla JS 모듈        스크롤 페럴랙스
       │                  │                       │                       │
       └──────────────────┴───────────────────────┴───────────────────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │   web-qa     │  → 디자인 토큰 / 데이터 정합성 / 접근성 / 반응형 검증
                              └──────────────┘
                                      │
                                      ▼
                       index.html (인라인 단일 파일 산출)
```

| 역할 | 에이전트 | 스킬 | 책임 |
|---|---|---|---|
| 디자인 시스템·IA | `design-lead` | `web-design-system` | 토큰·섹션 구조·`data.json` 추출 |
| 데이터 시각화 | `visualization-engineer` | `web-data-visualization` | Chart.js·ECharts 8종 차트 |
| 프론트엔드 | `frontend-engineer` | `web-frontend-build` | HTML·CSS·vanilla JS·반응형 |
| 모션/배경 | `motion-designer` | `web-motion-animation` | WebGL particle·스크롤·마이크로 인터랙션 |
| QA | `web-qa` | `web-quality-assurance` | 토큰·데이터·접근성·반응형 검증 (Full / Lite-PoC 2모드) |
| **오케스트레이션** | — | **`report-to-webpage`** | 5인 조율 + 산출물 통합 |

**트리거 예시**
- 초기 빌드: `"보고서를 웹페이지로"`, `"인터랙티브 HTML 시각화"`
- 부분 재빌드: `"차트만 다시"`, `"배경 애니메이션 변경"`, `"컬러 테마 바꿔"`, `"반응형 수정"`

---

### 두 하네스의 관계

```
   하네스 1 (분석)                          하네스 2 (웹 빌드)
   ─────────────                          ────────────────────
   5인 분석가  ──► reports/...md  ──►  5인 웹 전문가  ──► index.html
                       ▲
                       └─ 보고서 자체 갱신 시 하네스 1
                          웹 시각화 갱신은 하네스 2
```

`data.json` 이 **보고서를 단일 소스로** 사용하므로, 보고서가 갱신되면 하네스 2 재빌드가 권장됩니다.

---

## 📊 보고서 핵심 요약 (2026-05-12 기준)

> 자세한 내용은 [`reports/SK하이닉스_분석보고서_20260512.md`](./reports/SK하이닉스_분석보고서_20260512.md) 참조.

- **현재가** 약 1,861,000원 / **시가총액** 약 1,319조원 (KOSPI 2위, 세계 16위)
- **1Y +871%**, 52주 신고가 1,967,000원 갱신 직후 단기 조정
- **1Q26 실적**: 매출 52.6조 · 영업이익 37.6조 · **OPM 72%** (분기 사상 최고)
- **HBM 시장 1위** + NVIDIA Rubin(HBM4) 발주 ~70% 확보
- **순현금 35조** · Forward PER 5.2x (마이크론 11x 대비 50%+ 할인)
- **합의: Neutral-to-Bullish (Cycle Peak 인식)**
  - Bull 20~25% / Base 55~60% / Bear 20~25%
  - 12M 시나리오 가중 주가 범위: 100만~280만원, **Base 중심 150만~210만원**

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|---|---|
| 마크업/스타일 | Vanilla HTML5 · CSS3 (디자인 토큰·flex/grid) |
| 차트 | Chart.js 4.4 · Apache ECharts 5.5 |
| 모션 | GSAP 3.12 (ScrollTrigger) · Canvas/WebGL particle |
| 폰트 | Pretendard Variable · Inter · JetBrains Mono |
| 빌드 | **No build step** — 단일 `index.html` (CSS·JS·data 인라인) |
| 호스팅 | GitHub Pages (`.nojekyll` 적용) |
| 에이전트 | Claude Code (10 agents · 13 skills) |

---

## 🚀 로컬 미리보기

```bash
# 1. 클론
git clone git@github.com:revfactory/sk-hynix-report.git
cd sk-hynix-report

# 2. 단일 파일 — 더블클릭으로도 열림
open index.html

# 3. 또는 로컬 서버 (web/ 의 모듈 원본을 보고 싶을 때)
cd web && python3 -m http.server 8000
# → http://localhost:8000
```

---

## ♿ 접근성 / 반응형

- **WCAG AA** 색대비 준수 (디자인 토큰 단계에서 검증)
- `prefers-reduced-motion: reduce` 대응 — 모든 자동 애니메이션 비활성화
- 키보드 내비게이션 · skip link · ARIA 라벨 적용
- 브레이크포인트: **320 / 768 / 1280 / 1920**
- 다크 모드 기본, 라이트 토글 지원

---

## ⚠️ 면책 조항

본 보고서·페이지는 정보 제공 목적이며 **투자 자문이 아닙니다**. 데이터는 공개 자료 기준이며 일부 항목은 추정·확인되지 않은 보도를 포함할 수 있습니다(보고서 내 명시). 투자 결정은 본인 책임입니다.

---

## 📜 라이선스

내부 리서치 워크스페이스. 별도 명시 전까지 외부 재배포는 권장하지 않습니다.

---

<sub>🤖 Built with [Claude Code](https://claude.com/claude-code) — 다중 에이전트 하네스 기반 분석 + 웹 빌드 파이프라인</sub>
