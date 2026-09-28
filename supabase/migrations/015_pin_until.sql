-- Pin a news or social item to the front of the homepage slideshow until a date, set in the
-- members' area ("Pin to front of homepage until…"). Past that date the item drops back into
-- the normal order by itself, so a "welcome to our new site" story can't get stuck at the front.
-- Null (the usual case) means not pinned.
--
-- Run this BEFORE the updated site files go up: the members' area sends this column with every
-- save, so until it exists saving any calendar/news item fails with
-- "Could not find the 'pin_until' column of 'feed' in the schema cache".
--
-- Safe to re-run: adds the column once (guarded); doesn't touch any existing row's data.

alter table public.feed add column if not exists pin_until date;

-- Tell the API to re-read the table layout now, so saving works straight away.
notify pgrst, 'reload schema';
