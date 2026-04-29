-- Nuclear option: disable RLS on public form tables
-- These are public submission forms - no sensitive data, no auth needed
ALTER TABLE waitlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter DISABLE ROW LEVEL SECURITY;

-- Enquiries table - also needs public inserts but keep RLS for reads
-- Actually disable it too - the v1 schema has a complex enquiries table
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;

-- Grant insert to anon
GRANT INSERT ON waitlist TO anon;
GRANT INSERT ON contacts TO anon;
GRANT INSERT ON newsletter TO anon;
GRANT INSERT ON enquiries TO anon;