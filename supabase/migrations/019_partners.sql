-- Proud Partners: the strip of partner names under the header on every page. Each partner is a
-- name and (optionally) the web address it links to, shown left to right in sort_order.
-- Edited in the members' area ("Proud Partners") by the webmaster.
--
-- The site keeps working if this hasn't been run yet: every page just keeps showing the partner
-- list written into its HTML, and the members' area section says the table is missing.
--
-- Safe to re-run: the table is created once (guarded), the four current partners are only added
-- while the table is empty, and the policies and trigger are drop-then-create.

create table if not exists public.partners (
  id          bigint generated always as identity primary key,
  name        text not null,
  url         text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.partners enable row level security;

-- The partners already on the site, so nothing changes until someone edits them.
insert into public.partners (name, url, sort_order)
select * from (values
  ('Allens of Kingsbury', null::text, 0),
  ('Arena', null, 1),
  ('Club Organiser', 'https://www.cluborganiser.co.uk/login.php', 2),
  ('Swimzi', null, 3)
) v(name, url, sort_order)
where not exists (select 1 from public.partners);

drop policy if exists "public read partners" on public.partners;
create policy "public read partners" on public.partners for select using (true);

-- can_edit() already lets the webmaster edit every section, so no change to it is needed.
drop policy if exists "partners write" on public.partners;
create policy "partners write" on public.partners for all to authenticated
  using (public.can_edit('partners')) with check (public.can_edit('partners'));

drop trigger if exists touch_partners on public.partners;
create trigger touch_partners before update on public.partners
  for each row execute function public.touch_updated_at();

-- Tell the API to re-read the table layout now, so the members' area can save straight away.
notify pgrst, 'reload schema';
