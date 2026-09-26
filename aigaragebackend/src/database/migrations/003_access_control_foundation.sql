-- SANDHAAN Access Control & Official Identity Lifecycle
-- Migration: 003_access_control_foundation.sql

-- 1. ACCESS REQUESTS (Asking for access)
CREATE TABLE IF NOT EXISTS access_requests (
    id SERIAL PRIMARY KEY,
    application_number VARCHAR(32) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    official_id VARCHAR(64) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    official_phone VARCHAR(32) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    rank VARCHAR(128),
    jurisdiction VARCHAR(255) NOT NULL,
    office_unit VARCHAR(255),
    supervisor_name VARCHAR(255) NOT NULL,
    supervisor_id VARCHAR(64) NOT NULL,
    purpose TEXT NOT NULL,
    authorization_document VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(64),
    review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_access_requests_app_num ON access_requests (application_number);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests (status);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests (official_email);

-- 2. USERS (Approved SANDHAAN Identities)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    official_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    rank VARCHAR(128),
    role VARCHAR(64) NOT NULL DEFAULT 'INVESTIGATOR',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_ACTIVATION',
    access_request_id INTEGER REFERENCES access_requests(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_official_id ON users (official_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- 3. USER CREDENTIALS (Hashed authentication credentials & lockout)
CREATE TABLE IF NOT EXISTS user_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    credential_status VARCHAR(32) NOT NULL DEFAULT 'TEMPORARY',
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials (user_id);

-- 4. ACCESS AUDIT LOGS (Security and administrative audit trail)
CREATE TABLE IF NOT EXISTS access_audit_logs (
    id SERIAL PRIMARY KEY,
    actor_user_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64),
    target_id VARCHAR(64),
    result VARCHAR(32) NOT NULL,
    ip_address VARCHAR(64),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON access_audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON access_audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON access_audit_logs (created_at);
