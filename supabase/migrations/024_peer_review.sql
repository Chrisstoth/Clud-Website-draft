-- Peer review for the Club Feed, a simple "Club Poster" account, and a page for the webmaster
-- to give and take away posting access.
--
-- How it works:
--   - Club Posters can add and edit every kind of feed item (news, socials, training changes,
--     galas) and edit each other's.
--   - Anything a non-webmaster saves -- a new item or an edit to a live one -- is held as
--     "pending" and kept off the public site until a DIFFERENT club account approves it. So no
--     one can publish alone, and a live post can't be swapped for something else unseen.
--   - Webmasters' saves go live straight away, and they can approve anything.
--   - Removing someone's row from public.members stops them at once: every write checks it.
-- The database enforces all of this, so it holds even if someone tinkers with the page.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

-- 1. Review state on every feed item. Existing items stay live.
--    ("status" is already taken: it's a meet's entries open/closed.)
alter table public.feed add column if not exists review text not null default 'published';
alter table public.feed drop constraint if exists feed_review_check;
alter table public.feed add constraint feed_review_check check (review in ('pending','published'));
alter table public.feed add column if not exists submitted_by text;
alter table public.feed add column if not exists approved_by  text;
alter table public.feed add column if not exists approved_at  timestamptz;

-- 2. Club Poster: every feed type, and may add news tags while writing a story.
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
        or  section = 'guides'
      )
  );
$$;

-- 3. Every save from the members' area is stamped with who made it, and held for review unless
--    a webmaster made it. Saves with no signed-in user (the dashboard, the SQL editor) are left
--    alone, as is the approval itself (approve_feed_item sets bpsc.approving for its own update).
create or replace function public.feed_review_gate()
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
  new.submitted_by := coalesce(me.email, auth.jwt() ->> 'email');
  if me.role = 'webmaster' then
    new.review := 'published';
    new.approved_by := me.email;
    new.approved_at := now();
  else
    new.review := 'pending';
    new.approved_by := null;
    new.approved_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists feed_review_gate on public.feed;
create trigger feed_review_gate
  before insert or update on public.feed
  for each row execute function public.feed_review_gate();

-- 4. Approving: any club account that may edit that kind of item, except whoever last saved it.
create or replace function public.approve_feed_item(item_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.members;
  item public.feed;
begin
  me := public.current_member();
  if me.email is null then
    raise exception 'Only club accounts can approve posts' using errcode = '42501';
  end if;
  select * into item from public.feed where id = item_id for update;
  if not found then
    raise exception 'That item no longer exists';
  end if;
  if item.review <> 'pending' then
    return;
  end if;
  if not public.can_edit('feed', item.type) then
    raise exception 'Your account can''t approve that kind of item' using errcode = '42501';
  end if;
  if lower(coalesce(item.submitted_by, '')) = lower(me.email) then
    raise exception 'Someone else has to approve your own post' using errcode = 'P0001';
  end if;
  perform set_config('bpsc.approving', 'on', true);
  update public.feed
     set review = 'published', approved_by = me.email, approved_at = now()
   where id = item_id;
  perform set_config('bpsc.approving', 'off', true);
end;
$$;

revoke all on function public.approve_feed_item(bigint) from public, anon;
grant execute on function public.approve_feed_item(bigint) to authenticated;

-- 5. The public sees only approved items; club accounts also see what's waiting for review.
drop policy if exists "public read feed" on public.feed;
create policy "public read feed" on public.feed for select
  using (review = 'published' or (public.current_member()).email is not null);

-- 6. Webmasters can see and change the list of who has access (the Posting access page).
drop policy if exists "webmaster reads members"  on public.members;
drop policy if exists "webmaster writes members" on public.members;
create policy "webmaster reads members" on public.members for select to authenticated
  using ((public.current_member()).role = 'webmaster');
create policy "webmaster writes members" on public.members for all to authenticated
  using ((public.current_member()).role = 'webmaster')
  with check ((public.current_member()).role = 'webmaster');

notify pgrst, 'reload schema';
