import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Services
  const services = [
    // BROWS
    { name: 'Ombré brows', slug: 'ombre-brows', category: 'brows', price: 50000, duration_minutes: 120, description: 'A soft, misty, powder-filled brow resembling the look of makeup.', sort_order: 1 },
    { name: 'Combo brows', slug: 'combo-brows', category: 'brows', price: 60000, duration_minutes: 150, description: 'The ultimate brow transformation combining the natural hair strokes of microblading with the soft shading of Ombré.', sort_order: 2 },
    { name: 'Micro blading', slug: 'micro-blading', category: 'brows', price: 50000, duration_minutes: 120, description: 'Precise, semi-permanent hair-like strokes customized to enhance your natural brow shape.', sort_order: 3 },
    { name: 'Brow laminating and tint', slug: 'brow-laminating-and-tint', category: 'brows', price: 20000, duration_minutes: 60, description: 'A gentle lift for your brows that creates a full, sleek, brushed-up look, paired with a custom tint.', sort_order: 4 },
    { name: 'Ombré brows touch up over 8 weeks', slug: 'ombre-brows-touch-up-over-8-weeks', category: 'brows', price: 25000, duration_minutes: 90, description: 'A necessary color and shape boost to keep your Ombré brows looking sharp.', sort_order: 5 },
    { name: 'Ombré brows touch up over 8 months', slug: 'ombre-brows-touch-up-over-8-months', category: 'brows', price: 45000, duration_minutes: 90, description: 'An extended maintenance session to restore vibrancy, depth, and perfect definition.', sort_order: 6 },
  
    // LASH
    { name: 'Classic sets', slug: 'classic-sets', category: 'lash', price: 20000, duration_minutes: 120, duration_text: '2hrs', description: 'A timeless 1:1 application where a single extension is applied to each natural lash.', sort_order: 7 },
    { name: 'Hybrid set', slug: 'hybrid-set', category: 'lash', price: 21500, duration_minutes: 120, duration_text: '2hrs', description: 'The perfect middle ground. A textured blend of classic and volume lashes.', sort_order: 8 },
    { name: 'Volume sets', slug: 'volume-sets', category: 'lash', price: 25000, duration_minutes: 210, duration_text: '3:30', description: 'Hand-made fans applied to each natural lash, delivering incredible fullness.', sort_order: 9 },
    { name: 'Customize sets', slug: 'customize-sets', category: 'lash', price: 37000, duration_minutes: 210, duration_text: '3:30', description: 'A completely bespoke lash map tailored to your unique eye shape.', sort_order: 10 },
    { name: 'Mega volume', slug: 'mega-volume', category: 'lash', price: 30000, duration_minutes: 210, duration_text: '3:30', description: 'Unapologetically bold. Ultra-fine fans for maximum density.', sort_order: 11 },
    { name: 'Bottom lashes', slug: 'bottom-lashes', category: 'lash', price: 7000, duration_minutes: 30, duration_text: '30m', description: 'A delicate enhancement applied to your lower lash line.', sort_order: 12 },
    { name: 'Wispy hybrid set', slug: 'wispy-hybrid-set', category: 'lash', price: 27500, duration_minutes: 120, duration_text: '2hr', description: 'A highly textured, fluttery look featuring varying lengths and "spikes".', sort_order: 13 },
    { name: 'Anime set', slug: 'anime-set', category: 'lash', price: 23500, duration_minutes: 180, duration_text: '3hrs', description: 'A striking, defined style mimicking the spiky lash look of anime characters.', sort_order: 14 },
    { name: 'Lash removal', slug: 'lash-removal', category: 'lash', price: 5000, duration_minutes: 30, duration_text: '30m', description: 'A gentle and safe professional removal of your lash extensions.', sort_order: 15 },
  
    // LASH REFILL
    { name: 'Volume set refill', slug: 'volume-set-refill', category: 'lash-refill', price: 14000, duration_minutes: 90, description: 'Maintenance to replace outgrown volume lashes and fill in gaps.', sort_order: 16 },
    { name: 'Hybrid refill', slug: 'hybrid-refill', category: 'lash-refill', price: 11500, duration_minutes: 90, description: 'A customized top-up of your classic and volume fans.', sort_order: 17 }
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  // 2. Seed TimeSlots
  const defaultTimeSlots = [
    { day_of_week: 1, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 2, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 3, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 4, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 5, start_time: '09:00', end_time: '19:00', is_active: true },
    { day_of_week: 6, start_time: '10:00', end_time: '17:00', is_active: true },
    { day_of_week: 0, start_time: '12:00', end_time: '17:00', is_active: false }
  ];

  for (const ts of defaultTimeSlots) {
    // Basic way to avoid duplicating
    const existing = await prisma.timeSlot.findFirst({
      where: { day_of_week: ts.day_of_week }
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
