-- Fix: Create proper unique CONSTRAINT instead of just INDEX
-- The upsert needs a constraint, not just an index

-- Step 1: Ensure user_id column exists
ALTER TABLE providers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Drop the old index if it exists
DROP INDEX IF EXISTS idx_providers_user_id_unique;

-- Step 3: Drop old constraint if it exists
ALTER TABLE providers DROP CONSTRAINT IF EXISTS providers_user_id_unique;

-- Step 4: Add unique constraint on user_id (this is what the upsert needs)
ALTER TABLE providers ADD CONSTRAINT providers_user_id_unique UNIQUE (user_id);
