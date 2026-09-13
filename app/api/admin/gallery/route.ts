import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';
import { galleryCreateSchema } from '@/src/lib/admin-validation';

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.galleryItem.findMany({
      take: 500,
      orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching admin gallery:', error);
    const unauthorized = error instanceof Error && error.message === 'Unauthorized';
    return NextResponse.json({ error: unauthorized ? 'Unauthorized' : 'Internal Server Error' }, { status: unauthorized ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = galleryCreateSchema.parse(await request.json());
    const item = await prisma.galleryItem.create({ data: body });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding gallery item:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid gallery data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
