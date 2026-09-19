-- The real coaching team, carried across from the old WordPress site's coaching page
-- (basildonswimming.org/about/the-coaching-team/) with the squad allocations the club
-- confirmed alongside it.
--
-- Every squad named here already exists in public.squads, so the tags on each coach card
-- line up with the Squad Timetables page.
--
-- Qualifications hold the coaching/teaching level only. DBS checks and safeguarding training
-- are a condition of coaching here, so they're stated once in the page intro rather than on
-- every card. Only Doug Campbell has a photo; Coaching Leads can add the rest from the
-- members' area (Coaches & Squads), where a blank quals line simply doesn't render.
--
-- The four Academy coaches carry the role "Academy Coach" exactly; coaches.html groups them
-- into their own block on that string, so keep it if you add another Academy coach.
--
-- Run AFTER 001_catch_up.sql. Safe to re-run: it clears the coaches table and re-inserts,
-- so any hand edits made in the members' area are lost — check with the Coaching Lead first.
-- The Supabase SQL Editor runs each execution in one transaction, so no explicit begin/commit.

delete from public.coaches;

insert into public.coaches (name, role, quals, squads, photo, sort_order) values
  ('Doug Campbell',  'Head Coach',             'Swim England Senior Coach (L5)', '["Gold 1","Gold 2","Silver 3"]'::jsonb, 'images/coaches/Capture.JPG', 0),
  ('Chris Stothard', 'Assistant Head Coach & Academy Lead', 'Swim England Senior Coach (L3)', '["Silver 1","Silver 2","Academy"]'::jsonb, null, 1),
  ('Steph Smith',    'Squad Coach',            'Swim England Coach (L2)', '["Gold 3"]'::jsonb,         null, 2),
  ('Nigel Bear',     'Squad Coach',            'Swim England Coach (L2)', '["Junior Pathway"]'::jsonb, null, 3),
  ('Dom Jefferies',  'Squad Coach',            'Swim England Coach (L2)', '["Bronze","Gold 2 (assistant)"]'::jsonb, null, 4),
  ('Jack Peters',    'Squad Coach',            'Swim England Coach (L1)', '["Masters","Silver (assistant)"]'::jsonb, null, 5),
  ('Jaida Ludlow',   'Assistant Coach',        'STA Teacher(L2) & Coach (L1)', '["Junior Pathway"]'::jsonb, null, 6),
  ('Nic Cook',       'Academy Coach',          'Swim England Teacher (L2)', '[]'::jsonb,                 null, 7),
  ('Jacob Ray',      'Academy Coach',          'Swim England Teacher (L2)', '[]'::jsonb,                 null, 8),
  ('Abigail Rogers', 'Academy Coach',          'Swim England Teacher (L1)', '["Yellow Hats"]'::jsonb,    null, 9),
  ('Tierna Karaiksos','Academy Coach',         'Swim England Teacher (L1)', '["Green Hats"]'::jsonb,     null, 10);

-- Squad leads on the timetables page follow the same allocations. Only the three that still
-- said TBC are touched, so a lead set by hand elsewhere stays put.
update public.squads set lead = 'Chris S' where name = 'Silver 2' and lead = 'TBC';
update public.squads set lead = 'Doug C'  where name = 'Silver 3' and lead = 'TBC';
update public.squads set lead = 'Dom J'   where name = 'Bronze'   and lead = 'TBC';
