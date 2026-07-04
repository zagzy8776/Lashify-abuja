import pool from './db.js';

const services = [
  // LASHES
  { name: 'Classic Lashes', category: 'lashes', price: 20000, duration: 90, desc: 'A single extension applied to each natural lash for a subtle, natural enhancement.' },
  { name: 'Hybrid Lashes', category: 'lashes', price: 25000, duration: 120, desc: 'A perfect blend of Classic and Volume lashes for a textured, fuller look.' },
  { name: 'Russian Volume', category: 'lashes', price: 30000, duration: 150, desc: 'Multiple lightweight extensions applied to each natural lash for dramatic fluff and volume.' },
  { name: 'Mega Volume', category: 'lashes', price: 35000, duration: 180, desc: 'The most dramatic, dense, and dark lash look available. Maximum fullness.' },
  { name: 'Wispy Lashes (Anime Set)', category: 'lashes', price: 28000, duration: 135, desc: 'Spiky, textured, and customized styling for a trendy, wispy effect.' },
  
  // BROWS
  { name: 'Microblading', category: 'brows', price: 50000, duration: 120, desc: 'Semi-permanent brow tattoo using hair-like strokes for a natural, fuller brow.' },
  { name: 'Ombre Powder Brows', category: 'brows', price: 60000, duration: 150, desc: 'A soft, shaded brow pencil look that is semi-permanent and heals beautifully.' },
  { name: 'Brow Lamination', category: 'brows', price: 25000, duration: 60, desc: 'A perm for your brows that gives them a set, uniform shape for an extended period.' },
  { name: 'Brow Tinting', category: 'brows', price: 10000, duration: 30, desc: 'Semi-permanent dye to enhance the color, shape, and thickness of your brows.' },
  { name: 'Brow Shaping & Waxing', category: 'brows', price: 8000, duration: 30, desc: 'Expert brow mapping and shaping using high-quality wax.' }
];

async function seed() {
  try {
    for (const service of services) {
      await pool.query(
        'INSERT INTO services (name, category, price, duration_minutes, description, is_active) VALUES ($1, $2, $3, $4, $5, true) ON CONFLICT DO NOTHING',
        [service.name, service.category, service.price, service.duration, service.desc]
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
