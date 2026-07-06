import pool from './db.js';

const services = [
  // LASH
  { name: 'Classic sets', category: 'lash', price: 20000, duration: 120, duration_text: '2hrs', desc: 'A single extension applied to each natural lash for a subtle, elegant, and natural enhancement.' },
  { name: 'Hybrid set', category: 'lash', price: 21500, duration: 120, duration_text: '2hrs', desc: 'A perfect luxurious blend of Classic and Volume lashes for a textured, fuller, everyday look.' },
  { name: 'Volume sets', category: 'lash', price: 25000, duration: 210, duration_text: '3:30', desc: 'Multiple lightweight extensions applied to each natural lash for beautiful fluff and volume.' },
  { name: 'Customize sets', category: 'lash', price: 37000, duration: 210, duration_text: '3:30', desc: 'A fully bespoke lash set tailored exactly to your eye shape and personal style preference.' },
  { name: 'Mega volume', category: 'lash', price: 30000, duration: 210, duration_text: '3:30', desc: 'The most dramatic, dense, and dark lash look available for maximum fullness and glamour.' },
  { name: 'Bottom lashes', category: 'lash', price: 7000, duration: 30, duration_text: '30m', desc: 'Delicate extensions applied to the bottom lashes to complete a striking, balanced look.' },
  { name: 'Wispy hybrid set', category: 'lash', price: 27500, duration: 120, duration_text: '2hr', desc: 'Spiky, textured styling using hybrid techniques for a trendy, wispy effect.' },
  { name: 'Anime set', category: 'lash', price: 23500, duration: 180, duration_text: '3hrs', desc: 'A highly styled, spiked lash look inspired by manga and anime aesthetics.' },
  { name: 'Lash removal', category: 'lash', price: 5000, duration: 30, duration_text: '30m', desc: 'Safe and gentle professional removal of existing lash extensions to protect your natural lashes.' },

  // LASH REFILL
  { name: 'Refill Volume set', category: 'lash-refill', price: 14000, duration: 120, duration_text: '2hrs', desc: 'Maintenance refill for your volume set to keep them looking full and pristine.' },
  { name: 'Hybrid refill', category: 'lash-refill', price: 11500, duration: 90, duration_text: '1:30', desc: 'Maintenance refill for your hybrid set to restore texture and length.' },

  // BROWS
  { name: 'Ombré brows', category: 'brows', price: 50000, duration: 150, duration_text: '', desc: 'A soft, shaded brow pencil look that is semi-permanent and heals to a beautiful, powdery finish.' },
  { name: 'Combo brows', category: 'brows', price: 60000, duration: 180, duration_text: '', desc: 'The ultimate brow transformation combining hair-like strokes with soft shading for depth and realism.' },
  { name: 'Micro blading', category: 'brows', price: 50000, duration: 120, duration_text: '', desc: 'Semi-permanent brow tattoo using precise hair-like strokes for a highly natural, fuller brow.' },
  { name: 'Brow laminating and tint', category: 'brows', price: 25000, duration: 60, duration_text: '', desc: 'A perm for your brows paired with a custom tint to give them a set, uniform, and bold shape.' },
  { name: 'Ombré brows touch up over 8 weeks', category: 'brows', price: 25000, duration: 90, duration_text: '', desc: 'Essential maintenance touch-up for your Ombré brows after the initial 8-week healing period.' },
  { name: 'Ombré brows touch up over 8 months', category: 'brows', price: 45000, duration: 120, duration_text: '', desc: 'Annual color boost and shape refinement for your existing Ombré brows to keep them fresh.' },
];

async function seed() {
  try {
    for (const service of services) {
      const slug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await pool.query(
        'INSERT INTO services (name, slug, category, price, duration_minutes, duration_text, description, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) ON CONFLICT (slug) DO NOTHING',
        [service.name, slug, service.category, service.price, service.duration, service.duration_text, service.desc]
      );
    }
    console.log('Successfully seeded services!');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    process.exit(0);
  }
}

seed();
