-- Athlone Anglers app — Supabase schema.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: every statement is idempotent (if not exists / or replace).

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
alter table news add column if not exists image_url text;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  location text
);
alter table events add column if not exists finish_location text;
alter table events add column if not exists presentation_location text;
alter table events add column if not exists image_url text;

-- Legacy standalone "competitions" concept — superseded by events.format
-- below (every event can now carry results directly, so the committee
-- manages one thing - Events - instead of two overlapping ones). Table kept
-- so nothing breaks for anyone still pointing at it; new code never writes
-- to it.
create table if not exists competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  sponsor_name text,
  sponsor_logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists competition_photos (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);
alter table competition_photos alter column competition_id drop not null;
alter table competition_photos add column if not exists event_id uuid references events(id) on delete cascade;

-- Fishing format per event - also doubles as "is this event a competition
-- with results" marker; shown as a trout/pike icon on the public Events
-- list. One format per event (not combinable) - the admin form says so.
alter table events add column if not exists format text
  check (format in ('trout', 'pike', 'catch_release', 'all_purpose', 'fly_dapping'));
alter table events add column if not exists sponsor_name text;
alter table events add column if not exists sponsor_logo_url text;

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  competition_name text not null,
  event_date date not null,
  angler_name text not null,
  weight_kg numeric,
  position int
);
alter table results add column if not exists competition_id uuid references competitions(id) on delete set null;
alter table results add column if not exists event_id uuid references events(id) on delete set null;
alter table results add column if not exists species text check (species in ('trout', 'pike', 'other'));
alter table results add column if not exists measurement_type text check (measurement_type in ('weight_lb', 'length_cm'));
alter table results add column if not exists measurement_value numeric;
alter table results add column if not exists points numeric;
-- Results start pending and only count publicly (leaderboards, archive)
-- once a committee member approves them - "review before approving".
alter table results add column if not exists status text not null default 'pending'
  check (status in ('pending', 'approved'));

-- Single-row site-wide settings - currently just the "final results
-- published" flag the committee flips manually at season end (no hard-coded
-- date, per the brief).
create table if not exists site_settings (
  id int primary key default 1,
  final_results_published boolean not null default false,
  season_year int,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Reusable write-ups for news/events (e.g. "Standard Saturday competition":
-- start 10:30, weigh-in 5pm, presentation in the pub) - picked from a
-- dropdown on the News/Events add-form to prefill it. Never shown publicly,
-- so committee-only like members, not public-read like the content tables.
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('event', 'news')),
  name text not null,
  title text,
  body text,
  location text,
  finish_location text,
  presentation_location text,
  created_at timestamptz not null default now()
);

-- Row Level Security: anyone can read (public site), only logged-in
-- committee members (Supabase Auth users) can write.
alter table members enable row level security;
alter table news enable row level security;
alter table events enable row level security;
alter table results enable row level security;
alter table competitions enable row level security;
alter table competition_photos enable row level security;
alter table rules enable row level security;
alter table templates enable row level security;
alter table site_settings enable row level security;

drop policy if exists "Public read" on site_settings;
create policy "Public read" on site_settings for select using (true);
drop policy if exists "Committee write" on site_settings;
create policy "Committee write" on site_settings for update using (auth.role() = 'authenticated');

-- Members contain personal data (email), so unlike the other tables
-- they are NOT publicly readable — committee only. Templates are also
-- committee-only (just an authoring aid, never shown publicly).
drop policy if exists "Committee only" on members;
create policy "Committee only" on members for all using (auth.role() = 'authenticated');
drop policy if exists "Committee only" on templates;
create policy "Committee only" on templates for all using (auth.role() = 'authenticated');

drop policy if exists "Public read" on news;
create policy "Public read" on news for select using (true);
drop policy if exists "Public read" on events;
create policy "Public read" on events for select using (true);
drop policy if exists "Public read" on results;
create policy "Public read" on results for select using (true);
drop policy if exists "Public read" on competitions;
create policy "Public read" on competitions for select using (true);
drop policy if exists "Public read" on competition_photos;
create policy "Public read" on competition_photos for select using (true);
drop policy if exists "Public read" on rules;
create policy "Public read" on rules for select using (true);

drop policy if exists "Committee write" on news;
create policy "Committee write" on news for insert with check (auth.role() = 'authenticated');
drop policy if exists "Committee update" on news;
create policy "Committee update" on news for update using (auth.role() = 'authenticated');
drop policy if exists "Committee delete" on news;
create policy "Committee delete" on news for delete using (auth.role() = 'authenticated');

drop policy if exists "Committee write" on events;
create policy "Committee write" on events for insert with check (auth.role() = 'authenticated');
drop policy if exists "Committee update" on events;
create policy "Committee update" on events for update using (auth.role() = 'authenticated');
drop policy if exists "Committee delete" on events;
create policy "Committee delete" on events for delete using (auth.role() = 'authenticated');

drop policy if exists "Committee write" on results;
create policy "Committee write" on results for insert with check (auth.role() = 'authenticated');
drop policy if exists "Committee update" on results;
create policy "Committee update" on results for update using (auth.role() = 'authenticated');
drop policy if exists "Committee delete" on results;
create policy "Committee delete" on results for delete using (auth.role() = 'authenticated');

drop policy if exists "Committee write" on competitions;
create policy "Committee write" on competitions for insert with check (auth.role() = 'authenticated');
drop policy if exists "Committee update" on competitions;
create policy "Committee update" on competitions for update using (auth.role() = 'authenticated');
drop policy if exists "Committee delete" on competitions;
create policy "Committee delete" on competitions for delete using (auth.role() = 'authenticated');

drop policy if exists "Committee write" on competition_photos;
create policy "Committee write" on competition_photos for insert with check (auth.role() = 'authenticated');
drop policy if exists "Committee delete" on competition_photos;
create policy "Committee delete" on competition_photos for delete using (auth.role() = 'authenticated');

drop policy if exists "Committee write" on rules;
create policy "Committee write" on rules for insert with check (auth.role() = 'authenticated');
drop policy if exists "Committee update" on rules;
create policy "Committee update" on rules for update using (auth.role() = 'authenticated');
drop policy if exists "Committee delete" on rules;
create policy "Committee delete" on rules for delete using (auth.role() = 'authenticated');

-- Storage bucket for news/event photos and sponsor logos. Create the bucket
-- itself in the Supabase dashboard (Storage > New bucket > "public-images",
-- Public bucket: on) — bucket creation isn't available from plain SQL — then
-- run the policies below so committee logins can upload to it.
insert into storage.buckets (id, name, public)
values ('public-images', 'public-images', true)
on conflict (id) do nothing;

drop policy if exists "Committee upload" on storage.objects;
create policy "Committee upload" on storage.objects for insert
  with check (bucket_id = 'public-images' and auth.role() = 'authenticated');
drop policy if exists "Committee manage" on storage.objects;
create policy "Committee manage" on storage.objects for update
  using (bucket_id = 'public-images' and auth.role() = 'authenticated');
drop policy if exists "Committee delete images" on storage.objects;
create policy "Committee delete images" on storage.objects for delete
  using (bucket_id = 'public-images' and auth.role() = 'authenticated');
