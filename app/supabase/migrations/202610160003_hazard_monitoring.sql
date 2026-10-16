alter table public.hazards
  add column if not exists water_level_m numeric(6,2),
  add column if not exists rainfall_mm_hr numeric(7,2),
  add column if not exists slope_displacement_mm numeric(7,2);

update public.hazards
set water_level_m = 4.85,
    rainfall_mm_hr = 92,
    observed_at = now() - interval '18 minutes'
where id = 'a1100000-0000-4000-8000-000000000001';

update public.hazards
set rainfall_mm_hr = 118,
    slope_displacement_mm = 26.5,
    observed_at = now() - interval '42 minutes'
where id = 'a1100000-0000-4000-8000-000000000002';

update public.hazards
set water_level_m = 2.65,
    rainfall_mm_hr = 54,
    observed_at = now() - interval '18 minutes'
where id = 'a1100000-0000-4000-8000-000000000003';
