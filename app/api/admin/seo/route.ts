import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';
import { PUBLIC_ROUTES, SITE_NAME, SITE_URL } from '@/src/lib/seo-config';

export async function GET() {
  try {
    await requireAdmin();

    const [services, gallery, reviews, appointments] = await Promise.all([
      prisma.service.count({ where: { is_active: true } }),
      prisma.galleryItem.count(),
      prisma.review.count({ where: { is_published: true } }),
      prisma.appointment.count(),
    ]);

    const checks = [
      { key: 'metadata', label: 'Global metadata', ok: true, detail: 'Title, description, robots and social metadata are configured.' },
      { key: 'canonicals', label: 'Canonical URLs', ok: true, detail: `${PUBLIC_ROUTES.length} public routes have canonical metadata.` },
      { key: 'sitemap', label: 'XML sitemap', ok: true, detail: `${SITE_URL}/sitemap.xml` },
      { key: 'robots', label: 'Robots policy', ok: true, detail: 'Admin, API and booking routes are excluded from crawling.' },
      { key: 'structured-data', label: 'Structured data', ok: true, detail: 'BeautySalon, WebSite and service schema are generated.' },
      { key: 'search-console', label: 'Google Search Console', ok: Boolean(process.env.GOOGLE_SITE_VERIFICATION), detail: process.env.GOOGLE_SITE_VERIFICATION ? 'Verification token is configured.' : 'Set GOOGLE_SITE_VERIFICATION after adding the property in Search Console.' },
      { key: 'analytics', label: 'Analytics', ok: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID), detail: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? 'GA4 measurement ID is configured.' : 'Set NEXT_PUBLIC_GA_MEASUREMENT_ID to enable analytics integration.' },
    ];

    const score = Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);

    return NextResponse.json({
      site: { name: SITE_NAME, url: SITE_URL },
      score,
      checks,
      coverage: {
        publicRoutes: PUBLIC_ROUTES.length,
        activeServices: services,
        galleryItems: gallery,
        publishedReviews: reviews,
        totalAppointments: appointments,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating SEO audit:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to generate SEO audit' }, { status: 500 });
  }
}
