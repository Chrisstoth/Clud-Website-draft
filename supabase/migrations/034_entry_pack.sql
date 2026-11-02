-- A gala's entry pack, kept apart from its entry link.
--
-- entry_url:      the online entry system -- the green "Enter here" button.
-- entry_pack_url: the entry pack (a PDF uploaded to the "documents" store, or a link) -- its own
--                 "Entry pack" button beside it.
-- Either one being set (with entry status "open") makes the gala show as Entries open.
--
-- Until now the gala form had one box for both, so some galas' entry_url holds an entry pack PDF.
-- Those are moved across to entry_pack_url (and entry_url cleared), so they show as "Entry pack"
-- rather than an "Enter here" button that opens a PDF. Links that aren't PDFs stay as the entry link.
--
-- The site keeps working if this hasn't been run yet: the members' area greys out the entry pack
-- box and says it needs this update. Saving anything else is unaffected.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

alter table public.feed add column if not exists entry_pack_url text;

update public.feed set
  entry_pack_url = btrim(entry_url),
  entry_url = null
where type in ('meet', 'external_meet')
  and nullif(btrim(entry_pack_url), '') is null
  and (btrim(entry_url) ~* '\.pdf([?#].*)?$'
       or entry_url like '%/storage/v1/object/public/documents/%');

-- Tell the API to re-read the table layout now, so the members' area can save straight away.
notify pgrst, 'reload schema';
