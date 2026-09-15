import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';
import { serviceCreateSchema } from '@/src/lib/admin-validation';
import { normalizeServiceIdentity, syncServiceCatalog } from '@/src/lib/service-catalog-sync';

export async function GET() {
  try {
    await requireAdmin();
    await syncServiceCatalog();

    const services = await prisma.service.findMany({
      where: { is_active: true },
      take: 500,
      orderBy: [
        { sort_order: 'asc' },
        { category: 'asc' },
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
    const identity = normalizeServiceIdentity(body.name);

    const duplicate = await prisma.service.findFirst({
      where: { is_active: true },
      select: { id: true, name: true, slug: true },
    });

    if (duplicate && normalizeServiceIdentity(duplicate.name) === identity) {
      return NextResponse.json({ error: 'An active service with this name already exists.' }, { status: 409 });
    }

    const duplicateSlug = await prisma.service.findFirst({
      where: { slug, is_active: true },
      select: { id: true },
    });

    if (duplicateSlug) {
      return NextResponse.json({ error: 'An active service with this slug already exists.' }, { status: 409 });
    }

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
