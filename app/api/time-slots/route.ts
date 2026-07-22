import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const slots = await prisma.timeSlot.findMany({
      where: { is_active: true },
      orderBy: { day_of_week: 'asc' },
    });
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json({ error: 'Failed to fetch time slots' }, { status: 500 });
  }
}
