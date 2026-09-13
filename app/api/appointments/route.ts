import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/src/lib/prisma';
import { z } from 'zod';
import { Resend } from 'resend';
import { addMinutesToTime, hasTimeOverlap } from '@/src/lib/time';

const nigerianPhoneRegex = /^(\+?234|0)[789]\d{9}$/;

const bookingSchema = z.object({
  service_id: z.string().min(1, 'Service is required'),
  client_name: z.string().trim().min(2, 'Name is too short').max(100),
  client_phone: z.string()
    .min(10, 'Phone number is too short')
    .max(20)
    .transform((value) => value.replace(/[\s\-()]/g, ''))
    .refine((value) => nigerianPhoneRegex.test(value), 'Please enter a valid Nigerian phone number'),
  client_email: z.string().email('Invalid email').max(254).optional().or(z.literal('')),
  appointment_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Cannot book a date in the past')
    .refine((value) => new Date(`${value}T00:00:00`).getDay() !== 0, 'We are closed on Sundays'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format'),
  notes: z.string().trim().max(500).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    // Availability endpoints must never expose customer PII.
    const appointments = await prisma.appointment.findMany({
      where: date ? { appointment_date: date, status: { in: ['pending', 'confirmed'] } } : { status: { in: ['pending', 'confirmed'] } },
      select: { id: true, appointment_date: true, start_time: true, end_time: true, status: true },
      orderBy: [{ appointment_date: 'asc' }, { start_time: 'asc' }],
      take: 1000,
    });

    return NextResponse.json(appointments, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const validation = bookingSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validation.error.issues },
        { status: 400 },
      );
    }

    const data = validation.data;
    const service = await prisma.service.findUnique({ where: { id: data.service_id } });

    if (!service || !service.is_active) {
      return NextResponse.json({ error: 'Service not found or inactive' }, { status: 404 });
    }

    const end_time = addMinutesToTime(data.start_time, service.duration_minutes);

    const appointment = await prisma.$transaction(async (tx) => {
      const existing = await tx.appointment.findMany({
        where: {
          appointment_date: data.appointment_date,
          status: { in: ['pending', 'confirmed'] },
        },
        select: { start_time: true, end_time: true },
      });

      if (existing.some((slot) => hasTimeOverlap(data.start_time, end_time, slot.start_time, slot.end_time))) {
        throw new Error('This time slot is already booked. Please select another time.');
      }

      return tx.appointment.create({
        data: {
          service_id: service.id,
          client_name: data.client_name,
          client_phone: data.client_phone,
          client_email: data.client_email || null,
          service_name: service.name,
          service_price: service.price,
          service_duration: service.duration_minutes,
          appointment_date: data.appointment_date,
          start_time: data.start_time,
          end_time,
          status: 'confirmed',
          notes: data.notes || null,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 });

    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      resend.emails.send({
        from: 'LashifyAbuja <bookings@tushaesthetics.com>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Confirmed Booking: ${appointment.service_name} on ${appointment.appointment_date}`,
        html: `
          <h2>New Confirmed Booking</h2>
          <p><strong>Client:</strong> ${escapeHtml(appointment.client_name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(appointment.client_phone)}</p>
          <p><strong>Service:</strong> ${escapeHtml(appointment.service_name)}</p>
          <p><strong>Date:</strong> ${escapeHtml(appointment.appointment_date)}</p>
          <p><strong>Time:</strong> ${escapeHtml(appointment.start_time)} - ${escapeHtml(appointment.end_time)}</p>
          <p><strong>Price:</strong> ₦${appointment.service_price}</p>
          <p><strong>Status:</strong> Confirmed (verify payment receipt)</p>
          <p><strong>Notes:</strong> ${escapeHtml(appointment.notes || '—')}</p>
        `,
      }).catch((error) => console.error('Failed to send admin email:', error));

      if (appointment.client_email) {
        resend.emails.send({
          from: 'LashifyAbuja <bookings@tushaesthetics.com>',
          to: appointment.client_email,
          subject: 'Your LashifyAbuja Appointment is Confirmed',
          html: `
            <h2>Your appointment is confirmed!</h2>
            <p>Hi ${escapeHtml(appointment.client_name)}, thank you for booking with LashifyAbuja.</p>
            <p><strong>Service:</strong> ${escapeHtml(appointment.service_name)}</p>
            <p><strong>Date:</strong> ${escapeHtml(appointment.appointment_date)}</p>
            <p><strong>Time:</strong> ${escapeHtml(appointment.start_time)}</p>
            <br/>
            <p>Please send your payment receipt on WhatsApp if you have not already.</p>
            <p>We look forward to seeing you!</p>
          `,
        }).catch((error) => console.error('Failed to send client email:', error));
      }
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    if (error instanceof Error && error.message.includes('already booked')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    // Serializable transactions can be retried by the client when contention occurs.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'The slot changed while booking. Please try again.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character] || character));
}
