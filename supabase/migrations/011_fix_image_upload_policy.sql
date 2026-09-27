-- Fixes "Your account isn't allowed to change that" when uploading a photo.
--
-- The storage policies checked "current_member() is not null", but for a whole row Postgres
-- only treats it as not-null when EVERY column is filled in. The webmaster row (and any role
-- that can edit all feed types) has feed_types = null, so the check failed for exactly the
-- people who should be allowed. Checking the email column instead asks the real question:
-- "is this signed-in account in the members table?"
--
-- Safe to re-run: drops and recreates just these two policies. Doesn't touch any photos.

drop policy if exists "images club write" on storage.objects;
drop policy if exists "images club delete" on storage.objects;

create policy "images club write" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and (public.current_member()).email is not null);
create policy "images club delete" on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and (public.current_member()).email is not null);
