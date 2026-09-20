-- Follow-up to 005: drops Committee & Welfare from the Volunteering page (it's covered
-- elsewhere), gives Team Manager its own section between Officiating and Volunteering
-- (it's the closest role to poolside and runs through a funded Swim England course, so
-- it doesn't sit naturally under either), and splits the old single "Meet Helpers" role
-- into the six actual jobs people do at a home gala.
--
-- Safe to re-run: re-adds the check constraint (drop-then-add, since Postgres can't
-- alter one in place), deletes Committee & Welfare and the old Meet Helpers row by
-- title, and re-writes Team Manager by title. Any hand edits made in the members' area
-- to those rows are overwritten — check with the Volunteer Coordinator first.
-- The Supabase SQL Editor runs each execution in one transaction, so no explicit begin/commit.

alter table public.volunteer_roles drop constraint if exists volunteer_roles_category_check;
alter table public.volunteer_roles add constraint volunteer_roles_category_check
  check (category in ('officiating', 'team_manager', 'volunteering'));

delete from public.volunteer_roles where title = 'Committee & Welfare';
delete from public.volunteer_roles where title = 'Meet Helpers (home galas)';

update public.volunteer_roles set category = 'team_manager', sort_order = 2, commitment =
  'Every meet we enter — home, league & away', training =
  'Swim England Team Manager course (funded)', blurb =
  'The closest role to poolside without swimming — pitchside for every meet we enter, home galas and league rounds as much as away trips, working alongside the coaches to keep the team running smoothly and solving problems as they come up. It''s not just a helping hand either: without a qualified Team Manager, we can''t enter a licensed meet as a club at all. You get to know the swimmers and coaches properly, and you''re part of the team''s success on the day. Runs through a funded Swim England Team Manager course.'
  where title = 'Team Manager';

delete from public.volunteer_roles where title in
  ('Results Team', 'Spectators Desk', 'Poolside Refreshments', 'Announcer', 'Medals Desk', 'Marshalling');

insert into public.volunteer_roles (title, category, commitment, training, blurb, sort_order) values
  ('Results Team', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'None needed — shown on the day', 'Help run the results system, keeping times flowing from poolside to the results desk and out to swimmers and coaches — so everyone finds out how they did as soon as the ink''s dry.', 10),
  ('Spectators Desk', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'None needed', 'The first friendly face visitors see — collecting spectator fees, checking people in and helping everyone find a seat. An easy, sociable hour for anyone who wants to help without missing the racing.', 11),
  ('Poolside Refreshments', 'volunteering', 'Ad-hoc — 2-3 circuits per session', 'None needed', 'A poolside role — a couple of circuits a session with water and a small snack for our swimmers between races. You''re right there trackside, keeping racers going and getting to know faces as you go.', 12),
  ('Announcer', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'None needed — we''ll show you the desk', 'Ever fancied a bit of commentary? Call the races, make the announcements and run the music — the voice of the gala, and the best seat in the house for watching every final.', 13),
  ('Medals Desk', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'None needed', 'Hand out medals as swimmers come off poolside — you get to be part of some of the happiest moments of the day, medal after medal, smile after smile.', 14),
  ('Marshalling', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'Short poolside briefing', 'Get swimmers lined up for the right heat at the right time — a calm, friendly presence right before each race that helps settle nerves and gets everyone to blocks on time.', 15);
