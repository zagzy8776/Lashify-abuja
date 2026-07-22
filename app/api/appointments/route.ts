import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { z } from 'zod';
import { Resend } from 'resend';


const nigerianPhoneRegex = /^(\+?234|0)[789]\d{9}$/;

const bookingSchema = z.object({
  service_id: z.string().min(1, 'Service is required'),
  client_name: z.string().min(2, 'Name is too short').max(100),
  client_phone: z.string()
    .min(10, 'Phone number is too short')
    .max(16)
    .transform(v => v.replace(/[\s\-()]/g, '')) // strip spaces/dashes
    .refine(v => nigerianPhoneRegex.test(v), 'Please enter a valid Nigerian phone number (e.g. 0801 234 5678)'),
  client_email: z.string().email('Invalid email').optional().or(z.literal('')),
  appointment_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine(v => {
      const d = new Date(v + 'T00:00:00');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return d >= today;
    }, 'Cannot book a date in the past')
    .refine(v => {
      const day = new Date(v + 'T00:00:00').getDay();
      return day !== 0; // 0 = Sunday
    }, 'We are closed on Sundays'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  notes: z.string().max(500).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const appointments = await prisma.appointment.findMany({
      where: date ? { appointment_date: date } : undefined,
      orderBy: [
        { appointment_date: 'asc' },
        { start_time: 'asc' },
      ],
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validate Input
    const validation = bookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validation.error.errors },
        { status: 400 }
      );
    }
    const data = validation.data;

    // 2. Fetch the service to ensure prices and durations are accurate (don't trust the client)
    const service = await prisma.service.findUnique({
      where: { id: data.service_id },
    });

    if (!service || !service.is_active) {
      return NextResponse.json({ error: 'Service not found or inactive' }, { status: 404 });
    }

    // Calculate end time
    const [hours, minutes] = data.start_time.split(':').map(Number);
    const endDate = new Date(1970, 0, 1, hours, minutes + service.duration_minutes);
    const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    // 3. Database Transaction to prevent double booking
    const appointment = await prisma.$transaction(async (tx) => {
      // Check if slot is taken
      const existing = await tx.appointment.findFirst({
        where: {
          appointment_date: data.appointment_date,
          status: { in: ['pending', 'confirmed'] },
          OR: [
            {
              start_time: { lte: data.start_time },
              end_time: { gt: data.start_time },
            },
            {
              start_time: { lt: end_time },
              end_time: { gte: end_time },
            },
            {
              start_time: { gte: data.start_time },
              end_time: { lte: end_time },
            }
          ]
        }
      });

      if (existing) {
        throw new Error('This time slot is already booked. Please select another time.');
      }

      // Create client if doesn't exist, or just use details
      // For simplicity, we just store it in the appointment directly for now 
      // (denormalized, as per your old architecture, but safe)
      
      return await tx.appointment.create({
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
          status: 'pending',
          notes: data.notes || null,
        }
      });
    });

    // 4. Send Confirmation Email via Resend (don't await this so user doesn't wait)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@lashifyabuja.com';
      
      // Notify Admin
      resend.emails.send({
        from: 'LashifyAbuja <bookings@tushaesthetics.com>',
        to: adminEmail,
        subject: `New Booking: ${appointment.service_name} on ${appointment.appointment_date}`,
        html: `
          <h2>New Booking Request</h2>
          <p><strong>Client:</strong> ${appointment.client_name}</p>
          <p><strong>Phone:</strong> ${appointment.client_phone}</p>
          <p><strong>Service:</strong> ${appointment.service_name}</p>
          <p><strong>Date:</strong> ${appointment.appointment_date}</p>
          <p><strong>Time:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
          <p><strong>Price:</strong> ₦${appointment.service_price}</p>
        `,
      }).catch(err => console.error('Failed to send admin email:', err));

      // Notify Client if email provided
      if (appointment.client_email) {
        resend.emails.send({
          from: 'LashifyAbuja <bookings@tushaesthetics.com>',
          to: appointment.client_email,
          subject: 'Your LashifyAbuja Appointment Request',
          html: `
            <h2>Thank you for booking with LashifyAbuja!</h2>
            <p>Hi ${appointment.client_name}, we have received your booking request.</p>
            <p><strong>Service:</strong> ${appointment.service_name}</p>
            <p><strong>Date:</strong> ${appointment.appointment_date}</p>
            <p><strong>Time:</strong> ${appointment.start_time}</p>
            <br/>
            <p>We will contact you shortly to confirm your appointment.</p>
          `,
        }).catch(err => console.error('Failed to send client email:', err));
      }
    }

    return NextResponse.json(appointment, { status: 201 });

  } catch (error: any) {
    console.error('Booking error:', error);
    if (error.message.includes('already booked')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}
