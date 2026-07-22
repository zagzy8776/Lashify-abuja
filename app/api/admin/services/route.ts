import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

const DEFAULT_SERVICES = [
  // BROWS
  { name: 'Ombré brows', slug: 'ombre-brows', category: 'brows', price: 50000, duration_minutes: 120, description: 'A soft, misty, powder-filled brow resembling the look of makeup. Perfect for a defined, flawless finish that lasts.', sort_order: 1 },
  { name: 'Combo brows', slug: 'combo-brows', category: 'brows', price: 60000, duration_minutes: 150, description: 'The ultimate brow transformation combining the natural hair strokes of microblading with the soft shading of Ombré for beautiful dimension.', sort_order: 2 },
  { name: 'Micro blading', slug: 'micro-blading', category: 'brows', price: 50000, duration_minutes: 120, description: 'Precise, semi-permanent hair-like strokes customized to enhance your natural brow shape for a fuller, ultra-realistic look.', sort_order: 3 },
  { name: 'Brow laminating and tint', slug: 'brow-laminating-and-tint', category: 'brows', price: 20000, duration_minutes: 60, description: 'A gentle lift for your brows that creates a full, sleek, brushed-up look, paired with a custom tint for striking definition.', sort_order: 4 },
  { name: 'Ombré brows touch up over 8 weeks', slug: 'ombre-brows-touch-up-over-8-weeks', category: 'brows', price: 25000, duration_minutes: 90, description: 'A necessary color and shape boost to keep your Ombré brows looking sharp, crisp, and beautifully pigmented.', sort_order: 5 },
  { name: 'Ombré brows touch up over 8 months', slug: 'ombre-brows-touch-up-over-8-months', category: 'brows', price: 45000, duration_minutes: 90, description: 'An extended maintenance session to restore vibrancy, depth, and perfect definition to your existing Ombré brows.', sort_order: 6 },

  // LASH
  { name: 'Classic sets', slug: 'classic-sets', category: 'lash', price: 20000, duration_minutes: 120, duration_text: '2hrs', description: 'A timeless 1:1 application where a single extension is applied to each natural lash. Ideal for a subtle, elegant, mascara-like finish.', sort_order: 7 },
  { name: 'Hybrid set', slug: 'hybrid-set', category: 'lash', price: 21500, duration_minutes: 120, duration_text: '2hrs', description: 'The perfect middle ground. A textured blend of classic and volume lashes for those who want a bit more fluff and everyday glamour.', sort_order: 8 },
  { name: 'Volume sets', slug: 'volume-sets', category: 'lash', price: 25000, duration_minutes: 210, duration_text: '3:30', description: 'Hand-made fans applied to each natural lash, delivering incredible fullness, depth, and a dramatic, fluffy finish.', sort_order: 9 },
  { name: 'Customize sets', slug: 'customize-sets', category: 'lash', price: 37000, duration_minutes: 210, duration_text: '3:30', description: 'A completely bespoke lash map tailored to your unique eye shape and style preference. The pinnacle of personalized luxury.', sort_order: 10 },
  { name: 'Mega volume', slug: 'mega-volume', category: 'lash', price: 30000, duration_minutes: 210, duration_text: '3:30', description: 'Unapologetically bold. Ultra-fine fans for maximum density, darkness, and an intensely glamorous, show-stopping look.', sort_order: 11 },
  { name: 'Bottom lashes', slug: 'bottom-lashes', category: 'lash', price: 7000, duration_minutes: 30, duration_text: '30m', description: 'A delicate enhancement applied to your lower lash line to balance your top set and subtly open up your eyes.', sort_order: 12 },
  { name: 'Wispy hybrid set', slug: 'wispy-hybrid-set', category: 'lash', price: 27500, duration_minutes: 120, duration_text: '2hr', description: 'A highly textured, fluttery look featuring varying lengths and "spikes" to create a modern, effortlessly chic style.', sort_order: 13 },
  { name: 'Anime set', slug: 'anime-set', category: 'lash', price: 23500, duration_minutes: 180, duration_text: '3hrs', description: 'A striking, defined style mimicking the spiky lash look of anime characters. Perfect for a doll-like, captivating gaze.', sort_order: 14 },
  { name: 'Lash removal', slug: 'lash-removal', category: 'lash', price: 5000, duration_minutes: 30, duration_text: '30m', description: 'A gentle and safe professional removal of your lash extensions, ensuring the health and integrity of your natural lashes.', sort_order: 15 },

  // LASH REFILL
  { name: 'Volume set refill', slug: 'volume-set-refill', category: 'lash-refill', price: 14000, duration_minutes: 90, description: 'Maintenance to replace outgrown volume lashes and fill in gaps, restoring your set to its original fluffy glory.', sort_order: 16 },
  { name: 'Hybrid refill', slug: 'hybrid-refill', category: 'lash-refill', price: 11500, duration_minutes: 90, description: 'A customized top-up of your classic and volume fans to refresh your textured, hybrid look and keep it flawless.', sort_order: 17 }
];

export async function GET() {
  try {
    let services = await prisma.service.findMany({
      orderBy: [
        { category: 'asc' },
        { sort_order: 'asc' },
        { name: 'asc' },
      ],
    });

    if (services.length === 0) {
      // Auto-seed default services into DB
      for (const s of DEFAULT_SERVICES) {
        await prisma.service.create({ data: s });
      }
      services = await prisma.service.findMany({
        orderBy: [
          { category: 'asc' },
          { sort_order: 'asc' },
          { name: 'asc' },
        ],
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching admin services:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auto-generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const service = await prisma.service.create({
      data: body,
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
