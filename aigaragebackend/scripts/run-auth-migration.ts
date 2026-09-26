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

async function runAuthMigration() {
  console.log('[INFO] Connecting to NeonDB to execute 002_create_investigators.sql...');
  const client = await pool.connect();
  try {
    const migrationFile = path.resolve(
      __dirname,
      '../src/database/migrations/002_create_investigators.sql',
    );
    console.log(`[INFO] Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('[INFO] Executing investigator DDL statements...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('[SUCCESS] Migration 002_create_investigators.sql executed successfully!\n');

    // Verify created table and columns
    const columnsRes = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'investigators'
      ORDER BY ordinal_position;
    `);

    console.log(`[INFO] Verified investigators table schema (${columnsRes.rows.length} columns):`);
    columnsRes.rows.forEach((col) => {
      console.log(`  - ${col.column_name} (${col.data_type}) [nullable: ${col.is_nullable}]`);
    });

    // Verify indexes
    const indexRes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'investigators';
    `);

    console.log(`\n[INFO] Verified indexes on investigators (${indexRes.rows.length}):`);
    indexRes.rows.forEach((idx) => {
      console.log(`  - ${idx.indexname}`);
    });

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[ERROR] Auth migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runAuthMigration().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
