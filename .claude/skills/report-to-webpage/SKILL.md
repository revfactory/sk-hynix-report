---
name: report-to-webpage
description: "마크다운 보고서(특히 SK하이닉스 분석 보고서)를 모던·세련된 인터랙티브 웹페이지로 변환하는 오케스트레이터. design-lead·visualization·frontend·motion·QA 5인 팀을 조율해 데이터 시각화 차트, 글래스모피즘 UI, 배경 애니메이션(WebGL/Canvas), 마이크로 인터랙션, 다크 모드, 반응형 레이아웃을 갖춘 정적 웹사이트를 생성. 트리거: '보고서를 웹페이지로', '웹사이트로 만들어줘', 'HTML로 변환', '인터랙티브 웹페이지', '모던 웹사이트 빌드', '데이터 시각화 페이지', '하이닉스 보고서 웹', 'report to webpage', '리포트 시각화'. 후속 작업: '디자인 수정', '차트만 다시', '배경 애니메이션 변경', '모션 강도 낮춰', '컬러 테마 바꿔', '반응형 수정', '특정 섹션만 재빌드', '이전 결과 개선' 시에도 반드시 이 스킬을 사용."
---

# Report-to-Webpage Orchestrator

마크다운 분석 보고서(`reports/*.md`)와 보조 자료(`_workspace/*.md`)를 모던 인터랙티브 웹페이지(`web/index.html` + assets)로 변환하는 통합 오케스트레이터.

## 실행 모드: 에이전트 팀 (파이프라인 + 팬아웃 + 점진적 QA)

design-lead가 디자인 시스템·데이터 구조를 먼저 만들고(파이프라인 1단계), 그 산출물을 기반으로 visualization·frontend·motion 3명이 병렬 작업(팬아웃), web-qa가 각 모듈 완성 직후 점진적으로 검증.

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 스킬 | 출력 |
|------|-------------|------|------|------|
| design-lead | general-purpose | 디자인 시스템 + 정보 아키텍처 + data.json (선행) | web-design-system | `web/_design/*` |
| visualization-engineer | general-purpose | 인터랙티브 차트 (Chart.js/ECharts) | web-data-visualization | `web/scripts/charts.js` + chart-configs/ |
| frontend-engineer | general-purpose | HTML/CSS/Vanilla JS 마크업·컴포넌트 | web-frontend-build | `web/index.html` + styles/ + scripts/main.js |
| motion-designer | general-purpose | WebGL/Canvas 배경 + GSAP 스크롤 모션 + 마이크로 인터랙션 | web-motion-animation | `web/scripts/background-animation.js` + scroll/microinteractions |
| web-qa | general-purpose | 점진적 통합 검증 (토큰·데이터·시맨틱·반응형·성능) | web-quality-assurance | `web/_design/qa-report.md` |
| (리더 = 오케스트레이터) | — | 진행 조율 + 최종 통합 검증 | — | 사용자 결과 보고 |

## 워크플로우

### Phase 0: 컨텍스트 확인 (후속 작업 지원)

1. `web/` 디렉토리 존재 여부 확인
2. 실행 모드 결정:
   - **`web/` 미존재** → 초기 빌드. Phase 1로
   - **`web/` 존재 + 부분 수정 요청** (예: "차트만 다시", "배경 모션만 바꿔", "컬러 테마 변경") → 부분 재실행. 해당 에이전트만 재호출
   - **`web/` 존재 + 전체 재실행 요청** → 기존 `web/`을 `web_{YYYYMMDD_HHMMSS}/`로 이동 후 Phase 1
3. 부분 재실행 시 해당 에이전트 프롬프트에 이전 산출물 경로 + 변경 요청 명시

### Phase 1: 입력 분석 & 작업 디렉토리 준비

1. 입력 보고서 식별:
   - 기본: `reports/SK하이닉스_분석보고서_20260512.md`
   - 보조: `_workspace/01~05_*.md`
2. `web/_design/` 디렉토리 생성
3. 사용자 요구사항 분석:
   - 특별 요청(예: 컬러 테마 지정, 배경 모션 종류) 추출
   - 우선순위 (모던함 vs 정보 밀도, 모션 강도 등)
4. 입력 파라미터를 `web/_design/00_input.md`에 저장

### Phase 2: 디자인 시스템 정의 (파이프라인 1단계 — design-lead 단독)

**실행 모드:** 서브 에이전트 (design-lead 단독 선행 작업)

design-lead를 단독 호출하여 디자인 시스템·정보 아키텍처·data.json 생성:

```
Agent(
  name: "design-lead",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: ".claude/agents/design-lead.md 역할 + .claude/skills/web-design-system/SKILL.md 스킬 따라 작업. 입력: reports/SK하이닉스_분석보고서_20260512.md + _workspace/*. 출력: web/_design/design-tokens.json, information-architecture.md, component-catalog.md, data.json, style-guide.md"
)
```

> design-lead가 단독으로 먼저 작업하는 이유: 후속 3명(viz/frontend/motion)이 모두 design-lead 산출물을 입력으로 받기 때문. 병렬화 시 토큰 미확정 상태로 충돌 발생.

산출물 검증 (web-qa 1차):
- design-tokens.json 완전성
- data.json의 보고서 원본 수치 정확성
- component-catalog 충분성

### Phase 3: 병렬 구현 + 점진적 QA (팬아웃 — 4명 팀)

**실행 모드:** 에이전트 팀

design-lead 산출물이 준비된 후 4명 팀 구성 (visualization, frontend, motion, web-qa):

```
TeamCreate(
  team_name: "web-build-team",
  members: [
    { name: "visualization-engineer", agent_type: "general-purpose", model: "opus",
      prompt: "..." },
    { name: "frontend-engineer", agent_type: "general-purpose", model: "opus",
      prompt: "..." },
    { name: "motion-designer", agent_type: "general-purpose", model: "opus",
      prompt: "..." },
    { name: "web-qa", agent_type: "general-purpose", model: "opus",
      prompt: "각 모듈 완성 직후 즉시 검증 (점진적 QA). 발견 버그는 해당 담당자에게 SendMessage. 단계별 검증 후 web/_design/qa-report.md 작성." }
  ]
)

TaskCreate(tasks: [
  { title: "차트 라이브러리 선택 + 7개 차트 구현", assignee: "visualization-engineer" },
  { title: "HTML 시맨틱 마크업 + CSS 디자인 토큰 + 반응형", assignee: "frontend-engineer" },
  { title: "Hero 배경 애니메이션(WebGL 또는 Canvas) + 스크롤 모션 + 마이크로 인터랙션", assignee: "motion-designer" },
  { title: "점진적 QA: 차트 완료 직후 검증", assignee: "web-qa" },
  { title: "점진적 QA: 마크업 완료 직후 검증", assignee: "web-qa" },
  { title: "점진적 QA: 모션 완료 직후 검증", assignee: "web-qa" },
  { title: "최종 통합 QA + qa-report.md", assignee: "web-qa", depends_on: ["..."] }
])
```

**팀 통신 패턴:**
- visualization → frontend: 차트 컨테이너 HTML 명세 (ID·구조) SendMessage
- frontend → motion: 배경 캔버스 컨테이너 + 트리거 클래스 명세 SendMessage
- motion → visualization: 스크롤 진입 stagger 타이밍 조율 SendMessage
- web-qa → 각 담당자: 버그 발견 시 구체적 위치·예상·실제 SendMessage

**산출물 저장:**

| 팀원 | 출력 |
|------|------|
| visualization | `web/scripts/charts.js`, `web/scripts/chart-configs/*.js` |
| frontend | `web/index.html`, `web/styles/*.css`, `web/scripts/main.js`, `web/scripts/data-loader.js` |
| motion | `web/scripts/background-animation.js`, `scroll-animations.js`, `microinteractions.js`, `web/styles/animations.css` |
| web-qa | `web/_design/qa-report.md` |

### Phase 4: 최종 통합 검증 & 결과 보고

1. 모든 팀원 작업 완료 대기 (TaskGet으로 확인)
2. web-qa 최종 리포트 Read
3. 발견된 P0/P1 버그가 있으면 해당 담당자에게 재작업 요청 (1회 사이클)
4. 사용자에게 결과 보고:
   - 최종 산출물 경로: `web/index.html`
   - 핵심 구현 사항 (디자인 시스템·차트 7종·배경 모션·인터랙션)
   - QA 리포트 결과 (Pass/Warn/Fail 개수)
   - 데이터 한계·미확보 항목
   - 미리보기 방법: `cd web && python3 -m http.server 8000` (또는 VS Code Live Server)

### Phase 5: 정리

1. 팀원들에게 종료 요청 (SendMessage shutdown_request)
2. 팀 정리 (TeamDelete)
3. `web/_design/` 디렉토리 보존 (사후 검증·진화용)
4. CLAUDE.md 변경 이력에 본 빌드 기록

## 데이터 흐름

```
[보고서 + _workspace/]
         ↓
[design-lead] (선행, 서브 에이전트)
         ↓
web/_design/
  - design-tokens.json
  - information-architecture.md
  - component-catalog.md
  - data.json
  - style-guide.md
         ↓
[Team: visualization ↔ frontend ↔ motion ↔ web-qa]
         ↓
web/
  - index.html
  - styles/{main,components,responsive,animations}.css
  - scripts/{main,data-loader,charts,background-animation,scroll-animations,microinteractions}.js
  - scripts/chart-configs/*.js
  - _design/qa-report.md
         ↓
[사용자] — http.server로 미리보기
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| design-lead 실패 | 1회 재시도. 재실패 시 사용자에게 알림 (선행 작업 실패는 후속 불가) |
| 팀원 1명 실패 (Phase 3) | 1회 재시도. 재실패 시 해당 영역 누락 명시하고 진행 (예: 모션 없는 정적 페이지) |
| 차트 데이터 불일치 (QA 발견) | viz-engineer에게 1회 수정 요청 |
| 토큰 하드코딩 검출 | frontend에게 1회 수정 요청 |
| WebGL 비지원 (모션) | CSS gradient fallback이 동작하면 PASS, 실패하면 정적 배경으로 변경 |
| 보고서 데이터 미확보(N/A) | UI에 "데이터 미확보" 명시 표시. 임의 추정 금지 |
| Phase 4 통합 QA에서 P0 버그 다수 | 사용자 보고 후 우선순위 합의 |

## 테스트 시나리오

### 정상 흐름
1. 사용자가 "보고서를 웹페이지로 만들어줘" 요청
2. Phase 0: `web/` 없음 → 초기 빌드
3. Phase 1: 보고서·workspace 파일 분석, `web/_design/` 생성
4. Phase 2: design-lead 단독 실행 → 토큰·IA·data.json 생성, web-qa 1차 검증
5. Phase 3: 4명 팀 구성, 병렬 구현 + 점진적 QA
6. Phase 4: 최종 검증, 사용자에게 `web/index.html` 보고
7. Phase 5: 팀 정리
8. 사용자가 `python3 -m http.server` 또는 브라우저로 확인

### 에러 흐름 — 모션 실패
1. Phase 3에서 motion-designer가 WebGL 셰이더 컴파일 실패
2. 리더가 1회 재시도 요청
3. 재실패 시 CSS gradient fallback만 적용
4. qa-report.md에 "WebGL 셰이더 미적용, CSS gradient fallback 사용" 명시
5. 정적 페이지로 사용자에게 보고

### 부분 재실행 흐름 — 차트만 수정
1. 사용자가 "HBM 점유율 차트 색상이 안 맞아, 차트만 다시"
2. Phase 0: `web/` 존재 + 부분 수정 요청 감지
3. visualization-engineer만 단독 호출 (서브 에이전트), 이전 chart-configs/ Read 후 hbm-share.js만 수정
4. web-qa가 해당 차트만 재검증
5. 사용자 보고

### 부분 재실행 흐름 — 디자인 토큰 변경
1. 사용자가 "라이트 모드 컬러를 더 따뜻하게"
2. design-lead만 호출하여 design-tokens.json의 light theme 컬러 수정
3. frontend-engineer 호출하여 CSS Custom Properties 갱신
4. web-qa 재검증 (다크 모드 영향 없음 확인)

## 미리보기 방법 (사용자 안내)

```bash
cd /Users/robin/Downloads/kakaopay-research/web
python3 -m http.server 8000
# 또는
npx serve .
# 또는 VS Code Live Server 확장 사용
```

브라우저에서 `http://localhost:8000` 열기.

## 후속 작업 키워드 (description 반영)

- 디자인: "디자인 수정", "테마 변경", "컬러 바꿔", "더 모던하게", "글래스모피즘 강화"
- 차트: "차트만 다시", "HBM 점유율 차트 수정", "시나리오 차트 변경"
- 모션: "배경 애니메이션 변경", "모션 강도 낮춰", "더 화려하게", "심플하게"
- 마크업: "반응형 수정", "모바일 레이아웃", "접근성 개선"
- 데이터: "최신 데이터로 갱신", "보고서 업데이트 반영"
- 일반: "재실행", "다시 만들어", "이전 결과 개선", "특정 섹션만"

## 운영 가이드

- 새 차트 추가 시 viz-engineer + qa 사이클만 (frontend는 컨테이너 추가 정도)
- 새 섹션 추가 시 design-lead의 IA 갱신 → 다른 모든 팀원 영향
- 데이터 갱신 시 design-lead의 data.json만 수정하면 자동 반영 (data-loader가 fetch)
- 분기 실적 발표 후 재빌드 권장 (단, 분석 보고서 자체 갱신이 선행되어야 함)
