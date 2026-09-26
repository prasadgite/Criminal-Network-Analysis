-- SANDHAAN Authentication Foundation: Investigator table
-- Migration: 002_create_investigators.sql

CREATE TABLE IF NOT EXISTS investigators (
    id SERIAL PRIMARY KEY,
    investigator_id VARCHAR(64) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'investigator',
    clearance_level VARCHAR(64) NOT NULL DEFAULT 'Level 2 - Confidential',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_investigators_investigator_id ON investigators (investigator_id);
CREATE INDEX IF NOT EXISTS idx_investigators_email ON investigators (email);
