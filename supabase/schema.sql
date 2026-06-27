-- ═══════════════════════════════════════════════════════════════
--  IdeaArchive — Supabase SQL Schema
--  Run this entire script in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── ENUM types ─────────────────────────────────────────────────
do $$ begin
  create type role_type      as enum ('founder', 'investor');
  create type visibility_type as enum ('public', 'investor_only');
  create type connection_status as enum ('pending', 'accepted', 'declined');
exception
  when duplicate_object then null;
end $$;

-- ── TABLES ────────────────────────────────────────────────────

-- profiles (extends auth.users 1-to-1)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  bio         text,
  role_type   role_type not null default 'founder',
  created_at  timestamptz not null default now()
);

-- ideas
create table if not exists ideas (
  id               uuid primary key default uuid_generate_v4(),
  founder_id       uuid not null references profiles(id) on delete cascade,
  title            text not null,
  industry         text not null,
  problem          text not null,
  solution         text not null,
  market_size_desc text not null,
  business_model   text not null,
  visibility       visibility_type not null default 'public',
  created_at       timestamptz not null default now()
);

create index if not exists ideas_founder_id_idx on ideas(founder_id);

-- ratings
create table if not exists ratings (
  id                  uuid primary key default uuid_generate_v4(),
  idea_id             uuid not null references ideas(id) on delete cascade,
  rater_id            uuid not null references profiles(id) on delete cascade,
  market_size_score   smallint not null check (market_size_score between 1 and 5),
  feasibility_score   smallint not null check (feasibility_score between 1 and 5),
  clarity_score       smallint not null check (clarity_score between 1 and 5),
  feedback_text       text,
  created_at          timestamptz not null default now(),
  unique (idea_id, rater_id)
);

create index if not exists ratings_idea_id_idx on ratings(idea_id);

-- connections
create table if not exists connections (
  id          uuid primary key default uuid_generate_v4(),
  investor_id uuid not null references profiles(id) on delete cascade,
  founder_id  uuid not null references profiles(id) on delete cascade,
  status      connection_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (investor_id, founder_id)
);

-- ── LEADERBOARD VIEW ──────────────────────────────────────────
create or replace view idea_leaderboard as
select
  i.id                                         as idea_id,
  i.title,
  i.industry,
  i.problem,
  i.visibility,
  i.founder_id,
  p.username                                   as founder_username,
  round(avg(r.market_size_score)::numeric, 2)  as avg_market_size,
  round(avg(r.feasibility_score)::numeric, 2)  as avg_feasibility,
  round(avg(r.clarity_score)::numeric, 2)      as avg_clarity,
  round(
    (avg(r.market_size_score) + avg(r.feasibility_score) + avg(r.clarity_score)) / 3.0,
    2
  )                                            as overall_composite_score,
  count(r.id)                                  as rating_count
from ideas i
join profiles p  on p.id = i.founder_id
join ratings r   on r.idea_id = i.id
group by i.id, i.title, i.industry, i.problem, i.visibility, i.founder_id, p.username
having count(r.id) >= 3;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

alter table profiles   enable row level security;
alter table ideas      enable row level security;
alter table ratings    enable row level security;
alter table connections enable row level security;

-- profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- ideas: public ideas visible to all; investor_only visible to investors + the founder
create policy "Public ideas are viewable by everyone"
  on ideas for select
  using (
    visibility = 'public'
    or founder_id = auth.uid()
    or exists (
      select 1 from profiles
      where id = auth.uid() and role_type = 'investor'
    )
  );

create policy "Founders can insert their own ideas"
  on ideas for insert
  with check (
    founder_id = auth.uid()
    and exists (
      select 1 from profiles
      where id = auth.uid() and role_type = 'founder'
    )
  );

create policy "Founders can update their own ideas"
  on ideas for update using (founder_id = auth.uid());

create policy "Founders can delete their own ideas"
  on ideas for delete using (founder_id = auth.uid());

-- ratings: visible to all authenticated users; raters manage their own
create policy "Ratings are viewable by authenticated users"
  on ratings for select using (auth.role() = 'authenticated');

create policy "Authenticated users can rate ideas they don't own"
  on ratings for insert
  with check (
    auth.uid() = rater_id
    and not exists (
      select 1 from ideas where id = idea_id and founder_id = auth.uid()
    )
  );

create policy "Raters can update their own ratings"
  on ratings for update using (rater_id = auth.uid());

create policy "Raters can delete their own ratings"
  on ratings for delete using (rater_id = auth.uid());

-- connections: investors see their own; founders see connections to them
create policy "Investors see their own connections"
  on connections for select
  using (investor_id = auth.uid() or founder_id = auth.uid());

create policy "Investors can request connections"
  on connections for insert
  with check (
    investor_id = auth.uid()
    and exists (
      select 1 from profiles
      where id = auth.uid() and role_type = 'investor'
    )
  );

create policy "Founders can update connection status"
  on connections for update
  using (founder_id = auth.uid());

-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────
-- Trigger: when a new auth.users row is inserted, create a matching profile.
-- The role and username are passed via raw_user_meta_data at signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, role_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(
      (new.raw_user_meta_data->>'role_type')::role_type,
      'founder'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── CONNECTION REQUEST EMAIL TRIGGER ─────────────────────────
-- Uses Supabase's built-in pg_net + Supabase email service.
-- Fires when a connection row is inserted (status = 'pending').
-- NOTE: Enable "Database Webhooks" or use pg_net directly.
-- Simplest approach: Supabase Edge Function triggered by DB webhook on
-- connections INSERT. See DEPLOY.md for the setup instructions.

-- ── DONE ──────────────────────────────────────────────────────
-- After running this script, verify in the Supabase Table Editor that
-- all four tables exist and the idea_leaderboard view is present.

-- ═══════════════════════════════════════════════════════════════
--  IdeaArchive — Schema additions (run after initial schema)
-- ═══════════════════════════════════════════════════════════════

-- ── RAISE LEADERBOARD THRESHOLD ───────────────────────────────
-- Re-run this view to require ≥3 ratings (anti-gaming)
create or replace view idea_leaderboard as
select
  i.id                                         as idea_id,
  i.title,
  i.industry,
  i.problem,
  i.visibility,
  i.founder_id,
  p.username                                   as founder_username,
  round(avg(r.market_size_score)::numeric, 2)  as avg_market_size,
  round(avg(r.feasibility_score)::numeric, 2)  as avg_feasibility,
  round(avg(r.clarity_score)::numeric, 2)      as avg_clarity,
  round(
    (avg(r.market_size_score) + avg(r.feasibility_score) + avg(r.clarity_score)) / 3.0,
    2
  )                                            as overall_composite_score,
  count(r.id)                                  as rating_count
from ideas i
join profiles p  on p.id = i.founder_id
join ratings r   on r.idea_id = i.id
group by i.id, i.title, i.industry, i.problem, i.visibility, i.founder_id, p.username
having count(r.id) >= 3;

-- ── REPORTS TABLE ─────────────────────────────────────────────
create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  idea_id     uuid not null references ideas(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason      text not null,
  created_at  timestamptz not null default now(),
  unique (idea_id, reporter_id)
);

alter table reports enable row level security;

create policy "Authenticated users can report ideas"
  on reports for insert
  with check (
    auth.uid() = reporter_id
    and not exists (
      select 1 from ideas where id = idea_id and founder_id = auth.uid()
    )
  );

create policy "Reporters can view their own reports"
  on reports for select using (reporter_id = auth.uid());

-- ── VERIFIED INVESTOR FIELD ───────────────────────────────────
alter table profiles add column if not exists linkedin_url text;
alter table profiles add column if not exists is_verified_investor boolean not null default false;

-- ── SECURITY INVOKER ON VIEW ──────────────────────────────────
-- Fixes Supabase security advisor CRITICAL warning
alter view idea_leaderboard set (security_invoker = on);
