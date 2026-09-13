import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';

export async function GET() {
  try {
    await requireAdmin();
    const appointments = await prisma.appointment.findMany({
      take: 1000,
      orderBy: [
        { appointment_date: 'desc' },
        { start_time: 'desc' },
      ],
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    const unauthorized = error instanceof Error && error.message === 'Unauthorized';
    return NextResponse.json(
      { error: unauthorized ? 'Unauthorized' : 'Internal Server Error' },
      { status: unauthorized ? 401 : 500 },
    );
  }
}
