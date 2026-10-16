alter table public.hazards
  add column if not exists water_level_m numeric(6,2),
  add column if not exists rainfall_mm_hr numeric(7,2),
  add column if not exists slope_displacement_mm numeric(7,2);

create table if not exists public.hazard_readings (
  id uuid primary key default gen_random_uuid(),
  hazard_id uuid not null references public.hazards(id) on delete cascade,
  water_level_m numeric(6,2),
  rainfall_mm_hr numeric(7,2),
  slope_displacement_mm numeric(7,2),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (water_level_m is not null or rainfall_mm_hr is not null or slope_displacement_mm is not null)
);

create index if not exists hazard_readings_hazard_recorded_idx
  on public.hazard_readings (hazard_id, recorded_at desc);

alter table public.hazard_readings enable row level security;
drop policy if exists "Public can read hazard readings" on public.hazard_readings;
create policy "Public can read hazard readings" on public.hazard_readings
  for select to anon, authenticated using (true);

update public.hazards set water_level_m = 4.85, rainfall_mm_hr = 92, observed_at = now() - interval '18 minutes'
where id = 'a1100000-0000-4000-8000-000000000001';
update public.hazards set rainfall_mm_hr = 118, slope_displacement_mm = 26.5, observed_at = now() - interval '42 minutes'
where id = 'a1100000-0000-4000-8000-000000000002';
update public.hazards set water_level_m = 2.65, rainfall_mm_hr = 54, observed_at = now() - interval '18 minutes'
where id = 'a1100000-0000-4000-8000-000000000003';

insert into public.hazard_readings (id, hazard_id, water_level_m, rainfall_mm_hr, slope_displacement_mm, recorded_at)
values
  ('a2200000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001', 3.90, 35, null, now() - interval '5 hours'),
  ('a2200000-0000-4000-8000-000000000002', 'a1100000-0000-4000-8000-000000000001', 4.08, 48, null, now() - interval '4 hours'),
  ('a2200000-0000-4000-8000-000000000003', 'a1100000-0000-4000-8000-000000000001', 4.22, 61, null, now() - interval '3 hours'),
  ('a2200000-0000-4000-8000-000000000004', 'a1100000-0000-4000-8000-000000000001', 4.41, 73, null, now() - interval '2 hours'),
  ('a2200000-0000-4000-8000-000000000005', 'a1100000-0000-4000-8000-000000000001', 4.68, 86, null, now() - interval '1 hour'),
  ('a2200000-0000-4000-8000-000000000006', 'a1100000-0000-4000-8000-000000000001', 4.85, 92, null, now() - interval '18 minutes'),
  ('a2200000-0000-4000-8000-000000000007', 'a1100000-0000-4000-8000-000000000002', null, 42, 2.1, now() - interval '5 hours'),
  ('a2200000-0000-4000-8000-000000000008', 'a1100000-0000-4000-8000-000000000002', null, 57, 4.8, now() - interval '4 hours'),
  ('a2200000-0000-4000-8000-000000000009', 'a1100000-0000-4000-8000-000000000002', null, 73, 8.2, now() - interval '3 hours'),
  ('a2200000-0000-4000-8000-000000000010', 'a1100000-0000-4000-8000-000000000002', null, 91, 14.7, now() - interval '2 hours'),
  ('a2200000-0000-4000-8000-000000000011', 'a1100000-0000-4000-8000-000000000002', null, 105, 21.3, now() - interval '1 hour'),
  ('a2200000-0000-4000-8000-000000000012', 'a1100000-0000-4000-8000-000000000002', null, 118, 26.5, now() - interval '42 minutes'),
  ('a2200000-0000-4000-8000-000000000013', 'a1100000-0000-4000-8000-000000000003', 1.80, 24, null, now() - interval '5 hours'),
  ('a2200000-0000-4000-8000-000000000014', 'a1100000-0000-4000-8000-000000000003', 1.92, 31, null, now() - interval '4 hours'),
  ('a2200000-0000-4000-8000-000000000015', 'a1100000-0000-4000-8000-000000000003', 2.10, 37, null, now() - interval '3 hours'),
  ('a2200000-0000-4000-8000-000000000016', 'a1100000-0000-4000-8000-000000000003', 2.24, 43, null, now() - interval '2 hours'),
  ('a2200000-0000-4000-8000-000000000017', 'a1100000-0000-4000-8000-000000000003', 2.48, 49, null, now() - interval '1 hour'),
  ('a2200000-0000-4000-8000-000000000018', 'a1100000-0000-4000-8000-000000000003', 2.65, 54, null, now() - interval '18 minutes')
on conflict (id) do update set
  water_level_m = excluded.water_level_m,
  rainfall_mm_hr = excluded.rainfall_mm_hr,
  slope_displacement_mm = excluded.slope_displacement_mm,
  recorded_at = excluded.recorded_at;
