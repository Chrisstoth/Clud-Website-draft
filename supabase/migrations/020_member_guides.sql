-- Member Guides: the tabbed guides on the Member Guides page (New Members, Academy to Club…).
-- Each guide is one tab: a short tab name, and a body written in the members' area's document
-- editor -- headings, bullet points, links and orange highlight boxes, stored as HTML. The page
-- styles that HTML into the guide layout, so editors never touch classes or markup.
--
-- slug is the guide's web address on the page (member-guides#gala-entry). It's set once when a
-- guide is created and never changes on a rename, so links to a guide keep working.
--
-- Every members' area account can edit the guides, whatever its role.
--
-- The site keeps working if this hasn't been run yet: the page keeps showing the guides written
-- into its HTML, and the members' area section says the table is missing.
--
-- Safe to re-run: the table is created once (guarded), the four current guides are only added
-- while the table is empty, can_edit() is create-or-replace, and the policies and trigger are
-- drop-then-create.

create table if not exists public.member_guides (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  title       text not null,
  body        text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.member_guides enable row level security;

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
        or (section = 'instagram' and m.role in ('comms', 'socials'))
        or (section = 'topics'    and m.role = 'comms')
        or  section = 'guides'
      )
  );
$$;

-- The guides already on the site, so nothing changes until someone edits them.
insert into public.member_guides (slug, title, body, sort_order)
select * from (values
('new-members', 'New Members', $g$<p>Welcome to Basildon &amp; Phoenix! Here's what to expect in your first few weeks:</p>
<h3>Getting started</h3>
<ul>
<li>Your Club Organiser invite arrives by email once your place is confirmed — this is how you'll manage membership, fees and details going forward. See the <a href="#club-organiser">Club Organiser guide</a> for first-login steps.</li>
<li>Check <a href="timetables">Squad Timetables</a> for your session days and times, and arrive 10 minutes early for your first session to meet the coach.</li>
<li>Kit needed: club-colour swimwear (available via our kit supplier — see <a href="join">Join Us</a>), goggles, and a labelled kit bag. Full club kit isn't required on day one.</li>
<li>Monthly squad fees are collected by Direct Debit through Club Organiser — you'll set this up as part of registration.</li>
</ul>
<h3>Who to contact</h3>
<ul>
<li><strong>Coaching matters</strong> — <a href="mailto:bpsccoaches@googlegroups.com">bpsccoaches@googlegroups.com</a></li>
<li><strong>Club Organiser issues</strong> — see the <a href="#club-organiser">Club Organiser guide</a>, or contact <a href="mailto:cluborganiser@phoenixbasildonsc.org">cluborganiser@phoenixbasildonsc.org</a></li>
<li><strong>Membership questions or issues</strong> — <a href="mailto:membership@phoenixbasildonsc.org">membership@phoenixbasildonsc.org</a></li>
<li><strong>Any welfare issues or questions</strong> — <a href="mailto:welfare@phoenixbasildonsc.org">welfare@phoenixbasildonsc.org</a></li>
<li><strong>General enquiries</strong> — <a href="mailto:secretary@phoenixbasildonsc.org">secretary@phoenixbasildonsc.org</a></li>
<li>Want to help the club keep up the success it has today? Feel free to speak to our Chair and Vice Chair — see our <a href="committee">Club Committee</a> page for who they are.</li>
</ul>
<h3>Session changes &amp; communication</h3>
<ul>
<li>Session changes and cancellations are communicated by email from our Secretary — keep your contact details up to date in Club Organiser so you don't miss one.</li>
</ul>
<blockquote>We ask for kindness, patience and understanding in all contact with the club. In line with our <a href="docs/code-of-conduct-parents-guardians.pdf">Parents' &amp; Guardians' Code of Conduct</a>, abusive emails to the club or abusive behaviour towards Basildon Sporting Village staff will not be tolerated — issues usually arise with no ill intent at all, and it's simply whichever staff are on site who end up dealing with them.</blockquote>
<h3>Illness &amp; injury</h3>
<ul>
<li>Please let the coaches know if your swimmer is unwell or injured. If it's a private matter you'd rather only your swimmer's squad coach knew about, just ask to speak to them directly.</li>
</ul>$g$, 0),
('academy-to-club', 'Academy to Club', $g$<p>Academy gets teaching-programme swimmers ready for the club programme — Junior Pathway or Bronze is where that jump happens. It's a big step up in commitment, so this guide covers what changes and how to settle into it.</p>
<h3>Moving up</h3>
<ul>
<li>Coaches recommend swimmers for a squad trial once they're ready; there's no need to ask, but let your Academy coach know if you're keen.</li>
<li>A successful trial moves your Club Organiser record from Academy to your new squad — usually Junior Pathway, or Bronze for swimmers moving up from age 12 — with fees and training days updating automatically from your next billing cycle.</li>
<li>Squad swimmers are expected to attend more regularly and start entering club-level galas — see the <a href="#gala-entry">Gala Entry guide</a>.</li>
</ul>
<h3>What changes</h3>
<ul>
<li>Moving up means more training time becomes available, including mornings for the first time — a step up from Academy's 3 sessions and around 3 hours a week.</li>
<li>On Junior Pathway that's up to 6 sessions and roughly 7 hours a week to start, with two early mornings during the week and a Sunday morning. On Bronze it's 2 hours of evening training plus 1 morning session a week. See Morning sessions below for what to expect.</li>
<li>Exact days, times and pool for your swimmer's group are on <a href="timetables">Squad Timetables</a>; the <a href="coaches#squads">Squad Pathway map</a> shows how squads fit together as swimmers progress.</li>
</ul>
<h3>Equipment</h3>
<p>Junior Pathway and Bronze sessions use more kit than Academy. Most swimmers build this up gradually rather than buying everything at once.</p>
<ul>
<li><strong>Kickboard</strong> — for kicking and technique sets where the coach wants the upper body supported.</li>
<li><strong>Pull buoy</strong> — held between the thighs to isolate arm work.</li>
<li><strong>Short fins</strong> — build leg speed and ankle flexibility without the bulk of long fins.</li>
<li><strong>Snorkel</strong> — lets swimmers focus on technique without turning to breathe.</li>
<li>Paddles are an optional extra some swimmers add later — they're not needed to start.</li>
<li>Several of our partners, including Arena, offer BPSC swimmers discounts on training kit — ask your squad coach for current codes.</li>
<li><strong>Club shirt</strong> — swimmers compete in club colours at galas, so expect to need one once your swimmer starts entering competitions.</li>
<li>Hoodies, tracksuits and other club kit are a nice-to-have, not a requirement — we love seeing swimmers in it, but it's absolutely not a must.</li>
<li>The club shop opens periodically throughout the year rather than staying open year-round — keep an eye on club communications for when it's next open.</li>
</ul>
<h3>Morning sessions</h3>
<ul>
<li>Morning training is a key part of the programme all the way through a swimmer's time at the club, and any continuation of their swimming afterwards — it's pool time we can't get during the week any other way, and time in the water is how swimmers really develop.</li>
<li>A good routine matters: consistent bed times make the biggest difference to how little early starts affect school the next day.</li>
<li>Early starts take some getting used to. Every swimmer who's moved up has been through that adjustment — it gets easier.</li>
<li>A light snack before a morning session and a drink at every session, including mornings, go a long way — encourage good habits around food and hydration early.</li>
</ul>
<h3>Timings, drop-off &amp; pick-up</h3>
<ul>
<li>Morning sessions run 5:30–7:00am. Our aim is to keep swimmers in the pool for as long as possible, but we know school runs mean some swimmers need to leave before the end — a few older swimmers go straight on to school from poolside.</li>
<li>If your swimmer needs to leave early, that's understood — but every swimmer should be training for at least an hour, and shouldn't be leaving before 6:30am.</li>
<li>Parents are very welcome to stay and watch any session.</li>
<li>Our main concern is that any swimmer dropped off is also picked up. If an issue comes up, contacting the pool directly is the quickest way to reach the coaches — see <a href="venue">Our Venue &amp; Getting Here</a> for Basildon Sporting Village's details.</li>
<li>Running late for pick-up? Please call the pool so they can let the coach know and keep an eye on your swimmer, particularly if it's after the session has finished.</li>
</ul>
<h3>Mixing with other sports</h3>
<ul>
<li>We want younger swimmers to keep playing other sports — the club has plenty of swimmers who also compete at a high level elsewhere, and we don't want to restrict those opportunities.</li>
<li>There is a minimum attendance expectation at this level, particularly where it affects a swimmer's development — your coach can talk through what that looks like for your swimmer's squad.</li>
<li>If your swimmer is still having separate swimming lessons elsewhere, club sessions take priority over these.</li>
</ul>
<h3>Land training</h3>
<blockquote>Land training is treated as close to mandatory from Junior Pathway and Bronze upwards. It builds the all-round athleticism and general fitness that underpins everything swimmers do in the water, so it's a core part of the programme, not an add-on.</blockquote>
<h3>Get involved</h3>
<ul>
<li>The club runs on the successful running of galas, and we're always looking for more volunteers and officials. We know sitting through lots of sessions can leave parents with itchy feet — volunteering, officiating or finding out about committee roles is a great way to get involved, be part of the club as a family, and even help shape where it goes next.</li>
<li>See <a href="volunteering">Volunteering</a> for current roles (training is provided), or <a href="committee">Club Committee</a> to find out about committee positions.</li>
</ul>
<h3>Any questions</h3>
<ul>
<li>Your squad coach poolside is the best first port of call for anything training-related.</li>
<li>For who to contact about admin, ideas, illness or anything else, see Who to contact in the <a href="#new-members">New Members Guide</a>.</li>
</ul>$g$, 1),
('gala-entry', 'Gala Entry', $g$<p>How entering a gala works once your swimmer is racing for the club. This guide covers Gala Organiser and galas we host ourselves — external meets hosted by other clubs often have their own, separate entry process, so always check that meet's own instructions first.</p>
<h3>Find the meet</h3>
<ul>
<li>Open meets and their entry deadlines are listed on the <a href="open-meets">Open Meets</a> page — check the closing date, entries usually shut 2–3 weeks before the meet.</li>
</ul>
<h3>Before you enter</h3>
<ul>
<li>Have your swimmer's ASA (Swim England) number to hand, along with their Swim England registered name and their personal bests or entry times for each event.</li>
<li>Entering your swimmer's first meet? Talk to their coach beforehand — they'll help with both which events to enter and what times to put down.</li>
</ul>
<h3>Entering</h3>
<ul>
<li>For galas we host, entries are made directly through Gala Organiser via that meet's entry pack link on the <a href="open-meets">Open Meets</a> page.</li>
<li>Choose <strong>Single Swimmer Entry</strong> to enter your own swimmer, rather than a club or team entry.</li>
<li>Follow Gala Organiser's own <a href="https://www.galaorganiser.co.uk/entry/single_entry_details.php">guide to filling in entry details</a> for exactly what each field on the form needs.</li>
</ul>
<h3>Entry fees</h3>
<ul>
<li>Entry fees are charged through Club Organiser once entries close — no separate payment needed.</li>
</ul>
<h3>On the day</h3>
<ul>
<li>Arrive for the warm-up time on the meet's information sheet, not the first race time. Session and heat sheets are usually published a few days beforehand.</li>
</ul>$g$, 2),
('club-organiser', 'Club Organiser', $g$<p>A quick walkthrough of the system parents use for membership admin:</p>
<h3>First login</h3>
<ul>
<li>Use the invite link emailed to you when you joined to set your password, then log in any time at <a href="https://www.cluborganiser.co.uk/login.php">cluborganiser.co.uk</a>.</li>
</ul>
<h3>Update details</h3>
<ul>
<li>Keep contact numbers, emergency contacts and medical/allergy information current under your swimmer's profile — coaches rely on this being accurate.</li>
</ul>
<h3>Fees &amp; payments</h3>
<ul>
<li>Check your Direct Debit status, view past payments and see any arrears from the Payments section.</li>
</ul>
<h3>Gala entries</h3>
<ul>
<li>Confirm or withdraw from galas your swimmer's been entered into, and see entry fees as they're charged.</li>
</ul>
<h3>Trouble logging in?</h3>
<ul>
<li>Contact our Club Organiser Coordinator — see <a href="committee">Club Committee</a> for details.</li>
</ul>$g$, 3)
) v(slug, title, body, sort_order)
where not exists (select 1 from public.member_guides);

drop policy if exists "public read guides" on public.member_guides;
create policy "public read guides" on public.member_guides for select using (true);

drop policy if exists "guides write" on public.member_guides;
create policy "guides write" on public.member_guides for all to authenticated
  using (public.can_edit('guides')) with check (public.can_edit('guides'));

drop trigger if exists touch_member_guides on public.member_guides;
create trigger touch_member_guides before update on public.member_guides
  for each row execute function public.touch_updated_at();

-- Tell the API to re-read the table layout now, so the members' area can save straight away.
notify pgrst, 'reload schema';
