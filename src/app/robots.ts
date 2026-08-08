import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://thebirthwave.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing behind these should be indexed — they're authenticated
        // patient/doctor areas, not public content.
        disallow: ['/patient/dashboard', '/clinical/dashboard', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
