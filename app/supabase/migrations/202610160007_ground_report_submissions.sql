-- Community submissions use the existing public.hazards table.
alter table public.hazards
  add column if not exists review_status text not null default 'pending_review';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hazards_review_status_check'
      and conrelid = 'public.hazards'::regclass
  ) then
    alter table public.hazards
      add constraint hazards_review_status_check
      check (review_status in ('pending_review', 'accepted', 'rejected'));
  end if;
end $$;

create index if not exists hazards_active_observed_idx
  on public.hazards using btree (status, observed_at desc);

grant insert (
  id, hazard_type, title, description, severity, location, district,
  affected_people, status, source, review_status, image_url
) on public.hazards to anon, authenticated;

drop policy if exists "Community can submit ground reports" on public.hazards;
create policy "Community can submit ground reports" on public.hazards
  for insert to anon, authenticated
  with check (
    status = 'active'
    and source = 'citizen'
    and review_status = 'pending_review'
    and affected_people >= 0
  );

-- Create the public bucket hazard-report-images in Supabase Storage first.
-- Public reads are needed because public.hazards.image_url stores public URLs.
drop policy if exists "Anyone can view hazard report images" on storage.objects;
create policy "Anyone can view hazard report images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'hazard-report-images');

drop policy if exists "Anyone can upload hazard report images" on storage.objects;
create policy "Anyone can upload hazard report images" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'hazard-report-images');
