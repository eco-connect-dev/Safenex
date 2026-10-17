create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  district text,
  role text not null default 'citizen',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text not null default 'citizen';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('citizen', 'volunteer', 'duty_officer', 'district_officer', 'dmc_officer', 'dmc_analyst'));

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid());

grant select on public.profiles to authenticated;
grant insert (id, full_name, phone, district) on public.profiles to authenticated;
grant update (full_name, phone, district, updated_at) on public.profiles to authenticated;

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, district)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'district'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

-- Backfill profiles for accounts created before this migration. Existing rows
-- in public.profiles are intentionally left unchanged.
insert into public.profiles (id, full_name, phone, district)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  raw_user_meta_data ->> 'phone',
  raw_user_meta_data ->> 'district'
from auth.users
on conflict (id) do nothing;
