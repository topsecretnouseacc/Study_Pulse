-- Enables private image uploads for AI question solving.
-- Safe to run more than once.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-question-images',
  'ai-question-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own AI question images" on storage.objects;
drop policy if exists "Users can read own AI question images" on storage.objects;
drop policy if exists "Users can delete own AI question images" on storage.objects;

create policy "Users can upload own AI question images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ai-question-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own AI question images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'ai-question-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own AI question images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'ai-question-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
