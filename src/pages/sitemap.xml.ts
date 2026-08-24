/**
 * Sitemap, generated from the pages that actually exist so it cannot drift when a
 * route is added. A build-time endpoint rather than an integration: one dependency
 * fewer, and it emits /sitemap.xml instead of a sitemap index.
 */
import type { APIRoute } from 'astro';
import { site } from '../data/site';

const routes = Object.keys(import.meta.glob('./**/*.astro'))
  .map((file) => file.replace(/^\.\//, '').replace(/\.astro$/, ''))
  .filter((route) => !route.startsWith('_') && !route.includes('[') && route !== '404')
  .map((route) => (route === 'index' ? '' : route))
  .sort();

export const GET: APIRoute = () => {
  const urls = routes
    .map((route) => `  <url><loc>${new URL(route, site.url).href}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
