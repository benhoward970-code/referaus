-- ReferAus Provider Self-Service - Database Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS checks)

-- ============================================================
-- 1. ALTER existing providers table to add missing columns
-- ============================================================
ALTER TABLE providers ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS abn text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS brand_color text DEFAULT '#f97316';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS category text DEFAULT 'Daily Living';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS registration_ready boolean DEFAULT false;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create unique index on slug (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);

-- Backfill slug from name for existing rows that don't have one
UPDATE providers
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL AND name IS NOT NULL;

-- Backfill location from suburb if missing
UPDATE providers SET location = suburb WHERE location IS NULL AND suburb IS NOT NULL;

-- Backfill services from categories if missing
UPDATE providers SET services = categories WHERE (services IS NULL OR services = '{}') AND categories IS NOT NULL AND categories != '{}';

-- ============================================================
-- 2. Reviews table (create if not exists)
-- ============================================================
-- If reviews table already exists with different columns, this is safe
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS provider_slug text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_email text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS service_type text;

-- Backfill reviewer_name from author_name if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'author_name') THEN
    UPDATE reviews SET reviewer_name = author_name WHERE reviewer_name IS NULL AND author_name IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_provider_slug ON reviews(provider_slug);

-- ============================================================
-- 3. Enquiries table updates
-- ============================================================
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS provider_slug text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS service text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS read boolean DEFAULT false;

-- Backfill provider_slug from provider_name if available
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'provider_name') THEN
    UPDATE enquiries e SET provider_slug = (
      SELECT p.slug FROM providers p WHERE p.name = e.provider_name LIMIT 1
    ) WHERE e.provider_slug IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_enquiries_provider_slug ON enquiries(provider_slug);

-- ============================================================
-- 4. Provider images table
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('logo','cover','gallery')),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. Row Level Security
-- ============================================================
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_images ENABLE ROW LEVEL SECURITY;

-- Providers policies (drop and recreate to be safe)
DROP POLICY IF EXISTS "Providers are viewable by everyone" ON providers;
CREATE POLICY "Providers are viewable by everyone" ON providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Providers can be inserted by authenticated users" ON providers;
CREATE POLICY "Providers can be inserted by authenticated users" ON providers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can be updated by their owner" ON providers;
CREATE POLICY "Providers can be updated by their owner" ON providers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Reviews can be inserted by anyone" ON reviews;
CREATE POLICY "Reviews can be inserted by anyone" ON reviews FOR INSERT WITH CHECK (true);

-- Enquiries policies
DROP POLICY IF EXISTS "Enquiries can be inserted by anyone" ON enquiries;
CREATE POLICY "Enquiries can be inserted by anyone" ON enquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enquiries viewable by provider owner" ON enquiries;
CREATE POLICY "Enquiries viewable by provider owner" ON enquiries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM providers WHERE providers.slug = enquiries.provider_slug AND providers.user_id = auth.uid()));

DROP POLICY IF EXISTS "Enquiries updatable by provider owner" ON enquiries;
CREATE POLICY "Enquiries updatable by provider owner" ON enquiries FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM providers WHERE providers.slug = enquiries.provider_slug AND providers.user_id = auth.uid()));

-- Provider images policies
DROP POLICY IF EXISTS "Provider images are viewable by everyone" ON provider_images;
CREATE POLICY "Provider images are viewable by everyone" ON provider_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Provider images can be inserted by owner" ON provider_images;
CREATE POLICY "Provider images can be inserted by owner" ON provider_images FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM providers WHERE providers.id = provider_images.provider_id AND providers.user_id = auth.uid()));

DROP POLICY IF EXISTS "Provider images can be deleted by owner" ON provider_images;
CREATE POLICY "Provider images can be deleted by owner" ON provider_images FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM providers WHERE providers.id = provider_images.provider_id AND providers.user_id = auth.uid()));

-- ============================================================
-- 6. Triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS providers_updated_at ON providers;
CREATE TRIGGER providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_provider_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE providers SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE provider_slug = NEW.provider_slug), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE provider_slug = NEW.provider_slug)
  WHERE slug = NEW.provider_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_update_rating ON reviews;
CREATE TRIGGER reviews_update_rating AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- ============================================================
-- 7. Storage
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('provider-images', 'provider-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Provider images publicly accessible" ON storage.objects;
CREATE POLICY "Provider images publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'provider-images');

DROP POLICY IF EXISTS "Auth users can upload provider images" ON storage.objects;
CREATE POLICY "Auth users can upload provider images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'provider-images');

DROP POLICY IF EXISTS "Auth users can delete provider images" ON storage.objects;
CREATE POLICY "Auth users can delete provider images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'provider-images');

-- ============================================================
-- 8. Stripe billing columns (safe to run multiple times)
-- ============================================================
ALTER TABLE providers ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

CREATE INDEX IF NOT EXISTS idx_providers_stripe_customer ON providers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_providers_email ON providers(email);
