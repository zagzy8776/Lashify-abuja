import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST(request: Request) {
  try {
    const { discountPercentage } = await request.json();
    const percent = Number(discountPercentage) || 15;
    const multiplier = (100 - percent) / 100;

    const services = await prisma.service.findMany();

    for (const service of services) {
      const newPrice = Math.round(service.price * multiplier);
      await prisma.service.update({
        where: { id: service.id },
        data: { price: newPrice },
      });
    }

    return NextResponse.json({ success: true, count: services.length });
  } catch (error) {
    console.error('Error applying bulk discount:', error);
    return NextResponse.json({ error: 'Failed to apply discount' }, { status: 500 });
  }
}
