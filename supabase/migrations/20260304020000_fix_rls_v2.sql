-- Force grant all permissions to anon for public form tables
GRANT ALL ON enquiries TO anon;
GRANT ALL ON contacts TO anon;
GRANT ALL ON newsletter TO anon;
GRANT ALL ON waitlist TO anon;

-- Drop and recreate with explicit role targeting
DROP POLICY IF EXISTS "Public can submit enquiries" ON enquiries;
DROP POLICY IF EXISTS "Public can submit contact forms" ON contacts;
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter;
DROP POLICY IF EXISTS "Public can join waitlist" ON waitlist;

CREATE POLICY "anon_insert_enquiries" ON enquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_insert_enquiries" ON enquiries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_insert_contacts" ON contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_newsletter" ON newsletter FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_insert_newsletter" ON newsletter FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_waitlist" ON waitlist FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_insert_waitlist" ON waitlist FOR INSERT TO authenticated WITH CHECK (true);