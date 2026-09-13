import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { SERVICE_CATALOG } from '@/src/lib/services-catalog';
import { requireAdmin } from '@/src/lib/admin-auth';
import { serviceCreateSchema } from '@/src/lib/admin-validation';

async function ensureServicesSeeded() {
  const count = await prisma.service.count();
  if (count > 0) return;

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
    await requireAdmin();
    await ensureServicesSeeded();

    const services = await prisma.service.findMany({
      take: 500,
      orderBy: [
        { category: 'asc' },
        { sort_order: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching admin services:', error);
    const message = error instanceof Error && error.message === 'Unauthorized' ? 'Unauthorized' : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = serviceCreateSchema.parse(await request.json());
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const service = await prisma.service.create({
      data: { ...body, slug },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid service data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
