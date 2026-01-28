
-- =====================================================
-- POLÍTICAS RLS PARA TABELAS HISTÓRICAS DE RESGATES
-- Liberar acesso para usuários autenticados
-- =====================================================

-- fat_resgates_diarios_2020
DROP POLICY IF EXISTS "Authenticated users can select fat_resgates_diarios_2020" ON public.fat_resgates_diarios_2020;
DROP POLICY IF EXISTS "Authenticated users can insert fat_resgates_diarios_2020" ON public.fat_resgates_diarios_2020;
DROP POLICY IF EXISTS "Authenticated users can update fat_resgates_diarios_2020" ON public.fat_resgates_diarios_2020;
DROP POLICY IF EXISTS "Authenticated users can delete fat_resgates_diarios_2020" ON public.fat_resgates_diarios_2020;

CREATE POLICY "Authenticated users can select fat_resgates_diarios_2020" ON public.fat_resgates_diarios_2020 FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fat_resgates_diarios_2020" ON public.fat_resgates_diarios_2020 FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update fat_resgates_diarios_2020" ON public.fat_resgates_diarios_2020 FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete fat_resgates_diarios_2020" ON public.fat_resgates_diarios_2020 FOR DELETE TO authenticated USING (true);

-- fat_resgates_diarios_2021
DROP POLICY IF EXISTS "Authenticated users can select fat_resgates_diarios_2021" ON public.fat_resgates_diarios_2021;
DROP POLICY IF EXISTS "Authenticated users can insert fat_resgates_diarios_2021" ON public.fat_resgates_diarios_2021;
DROP POLICY IF EXISTS "Authenticated users can update fat_resgates_diarios_2021" ON public.fat_resgates_diarios_2021;
DROP POLICY IF EXISTS "Authenticated users can delete fat_resgates_diarios_2021" ON public.fat_resgates_diarios_2021;

CREATE POLICY "Authenticated users can select fat_resgates_diarios_2021" ON public.fat_resgates_diarios_2021 FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fat_resgates_diarios_2021" ON public.fat_resgates_diarios_2021 FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update fat_resgates_diarios_2021" ON public.fat_resgates_diarios_2021 FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete fat_resgates_diarios_2021" ON public.fat_resgates_diarios_2021 FOR DELETE TO authenticated USING (true);

-- fat_resgates_diarios_2022
DROP POLICY IF EXISTS "Authenticated users can select fat_resgates_diarios_2022" ON public.fat_resgates_diarios_2022;
DROP POLICY IF EXISTS "Authenticated users can insert fat_resgates_diarios_2022" ON public.fat_resgates_diarios_2022;
DROP POLICY IF EXISTS "Authenticated users can update fat_resgates_diarios_2022" ON public.fat_resgates_diarios_2022;
DROP POLICY IF EXISTS "Authenticated users can delete fat_resgates_diarios_2022" ON public.fat_resgates_diarios_2022;

CREATE POLICY "Authenticated users can select fat_resgates_diarios_2022" ON public.fat_resgates_diarios_2022 FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fat_resgates_diarios_2022" ON public.fat_resgates_diarios_2022 FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update fat_resgates_diarios_2022" ON public.fat_resgates_diarios_2022 FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete fat_resgates_diarios_2022" ON public.fat_resgates_diarios_2022 FOR DELETE TO authenticated USING (true);

-- fat_resgates_diarios_2023
DROP POLICY IF EXISTS "Authenticated users can select fat_resgates_diarios_2023" ON public.fat_resgates_diarios_2023;
DROP POLICY IF EXISTS "Authenticated users can insert fat_resgates_diarios_2023" ON public.fat_resgates_diarios_2023;
DROP POLICY IF EXISTS "Authenticated users can update fat_resgates_diarios_2023" ON public.fat_resgates_diarios_2023;
DROP POLICY IF EXISTS "Authenticated users can delete fat_resgates_diarios_2023" ON public.fat_resgates_diarios_2023;

CREATE POLICY "Authenticated users can select fat_resgates_diarios_2023" ON public.fat_resgates_diarios_2023 FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fat_resgates_diarios_2023" ON public.fat_resgates_diarios_2023 FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update fat_resgates_diarios_2023" ON public.fat_resgates_diarios_2023 FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete fat_resgates_diarios_2023" ON public.fat_resgates_diarios_2023 FOR DELETE TO authenticated USING (true);

-- fat_resgates_diarios_2024
DROP POLICY IF EXISTS "Authenticated users can select fat_resgates_diarios_2024" ON public.fat_resgates_diarios_2024;
DROP POLICY IF EXISTS "Authenticated users can insert fat_resgates_diarios_2024" ON public.fat_resgates_diarios_2024;
DROP POLICY IF EXISTS "Authenticated users can update fat_resgates_diarios_2024" ON public.fat_resgates_diarios_2024;
DROP POLICY IF EXISTS "Authenticated users can delete fat_resgates_diarios_2024" ON public.fat_resgates_diarios_2024;

CREATE POLICY "Authenticated users can select fat_resgates_diarios_2024" ON public.fat_resgates_diarios_2024 FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fat_resgates_diarios_2024" ON public.fat_resgates_diarios_2024 FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update fat_resgates_diarios_2024" ON public.fat_resgates_diarios_2024 FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete fat_resgates_diarios_2024" ON public.fat_resgates_diarios_2024 FOR DELETE TO authenticated USING (true);

-- fat_resgates_diarios_2025
DROP POLICY IF EXISTS "Authenticated users can select fat_resgates_diarios_2025" ON public.fat_resgates_diarios_2025;
DROP POLICY IF EXISTS "Authenticated users can insert fat_resgates_diarios_2025" ON public.fat_resgates_diarios_2025;
DROP POLICY IF EXISTS "Authenticated users can update fat_resgates_diarios_2025" ON public.fat_resgates_diarios_2025;
DROP POLICY IF EXISTS "Authenticated users can delete fat_resgates_diarios_2025" ON public.fat_resgates_diarios_2025;

CREATE POLICY "Authenticated users can select fat_resgates_diarios_2025" ON public.fat_resgates_diarios_2025 FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fat_resgates_diarios_2025" ON public.fat_resgates_diarios_2025 FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update fat_resgates_diarios_2025" ON public.fat_resgates_diarios_2025 FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete fat_resgates_diarios_2025" ON public.fat_resgates_diarios_2025 FOR DELETE TO authenticated USING (true);
