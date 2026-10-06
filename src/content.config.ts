import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categories } from './data/site';

const assetPath = z.string().regex(/^\/(?!\/)[^\s]+$/, 'Use a root-relative public asset path, e.g. /images/projects/example.jpg');
const link = z.object({ label: z.string().min(1), url: z.url().refine(value => /^https?:\/\//.test(value), 'Use an HTTP(S) URL') });
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => {
    const imageSource = z.union([assetPath, image()]);
    const media = z.object({
      src: imageSource, alt: z.string().trim().min(1), caption: z.string().optional(),
      kind: z.enum(['image', 'diagram', 'cad', 'render', 'plot']).default('image'),
      width: z.number().int().positive().optional(), height: z.number().int().positive().optional(),
      orientation: z.enum(['auto', 'portrait', 'landscape']).default('auto'),
    }).refine(data => typeof data.src !== 'string' || !data.src.startsWith('/') || !!(data.width && data.height), { message: 'Public images need their actual width and height to reserve layout space' });
    return z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    shortTitle: z.string().optional(),
    summary: z.string().min(1),
    organization: z.string().optional(),
    projectType: z.string().optional(),
    category: z.enum(Object.keys(categories) as [keyof typeof categories, ...(keyof typeof categories)[]]),
    featured: z.boolean().default(false), priority: z.number().int().default(100),
    date: z.string().optional(), dateRange: z.object({ start: z.string(), end: z.string().optional() }).optional(),
    role: z.string().optional(), heroImage: imageSource.optional(), heroImageAlt: z.string().trim().min(1).optional(),
    heroImageWidth: z.number().int().positive().optional(), heroImageHeight: z.number().int().positive().optional(),
    heroImageCaption: z.string().optional(),
    tags: z.array(z.string()).default([]), capabilities: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]), disciplines: z.array(z.string()).default([]),
    status: z.enum(['complete', 'ongoing', 'concept', 'starter']).default('complete'),
    confidential: z.boolean().default(false), limitedDetail: z.boolean().default(false), draft: z.boolean().default(false),
    gallery: z.array(media).default([]),
    videos: z.array(z.object({ src: assetPath, title: z.string().min(1), poster: assetPath.optional(),
      tracks: z.array(z.object({ src: assetPath, language: z.string(), label: z.string() })).default([]),
    })).default([]),
    videoEmbeds: z.array(z.discriminatedUnion('provider', [
      z.object({ provider: z.literal('youtube'), id: z.string().regex(/^[A-Za-z0-9_-]{11}$/), title: z.string().min(1) }),
      z.object({ provider: z.literal('vimeo'), id: z.string().regex(/^\d+$/), title: z.string().min(1) }),
    ])).default([]),
    links: z.array(link).default([]), publications: z.array(link).default([]), github: z.url().refine(value => /^https?:\/\//.test(value)).optional(),
    documents: z.array(z.object({ label: z.string(), src: assetPath })).default([]),
    results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    specifications: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    relatedProjects: z.array(z.string()).default([]), accent: z.enum(['teal', 'blue', 'ochre']).default('teal'),
  }).refine(data => !data.heroImage || !!data.heroImageAlt, { message: 'A hero image needs meaningful alt text', path: ['heroImageAlt'] })
    .refine(data => !data.heroImage || typeof data.heroImage !== 'string' || !data.heroImage.startsWith('/') || !!(data.heroImageWidth && data.heroImageHeight), { message: 'Public hero images need their actual width and height', path: ['heroImageWidth'] });
  },
});
export const collections = { projects };
