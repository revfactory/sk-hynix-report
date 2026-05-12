---
name: hynix-industry
description: "메모리 반도체 산업 사이클·DRAM/NAND 가격·HBM 시장 점유율·AI 데이터센터 수요·경쟁사(삼성·마이크론·키옥시아)·기술 로드맵·산업 정책을 분석하는 스킬. 반도체 산업·HBM 시장·경쟁사 비교·AI 수요·메모리 사이클 분석 요청 시 반드시 사용."
---

# Hynix Industry & Competition Skill

메모리 반도체 산업의 현 위치·경쟁 구도·미래 트렌드를 분석해 `_workspace/03_industry.md`로 정리하는 워크플로우.

## 워크플로우

### Step 1: 산업 사이클 진단

**핵심 정량 지표:**
- DRAM 고정거래가격 (DDR4 8Gb, DDR5 16Gb) — TrendForce, DRAMeXchange
- NAND 고정거래가격 (TLC 512Gb) — 동일 소스
- 가격 모멘텀 (M/M, Q/Q)
- 메모리 업체 재고 일수 (재고/매출 × 90)
- 가동률 (Wafer-out 기준)

**사이클 단계 판단:**
- 저점: 가격 하락 멈춤, 재고 정점 통과, 가동률 회복 시작
- 상승: 가격 반등, 재고 감소, 가동률 풀
- 고점: 가격 상승률 둔화, 신규 CAPEX 발표 본격화
- 하락: 가격 하락 시작, 재고 누적

### Step 2: HBM 시장 분석 (핵심)

**점유율 데이터:**
- TrendForce, Omdia, SemiAnalysis 데이터 활용
- HBM3 / HBM3E / HBM4 세대별 공급 점유율
- SK하이닉스 / 삼성 / 마이크론 비중

**고객사 익스포저:**
- NVIDIA: H100/H200/B100/B200/B300 별 HBM 공급사 매트릭스
- AMD: MI300X, MI325X, MI355X
- Google TPU, AWS Trainium, MS Maia 등
- 중국 고객사 (수출 통제 영향)

**기술 경쟁:**
- 삼성전자 HBM3E 8H/12H NVIDIA 인증 진행 상황
- 마이크론 HBM3E 비중·HBM4 계획
- HBM4 양산 일정 (SK하이닉스 vs 경쟁사)

### Step 3: AI 데이터센터 수요

- AI 서버 출하량 전망 (TrendForce, IDC, Gartner, Omdia, SemiAnalysis)
- 하이퍼스케일러 CAPEX (MSFT, GOOG, META, AMZN) — 분기별 가이던스
- GPU 출하 전망 (NVIDIA, AMD)
- AI 서버당 HBM 탑재량 트렌드 (H100: 80GB → H200: 141GB → B100: 192GB → ...)

### Step 4: NAND 시장 (DRAM 대비 부속 정보)

- Enterprise SSD 수요 (AI 데이터센터에서 가속화)
- QLC 비중 증가, eSSD 가격
- 키옥시아·솔리다임 동향

### Step 5: 경쟁사 분석

**삼성전자 메모리부문:**
- 시장 점유율, HBM 비중
- HBM3E 인증 진행 (8H, 12H)
- 1c DRAM 노드 전환 일정
- 매출/이익 (메모리 부문 별도)

**마이크론(MU.OQ):**
- HBM3E 공급 (8H 양산, 12H 출시)
- 미국 CHIPS Act 보조금
- IDM 전략

**키옥시아·웨스턴디지털:**
- NAND 점유율, 합병/상장 영향

### Step 6: 기술 로드맵
- DRAM: 1a → 1b → 1c → 1d (10nm 미만), EUV 도입
- HBM: HBM3E → HBM4 → HBM4E (2026~2027 양산)
- NAND: 3D V-NAND 적층 (286층 → 300+층)
- 차세대: CXL, PIM(Processing-in-Memory)

### Step 7: 산업 정책 & 지정학
- 미국 수출 통제 (HBM 중국 수출 제한 가능성)
- CHIPS Act (한국·미국·유럽·일본)
- 한국 K-반도체 전략
- 일본 소부장 정책

### Step 8: 출력 형식 (`_workspace/03_industry.md`)

```markdown
# 메모리 반도체 산업 & 경쟁사 분석

**기준일**: YYYY-MM-DD

## 1. 메모리 사이클 진단
| 지표 | 현재 | 1Q 전 | 4Q 전 | 추세 |
|------|------|-------|-------|------|
| DDR5 16Gb 가격 | ... | ... | ... | ↑/→/↓ |
| TLC 512Gb 가격 | ... | ... | ... | ... |
| 업체 재고 일수 | ... | ... | ... | ... |
| 가동률 | ... | ... | ... | ... |

**사이클 판단**: 저점 통과 / 상승 초입 / 상승 중반 / 고점 부근 / 하락
**근거**: ...

## 2. DRAM 시장 동향 (범용 vs HBM)
## 3. NAND 시장 동향
## 4. HBM 시장 — SK하이닉스의 핵심 무기
### 4-1. 점유율 (TrendForce/Omdia 기준)
### 4-2. 고객사별 공급 매트릭스
### 4-3. 기술 경쟁 현황 (삼성/마이크론)

## 5. AI 데이터센터 수요 전망
### 5-1. AI 서버 출하 전망
### 5-2. GPU별 HBM 탑재량
### 5-3. 하이퍼스케일러 CAPEX

## 6. 경쟁사 분석
### 6-1. 삼성전자 메모리
### 6-2. 마이크론
### 6-3. 키옥시아/솔리다임

## 7. 기술 로드맵
## 8. 산업 정책 & 지정학
## 9. SK하이닉스의 포지셔닝 (산업 분석 종합)
- HBM 1위 유지 가능성
- AI 수요 사이클 길이 전망
- 향후 12~24개월 산업 환경
```

## 작업 원칙
- **세대 구분 정확성**: HBM2/HBM2E/HBM3/HBM3E/HBM4를 혼동하지 않는다. NVIDIA 제품(H100/H200/B100/B200)과 HBM 세대 매칭표 정확히
- **점유율 출처 명시**: TrendForce vs Omdia vs SemiAnalysis 데이터 차이가 있으므로 출처와 집계 분기 표기
- **루머 vs 공식 발표**: 삼성 HBM3E 인증 등 민감 정보는 "공식 발표" vs "외신 보도" 구분
- **단기 사이클 vs 장기 트렌드**: AI 수요(장기 구조적) vs 메모리 사이클(단기 변동) 분리해서 분석
- **수치 단위**: 가격은 USD, 매출은 USD/억원 명시. 환율 기준일 표기

## 팀 통신 (에이전트 팀 모드 시)
- `fundamentals-analyst`에게 HBM·DRAM 매출 정보 수신·교차 검증
- `market-data-analyst`에게 경쟁사 주가 비교 데이터 요청
- `sentiment-analyst`에게 경쟁사 주요 뉴스 공유
- `risk-analyst`에게 미중 규제·기술 리스크 관련 정보 공유

## 후속 실행 시
이전 `_workspace/03_industry.md` 존재 시 Read 후, 산업 변화 (가격, 경쟁사 발표, 신제품 양산, 정책) 업데이트.
