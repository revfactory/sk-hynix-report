# 카카오페이 리서치 워크스페이스

이 디렉토리는 SK하이닉스(000660.KS) 분석 및 보고서 웹 시각화를 위한 에이전트 하네스가 구축된 작업 공간입니다.

## 하네스 1: SK하이닉스 주가 분석

**목표:** SK하이닉스 주가에 대한 시세·펀더멘털·산업·심리·리스크 5축 다각도 분석 보고서를 자동 생성한다.

**트리거:** SK하이닉스/하이닉스/SK Hynix/000660 관련 **분석·보고서·업데이트** 요청 시 `hynix-stock-analysis` 스킬(오케스트레이터)을 사용하라.
- 초기 실행: "하이닉스 주가 분석해줘", "SK하이닉스 보고서 작성", "000660 다각도 분석"
- 부분 재실행: "리스크 섹션만 다시", "실적 반영해서 펀더멘털만 업데이트"
- 단순 질문(예: "하이닉스 종가 얼마?")은 직접 응답 가능. 다각도 분석/보고서 요청만 오케스트레이터 사용.

**산출물 경로:**
- 중간 산출물: `_workspace/0N_*.md` (5개 분석가별)
- 최종 보고서: `reports/SK하이닉스_분석보고서_{YYYYMMDD}.md`

## 하네스 2: 보고서 → 웹페이지 빌드

**목표:** `reports/*.md`의 분석 보고서를 모던·세련된 인터랙티브 웹페이지(데이터 시각화 차트 + 배경 애니메이션 + 마이크로 인터랙션)로 변환한다.

**트리거:** 보고서를 **웹페이지·시각화·HTML·인터랙티브 페이지**로 만들고 싶다는 요청 시 `report-to-webpage` 스킬을 사용하라.
- 초기 빌드: "보고서를 웹페이지로", "인터랙티브 웹사이트로 만들어", "HTML 시각화"
- 부분 재빌드: "차트만 다시", "배경 애니메이션 변경", "컬러 테마 바꿔", "반응형 수정"
- 분석 보고서 자체 갱신은 하네스 1, 웹 시각화는 하네스 2 — 혼동하지 말 것.

**산출물 경로:**
- 디자인 시스템·데이터: `web/_design/{design-tokens.json,data.json,information-architecture.md,component-catalog.md,style-guide.md,qa-report.md}`
- 최종 정적 사이트: `web/index.html` + `web/styles/*.css` + `web/scripts/*.js`
- 미리보기: `cd web && python3 -m http.server 8000`

## 두 하네스의 관계
- 하네스 1(분석) → 보고서 생성 → 하네스 2(웹 빌드) → 시각화 페이지
- 보고서 갱신 시 하네스 2 재빌드 권장 (data.json이 보고서를 단일 소스로 사용)

## 변경 이력

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-12 | 초기 구성 — 분석 하네스 (5인 분석가 + 오케스트레이터) | `.claude/agents/{market-data,fundamentals,industry,sentiment,risk}-analyst.md`, `.claude/skills/hynix-{market-data,fundamentals,industry,sentiment,risk,stock-analysis}/` | 초기 하네스 구축 — SK하이닉스 다각도 분석 |
| 2026-05-12 | 웹 빌드 하네스 추가 — design-lead·visualization·frontend·motion·web-qa 5인 + report-to-webpage 오케스트레이터 | `.claude/agents/{design-lead,visualization-engineer,frontend-engineer,motion-designer,web-qa}.md`, `.claude/skills/{web-design-system,web-data-visualization,web-frontend-build,web-motion-animation,web-quality-assurance,report-to-webpage}/` | 보고서를 모던 인터랙티브 웹페이지로 시각화 |
| 2026-05-12 | QA 모드 도입 (Full / Lite-PoC) — 검증 강도 조절 가능, frontmatter·핵심 섹션·입력 프로토콜·작업 원칙 갱신 | `.claude/agents/web-qa.md` | 1on1 — PoC·데모용 빠른 산출 요구로 매번 발생하던 검증 범위 협상 비용 제거 |
