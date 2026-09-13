import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';

export async function GET() {
  try {
    await requireAdmin();
    const reviews = await prisma.review.findMany({
      take: 500,
      orderBy: [{ is_published: 'desc' }, { created_at: 'desc' }],
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    const unauthorized = error instanceof Error && error.message === 'Unauthorized';
    return NextResponse.json({ error: unauthorized ? 'Unauthorized' : 'Internal Server Error' }, { status: unauthorized ? 401 : 500 });
  }
}
