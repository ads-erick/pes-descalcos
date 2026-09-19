-- Bucket público das fotos das cartinhas. Leitura aberta pela URL pública;
-- upload e remoção só pelo servidor, com a SUPABASE_SERVICE_ROLE_KEY.
-- As fotos chegam já reduzidas pelo navegador (400x400 JPEG), por isso o limite baixo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
