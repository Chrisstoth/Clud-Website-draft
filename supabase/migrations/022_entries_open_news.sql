-- "Entries open" news story, posted automatically when a gala first gets its entry pack link.
--
-- Applies to open meets (BPSC-hosted 'meet' and other hosts' 'external_meet'). The story is posted
-- the moment the meet is saved with an entry pack link for the first time -- added to a new meet,
-- or filled in on an existing one -- as an ordinary Club News item dated today, so it shows on the
-- News page and the homepage like any other story. Comms can then edit it (add tags, a picture,
-- more words) or delete it like any story they'd written themselves.
--
-- It's done here in the database rather than by the members' area because the Open Meets
-- Secretary's account may only write meets, not news; this trigger runs on the database's own
-- authority, so the story appears whoever saved the link.
--
-- Not posted (so no surprise stories) when the meet:
--   - is hidden from the website (it IS posted later, when the meet is made visible, if it still
--     has a link and never had a story);
--   - has its entry status set to "closed", or its first day has already passed (typing in old
--     galas for the archive);
--   - already had a story -- removing the link and pasting a new one doesn't post a second.
-- Meets that already have an entry pack link when this is run are left alone.
--
-- Safe to re-run: the column is only added if missing, and the function and trigger are replaced.

-- The meet a story was posted for (null for every story a person wrote).
alter table public.feed add column if not exists source_meet_id bigint
  references public.feed(id) on delete set null;

create or replace function public.post_entries_open_news()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'Europe/London')::date;
  when_txt text;
  safe_title text;
  safe_url text;
begin
  if new.type not in ('meet','external_meet') then return new; end if;
  if coalesce(btrim(new.entry_url),'') = '' or not new.visible then return new; end if;
  if coalesce(new.status,'open') = 'closed' or new.start_date < today then return new; end if;
  -- only when the link (or the meet itself, on the public site) is new
  if tg_op = 'UPDATE' and coalesce(btrim(old.entry_url),'') <> '' and old.visible then return new; end if;
  if exists (select 1 from public.feed where source_meet_id = new.id) then return new; end if;

  when_txt := to_char(new.start_date,'FMDD Mon YYYY')
    || case when new.end_date is not null and new.end_date <> new.start_date
            then ' – ' || to_char(new.end_date,'FMDD Mon YYYY') else '' end;
  safe_title := replace(replace(replace(replace(new.title,'&','&amp;'),'<','&lt;'),'>','&gt;'),'"','&quot;');
  safe_url := replace(replace(replace(btrim(new.entry_url),'&','&amp;'),'"','&quot;'),'<','&lt;');

  insert into public.feed (type, title, start_date, blurb, body, img, visible, topics, photos, doc_links, source_meet_id)
  values (
    'news',
    'Entries open: ' || new.title,
    today,
    'Entries are now open for ' || new.title || ' (' || when_txt || ')'
      || coalesce(' at ' || nullif(btrim(new.venue),''), '') || '.'
      || coalesce(' Entries close ' || to_char(new.closing,'FMDD Mon YYYY') || '.', ''),
    '<p>Entries are now open for <strong>' || safe_title || '</strong>, ' || when_txt
      || coalesce(' at ' || replace(replace(nullif(btrim(new.venue),''),'&','&amp;'),'<','&lt;'), '') || '.</p>'
      || coalesce('<p>Entries close on <strong>' || to_char(new.closing,'FMDD Mon YYYY') || '</strong>.</p>', '')
      || '<p><a href="' || safe_url || '">Read the entry pack</a>, or see all the details on the <a href="open-meets">Open Meets</a> page.</p>',
    new.img,
    true,
    '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
    new.id
  );
  return new;
end;
$$;

drop trigger if exists feed_entries_open_news on public.feed;
create trigger feed_entries_open_news
  after insert or update of entry_url, visible on public.feed
  for each row execute function public.post_entries_open_news();

notify pgrst, 'reload schema';
