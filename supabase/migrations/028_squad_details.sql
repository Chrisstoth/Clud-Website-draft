-- Squad details: the words on the Squads tab of the Coaches & Squads page -- each squad's age
-- guide, level line, who-it's-for text and whether it's highly competitive, plus the introduction
-- above the pathway diagram and the note under it. One row per squad, matched by name; the
-- special keys '_intro' and '_note' hold those two paragraphs in blurb.
--
-- Edited in the members' area (Squads > Squad details) by the Coaching Lead and the webmaster.
-- A squad with no row here keeps the wording written into pathway.js, so the site keeps working
-- if this hasn't been run yet -- the members' area tab just says the table is missing.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

create table if not exists public.squad_details (
  key          text primary key,
  age_label    text,
  level        text,
  blurb        text,
  competitive  boolean not null default false,
  updated_at   timestamptz not null default now()
);

alter table public.squad_details enable row level security;

drop policy if exists "public read squad details" on public.squad_details;
create policy "public read squad details" on public.squad_details for select using (true);

-- can_edit('squads') already covers the Coaching Lead and the webmaster.
drop policy if exists "squad details write" on public.squad_details;
create policy "squad details write" on public.squad_details for all to authenticated
  using (public.can_edit('squads')) with check (public.can_edit('squads'));

drop trigger if exists touch_squad_details on public.squad_details;
create trigger touch_squad_details before update on public.squad_details
  for each row execute function public.touch_updated_at();

notify pgrst, 'reload schema';
