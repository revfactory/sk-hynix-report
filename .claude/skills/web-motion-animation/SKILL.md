---
name: web-motion-animation
description: "Canvas/WebGL 배경 애니메이션(particle network, gradient mesh, animated orbs, shader gradient), 스크롤 기반 진입 애니메이션, 마이크로 인터랙션(숫자 카운트업, 텍스트 reveal, 카드 호버 tilt), prefers-reduced-motion 대응을 구현하는 모션 애니메이션 스킬. 배경 모션·페럴랙스·스크롤 애니메이션·마이크로 인터랙션 요청 시 반드시 사용."
---

# Web Motion & Animation Skill

웹페이지에 모던한 모션 레이어를 추가하는 워크플로우. **핵심: 모션은 장식이 아닌 시그널**. 사용자 시선을 핵심 정보로 유도하거나 위계를 강화해야 한다.

## 워크플로우

### Step 1: 배경 애니메이션 선택 (Hero용)

**옵션 A: WebGL Shader Gradient (Stripe·Linear 스타일) — 권장**
- 부드럽게 흐르는 색 메시. GPU 가속, 가벼움
- 라이브러리 없이 직접 GLSL fragment shader
- 색상은 design-tokens의 accent-primary/secondary 기반

**옵션 B: Canvas Particle Network (Apple·Bloomberg 스타일)**
- 점들이 연결되며 움직이는 네트워크
- HBM/AI 데이터 흐름 메타포로 적합
- canvas 2D, 100~150 파티클 (모바일 50)

**옵션 C: Animated Orbs (Vercel·Linear 스타일)**
- 3~5개 큰 블러 원이 천천히 움직이며 색 혼합
- CSS만으로도 가능하지만 Canvas로 부드럽게

**권장: 옵션 A (WebGL shader gradient)** — 모던하고 부드럽고 가벼움.
대안으로 옵션 B (particle network)도 HBM/AI 컨셉과 잘 맞음.

### Step 2: WebGL Shader Gradient 구현 (`web/scripts/background-animation.js`)

```js
const canvas = document.getElementById('bg-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  // Fallback: CSS gradient
  document.body.style.background = 'linear-gradient(135deg, #0a0e1a 0%, #1f2937 100%)';
  // 정적 fallback
} else {
  // Fragment shader (간소화 예시)
  const fragmentSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    
    // simplex noise function (생략, GLSL 표준)
    
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float t = u_time * 0.0001;
      
      // 3개의 천천히 움직이는 색상 점
      vec3 color1 = vec3(0.024, 0.071, 0.102);  // bg-primary
      vec3 color2 = vec3(0.024, 0.71, 0.83);    // accent-primary (cyan)
      vec3 color3 = vec3(0.545, 0.361, 0.965);  // accent-secondary (purple)
      
      float n1 = snoise(vec3(uv * 2.0, t)) * 0.5 + 0.5;
      float n2 = snoise(vec3(uv * 3.0, t + 100.0)) * 0.5 + 0.5;
      
      vec3 color = mix(color1, color2, n1 * 0.3);
      color = mix(color, color3, n2 * 0.2);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  
  // 컴파일·렌더 루프
  // ...
}

// prefers-reduced-motion 체크
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  // 정적 그라데이션으로 대체
  cancelAnimationFrame(animationId);
  document.body.style.background = 'radial-gradient(circle at 30% 20%, rgba(6,182,212,0.1) 0%, transparent 50%), var(--bg-primary)';
}

// 화면 밖에서는 일시 중지 (성능)
const ioBg = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) startAnim(); else pauseAnim();
});
ioBg.observe(canvas);
```

대안: shader 라이브러리(예: `https://cdn.jsdelivr.net/npm/shaderlib`)나 [whatamesh](https://whatamesh.vercel.app/) 같은 사전 빌드 솔루션 활용 가능.

### Step 3: 스크롤 진입 애니메이션 (`web/scripts/scroll-animations.js`)

GSAP ScrollTrigger 활용 (CDN: `cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js` + `dist/ScrollTrigger.min.js`):

```js
import gsap from 'https://cdn.skypack.dev/gsap';
import { ScrollTrigger } from 'https://cdn.skypack.dev/gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 섹션 진입 시 fade + slide-up
gsap.utils.toArray('.section').forEach((section) => {
  gsap.from(section.querySelectorAll('h2, p, .summary-card, .chart-container'), {
    y: 60,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
  });
});

// Hero 텍스트 reveal (단어 단위)
const heroTitle = document.querySelector('.hero-title .display-1');
const words = heroTitle.textContent.split('').map(c => `<span class="char">${c}</span>`).join('');
heroTitle.innerHTML = words;
gsap.from('.hero-title .char', {
  y: 120,
  opacity: 0,
  duration: 1,
  stagger: 0.04,
  ease: 'power4.out',
});

// 메타 메트릭 카드 stagger
gsap.from('.meta-metrics .metric-card', {
  y: 40,
  opacity: 0,
  duration: 0.8,
  stagger: 0.15,
  delay: 0.6,
  ease: 'power3.out',
});

// Pin & scrub 예시 (분석 영역에서 시각화 잠금)
// 옵션: 시나리오 카드에서 스크롤로 Bear → Base → Bull 전환
```

### Step 4: 마이크로 인터랙션 (`web/scripts/microinteractions.js`)

```js
// 숫자 카운트업 (IntersectionObserver + RAF)
function countUp(el, target, duration = 1500, formatter) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);  // easeOutCubic
    const value = start + (target - start) * eased;
    el.textContent = formatter ? formatter(value) : Math.round(value).toLocaleString('ko-KR');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countUpObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      const target = parseFloat(entry.target.dataset.countup);
      countUp(entry.target, target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-countup]').forEach(el => countUpObserver.observe(el));

// 카드 3D tilt on hover
document.querySelectorAll('.metric-card, .summary-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// 텍스트 reveal on scroll (대안: SplitType + GSAP)
```

### Step 5: CSS 애니메이션 유틸리티 (`web/styles/animations.css`)

```css
/* 스크롤 인디케이터 펄스 */
@keyframes pulse-down {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(8px); opacity: 1; }
}
.scroll-indicator { animation: pulse-down 2s ease-in-out infinite; }

/* 글로우 펄스 (강조 메트릭) */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 32px rgba(6,182,212,0.2); }
  50% { box-shadow: 0 0 48px rgba(6,182,212,0.4); }
}
.metric-card.highlight { animation: glow 3s ease-in-out infinite; }

/* 진입용 fade-up (JS 없이 fallback) */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Reduced motion 강제 비활성화 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  #bg-canvas { display: none; }
}
```

### Step 6: 성능 측정 & motion-notes 작성

`web/_design/motion-notes.md`에 정리:
- 사용 라이브러리·버전 (GSAP, ScrollTrigger CDN URL)
- 배경 옵션 선택 사유 (WebGL shader gradient)
- 각 모션의 트리거·duration·easing
- 성능 측정값 (예상 fps, GPU 사용)
- prefers-reduced-motion 대응 항목
- Fallback (WebGL 비지원 시 CSS gradient)

## 작업 원칙
- **모션 = 시그널**: 핵심 메트릭·전환·위계 강화에만 사용. 의미 없는 장식 금지
- **성능 우선**: 60fps 유지. WebGL 부하 시 단순화. requestAnimationFrame 사용
- **prefers-reduced-motion 강제**: 모든 비필수 모션 비활성화 (배경 캔버스도 정적으로)
- **레이어 분리**: `position: fixed; z-index: -1`로 배경과 콘텐츠 분리
- **다크/라이트 적응**: design-tokens의 색상 변수 기반으로 자동 전환
- **메모리 관리**: IntersectionObserver로 화면 밖 모션 일시 중지
- **모션 토큰 준수**: design-lead의 duration·easing 사용

## 팀 통신
- design-lead로부터 모션 토큰·배경 컨셉·핵심 메트릭 강조 위치 수신
- frontend-engineer에게 배경 캔버스 컨테이너 명세 (예: `<canvas id="bg-canvas">`)와 트리거 클래스(`.section`, `[data-countup]`, `[data-stagger]`) 명세 SendMessage
- visualization-engineer와 차트 진입 stagger 조율
- web-qa에게 motion-notes.md 제공 + reduced-motion·성능 검증 요청

## 후속 실행 시
- 모션이 과해 보인다는 피드백 → 강도 낮춤 (duration 단축, opacity 약함, scale 줄임)
- 단조롭다는 피드백 → 변형 추가 (다른 easing, 스태거 조정)
- 이전 motion JS 보존, 변경 영역만 수정
