---
name: web-quality-assurance
description: "웹페이지의 디자인 토큰 준수, 데이터 정확성(보고서 원본 vs 페이지 표시값 1:1), HTML 시맨틱·접근성(WCAG AA), 반응형(320/768/1280/1920), 성능, 모션 적정성, 브라우저 호환성을 점진적·경계면 교차 비교로 검증하는 스킬. 웹페이지 QA·검증·정합성 점검 요청 시 반드시 사용."
---

# Web Quality Assurance Skill

웹페이지의 모든 영역이 정합성 있게 통합되었는지 **점진적(incremental)**·**경계면 교차 비교**로 검증하는 워크플로우. 단순 존재 확인이 아닌, 모듈 경계에서 발생하는 불일치를 잡는다.

## 핵심 검증 원칙

### 1. 점진적 QA (Incremental)
각 모듈 완성 직후 즉시 검증. 전체 완성 후 1회가 아니라:
- design-lead 완료 → 1차 (토큰·IA·data.json 검증)
- visualization-engineer 완료 → 2차 (차트 데이터·인터랙션 검증)
- frontend-engineer 완료 → 3차 (마크업·접근성·반응형 검증)
- motion-designer 완료 → 4차 (모션·성능·reduced-motion 검증)

### 2. 경계면 교차 비교 (Boundary Cross-check)
존재만 확인하지 않는다. **두 곳 이상의 정의를 동시에 읽고 일치성 확인**:
- design-tokens.json 값 vs CSS Custom Properties 사용처
- data.json 값 vs 차트 표시값 vs 보고서 원본
- frontend의 컨테이너 ID vs visualization/motion JS의 mount target
- component-catalog 컴포넌트 명세 vs 실제 구현

## 워크플로우

### Step 1: 디자인 토큰 검증 (design-lead 산출물 후)

```bash
# 토큰 정의 파일 읽기
Read web/_design/design-tokens.json

# 모든 CSS 파일 grep으로 컬러 하드코딩 검출
grep -E "#[0-9a-fA-F]{3,8}" web/styles/*.css | grep -v ":root"
# → 토큰 외 하드코딩 발견 시 경고

# rgb/hsl 하드코딩 검출
grep -E "rgb\(|hsl\(" web/styles/*.css | grep -v "var\(--"
```

**체크 항목:**
- [ ] design-tokens.json의 모든 색상이 CSS `:root[data-theme="dark"]`에 매핑
- [ ] 라이트 모드도 동일 토큰 이름으로 매핑
- [ ] CSS에 토큰 외 컬러 하드코딩 없음 (예외: 차트 라이브러리 기본값)
- [ ] 타이포 스케일(display-1, h1, body 등)이 CSS class로 정의

### Step 2: 데이터 정합성 검증 (visualization-engineer 완료 후)

각 차트별 표시 데이터와 data.json 값을 1:1 매칭:

```
chart-price (시세 차트):
  - data.json의 priceHistory 길이, 마지막 종가 일치?
  - 52주 고저점(1,967,000 / 193,500) 마커 정확?

chart-revenue-trend (5년 매출):
  - FY21 매출 43.0조, FY23 OP -7.7조 (적자) 표시?
  - FY26E 점선/패턴으로 추정 구분?

chart-hbm-share (점유율 도넛):
  - 2026 bit 기준 SK 50% / 삼성 28% / 마이크론 22%?
  - 토글 시 revenue / hbm4 기준 데이터 일치?

chart-scenarios (시나리오):
  - Bear 20~25%, Base 55~60%, Bull 20~25% 확률 표시?
  - 주가 범위 1,000,000~2,800,000 fan chart 영역 정확?

chart-consensus (컨센서스):
  - 평균 1,817,130원, 최저 1,300,000(BNK), 최고 3,000,000(SK증권)?
  - Buy 36 / Hold 1 / Sell 0 분포?

chart-risk-matrix (3×3 히트맵):
  - Top 우선(D, J1, A1, E, F1, F2, G1) 7개 셀 배치 정확?
```

**검증 방법:**
- data.json 직접 Read + chart-configs/*.js 직접 Read하여 값 매칭
- 가능하면 브라우저 자동화(playwright)로 실제 렌더된 차트 텍스트·툴팁 캡처
- 불일치 발견 시 SendMessage로 visualization-engineer에게 구체적 파일·라인·예상·실제 보고

### Step 3: HTML 시맨틱·접근성 검증 (frontend-engineer 완료 후)

**시맨틱 마크업:**
- [ ] `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` 정확 사용
- [ ] heading 위계 H1 → H2 → H3 일관성 (skip 없음, 한 페이지 H1 1개)
- [ ] `<div>` 남발 없음 — 의미가 있으면 시맨틱 태그

**접근성:**
- [ ] 모든 `<img>`에 alt 텍스트 (장식 이미지는 alt="")
- [ ] 인터랙티브 요소(`<button>`, `<a>`)에 텍스트 또는 aria-label
- [ ] `<canvas>` 배경에 aria-hidden="true"
- [ ] 폼/토글에 적절한 ARIA role/state
- [ ] 키보드 내비게이션: Tab 순서가 시각 순서와 일치, focus visible
- [ ] 컬러 명도 비 (WCAG AA): text-primary vs bg-primary ≥ 4.5:1, 큰 텍스트 ≥ 3:1
- [ ] prefers-reduced-motion 대응 CSS·JS 구현

**도구:**
- Lighthouse(가능 시 CLI) 또는 axe-core로 자동 감사
- 수동: 키보드만으로 페이지 모든 인터랙션 가능한지 시도

### Step 4: 반응형 검증

각 breakpoint에서 시각·기능 확인:
- 320px (모바일 최소): 텍스트 가독성, 차트 단순화, 네비 햄버거
- 768px (태블릿): 그리드 2열, 네비 표시
- 1280px (데스크탑): 풀 레이아웃
- 1920px (와이드): max-width 1280px 적용으로 좌우 여백

**도구:**
- 가능하면 playwright/puppeteer로 각 viewport 스크린샷
- 정적 검증: CSS 미디어 쿼리·container query 사용 여부 grep

### Step 5: 성능·모션 검증 (motion-designer 완료 후)

- [ ] Hero 배경: 60fps 유지 (또는 모바일 50fps), GPU 부하 30% 이하
- [ ] 스크롤 진입 애니메이션: jank 없이 부드러움
- [ ] IntersectionObserver로 화면 밖 모션 일시 중지
- [ ] WebGL 비지원 환경에서 CSS gradient fallback 정상 동작
- [ ] prefers-reduced-motion 활성화 시:
  - 배경 캔버스 숨김 또는 정적 그라데이션
  - 스크롤 진입 애니메이션 즉시 표시 (no animation)
  - 카운트업 → 즉시 최종값
  - 카드 호버 tilt 비활성화
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms (Web Vitals)

### Step 6: 브라우저 호환성

- Chrome 최신 2 버전, Safari 최신 2, Firefox 최신 2, Edge 최신 2
- 주요 체크 포인트:
  - CSS Container Queries (지원 안 되는 경우 fallback)
  - color-mix() (모던 브라우저만)
  - backdrop-filter (Safari prefix 필요할 수도)
  - WebGL (모든 모던 브라우저 지원, IE는 제외)

### Step 7: 보고서 원본 일치성 (가장 중요)

`reports/SK하이닉스_분석보고서_20260512.md`의 핵심 수치가 페이지에 정확히 표시되는지 1:1 매칭:

| 보고서 원본 | 페이지 위치 | 검증 |
|---|---|---|
| 현재가 1,861,000원 | Hero 메트릭 카드 | ✓/✗ |
| 시가총액 1,319조원 | Hero 메트릭 카드 | ✓/✗ |
| 1Y +871% | Hero 메트릭 카드 | ✓/✗ |
| 52주 신고가 1,967,000원 | 시세 차트 마커 | ✓/✗ |
| OPM 72% | 펀더 섹션 + 컴보 차트 보조축 | ✓/✗ |
| 1Q26 매출 52.6조 | 펀더 섹션 | ✓/✗ |
| HBM 점유율 50% (bit 2026) | HBM 도넛 | ✓/✗ |
| NVIDIA Rubin HBM4 ~70% | 산업 섹션 | ✓/✗ |
| Forward PER 5.93x | Hero 또는 펀더 섹션 | ✓/✗ |
| Bear 20-25% / Base 55-60% / Bull 20-25% | 시나리오 카드 | ✓/✗ |
| 시나리오 주가 범위 (1M~2.8M) | Fan chart | ✓/✗ |
| 평균 컨센 1,817,130원 | 컨센서스 차트 + 본문 | ✓/✗ |
| Buy 36 / Hold 1 / Sell 0 | 컨센서스 분포 표시 | ✓/✗ |

### Step 8: 데이터 한계·N/A 표시 검증

보고서 부록 B에 명시된 N/A·불일치 항목이 페이지에 명확히 표시되는지:
- KRX 공매도 잔고 N/A
- 종목별 5/12 외국인 정확치 N/A
- 삼성 HBM4 인증 보도 (공식 미확인) 표시
- NVIDIA Rubin 지연 (확인되지 않은 보도) 표시
- 시나리오 확률은 분석가 정성 판단임을 disclaimer로

### Step 9: QA 리포트 작성

`web/_design/qa-report.md`에 정리:

```markdown
# Web QA Report
**검증일**: YYYY-MM-DD
**검증자**: web-qa

## 영역별 결과
### 1. 디자인 토큰 — PASS / 발견 N건
- ...

### 2. 데이터 정합성 — PASS / 발견 N건
- 차트별 매칭 결과 표

### 3. HTML 시맨틱·접근성 — PASS / WARN / FAIL
- Lighthouse 점수
- 발견 항목

### 4. 반응형 — PASS / 발견 N건
- breakpoint별 스크린샷 또는 검증 결과

### 5. 성능·모션 — ...

### 6. 브라우저 호환성 — ...

### 7. 보고서 원본 일치성 — ...

## 발견 버그 목록
| ID | 영역 | 파일:라인 | 예상 | 실제 | 담당 | 심각도 |
|---|---|---|---|---|---|---|
| B-001 | data | charts.js:42 | 50% | 49% | viz | High |
| ...

## 권장 수정
- ...

## Pass / Warn / Fail 종합
- Pass: N개 / Warn: N개 / Fail: N개
```

## 작업 원칙
- **빠른 발견 = 빠른 수정**: 단계별 점진 검증으로 마지막 폭주 방지
- **타협 불가 영역**: 디자인 토큰 준수·데이터 정확성·시맨틱·접근성
- **트레이드오프 가능**: 모션 강도·일부 성능 (사용자 우선순위 반영)
- **재현 가능한 보고**: "차트가 잘못됐다" 금지. 파일·라인·예상·실제·재현 방법 포함

## 팀 통신
- 각 모듈 완성 시 즉시 알림 수신
- 버그 발견 시 해당 담당자에게 SendMessage (구체적 위치)
- 디자인 토큰 자체 문제는 design-lead에게
- 최종 리포트는 team-lead에게

## 후속 실행 시
이전 qa-report.md 비교, 동일 버그 재발 시 root cause 분석. 새 변경 영역만 집중 검증.
