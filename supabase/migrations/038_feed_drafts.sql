-- Drafts for the Club Feed: save a post (or a gala) half-written and come back to it.
--
--   - "Save as draft" in the members' area saves it with review = 'draft'. A draft is never on
--     the public site, and isn't waiting for approval either: it's just kept.
--   - Club accounts see every draft (under Drafts in the members' area), so a draft can be
--     finished by someone else -- the same as Club Posters can already edit each other's posts.
--   - Publishing a draft is an ordinary save: a Webmaster's goes live, anyone else's waits for a
--     second person's OK (024). It's treated as a new post: it goes to the top of the homepage
--     slideshow, and its posted date is the day it's published, not the day the draft was started.
--   - Only a new post, or one that's already a draft, can be saved as a draft. A live or waiting
--     post can't be pulled back into drafts by a save (Delete still takes a post down).
--   - A draft that's deleted and restored from the recycle bin comes back as a draft.
--
-- The site keeps working if this hasn't been run: there's just no "Save as draft" button yet.
--
-- Run once in the Supabase SQL Editor, after 037. Safe to re-run.

alter table public.feed drop constraint if exists feed_review_check;
alter table public.feed add constraint feed_review_check check (review in ('draft', 'pending', 'published'));

-- The review gate from 025, now with drafts.
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
  -- Kept as a draft: only a new post, or one that's a draft already.
  if new.review = 'draft' and (tg_op = 'INSERT' or old.review = 'draft') then
    new.approved_by := null;
    new.approved_at := null;
    return new;
  end if;
  -- A draft being published counts as a new post.
  if tg_op = 'UPDATE' and old.review = 'draft' then
    new.created_at := now();
    new.hero_at := now();
  end if;
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

-- Restoring from the recycle bin (025): a draft comes back as a draft.
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
  if me.role = 'webmaster' or item.review = 'draft' then
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

revoke all on function public.restore_feed_item(bigint) from public, anon;
grant execute on function public.restore_feed_item(bigint) to authenticated;

-- The members' area asks this at sign-in, and offers "Save as draft" only once it answers: before
-- this migration, the old review gate would publish a Webmaster's "draft" straight away.
create or replace function public.feed_drafts_ready()
returns boolean
language sql
stable
as $$ select true $$;
revoke all on function public.feed_drafts_ready() from public, anon;
grant execute on function public.feed_drafts_ready() to authenticated;

notify pgrst, 'reload schema';
