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
      orderBy: [
        { category: 'asc' },
        { sort_order: 'asc' },
        { name: 'asc' },
      ],
    });

    if (services.length === 0) {
      await ensureServicesSeeded();
      services = await prisma.service.findMany({
        orderBy: [
          { category: 'asc' },
          { sort_order: 'asc' },
          { name: 'asc' },
        ],
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching admin services:', error);
    // Fallback so admin can still see and manage the catalog
    return NextResponse.json(catalogAsServices());
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const service = await prisma.service.create({
      data: body,
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
