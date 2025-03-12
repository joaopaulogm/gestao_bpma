
import { useState } from 'react';
import { toast } from 'sonner';
import { buscarEspeciePorId, buscarEspeciePorNomeCientifico, type Especie } from '@/services/especieService';

export const useEspecieSelector = () => {
  const [especieSelecionada, setEspecieSelecionada] = useState<Especie | null>(null);
  const [carregandoEspecie, setCarregandoEspecie] = useState(false);
  const [especieError, setEspecieError] = useState<string | null>(null);

  const buscarDetalhesEspecie = async (especieId: string) => {
    if (!especieId) {
      setEspecieSelecionada(null);
      return;
    }
    
    setCarregandoEspecie(true);
    setEspecieError(null);
    
    try {
      const especie = await buscarEspeciePorId(especieId);
      setEspecieSelecionada(especie);
    } catch (error) {
      console.error("Erro ao buscar detalhes da espécie:", error);
      setEspecieError("Não foi possível carregar os detalhes da espécie selecionada");
      toast.error("Erro ao carregar detalhes da espécie");
    } finally {
      setCarregandoEspecie(false);
    }
  };

  const buscarEspeciePorNome = async (nomeCientifico: string) => {
    if (!nomeCientifico) {
      setEspecieSelecionada(null);
      return null;
    }
    
    setCarregandoEspecie(true);
    setEspecieError(null);
    
    try {
      const especie = await buscarEspeciePorNomeCientifico(nomeCientifico);
      setEspecieSelecionada(especie);
      return especie;
    } catch (error) {
      console.error("Erro ao buscar espécie por nome científico:", error);
      setEspecieError("Não foi possível encontrar a espécie");
      toast.error("Erro ao buscar espécie");
      return null;
    } finally {
      setCarregandoEspecie(false);
    }
  };

  const limparEspecie = () => {
    setEspecieSelecionada(null);
    setEspecieError(null);
  };

  return {
    especieSelecionada,
    carregandoEspecie,
    especieError,
    buscarDetalhesEspecie,
    buscarEspeciePorNome,
    limparEspecie
  };
};

