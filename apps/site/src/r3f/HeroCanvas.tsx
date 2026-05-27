import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroField } from './HeroField';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export default function HeroCanvas() {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      frameloop={reduced ? 'demand' : 'always'}
    >
      <HeroField frozen={reduced} />
    </Canvas>
  );
}
