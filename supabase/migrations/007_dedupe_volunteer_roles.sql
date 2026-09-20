-- 006's insert wasn't actually idempotent (no delete-before-insert guard, despite the header
-- comment claiming it was safe to re-run), so running it a second time duplicated the six new
-- Volunteering roles -- that's the "everything shows twice" bug on the live Volunteering page.
-- 006 is now fixed for anyone applying it fresh; this migration cleans up a database that
-- already has the duplicates from having run the earlier version.
--
-- Keeps the lowest id per title (the original row) and removes any later duplicates. Safe to
-- re-run -- once there's only one row per title, it's a no-op.
-- The Supabase SQL Editor runs each execution in one transaction, so no explicit begin/commit.

delete from public.volunteer_roles a
using public.volunteer_roles b
where a.title = b.title and a.id > b.id;
