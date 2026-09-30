-- A news story can be tagged with the squads it's for, picked in the members' area ("Which
-- squads is this for?"). Visitors choose squads to follow on the News page; stories for those
-- squads are marked "Your squad", gathered under "For your squads", and new ones since their
-- last look put a count on the Club News link. The follows are kept in each visitor's own
-- browser -- nothing about who follows what reaches the database.
--
-- Stored as a list of squad names, the same way coaches.squads is, e.g. ["Development 2","Performance"].
-- An empty list (the usual case) means a whole-club story.
--
-- Run this BEFORE the updated site files go up: the members' area sends this column with every
-- save, so until it exists saving any calendar/news item fails with
-- "Could not find the 'squads' column of 'feed' in the schema cache".
--
-- Safe to re-run: adds the column once (guarded); doesn't touch any existing row's data.

alter table public.feed add column if not exists squads jsonb not null default '[]'::jsonb;

-- Tell the API to re-read the table layout now, so saving works straight away.
notify pgrst, 'reload schema';
