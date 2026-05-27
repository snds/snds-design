import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroField } from './HeroField';
import { Nebula } from './Nebula';

// Reads the unified `data-motion` attribute (set by the boot script + the
// settings toggle, derived from the OS preference or an explicit override), so
// the field freezes whenever motion is reduced — by preference or by choice.
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const read = () => setReduced(document.documentElement.dataset.motion === 'reduce');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    return () => obs.disconnect();
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

function useLightTheme() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const read = () => setLight(document.documentElement.dataset.theme === 'light');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return light;
}

export default function HeroCanvas() {
  const reduced = useReducedMotion();
  const dialog = useFieldDialog();
  const light = useLightTheme();
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      frameloop={reduced ? 'demand' : 'always'}
    >
      <Nebula frozen={reduced} light={light} />
      <HeroField frozen={reduced} dialog={dialog} light={light} />
    </Canvas>
  );
}
