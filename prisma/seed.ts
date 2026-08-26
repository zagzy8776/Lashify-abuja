import { PrismaClient } from '@prisma/client';
import { SERVICE_CATALOG } from '../src/lib/services-catalog';

const prisma = new PrismaClient();

async function main() {
  for (const s of SERVICE_CATALOG) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.description,
        price: s.price,
        duration_minutes: s.duration_minutes,
        duration_text: s.duration_text ?? null,
        category: s.category,
        sort_order: s.sort_order,
        is_active: true,
      },
      create: {
        name: s.name,
        slug: s.slug,
        description: s.description,
        price: s.price,
        duration_minutes: s.duration_minutes,
        duration_text: s.duration_text ?? null,
        category: s.category,
        sort_order: s.sort_order,
        is_active: true,
      },
    });
  }

  const defaultTimeSlots = [
    { day_of_week: 1, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 2, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 3, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 4, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 5, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 6, start_time: '10:00', end_time: '17:00', is_active: true },
    { day_of_week: 0, start_time: '12:00', end_time: '17:00', is_active: false },
  ];

  for (const ts of defaultTimeSlots) {
    const existing = await prisma.timeSlot.findFirst({
      where: { day_of_week: ts.day_of_week },
    });
    if (!existing) {
      await prisma.timeSlot.create({ data: ts });
    }
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
