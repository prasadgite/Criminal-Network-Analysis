import '../src/database/dns-patch';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[FATAL] DATABASE_URL is not set in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  console.log('[INFO] Connecting to NeonDB to run migrations...');
  const client = await pool.connect();
  try {
    const migrationFile = path.resolve(__dirname, '../src/database/migrations/001_initial_schema.sql');
    console.log(`[INFO] Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('[INFO] Executing schema DDL statements...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('[SUCCESS] Migration 001_initial_schema.sql executed successfully!\n');

    // Verify created tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`[INFO] Verified public tables in NeonDB (${tableRes.rows.length}):`);
    tableRes.rows.forEach((r, idx) => {
      console.log(`  ${(idx + 1).toString().padStart(2, '0')}. ${r.table_name}`);
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[ERROR] Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
