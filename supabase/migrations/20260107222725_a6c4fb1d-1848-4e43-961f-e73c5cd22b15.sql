-- Criar tabela para pré-configurar roles do efetivo (antes de eles fazerem login)
CREATE TABLE IF NOT EXISTS public.efetivo_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    efetivo_id uuid NOT NULL REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'operador',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(efetivo_id, role)
);

-- Habilitar RLS
ALTER TABLE public.efetivo_roles ENABLE ROW LEVEL SECURITY;

-- Política para admins verem e gerenciarem
CREATE POLICY "Admins can manage efetivo_roles"
ON public.efetivo_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política para leitura pública (necessário para verificar roles no login)
CREATE POLICY "Anyone can read efetivo_roles"
ON public.efetivo_roles
FOR SELECT
TO authenticated
USING (true);

-- Inserir roles de seção operacional para os 4 membros específicos
INSERT INTO public.efetivo_roles (efetivo_id, role)
VALUES 
  ('9f8dbf7d-0557-4075-867d-447f06ab0687', 'secao_operacional'),  -- JOAO MACIEL
  ('9663cd0f-46e0-4db7-a136-738fc40185d4', 'secao_operacional'),  -- RAFAEL PAZ
  ('3a3050cb-3b25-40d3-addc-c0fabedef633', 'secao_operacional'),  -- ANDRE LUIZ
  ('0f066b4e-3371-4e29-b719-0ee621b3cfba', 'secao_operacional');  -- ROGERIO PORTELA

-- Inserir role operador para todos os outros membros do efetivo
INSERT INTO public.efetivo_roles (efetivo_id, role)
SELECT id, 'operador'::app_role
FROM public.dim_efetivo
WHERE id NOT IN (
  '9f8dbf7d-0557-4075-867d-447f06ab0687',
  '9663cd0f-46e0-4db7-a136-738fc40185d4',
  '3a3050cb-3b25-40d3-addc-c0fabedef633',
  '0f066b4e-3371-4e29-b719-0ee621b3cfba'
);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_efetivo_roles_updated_at
BEFORE UPDATE ON public.efetivo_roles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();