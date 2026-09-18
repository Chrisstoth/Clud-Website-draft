-- BPSC website content store.
-- Run this once in the Supabase SQL editor (Database -> SQL editor -> New query).
--
-- Shape follows the site: one "feed" table holding every dated/publishable item tagged
-- by type, plus coaches, squads, volunteer roles and the default picture library.
-- Trial enquiries are deliberately NOT stored here — they contain children's details and
-- are emailed to the membership address instead.

create table if not exists public.feed (
  id                   bigint generated always as identity primary key,
  type                 text not null check (type in ('meet','external_meet','team_meet','social','news','training')),
  title                text not null,
  start_date           date,
  end_date             date,
  -- meets
  host                 text,
  league               text,
  level                text,
  license              text,
  pool_type            text,
  venue                text,
  closing              date,
  status               text check (status in ('open','closed')),
  entry_url            text,
  officials_url        text,
  volunteer_url        text,
  results_url          text,
  league_url           text,
  conditions_url       text,
  conditions_label     text,
  entry_file_url       text,
  entry_file_label     text,
  current_entries_url  text,
  notes                text,
  -- socials & news
  blurb                text,
  link                 text,
  color                text,
  tag                  text,
  note                 text,
  img                  text,
  -- full article view (news & socials): a photo gallery for the article's slideshow, and a
  -- rich (sanitized-HTML) body. "blurb" stays the short summary used in cards and the home feed.
  photos               jsonb not null default '[]'::jsonb,
  body                 text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists feed_type_start_idx on public.feed (type, start_date);

-- Safe to re-run against a database created before these columns existed.
alter table public.feed add column if not exists photos jsonb not null default '[]'::jsonb;
alter table public.feed add column if not exists body text;

create table if not exists public.coaches (
  id          bigint generated always as identity primary key,
  name        text not null,
  role        text not null,
  quals       text,
  squads      jsonb not null default '[]'::jsonb,
  photo       text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Weekly sessions stay as jsonb: they are always edited and displayed as one whole
-- week per squad, never queried individually, and "end" is awkward as a column name.
-- Each entry: {"day":"Mon","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"}
create table if not exists public.squads (
  id          bigint generated always as identity primary key,
  name        text not null,
  lead        text,
  sessions    jsonb not null default '[]'::jsonb,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.volunteer_roles (
  id          bigint generated always as identity primary key,
  title       text not null,
  commitment  text,
  training    text,
  blurb       text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.news_defaults (
  id          bigint generated always as identity primary key,
  key         text not null unique,
  label       text not null,
  icon        text,
  bg          text,
  img         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Who may edit what. Rows are added by hand in the dashboard; there is no sign-up.
-- feed_types limits which feed items a role may write (null = all of them).
create table if not exists public.members (
  email       text primary key,
  role        text not null,
  label       text not null,
  feed_types  text[],
  created_at  timestamptz not null default now()
);

create or replace function public.current_member()
returns public.members
language sql stable security definer set search_path = public as $$
  select * from public.members where lower(email) = lower(auth.jwt() ->> 'email');
$$;

create or replace function public.can_edit(section text, feed_type text default null)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(auth.jwt() ->> 'email')
      and (
        m.role = 'webmaster'
        or (section = 'feed'    and m.feed_types is not null and feed_type = any (m.feed_types))
        or (section = 'coaches' and m.role = 'coaching')
        or (section = 'squads'  and m.role = 'coaching')
        or (section = 'roles'   and m.role = 'volunteers')
      )
  );
$$;

alter table public.feed            enable row level security;
alter table public.coaches         enable row level security;
alter table public.squads          enable row level security;
alter table public.volunteer_roles enable row level security;
alter table public.news_defaults   enable row level security;
alter table public.members         enable row level security;

-- Anyone may read published content; the public site uses the publishable key.
create policy "public read feed"     on public.feed            for select using (true);
create policy "public read coaches"  on public.coaches         for select using (true);
create policy "public read squads"   on public.squads          for select using (true);
create policy "public read roles"    on public.volunteer_roles for select using (true);
create policy "public read pictures" on public.news_defaults   for select using (true);

-- Signed-in club accounts may see their own membership row (drives the members' area menu).
create policy "read own membership" on public.members for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Writes are limited to the section (and for the feed, the item type) each role owns.
create policy "feed insert" on public.feed for insert to authenticated
  with check (public.can_edit('feed', type));
create policy "feed update" on public.feed for update to authenticated
  using (public.can_edit('feed', type)) with check (public.can_edit('feed', type));
create policy "feed delete" on public.feed for delete to authenticated
  using (public.can_edit('feed', type));

create policy "coaches write" on public.coaches for all to authenticated
  using (public.can_edit('coaches')) with check (public.can_edit('coaches'));
create policy "squads write" on public.squads for all to authenticated
  using (public.can_edit('squads')) with check (public.can_edit('squads'));
create policy "roles write" on public.volunteer_roles for all to authenticated
  using (public.can_edit('roles')) with check (public.can_edit('roles'));
create policy "pictures write" on public.news_defaults for all to authenticated
  using (public.can_edit('newsDefaults')) with check (public.can_edit('newsDefaults'));

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['feed','coaches','squads','volunteer_roles','news_defaults'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$I', t);
    execute format('create trigger touch_%1$s before update on public.%1$I
                    for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Photos: a public bucket, readable by anyone, writable by any signed-in club account.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "images public read" on storage.objects for select
  using (bucket_id = 'site-images');
create policy "images club write" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and public.current_member() is not null);
create policy "images club delete" on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and public.current_member() is not null);
