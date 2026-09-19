-- Brings the live database up to date with schema.sql.
-- Every statement is "if not exists", so this is safe to run more than once.

-- Article pages: photo galleries and rich-text bodies.
alter table public.feed add column if not exists photos jsonb not null default '[]'::jsonb;
alter table public.feed add column if not exists body text;

-- Lets an admin hide an item from the public site without deleting it.
alter table public.feed add column if not exists visible boolean not null default true;

-- Live results link for a gala. The Open Meets Secretary sets this to the folder the
-- poolside laptop publishes to (ResPost -> FTP -> liveresults.basildonswimming.co.uk).
-- The site shows it only on the days the gala is actually running.
alter table public.feed add column if not exists live_url text;
