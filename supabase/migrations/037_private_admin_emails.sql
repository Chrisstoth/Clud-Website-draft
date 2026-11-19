-- Keep admins' email addresses inside the club.
--
-- Peer review (024), the recycle bin (025) and calendar colours (036) record WHO posted, approved,
-- binned or changed something, as their email address. Until now anyone could read those with
-- the site's public key -- every visitor's browser was sent them along with the posts.
--
-- From here:
--   - Nobody can read submitted_by / approved_by / deleted_by on the feed directly, signed in or
--     not. Every other column of a post reads exactly as before.
--   - The members' area gets them from feed_names(), which answers only for accounts on the
--     club's members list -- not just anyone who has managed to sign in.
--   - The same for calendar colours: the public reads kind + colour; club accounts get the whole
--     row (who asked for a change, who approved it) from calendar_colours_admin().
--
-- IMPORTANT for later migrations: reading the feed is now granted column by column, so a NEW
-- column added to public.feed can't be read until it's shared. After adding one, run:
--     select public.share_feed_columns();
--
-- Run once in the Supabase SQL Editor, after 036. Safe to re-run.

-- 1. The feed: share every column except the three that hold an email address.
create or replace function public.share_feed_columns()
returns void
language plpgsql
set search_path = public
as $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
    from information_schema.columns
   where table_schema = 'public' and table_name = 'feed'
     and column_name not in ('submitted_by', 'approved_by', 'deleted_by');
  execute 'revoke select on public.feed from anon, authenticated';
  execute format('grant select (%s) on public.feed to anon, authenticated', cols);
end;
$$;
revoke all on function public.share_feed_columns() from public, anon, authenticated;

select public.share_feed_columns();

-- Who posted, approved and binned each item -- for club accounts only (the members' area shows
-- "Awaiting approval · from …", hides the Approve button on your own posts, and lists who binned what).
create or replace function public.feed_names()
returns table (id bigint, submitted_by text, approved_by text, deleted_by text)
language sql
stable
security definer
set search_path = public
as $$
  select f.id, f.submitted_by, f.approved_by, f.deleted_by
    from public.feed f
   where (public.current_member()).email is not null;
$$;
revoke all on function public.feed_names() from public, anon;
grant execute on function public.feed_names() to authenticated;

-- 2. Calendar colours: everyone reads kind + colour only; club accounts get the full rows here.
revoke select on public.calendar_colours from anon, authenticated;
grant select (kind, colour) on public.calendar_colours to anon, authenticated;

create or replace function public.calendar_colours_admin()
returns setof public.calendar_colours
language sql
stable
security definer
set search_path = public
as $$
  select c.* from public.calendar_colours c
   where (public.current_member()).email is not null
   order by c.sort_order;
$$;
revoke all on function public.calendar_colours_admin() from public, anon;
grant execute on function public.calendar_colours_admin() to authenticated;

notify pgrst, 'reload schema';
