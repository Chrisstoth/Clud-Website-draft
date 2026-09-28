-- Instagram row on the News page: adds the instagram_settings table, a single row holding
-- the Behold feed ID (behold.so serves the club's latest Instagram posts as JSON) and the
-- Instagram post IDs an editor has chosen to hide. Posts are shown unless they're listed in
-- hidden_posts, so anything new appears on the site automatically.
--
-- Editable in the members' area ("Instagram on the News page") by the Comms / Club News and
-- Socials Team accounts, and the webmaster.
--
-- Unlike earlier migrations, the site keeps working if this hasn't been run yet: the Instagram
-- row just stays hidden, and the members' area section says the table is missing.
--
-- Safe to re-run: creates the table and seed row once (guarded), re-creates can_edit()
-- (create or replace) and re-adds the two policies (drop-then-create). Existing settings kept.

create table if not exists public.instagram_settings (
  id            smallint primary key default 1,
  feed_id       text,
  hidden_posts  text[] not null default '{}',
  updated_at    timestamptz not null default now(),
  constraint instagram_settings_single_row check (id = 1)
);

insert into public.instagram_settings (id) values (1) on conflict (id) do nothing;

alter table public.instagram_settings enable row level security;

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
      )
  );
$$;

drop policy if exists "public read instagram" on public.instagram_settings;
create policy "public read instagram" on public.instagram_settings for select using (true);

drop policy if exists "instagram write" on public.instagram_settings;
create policy "instagram write" on public.instagram_settings for all to authenticated
  using (public.can_edit('instagram')) with check (public.can_edit('instagram'));

drop trigger if exists touch_instagram_settings on public.instagram_settings;
create trigger touch_instagram_settings before update on public.instagram_settings
  for each row execute function public.touch_updated_at();

-- Tell the API to re-read the table layout now, so the members' area can save straight away.
notify pgrst, 'reload schema';
