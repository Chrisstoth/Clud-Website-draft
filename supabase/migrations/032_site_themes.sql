-- Seasonal themes: a light-touch dressing for the whole public site at Christmas, Easter, the
-- summer break, or a big meet the club is at (Winter Nationals, the Arena League Final...). A
-- theme changes the stripe under the header and above the footer, adds a little badge to the
-- logo and colours the lane-rope dividers -- and, if it has one, shows a message ribbon under the
-- header. Christmas and the icy look also get gentle snow on the homepage.
--
-- One row per theme. "look" picks the colours (THEME_LOOKS in core.js); "mode" says when it shows:
--   off     never
--   on      from now until someone switches it off
--   dates   from start_date to end_date (inclusive)
--   yearly  between the same day and month every year (may run over New Year)
-- Only one theme shows at a time: one switched "on" first, then the one with the shortest dates,
-- so Winter Nationals in mid-December wins over a month of Christmas.
--
-- Edited in the members' area (Seasonal Themes) by the webmaster, Club Posters and the
-- comms/socials teams. The site keeps working if this hasn't been run -- it just has no theme,
-- and the members' area section says the table is missing.
--
-- Run once in the Supabase SQL Editor. Safe to re-run: the table is created once (guarded), the
-- starter themes are only added while the table is empty (all switched off), can_edit() is
-- create-or-replace, and the policies and trigger are drop-then-create.

create table if not exists public.site_themes (
  id          bigint generated always as identity primary key,
  label       text not null,
  look        text not null default 'club',
  mode        text not null default 'off' check (mode in ('off', 'on', 'dates', 'yearly')),
  start_date  date,
  end_date    date,
  message     text,
  link        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.site_themes enable row level security;

-- A starter set, all off, with likely dates filled in where they're known in advance. Nationals
-- and league-final dates change every year, so those are left for whoever switches them on.
insert into public.site_themes (label, look, mode, start_date, end_date, message, sort_order)
select * from (values
  ('Christmas',          'christmas', 'off', date '2026-12-01', date '2026-12-31', 'Merry Christmas and a happy New Year from everyone at Basildon & Phoenix!', 0),
  ('Winter Nationals',   'icy',       'off', null,              null,              'Good luck to our swimmers at Winter Nationals!', 1),
  ('Arena League Final', 'finals',    'off', null,              null,              'Good luck to our team at the Arena League Final!', 2),
  ('Easter',             'easter',    'off', date '2027-03-22', date '2027-04-05', 'Happy Easter from everyone at Basildon & Phoenix!', 3),
  ('Summer Nationals',   'gold',      'off', null,              null,              'Good luck to our swimmers at Summer Nationals!', 4),
  ('Summer break',       'summer',    'off', date '2027-07-24', date '2027-08-31', 'Have a brilliant summer break, see you back in the pool!', 5),
  ('Halloween',          'halloween', 'off', date '2026-10-25', date '2026-10-31', null, 6)
) v(label, look, mode, start_date, end_date, message, sort_order)
where not exists (select 1 from public.site_themes);

drop policy if exists "public read site themes" on public.site_themes;
create policy "public read site themes" on public.site_themes for select using (true);

-- can_edit() as in 024_peer_review.sql, plus 'themes' for Club Posters and the comms/socials teams
-- (the webmaster can edit every section already).
create or replace function public.can_edit(section text, feed_type text default null)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(auth.jwt() ->> 'email')
      and (
        m.role = 'webmaster'
        or (section = 'feed'      and m.role = 'poster')
        or (section = 'feed'      and m.feed_types is not null and feed_type = any (m.feed_types))
        or (section = 'coaches'   and m.role = 'coaching')
        or (section = 'squads'    and m.role = 'coaching')
        or (section = 'roles'     and m.role = 'volunteers')
        or (section = 'welfare'   and m.role = 'welfare')
        or (section = 'committee' and m.role = 'secretary')
        or (section = 'instagram' and m.role in ('comms', 'socials'))
        or (section = 'topics'    and m.role in ('comms', 'poster'))
        or (section = 'themes'    and m.role in ('poster', 'comms', 'socials'))
        or  section = 'guides'
      )
  );
$$;

drop policy if exists "site themes write" on public.site_themes;
create policy "site themes write" on public.site_themes for all to authenticated
  using (public.can_edit('themes')) with check (public.can_edit('themes'));

drop trigger if exists touch_site_themes on public.site_themes;
create trigger touch_site_themes before update on public.site_themes
  for each row execute function public.touch_updated_at();

notify pgrst, 'reload schema';
