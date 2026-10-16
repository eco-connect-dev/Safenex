alter table public.hazards
  drop column if exists latitude,
  drop column if exists longitude;
