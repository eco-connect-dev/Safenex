alter table public.hazards
  add column if not exists image_url text;

-- Let signed-in volunteers save review outcomes and evidence URLs without
-- granting updates to hazard measurements or report descriptions.
revoke update on public.hazards from anon, authenticated;
grant update (review_status, image_url) on public.hazards to authenticated;

drop policy if exists "Authenticated volunteers can review hazards" on public.hazards;
create policy "Authenticated volunteers can review hazards" on public.hazards
  for update to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
