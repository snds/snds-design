import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* Case-study detail content. Body prose lives in the MDX; per-study meta
   lives in frontmatter. Color/number/order come from data/caseStudies.ts
   (the single source the hero field also reads). Match by slug = filename. */
const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    client: z.string(),
    role: z.string(),
    year: z.string(),
    team: z.string(),
    tools: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    metrics: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    demo: z.object({ url: z.string(), label: z.string() }).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };
