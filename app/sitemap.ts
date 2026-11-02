import { MetadataRoute } from 'next';
import { listPublishedRequirements } from '@/lib/countryRequirementsServer';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eloravisa.com';
  
  const routes = [
    '',
    '/legal/privacy-policy',
    '/legal/terms-of-service',
    '/legal/cookie-policy',
    '/legal/disclaimer',
    '/affiliate/signin',
    '/affiliate/signup',
    '/visa-requirements',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // One page per published country requirements guide (edited in eloraadmin).
  const guides = await listPublishedRequirements().catch(() => []);
  return [
    ...routes,
    ...guides.map((g) => ({
      url: `${baseUrl}/visa-requirements/${g.slug}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
