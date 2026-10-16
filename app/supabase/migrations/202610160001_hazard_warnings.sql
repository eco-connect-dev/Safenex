create extension if not exists pgcrypto;

create table if not exists public.hazards (
  id uuid primary key default gen_random_uuid(),
  hazard_type text not null check (hazard_type in ('flood', 'landslide', 'storm', 'fire', 'other')),
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'moderate', 'high', 'critical')),
  location text not null,
  district text not null,
  affected_people integer not null default 0 check (affected_people >= 0),
  status text not null default 'active' check (status in ('active', 'resolved')),
  source text not null default 'seed',
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hazard_warnings (
  id uuid primary key default gen_random_uuid(),
  hazard_id uuid not null references public.hazards(id) on delete restrict,
  tier smallint not null check (tier between 1 and 3),
  title text not null,
  message text not null,
  language text not null default 'en',
  status text not null default 'draft' check (status in ('draft', 'issued', 'cancelled', 'expired')),
  target_location text not null,
  affected_people integer not null default 0 check (affected_people >= 0),
  channels text[] not null default array['push', 'sms'],
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  issued_by uuid references auth.users(id) on delete set null,
  issued_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'issued' and issued_at is not null) or status <> 'issued')
);

create index if not exists hazards_active_observed_idx on public.hazards (status, observed_at desc);
create index if not exists hazard_warnings_status_created_idx on public.hazard_warnings (status, created_at desc);
create index if not exists hazard_warnings_hazard_id_idx on public.hazard_warnings (hazard_id);

alter table public.hazards enable row level security;
alter table public.hazard_warnings enable row level security;

drop policy if exists "Authenticated users can read hazards" on public.hazards;
create policy "Authenticated users can read hazards" on public.hazards
  for select to authenticated using (true);
drop policy if exists "Public can read active hazards" on public.hazards;
create policy "Public can read active hazards" on public.hazards
  for select to anon using (status = 'active');

drop policy if exists "Authenticated users can read warnings" on public.hazard_warnings;
create policy "Authenticated users can read warnings" on public.hazard_warnings
  for select to authenticated using (true);
drop policy if exists "Public can read issued warnings" on public.hazard_warnings;
create policy "Public can read issued warnings" on public.hazard_warnings
  for select to anon using (status = 'issued');

drop policy if exists "Authenticated users can create warnings" on public.hazard_warnings;
create policy "Authenticated users can create warnings" on public.hazard_warnings
  for insert to authenticated with check (created_by = auth.uid());

drop policy if exists "Authors can update their warning drafts" on public.hazard_warnings;
create policy "Authors can update their warning drafts" on public.hazard_warnings
  for update to authenticated using (created_by = auth.uid() and status = 'draft')
  with check (created_by = auth.uid());

insert into public.hazards
  (id, hazard_type, title, description, severity, location, district, affected_people, observed_at)
values
  ('a1100000-0000-4000-8000-000000000001', 'flood', 'Kelani River flood watch', 'River levels are rising after sustained rainfall. Low-lying areas should prepare to move to higher ground.', 'high', 'Hanwella and low-lying Kelani River banks', 'Colombo', 12430, now() - interval '18 minutes'),
  ('a1100000-0000-4000-8000-000000000002', 'landslide', 'Landslide risk near Kandy Road', 'Heavy rainfall has saturated slopes. Avoid the road cut and follow local authority guidance.', 'critical', 'Kadugannawa, Kandy Road', 'Kandy', 2800, now() - interval '42 minutes'),
  ('a1100000-0000-4000-8000-000000000003', 'flood', 'Nilwala River elevated water level', 'Water levels remain above the minor flood threshold near the lower catchment.', 'moderate', 'Akuressa and lower Nilwala basin', 'Matara', 5400, now() - interval '1 hour')
on conflict (id) do update set
  hazard_type = excluded.hazard_type,
  title = excluded.title,
  description = excluded.description,
  severity = excluded.severity,
  location = excluded.location,
  district = excluded.district,
  affected_people = excluded.affected_people,
  observed_at = excluded.observed_at;
