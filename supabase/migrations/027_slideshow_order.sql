-- The homepage slideshow as a list the club arranges by hand. Run AFTER 026_news_bump.sql.
--
--   - Every new post of any kind goes to the top of the list (hero_at = when it was posted).
--     Galas, socials and training changes drop off by themselves once they're over.
--   - A post can be pinned: pinned posts lead the list until someone unpins them. This replaces
--     the old "pin until" date; posts pinned today stay pinned.
--   - The up/down arrows in the members' area reorder the list (reorder_slides).
--   - Bumping an edited story to the top (026) also puts it back at the top of the slideshow.
--   - Arranging the slideshow doesn't change any post's content, so it applies straight away,
--     without going through approval.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

alter table public.feed add column if not exists hero_at timestamptz not null default now();
alter table public.feed add column if not exists pinned boolean not null default false;

-- First run only: put the posts already there in roughly today's order -- a story by when it was
-- posted (or bumped), anything else by when it was added -- and keep anything pinned in date
-- pinned. (Ids break ties between posts added at the same moment.)
do $$
begin
  if (select count(distinct hero_at) from public.feed) <= 1 then
    update public.feed set pinned = true where pin_until >= current_date;
    update public.feed
       set hero_at = case when type = 'news'
                          then coalesce(bumped_at, least(start_date::timestamptz, created_at))
                          else coalesce(bumped_at, created_at) end
                     + id * interval '1 millisecond';
  end if;
end $$;

-- A bump (bumped_at changing) puts the post back at the top of the slideshow too.
create or replace function public.feed_bump_slide()
returns trigger
language plpgsql
as $$
begin
  if new.bumped_at is not null and new.bumped_at is distinct from old.bumped_at then
    new.hero_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists feed_bump_slide on public.feed;
create trigger feed_bump_slide
  before update on public.feed
  for each row execute function public.feed_bump_slide();

-- Club accounts that can post anything to the Club Feed may arrange the slideshow.
create or replace function public.can_arrange_slides()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(auth.jwt() ->> 'email')
      and (m.role in ('webmaster', 'poster') or coalesce(array_length(m.feed_types, 1), 0) > 0)
  );
$$;

-- Pin or unpin. Pinning puts the post at the front of the pinned ones.
create or replace function public.set_slide_pin(item_id bigint, pin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_arrange_slides() then
    raise exception 'Your account can''t arrange the homepage slideshow' using errcode = '42501';
  end if;
  perform set_config('bpsc.approving', 'on', true);
  update public.feed set pinned = pin, hero_at = case when pin then now() else hero_at end
   where id = item_id;
  perform set_config('bpsc.approving', 'off', true);
end;
$$;

-- Put these posts in this order (first = top), in the slots they already fill between them.
create or replace function public.reorder_slides(ids bigint[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  top timestamptz;
  i int;
begin
  if not public.can_arrange_slides() then
    raise exception 'Your account can''t arrange the homepage slideshow' using errcode = '42501';
  end if;
  select max(hero_at) into top from public.feed where id = any (ids);
  if top is null then
    return;
  end if;
  perform set_config('bpsc.approving', 'on', true);
  for i in 1 .. coalesce(array_length(ids, 1), 0) loop
    update public.feed set hero_at = top - (i - 1) * interval '1 second' where id = ids[i];
  end loop;
  perform set_config('bpsc.approving', 'off', true);
end;
$$;

revoke all on function public.can_arrange_slides()             from public, anon;
revoke all on function public.set_slide_pin(bigint, boolean)   from public, anon;
revoke all on function public.reorder_slides(bigint[])         from public, anon;
grant execute on function public.can_arrange_slides()           to authenticated;
grant execute on function public.set_slide_pin(bigint, boolean) to authenticated;
grant execute on function public.reorder_slides(bigint[])       to authenticated;

notify pgrst, 'reload schema';
