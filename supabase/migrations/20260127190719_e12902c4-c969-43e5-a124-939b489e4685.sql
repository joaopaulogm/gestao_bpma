-- Criar políticas de storage para o bucket imagens-fauna
-- Permitir usuários autenticados fazer upload, atualizar e deletar imagens

-- Política para SELECT (visualizar imagens) - público
CREATE POLICY "Imagens fauna são públicas para visualização"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'imagens-fauna');

-- Política para INSERT (upload de imagens) - usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de imagens fauna"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagens-fauna');

-- Política para UPDATE (atualizar imagens) - usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar imagens fauna"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'imagens-fauna');

-- Política para DELETE (remover imagens) - usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar imagens fauna"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imagens-fauna');