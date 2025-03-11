
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Registro } from '@/types/hotspots';

const ResgateEditar = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistro = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('registros')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setRegistro(data);
        
        // Redirect to the cadastro page with query parameters
        navigate(`/resgate-cadastro?editar=${id}`, { state: { registro: data } });
      } catch (error) {
        console.error('Erro ao buscar registro:', error);
        toast.error('Erro ao carregar o registro para edição');
        navigate('/registros');
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
