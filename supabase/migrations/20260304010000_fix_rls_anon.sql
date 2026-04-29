DROP POLICY IF EXISTS "Anyone can submit enquiries" ON enquiries;
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contacts;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter;
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter;
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Auth users can read enquiries" ON enquiries;
DROP POLICY IF EXISTS "Auth users can read contacts" ON contacts;

CREATE POLICY "Public can submit enquiries" ON enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can submit contact forms" ON contacts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can subscribe to newsletter" ON newsletter FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can join waitlist" ON waitlist FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read enquiries" ON enquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read contacts" ON contacts FOR SELECT TO authenticated USING (true);

GRANT INSERT ON enquiries TO anon;
GRANT INSERT ON contacts TO anon;
GRANT INSERT ON newsletter TO anon;
GRANT INSERT ON waitlist TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;