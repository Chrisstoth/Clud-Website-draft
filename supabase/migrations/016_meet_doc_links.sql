-- Meet documents & links become a free list instead of four fixed slots. Each gala needs
-- different paperwork (conditions, entry file, results file, warm-up times, programme…), so the
-- members' area now has "+ Add link": each line has a name, optional link text, the URL and an
-- optional highlight colour, and shows up in the card's "Meet documents & links" panel in order.
--
-- Stored as a list on the feed row, e.g.
--   [{"label":"Meet conditions & details","text":"View conditions","url":"https://…","hl":"orange"}]
-- hl is one of "", orange, yellow, green, blue, red.
--
-- Run this BEFORE the updated site files go up: the members' area sends this column with every
-- save, so until it exists saving any calendar/news item fails with
-- "Could not find the 'doc_links' column of 'feed' in the schema cache".
--
-- Moves each meet's existing conditions / entry file / results file / current entries links into
-- the new list (same wording the site showed before), then clears the old columns so the site no
-- longer reads them. Safe to re-run: the copy only picks up rows whose old columns still hold a
-- link, and appends to (never replaces) whatever is already in the list.

alter table public.feed add column if not exists doc_links jsonb not null default '[]'::jsonb;

update public.feed set
  doc_links = doc_links || (
    select coalesce(jsonb_agg(l order by ord), '[]'::jsonb) from (values
      (1, conditions_url,      'Meet conditions & details', coalesce(conditions_label,  'View conditions')),
      (2, entry_file_url,      'Sports Systems entry file', coalesce(entry_file_label,  'Download entry file')),
      (3, results_file_url,    'Sports Systems results file', coalesce(results_file_label,'Download results file')),
      (4, current_entries_url, 'Current entries',           'View entries')
    ) as v(ord, url, label, text)
    cross join lateral (select jsonb_build_object('label', label, 'text', text, 'url', url, 'hl', '') as l) j
    where nullif(trim(url), '') is not null
  ),
  conditions_url = null, conditions_label = null,
  entry_file_url = null, entry_file_label = null,
  results_file_url = null, results_file_label = null,
  current_entries_url = null
where coalesce(conditions_url, entry_file_url, results_file_url, current_entries_url) is not null;

-- Tell the API to re-read the table layout now, so saving works straight away.
notify pgrst, 'reload schema';
