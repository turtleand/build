import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { filterByLocale, filterPublished, getPostSlug, sortPosts } from '../../utils/blog';

const SITE = 'https://build.turtleand.com';
const feedUrl = new URL('/es/rss.xml', SITE).href;
const spanishSite = new URL('/es/', SITE).href;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const imageUrl = (post: { data: { image?: { src: string } } }) =>
  post.data.image?.src ? new URL(post.data.image.src, `${SITE}/`).href : undefined;

export async function GET() {
  const posts = sortPosts(
    (await getCollection('posts'))
      .filter(filterPublished)
      .filter(filterByLocale('es'))
  );

  return rss({
    title: 'Turtleand Build en español',
    description: 'Oficio de ingeniería, notas de implementación y razonamiento de software de Turtleand.',
    site: spanishSite,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
      media: 'http://search.yahoo.com/mrss/',
    },
    customData: [
      '<language>es</language>',
      posts[0] ? `<lastBuildDate>${posts[0].data.date.toUTCString()}</lastBuildDate>` : '',
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    ].join(''),
    items: posts.map((post) => {
      const thumbnail = imageUrl(post);
      return {
        title: post.data.title,
        description: post.data.description,
        link: `blog/${getPostSlug(post)}/`,
        pubDate: post.data.date,
        categories: [
          ...(post.data.tags ?? []),
          ...(post.data.isResearchNotes ? ['research-notes'] : []),
        ],
        customData: [
          '<dc:creator>Turtleand</dc:creator>',
          thumbnail ? `<media:thumbnail url="${escapeXml(thumbnail)}" />` : '',
        ].join(''),
      };
    }),
  });
}
