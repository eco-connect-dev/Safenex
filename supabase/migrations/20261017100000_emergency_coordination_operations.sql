-- Persistent rescue dispatch and relief allocation records for the DMC Duty Officer.
-- Policies intentionally follow the current development setup: anon and authenticated
-- clients can read and record operations while role-based access is still out of scope.

create table if not exists public.rescue_teams (
    id text primary key,
    organisation text not null,
    status text not null default 'Available' check (status in ('Available', 'On mission', 'Dispatched')),
    location text not null,
    created_at timestamptz not null default now()
);

create table if not exists public.rescue_dispatches (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references public.emergency_events(id) on delete set null,
    team_id text not null references public.rescue_teams(id),
    organisation text not null,
    target_location text not null,
    mission_details text not null,
    status text not null default 'Dispatched' check (status = 'Dispatched'),
    dispatched_by uuid references auth.users(id) on delete set null,
    dispatched_at timestamptz not null default now()
);

create table if not exists public.relief_resources (
    id text primary key,
    name text not null,
    organisation text not null,
    unit text not null default '',
    available_quantity integer not null check (available_quantity >= 0),
    updated_at timestamptz not null default now()
);

create table if not exists public.relief_allocations (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references public.emergency_events(id) on delete set null,
    resource_id text not null references public.relief_resources(id),
    resource text not null,
    organisation text not null,
    quantity integer not null check (quantity > 0),
    location text not null,
    allocated_by uuid references auth.users(id) on delete set null,
    allocated_at timestamptz not null default now()
);

create index if not exists idx_rescue_dispatches_event_time on public.rescue_dispatches (event_id, dispatched_at desc);
create index if not exists idx_relief_allocations_event_time on public.relief_allocations (event_id, allocated_at desc);

insert into public.rescue_teams (id, organisation, status, location) values
    ('RT-01', 'Army', 'Available', 'Rambukkana'),
    ('RT-02', 'Police', 'Available', 'Kegalle'),
    ('RT-03', 'Fire Service', 'On mission', 'Mawanella')
on conflict (id) do nothing;

insert into public.relief_resources (id, name, organisation, unit, available_quantity) values
    ('water', 'Drinking Water', 'DMC', 'L', 15000),
    ('food-packs', 'Food Packs', 'WFP', '', 4500),
    ('medicine', 'Medicine Kits', 'Ministry of Health', '', 1250),
    ('blankets', 'Blankets', 'Sri Lanka Red Cross', '', 3200)
on conflict (id) do nothing;

alter table public.rescue_teams enable row level security;
alter table public.rescue_dispatches enable row level security;
alter table public.relief_resources enable row level security;
alter table public.relief_allocations enable row level security;

drop policy if exists "dev read rescue teams" on public.rescue_teams;
create policy "dev read rescue teams" on public.rescue_teams for select to anon, authenticated using (true);
drop policy if exists "dev update rescue teams" on public.rescue_teams;
create policy "dev update rescue teams" on public.rescue_teams for update to anon, authenticated using (true) with check (true);
drop policy if exists "dev read rescue dispatches" on public.rescue_dispatches;
create policy "dev read rescue dispatches" on public.rescue_dispatches for select to anon, authenticated using (true);
drop policy if exists "dev insert rescue dispatches" on public.rescue_dispatches;
create policy "dev insert rescue dispatches" on public.rescue_dispatches for insert to anon, authenticated with check (true);

drop policy if exists "dev read relief resources" on public.relief_resources;
create policy "dev read relief resources" on public.relief_resources for select to anon, authenticated using (true);
drop policy if exists "dev update relief resources" on public.relief_resources;
create policy "dev update relief resources" on public.relief_resources for update to anon, authenticated using (true) with check (true);
drop policy if exists "dev read relief allocations" on public.relief_allocations;
create policy "dev read relief allocations" on public.relief_allocations for select to anon, authenticated using (true);
drop policy if exists "dev insert relief allocations" on public.relief_allocations;
create policy "dev insert relief allocations" on public.relief_allocations for insert to anon, authenticated with check (true);

grant select, update on public.rescue_teams to anon, authenticated;
grant select, insert on public.rescue_dispatches to anon, authenticated;
grant select, update on public.relief_resources to anon, authenticated;
grant select, insert on public.relief_allocations to anon, authenticated;

create or replace function public.dispatch_rescue_team(
    p_team_id text,
    p_target_location text,
    p_mission_details text,
    p_event_id uuid default null
)
returns setof public.rescue_dispatches
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_team public.rescue_teams;
    v_dispatch public.rescue_dispatches;
begin
    if nullif(btrim(p_target_location), '') is null then raise exception 'Select a target location.'; end if;
    if nullif(btrim(p_mission_details), '') is null then raise exception 'Enter mission details before dispatching.'; end if;

    update public.rescue_teams
       set status = 'Dispatched'
     where id = p_team_id and status = 'Available'
     returning * into v_team;
    if not found then
        if not exists (select 1 from public.rescue_teams where id = p_team_id) then
            raise exception 'Select a valid rescue team.';
        end if;
        raise exception '% is not available for dispatch.', p_team_id;
    end if;

    insert into public.rescue_dispatches (event_id, team_id, organisation, target_location, mission_details, dispatched_by)
    values (p_event_id, v_team.id, v_team.organisation, btrim(p_target_location), btrim(p_mission_details), auth.uid())
    returning * into v_dispatch;
    return next v_dispatch;
end;
$$;

create or replace function public.allocate_relief_resource(
    p_resource_id text,
    p_quantity integer,
    p_location text,
    p_event_id uuid default null
)
returns setof public.relief_allocations
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_resource public.relief_resources;
    v_allocation public.relief_allocations;
begin
    if p_quantity is null or p_quantity <= 0 then raise exception 'Enter a whole quantity greater than zero.'; end if;
    if nullif(btrim(p_location), '') is null then raise exception 'Select a distribution location.'; end if;

    update public.relief_resources
       set available_quantity = available_quantity - p_quantity, updated_at = now()
     where id = p_resource_id and available_quantity >= p_quantity
     returning * into v_resource;
    if not found then
        if not exists (select 1 from public.relief_resources where id = p_resource_id) then
            raise exception 'Select a valid relief resource.';
        end if;
        raise exception 'Requested quantity exceeds available inventory.';
    end if;

    insert into public.relief_allocations (event_id, resource_id, resource, organisation, quantity, location, allocated_by)
    values (p_event_id, v_resource.id, v_resource.name, v_resource.organisation, p_quantity, btrim(p_location), auth.uid())
    returning * into v_allocation;
    return next v_allocation;
end;
$$;

revoke all on function public.dispatch_rescue_team(text, text, text, uuid) from public;
revoke all on function public.allocate_relief_resource(text, integer, text, uuid) from public;
grant execute on function public.dispatch_rescue_team(text, text, text, uuid) to anon, authenticated;
grant execute on function public.allocate_relief_resource(text, integer, text, uuid) to anon, authenticated;
