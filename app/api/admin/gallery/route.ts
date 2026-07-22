import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: [
        { sort_order: 'asc' },
        { created_at: 'desc' },
      ],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching admin gallery:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const item = await prisma.galleryItem.create({
      data: body,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding gallery item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
