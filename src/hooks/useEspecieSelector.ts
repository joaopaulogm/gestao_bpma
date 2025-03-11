
import { useState } from 'react';
import { buscarEspeciePorId, type Especie } from '@/services/especieService';

export const useEspecieSelector = () => {
  const [especieSelecionada, setEspecieSelecionada] = useState<Especie | null>(null);
  const [carregandoEspecie, setCarregandoEspecie] = useState(false);

  const buscarDetalhesEspecie = async (especieId: string) => {
    setCarregandoEspecie(true);
    try {
      const especie = await buscarEspeciePorId(especieId);
      setEspecieSelecionada(especie);
    } catch (error) {
      console.error("Erro ao buscar detalhes da espécie:", error);
    } finally {
      setCarregandoEspecie(false);
    }
  };

  const limparEspecie = () => {
    setEspecieSelecionada(null);
  };

  return {
    especieSelecionada,
    carregandoEspecie,
    buscarDetalhesEspecie,
    limparEspecie
  };
};
