-- Templates for the Club Feed: posts the club puts up again and again ("Pool closed", "Training
-- cancelled"...), kept ready-written so nobody starts from a blank form.
--
--   - A template is a Club News, Social / Event or Key Training Change post with everything but
--     its dates filled in. "+ Add new" offers them; picking one opens an ordinary new post with the
--     template's words, pictures and attachments already in, ready to change and publish (or save
--     as a draft). Publishing goes through review as usual (024): the template itself never does.
--   - Templates are never on the public site. Anyone who can post that kind of item can see, use,
--     add, change and delete its templates -- they're the club's, not one person's.
--   - data holds the post's fields as the members' area names them (title, blurb, body, img,
--     photos, docLinks, topics...). updated_by is set here on every save.
--
-- The site keeps working if this hasn't been run: there are just no templates yet.
--
-- Run once in the Supabase SQL Editor, after 038. Safe to re-run: the table is created once, the
-- starter template is only added while there are none, and the policies and trigger are
-- drop-then-create.

create table if not exists public.feed_templates (
  id          bigint generated always as identity primary key,
  name        text not null,
  type        text not null check (type in ('news', 'social', 'training')),
  data        jsonb not null default '{}'::jsonb,
  updated_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.feed_templates enable row level security;

-- Club accounts only, and only for the kinds of item they can post. No public read.
drop policy if exists "feed templates read" on public.feed_templates;
create policy "feed templates read" on public.feed_templates for select to authenticated
  using (public.can_edit('feed', type));

drop policy if exists "feed templates write" on public.feed_templates;
create policy "feed templates write" on public.feed_templates for all to authenticated
  using (public.can_edit('feed', type)) with check (public.can_edit('feed', type));

create or replace function public.feed_template_stamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_by := auth.jwt() ->> 'email';
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_feed_templates on public.feed_templates;
create trigger stamp_feed_templates before insert or update on public.feed_templates
  for each row execute function public.feed_template_stamp();

-- A starter, so there's one to try. Anything in [square brackets] is for filling in; the members'
-- area checks for leftovers before it publishes.
insert into public.feed_templates (name, type, data)
select 'Pool closed', 'training', jsonb_build_object(
  'title', 'Pool closed — no training [day, date]',
  'blurb', '[Pool] is closed on [day, date], so there''s no training there that day. Training is back to normal from [day].',
  'body', '<p><strong>[Pool] is closed on [day, date]</strong>, so there''s no training there that day.</p>'
       || '<h3>What this means</h3>'
       || '<ul><li>All sessions at [pool] on [day] are cancelled</li><li>[Any squads training somewhere else instead — or delete this line]</li></ul>'
       || '<p>Training is back to normal from [day]. Thanks for your understanding.</p>'
)
where not exists (select 1 from public.feed_templates);

notify pgrst, 'reload schema';
