-- Where a story's card sits on its homepage slide, chosen in the members' area framing editor,
-- separately for computers and phones. Space-separated words -- computer: "right" moves the card
-- to the right-hand side, "compact" cuts it down to just the headline; phone: "p-top" moves it to
-- the top, "p-compact" cuts it to the headline. Empty/null is the original layout.
--
-- Run this BEFORE the updated site files go up: the members' area sends this column with every
-- save, so until it exists saving any calendar/news item fails with
-- "Could not find the 'hero_card' column of 'feed' in the schema cache".
--
-- Safe to re-run: adds the column once (guarded); doesn't touch any existing row's data.

alter table public.feed add column if not exists hero_card text;

-- Tell the API to re-read the table layout now, rather than whenever it next refreshes, so
-- saving works straight away.
notify pgrst, 'reload schema';
