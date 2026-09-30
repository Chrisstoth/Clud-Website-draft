-- News tags: one list the club manages, which is both how a story is labelled and what visitors
-- can follow. It's made of two parts:
--   - every squad in Squad Timetables, automatically (add a squad there and it's a tag);
--   - the club's own tags (Trips, Open Water, Officials…), in the new news_topics table, added
--     and renamed in the members' area under "News Tags" (or straight from the news form).
-- A story can have any number of tags, or none (whole-club news). Visitors pick tags to follow on
-- the News page; their stories get a "For you" label and new ones put a count on the Club News
-- link. What each visitor follows stays in their own browser -- nothing about it reaches here.
--
-- Stored on the story as feed.topics, a list of references rather than names, so renaming a tag
-- or a squad carries through everywhere: "s:<squads.id>" for a squad, "t:<news_topics.id>" for a
-- club tag, e.g. ["s:3","t:1"]. A reference to something since deleted is simply ignored.
--
-- This replaces the free-text "Category tag" on news stories: each distinct category already in
-- use becomes a club tag, and each story is given the tag its category became. (The old tag column
-- is left in place, emptied, so nothing that still reads it breaks.)
--
-- Comms / Club News can manage the tags, as well as the webmaster.
--
-- Run this BEFORE the updated site files go up: every page loads the news_topics table, and the
-- members' area sends feed.topics with every save.
--
-- Safe to re-run: tables/columns are guarded, can_edit() is create-or-replace, policies and the
-- trigger are drop-then-create, and the category move only picks up stories still holding one.

create table if not exists public.news_topics (
  id          bigint generated always as identity primary key,
  name        text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.news_topics enable row level security;

create or replace function public.can_edit(section text, feed_type text default null)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(auth.jwt() ->> 'email')
      and (
        m.role = 'webmaster'
        or (section = 'feed'      and m.feed_types is not null and feed_type = any (m.feed_types))
        or (section = 'coaches'   and m.role = 'coaching')
        or (section = 'squads'    and m.role = 'coaching')
        or (section = 'roles'     and m.role = 'volunteers')
        or (section = 'welfare'   and m.role = 'welfare')
        or (section = 'committee' and m.role = 'secretary')
        or (section = 'instagram' and m.role in ('comms', 'socials'))
        or (section = 'topics'    and m.role = 'comms')
      )
  );
$$;

drop policy if exists "public read topics" on public.news_topics;
create policy "public read topics" on public.news_topics for select using (true);

drop policy if exists "topics write" on public.news_topics;
create policy "topics write" on public.news_topics for all to authenticated
  using (public.can_edit('topics')) with check (public.can_edit('topics'));

drop trigger if exists touch_news_topics on public.news_topics;
create trigger touch_news_topics before update on public.news_topics
  for each row execute function public.touch_updated_at();

alter table public.feed add column if not exists topics jsonb not null default '[]'::jsonb;

-- Each category in use becomes a club tag (once -- "Trips" and "trips " are the same one)…
insert into public.news_topics (name)
select distinct on (lower(trim(f.tag))) trim(f.tag)
from public.feed f
where f.type = 'news' and nullif(trim(f.tag), '') is not null
  and not exists (select 1 from public.news_topics t where lower(t.name) = lower(trim(f.tag)))
order by lower(trim(f.tag)), trim(f.tag);

-- …and each story gets the tag its category became, then its category is cleared.
update public.feed f set
  topics = case when f.topics @> jsonb_build_array('t:' || t.id) then f.topics
                else f.topics || jsonb_build_array('t:' || t.id) end,
  tag = null
from public.news_topics t
where f.type = 'news' and nullif(trim(f.tag), '') is not null
  and lower(t.name) = lower(trim(f.tag));

-- An earlier draft of this change stored squads by name in feed.squads. If that was run, move
-- any squads it holds across as references, then drop it.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'feed' and column_name = 'squads') then
    update public.feed f set topics = f.topics || coalesce(
      (select jsonb_agg('s:' || s.id) from public.squads s
        where f.squads ? s.name and not f.topics @> jsonb_build_array('s:' || s.id)), '[]'::jsonb)
    where jsonb_array_length(f.squads) > 0;
    alter table public.feed drop column squads;
  end if;
end $$;

-- Tell the API to re-read the table layout now, so saving works straight away.
notify pgrst, 'reload schema';
