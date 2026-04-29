-- Fix missing user_id column in providers table
-- This migration resolves the issue where provider registration API
-- calls were failing with "no unique or exclusion constraint matching the ON CONFLICT specification"

-- Add the user_id column if it doesn't exist
ALTER TABLE providers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a unique index on user_id for providers (one provider per user, nullable)
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_user_id_unique ON providers(user_id) WHERE user_id IS NOT NULL;

-- This allows the upsert in the API to work correctly
