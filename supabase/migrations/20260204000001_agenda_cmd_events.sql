-- ============================================
-- AGENDA CMD - Eventos do Comando
-- ============================================
-- Tabela de eventos da agenda do comando (criar, editar, excluir).
-- Opção de enviar lembrete por e-mail para comandante e subcomandante.
-- ============================================

-- Eventos da agenda CMD
CREATE TABLE IF NOT EXISTS public.agenda_cmd_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  description TEXT,
  location TEXT,
  enviar_lembrete_comandante BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.agenda_cmd_events IS 'Eventos da Agenda do Comando (Agenda CMD)';
COMMENT ON COLUMN public.agenda_cmd_events.enviar_lembrete_comandante IS 'Se true, lembrete deve ser enviado por e-mail para comandante e subcomandante';

CREATE INDEX IF NOT EXISTS idx_agenda_cmd_events_start_at ON public.agenda_cmd_events(start_at);
CREATE INDEX IF NOT EXISTS idx_agenda_cmd_events_end_at ON public.agenda_cmd_events(end_at);

-- Trigger updated_at
CREATE TRIGGER set_agenda_cmd_events_updated_at
  BEFORE UPDATE ON public.agenda_cmd_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Configuração de e-mails para lembretes (comandante e subcomandante)
CREATE TABLE IF NOT EXISTS public.agenda_cmd_config (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.agenda_cmd_config IS 'Configurações da Agenda CMD (ex: e-mail comandante, subcomandante)';

CREATE TRIGGER set_agenda_cmd_config_updated_at
  BEFORE UPDATE ON public.agenda_cmd_config
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Valores padrão opcionais (podem ser alterados no app ou no Dashboard)
INSERT INTO public.agenda_cmd_config (chave, valor)
VALUES
  ('comandante_email', ''),
  ('subcomandante_email', '')
ON CONFLICT (chave) DO NOTHING;

-- RLS
ALTER TABLE public.agenda_cmd_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_cmd_config ENABLE ROW LEVEL SECURITY;

-- Acesso: usuários autenticados com role admin ou comando podem tudo
CREATE POLICY "Comando e admin podem gerenciar agenda_cmd_events"
  ON public.agenda_cmd_events
  FOR ALL
  TO authenticated
  USING (
    public.get_role_by_auth_user_id(auth.uid())::text IN ('admin', 'comando')
  )
  WITH CHECK (
    public.get_role_by_auth_user_id(auth.uid())::text IN ('admin', 'comando')
  );

CREATE POLICY "Comando e admin podem ler agenda_cmd_config"
  ON public.agenda_cmd_config
  FOR SELECT
  TO authenticated
  USING (
    public.get_role_by_auth_user_id(auth.uid())::text IN ('admin', 'comando')
  );

CREATE POLICY "Comando e admin podem atualizar agenda_cmd_config"
  ON public.agenda_cmd_config
  FOR UPDATE
  TO authenticated
  USING (
    public.get_role_by_auth_user_id(auth.uid())::text IN ('admin', 'comando')
  )
  WITH CHECK (
    public.get_role_by_auth_user_id(auth.uid())::text IN ('admin', 'comando')
  );
