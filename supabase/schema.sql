-- Muqim Caterers — Supabase schema
-- Run in Supabase SQL editor. Nested operational data (menu items, receipts,
-- expenses, logistics, procurement) is stored as jsonb to match the app's
-- existing state shape — normalize into child tables when scale demands it.

create extension if not exists "pgcrypto";

-- ─── Customers ──────────────────────────────────────────────────────────────
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

-- ─── Packages (storefront + admin) ──────────────────────────────────────────
create table if not exists packages (
  id text primary key,                  -- 'pkg-normal' etc.
  name text not null,
  badge text,
  tier int,
  tagline text,
  category text,
  price_per_head int,
  min_guests int,
  serves_note text,
  gradient text,
  tags jsonb not null default '[]',
  items jsonb not null default '[]',
  active boolean not null default true
);

-- ─── Vendors ────────────────────────────────────────────────────────────────
create table if not exists vendors (
  id text primary key,
  name text not null,
  category text,
  sub text,
  phone text,
  items text,
  balance int not null default 0
);
alter table vendors add column if not exists sub text;

-- ─── Staff ──────────────────────────────────────────────────────────────────
create table if not exists staff (
  id text primary key,
  name text not null,
  role text,
  perm_role text,                        -- owner|sales|coordinator|chef|procurement|service|accounts
  phone text
);

-- ─── Bookings (the event file) ──────────────────────────────────────────────
create table if not exists bookings (
  id text primary key,
  ref text unique not null,             -- 'MQ-2481'
  status text not null default 'inquiry',
  customer jsonb not null,              -- {name, phone, email}
  event_type text,
  catering_type text default 'full',    -- full | semi | service
  event_date timestamptz,
  guests int,
  pax jsonb default '{}',               -- {veg, nonVeg}
  venue text,
  package_id text references packages(id),
  amount bigint,
  notes jsonb not null default '[]',
  staff_ids jsonb not null default '[]',
  status_history jsonb not null default '[]',
  receipts jsonb not null default '[]',
  expenses jsonb not null default '[]',
  menu_items jsonb not null default '[]',
  logistics jsonb not null default '[]',
  procurement jsonb,
  extra jsonb,                            -- tasks, leadStatus, source, estimate, closing, versions
  created_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on bookings(status);
create index if not exists bookings_event_date_idx on bookings(event_date);

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Founder signs in via Supabase Auth (email+password). Staff-only tables are
-- readable by authenticated users only. Bookings allows anonymous INSERT so
-- the public booking form works without a login — reads/writes stay gated.

alter table customers enable row level security;
alter table packages enable row level security;
alter table vendors enable row level security;
alter table staff enable row level security;
alter table bookings enable row level security;

create policy "authenticated full access" on customers
  for all to authenticated using (true) with check (true);
create policy "authenticated full access" on vendors
  for all to authenticated using (true) with check (true);
create policy "authenticated full access" on staff
  for all to authenticated using (true) with check (true);

create policy "packages readable by everyone" on packages
  for select to anon, authenticated using (active = true);
create policy "packages writable by staff" on packages
  for all to authenticated using (true) with check (true);

create policy "anyone can create a booking inquiry" on bookings
  for insert to anon, authenticated with check (status = 'inquiry');
create policy "staff can read bookings" on bookings
  for select to authenticated using (true);
create policy "staff can update bookings" on bookings
  for update to authenticated using (true) with check (true);
create policy "public can read own booking by ref" on bookings
  for select to anon using (false); -- ref lookups go through an RPC below

-- Public status lookup by reference code (no auth, returns minimal fields).
create or replace function booking_status_by_ref(p_ref text)
returns table(ref text, status text, event_type text, event_date timestamptz,
              guests int, venue text, amount bigint, package_id text, pax jsonb)
language sql security definer stable as $$
  select ref, status, event_type, event_date, guests, venue, amount, package_id, pax
  from bookings where ref = upper(p_ref);
$$;
