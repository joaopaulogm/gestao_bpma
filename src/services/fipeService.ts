import { supabase } from '@/integrations/supabase/client';

export interface FipeMarca {
  codigo: string;
  nome: string;
}

export interface FipeModelo {
  codigo: number;
  nome: string;
}

export interface FipeAno {
  codigo: string;
  nome: string;
}

export interface FipeValor {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
}

export interface FipeBuscaResultado {
  success: boolean;
  marca?: FipeMarca;
  modelo?: FipeModelo;
  ano?: FipeAno;
  valor?: FipeValor;
  error?: string;
  sugestoes?: string[];
}

type TipoVeiculo = 'carros' | 'motos' | 'caminhoes';

const getTipoVeiculoFromNome = (tipo?: string): TipoVeiculo => {
  if (!tipo) return 'carros';
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes('moto') || tipoLower.includes('motocicleta')) return 'motos';
  if (tipoLower.includes('caminhão') || tipoLower.includes('caminhao') || tipoLower.includes('caminh')) return 'caminhoes';
  return 'carros';
};

export const buscarMarcasFipe = async (tipoVeiculo: TipoVeiculo = 'carros'): Promise<FipeMarca[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('consulta-fipe', {
      body: {},
      headers: {},
    });

    // Usar fetch diretamente já que a edge function usa query params
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || 'https://oiwwptnqaunsyhpkwbrz.supabase.co'}/functions/v1/consulta-fipe?action=marcas&tipo=${tipoVeiculo}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE'}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar marcas FIPE');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar marcas FIPE:', error);
    return [];
  }
};

export const buscarValorFipePorNome = async (
  marca: string,
  modelo?: string,
  ano?: string | number,
  tipo?: string
): Promise<FipeBuscaResultado> => {
  try {
    const tipoVeiculo = getTipoVeiculoFromNome(tipo);
    
    const params = new URLSearchParams({
      action: 'buscar-por-nome',
      tipo: tipoVeiculo,
      marcaNome: marca,
    });

    if (modelo) {
      params.append('modeloNome', modelo);
    }

    if (ano) {
      params.append('anoVeiculo', String(ano));
    }

    console.log(`[FIPE Service] Buscando valor para: ${marca} ${modelo || ''} ${ano || ''}`);

    const response = await fetch(
      `https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/consulta-fipe?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[FIPE Service] Erro:', data);
      return {
        success: false,
        error: data.error || 'Erro ao buscar valor FIPE',
        sugestoes: data.sugestoes,
      };
    }

    return data;
  } catch (error: any) {
    console.error('Erro ao buscar valor FIPE:', error);
    return {
      success: false,
      error: error.message || 'Erro ao conectar com API FIPE',
    };
  }
};

export const formatarValorFipe = (valor?: string): string => {
  if (!valor) return '-';
  return valor;
};

export const parseValorFipe = (valor?: string): number | null => {
  if (!valor) return null;
  // Remove "R$ " e pontos, substitui vírgula por ponto
  const numStr = valor.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
};
