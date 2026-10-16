alter table public.hazards
  add column if not exists reporter_id uuid references auth.users(id) on delete set null;

grant insert (reporter_id) on public.hazards to authenticated;

drop policy if exists "Community can submit ground reports" on public.hazards;
create policy "Community can submit ground reports" on public.hazards
  for insert to anon, authenticated
  with check (
    status = 'active'
    and source = 'citizen'
    and review_status = 'pending_review'
    and affected_people >= 0
    and (
      (auth.uid() is null and reporter_id is null)
      or reporter_id = auth.uid()
    )
  );
