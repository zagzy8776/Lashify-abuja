import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST(request: Request) {
  try {
    const { action, discountPercentage } = await request.json();
    const services = await prisma.service.findMany();

    if (action === 'remove') {
      for (const service of services) {
        if (service.original_price !== null && service.original_price !== undefined) {
          await prisma.service.update({
            where: { id: service.id },
            data: {
              price: service.original_price,
              original_price: null,
            },
          });
        }
      }
      return NextResponse.json({ success: true, action: 'removed', count: services.length });
    }

    // Default: Apply discount
    const percent = Number(discountPercentage) || 15;
    const multiplier = (100 - percent) / 100;

    for (const service of services) {
      // Preserve the original base price if not already stored
      const basePrice = service.original_price ?? service.price;
      const newPrice = Math.round(basePrice * multiplier);

      await prisma.service.update({
        where: { id: service.id },
        data: {
          price: newPrice,
          original_price: basePrice,
        },
      });
    }

    return NextResponse.json({ success: true, action: 'applied', discountPercentage: percent, count: services.length });
  } catch (error) {
    console.error('Error in promo action:', error);
    return NextResponse.json({ error: 'Failed to process promo request' }, { status: 500 });
  }
}
