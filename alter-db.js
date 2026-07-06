import pg from 'pg';

const { Pool } = pg;
const DATABASE_URL = "postgresql://neondb_owner:npg_R8Dz5jNATCUu@ep-late-cherry-atizmi01-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log('Adding duration_text to services table...');
    await pool.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_text text;');
    console.log('Successfully altered table.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

run();
