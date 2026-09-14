import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { syncServiceCatalog } from '@/src/lib/service-catalog-sync';

export async function GET() {
  try {
    await syncServiceCatalog();
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
