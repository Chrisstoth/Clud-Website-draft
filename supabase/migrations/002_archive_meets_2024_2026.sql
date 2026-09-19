-- Open meet results archive: every BPSC-hosted gala from 2024, 2025 and 2026, carried
-- across from the old WordPress site's Open Meets page (basildonswimming.org/open-meets/).
--
-- They land as ordinary completed meets. Because their dates are in the past the site files
-- them under "Completed galas" by itself and shows the Results button — nothing on the pages
-- needs changing for them to appear.
--
-- Dates, and whether each meet was short or long course, were checked against the meet's own
-- Sportsystems (.SD3) or Lenex (.LEF) results file rather than taken from the old page's prose.
--
-- The documents themselves still live in the old site's uploads folder, so these links are
-- http:// and point at basildonswimming.org (2025-26) or phoenixbasildonsc.org (2024).
-- Neither host serves https. Every one of these files was being served when this was written;
-- if either domain is retired the PDFs and zips need re-hosting and these rows updating.
--
-- Run AFTER 001_catch_up.sql, and after the results_file_url/results_file_label columns exist
-- (schema.sql has them; 001 does not, so the two statements below add them if missing).
-- Safe to re-run: the insert skips any meet already stored with the same title and start date,
-- and the updates only touch a gala that has no results link yet, so hand edits are never
-- overwritten.

alter table public.feed add column if not exists results_file_url text;
alter table public.feed add column if not exists results_file_label text;

insert into public.feed (
  type, title, start_date, end_date, level, license, pool_type,
  venue, status, conditions_url, conditions_label,
  results_url, results_file_url, results_file_label
)
select v.type, v.title, v.start_date::date, v.end_date::date, v.level, v.license, v.pool_type,
       v.venue, v.status, v.conditions_url, v.conditions_label,
       v.results_url, v.results_file_url, v.results_file_label
from (values
  ('meet', 'BPSC Dave Warriner SC Meet L3', '2026-06-14', null, 'Level 3', '3ER261327', '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2026/05/2026-BPSC-Dave-Warriner-SC-Meet-L3-Conditions.pdf', '2026 BPSC Dave Warriner – Conditions', 'http://basildonswimming.org/wp-content/uploads/2026/06/2026-BPSC-Dave-Warriner-SC-Meet-L3-Results.pdf', 'http://basildonswimming.org/wp-content/uploads/2026/06/DW26MEET.zip', 'DW26MEET'),
  ('meet', 'BPSC Spring SC Meet L3', '2026-05-16', '2026-05-17', 'Level 3', null, '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2026/04/2026-BPSC-Spring-SC-Meet-L3-Conditions.pdf', '2026 BPSC Spring SC Meet L3 – Conditions', 'http://basildonswimming.org/wp-content/uploads/2026/05/2026-BPSC-Spring-SC-Meet-L3-Results.pdf', 'http://basildonswimming.org/wp-content/uploads/2026/05/SM26MEET.zip', 'SM26MEET'),
  ('meet', 'BPSC Easter Meet L3', '2026-04-11', '2026-04-12', 'Level 3', '3ER260756', '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2026/03/2026-BPSC-Easter-Meet-L3-Conditions_v2.pdf', '2026 BPSC L3 Easter Meet – Details', 'http://basildonswimming.org/wp-content/uploads/2026/04/2026-BPSC-Easter-Meet-L3-Results.pdf', 'http://basildonswimming.org/wp-content/uploads/2026/04/EM26MEET.zip', 'EM26MEET'),
  ('meet', 'BPSC L1 National LC Qualifier', '2026-03-14', '2026-03-15', 'Level 1', '1ER260530', '50m Long Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2026/01/2026-BPSC-L1-National-Qualifier-Conditions_v4.pdf', '2026 BPSC L1 National Qualifier – Details', 'http://basildonswimming.org/wp-content/uploads/2026/03/2026-BPSC-L1-National-Qualifier-Results.pdf', 'http://basildonswimming.org/wp-content/uploads/2026/03/NQ26MEET.zip', 'NQ26MEET'),
  ('meet', 'BPSC 1500m Distance Qualifier', '2025-11-29', null, 'Level 3', '3ER252117', '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2025/11/2025-BPSC-1500m-County-Regional-Qualifier-Conditions.pdf', '2025 BPSC 1500m County Regional Qualifier – Conditions', 'http://basildonswimming.org/wp-content/uploads/2025/12/2025-BPSC-1500m-County-Qualifier-Results.pdf', 'http://basildonswimming.org/wp-content/uploads/2025/12/DQ25MEET.zip', 'DQ25MEET'),
  ('meet', 'BPSC Last Chance County Qualifier', '2025-11-22', '2025-11-23', 'Level 3', '3ER252563', '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2025/10/2025-BPSC-Last-Chance-Qualifier-Conditions.pdf', '2025 BPSC Last Chance Qualifier – Conditions', 'http://basildonswimming.org/wp-content/uploads/2025/11/2025-BPSC-Last-Chance-Qualifier-Results.pdf', 'http://basildonswimming.org/wp-content/uploads/2025/11/LC25MEET.zip', 'LC25MEET'),
  ('meet', 'BPSC Autumn County Qualifier L3 Meet', '2025-10-25', '2025-10-26', 'Level 3', '3ER252197', '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2025/10/2025-BPSC-Autumn-Qualifier-Conditions.pdf', '2025 BPSC Autumn Qualifier – Conditions', 'http://basildonswimming.org/wp-content/uploads/2025/10/2025-BPSC-Autumn-Qualifier-Results.pdf', null, null),
  ('meet', 'BPSC 800m Distance Qualifier', '2025-10-12', null, 'Level 3', '3ER252012', '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2025/09/2025-BPSC-800m-County-Regional-Qualifier-Conditions_v2.pdf', '2025 BPSC 800m County Regional Qualifier – Conditions', 'http://basildonswimming.org/wp-content/uploads/2025/10/2025-BPSC-800m-County-Regional-Qualifier-Results_v2.pdf', 'http://basildonswimming.org/wp-content/uploads/2025/10/EQ25MEET.zip', 'EQ25MEET'),
  ('meet', 'BPSC Season Opener LC Meet', '2025-09-27', '2025-09-28', 'Level 3', '3ER251796', '50m Long Course', 'Basildon Sporting Village', 'closed', 'http://basildonswimming.org/wp-content/uploads/2025/07/2025-BPSC-Season-Opener-Conditions_v2.pdf', '2025 BPSC Season Opener – Conditions', 'http://basildonswimming.org/wp-content/uploads/2025/10/2025-BPSC-Season-Opener-Results.pdf', 'http://basildonswimming.org/wp-content/uploads/2025/10/SO25MEET.zip', 'SO25MEET'),
  ('meet', 'BPSC Spring Short Course L3 Meet', '2025-03-22', '2025-03-23', 'Level 3', '3ER250484', '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://phoenixbasildonsc.org/wp-content/uploads/2025/01/2025-BPSC-Spring-SC-Meet-Conditions_v3.pdf', '2025 BPSC Spring SC Meet – Conditions', 'http://phoenixbasildonsc.org/wp-content/uploads/2025/06/2025-BPSC-Spring-SC-Meet-Results.pdf', null, null),
  ('meet', 'BPSC Last Chance County Qualifier', '2024-11-30', '2024-12-01', null, null, '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/10/2024-BPSC-Last-Chance-Qualifier-Conditions.pdf', '2024 BPSC Last Chance Qualifier – Conditions', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/12/2024-BPSC-Last-Chance-Qualifier-Results.pdf', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/12/LC24MEET.zip', 'LC24MEET'),
  ('meet', 'BPSC 800m County Qualifier', '2024-11-24', null, null, null, '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/10/2024-BPSC-800m-County-Regional-Qualifier-Conditions.pdf', '2024 BPSC 800m County Regional Qualifier – Conditions', 'http://phoenixbasildonsc.org/wp-content/uploads/2025/01/2024-BPSC-800m-Distance-Qualifier-Results_Level-4.pdf', 'http://phoenixbasildonsc.org/wp-content/uploads/2025/01/DQ24MEET.zip', 'DQ24MEET'),
  ('meet', 'BPSC Autumn County Qualifier', '2024-10-13', null, null, null, '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/09/2024-BPSC-Autumn-County-Qualifier-Conditions_v2.pdf', '2024 BPSC Autumn County Qualifier – Conditions', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/10/2024-BPSC-Autumn-County-Qualifier-Results.pdf', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/10/AC2401.zip', 'AC2401'),
  ('meet', 'BPSC 1500m County Qualifier', '2024-10-12', null, null, null, '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/09/2024-BPSC-1500m-Qualifier-Conditions.pdf', '2024 BPSC 1500m Qualifier – Conditions', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/10/2024-BPSC-1500m-County-Regional-Qualifier-Results.pdf', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/10/DC2401.zip', 'DC2401'),
  ('meet', 'BPSC Season Opener', '2024-09-28', '2024-09-29', null, null, '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/08/2024-BPSC-Season-Opener-Conditions.pdf', '2024 BPSC Season Opener – Conditions', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/10/2024-BPSC-Season-Opener-Results.pdf', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/10/SO24-Lenex.zip', 'SO24 Lenex'),
  ('meet', 'BPSC End of Season Meet', '2024-07-27', '2024-07-28', null, null, '25m Short Course', 'Basildon Sporting Village', 'closed', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/06/2024-BPSC-End-of-Season-Meet-Conditions.pdf', '2024 BPSC End of Season Meet – Conditions', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/08/2024-BPSC-End-of-Season-Meet-Results.pdf', 'http://phoenixbasildonsc.org/wp-content/uploads/2024/08/EO24MEET.zip', 'EO24MEET')
) as v (type, title, start_date, end_date, level, license, pool_type,
        venue, status, conditions_url, conditions_label,
        results_url, results_file_url, results_file_label)
where not exists (
  select 1 from public.feed f
  where f.title = v.title and f.start_date = v.start_date::date
);

-- The 2026 Season Opener and End of Season galas are already in the feed as scheduled
-- meets, so their results attach to the existing rows.
update public.feed set
  status             = 'closed',
  license            = coalesce(license, '3ER262007'),
  conditions_url     = 'http://basildonswimming.org/wp-content/uploads/2026/08/2026-BPSC-Season-Opener-SC-Meet-L3-Conditions_v2.pdf',
  conditions_label   = '2026 BPSC Season Opener SC Meet L3 – Conditions',
  results_url        = 'http://basildonswimming.org/wp-content/uploads/2026/09/2026-BPSC-Season-Opener-SC-Meet-L3-Results.pdf',
  results_file_url   = 'http://basildonswimming.org/wp-content/uploads/2026/09/SO26MEET.zip',
  results_file_label = 'SO26MEET'
where type = 'meet' and start_date = '2026-09-12'::date and results_url is null;

update public.feed set
  status             = 'closed',
  license            = coalesce(license, '3ER261281'),
  conditions_url     = 'http://basildonswimming.org/wp-content/uploads/2026/06/2026-BPSC-End-of-Season-SC-Meet-L3-Conditions.pdf',
  conditions_label   = '2026 BPSC End of Season SC Meet L3 – Conditions',
  results_url        = 'http://basildonswimming.org/wp-content/uploads/2026/07/2026-BPSC-End-of-Season-SC-Meet-L3-Results.pdf',
  results_file_url   = 'http://basildonswimming.org/wp-content/uploads/2026/07/EO26MEET.zip',
  results_file_label = 'EO26MEET'
where type = 'meet' and start_date = '2026-07-11'::date and results_url is null;

-- The seeded 2026 galas carry '#' placeholders where a link had not been set yet. Now that
-- these meets are completed and on show in the archive, a '#' renders as a dead link in the
-- "Meet documents & links" list, so clear them.
update public.feed set
  entry_url           = nullif(entry_url, '#'),
  officials_url       = nullif(officials_url, '#'),
  volunteer_url       = nullif(volunteer_url, '#'),
  conditions_url      = nullif(conditions_url, '#'),
  entry_file_url      = nullif(entry_file_url, '#'),
  current_entries_url = nullif(current_entries_url, '#')
where '#' in (entry_url, officials_url, volunteer_url, conditions_url, entry_file_url, current_entries_url);
