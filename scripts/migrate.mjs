import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Direct Pooler Connection String from .env
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

async function runMigration() {
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not set in environment.');
    process.exit(1);
  }

  console.log('Connecting to Supabase PostgreSQL...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL successfully!');

    const schemaPath = path.join(__dirname, '../supabase/migrations/20261027_initial_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing Water Factory ERP Schema & Triggers...');
    await client.query(sql);
    console.log('Migration completed successfully!');

    // Check existing tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Public tables in Supabase:');
    res.rows.forEach((row) => console.log(' - ' + row.table_name));
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
