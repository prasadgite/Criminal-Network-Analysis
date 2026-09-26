import '../src/database/dns-patch';
import 'dotenv/config';
import { Client } from 'pg';

/**
 * SANDHAAN — NeonDB Data Cleanup
 *
 * PURPOSE:
 *   Remove ALL DATA from existing application tables
 *   while preserving:
 *   - tables
 *   - columns
 *   - primary keys
 *   - foreign keys
 *   - indexes
 *   - sequences
 *   - extensions
 *   - schema structure
 *
 * IMPORTANT:
 *   This script does NOT DROP or ALTER tables.
 */

const DATABASE_URL = (
  process.env.DATABASE_URL ||
  `postgresql://neondb_owner:npg_bEUj5tZ8zYPw@ep-soft-darkness-b31r85gj-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
).trim();

if (
  !DATABASE_URL ||
  DATABASE_URL === 'PASTE_YOUR_NEONDB_CONNECTION_STRING_HERE'
) {
  throw new Error(
    '\n❌ DATABASE_URL is empty.\n' +
      'Add your NeonDB connection string inside .env or clear-database-data.ts.\n',
  );
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function getTables(): Promise<string[]> {
  const result = await client.query<{
    tablename: string;
  }>(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  return result.rows.map((row) => row.tablename);
}

async function getRowCount(tableName: string): Promise<number> {
  const result = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM public."${tableName.replace(/"/g, '""')}";`,
  );

  return Number(result.rows[0].count);
}

async function clearDatabase() {
  console.log('\n==========================================');
  console.log(' SANDHAAN — NEONDB DATA CLEANUP');
  console.log('==========================================\n');

  await client.connect();

  console.log('✓ Connected to NeonDB\n');

  const tables = await getTables();

  if (tables.length === 0) {
    console.log('⚠ No tables found in public schema.');
    return;
  }

  console.log(`Found ${tables.length} tables:\n`);

  for (const table of tables) {
    const count = await getRowCount(table);
    console.log(`  ${table.padEnd(35)} ${count} rows`);
  }

  console.log('\n------------------------------------------');
  console.log('Starting data cleanup...');
  console.log('------------------------------------------\n');

  await client.query('BEGIN');

  try {
    /*
     * Disable FK enforcement only for the duration of this transaction.
     *
     * PostgreSQL does not support MySQL-style FOREIGN_KEY_CHECKS.
     * TRUNCATE ... CASCADE is therefore used so all related rows
     * can be removed while preserving the table definitions.
     */

    if (tables.length > 0) {
      const quotedTables = tables
        .map((table) => `"${table.replace(/"/g, '""')}"`)
        .join(', ');

      await client.query(
        `TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE;`,
      );
    }

    await client.query('COMMIT');

    console.log('✓ All table data removed');
    console.log('✓ Tables preserved');
    console.log('✓ Schema preserved');
    console.log('✓ Constraints preserved');
    console.log('✓ Indexes preserved');
    console.log('✓ Sequences reset\n');

    console.log('------------------------------------------');
    console.log('Verification');
    console.log('------------------------------------------\n');

    let totalRows = 0;

    for (const table of tables) {
      const count = await getRowCount(table);
      totalRows += count;

      console.log(
        `  ${table.padEnd(35)} ${String(count).padStart(8)} rows`,
      );

      if (count !== 0) {
        throw new Error(
          `Verification failed: ${table} still contains ${count} rows.`,
        );
      }
    }

    console.log('\n==========================================');
    console.log(' CLEANUP SUCCESSFUL');
    console.log('==========================================');
    console.log(`Tables preserved : ${tables.length}`);
    console.log(`Remaining rows   : ${totalRows}`);
    console.log('Database is ready for original data import.\n');
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('\n❌ Cleanup failed.');
    console.error(error);

    throw error;
  } finally {
    await client.end();
  }
}

clearDatabase().catch(() => {
  process.exit(1);
});
