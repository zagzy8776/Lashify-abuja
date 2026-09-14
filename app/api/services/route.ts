import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { SERVICE_CATALOG } from '@/src/lib/services-catalog';

async function ensureServicesSeeded() {
  // Seed only missing catalog entries. Never overwrite services that the admin has edited.
  await prisma.service.createMany({
    data: SERVICE_CATALOG.map((s) => ({
      name: s.name,
      slug: s.slug,
      description: s.description,
      price: s.price,
      duration_minutes: s.duration_minutes,
      duration_text: s.duration_text ?? null,
      category: s.category,
      sort_order: s.sort_order,
      is_active: true,
    })),
    skipDuplicates: true,
  });
}

export async function GET() {
  try {
    await ensureServicesSeeded();
    const services = await prisma.service.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(services, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Services are temporarily unavailable' }, { status: 503 });
  }
}
