-- Lets the Coaching Lead write a short bio for each coach, shown alongside their card on the
-- Coaches page. Coaches already have a sort_order column (set by the original seed); this just
-- adds the missing piece so bios can be stored too.
--
-- Run this BEFORE the updated site files go up: the members' area sends this column with every
-- coach save, so until it exists saving a coach fails with
-- "Could not find the 'bio' column of 'coaches' in the schema cache".
--
-- Safe to re-run: adds the column once (guarded); doesn't touch any existing row's data.

alter table public.coaches add column if not exists bio text;

-- Tell the API to re-read the table layout now, so saving works straight away.
notify pgrst, 'reload schema';
