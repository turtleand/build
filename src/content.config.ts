import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import { getLearningModule } from './data/learning-modules';

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
    learningModule: z
      .object({
        id: z.string(),
        lesson: z.number().int().positive(),
      })
      .refine(({ id, lesson }) => Boolean(getLearningModule(id)?.lessons[lesson - 1]), {
        message: 'Choose an existing learning module and a lesson number in its roadmap.',
      })
      .optional(),
  }),
});

export const collections = { posts };
