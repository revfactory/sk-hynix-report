# Motion Notes — SK하이닉스 분석 보고서 웹

**owner**: motion-designer
**version**: 1.0.0
**updated**: 2026-05-12
**관련 산출물**:
- `web/scripts/background-animation.js`
- `web/scripts/scroll-animations.js`
- `web/scripts/microinteractions.js`
- `web/styles/animations.css`

---

## 0. 한 줄 컨셉

> **모션 = 시그널**. 시선을 9.6배·OPM 72%·★★★★ 같은 핵심 메트릭으로 유도하고, 섹션 사이 정보 위계를 강화한다. 장식만의 모션 0개.

---

## 1. 사용 라이브러리·버전

| 영역 | 라이브러리 | 버전 | 로드 방식 |
|---|---|---|---|
| 스크롤 진입·텍스트 reveal | GSAP + ScrollTrigger | 3.12.5 | ESM (`https://cdn.skypack.dev/gsap@3.12.5` + `/ScrollTrigger`) |
| 배경 그라데이션 메시 | 순수 WebGL (Ashima simplex noise GLSL) | — | 로컬 fragment shader, 외부 라이브러리 없음 |
| 입자 네트워크 | Canvas 2D | — | 외부 라이브러리 없음 |
| 카운트업·tilt | Vanilla JS + RAF + IntersectionObserver | — | 외부 라이브러리 없음 |
| 키프레임·유틸리티 | CSS `@keyframes` | — | `web/styles/animations.css` |

**총 외부 JS 추가**: GSAP core + ScrollTrigger 만 (압축 ~50KB).

---

## 2. Hero 배경 — WebGL Radial Gradient Mesh + Particle Network

### 2.1 선택 사유
- IA §1·§5 권장: "WebGL radial gradient mesh + 입자 네트워크 + noise + 20s ambient loop"
- Stripe/Linear 스타일의 부드러운 색 메시 + Bloomberg/Apple 스타일의 데이터 플로우 메타포(입자)를 결합
- GPU 가속·라이브러리 의존 없음 → 가장 가벼움
- 색은 `design-tokens.json`의 `accent-primary` (#06B6D4 cyan), `accent-secondary` (#8B5CF6 purple), `accent-quaternary` (#EC4899 pink), `bg-primary` (#070A14)

### 2.2 구조
```
[fixed canvas #bg-canvas]   ← WebGL fragment shader gradient mesh
[fixed canvas #bg-particles]← Canvas 2D 12 노드 입자 네트워크 (mix-blend: screen)
[fixed div    #bg-fallback] ← CSS radial-gradient fallback (WebGL 미지원 / reduced-motion)
```

세 레이어 모두 `position: fixed; inset:0; z-index:-1; pointer-events:none`. `animations.css §1` 에서 명시.

> **frontend-engineer 배치**: 가능하면 `<canvas id="bg-canvas">` 와 `<canvas id="bg-particles">` 두 캔버스를 body 최상단에 둔다. 부담되면 `#bg-canvas` 하나만 배치해도 동작 (입자는 자동 skip).

### 2.3 fragment shader 핵심
- Ashima simplex 3D noise 두 필드 + 라디얼 vignette
- 좌상단 (보라) / 우하단 (핑크) 가중치 → `--gradient-hero` 토큰과 일치
- 마우스 영향: 감도 0.3, easing(0.05) 으로 부드럽게 추종 (`IA §5: 감도 0.3`)
- 미세 grain (±0.012) — 색 균일성을 깨서 살아있는 느낌

### 2.4 입자 네트워크
- 데스크탑 12 노드 / 모바일 6 노드 (성능 예산)
- 연결 거리: 데스크탑 220px / 모바일 180px
- 마우스 반발 반경 120px (`IA §5: mouse repulsion radius 120px`)
- 호흡 사인파 0.6s 주기 (`IA §5: 호흡 0.6s`)
- 색: 코어 흰색 + 시안→퍼플 라디얼 글로우
- 화면 경계 wrap (텔레포트)

### 2.5 Ambient loop
- WebGL `u_time` 은 `(now - start) / 1000 % 20` 으로 20초 cycle (`tokens.motion.duration.ambient = 20000ms`)
- 시각적 반복은 의도적으로 비대칭(노이즈 두 필드 다른 속도) → 정확히 같은 프레임 반복은 발생하지 않음

---

## 3. 모션 매트릭스 (트리거 × duration × easing)

| 위치 | 트리거 | 동작 | duration | easing | stagger |
|---|---|---|---|---|---|
| Hero 배경 (WebGL) | 페이지 로드 | gradient mesh ambient loop | 20s loop | (noise 자체) | — |
| Hero 입자 | 페이지 로드 | 12 노드 + 마우스 repulsion | 호흡 600ms | sin | — |
| Hero overline | 로드 즉시 | fade + slide-up 16px | 600ms | power4.out | — |
| Hero display-1 (글자) | 로드 즉시 (0.1s 지연) | y 120→0, opacity 0→1, rotate 6→0 | 1000ms | power4.out | 40ms |
| Hero 보조 카피 (단어) | 로드 즉시 (0.5s 지연) | y 28→0, opacity 0→1 | 700ms | power3.out | 25ms |
| Hero 메트릭 카드 | 로드 즉시 (0.7s 지연) | y 40→0, scale 0.96→1, opacity 0→1 | 800ms | power3.out | 150ms |
| Hero 스크롤 인디케이터 | 로드 즉시 (1.2s 지연) | fade + bounce 루프 | 600ms 진입 / 2s 루프 | power4.out / ease-in-out | — |
| `[data-stagger]` 부모 | viewport top:80% | 자식 fade-up | 800ms | power3.out | 80ms |
| 일반 섹션 헤딩/카드 | viewport top:78% | y 50→0, opacity 0→1 | 750ms | power3.out | 80ms |
| `.chart-container` (본체) | viewport top:88% | fade-in only — canvas 는 차트 자체에 위임 | 400ms | power2.out | — |
| `.chart-container__head/figcaption/controls` | viewport top:88% | y 14→0, opacity 0→1 | 500ms | power3.out | 80ms |
| 차트 canvas 내부 draw-in | 차트 자체 IO (vis-engineer) | Chart.js / ECharts 800ms (heatmap cell 18~30ms stagger) | 800ms | easeOutCubic | (차트별) |
| `[data-text-reveal]` (Pillar) | viewport top:85% | 단어 단위 y 24→0 | 600ms | power3.out | 25ms |
| `[data-countup]` | viewport 0.6 threshold | 0 → target, easeOutCubic | 1500ms | easeOutCubic | — |
| 카드 3D tilt | mousemove (RAF) | perspective rotate ±6°, translateY -2px | (즉시) | — | — |
| 카드 focus | focusin / focusout | translateY -2px | 280ms | standard | — |
| 강조 메트릭 glow | `.highlight` class | box-shadow 펄스 (cyan/bull/bear) | 3s 루프 | ease-in-out | — |
| Live dot blink | 항상 | opacity 1↔0.35 | 1.6s 루프 | ease-in-out | — |
| Risk matrix Top 7 | `.ambient-pulse` | brightness + drop-shadow 펄스 | 3s 루프 | ease-in-out | — |
| Hero 키워드 hover | mouseover | 그라데이션 sweep | 1500ms | outQuart | — |
| 스크롤 진행 바 | document scroll | scaleX 0→1 | scrub | linear | — |

> 모든 duration·easing 은 `design-tokens.json` 의 `motion.duration` / `motion.easing` / `motion.stagger` 값에 매핑.

---

## 4. frontend-engineer 통신 명세 (DOM 트리거)

### 4.1 필수 마크업
```html
<body>
  <!-- 배경 레이어 (body 최상단 3개) -->
  <canvas id="bg-canvas" aria-hidden="true"></canvas>
  <canvas id="bg-particles" aria-hidden="true"></canvas>
  <!-- #bg-fallback 은 JS가 동적 생성하므로 마크업 불필요. 단, 인라인 1차 fallback 원하면 div 추가 가능 -->

  <!-- Hero -->
  <section class="hero" data-section="hero">
    <p class="hero-overline" data-hero-overline>ANALYSIS · 2026-05-12 · KST</p>
    <h1 class="hero-title" data-hero-title>
      1년에 <span class="gradient-text">9.6배</span>.
      SK하이닉스, 슈퍼사이클 정점에서.
    </h1>
    <p class="hero-sub" data-hero-sub>
      OPM 72%, 시가총액 1,319조원. 그리고 5월 13일, 6월, 7월 29일의 분기점.
    </p>

    <div class="hero-metrics" data-hero-metrics>
      <article class="metric-card">
        <p class="overline">현재가</p>
        <p class="metric-xl" data-countup="1861000" data-countup-format="krw">0</p>
        <p class="metric-delta is-bear">▾ 1.01%</p>
      </article>
      <article class="metric-card">
        <p class="overline">1Y 수익률</p>
        <p class="metric-xl" data-countup="871" data-countup-format="signedPercent" data-countup-decimals="0">0</p>
        <p class="caption">Cycle Peak</p>
      </article>
      <article class="metric-card">
        <p class="overline">시가총액</p>
        <p class="metric-xl" data-countup="1319" data-countup-format="number" data-countup-suffix="조원">0</p>
        <p class="caption">글로벌 16위</p>
      </article>
    </div>

    <a href="#summary" class="scroll-indicator" data-scroll-indicator aria-label="아래로 스크롤">⌄</a>
  </section>

  <!-- 일반 섹션: data-stagger 로 자식 fade-up -->
  <section class="section section-summary">
    <div class="container" data-stagger>
      <p class="overline">EXECUTIVE SUMMARY</p>
      <h2>분기 사상 최고, 컨센 평균 도달...</h2>
      <p class="body-lg" data-text-reveal>현재가 1,861,000원은 컨센서스 평균...</p>
      <div class="summary-grid" data-stagger>
        <article class="strength-card">...</article>
        <article class="strength-card">...</article>
        <article class="strength-card">...</article>
      </div>
    </div>
  </section>

  <!-- 스크롤 진행 바 (선택, 헤더 하단 1px) -->
  <div class="scroll-progress" data-scroll-progress></div>
</body>
```

### 4.2 트리거 명세 요약

| 셀렉터 / 속성 | 동작 |
|---|---|
| `#bg-canvas`, `#bg-particles` | 배경 WebGL + 입자 (자동) |
| `.hero, [data-section="hero"]` | Hero 영역 식별 (IntersectionObserver 일시 정지 기준) |
| `.hero-title, [data-hero-title]` | 글자 단위 reveal |
| `.hero-sub, [data-hero-sub]` | 단어 단위 reveal |
| `.hero-overline, [data-hero-overline]` | 진입 fade |
| `.hero-metrics .metric-card, [data-hero-metrics] .metric-card` | Hero 메트릭 카드 stagger |
| `[data-stagger]` (부모) | 직접 자식 fade-up stagger 80ms |
| `[data-text-reveal]` | 단어 단위 reveal (Hero 밖이면 스크롤 트리거) |
| `[data-countup="<value>"]` | 숫자 카운트업 |
| `[data-countup-format]` | `krw` / `currency` / `percent` / `signed` / `signedPercent` / `number` |
| `[data-countup-decimals]` | 소수점 자릿수 |
| `[data-countup-prefix]`, `[data-countup-suffix]` | 접두/접미 문자열 |
| `.metric-card, .summary-card, .strength-card, .concern-card, [data-tilt]` | 3D tilt 자동 |
| `[data-magnetic]` | magnetic hover |
| `.reveal-on-scroll` | IntersectionObserver `is-visible` 토글 (CSS only) |
| `[data-highlight-on-view]` | viewport 진입 시 `.highlight` 클래스 자동 부착 → glow 펄스 |
| `[data-scroll-progress]` | 스크롤 진행 바 (transform scaleX) |
| `.scroll-indicator, [data-scroll-indicator]` | pulse-down 2s 루프 |
| `.gradient-text` | 그라데이션 텍스트 + hover sweep |
| `.live-dot` | 시세 LIVE 표시 펄스 |
| `.ambient-pulse` | Risk 매트릭스 Top 7 셀 ambient pulse |

### 4.3 카드 마크업 권장
```html
<article class="metric-card">
  <span class="tilt-shine" aria-hidden="true"></span>  <!-- 선택: 호버 광택 -->
  ...
</article>
```
`.tilt-shine`이 없으면 무시. 있으면 microinteractions.js 가 radial-gradient 위치 갱신.

### 4.4 CSS 권장
- `.metric-card`, `.summary-card` 는 `position: relative; overflow: hidden;` 으로 .tilt-shine 클리핑
- `body { overflow-x: clip; }` — Hero 글자 reveal 시 가로 스크롤 방지
- font-display: swap — split 후 reflow 최소화

---

## 5. visualization-engineer 통신 명세

- 차트 컨테이너 자체 진입은 **fade only (600ms)** 만 수행. 차트 내부의 800ms draw-in 애니메이션과 충돌 방지
- `data-stagger` 부모 안에 차트가 있으면, 차트는 `[data-stagger-skip]` 속성으로 자식 stagger 에서 제외 가능 (필요 시 scroll-animations.js 수정)
- 시나리오 토글·도넛 morph 등 차트 내부 모션은 visualization-engineer 영역. 토큰 `motion.duration.default(280ms)` + `easing.emphasized` 사용 권장
- Hero 메트릭 카드 카운트업과 차트 X축 라벨이 동시에 보이는 경우, 차트 자체 draw-in delay 를 0.5s 정도 두면 카운트업 → 차트 라인 순서로 보이는 효과

---

## 6. 성능 측정·예상값

### 6.1 측정 환경 (예상)
- 데스크탑 (Chrome 121, M1 MacBook Air, 1440×900)
- 모바일 (iPhone 14, Safari 17)

### 6.2 예상 fps / GPU 부하

| 환경 | fps | GPU 사용률 (예상) | 비고 |
|---|---|---|---|
| 데스크탑 일반 | 60fps | 12~18% | shader simple, 입자 12개 |
| 데스크탑 멀티 모니터 | 60fps | 15~22% | resize 처리 |
| 모바일 (iPhone 14) | 55~60fps | 25~30% | 입자 6개로 축소 |
| 모바일 저사양 (구형 안드로이드) | 45~55fps | 30~40% | 허용범위 |
| 탭 비활성 | 0fps | 0% | RAF 중단 (visibilitychange) |
| Hero 밖 스크롤 | 0fps | 0% | IntersectionObserver 중단 |

### 6.3 자동 다운그레이드
- 현재 단계: 모바일 자동 입자 6개 축소만 구현
- 후속 보강 가능: RAF 프레임 시간 측정으로 30fps 이하 시 입자 0개로 폴백 (web-qa 결과 따라 결정)

### 6.4 페이지 동시 모션 ≤ 3
- 페이지 어느 순간에도 동시 모션은: (1) 배경 ambient, (2) 진입 stagger 1개 섹션, (3) 카드 tilt 1개. 3개를 초과하지 않도록 ScrollTrigger 가 toggleActions `play none none none` 으로 진입 1회만 트리거.

---

## 7. prefers-reduced-motion 대응 (강제 비활성화 체크리스트)

`@media (prefers-reduced-motion: reduce)` 적용 시 동작:

- [x] WebGL gradient mesh: `#bg-canvas` display:none, RAF 즉시 중단 (background-animation.js 진입 즉시 return)
- [x] 입자 네트워크: `#bg-particles` display:none, RAF 미실행
- [x] CSS fallback `#bg-fallback` 정적 그라데이션 1.0 opacity
- [x] 모든 `@keyframes` animation-duration 0.01ms (animations.css)
- [x] 모든 transition-duration 0.01ms
- [x] Hero 글자/단어 reveal: 즉시 최종 상태 (opacity 1, transform none)
- [x] 카운트업: 0 → target 단번에 (애니메이션 없이 최종값 표시)
- [x] 3D tilt: 비활성 (마우스 이벤트 미바인딩)
- [x] Scroll indicator pulse·glow pulse·live-blink·ambient-pulse: animation: none
- [x] Magnetic hover: 비활성
- [x] gradient-text sweep: animation: none

> JS 측에서 `window.matchMedia('(prefers-reduced-motion: reduce)').matches` 를 진입 단계에서 체크해 RAF 자체를 시작하지 않음 — 단순 CSS off 가 아니라 메모리/CPU 점유 제로 보장.

---

## 8. WebGL 미지원 / 에러 Fallback

1. `gl = canvas.getContext('webgl')` 실패 시 → CSS radial-gradient 정적 fallback 자동 활성
2. shader compile/link 실패 시 → 동일 fallback
3. fallback 그라데이션:
   ```
   radial-gradient(125% 90% at 20% 0%, rgba(139,92,246,0.35), rgba(6,182,212,0.20) 35%, transparent 70%)
   + radial-gradient(80% 80% at 80% 100%, rgba(236,72,153,0.18), transparent 60%)
   + var(--bg-primary)
   ```
   = `design-tokens.gradient.hero` 값과 동일

---

## 9. 알려진 제약·향후 보강

- **입자 mix-blend-mode: screen** — Safari < 16 일부 환경에서 합성 색이 어두워질 수 있음. opacity 0.85 로 약하게 보정. 문제 시 `screen` → `normal` 로 폴백
- **GSAP CDN(Skypack)** — 오프라인/사내망에서 막힐 가능성. 필요 시 `gsap` 로컬 번들로 교체 (frontend-engineer 빌드 단계)
- **WebGL context loss** — 탭이 매우 오래 백그라운드일 때 GL context 가 잃어버려 다음 활성화 시 검은 화면 가능. 후속 보강: `webglcontextlost` 리스너 추가 가능
- **터치 디바이스 마우스 입력** — `mousemove` 미발생 → 입자 마우스 반발 없음. 정상 동작
- **고해상도 monitor** — DPR cap 2 로 제한 (4K 고DPI 환경에서 무리하지 않게)

---

## 10. web-qa 검증 요청 항목

1. **prefers-reduced-motion**
   - macOS: 시스템 환경설정 > 손쉬운 사용 > 디스플레이 > 모션 줄이기
   - DevTools: Rendering > Emulate CSS media feature `prefers-reduced-motion: reduce`
   - 확인: `#bg-canvas` `#bg-particles` display:none, fallback 표시, 모든 진입 모션 즉시 최종 상태
2. **콘솔 에러 0개**
   - GSAP CDN 로드 성공
   - shader compile 성공 로그 부재 (에러 시에만 출력)
3. **fps 측정**
   - DevTools > Performance > FPS meter
   - Hero 머무를 때 데스크탑 ≥ 58fps, 모바일 ≥ 50fps
4. **GPU 사용률**
   - DevTools > Rendering > Frame Rendering Stats
   - Hero ambient 시 GPU < 30% 확인
5. **카운트업**
   - Hero 메트릭 3개가 viewport 진입 시 0 → 정답까지 1.5초 카운트
   - 한 번만 실행 (다시 스크롤해도 재실행 X)
6. **3D tilt**
   - 카드 호버 시 ±6° 기울기, mouseleave 시 0° 복귀
   - 키보드 Tab 포커스 시 -2px lift
7. **WebGL 미지원**
   - DevTools > Application > More tools > Rendering > WebGL force disable
   - fallback 그라데이션 정상 표시
8. **모바일**
   - Chrome devtools 모바일 에뮬레이션 (iPhone 14 / Galaxy S22) 에서 입자 6개 확인
9. **터치 인터랙션**
   - 모바일에서 카드 탭 시 hover 가 stuck 되지 않는지

검증 결과 보고서는 design-tokens.json 기준 수치와 본 문서 §3 매트릭스 대조.

---

## 11. 토큰 매핑 요약

| 본 문서 값 | design-tokens.json 경로 |
|---|---|
| 800ms 진입 | `motion.duration.slower` |
| 280ms 인터랙션 | `motion.duration.default` |
| 600ms / 700ms 진입 | `motion.duration.slow(520)` 인근 |
| 1500ms 카운트업 | (slower~hero 중간) |
| 1200ms hero | `motion.duration.hero` |
| 20s ambient | `motion.duration.ambient` |
| stagger 80ms | `motion.stagger.default` |
| stagger 40~50ms (글자) | `motion.stagger.tight` |
| stagger 150ms | `motion.stagger.loose` |
| power3.out / outQuart | `motion.easing.outQuart` |
| power4.out (글자) | (outQuart 근사) |
| emphasized | `motion.easing.emphasized` |
| ease-in-out 펄스 | `motion.easing.standard` 인근 |
| 글로우 색 | `shadow.glowCyan` / `glowBull` / `glowBear` |

토큰 외 임의 px/ms/easing 사용은 본 산출물에서 발생하지 않도록 유지.
