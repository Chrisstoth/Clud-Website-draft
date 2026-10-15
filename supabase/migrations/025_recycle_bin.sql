-- Recycle bin for the Club Feed. Run AFTER 024_peer_review.sql.
--
--   - "Delete" in the members' area moves an item to the bin (bin_feed_item): it leaves the
--     public site at once but is kept for 7 days.
--   - Any club account that may edit that kind of item can restore it (restore_feed_item). A
--     non-webmaster's restore goes back through approval, so a removed post can't be put back
--     live single-handed.
--   - Only webmasters can delete permanently, and only from the bin.
--   - Items binned more than 7 days ago are removed by purge_recycle_bin(), which the members'
--     area calls whenever someone signs in.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

alter table public.feed add column if not exists deleted_at timestamptz;
alter table public.feed add column if not exists deleted_by text;

-- The review gate from 024, now also keeping deleted_at/deleted_by out of ordinary saves: only
-- the bin functions below may change them. bpsc.approving is set only by this database's own
-- functions (approve, bin, restore) for their own updates.
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
  if tg_op = 'INSERT' then
    new.deleted_at := null;
    new.deleted_by := null;
  else
    new.deleted_at := old.deleted_at;
    new.deleted_by := old.deleted_by;
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

create or replace function public.bin_feed_item(item_id bigint)
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
  select * into item from public.feed where id = item_id for update;
  if not found then
    raise exception 'That item no longer exists';
  end if;
  if me.email is null or not public.can_edit('feed', item.type) then
    raise exception 'Your account can''t delete that kind of item' using errcode = '42501';
  end if;
  perform set_config('bpsc.approving', 'on', true);
  update public.feed set deleted_at = now(), deleted_by = me.email where id = item_id;
  perform set_config('bpsc.approving', 'off', true);
end;
$$;

create or replace function public.restore_feed_item(item_id bigint)
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
  select * into item from public.feed where id = item_id for update;
  if not found then
    raise exception 'That item is no longer in the recycle bin';
  end if;
  if me.email is null or not public.can_edit('feed', item.type) then
    raise exception 'Your account can''t restore that kind of item' using errcode = '42501';
  end if;
  perform set_config('bpsc.approving', 'on', true);
  if me.role = 'webmaster' then
    update public.feed set deleted_at = null, deleted_by = null where id = item_id;
  else
    update public.feed
       set deleted_at = null, deleted_by = null,
           review = 'pending', submitted_by = me.email, approved_by = null, approved_at = null
     where id = item_id;
  end if;
  perform set_config('bpsc.approving', 'off', true);
end;
$$;

create or replace function public.purge_recycle_bin()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.feed where deleted_at < now() - interval '7 days';
$$;

revoke all on function public.bin_feed_item(bigint)     from public, anon;
revoke all on function public.restore_feed_item(bigint) from public, anon;
revoke all on function public.purge_recycle_bin()       from public, anon;
grant execute on function public.bin_feed_item(bigint)     to authenticated;
grant execute on function public.restore_feed_item(bigint) to authenticated;
grant execute on function public.purge_recycle_bin()       to authenticated;

-- Permanent delete: webmasters only, and only from the bin.
drop policy if exists "feed delete" on public.feed;
create policy "feed delete" on public.feed for delete to authenticated
  using ((public.current_member()).role = 'webmaster' and deleted_at is not null);

-- The public never sees binned items; club accounts see them in the bin.
drop policy if exists "public read feed" on public.feed;
create policy "public read feed" on public.feed for select
  using ((review = 'published' and deleted_at is null) or (public.current_member()).email is not null);

notify pgrst, 'reload schema';
