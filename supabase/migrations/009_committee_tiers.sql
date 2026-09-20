-- Separates the four AGM-elected officers (Chair, Vice Chair, Secretary, Treasurer) out as
-- "Executive Committee" from the rest of the committee roles, so the Club Committee page can
-- list them as their own group rather than mixed in alphabetically/by sort_order with every
-- coordinator role.
--
-- Safe to re-run: adds the column once (guarded), then re-sets tier by title on every run --
-- if a role's title has been renamed in the members' area since, that role falls back to its
-- default of 'committee' rather than silently keeping stale data, so check tiers after
-- re-running if titles have changed.
-- The Supabase SQL Editor runs each execution in one transaction, so no explicit begin/commit.

alter table public.committee_roles
  add column if not exists tier text not null default 'committee'
  check (tier in ('executive', 'committee'));

update public.committee_roles set tier = 'committee';
update public.committee_roles set tier = 'executive'
  where title in ('Club Chairperson', 'Vice Chairperson', 'Club Secretary', 'Club Treasurer');
