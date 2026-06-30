import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = "postgresql://neondb_owner:npg_R8Dz5jNATCUu@ep-late-cherry-atizmi01-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runSchema() {
  try {
    console.log('Connecting to Neon database...');
    const schemaPath = path.join(__dirname, 'supabase', 'migrations', '20260630221127_create_lashify_schema_neon.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running schema migration...');
    await pool.query(schema);
    console.log('Schema migration completed successfully!');
  } catch (error) {
    console.error('Error running schema:', error);
  } finally {
    await pool.end();
  }
}

runSchema();
