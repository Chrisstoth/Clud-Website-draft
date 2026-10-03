-- Homepage V2 "Race Day" control for galas (meet, external_meet, team_meet rows).
--
-- race_days: the days there's actually racing, when the start-to-end dates include days without
--   any -- a championship spread over three weekends, say. When set, the homepage Race Day panel
--   and the live results button show only on these days. Null (or empty) = every day from start to
--   end is a racing day, which is how every gala behaved before this.
-- homepage_mode: how the V2 homepage features the gala on its racing days. Null = automatic (the
--   site picks Race Day / Home Meet / Championships from the gala's details); 'off' = don't feature
--   it at all; otherwise the style to use.
--
-- The site keeps working if this hasn't been run yet: galas just behave automatically, and the
-- members' area says these two settings need this update before they can be saved. Saving
-- anything else is unaffected either way.
--
-- Safe to re-run: columns are only added if missing, and the check is drop-then-create.

alter table public.feed add column if not exists race_days date[];
alter table public.feed add column if not exists homepage_mode text;

alter table public.feed drop constraint if exists feed_homepage_mode_check;
alter table public.feed add constraint feed_homepage_mode_check
  check (homepage_mode is null or homepage_mode in ('off','race','home_meet','championship'));

-- Tell the API to re-read the table layout now, so the members' area can save straight away.
notify pgrst, 'reload schema';
