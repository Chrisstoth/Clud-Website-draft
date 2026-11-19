-- Masters galas, and a colour for each kind of event on the Club Calendar.
--
-- 1. Any gala (BPSC-hosted, another club's, or a team/league meet) can be ticked as a Masters
--    gala. Masters galas get their own section on Open Meets and their own colour on the calendar.
--    It's just another column on the feed, so peer review (024) covers it like everything else.
--
-- 2. Calendar colours: one row per kind of event (competitions, league galas, Masters galas,
--    socials, training changes). Club Posters and Webmasters change them in the members' area
--    (Calendar Colours), and the same second-person rule as posts applies:
--      - a Webmaster's change goes live straight away;
--      - anyone else's is held in pending_colour, and the calendar keeps its old colour, until a
--        DIFFERENT club account approves it (approve_calendar_colour).
--    Colours must be plain #rrggbb, so nothing else can be slipped into the page's styles.
--    The public can read only each kind and its live colour -- not who changed it.
--
-- The site keeps working if this hasn't been run: galas just can't be ticked as Masters yet, and
-- the calendar uses its built-in colours.
--
-- Run once in the Supabase SQL Editor, after 024 and 032. Safe to re-run.

-- 1. Masters galas
alter table public.feed add column if not exists masters boolean not null default false;
-- once 037 has been run, a new feed column has to be shared before anyone can read it
do $$ begin
  if exists (select 1 from pg_proc where proname = 'share_feed_columns') then
    perform public.share_feed_columns();
  end if;
end $$;

-- 2. Calendar colours
create table if not exists public.calendar_colours (
  kind            text primary key,
  colour          text not null check (colour ~ '^#[0-9a-f]{6}$'),
  pending_colour  text check (pending_colour ~ '^#[0-9a-f]{6}$'),
  submitted_by    text,
  approved_by     text,
  approved_at     timestamptz,
  sort_order      int not null default 0,
  updated_at      timestamptz not null default now()
);

-- The colours the calendar has always had, plus blue for Masters galas. Existing rows are left alone.
insert into public.calendar_colours (kind, colour, sort_order) values
  ('comp',     '#c9660a', 0),
  ('league',   '#101014', 1),
  ('masters',  '#1d5fc4', 2),
  ('social',   '#f5841f', 3),
  ('training', '#b3261e', 4)
on conflict (kind) do nothing;

alter table public.calendar_colours enable row level security;

-- Everyone reads each kind and its live colour, nothing else; club accounts get the whole rows
-- (what's waiting, and who asked for it) through calendar_colours_admin() in 037. Changes come
-- only through updates to the two colour columns -- the trigger below fills in the rest -- and
-- nobody can add or remove a kind from the page.
revoke all on public.calendar_colours from anon, authenticated;
grant select (kind, colour) on public.calendar_colours to anon, authenticated;
grant update (colour, pending_colour) on public.calendar_colours to authenticated;

-- can_edit() as in 032_site_themes.sql, plus 'calendar' for Club Posters (Webmasters can edit
-- every section already).
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
        or (section = 'calendar'  and m.role = 'poster')
        or  section = 'guides'
      )
  );
$$;

drop policy if exists "public read calendar colours" on public.calendar_colours;
create policy "public read calendar colours" on public.calendar_colours for select using (true);
drop policy if exists "calendar colours write" on public.calendar_colours;
create policy "calendar colours write" on public.calendar_colours for update to authenticated
  using (public.can_edit('calendar')) with check (public.can_edit('calendar'));

-- Every change from the members' area is stamped with who made it. A Webmaster's new colour goes
-- live; anyone else's can only ask for one (pending_colour), never change the live colour. As
-- with the feed, saves with no signed-in user (the dashboard, the SQL editor) and the approval
-- itself are left alone.
create or replace function public.calendar_colour_gate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.members;
begin
  if auth.uid() is null or coalesce(current_setting('bpsc.approving', true), '') = 'on' then
    return new;
  end if;
  me := public.current_member();
  if me.role = 'webmaster' then
    if new.colour is distinct from old.colour then
      new.submitted_by := me.email;
      new.approved_by  := me.email;
      new.approved_at  := now();
    end if;
  else
    new.colour := old.colour;
    -- asking for the colour it already has is no change at all
    if new.pending_colour = old.colour then
      new.pending_colour := null;
    end if;
    if new.pending_colour is not null and new.pending_colour is distinct from old.pending_colour then
      new.submitted_by := coalesce(me.email, auth.jwt() ->> 'email');
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists calendar_colour_gate on public.calendar_colours;
create trigger calendar_colour_gate
  before update on public.calendar_colours
  for each row execute function public.calendar_colour_gate();

-- Approving: any account that may change calendar colours, except whoever asked for the change.
create or replace function public.approve_calendar_colour(colour_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.members;
  row_ public.calendar_colours;
begin
  me := public.current_member();
  if me.email is null or not public.can_edit('calendar') then
    raise exception 'Your account can''t approve calendar colours' using errcode = '42501';
  end if;
  select * into row_ from public.calendar_colours where kind = colour_kind for update;
  if not found then
    raise exception 'That calendar colour no longer exists';
  end if;
  if row_.pending_colour is null then
    return;
  end if;
  if lower(coalesce(row_.submitted_by, '')) = lower(me.email) then
    raise exception 'Someone else has to approve your own change' using errcode = 'P0001';
  end if;
  perform set_config('bpsc.approving', 'on', true);
  update public.calendar_colours
     set colour = row_.pending_colour, pending_colour = null,
         approved_by = me.email, approved_at = now(), updated_at = now()
   where kind = colour_kind;
  perform set_config('bpsc.approving', 'off', true);
end;
$$;

revoke all on function public.approve_calendar_colour(text) from public, anon;
grant execute on function public.approve_calendar_colour(text) to authenticated;

notify pgrst, 'reload schema';
