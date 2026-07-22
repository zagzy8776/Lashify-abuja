import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: [
        { appointment_date: 'desc' },
        { start_time: 'desc' },
      ],
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
