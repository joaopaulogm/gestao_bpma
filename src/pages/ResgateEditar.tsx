
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
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistro = async () => {
      if (!id) return;
      
      try {
        let data: any = null;
        let lastError: any = null;

        // Buscar em todas as tabelas possíveis (mesma lógica do RegistrosUnificados)
        // 1) fat_registros_de_resgate (2026+)
        const { data: d1, error: e1 } = await supabaseAny
          .from('fat_registros_de_resgate')
          .select(selectResgate('dim_desfecho_resgates'))
          .eq('id', id)
          .maybeSingle();
        if (!e1 && d1) {
          data = d1;
          console.log('✅ Registro encontrado em fat_registros_de_resgate');
        } else if (e1) {
          console.warn('⚠️ Erro ao buscar em fat_registros_de_resgate:', e1);
          lastError = e1;
        }

        // 2) fat_resgates_diarios_2025
        if (!data) {
          const { data: d2, error: e2 } = await supabaseAny
            .from('fat_resgates_diarios_2025')
            .select(selectResgate('dim_desfecho'))
            .eq('id', id)
            .maybeSingle();
          if (!e2 && d2) {
            data = d2;
            console.log('✅ Registro encontrado em fat_resgates_diarios_2025');
          } else if (e2) {
            console.warn('⚠️ Erro ao buscar em fat_resgates_diarios_2025:', e2);
            lastError = e2;
          }
        }

        // 3) fat_resgates_diarios_2024
        if (!data) {
          const { data: d3, error: e3 } = await supabaseAny
            .from('fat_resgates_diarios_2024')
            .select(selectResgate('dim_desfecho'))
            .eq('id', id)
            .maybeSingle();
          if (!e3 && d3) {
            data = d3;
            console.log('✅ Registro encontrado em fat_resgates_diarios_2024');
          } else if (e3) {
            console.warn('⚠️ Erro ao buscar em fat_resgates_diarios_2024:', e3);
            lastError = e3;
          }
        }

        // 4) fat_resgates_diarios_2023
        if (!data) {
          const { data: d4, error: e4 } = await supabaseAny
            .from('fat_resgates_diarios_2023')
            .select(selectResgate('dim_desfecho'))
            .eq('id', id)
            .maybeSingle();
          if (!e4 && d4) {
            data = d4;
            console.log('✅ Registro encontrado em fat_resgates_diarios_2023');
          } else if (e4) {
            console.warn('⚠️ Erro ao buscar em fat_resgates_diarios_2023:', e4);
            lastError = e4;
          }
        }

        // 5) fat_resgates_diarios_2022
        if (!data) {
          const { data: d5, error: e5 } = await supabaseAny
            .from('fat_resgates_diarios_2022')
            .select(selectResgate('dim_desfecho'))
            .eq('id', id)
            .maybeSingle();
          if (!e5 && d5) {
            data = d5;
            console.log('✅ Registro encontrado em fat_resgates_diarios_2022');
          } else if (e5) {
            console.warn('⚠️ Erro ao buscar em fat_resgates_diarios_2022:', e5);
            lastError = e5;
          }
        }

        // 6) fat_resgates_diarios_2021
        if (!data) {
          const { data: d6, error: e6 } = await supabaseAny
            .from('fat_resgates_diarios_2021')
            .select(selectResgate('dim_desfecho'))
            .eq('id', id)
            .maybeSingle();
          if (!e6 && d6) {
            data = d6;
            console.log('✅ Registro encontrado em fat_resgates_diarios_2021');
          } else if (e6) {
            console.warn('⚠️ Erro ao buscar em fat_resgates_diarios_2021:', e6);
            lastError = e6;
          }
        }

        // 7) fat_resgates_diarios_2020
        if (!data) {
          const { data: d7, error: e7 } = await supabaseAny
            .from('fat_resgates_diarios_2020')
            .select(selectResgate('dim_desfecho'))
            .eq('id', id)
            .maybeSingle();
          if (!e7 && d7) {
            data = d7;
            console.log('✅ Registro encontrado em fat_resgates_diarios_2020');
          } else if (e7) {
            console.warn('⚠️ Erro ao buscar em fat_resgates_diarios_2020:', e7);
            lastError = e7;
          }
        }

        if (!data) {
          console.error('❌ Registro não encontrado em nenhuma tabela. Último erro:', lastError);
          throw lastError || new Error('Registro não encontrado em nenhuma tabela disponível');
        }

        if (!data.data && data.data_ocorrencia) data.data = data.data_ocorrencia;

        const processedRegistro: Registro = {
          ...data,
          quantidade_adulto: data.quantidade_adulto ?? 0,
          quantidade_filhote: data.quantidade_filhote ?? 0,
          quantidade: (data.quantidade_adulto ?? 0) + (data.quantidade_filhote ?? 0) || data.quantidade || 0,
        };

        setRegistro(processedRegistro);

        navigate(`/secao-operacional/resgate-cadastro?editar=${id}`);
      } catch (error: any) {
        console.error('❌ Erro ao buscar registro:', error);
        const errorMessage = error?.message || 'Erro desconhecido ao carregar o registro';
        console.error('Detalhes do erro:', {
          message: errorMessage,
          code: error?.code,
          details: error?.details,
          hint: error?.hint
        });
        toast.error(`Erro ao carregar o registro para edição: ${errorMessage}`);
        setTimeout(() => {
          navigate(REGISTROS_URL);
        }, 2000);
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
