-- SANDHAAN Criminal Network Intelligence Platform
-- Initial Schema Migration: 001_initial_schema.sql
-- 16 canonical law-enforcement tables with production indexes

DROP TABLE IF EXISTS persons_ground_truth CASCADE;
DROP TABLE IF EXISTS entity_mentions CASCADE;
DROP TABLE IF EXISTS evidence_links CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS location_events CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS cdr_records CASCADE;
DROP TABLE IF EXISTS case_entities CASCADE;
DROP TABLE IF EXISTS fir_narratives CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS phones CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS cell_towers CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS persons CASCADE;

CREATE SEQUENCE IF NOT EXISTS persons_record_seq START 1;

-- 1. PERSONS MASTER
CREATE TABLE IF NOT EXISTS persons (
  record_id VARCHAR(32) PRIMARY KEY DEFAULT ('R' || LPAD(nextval('persons_record_seq')::text, 6, '0')),
  person_id VARCHAR(32) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  alias_name VARCHAR(255),
  gender VARCHAR(32),
  date_of_birth DATE,
  age INT,
  nationality VARCHAR(64),
  occupation VARCHAR(128),
  address TEXT,
  city VARCHAR(128),
  district VARCHAR(128),
  state VARCHAR(128),
  pincode VARCHAR(32),
  email VARCHAR(255),
  person_status VARCHAR(64),
  known_since DATE,
  source_system VARCHAR(128),
  record_confidence NUMERIC(5, 4),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_persons_person_id ON persons (person_id);
CREATE INDEX IF NOT EXISTS idx_persons_full_name ON persons (full_name);
CREATE INDEX IF NOT EXISTS idx_persons_city ON persons (city);
CREATE INDEX IF NOT EXISTS idx_persons_status ON persons (person_status);

-- 2. LOCATIONS MASTER
CREATE TABLE IF NOT EXISTS locations (
  location_id VARCHAR(32) PRIMARY KEY,
  location_name VARCHAR(255) NOT NULL,
  location_type VARCHAR(128),
  address TEXT,
  area VARCHAR(128),
  city VARCHAR(128),
  district VARCHAR(128),
  state VARCHAR(128),
  pincode VARCHAR(32),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  sensitivity_level VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_locations_name ON locations (location_name);
CREATE INDEX IF NOT EXISTS idx_locations_city_area ON locations (city, area);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations (latitude, longitude);

-- 3. CELL TOWERS
CREATE TABLE IF NOT EXISTS cell_towers (
  cell_tower_id VARCHAR(32) PRIMARY KEY,
  tower_name VARCHAR(255) NOT NULL,
  coverage_area VARCHAR(128),
  location_id VARCHAR(32),
  location_name VARCHAR(255),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  city VARCHAR(128),
  district VARCHAR(128),
  state VARCHAR(128),
  pincode VARCHAR(32),
  location_mapping_method VARCHAR(128),
  mapping_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_cell_towers_location_id ON cell_towers (location_id);

-- 4. CASES MASTER
CREATE TABLE IF NOT EXISTS cases (
  case_id VARCHAR(32) PRIMARY KEY,
  fir_number VARCHAR(128) NOT NULL,
  case_type VARCHAR(64),
  crime_category VARCHAR(128),
  crime_subcategory VARCHAR(128),
  ipc_section VARCHAR(128),
  registration_date DATE,
  incident_date DATE,
  incident_time TIME,
  police_station_id VARCHAR(64),
  district VARCHAR(128),
  city VARCHAR(128),
  state VARCHAR(128),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  case_status VARCHAR(64),
  severity VARCHAR(64),
  investigating_officer_id VARCHAR(64),
  source VARCHAR(128),
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_cases_fir_number ON cases (fir_number);
CREATE INDEX IF NOT EXISTS idx_cases_severity ON cases (severity);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (case_status);
CREATE INDEX IF NOT EXISTS idx_cases_incident_date ON cases (incident_date);

-- 5. PHONES
CREATE TABLE IF NOT EXISTS phones (
  phone_id VARCHAR(32) PRIMARY KEY,
  phone_number VARCHAR(32) NOT NULL,
  country_code VARCHAR(16),
  carrier VARCHAR(64),
  circle VARCHAR(128),
  activation_date DATE,
  deactivation_date DATE,
  phone_status VARCHAR(64),
  registered_person_id VARCHAR(32),
  source VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_phones_number ON phones (phone_number);
CREATE INDEX IF NOT EXISTS idx_phones_registered_person ON phones (registered_person_id);

-- 6. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id VARCHAR(32) PRIMARY KEY,
  registration_number VARCHAR(32) NOT NULL,
  vehicle_type VARCHAR(64),
  make VARCHAR(64),
  model VARCHAR(64),
  color VARCHAR(64),
  registration_date DATE,
  registered_owner_id VARCHAR(32),
  current_owner_id VARCHAR(32),
  status VARCHAR(64),
  insurance_status VARCHAR(64),
  source VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_vehicles_reg_number ON vehicles (registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_registered_owner ON vehicles (registered_owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_current_owner ON vehicles (current_owner_id);

-- 7. BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS bank_accounts (
  account_id VARCHAR(32) PRIMARY KEY,
  account_number_masked VARCHAR(64) NOT NULL,
  bank_name VARCHAR(128),
  branch_id VARCHAR(64),
  account_type VARCHAR(64),
  holder_person_id VARCHAR(32),
  opening_date DATE,
  closing_date DATE,
  account_status VARCHAR(64),
  kyc_status VARCHAR(64),
  city VARCHAR(128),
  risk_flag BOOLEAN DEFAULT FALSE,
  source VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_number ON bank_accounts (account_number_masked);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_holder ON bank_accounts (holder_person_id);

-- 8. FIR NARRATIVES / DOCUMENTS
CREATE TABLE IF NOT EXISTS fir_narratives (
  document_id VARCHAR(32) PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  document_type VARCHAR(64),
  document_date DATE,
  language VARCHAR(32),
  narrative_text TEXT,
  source_officer VARCHAR(64),
  document_status VARCHAR(64),
  text_quality NUMERIC(5, 4)
);

CREATE INDEX IF NOT EXISTS idx_fir_narratives_case_id ON fir_narratives (case_id);

-- 9. CASE ENTITIES (Investigation Relationships)
CREATE TABLE IF NOT EXISTS case_entities (
  relationship_id VARCHAR(32) PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  source_entity_id VARCHAR(64) NOT NULL,
  source_entity_type VARCHAR(64) NOT NULL,
  relationship_type VARCHAR(64) NOT NULL,
  target_entity_id VARCHAR(64) NOT NULL,
  target_entity_type VARCHAR(64) NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  confidence NUMERIC(5, 4),
  source_document_id VARCHAR(64),
  verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_case_entities_case_id ON case_entities (case_id);
CREATE INDEX IF NOT EXISTS idx_case_entities_source ON case_entities (source_entity_id, source_entity_type);
CREATE INDEX IF NOT EXISTS idx_case_entities_target ON case_entities (target_entity_id, target_entity_type);
CREATE INDEX IF NOT EXISTS idx_case_entities_rel_type ON case_entities (relationship_type);

-- 10. CDR RECORDS (Call Detail Records)
CREATE TABLE IF NOT EXISTS cdr_records (
  cdr_id VARCHAR(32) PRIMARY KEY,
  caller_phone_id VARCHAR(32) NOT NULL,
  receiver_phone_id VARCHAR(32) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  duration_seconds INT DEFAULT 0,
  call_type VARCHAR(64),
  call_status VARCHAR(64),
  cell_tower_id VARCHAR(32),
  location_id VARCHAR(64),
  direction VARCHAR(32),
  source_system VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_cdr_caller ON cdr_records (caller_phone_id);
CREATE INDEX IF NOT EXISTS idx_cdr_receiver ON cdr_records (receiver_phone_id);
CREATE INDEX IF NOT EXISTS idx_cdr_timestamp ON cdr_records (timestamp);

-- 11. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id VARCHAR(32) PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  sender_account_id VARCHAR(32) NOT NULL,
  receiver_account_id VARCHAR(32) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  currency VARCHAR(16) DEFAULT 'INR',
  transaction_type VARCHAR(64),
  channel VARCHAR(64),
  merchant_id VARCHAR(64),
  location_id VARCHAR(64),
  reference_number VARCHAR(128),
  status VARCHAR(64),
  description TEXT,
  source VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_tx_sender ON transactions (sender_account_id);
CREATE INDEX IF NOT EXISTS idx_tx_receiver ON transactions (receiver_account_id);
CREATE INDEX IF NOT EXISTS idx_tx_timestamp ON transactions (timestamp);

-- 12. LOCATION EVENTS
CREATE TABLE IF NOT EXISTS location_events (
  event_id VARCHAR(32) PRIMARY KEY,
  entity_id VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  location_id VARCHAR(64) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  event_type VARCHAR(64),
  duration_minutes INT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  source VARCHAR(128),
  confidence NUMERIC(5, 4)
);

CREATE INDEX IF NOT EXISTS idx_loc_events_entity ON location_events (entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_loc_events_location ON location_events (location_id);
CREATE INDEX IF NOT EXISTS idx_loc_events_timestamp ON location_events (timestamp);

-- 13. EVIDENCE MASTER
CREATE TABLE IF NOT EXISTS evidence (
  evidence_id VARCHAR(32) PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  evidence_type VARCHAR(64),
  file_name VARCHAR(255),
  file_path TEXT,
  source VARCHAR(128),
  collected_by VARCHAR(64),
  collection_timestamp TIMESTAMPTZ,
  original_hash_sha256 VARCHAR(128),
  current_hash_sha256 VARCHAR(128),
  integrity_status VARCHAR(64),
  chain_of_custody_id VARCHAR(64),
  access_level VARCHAR(64),
  created_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence (case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence (evidence_type);

-- 14. EVIDENCE LINKS
CREATE TABLE IF NOT EXISTS evidence_links (
  evidence_link_id VARCHAR(32) PRIMARY KEY,
  evidence_id VARCHAR(32) NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
  case_id VARCHAR(32) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  target_type VARCHAR(64) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  relationship VARCHAR(64) NOT NULL,
  confidence NUMERIC(5, 4),
  source VARCHAR(128),
  timestamp TIMESTAMPTZ,
  evidence_type VARCHAR(64),
  chain_of_custody_id VARCHAR(64),
  integrity_status VARCHAR(64),
  original_hash_sha256 VARCHAR(128),
  current_hash_sha256 VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_ev_links_evidence_id ON evidence_links (evidence_id);
CREATE INDEX IF NOT EXISTS idx_ev_links_case_id ON evidence_links (case_id);
CREATE INDEX IF NOT EXISTS idx_ev_links_target ON evidence_links (target_id, target_type);

-- 15. ENTITY MENTIONS (NLP Extractions)
CREATE TABLE IF NOT EXISTS entity_mentions (
  mention_id VARCHAR(32) PRIMARY KEY,
  document_id VARCHAR(32) NOT NULL REFERENCES fir_narratives(document_id) ON DELETE CASCADE,
  case_id VARCHAR(32) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  text_span TEXT,
  start_char INT,
  end_char INT,
  entity_type VARCHAR(64),
  extracted_value TEXT,
  resolved_entity_id VARCHAR(64),
  confidence NUMERIC(5, 4),
  resolution_status VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_mentions_doc_case ON entity_mentions (document_id, case_id);
CREATE INDEX IF NOT EXISTS idx_mentions_resolved ON entity_mentions (resolved_entity_id);

-- 16. PERSONS GROUND TRUTH (Evaluation Benchmark)
CREATE TABLE IF NOT EXISTS persons_ground_truth (
  record_id VARCHAR(32) PRIMARY KEY REFERENCES persons(record_id) ON DELETE CASCADE,
  person_id VARCHAR(32) NOT NULL,
  entity_id VARCHAR(32) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gt_person ON persons_ground_truth (person_id);
CREATE INDEX IF NOT EXISTS idx_gt_entity ON persons_ground_truth (entity_id);
