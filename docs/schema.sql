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

create table if not exists competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  sponsor_name text,
  sponsor_logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  competition_name text not null,
  event_date date not null,
  angler_name text not null,
  weight_kg numeric,
  position int
);
alter table results add column if not exists competition_id uuid references competitions(id) on delete set null;

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
alter table rules enable row level security;
alter table templates enable row level security;

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
