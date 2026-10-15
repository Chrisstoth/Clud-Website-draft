-- Taking a post off the homepage slideshow. Run AFTER 027_slideshow_order.sql.
--
--   - The red cross in the members' area's slideshow list takes a post off the slideshow. It stays
--     in Club News and everywhere else; it just isn't a slide any more.
--   - Posts taken off are listed under the slideshow with a "Put back" button, which returns
--     the post to the top of the list.
--   - Bumping an edited story to the top (026) puts it back on the slideshow too.
--   - Like pinning and reordering, this applies straight away, without going through approval.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

alter table public.feed add column if not exists off_slideshow boolean not null default false;

-- A bump puts the post back at the top of the slideshow, and back on it if it had been taken off.
create or replace function public.feed_bump_slide()
returns trigger
language plpgsql
as $$
begin
  if new.bumped_at is not null and new.bumped_at is distinct from old.bumped_at then
    new.hero_at := now();
    new.off_slideshow := false;
  end if;
  return new;
end;
$$;

-- Take a post off the slideshow (off = true; it's unpinned too), or put it back at the top.
create or replace function public.set_slide_off(item_id bigint, off boolean)
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
  update public.feed
     set off_slideshow = off,
         pinned = case when off then false else pinned end,
         hero_at = case when off then hero_at else now() end
   where id = item_id;
  perform set_config('bpsc.approving', 'off', true);
end;
$$;

revoke all on function public.set_slide_off(bigint, boolean) from public, anon;
grant execute on function public.set_slide_off(bigint, boolean) to authenticated;

notify pgrst, 'reload schema';
