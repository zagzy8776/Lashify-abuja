import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_URL } from '../src/lib/seo-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const priorities: Record<string, number> = {
    '/': 1,
    '/services': 0.9,
    '/gallery': 0.8,
    '/about': 0.7,
    '/contact': 0.7,
  };

  return PUBLIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: priorities[path] ?? 0.5,
  }));
}
