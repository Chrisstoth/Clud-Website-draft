-- Where a story's card sits on its homepage slide, chosen in the members' area framing editor.
-- Space-separated words: "right" moves the card to the right-hand side, "compact" cuts it down
-- to just the headline. Empty/null is the original layout (left, full size).
--
-- Run this BEFORE the updated site files go up: the members' area sends this column with every
-- save, so until it exists saving any calendar/news item fails.
--
-- Safe to re-run: adds the column once (guarded); doesn't touch any existing row's data.

alter table public.feed add column if not exists hero_card text;
