-- Results PDFs: somewhere to keep a gala's results file on the site itself, instead of
-- uploading it elsewhere and pasting the link in.
--
-- A public bucket ("documents"), readable by anyone, writable by any signed-in club account --
-- the same rules as the photo store (see 011_fix_image_upload_policy.sql). PDFs only, up to 25 MB.
--
-- Safe to re-run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', true, 26214400, array['application/pdf'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "documents public read" on storage.objects;
drop policy if exists "documents club write" on storage.objects;
drop policy if exists "documents club delete" on storage.objects;

create policy "documents public read" on storage.objects for select
  using (bucket_id = 'documents');
create policy "documents club write" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (public.current_member()).email is not null);
create policy "documents club delete" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (public.current_member()).email is not null);
