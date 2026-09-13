import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/admin-auth';
import { bulkPromoSchema } from '@/src/lib/admin-validation';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { action, discountPercentage } = bulkPromoSchema.parse(await request.json());
    const services = await prisma.service.findMany({ select: { id: true, price: true, original_price: true } });

    if (action === 'remove') {
      await prisma.$transaction(
        services
          .filter((service) => service.original_price !== null)
          .map((service) => prisma.service.update({
            where: { id: service.id },
            data: { price: service.original_price as number, original_price: null },
          })),
      );
      return NextResponse.json({ success: true, action: 'removed', count: services.length });
    }

    const percent = discountPercentage ?? 15;
    const multiplier = (100 - percent) / 100;

    await prisma.$transaction(
      services.map((service) => {
        const basePrice = service.original_price ?? service.price;
        return prisma.service.update({
          where: { id: service.id },
          data: { price: Math.round(basePrice * multiplier), original_price: basePrice },
        });
      }),
    );

    return NextResponse.json({ success: true, action: 'applied', discountPercentage: percent, count: services.length });
  } catch (error) {
    console.error('Error in promo action:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid promotion data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process promo request' }, { status: 500 });
  }
}
