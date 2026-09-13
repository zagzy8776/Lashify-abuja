import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';
import { appointmentUpdateSchema } from '@/src/lib/admin-validation';
import { addMinutesToTime, hasTimeOverlap } from '@/src/lib/time';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const input = appointmentUpdateSchema.parse(await request.json());
    const current = await prisma.appointment.findUnique({ where: { id } });

    if (!current) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

    const appointmentDate = input.appointment_date ?? current.appointment_date;
    const startTime = input.start_time ?? current.start_time;
    const status = input.status ?? current.status;
    const endTime = addMinutesToTime(startTime, current.service_duration);

    if (status === 'pending' || status === 'confirmed') {
      const sameDay = await prisma.appointment.findMany({
        where: {
          id: { not: id },
          appointment_date: appointmentDate,
          status: { in: ['pending', 'confirmed'] },
        },
        select: { start_time: true, end_time: true },
      });

      const conflict = sameDay.some((existing) =>
        hasTimeOverlap(startTime, endTime, existing.start_time, existing.end_time),
      );

      if (conflict) {
        return NextResponse.json({ error: 'This time overlaps another active appointment' }, { status: 409 });
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...input,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid appointment data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  return PATCH(request, context);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
