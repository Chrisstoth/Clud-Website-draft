-- Turns Club Committee from a static contact grid into an editable role browser: a table
-- per role with who holds it, what it takes (skills/experience) and what it involves (main
-- duties), summarised from the club's "BPSC Committee Roles" reference document down to a
-- handful of bullets each -- the full document stays the source of truth for anything more
-- formal (signing, HMRC detail, etc).
--
-- Head Coach and Website & Club Email aren't in that document (they're contact points, not
-- committee posts), so they carry a summary line but no skills/duties bullets -- the page
-- just won't render those sections for them. Five posts in the document have no name attached
-- yet (Publicity & Communications, Club Desk Coordinator, Social Secretary, SwimMark
-- Coordinator, Trials Coordinator) -- these go in as vacant so the club can see, and fill,
-- the gap.
--
-- Adds a "secretary" member role so the Club Secretary can keep this page current without
-- needing webmaster access -- change who holds a role via the members' area, same as any
-- other section.
--
-- Safe to re-run: re-creates the can_edit() function (create or replace), re-adds the two
-- RLS policies (drop-then-create), and replaces all committee_roles rows on every run --
-- hand edits made in the members' area since the last run of this migration are lost, so
-- check with the Club Secretary before re-running.
-- The Supabase SQL Editor runs each execution in one transaction, so no explicit begin/commit.

create table if not exists public.committee_roles (
  id          bigint generated always as identity primary key,
  title       text not null,
  person      text,
  email       text,
  summary     text,
  commitment  text,
  skills      jsonb not null default '[]'::jsonb,
  duties      jsonb not null default '[]'::jsonb,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.committee_roles enable row level security;

drop policy if exists "public read committee" on public.committee_roles;
create policy "public read committee" on public.committee_roles for select using (true);

create or replace function public.can_edit(section text, feed_type text default null)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(auth.jwt() ->> 'email')
      and (
        m.role = 'webmaster'
        or (section = 'feed'      and m.feed_types is not null and feed_type = any (m.feed_types))
        or (section = 'coaches'   and m.role = 'coaching')
        or (section = 'squads'    and m.role = 'coaching')
        or (section = 'roles'     and m.role = 'volunteers')
        or (section = 'welfare'   and m.role = 'welfare')
        or (section = 'committee' and m.role = 'secretary')
      )
  );
$$;

drop policy if exists "committee write" on public.committee_roles;
create policy "committee write" on public.committee_roles for all to authenticated
  using (public.can_edit('committee')) with check (public.can_edit('committee'));

drop trigger if exists touch_committee_roles on public.committee_roles;
create trigger touch_committee_roles before update on public.committee_roles
  for each row execute function public.touch_updated_at();

delete from public.committee_roles;

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
