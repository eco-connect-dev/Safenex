create table if not exists public.emergency_shelters (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references public.emergency_events(id) on delete cascade,
    name text not null,
    category text not null default 'Registered emergency shelter',
    location text not null,
    current_occupancy integer not null default 0,
    capacity integer not null default 0,
    status text not null check (status in ('available','full','standby')),
    in_affected_area boolean not null default true,
    contact_person text,
    contact_phone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_emergency_shelters_event on public.emergency_shelters (event_id, in_affected_area);
create index if not exists idx_emergency_shelters_status on public.emergency_shelters (status);

alter table public.emergency_shelters enable row level security;

-- TEMPORARY: Read/Write for everyone until role-based access control is added.
drop policy if exists "dev read shelters" on public.emergency_shelters;
create policy "dev read shelters" on public.emergency_shelters for select to anon, authenticated using (true);
drop policy if exists "dev update shelters" on public.emergency_shelters;
create policy "dev update shelters" on public.emergency_shelters for update to anon, authenticated using (true);
drop policy if exists "dev insert shelters" on public.emergency_shelters;
create policy "dev insert shelters" on public.emergency_shelters for insert to anon, authenticated with check (true);
