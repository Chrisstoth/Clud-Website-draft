-- Sample content from the prototype. Run AFTER schema.sql.
-- Safe to re-run: it clears these tables first.

truncate public.feed, public.coaches, public.squads, public.volunteer_roles, public.news_defaults, public.committee_roles restart identity;

insert into public.feed (type, title, start_date, end_date, host, league, level, license, pool_type, venue, closing, status, entry_url, officials_url, volunteer_url, results_url, league_url, conditions_url, conditions_label, entry_file_url, entry_file_label, current_entries_url, notes, blurb, link, color, tag, note, img) values
  ('meet', 'BPSC End of Season SC L3 Meet', '2026-07-11', '2026-07-12', null, null, 'Level 3', '3ER261281', '25m Short Course', 'Basildon Sporting Village', null, 'open', 'http://www.galaorganiser.co.uk/entry/meetentry.php?Meet=BASTEO26', 'https://swim-meet.com/Availability/?m=9133', null, null, null, '#', '2026 BPSC End of Season SC Meet L3 – Conditions', '#', 'EO26_EntryData', 'https://www.galaorganiser.co.uk/entry/meet_entries.php?Meet=BASTEO26', 'Officials wanted — please declare your availability.', null, null, null, null, null, null),
  ('meet', 'BPSC Season Opener SC L3', '2026-09-12', '2026-09-13', null, null, 'Level 3', null, '25m Short Course', 'Basildon Sporting Village', null, 'open', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null),
  ('meet', 'BPSC 800m Distance Qualifier', '2026-10-10', null, null, null, 'Club', null, null, 'Basildon Sporting Village', null, 'open', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null),
  ('meet', 'BPSC Autumn Qualifier', '2026-10-31', '2026-11-01', null, null, 'Club', null, null, 'Basildon Sporting Village', null, 'open', null, null, null, null, null, null, null, null, null, null, 'Volunteers needed — see the Volunteering page!', null, null, null, null, null, null),
  ('meet', 'BPSC 1500m Distance Qualifier', '2026-11-14', null, null, null, 'Club', null, null, 'Basildon Sporting Village', null, 'open', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null),
  ('meet', 'BPSC Last Chance County Qualifier', '2026-11-28', '2026-11-29', null, null, 'Club', null, null, 'Basildon Sporting Village', null, 'open', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null),
  ('external_meet', 'London Legacy Open Meet', '2026-12-05', '2026-12-06', 'London Aquatics Centre', null, 'Level 3', null, '50m Long Course', 'London Aquatics Centre, Stratford', null, 'open', null, null, null, null, null, null, null, null, null, null, 'Club entries are submitted by the Open Meets Secretary — check the meet conditions for qualifying times.', null, null, null, null, null, null),
  ('external_meet', 'Essex County Championships', '2027-01-23', '2027-01-31', 'Essex County ASA', null, 'Level 2', null, '25m Short Course', 'Venue TBC', null, 'closed', null, null, null, null, null, null, null, null, null, null, 'County qualifying times apply.', null, null, null, null, null, null),
  ('team_meet', 'Arena League — Round 1', '2026-10-17', null, null, 'Arena League', null, null, '25m Short Course', 'Venue TBC', null, null, null, null, null, null, null, null, null, null, null, null, 'Team selected by the coaches — selected swimmers will be contacted directly with arrival times.', null, null, null, null, null, null),
  ('team_meet', 'Essex League — Round 1', '2026-11-07', null, null, 'Essex League', null, null, '25m Short Course', 'Venue TBC', null, null, null, null, null, null, null, null, null, null, null, null, 'Team selected by the coaches.', null, null, null, null, null, null),
  ('social', 'Summer BBQ & Fun Gala', '2026-08-15', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Family fun gala followed by the annual BBQ on the field. Bring the whole family — inflatables race included.', '#', 'linear-gradient(135deg,#f26b21,#ffb25e)', null, null, null),
  ('social', 'Quiz Night Fundraiser', '2026-09-25', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Teams of six, bar open, proceeds towards new club timing equipment. Book your table early!', '#', 'linear-gradient(135deg,#101014,#3c3c46)', null, null, null),
  ('social', 'Presentation Evening', '2026-09-04', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Celebrating the season — trophies, awards and the famous coaches'' review of the year.', '#', 'linear-gradient(135deg,#d4551a,#101014)', null, null, null),
  ('news', 'Club Championships wrap-up', '2026-05-18', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Results, personal bests and a huge thank you to the volunteers who made the weekend happen.', null, null, 'Racing', null, null),
  ('news', 'New Academy intake open', '2026-07-01', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Spaces opening in our Academy squads for swimmers moving up from lessons — see Join Us for details.', null, null, 'Club', null, null),
  ('news', 'Swim Camp 2026 — Lanzarote', '2026-08-20', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Places open for our warm-weather training camp at Club La Santa — intensive poolside sessions for squads moving up in level.', null, null, 'Trips', null, 'images/WS-Spain-lanzarote-Costa-Teguise-03-Sports-Abroad.jpg'),
  ('news', 'Summer Nationals', '2026-07-28', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Good luck to our qualified swimmers racing at Ponds Forge this summer — the whole club will be behind you.', null, null, 'Racing', null, 'images/Ponds_Forge_Summer_Meet_2024_branding_1200x675.avif'),
  ('news', 'Timekeepers course', '2026-08-05', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'A free Swim England Timekeeping course is running next month — no experience needed, and it''s the easiest way to start volunteering poolside.', null, null, 'Volunteering', null, 'images/Timekeepers-course.webp'),
  ('training', 'No Friday training — pool maintenance', '2026-07-24', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Basildon Sporting Village pool closed for planned maintenance. All squads unaffected on other training days.', null),
  ('training', 'Half-term altered times', '2026-10-26', '2026-10-30', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Squad times shift earlier during half-term week — check the noticeboard for your squad''s slot.', null);

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

insert into public.squads (name, lead, sessions, sort_order) values
  ('Gold 1', 'Doug C', '[{"day":"Mon","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Mon","start":"19:30","end":"20:30","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Tue","start":"18:30","end":"20:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Wed","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Thu","start":"05:30","end":"07:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Thu","start":"18:15","end":"19:15","loc":"BSV Meeting Room","type":"land"},{"day":"Thu","start":"19:15","end":"21:00","loc":"BSV Long Course","type":"pool"},{"day":"Fri","start":"18:00","end":"19:30","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Sun","start":"06:00","end":"07:45","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Sun","start":"07:45","end":"08:45","loc":"BSV Meeting Room","type":"land"},{"day":"Sun","start":"16:15","end":"18:15","loc":"BSV Long Course","type":"pool"}]'::jsonb, 0),
  ('Gold 2', 'Doug C', '[{"day":"Mon","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Mon","start":"18:30","end":"19:30","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Tue","start":"05:30","end":"07:00","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Thu","start":"05:30","end":"07:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Thu","start":"18:15","end":"19:15","loc":"BSV Meeting Room","type":"land"},{"day":"Thu","start":"19:15","end":"21:00","loc":"BSV Long Course","type":"pool"},{"day":"Fri","start":"18:00","end":"19:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Sun","start":"06:00","end":"07:45","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Sun","start":"07:45","end":"08:45","loc":"BSV Meeting Room","type":"land"},{"day":"Sun","start":"16:15","end":"18:15","loc":"BSV Long Course","type":"pool"}]'::jsonb, 1),
  ('Gold 3', 'Steph S', '[{"day":"Mon","start":"17:30","end":"18:30","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Tue","start":"05:30","end":"07:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Wed","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Wed","start":"19:00","end":"20:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Thu","start":"17:15","end":"18:15","loc":"BSV Meeting Room","type":"land"},{"day":"Fri","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Fri","start":"19:30","end":"20:30","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Sun","start":"06:45","end":"07:30","loc":"BSV Meeting Room","type":"land"},{"day":"Sun","start":"07:45","end":"08:45","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Sun","start":"16:15","end":"18:15","loc":"BSV Long Course","type":"pool"}]'::jsonb, 2),
  ('Silver 1', 'Chris S', '[{"day":"Mon","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Mon","start":"20:30","end":"21:30","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Tue","start":"20:00","end":"21:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Wed","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Thu","start":"05:30","end":"07:00","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Thu","start":"18:15","end":"19:15","loc":"BSV Meeting Room","type":"land"},{"day":"Fri","start":"20:30","end":"21:30","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Sun","start":"06:00","end":"07:45","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Sun","start":"07:45","end":"08:45","loc":"BSV Meeting Room","type":"land"}]'::jsonb, 3),
  ('Silver 2', 'Chris S', '[{"day":"Tue","start":"05:30","end":"07:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Tue","start":"20:00","end":"21:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Wed","start":"20:00","end":"21:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Thu","start":"17:15","end":"18:15","loc":"BSV Meeting Room","type":"land"},{"day":"Fri","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Fri","start":"20:30","end":"21:30","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Sun","start":"06:45","end":"07:30","loc":"BSV Meeting Room","type":"land"},{"day":"Sun","start":"07:45","end":"08:45","loc":"BSV Short Course – Shallow End","type":"pool"}]'::jsonb, 4),
  ('Silver 3', 'Doug C', '[{"day":"Tue","start":"05:30","end":"07:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Tue","start":"17:30","end":"18:30","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Thu","start":"05:30","end":"07:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Thu","start":"17:15","end":"18:15","loc":"BSV Meeting Room","type":"land"},{"day":"Fri","start":"20:00","end":"21:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Sun","start":"06:45","end":"07:30","loc":"BSV Meeting Room","type":"land"},{"day":"Sun","start":"07:45","end":"08:45","loc":"BSV Short Course – Shallow End","type":"pool"}]'::jsonb, 5),
  ('Bronze', 'Dom J', '[{"day":"Mon","start":"20:30","end":"21:30","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Thu","start":"05:30","end":"07:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Thu","start":"17:15","end":"18:15","loc":"BSV Meeting Room","type":"land"},{"day":"Fri","start":"19:00","end":"20:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Sun","start":"06:45","end":"07:30","loc":"BSV Meeting Room","type":"land"}]'::jsonb, 6),
  ('Junior Pathway', 'Nigel B', '[{"day":"Mon","start":"19:30","end":"20:30","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Tue","start":"05:30","end":"07:00","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Tue","start":"20:15","end":"21:15","loc":"Billericay Pool","type":"pool"},{"day":"Thu","start":"05:30","end":"07:00","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Thu","start":"17:15","end":"18:15","loc":"BSV Meeting Room","type":"land"},{"day":"Fri","start":"19:00","end":"20:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Sun","start":"06:00","end":"07:45","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Sun","start":"06:45","end":"07:30","loc":"BSV Meeting Room","type":"land"},{"day":"Sun","start":"07:45","end":"08:45","loc":"BSV Short Course – Deep End","type":"pool"}]'::jsonb, 7),
  ('Red Hats', 'Chris S', '[{"day":"Wed","start":"18:00","end":"19:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Fri","start":"19:30","end":"20:30","loc":"BSV Short Course – Shallow End","type":"pool"},{"day":"Sat","start":"15:00","end":"16:00","loc":"BSV Short Course – Deep End","type":"pool"}]'::jsonb, 8),
  ('Blue Hats', 'TBC', '[{"day":"Wed","start":"17:00","end":"18:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Sat","start":"15:00","end":"16:00","loc":"BSV Short Course – Deep End","type":"pool"}]'::jsonb, 9),
  ('Yellow Hats', 'Abi R', '[{"day":"Sat","start":"15:00","end":"16:00","loc":"BSV Short Course – Deep End","type":"pool"}]'::jsonb, 10),
  ('Green Hats', 'Tierna K', '[{"day":"Sat","start":"15:00","end":"16:00","loc":"BSV Short Course – Deep End","type":"pool"}]'::jsonb, 11),
  ('Masters', 'Jack P', '[{"day":"Mon","start":"20:30","end":"21:30","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Wed","start":"20:00","end":"21:00","loc":"BSV Short Course – Deep End","type":"pool"},{"day":"Fri","start":"05:30","end":"07:00","loc":"BSV Long Course","type":"pool"},{"day":"Fri","start":"20:00","end":"21:00","loc":"BSV Short Course – Deep End","type":"pool"}]'::jsonb, 12);

insert into public.volunteer_roles (title, category, commitment, training, blurb, sort_order) values
  ('Timekeeper', 'officiating', '~2 galas per season', '30-min poolside briefing', 'Poolside with a stopwatch, timing your lane and part of the team that makes every race official. No experience needed — a 30-minute briefing before the first gala is all it takes, and you''ll be alongside familiar faces every time.', 0),
  ('Licensed Official (Judge Level 1+)', 'officiating', 'A few meets per year', 'Free Swim England course + mentored poolside hours', 'Progress from Timekeeper to Judge, Starter and beyond. The club funds your training and pairs you with a mentor, and every licensed meet we enter needs officials from us — step up and you''re part of the small team that makes racing happen.', 1),
  ('Team Manager', 'team_manager', 'Every meet we enter — home, league & away', 'Swim England Team Manager course (funded)', 'The closest role to poolside without swimming — pitchside for every meet we enter, home galas and league rounds as much as away trips, working alongside the coaches to keep the team running smoothly and solving problems as they come up. It''s not just a helping hand either: without a qualified Team Manager, we can''t enter a licensed meet as a club at all. You get to know the swimmers and coaches properly, and you''re part of the team''s success on the day. Runs through a funded Swim England Team Manager course.', 2),
  ('Results Team', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'None needed — shown on the day', 'Help run the results system, keeping times flowing from poolside to the results desk and out to swimmers and coaches — so everyone finds out how they did as soon as the ink''s dry.', 10),
  ('Spectators Desk', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'None needed', 'The first friendly face visitors see — collecting spectator fees, checking people in and helping everyone find a seat. An easy, sociable hour for anyone who wants to help without missing the racing.', 11),
  ('Poolside Refreshments', 'volunteering', 'Ad-hoc — 2-3 circuits per session', 'None needed', 'A poolside role — a couple of circuits a session with water and a small snack for our swimmers between races. You''re right there trackside, keeping racers going and getting to know faces as you go.', 12),
  ('Announcer', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'None needed — we''ll show you the desk', 'Ever fancied a bit of commentary? Call the races, make the announcements and run the music — the voice of the gala, and the best seat in the house for watching every final.', 13),
  ('Medals Desk', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'None needed', 'Hand out medals as swimmers come off poolside — you get to be part of some of the happiest moments of the day, medal after medal, smile after smile.', 14),
  ('Marshalling', 'volunteering', 'Ad-hoc — sign-up sheets per event', 'Short poolside briefing', 'Get swimmers lined up for the right heat at the right time — a calm, friendly presence right before each race that helps settle nerves and gets everyone to blocks on time.', 15);

insert into public.news_defaults (key, label, icon, bg, img) values
  ('racing', 'Racing', '🏆', 'linear-gradient(135deg,#d4551a,#101014)', null),
  ('club', 'Club', '🏊', 'linear-gradient(135deg,#f26b21,#ffb25e)', null),
  ('volunteering', 'Volunteering', '🤝', 'linear-gradient(135deg,#101014,#3c3c46)', null),
  ('trips', 'Trips & camps', '✈️', 'linear-gradient(135deg,#1a6fd4,#5eb6ff)', null),
  ('social', 'Social', '🎉', 'linear-gradient(135deg,#7a1ad4,#c15eff)', null),
  ('general', 'General', '📣', 'linear-gradient(135deg,#3c3c46,#101014)', null);

-- Committee roles, summarised from "BPSC Committee Roles" -- see 008_committee_roles.sql for
-- the fuller explanation of what's included and why.
insert into public.committee_roles (title, person, email, summary, commitment, skills, duties, sort_order) values

('Club Chairperson', 'Russell Larthe', 'chair@phoenixbasildonsc.org', null,
 'As issues arise, plus club events & committee meetings',
 '["Confident public speaker who can run a meeting", "Strong, impartial leadership", "Well organised and able to delegate", "Committed to the whole club, Academy to national level"]'::jsonb,
 '["Leads and manages the overall running of the club", "Sets the club''s strategy and annual plan with the committee and head coach", "Chairs committee meetings and supports other officers", "Oversees the coaching team through the Head Coach", "Ensures the club runs within its rules, constitution and Swim England law", "Maintains the relationship with the pool provider and other partners"]'::jsonb,
 0),

('Club Treasurer', 'Amanda Goodman', 'treasurer@phoenixbasildonsc.org', null,
 'Ongoing responsibility for club accounts',
 '["Some financial background, comfortable with accounts", "Confident with spreadsheets or accounting software", "Reliable and honest"]'::jsonb,
 '["Responsible for all club finances", "Plans the annual budget with the committee", "Monitors the budget and reports back through the year", "Issues receipts and keeps records of money received", "Prepares end-of-year accounts for the AGM and auditor", "Ensures HMRC requirements are met"]'::jsonb,
 1),

('Club Secretary', 'Emma Burford', 'secretary@phoenixbasildonsc.org', null,
 'Ongoing, including one committee meeting a month',
 '["Well organised, unbiased and approachable", "Good knowledge of the sport and the club", "Comfortable being the main point of contact for outside organisations"]'::jsonb,
 '["Runs the day-to-day administration of the club, including correspondence", "Calls committee meetings and the AGM, and takes minutes", "Main point of contact for the county, Swim England and other bodies", "Keeps the club''s affiliation and records up to date", "Makes sure new members receive the club rules and sign for them", "Oversees data protection compliance", "Books pool time with the head coach and manages cancellations"]'::jsonb,
 2),

('Vice Chairperson', 'Nigel Bear', 'vicechair@phoenixbasildonsc.org', null,
 'Approx. 4 hours a week, ongoing',
 '["Good knowledge of the partnership with Everyone Active", "Computer literate", "Good organisational skills"]'::jsonb,
 '["Leads the club''s partnership with Everyone Active (the pool operator)", "Holds regular meetings with Everyone Active and manages the agreement", "Organises related contracts", "Manages the relationship with the Head Coach and paid coaches"]'::jsonb,
 3),

('Publicity and Communications', 'Vacant', null, null,
 'Ongoing weekly responsibility',
 '["Confident, effective communicator", "Interest or background in marketing and promotion", "Comfortable running social media"]'::jsonb,
 '["Promotes and publicises the club across all channels", "Runs the club''s social media presence", "Builds relationships with local media", "Produces a monthly newsletter to members", "Reports on club events, home and away", "Keeps noticeboards current"]'::jsonb,
 4),

('Gala Admin Secretary and Promoter', 'Pamela Georgakis', 'galas@phoenixbasildonsc.org', null,
 'Approx. 6 hours a week, plus the full duration of home galas',
 '["Good knowledge of Sportsystem entry software", "Computer literate", "Good organisational skills"]'::jsonb,
 '["Manages entries and payments for away galas, ahead of deadlines", "Manages all bookings for home galas and applies for licences", "Answers gala-related enquiries and sends deadline reminders", "Works closely with the Lead Gala Promoter to run BPSC galas", "Advertises home galas to other clubs and arranges gala staff"]'::jsonb,
 5),

('Lead Gala Promoter', 'Nigel Bear', 'galas@phoenixbasildonsc.org', null,
 'Approx. 1 hour a week, plus the full duration of home galas',
 '["Good communication and people skills", "Knowledge of Sportsystem Meet Manager and timing software", "Good organisational skills"]'::jsonb,
 '["Runs the gala on the day and liaises with the Gala Admin Secretary on paperwork", "Manages and briefs the volunteers and pool staff working the gala", "Liaises with the gala referee", "Manages competitor sign-in and the final programme", "Covers for the Gala Admin Secretary when needed"]'::jsonb,
 6),

('Membership Secretary', 'Rachael Read', 'membership@phoenixbasildonsc.org', null,
 'Approx. 2 hours a week, ongoing',
 '["Good knowledge of Swim England membership rules", "Computer literate", "Good organisational skills"]'::jsonb,
 '["Adds new members to the Swim England database", "Manages coach and volunteer Swim England membership", "Checks members are in the correct membership category", "Produces the annual Swim England and BPSC membership lists"]'::jsonb,
 7),

('Club Organiser Coordinator', 'Kira Neal', 'cluborganiserissues@phoenixbasildonsc.org', null,
 'Approx. 6 hours a week, ongoing',
 '["Good knowledge of the Club Organiser system", "Computer literate", "Good organisational skills"]'::jsonb,
 '["Adds new members and manages membership/fee records on Club Organiser", "Keeps squads, timetables and galas up to date on the system", "Checks Direct Debit payments and chases arrears", "Manages the club document, merchandise and event lists", "Handles swimmer account queries, and removes leavers"]'::jsonb,
 8),

('Club Desk Coordinator', 'Vacant', null, null,
 'Approx. 4 hours a week, ongoing',
 '["Good knowledge of the club, especially the Academy", "Good organisational skills"]'::jsonb,
 '["Runs the twice-weekly Club Desk with a small volunteer team", "First point of contact for Academy questions", "Keeps hats, bags and stock topped up", "Manages the Swimzi online shop and orders coach/national kit"]'::jsonb,
 9),

('Social Secretary', 'Vacant', null, null,
 'Approx. 2 hours a week, ongoing',
 '["Good knowledge of how the club runs", "Computer literate", "Good organisational skills"]'::jsonb,
 '["Arranges the swimmers'' social events, including the Christmas party", "Organises the annual awards night", "Runs the club''s annual residential trip", "Arranges swimming masterclasses through the year", "Looks into warm-weather swim camps and other fundraising socials"]'::jsonb,
 10),

('Officials Coordinator', 'Jonathan Ray', 'officials@phoenixbasildonsc.org', null,
 'Approx. 4 hours a week, ongoing',
 '["Good knowledge of how galas run — ideally an official yourself", "Computer literate", "Good organisational skills"]'::jsonb,
 '["Arranges officials for BPSC''s home galas", "Arranges BPSC officials for away galas", "Organises officiating training and recruits new officials", "Keeps an up-to-date database of BPSC officials"]'::jsonb,
 11),

('Sponsorship & Fundraising', 'Kezia Sando', 'sponsorship@phoenixbasildonsc.org', null,
 'Approx. 4 hours a week, ongoing',
 '["Good knowledge of the club''s partnerships", "Computer literate", "Good organisational skills"]'::jsonb,
 '["Approaches local businesses for sponsorship", "Arranges fundraising activities such as raffles", "Runs the club''s Easy Fundraising account with Comms", "Oversees a small team of fundraisers", "Researches and applies for suitable grant funding"]'::jsonb,
 12),

('Volunteer Coordinator', 'Tracey Nurse & Katie Doel', 'volunteer@phoenixbasildonsc.org', null,
 'As the club needs, plus committee meetings',
 '["Well organised and able to delegate", "Enthusiastic and a good motivator", "Approachable, confident communicator"]'::jsonb,
 '["Main point of contact for all volunteers", "Gets to know club volunteers and potential volunteers by name", "Makes sure every volunteer role has a clear description", "Works with other officers to identify where help is needed", "Works with the Welfare Officer so volunteers know the child protection policy", "Helps organise social and recruitment events for volunteers"]'::jsonb,
 13),

('SwimMark Coordinator', 'Vacant', null, 'SwimMark is Swim England''s quality standard for clubs, covering governance, sustainability and effectiveness.',
 'As the club needs, plus committee meetings',
 '["Well organised, good administration skills", "Enthusiastic and a good motivator", "Confident, approachable communicator"]'::jsonb,
 '["Oversees the club''s SwimMark audit and action plan", "Liaises with Swim England''s regional development officers", "Keeps the club updated on SwimMark progress", "Works with the Treasurer on funding the action plan", "Promotes the Swim England Child Protection policy"]'::jsonb,
 14),

('Welfare Officer', 'Katie Doel & Kathy Morey', 'welfare@phoenixbasildonsc.org', null,
 'As issues arise, plus committee meetings & training',
 '["Approachable and a good listener", "Good communication skills", "Tactful and discreet"]'::jsonb,
 '["Handles child protection concerns following Swim England''s guidelines", "Manages DBS checks and renewals for the club", "Keeps up to date with Swim England child protection policy", "Runs good-practice awareness training for coaches and volunteers", "Makes sure every member knows who the Welfare Officer is"]'::jsonb,
 15),

('Trials Coordinator', 'Vacant', null, null,
 'Approx. 2 hours a week, ongoing',
 '["Administration skills, approachable", "Confident, effective communicator", "Good knowledge of the club and the Academy"]'::jsonb,
 '["Responds to enquiries sent to the club''s info@ address", "Works with the coaching team to set up monthly trials", "Invites swimmers to trial and manages the paperwork", "Passes swimmer details to the coaching team ahead of trials", "Follows up every trial with an offer or next steps", "Works with Membership and Club Organiser to onboard new swimmers"]'::jsonb,
 16),

('Head Coach', 'Doug Campbell', 'headcoach@phoenixbasildonsc.org',
 'Leads the coaching team and the club''s overall coaching strategy. See Coaches & Squads for the full coaching team.',
 null, '[]'::jsonb, '[]'::jsonb, 17),

('Website & Club Email', 'Andy Mullender', 'webmaster@phoenixbasildonsc.org',
 'Manages the club website and the shared club email accounts.',
 null, '[]'::jsonb, '[]'::jsonb, 18);

-- The four AGM-elected officers are the Executive Committee; every other post defaults to
-- 'committee' (set on the column itself, so no update needed for the rest).
update public.committee_roles set tier = 'executive'
  where title in ('Club Chairperson', 'Vice Chairperson', 'Club Secretary', 'Club Treasurer');
