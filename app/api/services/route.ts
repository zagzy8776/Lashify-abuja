import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { SERVICE_CATALOG } from '@/src/lib/services-catalog';

function catalogAsServices() {
  return SERVICE_CATALOG.map((s) => ({
    id: s.slug,
    name: s.name,
    slug: s.slug,
    description: s.description,
    price: s.price,
    original_price: null,
    duration_minutes: s.duration_minutes,
    duration_text: s.duration_text ?? null,
    category: s.category,
    image_url: null,
    is_active: true,
    sort_order: s.sort_order,
    created_at: new Date().toISOString(),
  }));
}

async function ensureServicesSeeded() {
  for (const s of SERVICE_CATALOG) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.description,
        price: s.price,
        duration_minutes: s.duration_minutes,
        duration_text: s.duration_text ?? null,
        category: s.category,
        sort_order: s.sort_order,
        is_active: true,
      },
      create: {
        name: s.name,
        slug: s.slug,
        description: s.description,
        price: s.price,
        duration_minutes: s.duration_minutes,
        duration_text: s.duration_text ?? null,
        category: s.category,
        sort_order: s.sort_order,
        is_active: true,
      },
    });
  }
}

export async function GET() {
  try {
    let services = await prisma.service.findMany({
      where: { is_active: true },
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' },
      ],
    });

    if (services.length === 0) {
      await ensureServicesSeeded();
      services = await prisma.service.findMany({
        where: { is_active: true },
        orderBy: [
          { sort_order: 'asc' },
          { name: 'asc' },
        ],
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    // Fallback so the site and admin still show services even if DB is temporarily unhealthy
    return NextResponse.json(catalogAsServices());
  }
}
