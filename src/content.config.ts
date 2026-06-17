import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content_layer',
  loader: glob({
    pattern: ['**/*.md', '**/*.mdx'],
    base: './src/content/posts',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    slug: z.string().optional(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    locale: z.enum(['en', 'es']).default('en'),
    translationKey: z.string().optional(),
    isResearchNotes: z.boolean().default(false),
  }),
});

export const collections = { posts };
