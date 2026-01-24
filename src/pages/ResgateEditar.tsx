
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Registro } from '@/types/hotspots';

const REGISTROS_URL = '/secao-operacional/registros';

const selectResgate = (desfechoTable: string) => `
  *,
  regiao_administrativa:dim_regiao_administrativa(nome),
  origem:dim_origem(nome),
  destinacao:dim_destinacao(nome),
  estado_saude:dim_estado_saude(nome),
  estagio_vida:dim_estagio_vida(nome),
  desfecho:${desfechoTable}(nome, tipo),
  especie:dim_especies_fauna(*)
`;

const ResgateEditar = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistro = async () => {
      if (!id) return;
      
      try {
        let data: any = null;
        let lastError: any = null;

        // 1) fat_registros_de_resgate (usado em RegistrosUnificados)
        const { data: d1, error: e1 } = await supabaseAny
          .from('fat_registros_de_resgate')
          .select(selectResgate('dim_desfecho_resgates'))
          .eq('id', id)
          .maybeSingle();
        if (!e1 && d1) data = d1;
        else if (e1) lastError = e1;

        // 2) fat_resgates_diarios_2025
        if (!data) {
          const { data: d2, error: e2 } = await supabaseAny
            .from('fat_resgates_diarios_2025')
            .select(selectResgate('dim_desfecho'))
            .eq('id', id)
            .maybeSingle();
          if (!e2 && d2) data = d2;
          else if (e2) lastError = e2;
        }

        if (!data) throw lastError || new Error('Registro não encontrado');

        if (!data.data && data.data_ocorrencia) data.data = data.data_ocorrencia;

        const processedRegistro: Registro = {
          ...data,
          quantidade_adulto: data.quantidade_adulto ?? 0,
          quantidade_filhote: data.quantidade_filhote ?? 0,
          quantidade: (data.quantidade_adulto ?? 0) + (data.quantidade_filhote ?? 0) || data.quantidade || 0,
        };

        setRegistro(processedRegistro);

        navigate(`/secao-operacional/resgate-cadastro?editar=${id}`, {
          state: { registro: processedRegistro, fromEdit: true },
        });
      } catch (error) {
        console.error('Erro ao buscar registro:', error);
        toast.error('Erro ao carregar o registro para edição');
        navigate(REGISTROS_URL);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistro();
  }, [id, navigate]);

  return (
    <Layout title="Carregando Registro..." showBackButton>
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-fauna-blue" />
        <span className="ml-2">Carregando dados do registro...</span>
      </div>
    </Layout>
  );
};

export default ResgateEditar;
