-- Migration: RLS fat_abono - admin e secao_pessoas
-- Data: 2026-01-23
-- Descrição: Permite SELECT e demais operações em fat_abono para admin e secao_pessoas,
--            alinhado a fat_ferias, fat_ferias_parcelas e fat_licencas_medicas.
--            Corrige a página /secao-pessoas/campanha que não carregava abonos para secao_pessoas.

-- Remover policies antigas (SELECT: admin only, WRITE: service_role only)
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_abono;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_abono;

-- Nova policy: admin e secao_pessoas (FOR ALL = SELECT + INSERT + UPDATE + DELETE)
CREATE POLICY "fat_abono_admin_rh"
ON public.fat_abono
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role));
