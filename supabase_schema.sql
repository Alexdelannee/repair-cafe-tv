-- Repair Café TV schema (Supabase / Postgres)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Visitor counter
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  visit_day date not null,
  device_token text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists visits_day_device_token_uq
  on public.visits (visit_day, device_token);

-- Repair items
create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  repair_day date not null,
  category text not null default 'General',
  description text not null,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists repairs_day_status_idx
  on public.repairs (repair_day, status);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_repairs_updated_at on public.repairs;
create trigger trg_repairs_updated_at
before update on public.repairs
for each row execute function public.set_updated_at();

-- Row Level Security (permissive for demo)
-- If you need stronger security, we can add an auth flow + staff-only write access.
alter table public.visits enable row level security;
alter table public.repairs enable row level security;

-- Visitors: allow anonymous insert/select (counts)
drop policy if exists "visits_select_public" on public.visits;
create policy "visits_select_public"
on public.visits
for select
using (true);

drop policy if exists "visits_insert_anon" on public.visits;
create policy "visits_insert_anon"
on public.visits
for insert
with check (auth.role() = 'anon');

drop policy if exists "visits_update_anon" on public.visits;
create policy "visits_update_anon"
on public.visits
for update
with check (auth.role() = 'anon');

-- Repairs: allow anonymous read/write (admin page uses anon key)
drop policy if exists "repairs_select_public" on public.repairs;
create policy "repairs_select_public"
on public.repairs
for select
using (true);

drop policy if exists "repairs_insert_anon" on public.repairs;
create policy "repairs_insert_anon"
on public.repairs
for insert
with check (auth.role() = 'anon');

drop policy if exists "repairs_update_anon" on public.repairs;
create policy "repairs_update_anon"
on public.repairs
for update
with check (auth.role() = 'anon');

