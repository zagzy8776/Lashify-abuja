import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { SERVICE_CATALOG } from '@/src/lib/services-catalog';

const DEFAULT_SERVICES = SERVICE_CATALOG;

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
      for (const s of DEFAULT_SERVICES) {
        await prisma.service.create({ data: s });
      }
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
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
