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

/** Dialog pages set <html data-field="dialog">; the persisted canvas reads it
    and calms the camera + disables interaction, but keeps simulating. */
function useFieldDialog() {
  const [dialog, setDialog] = useState(false);
  useEffect(() => {
    const read = () => setDialog(document.documentElement.dataset.field === 'dialog');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-field'] });
    return () => obs.disconnect();
  }, []);
  return dialog;
}

export default function HeroCanvas() {
  const reduced = usePrefersReducedMotion();
  const dialog = useFieldDialog();
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      frameloop={reduced ? 'demand' : 'always'}
    >
      <Nebula frozen={reduced} />
      <HeroField frozen={reduced} dialog={dialog} />
    </Canvas>
  );
}
