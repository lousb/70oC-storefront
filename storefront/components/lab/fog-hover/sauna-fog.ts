// Sauna glass overlay, ported from AudioVisuals/visualisers/webgl-sauna-timeout-overlay/fog.js.
//  - After idleMs without movement the glass steams up (blurred background + drifting steam).
//  - When the mouse moves, the fog holds and the cursor wipes through it:
//    mouse trail canvas -> fluid sim (diffuse + fbm + fade back to white) -> fog mask.
//  - It takes wipeMs of continuous movement on-screen to clear it. Stop or leave
//    the window and the timer + brush size reset, so the steam stays.
//    Once reached, the whole glass simply fades out (clearSeconds).
//
// Two ways to get what's behind the glass:
//  - "canvas": you paint it (drawBackground), e.g. the lab's tile grid.
//  - "page":   the real page. One snapshot of the viewport is taken per fog
//              cycle, just before the fog is due (you're idle, so nothing's
//              moving), and the fog waits for it - so it never forms over a stale
//              or missing snapshot, and the snapshot is never swapped while the
//              fog is showing (no jumps). While fogged, the snapshot follows small
//              scrolls; scrolling scrollClearPx, resizing, or invalidate() (route
//              changes) fades the fog out instead.
//
// The background gets a proper two-pass Gaussian blur, run once whenever the
// background or blur settings change (it's a still image), so it stays smooth
// at any strength with no pixelation, and edges clamp rather than fade.
//
// Every setting lives in FogConfig and can change live (setConfig).
import * as THREE from "three";
import MouseTrail from "./mouse-trail";
import type { PageCapture } from "./page-capture";

export type FogConfig = {
  /** ms of stillness before the glass steams up */
  idleMs: number;
  /** ms of CONTINUOUS on-screen movement needed before the glass clears */
  wipeMs: number;
  /** gap between pointer events that still counts as "moving" */
  movingGraceMs: number;
  /** seconds to fully steam up */
  fogInSeconds: number;
  /** seconds the fog takes to fade out once the wipe is complete */
  clearSeconds: number;
  /** brush width as a fraction of the screen width */
  brushSize: number;
  /** brush is this many times bigger by the time the glass clears */
  brushGrowth: number;
  /** how quickly the brush follows the cursor (0-1) */
  brushFollow: number;
  /** ms for the brush to grow from nothing when you start wiping (0 = full size straight away) */
  brushEaseMs: number;
  /** how fast wiped areas steam back up */
  refogPerSecond: number;
  /** blur of the background behind the steam, in CSS px */
  blurPx: number;
  /** how much the steam bends the background behind it */
  refraction: number;
  /** even film of fog everywhere (0-1) */
  baseHaze: number;
  /** visibility of the big drifting wisps (0-1) */
  wispStrength: number;
  /** visibility of the finer, faster curls (0-1) */
  curlStrength: number;
  /** size of the steam pattern (bigger = smaller wisps) */
  steamScale: number;
  /** how fast the steam drifts upward */
  steamSpeed: number;
  /** how much the density breathes in and out (0-1) */
  breathe: number;
  /** densest the steam can get (0-1) */
  maxSteam: number;
  /** colour of the steam */
  steamColor: string;
  /** plain white glass behind the steam instead of the page / background (page mode skips the snapshot) */
  whiteBackground: boolean;
  /** canvas pixel ratio (1 = CSS pixels; the steam is soft, so >1 mostly costs speed) */
  renderScale: number;
  /** fluid sim resolution relative to the screen */
  simScale: number;
  /** resolution of the background texture relative to the screen */
  bgResolution: number;
  /** page mode: px of scrolling that fades the fog away (0 = scrolling doesn't clear it) */
  scrollClearPx: number;
  /** seconds the scroll fade takes */
  scrollFadeSeconds: number;
};

export const DEFAULT_FOG_CONFIG: FogConfig = {
  idleMs: 5000,
  wipeMs: 2000,
  movingGraceMs: 200,
  fogInSeconds: 4,
  clearSeconds: 0.6,
  brushSize: 0.1,
  brushGrowth: 3.5,
  brushFollow: 0.25,
  brushEaseMs: 400,
  refogPerSecond: 0.35,
  blurPx: 24,
  refraction: 0.3,
  baseHaze: 0.16,
  wispStrength: 0.65,
  curlStrength: 0.25,
  steamScale: 0.9,
  steamSpeed: 0.12,
  breathe: 0.15,
  maxSteam: 0.92,
  steamColor: "#f2f5fa",
  whiteBackground: false,
  renderScale: 1,
  simScale: 0.25,
  bgResolution: 0.5,
  scrollClearPx: 100,
  scrollFadeSeconds: 0.35,
};

const NOISE = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = rot * p * 2.02; a *= 0.5; }
    return v;
}
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Fluid sim: 1 = fogged, 0 = wiped clear.
const simShader = /* glsl */ `
uniform sampler2D uPrev;
uniform sampler2D uTrail;
uniform vec2 uTexel;
uniform float uTime;
uniform float uRecover;
uniform float uExpand; // texels the clear area grows this frame (0 = not clearing)
varying vec2 vUv;
${NOISE}
void main() {
    float t = uTime * 0.3;
    vec2 warp = vec2(fbm(vUv * 6.0 + t), fbm(vUv * 6.0 + 5.3 - t)) - 0.5;
    vec2 uv = vUv + warp * uTexel * 2.5;
    vec2 d = uTexel * 1.2;
    float m = texture2D(uPrev, uv).r * 0.4
            + texture2D(uPrev, uv + vec2(d.x, 0.0)).r * 0.15
            + texture2D(uPrev, uv - vec2(d.x, 0.0)).r * 0.15
            + texture2D(uPrev, uv + vec2(0.0, d.y)).r * 0.15
            + texture2D(uPrev, uv - vec2(0.0, d.y)).r * 0.15;
    m += uRecover * (0.5 + fbm(vUv * 4.0 - t));
    m = min(m, texture2D(uTrail, vUv).r);

    if (uExpand > 0.0) {
        float jitter = 0.6 + 0.8 * fbm(vUv * 8.0 + t * 2.0);
        for (int i = 0; i < 12; i++) {
            float a = float(i) * 0.5236;
            vec2 dir = vec2(cos(a), sin(a)) * uTexel * uExpand * jitter;
            m = min(m, texture2D(uPrev, vUv + dir).r);
            m = min(m, texture2D(uPrev, vUv + dir * 0.5).r);
        }
    }
    gl_FragColor = vec4(vec3(clamp(m, 0.0, 1.0)), 1.0);
}
`;

// Separable Gaussian: run once horizontally, once vertically.
// Up to 65 taps; for big blurs the taps spread out (still smooth, it's a Gaussian of a Gaussian-ish).
const blurShader = /* glsl */ `
uniform sampler2D uSrc;
uniform vec2 uStep;   // one tap, in uv
uniform float uSigma; // in taps
varying vec2 vUv;
void main() {
    vec4 acc = vec4(0.0);
    float wsum = 0.0;
    float s2 = 2.0 * uSigma * uSigma;
    for (int i = -32; i <= 32; i++) {
        float x = float(i);
        float w = exp(-x * x / s2);
        acc += texture2D(uSrc, vUv + uStep * x) * w;
        wsum += w;
    }
    gl_FragColor = acc / wsum;
}
`;

const fogShader = /* glsl */ `
uniform sampler2D uBg;
uniform sampler2D uMask;
uniform vec2 uRes;
uniform vec2 uBgScale;    // screen uv -> background uv (page mode: the snapshot is taller than the screen
uniform vec2 uBgOffset;   //   and the page may have scrolled since it was taken)
uniform float uBgReady;   // 0 = nothing to show behind the steam yet
uniform float uWhiteBg;   // 1 = plain white glass behind the steam
uniform float uTime;
uniform float uFog;
uniform float uFade;      // 1 = normal, fades to 0 when clearing
uniform float uRefraction;
uniform float uBaseHaze;
uniform float uWisp;
uniform float uCurl;
uniform float uSteamScale;
uniform float uSteamSpeed;
uniform float uBreathe;
uniform float uMaxSteam;
uniform vec3 uSteamColor;
varying vec2 vUv;
${NOISE}
void main() {
    // Domain-warped noise drifting upward: soft rolling wisps of steam
    vec2 suv = gl_FragCoord.xy / uRes.y;
    float t = uTime * uSteamSpeed;
    vec2 p = suv * uSteamScale;
    vec2 q = vec2(fbm(p + vec2(0.0, -t)), fbm(p + vec2(5.2, 1.3 - t * 0.8)));
    vec2 r = vec2(fbm(p + 1.6 * q + vec2(1.7, 9.2) + vec2(t * 0.15, -t * 0.6)),
                  fbm(p + 1.6 * q + vec2(8.3, 2.8) + vec2(-t * 0.1, -t * 0.5)));
    float wisps = smoothstep(0.3, 0.8, fbm(p + 1.4 * r + vec2(0.0, -t * 0.4)));
    vec2 p2 = suv * uSteamScale * 2.444 + vec2(sin(t * 1.3 + suv.y * 3.0) * 0.15, -t * 2.2);
    float curls = smoothstep(0.45, 0.85, fbm(p2 + 0.8 * q));
    float breathe = (1.0 - uBreathe) + uBreathe * sin(uTime * 0.6 + fbm(suv * 1.5) * 6.0);
    float steam = (uBaseHaze + uWisp * wisps + uCurl * curls) * breathe;
    steam = clamp(steam, 0.0, uMaxSteam);

    // Steam rolls in patchily rather than all at once
    float build = fbm(suv * 2.0 + 11.0);
    float local = smoothstep(build - 0.3, build + 0.2, uFog * 1.3);
    float mask = smoothstep(0.05, 0.9, texture2D(uMask, vUv).r);
    float coverage = local * mask * uFade;

    if (uWhiteBg > 0.5) {
        vec3 col = mix(vec3(1.0), uSteamColor, steam);
        gl_FragColor = vec4(col * coverage, coverage); // premultiplied
        return;
    }

    if (uBgReady < 0.5) {
        // Nothing to show behind the glass yet: steam only
        float a = steam * coverage;
        gl_FragColor = vec4(uSteamColor * a, a);
        return;
    }

    // Blurred view of what's behind the glass (pre-blurred), bent by the steam.
    // Edges clamp, so the border never pulls in or fades.
    vec2 bend = (r - 0.5) * uRefraction * 0.08 * (0.4 + steam);
    vec2 buv = clamp((vUv + bend) * uBgScale + uBgOffset, 0.0, 1.0);
    vec3 bg = texture2D(uBg, buv).rgb;

    vec3 col = mix(bg, uSteamColor, steam);
    gl_FragColor = vec4(col * coverage, coverage); // premultiplied
}
`;

const quad = (material: THREE.Material) => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  return scene;
};

export type SaunaFogOptions = {
  /** "canvas" (default): paint the background yourself. "page": snapshot the real page. */
  mode?: "canvas" | "page";
  /** canvas mode: paints what's behind the glass at the given scale (CSS px * scale). */
  drawBackground?: (ctx: CanvasRenderingContext2D, scale: number) => void;
  /** page mode: takes the snapshot (see page-capture.ts). */
  capture?: () => Promise<PageCapture>;
  config?: Partial<FogConfig>;
  /** Defaults to document.body. The canvas is position:fixed either way. */
  container?: HTMLElement;
  zIndex?: number;
};

export type SaunaFog = {
  /** Re-draw the background (canvas mode: call after it changes). */
  refresh: () => void;
  /** Page mode: the page changed (e.g. new route), re-take the snapshot. */
  invalidate: () => void;
  /** Merge in new settings, live. */
  setConfig: (patch: Partial<FogConfig>) => void;
  /** Skip the idle wait and steam up straight away. */
  steamNow: () => void;
  /** Wipe everything clear straight away. */
  clearNow: () => void;
  destroy: () => void;
};

const CAPTURE_LEAD_MS = 1200; // page mode: take the snapshot this long before the fog is due
const CAPTURE_WAIT_MS = 3000; // hold the fog this long for a snapshot before going without

export function createSaunaFog({
  mode = "canvas",
  drawBackground,
  capture,
  config: initial,
  container,
  zIndex = 400,
}: SaunaFogOptions): SaunaFog {
  const config: FogConfig = { ...DEFAULT_FOG_CONFIG, ...initial };
  const page = mode === "page";

  const renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: true, antialias: false });
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  renderer.domElement.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${zIndex};`;
  renderer.domElement.setAttribute("data-fog-ignore", "");
  (container ?? document.body).append(renderer.domElement);
  const camera = new THREE.Camera();

  // Background, drawn at bgResolution then Gaussian-blurred on the GPU
  const bgCanvas = document.createElement("canvas");
  const bgCtx = bgCanvas.getContext("2d")!;
  const bgTexture = new THREE.CanvasTexture(bgCanvas);
  bgTexture.minFilter = bgTexture.magFilter = THREE.LinearFilter;
  bgTexture.wrapS = bgTexture.wrapT = THREE.ClampToEdgeWrapping;
  bgTexture.generateMipmaps = false;

  const rtOptions = {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  };
  let simA: THREE.WebGLRenderTarget | null = null;
  let simB: THREE.WebGLRenderTarget | null = null;
  let trail: MouseTrail | null = null;
  let blurA: THREE.WebGLRenderTarget | null = null;
  let blurB: THREE.WebGLRenderTarget | null = null;

  const blurMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: blurShader,
    blending: THREE.NoBlending,
    depthTest: false,
    uniforms: { uSrc: { value: null }, uStep: { value: new THREE.Vector2() }, uSigma: { value: 1 } },
  });
  const blurScene = quad(blurMaterial);

  const simMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: simShader,
    blending: THREE.NoBlending,
    depthTest: false,
    uniforms: {
      uPrev: { value: null },
      uTrail: { value: null },
      uTexel: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uRecover: { value: 0 },
      uExpand: { value: 0 },
    },
  });
  const fogMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: fogShader,
    blending: THREE.NoBlending,
    depthTest: false,
    uniforms: {
      uBg: { value: null },
      uMask: { value: null },
      uRes: { value: new THREE.Vector2() },
      uBgScale: { value: new THREE.Vector2(1, 1) },
      uBgOffset: { value: new THREE.Vector2() },
      uBgReady: { value: page ? 0 : 1 },
      uWhiteBg: { value: 0 },
      uTime: { value: 0 },
      uFog: { value: 0 },
      uFade: { value: 1 },
      uRefraction: { value: 0 },
      uBaseHaze: { value: 0 },
      uWisp: { value: 0 },
      uCurl: { value: 0 },
      uSteamScale: { value: 0 },
      uSteamSpeed: { value: 0 },
      uBreathe: { value: 0 },
      uMaxSteam: { value: 0 },
      uSteamColor: { value: new THREE.Color() },
    },
  });
  const simScene = quad(simMaterial);
  const fogScene = quad(fogMaterial);

  const applyUniforms = () => {
    const u = fogMaterial.uniforms;
    u.uRefraction.value = config.refraction;
    u.uWhiteBg.value = config.whiteBackground ? 1 : 0;
    u.uBaseHaze.value = config.baseHaze;
    u.uWisp.value = config.wispStrength;
    u.uCurl.value = config.curlStrength;
    u.uSteamScale.value = config.steamScale;
    u.uSteamSpeed.value = config.steamSpeed;
    u.uBreathe.value = config.breathe;
    u.uMaxSteam.value = config.maxSteam;
    (u.uSteamColor.value as THREE.Color).set(config.steamColor);
    if (trail) {
      trail.brushSize = config.brushSize;
      trail.follow = config.brushFollow;
    }
  };

  const clearSim = () => {
    renderer.setClearColor(0xffffff, 1);
    for (const rt of [simA, simB]) {
      renderer.setRenderTarget(rt);
      renderer.clear();
    }
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x000000, 0);
  };

  // ---- fog state ----
  let fog = 0;
  let wiped = 0;
  let clearing: number | null = null;

  // ---- page snapshot state ----
  let snapshot: PageCapture | null = null;
  let capturing = false;
  let capturedThisCycle = false; // a snapshot has been taken (or started) for the upcoming fog
  let pendingSteam = false;
  let destroyed = false;
  let fading = false; // fade-out in progress (wipe complete, or scrolled)
  let fadeLevel = 1;
  let fadeSeconds = 0.6;
  const startFade = (seconds: number) => {
    if (fading) return;
    fading = true;
    fadeSeconds = Math.max(0.01, seconds);
  };
  let scrolledWhileFogged = 0;
  let lastScrollY = scrollY;

  const reset = () => {
    wiped = 0;
    clearing = null;
    fading = false;
    fadeLevel = 1;
    scrolledWhileFogged = 0;
    clearSim();
  };

  // Two-pass Gaussian of bgCanvas into blurB (only when the background or blur changes)
  const runBlur = () => {
    const w = bgCanvas.width;
    const h = bgCanvas.height;
    if (!blurA || blurA.width !== w || blurA.height !== h) {
      blurA?.dispose();
      blurB?.dispose();
      blurA = new THREE.WebGLRenderTarget(w, h, rtOptions);
      blurB = new THREE.WebGLRenderTarget(w, h, rtOptions);
      for (const rt of [blurA, blurB]) rt.texture.wrapS = rt.texture.wrapT = THREE.ClampToEdgeWrapping;
    }
    // blurPx is roughly the visible radius; sigma in background texels
    const sigma = Math.max(0.001, (config.blurPx * config.bgResolution) / 2);
    const spread = Math.max(1, (sigma * 3) / 32); // spread the 65 taps for big blurs
    const u = blurMaterial.uniforms;
    u.uSigma.value = sigma / spread;
    u.uSrc.value = bgTexture;
    u.uStep.value.set(spread / w, 0);
    renderer.setRenderTarget(blurA);
    renderer.render(blurScene, camera);
    u.uSrc.value = blurA.texture;
    u.uStep.value.set(0, spread / h);
    renderer.setRenderTarget(blurB);
    renderer.render(blurScene, camera);
    renderer.setRenderTarget(null);
    fogMaterial.uniforms.uBg.value = blurB!.texture;
  };

  let bgSize = "";
  const refresh = () => {
    const res = config.bgResolution;
    if (page) {
      const snapH = snapshot ? innerHeight + snapshot.padTop + snapshot.padBottom : innerHeight;
      bgCanvas.width = Math.max(1, Math.ceil(innerWidth * res));
      bgCanvas.height = Math.max(1, Math.ceil(snapH * res));
      if (snapshot) {
        bgCtx.imageSmoothingEnabled = true;
        bgCtx.imageSmoothingQuality = "high";
        bgCtx.drawImage(snapshot.canvas, 0, 0, bgCanvas.width, bgCanvas.height);
      }
      fogMaterial.uniforms.uBgReady.value = snapshot ? 1 : 0;
    } else {
      bgCanvas.width = Math.max(1, Math.ceil(innerWidth * res));
      bgCanvas.height = Math.max(1, Math.ceil(innerHeight * res));
      drawBackground?.(bgCtx, res);
    }
    // A new size needs fresh texture storage (three won't resize it in place)
    const size = `${bgCanvas.width}x${bgCanvas.height}`;
    if (size !== bgSize) {
      bgTexture.dispose();
      bgSize = size;
    }
    bgTexture.needsUpdate = true;
    runBlur();
  };

  const takeSnapshot = async () => {
    if (!page || !capture || capturing) return;
    capturing = true;
    capturedThisCycle = true;
    try {
      const t0 = performance.now();
      const result = await capture();
      // Debug: inspect the last snapshot in the console with window.__fogSnapshot
      (window as any).__fogSnapshot = { ...result, ms: Math.round(performance.now() - t0), at: new Date().toLocaleTimeString() };
      console.debug("[fog-hover] snapshot", (window as any).__fogSnapshot);
      if (!destroyed) {
        snapshot = result;
        refresh();
      }
    } catch (err) {
      // Better plain steam than a stale snapshot of a different view
      console.warn("[fog-hover] page snapshot failed", err);
      snapshot = null;
      if (!destroyed) refresh();
    } finally {
      capturing = false;
      if (pendingSteam && !destroyed) {
        pendingSteam = false;
        reset();
        fog = 1;
      }
    }
  };

  const resize = () => {
    renderer.setPixelRatio(config.renderScale);
    renderer.setSize(innerWidth, innerHeight, false);
    const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
    fogMaterial.uniforms.uRes.value.copy(buf);
    const w = Math.max(1, Math.round(innerWidth * config.simScale));
    const h = Math.max(1, Math.round(innerHeight * config.simScale));
    simA?.dispose();
    simB?.dispose();
    simA = new THREE.WebGLRenderTarget(w, h, rtOptions);
    simB = new THREE.WebGLRenderTarget(w, h, rtOptions);
    simMaterial.uniforms.uTexel.value.set(1 / w, 1 / h);
    if (trail) trail.resize(w, h);
    else trail = new MouseTrail(w, h);
    applyUniforms();
    clearSim();
    refresh();
  };

  let lastMove = performance.now();
  let lastScroll = 0; // scrolling keeps the glass from steaming up, but isn't a wipe
  let onScreen = true;
  const mouse = { x: 0.5, y: 0.5 };
  const wake = () => {
    lastMove = performance.now();
  };
  const onPointerMove = (e: PointerEvent) => {
    mouse.x = e.clientX / innerWidth;
    mouse.y = e.clientY / innerHeight;
    onScreen = true;
    wake();
  };
  const onLeave = () => {
    onScreen = false;
  };
  const onScroll = () => {
    const y = scrollY;
    if (fog > 0 && clearing === null && !fading) scrolledWhileFogged += Math.abs(y - lastScrollY);
    lastScrollY = y;
    lastScroll = performance.now();
  };
  const onResize = () => {
    resize();
    if (page) {
      // The old snapshot no longer matches the window: drop it, fade out, re-take next cycle
      snapshot = null;
      capturedThisCycle = false;
      refresh();
      if (fog > 0) startFade(0.2);
    }
  };

  addEventListener("resize", onResize);
  addEventListener("pointermove", onPointerMove, { passive: true });
  const wakeEvents = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
  for (const ev of wakeEvents) addEventListener(ev, wake, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  addEventListener("blur", onLeave);
  if (page) addEventListener("scroll", onScroll, { passive: true });

  resize();

  let prev = performance.now();
  let raf = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    const sinceMove = now - lastMove;
    const sinceActive = Math.min(sinceMove, now - lastScroll);
    const idle = sinceActive > config.idleMs;
    const moving = onScreen && sinceMove < config.movingGraceMs;

    if (page) {
      const fogDueSoon = sinceActive > config.idleMs - CAPTURE_LEAD_MS;
      const leaving = clearing !== null || fading;
      // Glass clear and you're active again: the next fog gets a fresh snapshot
      if (fog === 0 && !fogDueSoon && !capturing) capturedThisCycle = false;
      // Only ever snapshot while the glass is clear, just before the fog is due
      if (fog === 0 && fogDueSoon && !capturedThisCycle && !capturing && !config.whiteBackground) void takeSnapshot();
      if (snapshot) {
        // Snapshot covers [-padTop, innerHeight + padBottom] of the page as it was when taken
        const H = innerHeight + snapshot.padTop + snapshot.padBottom;
        const dy = scrollY - snapshot.scrollY;
        fogMaterial.uniforms.uBgScale.value.set(1, innerHeight / H);
        fogMaterial.uniforms.uBgOffset.value.set((scrollX - snapshot.scrollX) / innerWidth, (snapshot.padBottom - dy) / H);
      }
      if (config.scrollClearPx > 0 && fog > 0 && !leaving && scrolledWhileFogged >= config.scrollClearPx) {
        startFade(config.scrollFadeSeconds);
      }
    }

    if (fading) {
      fadeLevel = Math.max(0, fadeLevel - dt / fadeSeconds);
      if (fadeLevel <= 0) fog = 0;
    } else if (clearing !== null) {
      clearing += dt;
      if (clearing > config.clearSeconds) fog = Math.max(0, fog - dt / 0.3);
    } else if (idle) {
      wiped = 0;
      // Page mode: don't start steaming over a stale snapshot while a fresh one is on its way
      const waiting =
        page && !config.whiteBackground && fog === 0 && (capturing || !capturedThisCycle) && sinceActive - config.idleMs < CAPTURE_WAIT_MS;
      if (!waiting) fog = Math.min(1, fog + dt / Math.max(0.01, config.fogInSeconds));
    } else if (fog > 0) {
      wiped = moving ? wiped + dt * 1000 : 0;
      if (wiped >= config.wipeMs) startFade(config.clearSeconds);
    }

    renderer.setRenderTarget(null);
    renderer.clear();
    if (fog <= 0.001) {
      fog = 0;
      if (clearing !== null || wiped > 0 || fading || scrolledWhileFogged > 0) reset();
      return;
    }

    const t = trail!;
    t.active = moving;
    // Brush eases in from nothing as you start wiping (and again each time you stop and restart),
    // then grows towards brushGrowth as the wipe carries on
    const easeT = config.brushEaseMs > 0 ? Math.min(1, wiped / config.brushEaseMs) : 1;
    const easeIn = easeT * easeT * (3 - 2 * easeT);
    t.scale = easeIn * (1 + (config.brushGrowth - 1) * Math.min(1, wiped / Math.max(1, config.wipeMs)));
    t.update(mouse.x, mouse.y);
    simMaterial.uniforms.uPrev.value = simA!.texture;
    simMaterial.uniforms.uTrail.value = t.texture;
    simMaterial.uniforms.uTime.value = now / 1000;
    simMaterial.uniforms.uRecover.value = clearing === null ? config.refogPerSecond * dt : 0;
    const simSpan = Math.hypot(simA!.width, simA!.height);
    simMaterial.uniforms.uExpand.value =
      clearing === null ? 0 : (simSpan / Math.max(0.05, config.clearSeconds)) * dt;
    renderer.setRenderTarget(simB);
    renderer.render(simScene, camera);
    [simA, simB] = [simB, simA];

    renderer.setRenderTarget(null);
    const eased = fog * fog * (3 - 2 * fog);
    fogMaterial.uniforms.uMask.value = simA!.texture;
    fogMaterial.uniforms.uTime.value = now / 1000;
    fogMaterial.uniforms.uFog.value = eased;
    fogMaterial.uniforms.uFade.value = fadeLevel;
    renderer.render(fogScene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    refresh,
    invalidate() {
      // New page behind the glass: fade out, snapshot again next cycle
      if (fog > 0) startFade(config.scrollFadeSeconds);
      capturedThisCycle = false;
    },
    setConfig(patch) {
      const needsResize =
        (patch.simScale !== undefined && patch.simScale !== config.simScale) ||
        (patch.bgResolution !== undefined && patch.bgResolution !== config.bgResolution) ||
        (patch.renderScale !== undefined && patch.renderScale !== config.renderScale);
      const needsBlur = patch.blurPx !== undefined && patch.blurPx !== config.blurPx;
      Object.assign(config, patch);
      if (needsResize) resize();
      else {
        applyUniforms();
        if (needsBlur) runBlur();
      }
    },
    steamNow() {
      if (page && capture && !config.whiteBackground) {
        // Take a fresh snapshot first, then steam up
        pendingSteam = true;
        if (!capturing) void takeSnapshot();
      } else {
        reset();
        fog = 1;
      }
    },
    clearNow() {
      pendingSteam = false;
      fog = 0;
      reset();
      wake();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onPointerMove);
      for (const ev of wakeEvents) removeEventListener(ev, wake);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("blur", onLeave);
      removeEventListener("scroll", onScroll);
      simA?.dispose();
      simB?.dispose();
      blurA?.dispose();
      blurB?.dispose();
      blurMaterial.dispose();
      trail?.dispose();
      bgTexture.dispose();
      simMaterial.dispose();
      fogMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
