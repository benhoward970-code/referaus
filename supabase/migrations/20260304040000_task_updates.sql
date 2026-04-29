CREATE TABLE IF NOT EXISTS task_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id TEXT NOT NULL,
  task_text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE task_updates DISABLE ROW LEVEL SECURITY;
GRANT INSERT ON task_updates TO anon;
GRANT SELECT ON task_updates TO anon;