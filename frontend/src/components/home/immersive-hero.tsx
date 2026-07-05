"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Igloo-style WebGL hero: procedural night landscape (fbm ridge layers, stars,
 * moon, mist, chromatic aberration, frost-dissolve intro) + floating lantern
 * particles. One fullscreen quad + one Points draw call — no assets to load.
 * Respects prefers-reduced-motion by rendering a single static frame.
 */

const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const LANDSCAPE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform float uReveal;
uniform float uAspect;
uniform vec2 uMouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

vec3 render(vec2 uv) {
  // restrained monochrome night: near-black indigo up top, cold teal breath at the horizon
  vec3 col = mix(vec3(0.012, 0.018, 0.038), vec3(0.045, 0.10, 0.13), pow(1.0 - uv.y, 2.2));

  // pin-point stars: distance to a jittered point inside each cell, not the whole cell
  vec2 sp = uv * vec2(uAspect, 1.0) * 26.0;
  vec2 cell = floor(sp);
  float sh = hash(cell);
  vec2 spos = vec2(hash(cell + 1.3), hash(cell + 5.7));
  float sd = length(fract(sp) - spos);
  float star = smoothstep(0.03, 0.0, sd) * step(0.82, sh);
  float tw = 0.55 + 0.45 * sin(uTime * 1.2 + sh * 40.0);
  col += vec3(0.65, 0.78, 0.9) * star * tw * smoothstep(0.4, 0.95, uv.y) * 0.5;

  // small high moon, soft and quiet
  float md = length((uv - vec2(0.84, 0.87)) * vec2(uAspect, 1.0));
  col += vec3(0.85, 0.92, 1.0) * smoothstep(0.022, 0.017, md) * 0.5;
  col += vec3(0.45, 0.65, 0.80) * exp(-md * 10.0) * 0.10;

  // ridge layers, back to front, with per-layer parallax
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float depth = fi / 3.0;
    float par = mix(0.15, 0.55, depth);
    vec2 mp = vec2(
      uv.x * mix(1.6, 3.2, depth) + fi * 13.7 + uMouse.x * par * 0.06 + uTime * (0.004 + 0.006 * depth),
      fi * 7.1
    );
    float h = mix(0.58, 0.14, depth)
      + (fbm(mp) - 0.5) * mix(0.20, 0.32, depth)
      + uScroll * par * 0.35
      + uMouse.y * par * 0.02;
    float m = smoothstep(h + 0.002, h - 0.002, uv.y);
    // atmospheric perspective: far ridges hold a little sky light, front goes black
    vec3 mcol = mix(vec3(0.045, 0.085, 0.115), vec3(0.008, 0.014, 0.024), depth);
    col = mix(col, mcol, m);

    // a handful of warm window lights below the two front ridge lines — the hidden stays
    if (i >= 2) {
      vec2 lc = floor(vec2(uv.x * 26.0 + fi * 31.0, uv.y * 42.0));
      float lp = hash(lc);
      vec2 lpos = vec2(hash(lc + 2.1), hash(lc + 4.4));
      float ld = length((fract(vec2(uv.x * 26.0 + fi * 31.0, uv.y * 42.0)) - lpos) * vec2(1.0, 2.2));
      float lit = smoothstep(0.05, 0.0, ld) * step(0.93, lp) * m * smoothstep(h - 0.22, h - 0.05, uv.y);
      col += vec3(1.0, 0.55, 0.22) * lit * (0.7 + 0.3 * sin(uTime * 1.3 + lp * 90.0)) * 0.5;
    }

    // thin mist seam above each ridge line
    col += vec3(0.35, 0.5, 0.55) * 0.030 * (1.0 - depth) * smoothstep(h + 0.10, h, uv.y) * (1.0 - m);
  }

  // valley fog
  col += vec3(0.35, 0.5, 0.55) * 0.05 * pow(max(1.0 - uv.y, 0.0), 2.5);
  return col;
}

void main() {
  vec2 uv = vUv;

  // chromatic aberration: barely-there at rest, only blooms while leaving the hero
  vec2 ca = (uv - 0.5) * (0.0008 + uScroll * 0.004);
  vec3 col;
  col.r = render(uv + ca).r;
  col.g = render(uv).g;
  col.b = render(uv - ca).b;

  // fine grain + gentle vignette
  col += (hash(uv * vec2(uAspect, 1.0) * 900.0 + uTime) - 0.5) * 0.018;
  float vig = smoothstep(1.35, 0.45, length((uv - 0.5) * vec2(uAspect * 0.85, 1.15)));
  col *= mix(0.85, 1.0, vig);

  // frost-dissolve intro: each pixel clears once uReveal passes its noise threshold
  float n = fbm(uv * 5.0);
  col *= smoothstep(n - 0.25, n + 0.05, uReveal);

  // dim as the user scrolls into the content
  col *= 1.0 - uScroll * 0.45;

  // lift authored-linear values to display gamma, softened to keep the night deep
  col = pow(max(col, 0.0), vec3(0.62));

  gl_FragColor = vec4(col, 1.0);
}
`;

const LANTERN_VERT = /* glsl */ `
attribute float aSeed;
attribute float aDepth;
attribute float aPhase;
uniform float uTime;
uniform float uScroll;
uniform float uDpr;
uniform vec2 uMouse;
varying float vDepth;
varying float vTw;

void main() {
  float speed = mix(0.006, 0.02, aDepth);
  // rise slowly from the valley; most of the journey stays in the lower half
  float y = -1.1 + fract(aSeed + uTime * speed) * 1.7;
  float x = -1.15 + fract(aSeed * 1.618 + aPhase * 0.001) * 2.3;
  x += sin(uTime * (0.2 + aDepth * 0.3) + aPhase) * 0.05 * aDepth;
  x += uMouse.x * 0.06 * aDepth;
  y += uMouse.y * 0.04 * aDepth + uScroll * aDepth * 0.9;
  vDepth = aDepth;
  // fade out as they climb so the sky stays clean
  vTw = (0.5 + 0.5 * sin(uTime * (1.2 + aDepth) + aPhase * 3.7)) * smoothstep(0.9, -0.2, y);
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = mix(1.5, 5.0, aDepth * aDepth) * uDpr;
}
`;

const LANTERN_FRAG = /* glsl */ `
precision mediump float;
varying float vDepth;
varying float vTw;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d) * vTw;
  vec3 col = mix(vec3(1.0, 0.5, 0.18), vec3(1.0, 0.8, 0.4), vDepth);
  gl_FragColor = vec4(col * a, a * 0.3);
}
`;

export function ImmersiveHero({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.25 : 1.75);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      return; // no WebGL — CSS gradient behind the mount stays visible
    }
    renderer.setPixelRatio(dpr);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const shared = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };

    const landUniforms = {
      ...shared,
      uReveal: { value: reduced ? 1.3 : 0 },
      uAspect: { value: 1 },
    };
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: QUAD_VERT,
        fragmentShader: LANDSCAPE_FRAG,
        uniforms: landUniforms,
        depthTest: false,
      })
    );
    scene.add(quad);

    const count = isSmall ? 90 : 180; // ponytail: capped counts, no LOD system
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const seed = new Float32Array(count);
    const depth = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seed[i] = Math.random() * 100;
      depth[i] = Math.random();
      phase[i] = Math.random() * Math.PI * 2;
    }
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aDepth", new THREE.BufferAttribute(depth, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    const lanterns = new THREE.Points(
      geo,
      new THREE.ShaderMaterial({
        vertexShader: LANTERN_VERT,
        fragmentShader: LANTERN_FRAG,
        uniforms: { ...shared, uDpr: { value: dpr } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      })
    );
    lanterns.frustumCulled = false;
    scene.add(lanterns);

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      landUniforms.uAspect.value = w / h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const mouseTarget = new THREE.Vector2(0, 0);
    const onPointer = (e: PointerEvent) => {
      mouseTarget.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    const onScroll = () => {
      const h = el.clientHeight || 1;
      shared.uScroll.value = Math.min(Math.max(window.scrollY / h, 0), 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const t0 = performance.now();
    let last = 0;
    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      const dt = Math.min(t - last, 0.05);
      last = t;
      shared.uTime.value = t;
      shared.uMouse.value.lerp(mouseTarget, 0.05);
      if (landUniforms.uReveal.value < 1.3) landUniforms.uReveal.value += dt * 0.65;
      renderer.render(scene, camera);
    };

    let cleanupIo: (() => void) | undefined;
    if (reduced) {
      // static frame, no animation loop
      renderer.render(scene, camera);
    } else {
      renderer.setAnimationLoop(frame);
      // stop rendering while the hero is scrolled out of view
      const io = new IntersectionObserver(([entry]) => {
        renderer.setAnimationLoop(entry.isIntersecting ? frame : null);
      });
      io.observe(el);
      cleanupIo = () => io.disconnect();
    }

    return () => {
      cleanupIo?.();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      renderer.setAnimationLoop(null);
      quad.geometry.dispose();
      (quad.material as THREE.Material).dispose();
      geo.dispose();
      (lanterns.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className={className}
      // fallback while WebGL boots (or if unavailable): matches shader sky
      style={{ background: "linear-gradient(to bottom, #050a17, #0d2230)" }}
    />
  );
}
