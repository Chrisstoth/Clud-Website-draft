-- "Bump to the top" for Club News. Run AFTER 025_recycle_bin.sql.
--
--   - When someone edits a news story or training change, the members' area asks whether to bump
--     it to the top of Club News as if it were freshly posted (say "Entries open" edited into
--     "Entries closing Friday!").
--   - A bump just stamps bumped_at. The story keeps its id, so every link to it still works; the
--     public pages then file it under the day it was bumped instead of the day it first went up.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

alter table public.feed add column if not exists bumped_at timestamptz;

notify pgrst, 'reload schema';
