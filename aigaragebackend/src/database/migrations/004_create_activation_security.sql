-- SANDHAAN AUTH-04
-- First-time investigator account activation.

ALTER TABLE investigators
  ADD COLUMN IF NOT EXISTS must_activate BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS activation_code_hash VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS activation_code_expires_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS activation_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activation_locked_until TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_investigators_activation_expiry
  ON investigators(activation_code_expires_at)
  WHERE activation_code_expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_investigators_activation_lock
  ON investigators(activation_locked_until)
  WHERE activation_locked_until IS NOT NULL;
