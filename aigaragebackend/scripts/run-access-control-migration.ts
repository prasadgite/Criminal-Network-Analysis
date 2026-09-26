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

async function runAccessControlMigration() {
  console.log('[INFO] Connecting to NeonDB to execute 003_access_control_foundation.sql...');
  const client = await pool.connect();
  try {
    const migrationFile = path.resolve(
      __dirname,
      '../src/database/migrations/003_access_control_foundation.sql',
    );
    console.log(`[INFO] Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('[INFO] Executing access control foundation DDL statements...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('[SUCCESS] Migration 003_access_control_foundation.sql executed successfully!\n');

    // Verify all 4 tables exist
    const tables = ['access_requests', 'users', 'user_credentials', 'access_audit_logs'];
    for (const table of tables) {
      const columnsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      console.log(`[INFO] Verified ${table} schema (${columnsRes.rows.length} columns):`);
      columnsRes.rows.forEach((col) => {
        console.log(`  - ${col.column_name} (${col.data_type}) [nullable: ${col.is_nullable}]`);
      });
      console.log('');
    }

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[ERROR] Access control migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runAccessControlMigration().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
