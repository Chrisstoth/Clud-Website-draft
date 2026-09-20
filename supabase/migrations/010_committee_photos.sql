-- Optional headshot per committee role, shown on both the role card in the list and the
-- detail panel. Same plain-URL storage as coaches.photo (uploaded via the members' area into
-- the existing public "site-images" bucket) -- no swatches/defaults, since a person's photo
-- has no sensible generic fallback the way a news picture does. Leaving it blank is fine: the
-- page falls back to the role's initials.
--
-- Safe to re-run: adds the column once (guarded); doesn't touch any existing row's data.
-- The Supabase SQL Editor runs each execution in one transaction, so no explicit begin/commit.

alter table public.committee_roles add column if not exists photo text;
