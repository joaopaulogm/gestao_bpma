import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GrupamentoServicoOption {
  id: string;
  nome: string;
  ordem: number;
}

export function useGrupamentoServico(): { options: GrupamentoServicoOption[]; loading: boolean } {
  const [options, setOptions] = useState<GrupamentoServicoOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchOptions() {
      try {
        const { data, error } = await supabase
          .from('dim_grupamento_servico')
          .select('id, nome, ordem')
          .order('ordem', { ascending: true });

        if (error) throw error;
        if (!cancelled && data) {
          setOptions(data as GrupamentoServicoOption[]);
        }
      } catch (err) {
        console.error('Erro ao carregar grupamentos/serviços:', err);
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOptions();
    return () => { cancelled = true; };
  }, []);

  return { options, loading };
}
