import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroField } from './HeroField';
import { Nebula } from './Nebula';

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

/** Detail/work pages set <html data-field="muted">; the persisted canvas
    reads it and calms + freezes the field. */
function useFieldMuted() {
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    const read = () => setMuted(document.documentElement.dataset.field === 'muted');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-field'] });
    return () => obs.disconnect();
  }, []);
  return muted;
}

export default function HeroCanvas() {
  const reduced = usePrefersReducedMotion();
  const muted = useFieldMuted();
  // freeze rendering when muted (behind a heavy blur) or reduced-motion
  const still = reduced || muted;
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      frameloop={still ? 'demand' : 'always'}
    >
      <Nebula frozen={reduced || muted} />
      <HeroField frozen={reduced} muted={muted} />
    </Canvas>
  );
}
