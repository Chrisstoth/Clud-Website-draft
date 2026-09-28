-- Homepage pictures per screen, set in the members' area ("Homepage pictures" on a news or
-- social item). Normally the homepage slideshow uses the item's gallery (feed.photos); this lets
-- the computer slide ("hd") and/or the phone slide ("hp") use their own pictures instead, e.g.
-- a wide banner made for the slanted computer slide. Shape: {"hd":[urls…],"hp":[urls…]}, with a
-- screen left out when it uses the gallery; null when both do.
--
-- Run this BEFORE the updated site files go up: the members' area sends this column with every
-- save, so until it exists saving any calendar/news item fails with
-- "Could not find the 'hero_photos' column of 'feed' in the schema cache".
--
-- Safe to re-run: adds the column once (guarded); doesn't touch any existing row's data.

alter table public.feed add column if not exists hero_photos jsonb;

-- Tell the API to re-read the table layout now, so saving works straight away.
notify pgrst, 'reload schema';
