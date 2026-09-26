import '../src/database/dns-patch';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import { parse } from 'csv-parse';

const DATABASE_URL = (
  process.env.DATABASE_URL ||
  `postgresql://neondb_owner:npg_bEUj5tZ8zYPw@ep-soft-darkness-b31r85gj-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
).trim();

/**
 * Put the original CSV files here:
 *
 * aigaragebackend/
 * ├── data/
 * │   └── original/
 * │       ├── bank_accounts.csv
 * │       ├── case_entities.csv
 * │       ├── cases.csv
 * │       ├── cdr_records_MVP_100K.csv
 * │       ├── cell_towers.csv
 * │       ├── entity_mentions.csv
 * │       ├── evidence.csv
 * │       ├── evidence_links.csv
 * │       ├── fir_narratives.csv
 * │       ├── location_events.csv
 * │       ├── locations.csv
 * │       ├── person.csv
 * │       ├── persons_ground_truth.csv
 * │       ├── phones.csv
 * │       ├── transactions.csv
 * │       └── vehicles.csv
 * │
 * └── scripts/
 *     └── import-original-data.ts
 */

const DATA_DIR = process.env.DATASETS_DIR
  ? path.resolve(process.env.DATASETS_DIR)
  : fs.existsSync('D:/Prasad/hackathons/sih 2026/dataset/synthetic datasets')
    ? 'D:/Prasad/hackathons/sih 2026/dataset/synthetic datasets'
    : path.resolve(__dirname, '..', 'data', 'original');

const BATCH_SIZE = 1000;

/**
 * Import order is intentional.
 *
 * Parent/reference tables are loaded before dependent tables.
 */
const DATASETS = [
  {
    file: 'cell_towers.csv',
    tableCandidates: ['cell_towers'],
  },
  {
    file: 'locations.csv',
    tableCandidates: ['locations'],
  },
  {
    file: 'person.csv',
    tableCandidates: ['persons', 'person'],
  },
  {
    file: 'persons_ground_truth.csv',
    tableCandidates: ['persons_ground_truth'],
  },
  {
    file: 'phones.csv',
    tableCandidates: ['phones'],
  },
  {
    file: 'vehicles.csv',
    tableCandidates: ['vehicles'],
  },
  {
    file: 'cases.csv',
    tableCandidates: ['cases'],
  },
  {
    file: 'fir_narratives.csv',
    tableCandidates: ['fir_narratives'],
  },
  {
    file: 'bank_accounts.csv',
    tableCandidates: ['bank_accounts'],
  },
  {
    file: 'cdr_records_MVP_100K.csv',
    tableCandidates: ['cdr_records'],
  },
  {
    file: 'location_events.csv',
    tableCandidates: ['location_events'],
  },
  {
    file: 'transactions.csv',
    tableCandidates: ['transactions'],
  },
  {
    file: 'case_entities.csv',
    tableCandidates: ['case_entities'],
  },
  {
    file: 'entity_mentions.csv',
    tableCandidates: ['entity_mentions'],
  },
  {
    file: 'evidence.csv',
    tableCandidates: ['evidence'],
  },
  {
    file: 'evidence_links.csv',
    tableCandidates: ['evidence_links'],
  },
] as const;

type DatasetConfig = (typeof DATASETS)[number];

type CsvRow = Record<string, string>;

interface TableColumn {
  column_name: string;
  ordinal_position: number;
  is_nullable: string;
  column_default: string | null;
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function normalizeColumn(value: string): string {
  return value.trim().toLowerCase();
}

async function getPublicTables(
  client: Client,
): Promise<string[]> {
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

async function getTableColumns(
  client: Client,
  tableName: string,
): Promise<TableColumn[]> {
  const result = await client.query<TableColumn>(
    `
      SELECT
        column_name,
        ordinal_position,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
    `,
    [tableName],
  );

  return result.rows;
}

async function resolveTable(
  client: Client,
  candidates: readonly string[],
): Promise<string> {
  const tables = await getPublicTables(client);

  for (const candidate of candidates) {
    const match = tables.find(
      (table) =>
        normalizeColumn(table) === normalizeColumn(candidate),
    );

    if (match) {
      return match;
    }
  }

  throw new Error(
    `Target table not found. Tried: ${candidates.join(', ')}`,
  );
}

function validateCsvColumns(
  csvColumns: string[],
  tableColumns: TableColumn[],
  tableName: string,
) {
  const tableColumnMap = new Map(
    tableColumns.map((column) => [
      normalizeColumn(column.column_name),
      column,
    ]),
  );

  const missingColumns = csvColumns.filter(
    (column) =>
      !tableColumnMap.has(normalizeColumn(column)),
  );

  if (missingColumns.length > 0) {
    throw new Error(
      [
        `CSV/table mismatch for "${tableName}".`,
        '',
        `CSV columns not found in database table:`,
        ...missingColumns.map((column) => `  - ${column}`),
        '',
        'Import stopped intentionally.',
        'No automatic schema modification will be performed.',
      ].join('\n'),
    );
  }
}

function readCsv(
  filePath: string,
): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: CsvRow[] = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          bom: true,
          trim: true,
        }),
      )
      .on('data', (row: CsvRow) => {
        rows.push(row);
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function convertValue(
  value: string,
): string | null {
  const trimmed = value?.trim();

  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined'
  ) {
    return null;
  }

  // Date parsing for DD-MM-YYYY timestamps (e.g. CDR records)
  const dmy = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})(?:[\sT](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmy) {
    const day = dmy[1];
    const month = dmy[2];
    const year = dmy[3];
    const hour = dmy[4] || '00';
    const min = dmy[5] || '00';
    const sec = dmy[6] || '00';
    return `${year}-${month}-${day} ${hour}:${min}:${sec}+00`;
  }

  return trimmed;
}

async function insertBatch(
  client: Client,
  tableName: string,
  columns: string[],
  rows: CsvRow[],
) {
  if (rows.length === 0) {
    return;
  }

  const values: Array<string | null> = [];
  const placeholders: string[] = [];

  let parameterIndex = 1;

  for (const row of rows) {
    const rowPlaceholders: string[] = [];

    for (const column of columns) {
      values.push(convertValue(row[column]));

      rowPlaceholders.push(`$${parameterIndex}`);
      parameterIndex++;
    }

    placeholders.push(`(${rowPlaceholders.join(', ')})`);
  }

  const quotedColumns = columns
    .map(quoteIdentifier)
    .join(', ');

  const query = `
    INSERT INTO ${quoteIdentifier(tableName)}
      (${quotedColumns})
    VALUES
      ${placeholders.join(', ')}
  `;

  await client.query(query, values);
}

async function importDataset(
  client: Client,
  dataset: DatasetConfig,
): Promise<number> {
  const filePath = path.join(DATA_DIR, dataset.file);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Dataset file not found:\n${filePath}`,
    );
  }

  const tableName = await resolveTable(
    client,
    dataset.tableCandidates,
  );

  console.log(`\n→ ${dataset.file}`);
  console.log(`  Target table: ${tableName}`);

  const rows = await readCsv(filePath);

  if (rows.length === 0) {
    console.log('  ⚠ Dataset contains 0 rows.');
    return 0;
  }

  const csvColumns = Object.keys(rows[0]);

  const tableColumns = await getTableColumns(
    client,
    tableName,
  );

  validateCsvColumns(
    csvColumns,
    tableColumns,
    tableName,
  );

  /*
   * Preserve CSV column order.
   *
   * Database-generated columns are intentionally omitted.
   */
  const insertColumns = csvColumns.map((column) => {
    const databaseColumn = tableColumns.find(
      (tableColumn) =>
        normalizeColumn(tableColumn.column_name) ===
        normalizeColumn(column),
    );

    return databaseColumn!.column_name;
  });

  console.log(`  CSV rows: ${rows.length}`);
  console.log(
    `  Columns: ${insertColumns.length}`,
  );

  let imported = 0;

  for (
    let start = 0;
    start < rows.length;
    start += BATCH_SIZE
  ) {
    const batch = rows.slice(
      start,
      start + BATCH_SIZE,
    );

    await insertBatch(
      client,
      tableName,
      insertColumns.map((column) => {
        const originalColumn = csvColumns.find(
          (csvColumn) =>
            normalizeColumn(csvColumn) ===
            normalizeColumn(column),
        );

        return originalColumn ?? column;
      }),
      batch,
    );

    imported += batch.length;

    console.log(
      `  Imported ${imported}/${rows.length}`,
    );
  }

  const countResult = await client.query<{
    count: string;
  }>(
    `
      SELECT COUNT(*)::text AS count
      FROM ${quoteIdentifier(tableName)};
    `,
  );

  const databaseCount = Number(
    countResult.rows[0].count,
  );

  if (databaseCount !== rows.length) {
    throw new Error(
      [
        `Row-count validation failed for ${tableName}.`,
        `CSV rows       : ${rows.length}`,
        `Database rows  : ${databaseCount}`,
      ].join('\n'),
    );
  }

  console.log(
    `  ✓ Verified ${databaseCount} rows`,
  );

  return imported;
}

async function verifyDatabase(
  client: Client,
) {
  console.log('\n==========================================');
  console.log(' DATABASE VERIFICATION');
  console.log('==========================================\n');

  const tables = await getPublicTables(client);

  let totalRows = 0;

  for (const table of tables) {
    const result = await client.query<{
      count: string;
    }>(
      `
        SELECT COUNT(*)::text AS count
        FROM ${quoteIdentifier(table)};
      `,
    );

    const count = Number(result.rows[0].count);

    totalRows += count;

    console.log(
      `${table.padEnd(35)} ${String(count).padStart(8)}`,
    );
  }

  console.log('\n------------------------------------------');
  console.log(`Tables present : ${tables.length}`);
  console.log(`Total rows     : ${totalRows}`);
  console.log('------------------------------------------\n');
}

async function main() {
  if (
    !DATABASE_URL ||
    DATABASE_URL ===
      'PASTE_YOUR_NEONDB_CONNECTION_STRING_HERE'
  ) {
    throw new Error(
      '\n❌ Add your NeonDB connection string to DATABASE_URL first.\n',
    );
  }

  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(
      [
        `Original dataset directory does not exist:`,
        DATA_DIR,
        '',
        'Create the directory and place the original CSV files inside it.',
      ].join('\n'),
    );
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  console.log('\n==========================================');
  console.log(' SANDHAAN — ORIGINAL DATA IMPORT');
  console.log('==========================================');

  console.log('\n✓ Connected to NeonDB');
  console.log(`✓ Dataset directory: ${DATA_DIR}`);

  /*
   * Safety check:
   *
   * The database should have been cleaned before this
   * importer is executed.
   */
  const tables = await getPublicTables(client);

  if (tables.length === 0) {
    throw new Error(
      'No public tables found. Import aborted.',
    );
  }

  console.log(
    `✓ Existing tables detected: ${tables.length}`,
  );

  try {
    await client.query('BEGIN');
    await client.query('ALTER SEQUENCE IF EXISTS persons_record_seq RESTART WITH 1;');

    let totalImported = 0;

    for (const dataset of DATASETS) {
      totalImported += await importDataset(
        client,
        dataset,
      );
    }

    await client.query('COMMIT');

    console.log('\n==========================================');
    console.log(' IMPORT COMMITTED');
    console.log('==========================================');
    console.log(
      `Total imported rows: ${totalImported}`,
    );

    await verifyDatabase(client);

    console.log(
      '✓ Original dataset import completed successfully.',
    );
    console.log(
      '✓ No tables were created, dropped, or altered.',
    );
    console.log(
      '✓ Database is ready for Phase 3.',
    );
  } catch (error) {
    await client.query('ROLLBACK');

    console.error(
      '\n❌ IMPORT FAILED — TRANSACTION ROLLED BACK.',
    );
    console.error(error);

    throw error;
  } finally {
    await client.end();
  }
}

main().catch(() => {
  process.exit(1);
});
