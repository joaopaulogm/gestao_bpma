-- ============================================
-- ADICIONAR FOREIGN KEYS PARA fat_resgates_diarios_2025
-- ============================================
-- Esta migration adiciona foreign keys à tabela fat_resgates_diarios_2025
-- para que o PostgREST possa fazer joins corretamente

-- Verificar se a tabela existe antes de adicionar constraints
DO $$
BEGIN
  -- Adicionar foreign key para dim_regiao_administrativa
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    -- Remover constraint se já existir
    ALTER TABLE public.fat_resgates_diarios_2025 
    DROP CONSTRAINT IF EXISTS fk_resgates_2025_regiao;
    
    -- Adicionar constraint
    ALTER TABLE public.fat_resgates_diarios_2025
    ADD CONSTRAINT fk_resgates_2025_regiao
    FOREIGN KEY (regiao_administrativa_id) 
    REFERENCES public.dim_regiao_administrativa(id)
    ON DELETE SET NULL;
  END IF;

  -- Adicionar foreign key para dim_origem
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    ALTER TABLE public.fat_resgates_diarios_2025 
    DROP CONSTRAINT IF EXISTS fk_resgates_2025_origem;
    
    ALTER TABLE public.fat_resgates_diarios_2025
    ADD CONSTRAINT fk_resgates_2025_origem
    FOREIGN KEY (origem_id) 
    REFERENCES public.dim_origem(id)
    ON DELETE SET NULL;
  END IF;

  -- Adicionar foreign key para dim_destinacao
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    ALTER TABLE public.fat_resgates_diarios_2025 
    DROP CONSTRAINT IF EXISTS fk_resgates_2025_destinacao;
    
    ALTER TABLE public.fat_resgates_diarios_2025
    ADD CONSTRAINT fk_resgates_2025_destinacao
    FOREIGN KEY (destinacao_id) 
    REFERENCES public.dim_destinacao(id)
    ON DELETE SET NULL;
  END IF;

  -- Adicionar foreign key para dim_estado_saude
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    ALTER TABLE public.fat_resgates_diarios_2025 
    DROP CONSTRAINT IF EXISTS fk_resgates_2025_estado_saude;
    
    ALTER TABLE public.fat_resgates_diarios_2025
    ADD CONSTRAINT fk_resgates_2025_estado_saude
    FOREIGN KEY (estado_saude_id) 
    REFERENCES public.dim_estado_saude(id)
    ON DELETE SET NULL;
  END IF;

  -- Adicionar foreign key para dim_estagio_vida
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    ALTER TABLE public.fat_resgates_diarios_2025 
    DROP CONSTRAINT IF EXISTS fk_resgates_2025_estagio_vida;
    
    ALTER TABLE public.fat_resgates_diarios_2025
    ADD CONSTRAINT fk_resgates_2025_estagio_vida
    FOREIGN KEY (estagio_vida_id) 
    REFERENCES public.dim_estagio_vida(id)
    ON DELETE SET NULL;
  END IF;

  -- Adicionar foreign key para dim_desfecho
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    ALTER TABLE public.fat_resgates_diarios_2025 
    DROP CONSTRAINT IF EXISTS fk_resgates_2025_desfecho;
    
    ALTER TABLE public.fat_resgates_diarios_2025
    ADD CONSTRAINT fk_resgates_2025_desfecho
    FOREIGN KEY (desfecho_id) 
    REFERENCES public.dim_desfecho(id)
    ON DELETE SET NULL;
  END IF;

  -- Adicionar foreign key para dim_especies_fauna
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    ALTER TABLE public.fat_resgates_diarios_2025 
    DROP CONSTRAINT IF EXISTS fk_resgates_2025_especie;
    
    ALTER TABLE public.fat_resgates_diarios_2025
    ADD CONSTRAINT fk_resgates_2025_especie
    FOREIGN KEY (especie_id) 
    REFERENCES public.dim_especies_fauna(id)
    ON DELETE SET NULL;
  END IF;

  -- Adicionar foreign key para dim_tipo_de_area
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    ALTER TABLE public.fat_resgates_diarios_2025 
    DROP CONSTRAINT IF EXISTS fk_resgates_2025_tipo_area;
    
    ALTER TABLE public.fat_resgates_diarios_2025
    ADD CONSTRAINT fk_resgates_2025_tipo_area
    FOREIGN KEY (tipo_area_id) 
    REFERENCES public.dim_tipo_de_area(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_resgates_2025_regiao ON public.fat_resgates_diarios_2025(regiao_administrativa_id);
CREATE INDEX IF NOT EXISTS idx_resgates_2025_origem ON public.fat_resgates_diarios_2025(origem_id);
CREATE INDEX IF NOT EXISTS idx_resgates_2025_destinacao ON public.fat_resgates_diarios_2025(destinacao_id);
CREATE INDEX IF NOT EXISTS idx_resgates_2025_estado_saude ON public.fat_resgates_diarios_2025(estado_saude_id);
CREATE INDEX IF NOT EXISTS idx_resgates_2025_estagio_vida ON public.fat_resgates_diarios_2025(estagio_vida_id);
CREATE INDEX IF NOT EXISTS idx_resgates_2025_desfecho ON public.fat_resgates_diarios_2025(desfecho_id);
CREATE INDEX IF NOT EXISTS idx_resgates_2025_especie ON public.fat_resgates_diarios_2025(especie_id);
CREATE INDEX IF NOT EXISTS idx_resgates_2025_data ON public.fat_resgates_diarios_2025(data);

