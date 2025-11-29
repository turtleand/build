import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { filterByLocale, filterPublished, getPostSlug } from '../utils/blog';
import type { Locale } from '../utils/i18n';
import { DEFAULT_LOCALE, isLocale } from '../utils/i18n';

const resolveLocale = (value: string | null): Locale => {
	if (!value) return DEFAULT_LOCALE;
	return isLocale(value) ? value : DEFAULT_LOCALE;
};

const buildHrefForLocale = (slug: string, locale: Locale) =>
	locale === 'es' ? `/es/blog/${slug}` : `/blog/${slug}`;

export const GET: APIRoute = async ({ url }) => {
	const locale = resolveLocale(url.searchParams.get('locale'));
	const posts = (await getCollection('posts')).filter(filterPublished).filter(filterByLocale(locale));

	if (posts.length === 0) {
		return new Response(JSON.stringify({ error: 'No posts available for this locale' }), {
			status: 404,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	}

	const randomPost = posts[Math.floor(Math.random() * posts.length)];
	const slug = getPostSlug(randomPost);
	const payload = {
		href: buildHrefForLocale(slug, locale),
		slug,
	};

	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
		},
	});
};
