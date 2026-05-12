---
name: hynix-stock-analysis
description: "SK하이닉스 주가 다각도 분석 에이전트 팀(시세·펀더멘털·산업·심리·리스크 5명)을 조율하여 통합 분석 보고서를 생성하는 오케스트레이터. 트리거: 'SK하이닉스 분석', '하이닉스 주가 보고서', 'SK Hynix 분석', '000660 분석', '하이닉스 다각도 분석', '하이닉스 투자 보고서'. 후속 작업: 보고서 수정/업데이트/보완/재실행/부분 재실행(예: 'risk 섹션만 다시', '실적 발표 반영해서 업데이트'), 이전 결과 기반 개선 요청 시에도 반드시 이 스킬을 사용."
---

# SK하이닉스 주가 분석 오케스트레이터

SK하이닉스(000660.KS) 주가에 대한 5인 전문 분석가 팀을 조율하여 통합 보고서를 생성하는 통합 스킬.

## 실행 모드: 에이전트 팀 (Fan-out/Fan-in)

5명의 전문 분석가가 병렬로 조사·분석하고, 리더(오케스트레이터)가 산출물을 통합한다. 분석가들은 `SendMessage`로 발견·교차 검증·상충 데이터 토론을 수행한다.

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 스킬 | 출력 |
|------|-------------|------|------|------|
| market-data-analyst | general-purpose | 시세·수급·기술적 지표 | hynix-market-data | `_workspace/01_market_data.md` |
| fundamentals-analyst | general-purpose | 실적·재무·밸류에이션·HBM 매출 | hynix-fundamentals | `_workspace/02_fundamentals.md` |
| industry-analyst | general-purpose | 산업 사이클·HBM 시장·경쟁사 | hynix-industry | `_workspace/03_industry.md` |
| sentiment-analyst | general-purpose | 뉴스·컨센서스·심리·이벤트 | hynix-sentiment | `_workspace/04_sentiment.md` |
| risk-analyst | general-purpose | 다층 리스크·시나리오 분석 | hynix-risk | `_workspace/05_risk.md` |
| (리더 = 오케스트레이터) | — | 통합 보고서 작성 | — | `reports/SK하이닉스_분석보고서_{YYYYMMDD}.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인 (후속 작업 지원)

1. `_workspace/` 디렉토리 존재 여부 확인
2. 실행 모드 결정:
   - **`_workspace/` 미존재** → 초기 실행. Phase 1로 진행
   - **`_workspace/` 존재 + 사용자가 부분 수정 요청 (예: "리스크 섹션만 다시", "시장 데이터만 갱신")** → 부분 재실행. 해당 에이전트만 재호출, 다른 산출물은 보존
   - **`_workspace/` 존재 + 일반 갱신 요청 ("실적 반영 업데이트", "다시 분석")** → 새 실행. 기존 `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동 후 Phase 1 진행
3. 부분 재실행 시 해당 에이전트 프롬프트에 이전 산출물 경로를 포함하여 변경분만 갱신하도록 지시

### Phase 1: 준비

1. 사용자 입력 분석 — 분석 기준일(없으면 오늘), 특별 강조 영역(예: "HBM 위주로", "리스크 중심으로")
2. 작업 디렉토리: `/Users/robin/Downloads/kakaopay-research/_workspace/` 생성
3. 입력 파라미터를 `_workspace/00_input.md`에 저장 (기준일, 강조 영역, 사용자 요구사항)
4. 최종 보고서 출력 경로 확정: `/Users/robin/Downloads/kakaopay-research/reports/SK하이닉스_분석보고서_{YYYYMMDD}.md`

### Phase 2: 팀 구성

```
TeamCreate(
  team_name: "hynix-analysis-team",
  members: [
    { name: "market-data-analyst", agent_type: "general-purpose", model: "opus",
      prompt: "당신은 .claude/agents/market-data-analyst.md에 정의된 시장 데이터 분석가입니다. .claude/skills/hynix-market-data/SKILL.md 스킬을 따라 작업하세요. 기준일: {기준일}. 산출물: _workspace/01_market_data.md. 작업 중 거래량 이상·외국인 매도 등 발견은 sentiment-analyst에게 SendMessage로 공유하세요." },
    { name: "fundamentals-analyst", agent_type: "general-purpose", model: "opus",
      prompt: "당신은 .claude/agents/fundamentals-analyst.md에 정의된 펀더멘털 분석가입니다. .claude/skills/hynix-fundamentals/SKILL.md 스킬을 따르세요. 기준일: {기준일}. 산출물: _workspace/02_fundamentals.md. HBM 매출·가이던스·컨센서스 서프라이즈는 industry-analyst와 sentiment-analyst에게 공유하세요." },
    { name: "industry-analyst", agent_type: "general-purpose", model: "opus",
      prompt: "당신은 .claude/agents/industry-analyst.md에 정의된 산업 분석가입니다. .claude/skills/hynix-industry/SKILL.md 스킬을 따르세요. 기준일: {기준일}. 산출물: _workspace/03_industry.md. 미중 규제·경쟁사 동향은 risk-analyst에게 공유하세요." },
    { name: "sentiment-analyst", agent_type: "general-purpose", model: "opus",
      prompt: "당신은 .claude/agents/sentiment-analyst.md에 정의된 시장 심리 분석가입니다. .claude/skills/hynix-sentiment/SKILL.md 스킬을 따르세요. 기준일: {기준일}. 산출물: _workspace/04_sentiment.md. 부정적 뉴스·규제 보도는 risk-analyst에게 공유하세요." },
    { name: "risk-analyst", agent_type: "general-purpose", model: "opus",
      prompt: "당신은 .claude/agents/risk-analyst.md에 정의된 리스크 분석가입니다. .claude/skills/hynix-risk/SKILL.md 스킬을 따르세요. 기준일: {기준일}. 산출물: _workspace/05_risk.md. 다른 팀원의 산출물이 일부 완료된 후 작업하면 더 풍부한 분석 가능. 일단 자체 조사 시작하고 SendMessage로 보강하세요." }
  ]
)

TaskCreate(tasks: [
  { title: "시장 데이터 분석", description: "시세·거래량·수급·기술적 지표 수집", assignee: "market-data-analyst" },
  { title: "펀더멘털 분석", description: "최신 분기 실적·HBM 매출·재무·밸류에이션·컨센서스", assignee: "fundamentals-analyst" },
  { title: "산업·경쟁사 분석", description: "메모리 사이클·HBM 시장·AI 수요·경쟁사 비교", assignee: "industry-analyst" },
  { title: "시장 심리·뉴스 분석", description: "최근 30일 뉴스·애널리스트 컨센서스·이벤트 캘린더", assignee: "sentiment-analyst" },
  { title: "리스크 분석", description: "지정학·환율·공급망·기술·시나리오 분석", assignee: "risk-analyst" }
])
```

### Phase 3: 병렬 분석 수행

**실행 방식:** 팀원들이 자체 조율하며 병렬 작업

- 5명의 분석가가 독립적으로 자료 수집·분석을 시작
- 작업 중 관련 발견이 있으면 다른 팀원에게 SendMessage로 공유:
  - market-data → sentiment-analyst (거래량 이상 신호)
  - fundamentals → industry (HBM 매출 데이터)
  - fundamentals → sentiment (컨센서스 서프라이즈)
  - industry → risk (경쟁사 위협, 미중 규제)
  - sentiment → risk (부정적 뉴스)
- 상충 데이터 발견 시 팀원 간 직접 토론
- 각 팀원은 완료 시 산출물을 `_workspace/0N_xxx.md`로 저장 + 리더에게 알림

**리더 모니터링:**
- TaskGet으로 진행 상황 확인
- 유휴 알림 수신 시 다음 단계 결정
- 팀원이 막힐 경우 SendMessage로 가이드

### Phase 4: 통합 보고서 작성

모든 팀원의 작업 완료 후 (TaskGet으로 5명 모두 completed 확인):

1. 5개 산출물 모두 Read:
   - `_workspace/01_market_data.md`
   - `_workspace/02_fundamentals.md`
   - `_workspace/03_industry.md`
   - `_workspace/04_sentiment.md`
   - `_workspace/05_risk.md`

2. 통합 보고서 구조 (`reports/SK하이닉스_분석보고서_{YYYYMMDD}.md`):

```markdown
# SK하이닉스(000660.KS) 다각도 주가 분석 보고서

**작성일**: YYYY-MM-DD
**분석 기준**: YYYY-MM-DD HH:MM (KST)
**작성자**: SK Hynix Analysis Team (5인 분석가 + 통합)

---

## Executive Summary
- 현재 주가 한 줄 요약
- 핵심 강점 3가지
- 핵심 우려 3가지
- 분석가 합의 (Bull / Neutral / Bear 종합 판단)

## 1. 시장 데이터 — 현재 시세와 추세
(_workspace/01_market_data.md 핵심 요약)

## 2. 펀더멘털 — 실적과 밸류에이션
(_workspace/02_fundamentals.md 핵심 요약)

## 3. 산업 분석 — 메모리 사이클과 HBM
(_workspace/03_industry.md 핵심 요약)

## 4. 시장 심리와 뉴스
(_workspace/04_sentiment.md 핵심 요약)

## 5. 리스크와 시나리오
(_workspace/05_risk.md 핵심 요약)

## 6. 종합 진단
### 6-1. Bull Case 핵심 논거
### 6-2. Bear Case 핵심 논거
### 6-3. 12개월 시나리오 (베어/베이스/불 별 주가 범위)

## 7. 모니터링 포인트 (다음 분기 핵심 체크리스트)
- 다음 실적 발표일 / 예상 컨센서스
- HBM 경쟁 동향 모니터링 지표
- 매크로 변수 (환율·미중 정책)
- 기술적 지표 (지지/저항 가격대)

---

## 부록 A. 데이터 출처 일람
## 부록 B. 분석 한계 (Caveats)
- 비공개 정보·추정치가 사용된 항목
- 데이터 시점·시차로 인한 한계
- 분석가 의견은 정보 제공 목적이며 투자 자문이 아님을 명시
```

3. 상충 데이터는 출처 병기로 양쪽 모두 기록 (삭제 금지)
4. Executive Summary는 마지막에 작성 (본문 완성 후 요약)

### Phase 5: 정리

1. 팀원들에게 종료 요청 (SendMessage)
2. 팀 정리 (TeamDelete)
3. `_workspace/` 디렉토리 보존 (사후 검증·감사 추적용)
4. 사용자에게 결과 요약 보고:
   - 최종 보고서 경로
   - 핵심 발견 3~5줄
   - 데이터 한계 / 후속 업데이트 권장 시점

## 데이터 흐름

```
[리더] → TeamCreate(5명)
   ↓
[market-data] ↔ SendMessage ↔ [sentiment]    ← 거래량 이상치
[fundamentals] ↔ SendMessage ↔ [industry]    ← HBM 매출 / 점유율 교차
[fundamentals] ↔ SendMessage ↔ [sentiment]   ← 컨센서스 / 가이던스
[industry]    ↔ SendMessage ↔ [risk]         ← 미중·경쟁사 리스크
[sentiment]   ↔ SendMessage ↔ [risk]         ← 부정적 뉴스
   ↓
01_market_data.md  02_fundamentals.md  03_industry.md  04_sentiment.md  05_risk.md
   ↓ (모두 완료 시)
[리더: 통합]
   ↓
reports/SK하이닉스_분석보고서_YYYYMMDD.md
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| 분석가 1명 실패 | 리더가 유휴 알림 수신 → SendMessage로 상태 확인 → 1회 재시도. 재실패 시 해당 영역 누락 명시하고 진행 |
| 분석가 2명 이상 실패 | 사용자에게 알리고 진행 여부 확인 |
| 데이터 소스 접근 불가 | 대체 소스 시도. 모두 실패 시 N/A로 표기, 사유 기록 |
| 상충 데이터 (예: 외국인 지분율) | 양쪽 출처 모두 기록, 차이 원인 추정 병기 |
| 타임아웃 | 현재까지 수집된 부분 결과로 보고서 작성, 미완료 영역 명시 |
| 컨센서스 데이터 부족 | 단일 출처임을 명시, 한계 표시 |
| 시점 불일치 (실적 발표 직후) | 발표일과 분석 기준일 명확히 구분 |

## 테스트 시나리오

### 정상 흐름
1. 사용자가 "현재 SK하이닉스 주가에 대해 다각도 분석 보고서를 작성해줘" 요청
2. Phase 0: `_workspace/` 없음 → 초기 실행
3. Phase 1: 기준일=오늘, `_workspace/` 생성, `00_input.md` 저장
4. Phase 2: 5명 팀 구성, 5개 작업 등록
5. Phase 3: 5명 병렬 분석, 팀 내 메시지 교환
6. Phase 4: 5개 산출물 Read → 통합 보고서 작성
7. Phase 5: 팀 정리, 결과 요약 보고
8. 예상 결과: `reports/SK하이닉스_분석보고서_YYYYMMDD.md`

### 에러 흐름
1. Phase 3에서 sentiment-analyst가 뉴스 검색 실패 (네트워크 오류)
2. 리더가 유휴 알림 수신
3. SendMessage로 상태 확인 → 재시도 요청
4. 재시도 실패 시 sentiment 영역을 빈 채로 진행
5. Phase 4 통합 보고서의 "4. 시장 심리와 뉴스" 섹션에 "데이터 수집 실패 — 추후 보완 필요" 명시
6. Phase 5 결과 요약에 한계 사항 명시

### 부분 재실행 흐름
1. 사용자가 "방금 실적이 발표됐어 — 펀더멘털만 업데이트" 요청
2. Phase 0: `_workspace/` 존재 + 부분 수정 요청 감지
3. fundamentals-analyst만 단독 호출 (서브 에이전트로)
4. `_workspace/02_fundamentals.md`만 갱신, 다른 산출물 보존
5. Phase 4에서 통합 보고서 재생성 (변경된 02만 반영)
6. Phase 5 보고

## 후속 작업 키워드

description에 포함되어 후속 요청이 트리거되도록 보장:
- "보고서 업데이트", "분석 다시", "결과 개선", "보완"
- "{영역}만 다시" (예: "리스크 섹션만 다시", "시장 데이터만 갱신")
- "실적 반영해서 업데이트", "최신 데이터로"
- "이전 분석 기반으로"

## 운영 가이드

- 분석가 추가/변경이 필요하면 본 스킬 + 해당 에이전트 정의 + 스킬 동시 갱신
- 새 분석 영역(예: ESG 단독 분석) 필요 시 새 에이전트·스킬 생성하고 본 오케스트레이터의 팀 구성과 통합 보고서 구조에 반영
- 시즌별 업데이트 권장: 분기 실적 발표 후 / 미 FOMC 후 / 주요 산업 이벤트(NVIDIA GTC) 후
