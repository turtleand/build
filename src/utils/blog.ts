import type { CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { formatDateForLocale } from './i18n';

export type PostEntry = CollectionEntry<'posts'>;

export const POSTS_PER_PAGE = 10;

export const filterPublished = (post: PostEntry) => !post.data.draft;

export const filterByLocale = (locale: Locale) => (post: PostEntry) => post.data.locale === locale;

export const excludeResearchNotes = (post: PostEntry) => !post.data.isResearchNotes;

export const sortPosts = (posts: PostEntry[]) => [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const getPostSlug = (post: PostEntry) => post.data.slug?.trim() || post.slug;

export const formatDate = (value: Date, locale: Locale) => formatDateForLocale(value, locale);

export const paginatePosts = (posts: PostEntry[], pageSize = POSTS_PER_PAGE) => {
  if (pageSize <= 0) return [posts];
  const chunks: PostEntry[][] = [];
  for (let i = 0; i < posts.length; i += pageSize) {
    chunks.push(posts.slice(i, i + pageSize));
  }
  return chunks;
};

export const getTagSlug = (tag: string) =>
  tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'tag';

export type TagSummary = {
  label: string;
  slug: string;
  count: number;
  posts: PostEntry[];
};

export const buildTagSummaries = (posts: PostEntry[]): TagSummary[] => {
  const map = new Map<string, TagSummary>();
  for (const post of posts) {
    for (const tag of post.data.tags || []) {
      const slug = getTagSlug(tag);
      const existing = map.get(slug);
      if (existing) {
        existing.count += 1;
        existing.posts.push(post);
      } else {
        map.set(slug, {
          label: tag,
          slug,
          count: 1,
          posts: [post],
        });
      }
    }
  }
  return Array.from(map.values()).map((summary) => ({
    ...summary,
    posts: sortPosts(summary.posts),
  }));
};

export const findTranslationForLocale = (posts: PostEntry[], translationKey: string | undefined, locale: Locale) => {
	if (!translationKey) return undefined;
	return posts.find((post) => post.data.translationKey === translationKey && post.data.locale === locale);
};
