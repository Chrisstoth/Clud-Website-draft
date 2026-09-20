-- Splits the Volunteering page into two sections: "Officiating" (licensed, poolside
-- roles run through Swim England) and "Volunteering" (everything else). Adds the
-- category column the page now groups roles by, and refreshes the role copy to lead
-- with team/belonging rather than the old "spectator seats" framing.
--
-- Safe to re-run: it only adds the column once (guarded) and then re-writes the five
-- known roles by title, so any hand edits made in the members' area to those five rows
-- are overwritten — check with the Volunteer Coordinator first. New roles added since
-- default to 'volunteering' and are untouched.
-- The Supabase SQL Editor runs each execution in one transaction, so no explicit begin/commit.

alter table public.volunteer_roles
  add column if not exists category text not null default 'volunteering'
  check (category in ('officiating', 'volunteering'));

update public.volunteer_roles set category = 'officiating', blurb =
  'Poolside with a stopwatch, timing your lane and part of the team that makes every race official. No experience needed — a 30-minute briefing before the first gala is all it takes, and you''ll be alongside familiar faces every time.'
  where title = 'Timekeeper';

update public.volunteer_roles set category = 'officiating', blurb =
  'Progress from Timekeeper to Judge, Starter and beyond. The club funds your training and pairs you with a mentor, and every licensed meet we enter needs officials from us — step up and you''re part of the small team that makes racing happen.'
  where title = 'Licensed Official (Judge Level 1+)';

update public.volunteer_roles set category = 'volunteering', blurb =
  'Look after our swimmers on poolside at away galas — registration, marshalling, and keeping the team fed, warm and where they need to be. You travel with the squad and become one of the familiar faces they look for at every meet.'
  where title = 'Team Manager';

update public.volunteer_roles set category = 'volunteering', blurb =
  'Home meets need runners, refreshments, a spectator desk and set-up/pack-down crews. No regular commitment, no experience needed — just an hour or two, a friendly team to join, and a genuinely useful thing to do while the racing goes on around you.'
  where title = 'Meet Helpers (home galas)';

update public.volunteer_roles set category = 'volunteering', blurb =
  'Treasurer, secretary, membership, welfare officer — the roles that keep the club running and safe, and a great way to get properly involved with the people who make it tick. Talk to any committee member if you''re curious.'
  where title = 'Committee & Welfare';
