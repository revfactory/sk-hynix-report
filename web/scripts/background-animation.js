/**
 * background-animation.js
 * SK Hynix Analysis — Hero 배경 애니메이션
 *
 * 단일 <canvas id="bg-canvas"> 에:
 *  1) WebGL fragment shader 로 radial gradient mesh + simplex noise (앰비언트 색 메시)
 *  2) 같은 캔버스 위에 Canvas 2D 폴리필처럼 그릴 수 없으므로,
 *     입자 네트워크는 두 번째 별도 캔버스 #bg-particles 에 그린다 (frontend-engineer가 둘 다 배치).
 *     단, 단일 layer 권장이므로 #bg-particles 가 없으면 동일 #bg-canvas 위에 WebGL 점/선으로 그린다.
 *
 * 실 사용 전략: 가장 가벼운 경로는 (a) WebGL 하나로 gradient,
 *  (b) overlay <canvas id="bg-particles"> 가 있으면 Canvas2D 로 입자 네트워크.
 *  (b) 가 없으면 입자는 skip — gradient만 표시.
 *
 * Fallback: WebGL 미지원 시 CSS radial-gradient 적용 + SVG noise 텍스처.
 * Reduced motion: 정적 그라데이션만 표시, RAF 루프 중단.
 * 화면 밖: IntersectionObserver 로 RAF 일시 중지.
 */

(function () {
  'use strict';

  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_MOBILE = window.matchMedia('(max-width: 767px)').matches;
  const PARTICLE_COUNT = IS_MOBILE ? 6 : 12;
  const PARTICLE_CONNECT_DIST = IS_MOBILE ? 180 : 220;
  const AMBIENT_LOOP_SECONDS = 20;

  const heroCanvas = document.getElementById('bg-canvas');
  if (!heroCanvas) {
    console.warn('[bg-animation] #bg-canvas not found — skipping');
    return;
  }

  // -----------------------------------------------------------------------
  // 1) Fallback: CSS gradient if WebGL unsupported OR reduced motion
  // -----------------------------------------------------------------------
  function applyStaticFallback(reason) {
    heroCanvas.style.display = 'none';
    const fallback = document.getElementById('bg-fallback') || createFallbackLayer();
    fallback.style.opacity = '1';
    if (reason) console.info('[bg-animation] fallback active:', reason);
  }

  function createFallbackLayer() {
    const div = document.createElement('div');
    div.id = 'bg-fallback';
    div.setAttribute('aria-hidden', 'true');
    div.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:-1', 'pointer-events:none',
      'background:radial-gradient(125% 90% at 20% 0%, rgba(139,92,246,0.35) 0%, rgba(6,182,212,0.20) 35%, rgba(7,10,20,0) 70%),' +
      ' radial-gradient(80% 80% at 80% 100%, rgba(236,72,153,0.18) 0%, rgba(7,10,20,0) 60%),' +
      ' var(--bg-primary, #070A14)',
      'opacity:0', 'transition:opacity 600ms ease',
    ].join(';');
    document.body.insertBefore(div, document.body.firstChild);
    return div;
  }

  // Reduced motion: 정적 fallback만 보여주고 종료
  if (PREFERS_REDUCED) {
    applyStaticFallback('prefers-reduced-motion');
    return;
  }

  // -----------------------------------------------------------------------
  // 2) WebGL gradient mesh layer
  // -----------------------------------------------------------------------
  const gl = heroCanvas.getContext('webgl', { antialias: true, premultipliedAlpha: false, alpha: false })
          || heroCanvas.getContext('experimental-webgl');

  if (!gl) {
    applyStaticFallback('WebGL unsupported');
    return;
  }

  const VS = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  // Simplex noise (Ashima) + ambient gradient mesh
  const FS = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    // ---- Ashima simplex noise 3D ----
    vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      // 가로세로 비율 보정 (메시가 가로로 늘어지지 않게)
      vec2 ar = vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 p = (uv - 0.5) * ar;

      float t = u_time * 0.04; // 20s loop 감각: u_time 단위 초

      // 마우스 영향: 약한 paralllax (감도 0.3, IA §5)
      vec2 m = (u_mouse - 0.5) * ar * 0.3;
      p += m * 0.05;

      // 두 개의 노이즈 필드 (서로 다른 스케일/속도)
      float n1 = snoise(vec3(p * 1.4, t * 0.18));
      float n2 = snoise(vec3(p * 2.2 + 10.0, t * 0.12 + 50.0));
      float n3 = snoise(vec3(p * 3.6 - 5.0, t * 0.08 + 100.0));

      // 토큰 컬러
      vec3 cBg     = vec3(0.027, 0.039, 0.078);   // #070A14 bg-primary
      vec3 cCyan   = vec3(0.024, 0.714, 0.831);   // #06B6D4 accent-primary
      vec3 cPurple = vec3(0.545, 0.361, 0.965);   // #8B5CF6 accent-secondary
      vec3 cPink   = vec3(0.925, 0.282, 0.600);   // #EC4899 accent-quaternary

      // 라디얼 vignette: 중앙에서 멀어질수록 어두워짐 (IA hero gradient: 좌상단 보라 + 우하단 핑크)
      vec2 topLeft = vec2(-0.55, 0.40);
      vec2 botRight = vec2(0.55, -0.50);
      float dTL = 1.0 - smoothstep(0.0, 1.2, length(p - topLeft));
      float dBR = 1.0 - smoothstep(0.0, 1.0, length(p - botRight));

      // 베이스
      vec3 col = cBg;

      // 1차: 시안 메시
      float n1m = n1 * 0.5 + 0.5;
      col = mix(col, cCyan, smoothstep(0.35, 0.95, n1m) * 0.22);

      // 2차: 퍼플 (좌상단 강조)
      float n2m = n2 * 0.5 + 0.5;
      col = mix(col, cPurple, smoothstep(0.40, 0.95, n2m) * (0.18 + dTL * 0.22));

      // 3차: 핑크 hint (우하단)
      float n3m = n3 * 0.5 + 0.5;
      col = mix(col, cPink, smoothstep(0.55, 0.95, n3m) * dBR * 0.16);

      // 글로벌 dim (가장자리 어두움)
      float vign = smoothstep(1.15, 0.30, length(p));
      col *= mix(0.62, 1.0, vign);

      // 미세 grain (균일성 깨뜨림)
      float grain = (fract(sin(dot(uv * u_resolution, vec2(12.9898,78.233))) * 43758.5453) - 0.5) * 0.012;
      col += grain;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, source) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('[bg-animation] shader compile error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  const vs = compile(gl.VERTEX_SHADER, VS);
  const fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) {
    applyStaticFallback('shader compile failed');
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[bg-animation] program link error:', gl.getProgramInfoLog(program));
    applyStaticFallback('program link failed');
    return;
  }
  gl.useProgram(program);

  // Fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1, -1,  1,
    -1,  1,  1, -1,  1,  1,
  ]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetMouseX = 0.5;
  let targetMouseY = 0.5;

  function resizeGL() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    heroCanvas.width = Math.floor(w * dpr);
    heroCanvas.height = Math.floor(h * dpr);
    heroCanvas.style.width = w + 'px';
    heroCanvas.style.height = h + 'px';
    gl.viewport(0, 0, heroCanvas.width, heroCanvas.height);
  }
  resizeGL();
  window.addEventListener('resize', () => {
    resizeGL();
    if (particles.canvas) resizeParticles();
  });

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = 1.0 - (e.clientY / window.innerHeight); // GL 좌표는 좌하단 원점
  }, { passive: true });

  // -----------------------------------------------------------------------
  // 3) Particle network (Canvas 2D, optional overlay #bg-particles)
  // -----------------------------------------------------------------------
  function ensureParticlesCanvas() {
    let c = document.getElementById('bg-particles');
    if (c) return c;
    // index.html 에 미리 두지 않은 환경 — 동적으로 생성하여 #bg-canvas 바로 뒤에 삽입
    c = document.createElement('canvas');
    c.id = 'bg-particles';
    c.setAttribute('aria-hidden', 'true');
    // animations.css §1 이 position:fixed; mix-blend:screen; opacity:0.85 를 부여
    heroCanvas.parentNode.insertBefore(c, heroCanvas.nextSibling);
    return c;
  }

  const particles = {
    canvas: ensureParticlesCanvas(),
    ctx: null,
    nodes: [],
    width: 0,
    height: 0,
  };

  function initParticles() {
    if (!particles.canvas) return;
    particles.ctx = particles.canvas.getContext('2d');
    resizeParticles();
    seedParticles();
  }

  function resizeParticles() {
    if (!particles.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    particles.width = w;
    particles.height = h;
    particles.canvas.width = Math.floor(w * dpr);
    particles.canvas.height = Math.floor(h * dpr);
    particles.canvas.style.width = w + 'px';
    particles.canvas.style.height = h + 'px';
    particles.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedParticles() {
    particles.nodes = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.nodes.push({
        x: Math.random() * particles.width,
        y: Math.random() * particles.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.6 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function stepParticles(now) {
    if (!particles.ctx) return;
    const ctx = particles.ctx;
    const w = particles.width;
    const h = particles.height;

    ctx.clearRect(0, 0, w, h);

    // 0.6s 호흡 사인파
    const breathBase = 0.65 + Math.sin(now / 600) * 0.15;

    // 마우스 위치 (가벼운 repulsion + parallax)
    const mx = mouseX * w;
    const my = (1.0 - mouseY) * h;
    const REPULSE_R = 120;

    // 1) 연결선
    for (let i = 0; i < particles.nodes.length; i++) {
      const a = particles.nodes[i];
      for (let j = i + 1; j < particles.nodes.length; j++) {
        const b = particles.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PARTICLE_CONNECT_DIST) {
          const alpha = (1 - dist / PARTICLE_CONNECT_DIST) * 0.35 * breathBase;
          ctx.strokeStyle = `rgba(111, 230, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // 2) 노드 + 이동
    for (let i = 0; i < particles.nodes.length; i++) {
      const n = particles.nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      // 마우스 repulsion
      const ddx = n.x - mx;
      const ddy = n.y - my;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < REPULSE_R * REPULSE_R && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const force = (REPULSE_R - d) / REPULSE_R * 0.4;
        n.x += (ddx / d) * force;
        n.y += (ddy / d) * force;
      }

      // 화면 경계 wrap
      if (n.x < -10) n.x = w + 10;
      if (n.x > w + 10) n.x = -10;
      if (n.y < -10) n.y = h + 10;
      if (n.y > h + 10) n.y = -10;

      // 호흡 글로우
      const breath = 0.55 + Math.sin(now / 600 + n.phase) * 0.20;
      const r = n.r;

      // glow ring
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
      grad.addColorStop(0, `rgba(34, 211, 238, ${(0.45 * breath).toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(139, 92, 246, ${(0.12 * breath).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
      ctx.fill();

      // dot core
      ctx.fillStyle = `rgba(245, 248, 255, ${(0.9 * breath).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  initParticles();

  // -----------------------------------------------------------------------
  // 4) Render loop
  // -----------------------------------------------------------------------
  let startTs = performance.now();
  let rafId = null;
  let running = true;

  function render(now) {
    // mouse easing
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    const t = ((now - startTs) / 1000) % AMBIENT_LOOP_SECONDS;

    gl.uniform2f(uResolution, heroCanvas.width, heroCanvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    stepParticles(now);

    if (running) rafId = requestAnimationFrame(render);
  }

  function start() {
    if (running && rafId !== null) return;
    running = true;
    startTs = performance.now() - (startTs ? performance.now() - startTs : 0);
    rafId = requestAnimationFrame(render);
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  start();

  // -----------------------------------------------------------------------
  // 5) Off-screen pause via IntersectionObserver (hero가 사라지면 멈춤)
  // -----------------------------------------------------------------------
  // hero 섹션 또는 canvas 자체를 관찰. canvas 는 fixed 라 항상 viewport — hero 컨텐츠를 관찰.
  const heroSection = document.querySelector('.hero, #hero, [data-section="hero"]') || heroCanvas;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    }, { threshold: 0.01 });
    io.observe(heroSection);
  }

  // 탭 비활성화 시 정지 (배터리 절약)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  // 디버그 노출
  window.__bgAnimation = { start, stop, particles, gl };
})();
