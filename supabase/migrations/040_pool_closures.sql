-- Pool closures: a Key Training Change can be ticked as a pool closure.
--
--   - closure: while it's on, a red warning ribbon shows under the header on every page (from the
--     day before), the Session update box on "Today at BPSC" gets a warning symbol, and the post
--     is pinned to the top of the homepage slideshow automatically.
--   - until_time ("16:00"): the time on its last day that it's over, e.g. when the pool opens again.
--     Blank means the whole day. Once that time has passed, the ribbon and the automatic pin go
--     and the Session update box drops off. Any training change can have one, ticked or not.
--
-- Also adds a second "pool closed" template (039), for when the pool is only shut until a set time:
-- sessions before then are cancelled and sessions after go ahead. The starter from 039 is renamed
-- "Pool closed — all day" so the two sit side by side, and both come with the closure box ticked.
--
-- The site keeps working if this hasn't been run: there's just no closure tick box or time yet.
--
-- Run once in the Supabase SQL Editor, after 039. Safe to re-run.

alter table public.feed add column if not exists closure boolean not null default false;
alter table public.feed add column if not exists until_time text;
alter table public.feed drop constraint if exists feed_until_time_check;
alter table public.feed add constraint feed_until_time_check
  check (until_time is null or until_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

-- Let the public site read the new columns (037 keeps the email columns private).
select public.share_feed_columns();

-- Templates (039).
update public.feed_templates
   set name = 'Pool closed — all day'
 where name = 'Pool closed' and type = 'training';

insert into public.feed_templates (name, type, data)
select 'Pool closed — until a set time', 'training', jsonb_build_object(
  'title', 'Pool closed until [time] on [day, date]',
  'blurb', '[Pool] doesn''t open until [time] on [day, date]. Sessions before then are cancelled; sessions from [time] go ahead as normal.',
  'body', '<p><strong>[Pool] is closed until [time] on [day, date]</strong>, so sessions before then are cancelled.</p>'
       || '<h3>What this means</h3>'
       || '<ul><li><strong>Cancelled:</strong> [sessions before it opens, e.g. Squad 1, 6–7am]</li>'
       || '<li><strong>Going ahead as normal:</strong> [sessions after it opens, e.g. Squad 3, 6:30pm]</li></ul>'
       || '<p>Training is back to normal from [day]. Thanks for your understanding.</p>'
)
where not exists (
  select 1 from public.feed_templates where name = 'Pool closed — until a set time'
);

-- Both pool closed templates start with the closure box ticked.
update public.feed_templates
   set data = data || '{"closure": true}'::jsonb
 where type = 'training' and name in ('Pool closed — all day', 'Pool closed — until a set time')
   and not (data ? 'closure');

notify pgrst, 'reload schema';
