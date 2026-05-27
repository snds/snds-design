import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
// @ts-ignore - examples module has no bundled types
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import {
  redDark, tomatoDark, orangeDark, amberDark, yellowDark, limeDark,
  grassDark, greenDark, jadeDark, tealDark, cyanDark, blueDark,
  indigoDark, irisDark, violetDark, purpleDark, plumDark, pinkDark, crimsonDark,
} from '@radix-ui/colors';
import { NOISE_GLSL } from './glsl';
import { CASE_STUDIES } from '../data/caseStudies';

/* 2D-in-3D HUD labels — real Berkeley Mono DOM pinned to points on the form. */
const LABELS: Array<{ text: string; pos: [number, number, number] }> = [
  { text: 'EMBEDDING SPACE', pos: [2.5, 1.3, 0.6] },
  { text: 'TOKENS · 200K', pos: [-1.8, 2.1, -0.9] },
  { text: 'COMPONENTS', pos: [2.2, -1.7, 1.1] },
  { text: 'Δ STRUCTURE', pos: [-2.3, -0.6, 1.3] },
];

/* Case-study NODES — fixed, colored points on the form. */
const NODES_3D = CASE_STUDIES.map((cs, i) => {
  const az = (i / CASE_STUDIES.length) * Math.PI * 2;
  const el = i % 2 === 0 ? -0.35 : 0.5;
  const dir = new THREE.Vector3(
    Math.cos(az) * Math.cos(el),
    Math.sin(el),
    Math.sin(az) * Math.cos(el),
  ).multiplyScalar(2.25);
  return { dir, color: new THREE.Color(cs.color), cs };
});
const DEFAULT_FILL = new THREE.Color('#22d3e0');
const Y_AXIS = new THREE.Vector3(0, 1, 0);

const VIEW_DIRS = [
  new THREE.Vector3(0.15, 0.22, 1).normalize(),
  ...NODES_3D.map((n) => n.dir.clone().normalize()),
];
const VIEW_COLORS = [DEFAULT_FILL, ...NODES_3D.map((n) => n.color)];

/* Radix hue wheel — spectral order. Connectors + join particles pull from
   this by azimuth, so spatially-near connections share hues and the field
   gradiates around the form. */
const WHEEL = [
  redDark.red9, tomatoDark.tomato9, orangeDark.orange9, amberDark.amber9,
  yellowDark.yellow9, limeDark.lime9, grassDark.grass9, greenDark.green9,
  jadeDark.jade9, tealDark.teal9, cyanDark.cyan9, blueDark.blue9,
  indigoDark.indigo9, irisDark.iris9, violetDark.violet9, purpleDark.purple9,
  plumDark.plum9, pinkDark.pink9, crimsonDark.crimson9,
].map((h) => new THREE.Color(h));

function wheelColor(az: number, out: THREE.Color) {
  const tt = (az / (Math.PI * 2) + 0.5 + 1) % 1; // 0..1 around Y
  const x = tt * WHEEL.length;
  const i0 = Math.floor(x) % WHEEL.length;
  const i1 = (i0 + 1) % WHEEL.length;
  return out.copy(WHEEL[i0]).lerp(WHEEL[i1], x - Math.floor(x));
}

const _scratch = new THREE.Vector3();
function slerpDir(a: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3) {
  const d = Math.min(Math.max(a.dot(b), -1), 1);
  if (d > 0.9995) return out.copy(a).lerp(b, t).normalize();
  const theta = Math.acos(d) * t;
  _scratch.copy(a).multiplyScalar(d);
  _scratch.subVectors(b, _scratch).normalize();
  return out.copy(a).multiplyScalar(Math.cos(theta)).addScaledVector(_scratch, Math.sin(theta));
}

const TW = 256;
const TH = 128;
const COUNT = TW * TH;

function fibSphere(i: number, n: number, r: number) {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ] as const;
}

const velocityShader = /* glsl */ `
uniform float dt; uniform float uTime; uniform float uMorph;
uniform float uGravity; uniform float uSpring; uniform float uFluid;
uniform float uFluidScale; uniform float uCoherence; uniform float uDamp;
uniform float uMaxSpeed; uniform vec3 uPointer; uniform float uPointerRadius;
uniform float uPointerForce; uniform sampler2D tTargetA; uniform sampler2D tTargetB;
${NOISE_GLSL}
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  vec3 home = mix(texture2D(tTargetA, uv).xyz, texture2D(tTargetB, uv).xyz, uMorph);
  float cn = snoise(home * 0.7 + vec3(0.0, 0.0, uTime * 0.015)) * 0.5 + 0.5;
  float coh = 1.0 - smoothstep(uCoherence - 0.08, uCoherence + 0.08, cn);
  vec3 force = (home - pos) * (uSpring * (0.35 + coh * 1.35));
  vec3 toC = -pos;
  float r = length(toC) + 0.2;
  force += normalize(toC) * (uGravity / r);
  vec3 fl = curlNoise(pos * uFluidScale + vec3(0.0, 0.0, uTime * 0.06));
  force += fl * (uFluid * (0.12 + (1.0 - coh) * 1.25));
  vec3 fromP = pos - uPointer;
  float pinf = smoothstep(uPointerRadius, 0.0, length(fromP));
  force += normalize(fromP + vec3(1e-4)) * pinf * uPointerForce;
  vel += force * dt;
  vel *= uDamp;
  float sp = length(vel);
  if (sp > uMaxSpeed) vel = vel / sp * uMaxSpeed;
  gl_FragColor = vec4(vel, 1.0);
}
`;

const positionShader = /* glsl */ `
uniform float dt;
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  pos += vel * dt;
  gl_FragColor = vec4(pos, length(vel));
}
`;

const renderVertex = /* glsl */ `
uniform sampler2D tPosition;
uniform float uSize; uniform float uPixelRatio;
uniform vec3 uLightDir; uniform vec3 uLightDir2; uniform float uFill;
uniform vec3 uPointer; uniform float uPointerRadius;
uniform float uFocus; uniform float uDofRange;
uniform vec3 uNodePos; uniform float uNodeStrength; uniform float uNodeRadius;
attribute vec2 aRef; attribute float aScale;
varying float vDepth; varying float vGlow; varying float vShade;
varying float vFill; varying float vSpeed; varying float vDens;
varying float vNode; varying float vCoc;
${NOISE_GLSL}
void main(){
  vec4 P = texture2D(tPosition, aRef);
  vec3 pos = P.xyz;
  vSpeed = P.w;
  vec3 nrm = normalize(pos + vec3(1e-4));
  vDens = smoothstep(-0.4, 0.6, snoise(pos * 1.1 + 5.0));

  float key = max(dot(nrm, normalize(uLightDir)), 0.0);
  float fill = max(dot(nrm, normalize(uLightDir2)), 0.0);
  vFill = fill;
  vShade = 0.12 + key * 0.82 + fill * uFill;

  // volumetric node light — particles near the active node catch its color
  vNode = smoothstep(uNodeRadius, 0.0, distance(pos, uNodePos)) * uNodeStrength;

  vec4 world = modelMatrix * vec4(pos, 1.0);
  float infl = smoothstep(uPointerRadius, 0.0, distance(world.xyz, uPointer));
  vGlow = infl;

  vec4 mv = viewMatrix * world;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;

  // depth of field: out-of-focus particles grow into soft bokeh discs
  vCoc = clamp(abs(vDepth - uFocus) / uDofRange, 0.0, 1.0);
  float size = aScale * uSize * uPixelRatio * (8.0 / vDepth)
             * (0.5 + vDens * 0.9) * (1.0 + infl * 0.5)
             * (1.0 + vCoc * 2.2) * (1.0 + vNode * 0.6);
  gl_PointSize = clamp(size, 1.0, 120.0);
}
`;

const renderFragment = /* glsl */ `
precision highp float;
uniform vec3 uHi; uniform vec3 uShadow; uniform vec3 uCool; uniform vec3 uWarm;
uniform vec3 uSignal; uniform vec3 uFillColor; uniform vec3 uNodeColor;
varying float vDepth; varying float vGlow; varying float vShade;
varying float vFill; varying float vSpeed; varying float vDens;
varying float vNode; varying float vCoc;
void main(){
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if (r2 > 1.0) discard;
  float soft = smoothstep(1.0, 0.0, r2);

  float chaos = clamp(vSpeed * 1.6, 0.0, 1.0);
  vec3 col = mix(uShadow, uHi, clamp(vShade, 0.0, 1.0));
  col = mix(col, uCool, 0.22);
  col = mix(col, uFillColor, vFill * 0.22);
  col = mix(col, uWarm, smoothstep(0.25, 0.7, chaos) * 0.5);
  col = mix(col, uSignal, smoothstep(0.6, 1.0, chaos) * 0.8);
  col = mix(col, uNodeColor, vNode * 0.7);                  // node light diffuse
  col = mix(col, mix(uCool, vec3(1.0), 0.5), vGlow * 0.4);  // softened cursor light

  float a = soft * clamp(vShade, 0.06, 1.0) * (0.32 + vDens * 0.78);
  a *= (1.0 - vCoc * 0.62);                                 // blur → dimmer
  a = clamp(a + vGlow * 0.18 + vNode * 0.28, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
`;

const connectorVertex = /* glsl */ `
uniform sampler2D tPosition; uniform float uMinLen; uniform float uMaxLen;
uniform float uFocus; uniform float uDofRange;
uniform vec3 uNodePos; uniform float uNodeStrength; uniform float uNodeRadius;
attribute vec2 aRefA; attribute vec2 aRefB; attribute float aEnd; attribute vec3 aColor;
varying float vFade; varying float vChaos; varying float vCoc;
varying float vNode; varying vec3 vColor;
void main(){
  vec4 PA = texture2D(tPosition, aRefA);
  vec4 PB = texture2D(tPosition, aRefB);
  vec3 p = mix(PA.xyz, PB.xyz, step(0.5, aEnd));
  float len = distance(PA.xyz, PB.xyz);
  vFade = 1.0 - smoothstep(uMinLen, uMaxLen, len);
  vChaos = clamp((PA.w + PB.w) * 0.8, 0.0, 1.0);
  vColor = aColor;
  vNode = smoothstep(uNodeRadius, 0.0, distance(p, uNodePos)) * uNodeStrength;
  vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  vCoc = clamp(abs(depth - uFocus) / uDofRange, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;

const connectorFragment = /* glsl */ `
precision highp float;
uniform vec3 uNodeColor;
varying float vFade; varying float vChaos; varying float vCoc;
varying float vNode; varying vec3 vColor;
void main(){
  if (vFade <= 0.002) discard;
  vec3 col = mix(vColor, vec3(1.0), smoothstep(0.5, 1.0, vChaos) * 0.4);
  col = mix(col, uNodeColor, vNode * 0.55);
  float a = vFade * (0.42 + vNode * 0.4) * (1.0 - vCoc * 0.6);
  gl_FragColor = vec4(col, a);
}
`;

/* Join particles — highlighted points at connection nodes. */
const joinVertex = /* glsl */ `
uniform sampler2D tPosition; uniform float uSize; uniform float uPixelRatio;
uniform float uFocus; uniform float uDofRange;
attribute vec2 aRef; attribute vec3 aColor; attribute float aScale;
varying vec3 vColor; varying float vCoc;
void main(){
  vec3 pos = texture2D(tPosition, aRef).xyz;
  vColor = aColor;
  vec4 mv = viewMatrix * modelMatrix * vec4(pos, 1.0);
  float depth = -mv.z;
  vCoc = clamp(abs(depth - uFocus) / uDofRange, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(aScale * uSize * uPixelRatio * (10.0 / depth) * (1.0 + vCoc * 2.0), 1.0, 130.0);
}
`;

const joinFragment = /* glsl */ `
precision highp float;
varying vec3 vColor; varying float vCoc;
void main(){
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if (r2 > 1.0) discard;
  float soft = smoothstep(1.0, 0.0, r2);
  // bright core for the joint
  float core = smoothstep(0.35, 0.0, r2);
  vec3 col = mix(vColor, vec3(1.0), core * 0.6);
  float a = soft * (1.0 - vCoc * 0.5) * 0.85;
  gl_FragColor = vec4(col, a);
}
`;

export interface HeroFieldProps {
  /** Reduced-motion: fully static. */
  frozen?: boolean;
  /** Dialog pages: field keeps simulating behind, but no interaction +
      calm camera + no active node (the home UI is overlaid by a dialog). */
  dialog?: boolean;
}

export function HeroField({ frozen = false, dialog = false }: HeroFieldProps) {
  const gl = useThree((s) => s.gl);
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const connectorMatRef = useRef<THREE.ShaderMaterial>(null);
  const joinMatRef = useRef<THREE.ShaderMaterial>(null);

  const ndc = useRef(new THREE.Vector2(0, 0));
  const ray = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const hit = useRef(new THREE.Vector3());
  const pointerWorld = useRef(new THREE.Vector3(999, 999, 999));

  const [active, setActive] = useState(-1);
  const activeRef = useRef(-1);
  const nodeRefs = useRef<Array<THREE.Group | null>>([]);
  const scaleRefs = useRef<Array<THREE.Group | null>>([]);
  const scaleVal = useRef<number[]>(NODES_3D.map(() => 1));
  const camTarget = useRef(new THREE.Vector3(0, 0, 5.5));
  const tmpV = useRef(new THREE.Vector3());
  const tmpC = useRef(new THREE.Color());
  // click-and-hold camera orbit + release momentum
  const dragging = useRef(false);
  const orbit = useRef({ yaw: 0, pitch: 0 });
  const orbitVel = useRef({ yaw: 0, pitch: 0 });
  const rightVec = useRef(new THREE.Vector3());

  const sim = useMemo(() => {
    const gpu = new GPUComputationRenderer(TW, TH, gl);
    const dtPos = gpu.createTexture();
    const dtVel = gpu.createTexture();
    const targA = new Float32Array(COUNT * 4);
    const targB = new Float32Array(COUNT * 4);
    const pos = dtPos.image.data as Float32Array;
    const vel = dtVel.image.data as Float32Array;

    const R = 1.85;
    const tube = 0.66;
    const up = new THREE.Vector3(0, 0, 1);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < COUNT; i++) {
      const [sx, sy, sz] = fibSphere(i, COUNT, 2.4);
      targA[i * 4] = sx; targA[i * 4 + 1] = sy; targA[i * 4 + 2] = sz; targA[i * 4 + 3] = 1;
      const u = (i / COUNT) * Math.PI * 2 * 7.0;
      const v = Math.PI * (1 + Math.sqrt(5)) * i;
      targB[i * 4] = (R + tube * Math.cos(v)) * Math.cos(u) * 1.7;
      targB[i * 4 + 1] = (R + tube * Math.cos(v)) * Math.sin(u) * 0.8;
      targB[i * 4 + 2] = tube * Math.sin(v);
      targB[i * 4 + 3] = 1;
      const j = 1 + (Math.random() - 0.5) * 0.5;
      pos[i * 4] = sx * j; pos[i * 4 + 1] = sy * j; pos[i * 4 + 2] = sz * j; pos[i * 4 + 3] = 0;
      tmp.set(sx, sy, sz).cross(up).normalize().multiplyScalar(0.4 + Math.random() * 0.3);
      vel[i * 4] = tmp.x + (Math.random() - 0.5) * 0.1;
      vel[i * 4 + 1] = tmp.y + (Math.random() - 0.5) * 0.1;
      vel[i * 4 + 2] = tmp.z + (Math.random() - 0.5) * 0.1;
      vel[i * 4 + 3] = 0;
    }

    const makeTex = (data: Float32Array) => {
      const tx = new THREE.DataTexture(data, TW, TH, THREE.RGBAFormat, THREE.FloatType);
      tx.needsUpdate = true;
      return tx;
    };
    const velVar = gpu.addVariable('textureVelocity', velocityShader, dtVel);
    const posVar = gpu.addVariable('texturePosition', positionShader, dtPos);
    gpu.setVariableDependencies(velVar, [velVar, posVar]);
    gpu.setVariableDependencies(posVar, [velVar, posVar]);
    Object.assign(velVar.material.uniforms, {
      dt: { value: 0.016 }, uTime: { value: 0 }, uMorph: { value: 0 },
      uGravity: { value: 0.25 }, uSpring: { value: 0.9 }, uFluid: { value: 0.8 },
      uFluidScale: { value: 0.5 }, uCoherence: { value: 0.72 }, uDamp: { value: 0.94 },
      uMaxSpeed: { value: 2.2 }, uPointer: { value: new THREE.Vector3(999, 999, 999) },
      uPointerRadius: { value: 1.8 }, uPointerForce: { value: 3.2 },
      tTargetA: { value: makeTex(targA) }, tTargetB: { value: makeTex(targB) },
    });
    posVar.material.uniforms.dt = { value: 0.016 };
    const err = gpu.init();
    if (err) console.error('[HeroField] GPGPU init:', err);

    // shared node-light uniforms (same objects in points + connector materials)
    const uNodePos = { value: new THREE.Vector3(999, 999, 999) };
    const uNodeColor = { value: new THREE.Color('#22d3e0') };
    const uNodeStrength = { value: 0 };
    const uNodeRadius = { value: 1.9 };

    const ref = new Float32Array(COUNT * 2);
    const scale = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      ref[i * 2] = ((i % TW) + 0.5) / TW;
      ref[i * 2 + 1] = (Math.floor(i / TW) + 0.5) / TH;
      scale[i] = 0.4 + Math.pow(Math.random(), 3) * 2.8;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    geometry.setAttribute('aRef', new THREE.BufferAttribute(ref, 2));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    geometry.setDrawRange(0, COUNT);

    const uniforms = {
      tPosition: { value: dtPos }, uSize: { value: 1.05 },
      uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
      uLightDir: { value: new THREE.Vector3(0.55, 0.8, 0.5).normalize() },
      uLightDir2: { value: new THREE.Vector3(-0.7, -0.55, 0.35).normalize() },
      uFill: { value: 0.5 }, uFillColor: { value: new THREE.Color('#22d3e0') },
      uPointer: { value: new THREE.Vector3(999, 999, 999) }, uPointerRadius: { value: 1.8 },
      uFocus: { value: 5.5 }, uDofRange: { value: 3.2 },
      uHi: { value: new THREE.Color('#eef3f7') }, uShadow: { value: new THREE.Color('#0e151b') },
      uCool: { value: new THREE.Color('#22d3e0') }, uWarm: { value: new THREE.Color('#7c6cff') },
      uSignal: { value: new THREE.Color('#ff4d4d') },
      uNodePos, uNodeColor, uNodeStrength, uNodeRadius,
    };

    // ---- connectors + join particles, colored from the Radix wheel ----
    const NODES = 300;
    const NEIGHBORS = 2;
    const nodeIdx: number[] = [];
    const stride = Math.floor(COUNT / NODES);
    for (let n = 0; n < NODES; n++) nodeIdx.push(n * stride);
    const np = nodeIdx.map((i) => [targA[i * 4], targA[i * 4 + 1], targA[i * 4 + 2]] as const);
    const nodeColors: THREE.Color[] = np.map((p) => wheelColor(Math.atan2(p[2], p[0]), new THREE.Color()));

    const segPairs: Array<[number, number]> = [];
    for (let n = 0; n < NODES; n++) {
      const ds: Array<[number, number]> = [];
      for (let o = 0; o < NODES; o++) {
        if (o === n) continue;
        const dx = np[n][0] - np[o][0], dy = np[n][1] - np[o][1], dz = np[n][2] - np[o][2];
        ds.push([dx * dx + dy * dy + dz * dz, o]);
      }
      ds.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < NEIGHBORS; k++) segPairs.push([n, ds[k][1]]);
    }
    const SEG = segPairs.length;
    const cPos = new Float32Array(SEG * 2 * 3);
    const cRefA = new Float32Array(SEG * 2 * 2);
    const cRefB = new Float32Array(SEG * 2 * 2);
    const cEnd = new Float32Array(SEG * 2);
    const cCol = new Float32Array(SEG * 2 * 3);
    for (let sgi = 0; sgi < SEG; sgi++) {
      const [na, nb] = segPairs[sgi];
      const ia = nodeIdx[na], ib = nodeIdx[nb];
      for (let e = 0; e < 2; e++) {
        const vi = sgi * 2 + e;
        cRefA[vi * 2] = ref[ia * 2]; cRefA[vi * 2 + 1] = ref[ia * 2 + 1];
        cRefB[vi * 2] = ref[ib * 2]; cRefB[vi * 2 + 1] = ref[ib * 2 + 1];
        cEnd[vi] = e;
        const col = e === 0 ? nodeColors[na] : nodeColors[nb];
        cCol[vi * 3] = col.r; cCol[vi * 3 + 1] = col.g; cCol[vi * 3 + 2] = col.b;
      }
    }
    const connectorGeometry = new THREE.BufferGeometry();
    connectorGeometry.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
    connectorGeometry.setAttribute('aRefA', new THREE.BufferAttribute(cRefA, 2));
    connectorGeometry.setAttribute('aRefB', new THREE.BufferAttribute(cRefB, 2));
    connectorGeometry.setAttribute('aEnd', new THREE.BufferAttribute(cEnd, 1));
    connectorGeometry.setAttribute('aColor', new THREE.BufferAttribute(cCol, 3));

    const connectorUniforms = {
      tPosition: { value: dtPos }, uMinLen: { value: 0.3 }, uMaxLen: { value: 1.7 },
      uFocus: { value: 5.5 }, uDofRange: { value: 3.2 },
      uNodePos, uNodeColor, uNodeStrength, uNodeRadius,
    };

    // join particles at the connection nodes
    const jRef = new Float32Array(NODES * 2);
    const jCol = new Float32Array(NODES * 3);
    const jScale = new Float32Array(NODES);
    for (let n = 0; n < NODES; n++) {
      const idx = nodeIdx[n];
      jRef[n * 2] = ref[idx * 2]; jRef[n * 2 + 1] = ref[idx * 2 + 1];
      jCol[n * 3] = nodeColors[n].r; jCol[n * 3 + 1] = nodeColors[n].g; jCol[n * 3 + 2] = nodeColors[n].b;
      jScale[n] = 1.6 + Math.random() * 0.9;
    }
    const joinGeometry = new THREE.BufferGeometry();
    joinGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NODES * 3), 3));
    joinGeometry.setAttribute('aRef', new THREE.BufferAttribute(jRef, 2));
    joinGeometry.setAttribute('aColor', new THREE.BufferAttribute(jCol, 3));
    joinGeometry.setAttribute('aScale', new THREE.BufferAttribute(jScale, 1));
    joinGeometry.setDrawRange(0, NODES);
    const joinUniforms = {
      tPosition: { value: dtPos }, uSize: { value: 1.1 },
      uPixelRatio: uniforms.uPixelRatio, uFocus: { value: 5.5 }, uDofRange: { value: 3.2 },
    };

    const makeRing = (radius: number, segs: number, euler: THREE.Euler) => {
      const arr = new Float32Array(segs * 3);
      const e = new THREE.Vector3();
      for (let i = 0; i < segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        e.set(Math.cos(a) * radius, Math.sin(a) * radius, 0).applyEuler(euler);
        arr[i * 3] = e.x; arr[i * 3 + 1] = e.y; arr[i * 3 + 2] = e.z;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      return g;
    };
    const rings = [
      makeRing(2.75, 160, new THREE.Euler(0.4, 0.2, 0)),
      makeRing(3.05, 160, new THREE.Euler(1.3, 0.6, 0.2)),
    ];

    return {
      gpu, velVar, posVar, geometry, uniforms, connectorGeometry, connectorUniforms,
      joinGeometry, joinUniforms, rings, uNodePos, uNodeColor, uNodeStrength,
    };
  }, [gl]);

  useFrame((state, delta) => {
    const m = matRef.current;
    const pts = pointsRef.current;
    if (!m || !pts) return;

    const dt = Math.min(delta, 0.033);
    const v = sim.velVar.material.uniforms;
    const t = (v.uTime.value += frozen ? 0 : dt);

    let next = -1;
    if (!frozen && !dialog && typeof window !== 'undefined') {
      const vh = Math.max(window.innerHeight, 1);
      const idx = Math.round(window.scrollY / vh);
      next = idx >= 1 && idx <= NODES_3D.length ? idx - 1 : -1;
    }
    if (next !== activeRef.current) {
      activeRef.current = next;
      setActive(next);
    }

    // The sim keeps running in BOTH home and dialog modes (the field
    // continues simulating behind the dialog). Dialog only disables the
    // cursor light / interaction.
    if (!frozen) {
      const lfo = 0.5 + 0.5 * Math.sin(t * 0.08);
      v.uFluid.value = 0.5 + Math.pow(lfo, 2.0) * 1.0;
      v.uSpring.value = 0.85 + (1.0 - lfo) * 0.3;
      v.uMorph.value = (0.5 + 0.5 * Math.sin(t * 0.035 + 1.2)) * 0.45;

      if (!dialog) {
        ray.current.setFromCamera(ndc.current, state.camera);
        if (ray.current.ray.intersectPlane(plane.current, hit.current)) {
          pointerWorld.current.lerp(hit.current, 0.15);
        }
        v.uPointer.value.copy(pointerWorld.current);
        m.uniforms.uPointer.value.copy(pointerWorld.current);
      } else {
        v.uPointer.value.set(999, 999, 999);
        m.uniforms.uPointer.value.set(999, 999, 999);
      }

      v.dt.value = dt;
      sim.posVar.material.uniforms.dt.value = dt;
      sim.gpu.compute();
      if (groupRef.current) groupRef.current.rotation.y = 0;
    }

    // node markers: position bob + gradual scale
    for (let i = 0; i < NODES_3D.length; i++) {
      const g = nodeRefs.current[i];
      if (g) {
        const bob = frozen ? 1 : 1 + 0.06 * Math.sin(t * 0.6 + i);
        g.position.copy(NODES_3D[i].dir).multiplyScalar(bob);
      }
      const sg = scaleRefs.current[i];
      if (sg) {
        const target = activeRef.current === i ? 1.7 : 1.0;
        scaleVal.current[i] += (target - scaleVal.current[i]) * 0.1;
        sg.scale.setScalar(scaleVal.current[i]);
      }
    }

    // volumetric node light → eased pos/color/strength (drives points+connectors)
    const ai = activeRef.current;
    if (ai >= 0 && nodeRefs.current[ai]) {
      sim.uNodePos.value.copy(nodeRefs.current[ai]!.position);
      sim.uNodeColor.value.lerp(NODES_3D[ai].color, 0.08);
      sim.uNodeStrength.value += (1.0 - sim.uNodeStrength.value) * 0.05;
    } else {
      sim.uNodeStrength.value += (0.0 - sim.uNodeStrength.value) * 0.05;
    }

    if (dialog) {
      // calm, slow auto-orbit; soft ease so the home→dialog move is gentle
      const a = t * 0.04;
      tmpV.current.copy(VIEW_DIRS[0]).applyAxisAngle(Y_AXIS, Math.sin(a) * 0.3).setLength(6.2);
      tmpV.current.y += 0.4;
      camTarget.current.copy(tmpV.current);
      state.camera.position.lerp(camTarget.current, 0.02);
      state.camera.lookAt(0, 0, 0);
      m.uniforms.uFillColor.value.lerp(DEFAULT_FILL, 0.03);
    } else if (!frozen && typeof window !== 'undefined') {
      const N = NODES_3D.length;
      const vh = Math.max(window.innerHeight, 1);
      const sy = window.scrollY;

      const p = Math.min(Math.max(sy / vh, 0), N);
      const i0 = Math.floor(p);
      const i1 = Math.min(i0 + 1, N);
      const raw = p - i0;
      const f = raw * raw * raw * (raw * (raw * 6 - 15) + 10); // smootherstep
      slerpDir(VIEW_DIRS[i0], VIEW_DIRS[i1], f, tmpV.current);

      // ---- click-and-hold orbit: while held, softly link the orbit to the
      // cursor; on release, coast on momentum + slowly re-center. Passive. ----
      const o = orbit.current;
      const prevYaw = o.yaw;
      const prevPitch = o.pitch;
      if (dragging.current) {
        o.yaw += (ndc.current.x * 0.6 - o.yaw) * 0.12;
        o.pitch += (ndc.current.y * 0.4 - o.pitch) * 0.12;
        orbitVel.current.yaw = o.yaw - prevYaw;
        orbitVel.current.pitch = o.pitch - prevPitch;
      } else {
        o.yaw += orbitVel.current.yaw;
        o.pitch += orbitVel.current.pitch;
        orbitVel.current.yaw *= 0.94; // friction
        orbitVel.current.pitch *= 0.94;
        o.yaw += (0 - o.yaw) * 0.01; // gentle re-center
        o.pitch += (0 - o.pitch) * 0.01;
      }

      tmpV.current.applyAxisAngle(Y_AXIS, o.yaw + Math.sin(t * 0.06) * 0.03);
      rightVec.current.crossVectors(tmpV.current, Y_AXIS).normalize();
      tmpV.current.applyAxisAngle(rightVec.current, o.pitch);
      tmpV.current.setLength(5.6);
      tmpV.current.y += 0.4 + Math.sin(t * 0.05) * 0.15;
      camTarget.current.copy(tmpV.current);
      state.camera.position.lerp(camTarget.current, 0.16);
      state.camera.lookAt(0, 0, 0);
      tmpC.current.copy(VIEW_COLORS[i0]).lerp(VIEW_COLORS[i1], f);
      m.uniforms.uFillColor.value.lerp(tmpC.current, 0.12);
    }

    const posTex = sim.gpu.getCurrentRenderTarget(sim.posVar).texture;
    m.uniforms.tPosition.value = posTex;
    if (connectorMatRef.current) connectorMatRef.current.uniforms.tPosition.value = posTex;
    if (joinMatRef.current) joinMatRef.current.uniforms.tPosition.value = posTex;
  });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ndc.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    // click-and-hold to orbit (mouse only — touch stays for scrolling)
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') dragging.current = true;
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    window.addEventListener('blur', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('blur', onUp);
    };
  }, []);

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={sim.geometry}>
        <shaderMaterial
          ref={matRef} attach="material"
          vertexShader={renderVertex} fragmentShader={renderFragment}
          uniforms={sim.uniforms} transparent depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments geometry={sim.connectorGeometry}>
        <shaderMaterial
          ref={connectorMatRef} attach="material"
          vertexShader={connectorVertex} fragmentShader={connectorFragment}
          uniforms={sim.connectorUniforms} transparent depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* highlighted particles at the joins */}
      <points geometry={sim.joinGeometry}>
        <shaderMaterial
          ref={joinMatRef} attach="material"
          vertexShader={joinVertex} fragmentShader={joinFragment}
          uniforms={sim.joinUniforms} transparent depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {sim.rings.map((g, i) => (
        <lineLoop key={i} geometry={g}>
          <lineBasicMaterial color="#22d3e0" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineLoop>
      ))}

      {NODES_3D.map((n, i) => (
        <group key={n.cs.slug} ref={(el) => { nodeRefs.current[i] = el; }}>
          <group ref={(el) => { scaleRefs.current[i] = el; }}>
            <mesh>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={n.color} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color={n.color} transparent opacity={0.14} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
          {!frozen && (
            <Html position={[0, 0.4, 0]} center zIndexRange={[7, 0]} style={{ pointerEvents: 'none' }}>
              <div
                className="snds-node-tag"
                data-active={active === i ? 'true' : 'false'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px',
                  border: `1px solid ${n.cs.color}`,
                  fontFamily: 'var(--snds-font-mono)', fontSize: 11, letterSpacing: '0.12em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'var(--snds-color-fg)',
                }}
              >
                <span style={{ color: n.cs.color }}>{n.cs.num}</span>
                {n.cs.title}
              </div>
            </Html>
          )}
        </group>
      ))}

      {!frozen &&
        LABELS.map((l) => (
          <Html key={l.text} position={l.pos} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 6,
                borderLeft: '1px solid var(--snds-color-primaryBorder)',
                fontFamily: 'var(--snds-font-mono)', fontSize: 10, letterSpacing: '0.18em',
                textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'var(--snds-color-fgSubtle)',
              }}
            >
              <span style={{ width: 5, height: 5, background: 'var(--snds-color-primary)', boxShadow: '0 0 8px var(--snds-color-primary)' }} />
              {l.text}
            </div>
          </Html>
        ))}
    </group>
  );
}
