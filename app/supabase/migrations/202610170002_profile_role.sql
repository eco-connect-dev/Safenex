alter table public.profiles
  add column if not exists role text not null default 'citizen';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('citizen', 'volunteer', 'duty_officer', 'district_officer', 'dmc_officer', 'dmc_analyst'));

-- Keep role assignment out of regular user updates. Administrators may assign
-- operational roles using a trusted database session.
revoke update (role) on public.profiles from authenticated;
