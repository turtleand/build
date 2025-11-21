import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    slug: z.string().optional(),
    locale: z.enum(['en', 'es']).default('en'),
    translationKey: z.string().optional(),
  }),
});

const i18n = defineCollection({
  type: 'data',
  schema: z.record(z.any()),
});

export const collections = { posts, i18n };
