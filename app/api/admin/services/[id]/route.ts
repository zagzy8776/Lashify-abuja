import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';
import { serviceUpdateSchema } from '@/src/lib/admin-validation';
import { normalizeServiceIdentity, syncServiceCatalog } from '@/src/lib/service-catalog-sync';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await syncServiceCatalog();
    const { id } = await context.params;
    const body = serviceUpdateSchema.parse(await request.json());

    if (body.name) {
      const activeServices = await prisma.service.findMany({
        where: { is_active: true, id: { not: id } },
        select: { id: true, name: true, slug: true },
      });
      const identity = normalizeServiceIdentity(body.name);

      if (activeServices.some((service) => normalizeServiceIdentity(service.name) === identity || normalizeServiceIdentity(service.slug) === identity)) {
        return NextResponse.json({ error: 'An active service with this name already exists.' }, { status: 409 });
      }
    }

    if (body.slug) {
      const duplicateSlug = await prisma.service.findFirst({
        where: { id: { not: id }, slug: body.slug, is_active: true },
        select: { id: true },
      });
      if (duplicateSlug) {
        return NextResponse.json({ error: 'An active service with this slug already exists.' }, { status: 409 });
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid service data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
