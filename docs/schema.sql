-- Athlone Anglers app — Supabase schema.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  membership_type text,
  paid_until date,
  created_at timestamptz not null default now()
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  location text
);

create table if not exists waters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  permit_info text
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  competition_name text not null,
  event_date date not null,
  angler_name text not null,
  weight_kg numeric,
  position int
);

-- Row Level Security: anyone can read (public site), only logged-in
-- committee members (Supabase Auth users) can write.
alter table members enable row level security;
alter table news enable row level security;
alter table events enable row level security;
alter table waters enable row level security;
alter table results enable row level security;

-- Members contain personal data (email), so unlike the other tables
-- they are NOT publicly readable — committee only.
create policy "Committee only" on members for all using (auth.role() = 'authenticated');

create policy "Public read" on news for select using (true);
create policy "Public read" on events for select using (true);
create policy "Public read" on waters for select using (true);
create policy "Public read" on results for select using (true);

create policy "Committee write" on news for insert with check (auth.role() = 'authenticated');
create policy "Committee update" on news for update using (auth.role() = 'authenticated');
create policy "Committee delete" on news for delete using (auth.role() = 'authenticated');

create policy "Committee write" on events for insert with check (auth.role() = 'authenticated');
create policy "Committee update" on events for update using (auth.role() = 'authenticated');
create policy "Committee delete" on events for delete using (auth.role() = 'authenticated');

create policy "Committee write" on waters for insert with check (auth.role() = 'authenticated');
create policy "Committee update" on waters for update using (auth.role() = 'authenticated');
create policy "Committee delete" on waters for delete using (auth.role() = 'authenticated');

create policy "Committee write" on results for insert with check (auth.role() = 'authenticated');
create policy "Committee update" on results for update using (auth.role() = 'authenticated');
create policy "Committee delete" on results for delete using (auth.role() = 'authenticated');
