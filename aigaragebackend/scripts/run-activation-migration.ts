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

async function runActivationMigration() {
  console.log('[INFO] Connecting to NeonDB to execute 004_create_activation_security.sql...');
  const client = await pool.connect();
  try {
    const migrationFile = path.resolve(
      __dirname,
      '../src/database/migrations/004_create_activation_security.sql',
    );
    console.log(`[INFO] Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('[INFO] Executing migration statements...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('[SUCCESS] Migration 004_create_activation_security.sql executed successfully!\n');

    // Verify columns on investigators
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'investigators'
      ORDER BY ordinal_position;
    `);
    console.log('[INFO] Current investigators columns:');
    cols.rows.forEach((r) => console.log(`  - ${r.column_name} (${r.data_type})`));
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[ERROR] Activation migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runActivationMigration().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
