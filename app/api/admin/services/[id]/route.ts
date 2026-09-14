import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';
import { serviceUpdateSchema } from '@/src/lib/admin-validation';
import { syncServiceCatalog } from '@/src/lib/service-catalog-sync';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await syncServiceCatalog();
    const { id } = await context.params;
    const body = serviceUpdateSchema.parse(await request.json());

    if (body.name) {
      const duplicate = await prisma.service.findFirst({
        where: {
          id: { not: id },
          is_active: true,
          name: { equals: body.name, mode: 'insensitive' },
        },
        select: { id: true },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'An active service with this name already exists.' }, { status: 409 });
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
