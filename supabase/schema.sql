-- ReferAus Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Providers table
create table if not exists providers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  email text,
  phone text,
  abn text,
  ndis_number text,
  services text[] default '{}',
  suburb text,
  state text,
  postcode text,
  description text,
  logo_url text,
  verified boolean default false,
  plan text default 'free',
  created_at timestamptz default now()
);

-- Enquiries table
create table if not exists enquiries (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references providers(id) on delete set null,
  participant_name text not null,
  participant_email text not null,
  message text not null,
  created_at timestamptz default now(),
  status text default 'open'
);

-- Waitlist table
create table if not exists waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  provider_type text,
  created_at timestamptz default now()
);

-- Reviews table
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references providers(id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  approved boolean default false
);

-- Row Level Security
alter table providers enable row level security;
alter table enquiries enable row level security;
alter table waitlist enable row level security;
alter table reviews enable row level security;

-- Public can read verified providers
create policy "Public read verified providers" on providers
  for select using (verified = true);

-- Public can insert to waitlist
create policy "Public insert waitlist" on waitlist
  for insert with check (true);

-- Public can insert enquiries
create policy "Public insert enquiries" on enquiries
  for insert with check (true);

-- Public can read approved reviews
create policy "Public read approved reviews" on reviews
  for select using (approved = true);

-- Indexes
create index if not exists providers_slug_idx on providers(slug);
create index if not exists providers_state_idx on providers(state);
create index if not exists providers_email_idx on providers(email);
create index if not exists providers_user_id_idx on providers(user_id);
create index if not exists enquiries_provider_id_idx on enquiries(provider_id);
create index if not exists enquiries_provider_slug_idx on enquiries(provider_slug);
create index if not exists reviews_provider_id_idx on reviews(provider_id);
create index if not exists reviews_provider_slug_idx on reviews(provider_slug);

-- RLS: authenticated users can update/delete their own provider record
create policy "Users can update own provider" on providers
  for update using (auth.uid() = user_id);

create policy "Users can delete own provider" on providers
  for delete using (auth.uid() = user_id);

-- RLS: authenticated users can read all their own provider records (including unverified)
create policy "Users can read own provider" on providers
  for select using (auth.uid() = user_id);

-- RLS: authenticated users can update enquiries for their own providers
create policy "Providers can update own enquiries" on enquiries
  for update using (
    exists (
      select 1 from providers
      where providers.slug = enquiries.provider_slug
      and providers.user_id = auth.uid()
    )
  );
