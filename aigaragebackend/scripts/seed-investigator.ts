import '../src/database/dns-patch';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

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

async function seedInvestigator() {
  console.log('[INFO] Seeding development investigator into NeonDB...');
  const client = await pool.connect();
  try {
    const investigatorId = 'INV-2026-081';
    const fullName = 'Development Investigator';
    const email = 'investigator@sandhaan.local';
    const rawPassword = 'Sandhaan@2026';
    const role = 'investigator';
    const clearanceLevel = 'Level 3 - Secret';
    const status = 'active';

    console.log('[INFO] Hashing password with bcrypt (salt rounds: 12)...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

    console.log('[INFO] Inserting/updating investigator record...');
    const query = `
      INSERT INTO investigators (
        investigator_id,
        full_name,
        email,
        password_hash,
        role,
        clearance_level,
        status,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (investigator_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        clearance_level = EXCLUDED.clearance_level,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING id, investigator_id, full_name, email, role, clearance_level, status, created_at, updated_at;
    `;

    const res = await client.query(query, [
      investigatorId,
      fullName,
      email,
      passwordHash,
      role,
      clearanceLevel,
      status,
    ]);

    const record = res.rows[0];
    console.log('[SUCCESS] Development investigator seeded successfully:');
    console.log(`  ID: ${record.id}`);
    console.log(`  Investigator ID: ${record.investigator_id}`);
    console.log(`  Full Name: ${record.full_name}`);
    console.log(`  Email: ${record.email}`);
    console.log(`  Role: ${record.role}`);
    console.log(`  Clearance: ${record.clearance_level}`);
    console.log(`  Status: ${record.status}`);
    console.log(`  Created At: ${record.created_at}`);

    // Verify password verification with bcrypt
    const match = await bcrypt.compare(rawPassword, passwordHash);
    console.log(`[INFO] Password hash verification test: ${match ? 'PASSED ✅' : 'FAILED ❌'}`);

  } catch (err: any) {
    console.error('[ERROR] Seeding investigator failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedInvestigator().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
