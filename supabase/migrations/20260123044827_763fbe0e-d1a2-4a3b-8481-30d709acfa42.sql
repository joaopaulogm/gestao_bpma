-- =====================================================
-- TRIGGERS: Notificações automáticas para férias
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_ferias_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role_id UUID;
  v_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  -- Buscar user_role_id pelo efetivo_id
  SELECT ur.id, COALESCE(ur.nome_guerra, ur.nome) INTO v_user_role_id, v_nome
  FROM user_roles ur
  WHERE ur.efetivo_id = COALESCE(NEW.efetivo_id, OLD.efetivo_id)
  LIMIT 1;

  IF v_user_role_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_titulo := 'Férias Programadas';
    v_mensagem := 'Suas férias para ' || NEW.ano || ' foram cadastradas no sistema.';
  ELSIF TG_OP = 'UPDATE' THEN
    v_titulo := 'Férias Alteradas';
    v_mensagem := 'Houve alteração nas suas férias de ' || NEW.ano || '. Verifique os detalhes.';
  ELSIF TG_OP = 'DELETE' THEN
    v_titulo := 'Férias Canceladas';
    v_mensagem := 'Suas férias de ' || OLD.ano || ' foram removidas do sistema.';
  END IF;

  INSERT INTO notificacoes (user_role_id, titulo, mensagem, tipo, categoria, dados_extras)
  VALUES (v_user_role_id, v_titulo, v_mensagem, 'info', 'ferias', 
    jsonb_build_object('ano', COALESCE(NEW.ano, OLD.ano), 'operacao', TG_OP));

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_ferias ON fat_ferias;
CREATE TRIGGER trigger_notify_ferias
AFTER INSERT OR UPDATE OR DELETE ON fat_ferias
FOR EACH ROW
EXECUTE FUNCTION notify_ferias_change();

-- =====================================================
-- TRIGGERS: Notificações automáticas para abono
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_abono_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role_id UUID;
  v_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  -- Buscar user_role_id pelo efetivo_id
  SELECT ur.id, COALESCE(ur.nome_guerra, ur.nome) INTO v_user_role_id, v_nome
  FROM user_roles ur
  WHERE ur.efetivo_id = COALESCE(NEW.efetivo_id, OLD.efetivo_id)
  LIMIT 1;

  IF v_user_role_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_titulo := 'Abono Registrado';
    v_mensagem := 'Um novo abono foi registrado para você.';
  ELSIF TG_OP = 'UPDATE' THEN
    v_titulo := 'Abono Alterado';
    v_mensagem := 'Houve alteração no seu registro de abono. Verifique os detalhes.';
  ELSIF TG_OP = 'DELETE' THEN
    v_titulo := 'Abono Removido';
    v_mensagem := 'Seu abono foi removido do sistema.';
  END IF;

  INSERT INTO notificacoes (user_role_id, titulo, mensagem, tipo, categoria, dados_extras)
  VALUES (v_user_role_id, v_titulo, v_mensagem, 'info', 'abono', 
    jsonb_build_object('ano', COALESCE(NEW.ano, OLD.ano), 'mes', COALESCE(NEW.mes, OLD.mes), 'operacao', TG_OP));

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_abono ON fat_abono;
CREATE TRIGGER trigger_notify_abono
AFTER INSERT OR UPDATE OR DELETE ON fat_abono
FOR EACH ROW
EXECUTE FUNCTION notify_abono_change();

-- =====================================================
-- TRIGGERS: Notificações automáticas para licenças médicas
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_licenca_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role_id UUID;
  v_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  -- Buscar user_role_id pelo efetivo_id
  SELECT ur.id, COALESCE(ur.nome_guerra, ur.nome) INTO v_user_role_id, v_nome
  FROM user_roles ur
  WHERE ur.efetivo_id = COALESCE(NEW.efetivo_id, OLD.efetivo_id)
  LIMIT 1;

  IF v_user_role_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_titulo := 'Licença Registrada';
    v_mensagem := 'Uma licença médica foi registrada para você a partir de ' || COALESCE(NEW.data_inicio::text, 'data não informada') || '.';
  ELSIF TG_OP = 'UPDATE' THEN
    v_titulo := 'Licença Alterada';
    v_mensagem := 'Houve alteração na sua licença médica. Verifique os detalhes.';
  ELSIF TG_OP = 'DELETE' THEN
    v_titulo := 'Licença Removida';
    v_mensagem := 'Sua licença médica foi removida do sistema.';
  END IF;

  INSERT INTO notificacoes (user_role_id, titulo, mensagem, tipo, categoria, dados_extras)
  VALUES (v_user_role_id, v_titulo, v_mensagem, 'info', 'afastamento', 
    jsonb_build_object('tipo', COALESCE(NEW.tipo, OLD.tipo), 'data_inicio', COALESCE(NEW.data_inicio, OLD.data_inicio), 'operacao', TG_OP));

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_licenca ON fat_licencas_medicas;
CREATE TRIGGER trigger_notify_licenca
AFTER INSERT OR UPDATE OR DELETE ON fat_licencas_medicas
FOR EACH ROW
EXECUTE FUNCTION notify_licenca_change();

-- =====================================================
-- TRIGGERS: Notificações automáticas para escala (campanha)
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_campanha_membro_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role_id UUID;
  v_nome TEXT;
  v_equipe_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  -- Buscar user_role_id pelo efetivo_id
  SELECT ur.id, COALESCE(ur.nome_guerra, ur.nome) INTO v_user_role_id, v_nome
  FROM user_roles ur
  WHERE ur.efetivo_id = COALESCE(NEW.efetivo_id, OLD.efetivo_id)
  LIMIT 1;

  IF v_user_role_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Buscar nome da equipe
  SELECT nome INTO v_equipe_nome
  FROM dim_equipes_campanha
  WHERE id = COALESCE(NEW.equipe_id, OLD.equipe_id)
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    v_titulo := 'Escala de Campanha';
    v_mensagem := 'Você foi incluído na equipe ' || COALESCE(v_equipe_nome, 'não identificada') || ' para a campanha ' || NEW.ano || '.';
  ELSIF TG_OP = 'UPDATE' AND NEW.equipe_id <> OLD.equipe_id THEN
    v_titulo := 'Mudança de Equipe';
    v_mensagem := 'Você foi transferido para a equipe ' || COALESCE(v_equipe_nome, 'não identificada') || '.';
  ELSIF TG_OP = 'DELETE' THEN
    v_titulo := 'Remoção de Escala';
    v_mensagem := 'Você foi removido da escala de campanha.';
  ELSE
    -- Não notificar updates que não alterem equipe
    RETURN NEW;
  END IF;

  INSERT INTO notificacoes (user_role_id, titulo, mensagem, tipo, categoria, dados_extras)
  VALUES (v_user_role_id, v_titulo, v_mensagem, 'info', 'escala', 
    jsonb_build_object('equipe', v_equipe_nome, 'ano', COALESCE(NEW.ano, OLD.ano), 'operacao', TG_OP));

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_campanha_membro ON fat_campanha_membros;
CREATE TRIGGER trigger_notify_campanha_membro
AFTER INSERT OR UPDATE OR DELETE ON fat_campanha_membros
FOR EACH ROW
EXECUTE FUNCTION notify_campanha_membro_change();