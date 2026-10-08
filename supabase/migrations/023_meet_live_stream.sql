-- Live stream link for galas (meet, external_meet, team_meet rows).
--
-- stream_url: where to watch the racing live (YouTube, Facebook, the host club's stream page).
--   Like live_url, the "Watch live stream" button shows only on the gala's racing days (race_days,
--   or every day from start to end when none are ticked) -- on the Open Meets card and in the
--   homepage Race Day panel. Blank = no button.
--
-- The site keeps working if this hasn't been run yet: the members' area greys out the live stream
-- box and says it needs this update. Saving anything else is unaffected.
--
-- Safe to re-run: the column is only added if missing.

alter table public.feed add column if not exists stream_url text;

-- Tell the API to re-read the table layout now, so the members' area can save straight away.
notify pgrst, 'reload schema';
