create table if not exists public.emergency_events (
                                                       id uuid primary key default gen_random_uuid(),
    hazard_type text not null default 'flood',
    district text not null,
    severity text not null check (severity in ('low','medium','high','critical')),
    status text not null default 'active' check (status in ('active','monitoring','resolved')),
    people_affected integer not null default 0,
    started_at timestamptz not null,
    shelters_active integer not null default 0,
    rescue_teams_deployed integer not null default 0,
    relief_items_allocated integer not null default 0,
    created_at timestamptz not null default now()
    );

create table if not exists public.emergency_event_locations (
                                                                id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.emergency_events(id) on delete cascade,
    name text not null,
    map_x numeric not null,
    map_y numeric not null,
    is_epicenter boolean not null default false
    );

create table if not exists public.emergency_priority_needs (
                                                               id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.emergency_events(id) on delete cascade,
    need text not null,
    context text not null,
    priority_label text not null,
    focus text not null check (focus in ('shelters','rescue','relief')),
    sort_order integer not null default 0
    );

create table if not exists public.emergency_updates (
                                                        id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.emergency_events(id) on delete cascade,
    update_text text not null,
    status text not null,
    occurred_at timestamptz not null default now()
    );

create index if not exists idx_emergency_events_status on public.emergency_events (status, started_at desc);
create index if not exists idx_emergency_locations_event on public.emergency_event_locations (event_id);
create index if not exists idx_emergency_needs_event on public.emergency_priority_needs (event_id, sort_order);
create index if not exists idx_emergency_updates_event on public.emergency_updates (event_id, occurred_at desc);

alter table public.emergency_events enable row level security;
alter table public.emergency_event_locations enable row level security;
alter table public.emergency_priority_needs enable row level security;
alter table public.emergency_updates enable row level security;

-- TEMPORARY: read-only for everyone until role-based access control is added.
create policy "dev read events" on public.emergency_events for select to anon, authenticated using (true);
create policy "dev read locations" on public.emergency_event_locations for select to anon, authenticated using (true);
create policy "dev read needs" on public.emergency_priority_needs for select to anon, authenticated using (true);
create policy "dev read updates" on public.emergency_updates for select to anon, authenticated using (true);
