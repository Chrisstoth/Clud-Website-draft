-- A gala and its news article, kept together. Run AFTER 029_gala_article.sql.
--
--   - The article page now shows a live box for its gala (dates, venue, entry pack, a button to
--     the gala's card), drawn from the gala itself, so it's always up to date. The links 029 typed
--     into the end of each article are no longer added -- the page hides old ones once it shows
--     the box.
--   - update_meet_article(): from the gala form, update the gala's article -- new headline and
--     summary, an optional "Update, 2 Nov 2026: ..." line added at the top -- and bump it back to
--     the top of Club News and the homepage slideshow (026/027). Like any edit, it waits for
--     approval unless a webmaster made it.
--   - link_meet_article(): tie a story already written in Club News to its gala, so a gala that
--     got its story the long way round gets the box and the update button too. Only the link
--     changes, so the story stays live.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

create or replace function public.post_meet_article(meet_id bigint, title text, blurb text, body text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.members;
  meet public.feed;
  new_id bigint;
begin
  me := public.current_member();
  select * into meet from public.feed where id = meet_id;
  if not found or meet.type not in ('meet', 'external_meet', 'team_meet') then
    raise exception 'That gala no longer exists';
  end if;
  if me.email is null or not public.can_edit('feed', meet.type) then
    raise exception 'Your account can''t post an article for that gala' using errcode = '42501';
  end if;
  if exists (select 1 from public.feed where source_meet_id = meet_id and deleted_at is null) then
    raise exception 'This gala already has a news article — edit that one in Club News' using errcode = 'P0001';
  end if;
  if coalesce(btrim(title), '') = '' or coalesce(btrim(blurb), '') = '' then
    raise exception 'The article needs a headline and a summary' using errcode = 'P0001';
  end if;

  insert into public.feed (type, title, start_date, blurb, body, img, visible, topics, photos, doc_links, source_meet_id)
  values ('news', btrim(title), (now() at time zone 'Europe/London')::date, btrim(blurb),
          coalesce(body, ''), meet.img, true,
          '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, meet.id)
  returning id into new_id;
  return new_id;
end;
$$;

-- note: the "Update, <date>: ..." paragraph, already HTML (the members' area builds it; the
-- article page sanitises every body anyway). bump: back to the top of Club News and the slideshow.
create or replace function public.update_meet_article(meet_id bigint, title text, blurb text, note text, bump boolean)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.members;
  meet public.feed;
  story public.feed;
  new_body text;
begin
  me := public.current_member();
  select * into meet from public.feed where id = meet_id;
  if not found or meet.type not in ('meet', 'external_meet', 'team_meet') then
    raise exception 'That gala no longer exists';
  end if;
  if me.email is null or not public.can_edit('feed', meet.type) then
    raise exception 'Your account can''t update the article for that gala' using errcode = '42501';
  end if;
  select * into story from public.feed
   where source_meet_id = meet_id and deleted_at is null order by id desc limit 1;
  if not found then
    raise exception 'This gala has no news article to update' using errcode = 'P0001';
  end if;
  if coalesce(btrim(title), '') = '' or coalesce(btrim(blurb), '') = '' then
    raise exception 'The article needs a headline and a summary' using errcode = 'P0001';
  end if;

  -- the links 022/029 typed onto the end -- the article page's gala box replaces them
  new_body := coalesce(story.body, '');
  new_body := regexp_replace(new_body,
    '<p>See all the details on the <a href="open-meets#meet-[0-9]+"[^>]*>Open Meets page</a>(, or <a [^>]*>read the entry pack</a>)?\.</p>\s*$', '');
  new_body := regexp_replace(new_body,
    '<p><a [^>]*>Read the entry pack</a>, or see all the details on the <a href="open-meets"[^>]*>Open Meets</a> page\.</p>\s*$', '');
  if coalesce(btrim(note), '') <> '' then
    new_body := btrim(note) || new_body;
  end if;

  update public.feed
     set title = btrim(update_meet_article.title),
         blurb = btrim(update_meet_article.blurb),
         body = new_body,
         bumped_at = case when bump then now() else bumped_at end
   where id = story.id;
  return story.id;
end;
$$;

create or replace function public.link_meet_article(meet_id bigint, article_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.members;
  meet public.feed;
  story public.feed;
begin
  me := public.current_member();
  select * into meet from public.feed where id = meet_id;
  if not found or meet.type not in ('meet', 'external_meet', 'team_meet') then
    raise exception 'That gala no longer exists';
  end if;
  if me.email is null or not public.can_edit('feed', meet.type) then
    raise exception 'Your account can''t link an article to that gala' using errcode = '42501';
  end if;
  if exists (select 1 from public.feed where source_meet_id = meet_id and deleted_at is null) then
    raise exception 'This gala already has a news article' using errcode = 'P0001';
  end if;
  select * into story from public.feed where id = article_id;
  if not found or story.type <> 'news' or story.deleted_at is not null then
    raise exception 'That article no longer exists' using errcode = 'P0001';
  end if;
  if story.source_meet_id is not null and story.source_meet_id <> meet_id
     and exists (select 1 from public.feed where id = story.source_meet_id) then
    raise exception 'That article already belongs to another gala' using errcode = 'P0001';
  end if;

  -- only the link changes, so don't send the story back for review
  perform set_config('bpsc.approving', 'on', true);
  update public.feed set source_meet_id = meet_id where id = article_id;
  perform set_config('bpsc.approving', 'off', true);
end;
$$;

revoke all on function public.update_meet_article(bigint, text, text, text, boolean) from public, anon;
revoke all on function public.link_meet_article(bigint, bigint) from public, anon;
grant execute on function public.update_meet_article(bigint, text, text, text, boolean) to authenticated;
grant execute on function public.link_meet_article(bigint, bigint) to authenticated;

notify pgrst, 'reload schema';
