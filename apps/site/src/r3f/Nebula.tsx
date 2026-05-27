import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NOISE_GLSL } from './glsl';

/* Amorphous undulating nebula — a big inward sphere with dark, hue-shifted
   fbm zones + faint slow light shifts. Not particles (cheap), a subtle echo
   of the field that becomes the page background. */

const vert = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const frag = /* glsl */ `
precision highp float;
uniform float uTime;
varying vec3 vDir;
${NOISE_GLSL}
float fbm(vec3 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ s += a * snoise(p); p *= 2.02; a *= 0.5; }
  return s;
}
void main(){
  vec3 d = normalize(vDir);
  float n = fbm(d * 1.6 + vec3(0.0, 0.0, uTime * 0.02));
  float n2 = fbm(d * 0.7 + vec3(uTime * 0.015, 0.0, 0.0));
  float hue = 0.58 + n2 * 0.22;                       // cool blue→violet→teal
  vec3 tint = abs(vec3(sin(hue * 6.2831), sin(hue * 6.2831 + 2.1), sin(hue * 6.2831 + 4.2)));
  float light = smoothstep(0.45, 0.95, n) * 0.05;     // faint light shifts
  vec3 base = vec3(0.012, 0.016, 0.024);              // near-black
  vec3 col = base + tint * 0.04 * (0.5 + 0.5 * n) + vec3(light);
  gl_FragColor = vec4(max(col, vec3(0.006)), 1.0);
}
`;

export function Nebula({ frozen = false }: { frozen?: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    if (!frozen && mat.current) mat.current.uniforms.uTime.value += dt;
  });
  return (
    <mesh scale={[60, 60, 60]} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
