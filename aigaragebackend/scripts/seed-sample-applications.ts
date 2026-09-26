import '../src/database/dns-patch';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sampleApplications = [
  {
    application_number: 'SAR-2026-104921',
    full_name: 'Ananya Deshmukh',
    official_id: 'NIA-MUM-2041',
    official_email: 'a.deshmukh@nia.gov.in',
    official_phone: '+91 98201 11223',
    organization: 'National Investigation Agency (NIA)',
    department: 'Counter-Terrorism & Organized Crime Division',
    designation: 'Senior Cyber Forensic Analyst',
    rank: 'Level 2 - Senior Investigator',
    jurisdiction: 'Western Zone (Maharashtra & Gujarat)',
    office_unit: 'Special Tactical Cell, Mumbai HQ',
    supervisor_name: 'Dr. Alok Verma (IGP, NIA)',
    supervisor_id: 'NIA-HQ-0082',
    purpose: 'Special network intelligence analysis and CDR linkage correlation for cross-border Hawala financing syndicate investigation (Case: RC-04/2026/NIA/MUM).',
    status: 'PENDING',
  },
  {
    application_number: 'SAR-2026-382914',
    full_name: 'Kavita Sundaram',
    official_id: 'IB-DEL-5519',
    official_email: 'k.sundaram@mha.gov.in',
    official_phone: '+91 98110 44556',
    organization: 'Intelligence Bureau (IB)',
    department: 'Cyber Threat Analysis Wing',
    designation: 'Joint Assistant Director',
    rank: 'Level 3 - Supervisory / Command',
    jurisdiction: 'National Capital Region & Northern Sector',
    office_unit: 'Operations Control Center, New Delhi',
    supervisor_name: 'S. K. Nambiar (Additional Director)',
    supervisor_id: 'IB-HQ-0014',
    purpose: 'Strategic threat telemetry cross-referencing and darknet illicit narcotics cartel tracking across inter-state transit corridors.',
    status: 'UNDER_REVIEW',
  },
  {
    application_number: 'SAR-2026-728190',
    full_name: 'Mohammed Tariq Khan',
    official_id: 'ED-KOL-3312',
    official_email: 'm.khan@ed.gov.in',
    official_phone: '+91 98300 88990',
    organization: 'Enforcement Directorate (ED)',
    department: 'Special Financial Intelligence Unit',
    designation: 'Assistant Enforcement Officer',
    rank: 'Level 1 - Field Officer',
    jurisdiction: 'Eastern Region (West Bengal & Odisha)',
    office_unit: 'Kolkata Zonal Office II',
    supervisor_name: 'Debashis Roy (Joint Director, ED)',
    supervisor_id: 'ED-HQ-0099',
    purpose: 'Cross-border shell entity tracing and trade-based money laundering transaction matrix analysis.',
    status: 'PENDING',
  },
  {
    application_number: 'SAR-2026-619284',
    full_name: 'Harpreet Singh Sandhu',
    official_id: 'PB-INT-4091',
    official_email: 'h.sandhu@punjabpolice.gov.in',
    official_phone: '+91 98760 12345',
    organization: 'State Police Department',
    department: 'Organized Crime Control Unit (OCCU)',
    designation: 'Inspector of Police',
    rank: 'Level 1 - Field Officer',
    jurisdiction: 'Punjab State (Border Range)',
    office_unit: 'Cyber Cell, Amritsar Commissionerate',
    supervisor_name: 'SSP Gurpreet Singh',
    supervisor_id: 'PB-POL-0031',
    purpose: 'Trans-border drone weapon drop logistics network and cross-SIM telecommunication pattern mapping.',
    status: 'MORE_INFORMATION_REQUIRED',
    review_notes: 'Supervisory order verification pending from Director General of Police office.',
  },
];

async function seedApplications() {
  const client = await pool.connect();
  try {
    console.log('[INFO] Seeding sample applications into access_requests...');
    for (const app of sampleApplications) {
      await client.query(`
        INSERT INTO access_requests (
          application_number, full_name, official_id, official_email, official_phone,
          organization, department, designation, rank, jurisdiction, office_unit,
          supervisor_name, supervisor_id, purpose, status, review_notes, submitted_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW() - INTERVAL '2 hours', NOW())
        ON CONFLICT (application_number)
        DO NOTHING;
      `, [
        app.application_number,
        app.full_name,
        app.official_id,
        app.official_email,
        app.official_phone,
        app.organization,
        app.department,
        app.designation,
        app.rank,
        app.jurisdiction,
        app.office_unit,
        app.supervisor_name,
        app.supervisor_id,
        app.purpose,
        app.status,
        app.review_notes || null,
      ]);
    }
    console.log('[SUCCESS] Sample applications seeded successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

seedApplications().catch(console.error);
