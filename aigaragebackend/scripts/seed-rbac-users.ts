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

async function seedRbacUsers() {
  console.log('[INFO] Seeding RBAC users (supervisor & analyst) into NeonDB...');
  const client = await pool.connect();
  try {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('Sandhaan@2026', saltRounds);

    const users = [
      {
        investigatorId: 'SUP-2026-001',
        fullName: 'Intelligence Supervisor',
        email: 'supervisor@sandhaan.local',
        role: 'supervisor',
        clearanceLevel: 'Level 4 - Top Secret',
      },
      {
        investigatorId: 'ANA-2026-001',
        fullName: 'Network Analyst',
        email: 'analyst@sandhaan.local',
        role: 'analyst',
        clearanceLevel: 'Level 2 - Confidential',
      },
    ];

    for (const u of users) {
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
        VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())
        ON CONFLICT (investigator_id)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          clearance_level = EXCLUDED.clearance_level,
          status = 'active',
          updated_at = NOW();
      `;

      await client.query(query, [
        u.investigatorId,
        u.fullName,
        u.email,
        passwordHash,
        u.role,
        u.clearanceLevel,
      ]);
      console.log(`[SUCCESS] Seeded ${u.investigatorId} (${u.role})`);
    }
  } catch (err: any) {
    console.error('[ERROR] Seeding RBAC users failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedRbacUsers().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
