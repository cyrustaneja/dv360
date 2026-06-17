-- ============================================================================
-- DV360 Simulation — tables for the shared Kraftshala Hub Supabase project.
-- The hub owns auth, public.profiles, and public.is_admin(). This file ONLY
-- adds DV360-specific tables (all prefixed dv360_) so nothing collides.
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- All rows are keyed by user_id = the hub's profiles.id (= JWT claim `sub`).
-- Writes happen server-side with the service_role key (bypasses RLS); the RLS
-- policies below are defence-in-depth for any direct client access.
-- ============================================================================

create table if not exists public.dv360_advertisers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  batch       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.dv360_campaigns (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  advertiser_id uuid not null references public.dv360_advertisers(id) on delete cascade,
  name          text not null,
  status        text not null default 'active',
  goal          text,
  kpi_goal      text,
  budget        text,
  planned_spend text,
  start_date    text,
  end_date      text,
  created_at    timestamptz not null default now()
);

create table if not exists public.dv360_insertion_orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  advertiser_id uuid not null references public.dv360_advertisers(id) on delete cascade,
  campaign_id   uuid not null references public.dv360_campaigns(id) on delete cascade,
  name          text not null,
  io_type       text not null default 'Standard',
  status        text not null default 'active',
  budget        text,
  pacing        text,
  freq_cap      text,
  kpi_type      text,
  kpi_value     text,
  start_date    text,
  end_date      text,
  created_at    timestamptz not null default now()
);

create table if not exists public.dv360_line_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  advertiser_id uuid not null references public.dv360_advertisers(id) on delete cascade,
  io_id         uuid not null references public.dv360_insertion_orders(id) on delete cascade,
  name          text not null,
  li_type       text not null default 'Display',
  status        text not null default 'active',
  budget_type   text,
  budget        text,
  pacing        text,
  bid_strategy  text,
  bid_amount    text,
  freq_cap      text,
  targeting     jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create table if not exists public.dv360_creatives (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  advertiser_id uuid not null references public.dv360_advertisers(id) on delete cascade,
  name          text not null,
  dimensions    text,
  creative_type text,
  click_url     text,
  accent        text default '#1a73e8',
  created_at    timestamptz not null default now()
);

-- Progress + raw activity stream (per the hub spec).
create table if not exists public.dv360_progress (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  status     text not null default 'in_progress',
  score      numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.dv360_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  payload    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ── RLS (defence-in-depth; server uses service_role which bypasses these) ────
alter table public.dv360_advertisers      enable row level security;
alter table public.dv360_campaigns        enable row level security;
alter table public.dv360_insertion_orders enable row level security;
alter table public.dv360_line_items       enable row level security;
alter table public.dv360_creatives        enable row level security;
alter table public.dv360_progress         enable row level security;
alter table public.dv360_events           enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'dv360_advertisers','dv360_campaigns','dv360_insertion_orders',
    'dv360_line_items','dv360_creatives','dv360_progress','dv360_events'
  ]
  loop
    execute format('drop policy if exists %I_self on public.%I', t, t);
    execute format(
      'create policy %I_self on public.%I for select using (user_id = auth.uid() or public.is_admin())',
      t, t
    );
  end loop;
end$$;

create index if not exists idx_dv360_adv_user      on public.dv360_advertisers(user_id);
create index if not exists idx_dv360_camp_adv      on public.dv360_campaigns(advertiser_id);
create index if not exists idx_dv360_io_camp       on public.dv360_insertion_orders(campaign_id);
create index if not exists idx_dv360_io_adv        on public.dv360_insertion_orders(advertiser_id);
create index if not exists idx_dv360_li_io         on public.dv360_line_items(io_id);
create index if not exists idx_dv360_li_adv        on public.dv360_line_items(advertiser_id);
create index if not exists idx_dv360_cr_adv        on public.dv360_creatives(advertiser_id);
create index if not exists idx_dv360_events_user   on public.dv360_events(user_id);
