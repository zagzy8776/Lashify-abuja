export type ServiceCatalogItem = {
  name: string;
  slug: string;
  category: 'brows' | 'lash' | 'cat-eyes' | 'refill' | 'lash-addon';
  price: number;
  duration_minutes: number;
  duration_text?: string;
  description: string;
  sort_order: number;
};

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  { name: 'Micro blading', slug: 'micro-blading', category: 'brows', price: 50000, duration_minutes: 120, description: 'Precise, semi-permanent hair-like strokes customized to enhance your natural brow shape for a fuller, ultra-realistic look.', sort_order: 1 },
  { name: 'Ombré brows', slug: 'ombre-brows', category: 'brows', price: 80000, duration_minutes: 120, description: 'A soft, misty, powder-filled brow resembling the look of makeup. Perfect for a defined, flawless finish that lasts.', sort_order: 2 },
  { name: 'Combination brows', slug: 'combo-brows', category: 'brows', price: 90000, duration_minutes: 150, description: 'The ultimate brow transformation combining the natural hair strokes of microblading with the soft shading of Ombré for beautiful dimension.', sort_order: 3 },
  { name: 'Micro shading', slug: 'micro-shading', category: 'brows', price: 70000, duration_minutes: 150, description: 'Soft powdered shading that creates a filled-in, makeup-like brow with a natural gradient and long-lasting pigment.', sort_order: 4 },
  { name: 'Nano brows', slug: 'nano-brows', category: 'brows', price: 90000, duration_minutes: 150, description: 'Ultra-fine nano needle strokes for hyper-realistic hair simulation and a refined, natural brow finish.', sort_order: 5 },
  { name: 'Brow correcting', slug: 'brow-correcting', category: 'brows', price: 120000, duration_minutes: 180, description: 'Corrective work for previous brow treatments — reshape, recast pigment, and restore a balanced, flattering brow.', sort_order: 6 },
  { name: 'Brow laminating and tint', slug: 'brow-laminating-and-tint', category: 'brows', price: 20000, duration_minutes: 60, description: 'A gentle lift for your brows that creates a full, sleek, brushed-up look, paired with a custom tint for striking definition.', sort_order: 7 },
  { name: 'Ombré brows touch up over 8 weeks', slug: 'ombre-brows-touch-up-over-8-weeks', category: 'brows', price: 25000, duration_minutes: 90, description: 'A necessary color and shape boost to keep your Ombré brows looking sharp, crisp, and beautifully pigmented.', sort_order: 8 },
  { name: 'Ombré brows touch up over 8 months', slug: 'ombre-brows-touch-up-over-8-months', category: 'brows', price: 45000, duration_minutes: 90, description: 'An extended maintenance session to restore vibrancy, depth, and perfect definition to your existing Ombré brows.', sort_order: 9 },

  // Lash Sets — the natural/core lash collection.
  { name: 'Classic set', slug: 'classic-set', category: 'lash', price: 20000, duration_minutes: 120, duration_text: '2hrs', description: 'A timeless 1:1 application where a single extension is applied to each natural lash. Ideal for a subtle, elegant, mascara-like finish.', sort_order: 10 },
  { name: 'Hybrid set', slug: 'hybrid-set', category: 'lash', price: 23500, duration_minutes: 120, duration_text: '2hrs', description: 'The perfect middle ground. A textured blend of classic and volume lashes for those who want a bit more fluff and everyday glamour.', sort_order: 11 },
  { name: 'Volume set', slug: 'volume-set', category: 'lash', price: 28000, duration_minutes: 210, duration_text: '3:30', description: 'Hand-made fans applied to each natural lash, delivering incredible fullness, depth, and a dramatic, fluffy finish.', sort_order: 12 },
  { name: 'Mega volume', slug: 'mega-volume', category: 'lash', price: 33000, duration_minutes: 210, duration_text: '3:30', description: 'Unapologetically bold. Ultra-fine fans for maximum density, darkness, and an intensely glamorous, show-stopping look.', sort_order: 13 },
  { name: 'Wet set', slug: 'wet-set', category: 'lash', price: 19000, duration_minutes: 180, duration_text: '3hrs', description: 'A sleek, darker lash finish with narrow, defined spikes for a glossy wet-look effect.', sort_order: 14 },
  { name: 'Anime set', slug: 'anime-set', category: 'lash', price: 22000, duration_minutes: 180, duration_text: '3hrs', description: 'A striking, defined style with intentional spikes for a doll-like, anime-inspired lash effect.', sort_order: 15 },

  // Cat Eye Sets — use CAT EYES terminology throughout the site.
  { name: 'Classic Cat Eye', slug: 'classic-cat-eye', category: 'cat-eyes', price: 15000, duration_minutes: 120, duration_text: '2hrs', description: 'A classic lash application mapped to create a lifted, elongated cat-eye effect.', sort_order: 20 },
  { name: 'Hybrid Cat Eye', slug: 'hybrid-cat-eye', category: 'cat-eyes', price: 18000, duration_minutes: 120, duration_text: '2hrs', description: 'A textured hybrid lash design with a lifted, elongated cat-eye effect.', sort_order: 21 },
  { name: 'Volume Cat Eye', slug: 'volume-cat-eye', category: 'cat-eyes', price: 21000, duration_minutes: 210, duration_text: '3:30', description: 'A fuller volume lash map designed to emphasize the outer corners for a dramatic cat-eye finish.', sort_order: 22 },
  { name: 'Mega Volume Cat Eye', slug: 'mega-volume-cat-eye', category: 'cat-eyes', price: 24000, duration_minutes: 210, duration_text: '3:30', description: 'Maximum-density lash styling with a bold, lifted cat-eye shape.', sort_order: 23 },

  // Refills.
  { name: 'Classic refill', slug: 'classic-refill', category: 'refill', price: 8000, duration_minutes: 90, duration_text: '90m', description: 'A maintenance refill for an existing classic lash set.', sort_order: 30 },
  { name: 'Hybrid refill', slug: 'hybrid-refill', category: 'refill', price: 10000, duration_minutes: 90, duration_text: '90m', description: 'A customized top-up of an existing hybrid lash set.', sort_order: 31 },
  { name: 'Volume refill', slug: 'volume-refill', category: 'refill', price: 12000, duration_minutes: 90, duration_text: '90m', description: 'Maintenance to replace outgrown volume lashes and restore fullness.', sort_order: 32 },
  { name: 'Mega volume refill', slug: 'mega-volume-refill', category: 'refill', price: 15000, duration_minutes: 90, duration_text: '90m', description: 'A maintenance refill for an existing mega volume lash set.', sort_order: 33 },
  { name: 'Wet refill', slug: 'wet-refill', category: 'refill', price: 12000, duration_minutes: 90, duration_text: '90m', description: 'A maintenance refill for an existing wet set.', sort_order: 34 },
  { name: 'Anime refill', slug: 'anime-refill', category: 'refill', price: 15000, duration_minutes: 90, duration_text: '90m', description: 'A maintenance refill for an existing anime set.', sort_order: 35 },

  // Add-ons & Extras.
  { name: 'Wispy add-on', slug: 'wispy-add-on', category: 'lash-addon', price: 8000, duration_minutes: 30, duration_text: '30m', description: 'Extra wispy spikes added to your lash set for more texture and definition.', sort_order: 40 },
  { name: 'Bottom lashes', slug: 'bottom-lashes', category: 'lash-addon', price: 7000, duration_minutes: 30, duration_text: '30m', description: 'A delicate enhancement applied to your lower lash line to balance your top set and subtly open up your eyes.', sort_order: 41 },
  { name: 'Lash removal', slug: 'lash-removal', category: 'lash-addon', price: 5000, duration_minutes: 30, duration_text: '30m', description: 'A gentle and safe professional removal of your lash extensions, ensuring the health and integrity of your natural lashes.', sort_order: 42 },
];

export const PAYMENT_ACCOUNT = {
  bankName: 'OPay',
  accountNumber: '6113944949',
  accountName: 'FLORENCE SAMAILA',
  whatsapp: '2348087026970',
};
