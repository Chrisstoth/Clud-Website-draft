-- A gala's news article, written on the gala form. Run AFTER 027_slideshow_order.sql.
--
--   - Adding or editing a gala can also post one news article about it ("Entries open: ...").
--     The article is what goes in Club News and the homepage slideshow; the gala itself no longer
--     takes a slide of its own (unless someone pins it).
--   - The article ends with links to the gala on the Open Meets page (opened at that gala) and to
--     its entry pack, added here so they're always right.
--   - It's posted by post_meet_article() rather than by the members' area, because the Open Meets
--     Secretary's account may write galas but not news. Like any post, it waits for approval
--     unless a webmaster posted it.
--   - The automatic "Entries open" story from 022 is switched off: an article is only posted when
--     someone asks for one. Stories it already posted stay as ordinary articles.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

drop trigger if exists feed_entries_open_news on public.feed;

create or replace function public.post_meet_article(meet_id bigint, title text, blurb text, body text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.members;
  meet public.feed;
  links text;
  safe_url text;
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

  links := '<p>See all the details on the <a href="open-meets#meet-' || meet.id || '">Open Meets page</a>';
  if coalesce(btrim(meet.entry_url), '') <> '' then
    safe_url := replace(replace(replace(btrim(meet.entry_url), '&', '&amp;'), '"', '&quot;'), '<', '&lt;');
    links := links || ', or <a href="' || safe_url || '">read the entry pack</a>';
  end if;
  links := links || '.</p>';

  insert into public.feed (type, title, start_date, blurb, body, img, visible, topics, photos, doc_links, source_meet_id)
  values ('news', btrim(title), (now() at time zone 'Europe/London')::date, btrim(blurb),
          coalesce(body, '') || links, meet.img, true,
          '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, meet.id)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.post_meet_article(bigint, text, text, text) from public, anon;
grant execute on function public.post_meet_article(bigint, text, text, text) to authenticated;

notify pgrst, 'reload schema';
