-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagens-fauna', 'imagens-fauna', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('imagens-flora', 'imagens-flora', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload fauna images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update fauna images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete fauna images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view fauna images" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload flora images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update flora images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete flora images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view flora images" ON storage.objects;

-- Policies for imagens-fauna bucket
CREATE POLICY "Allow authenticated users to upload fauna images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagens-fauna');

CREATE POLICY "Allow authenticated users to update fauna images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'imagens-fauna');

CREATE POLICY "Allow authenticated users to delete fauna images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imagens-fauna');

CREATE POLICY "Allow public to view fauna images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'imagens-fauna');

-- Policies for imagens-flora bucket
CREATE POLICY "Allow authenticated users to upload flora images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagens-flora');

CREATE POLICY "Allow authenticated users to update flora images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'imagens-flora');

CREATE POLICY "Allow authenticated users to delete flora images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imagens-flora');

CREATE POLICY "Allow public to view flora images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'imagens-flora');