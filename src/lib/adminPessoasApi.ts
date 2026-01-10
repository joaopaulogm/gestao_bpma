// Utility para chamadas à Edge Function admin-pessoas
// Centraliza todas as operações de escrita do módulo Seção Pessoas

import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oiwwptnqaunsyhpkwbrz.supabase.co';

interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Chama a Edge Function admin-pessoas com uma action específica
 */
export async function callAdminPessoas<T = any>(
  action: string,
  payload: Record<string, any>
): Promise<ApiResponse<T>> {
  try {
    // Get session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { ok: false, error: 'Not authenticated' };
    }

    // Call Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-pessoas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action,
        ...payload,
      }),
    });

    const result: ApiResponse<T> = await response.json();

    if (!response.ok || !result.ok) {
      return {
        ok: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return result;
  } catch (error: any) {
    console.error('Error calling admin-pessoas:', error);
    return {
      ok: false,
      error: error.message || 'Network error',
    };
  }
}

// Convenience functions for each action type

export async function upsertAbono(payload: {
  efetivo_id?: string;
  matricula?: string;
  ano: number;
  mes: number;
  observacao?: string;
}) {
  return callAdminPessoas('abono_upsert', payload);
}

export async function deleteAbono(payload: {
  id?: string;
  efetivo_id?: string;
  ano?: number;
  mes?: number;
}) {
  return callAdminPessoas('abono_delete', payload);
}

export async function upsertRestricao(payload: {
  efetivo_id?: string;
  matricula?: string;
  tipo_restricao: string;
  data_inicio: string;
  data_fim?: string | null;
  observacao?: string;
}) {
  return callAdminPessoas('restricao_upsert', payload);
}

export async function deleteRestricao(payload: { id: string }) {
  return callAdminPessoas('restricao_delete', payload);
}

export async function upsertLicenca(payload: {
  efetivo_id?: string;
  matricula?: string;
  data_inicio: string;
  data_fim?: string | null;
  dias?: number | null;
  tipo?: string;
  cid?: string | null;
  observacao?: string;
}) {
  return callAdminPessoas('licenca_upsert', payload);
}

export async function deleteLicenca(payload: { id: string }) {
  return callAdminPessoas('licenca_delete', payload);
}

export async function insertFerias(payload: {
  efetivo_id: string;
  ano: number;
  mes_inicio: number;
  dias: number;
  tipo?: string;
  observacao?: string;
}) {
  return callAdminPessoas('ferias_insert', payload);
}

export async function deleteFerias(payload: { id: string }) {
  return callAdminPessoas('ferias_delete', payload);
}

export async function updateFerias(payload: {
  id: string;
  mes_inicio?: number;
  dias?: number;
  tipo?: string;
  observacao?: string;
}) {
  return callAdminPessoas('ferias_update', payload);
}

export async function upsertEquipeMembro(payload: {
  equipe_id: string;
  efetivo_id?: string;
  matricula?: string;
  funcao?: string;
}) {
  return callAdminPessoas('equipe_membro_upsert', payload);
}

export async function upsertCampanhaMembro(payload: {
  equipe_id: string;
  efetivo_id?: string;
  matricula?: string;
  unidade: string;
  ano: number;
  funcao?: string;
}) {
  return callAdminPessoas('campanha_membro_upsert', payload);
}

export async function deleteCampanhaMembro(payload: { id: string }) {
  return callAdminPessoas('campanha_membro_delete', payload);
}

export async function updateCampanhaMembro(payload: {
  id: string;
  equipe_id?: string;
  funcao?: string;
}) {
  return callAdminPessoas('campanha_membro_update', payload);
}

export async function insertCampanhaAlteracao(payload: {
  data: string;
  unidade: string;
  equipe_nova_id: string;
  equipe_original_id?: string | null;
  motivo?: string;
}) {
  return callAdminPessoas('campanha_alteracao_insert', payload);
}

export async function deleteCampanhaAlteracao(payload: {
  data: string;
  unidade: string;
}) {
  return callAdminPessoas('campanha_alteracao_delete', payload);
}

export async function insertEquipe(payload: {
  nome: string;
  grupamento: string;
  escala?: string | null;
  servico?: string | null;
}) {
  return callAdminPessoas('equipe_insert', payload);
}

export async function updateEquipe(payload: {
  id: string;
  nome?: string;
  grupamento?: string;
  escala?: string | null;
  servico?: string | null;
}) {
  return callAdminPessoas('equipe_update', payload);
}

export async function deleteEquipe(payload: { id: string }) {
  return callAdminPessoas('equipe_delete', payload);
}

export async function deleteEquipeMembro(payload: {
  id?: string;
  equipe_id?: string;
  efetivo_id?: string;
}) {
  return callAdminPessoas('equipe_membro_delete', payload);
}

export async function deleteEquipeMembrosBulk(payload: { equipe_id: string }) {
  return callAdminPessoas('equipe_membros_bulk_delete', payload);
}

