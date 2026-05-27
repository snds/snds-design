export interface CaseStudy {
  slug: string;
  num: string;
  title: string;
  client: string;
  blurb: string;
  /** Node + section accent (hex). One distinct color per study. */
  color: string;
  colorName: string;
}

/* Single source of truth — consumed by the landing sections AND the
   hero field (node colors + scroll targets). Order = scroll order. */
export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'data-management',
    num: '01',
    title: 'Data Management',
    client: 'Zuora',
    blurb:
      'A simplified dashboard and flow for importing, templating, and managing data — without losing progress or work.',
    color: '#3b82f6',
    colorName: 'blue',
  },
  {
    slug: 'nexus-threat-explorer',
    num: '02',
    title: 'Nexus Threat Explorer',
    client: 'Proofpoint',
    blurb:
      'A threat-network tracing tool built fast on an open design system to visualize the structure of an attack.',
    color: '#ff4d4d',
    colorName: 'red',
  },
  {
    slug: 'davinci-design-system',
    num: '03',
    title: 'DaVinci Design System',
    client: 'LinkedIn',
    blurb:
      'A first-of-its-kind coded design system with a shared specification nomenclature, built to accelerate redesign across teams.',
    color: '#22d3e0',
    colorName: 'cyan',
  },
  {
    slug: 'config-toolbox',
    num: '04',
    title: 'Config Toolbox',
    client: 'Zuora',
    blurb:
      'An in-house low/no-code tool letting customers build their own dashboards and detail pages.',
    color: '#ffb224',
    colorName: 'amber',
  },
  {
    slug: 'uiflow-studio-refactor',
    num: '05',
    title: 'Uiflow Studio Refactor',
    client: 'Uiflow',
    blurb:
      'A refactor of the Uiflow Studio no-code editor — live data connections and elevated logic tools for building workflows.',
    color: '#e93d9b',
    colorName: 'magenta',
  },
];
