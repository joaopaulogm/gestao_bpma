
import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData, AnimalItem } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import { toast } from 'sonner';

export const useMultipleAnimaisForm = (form: UseFormReturn<ResgateFormData>) => {
  const { setValue, getValues } = form;
  const [especiesSelecionadas, setEspeciesSelecionadas] = useState<(Especie | null)[]>([null]);
  const [carregandoEspecies, setCarregandoEspecies] = useState<boolean[]>([false]);

  // Initialize with a default empty animal if none exists
  const initializeAnimais = useCallback(() => {
    const currentAnimais = getValues('animais');
    if (!currentAnimais || currentAnimais.length === 0) {
      setValue('animais', [{
        classeTaxonomica: '',
        especieId: '',
        estadoSaude: '',
        atropelamento: '',
        estagioVida: '',
        quantidadeAdulto: 0,
        quantidadeFilhote: 0,
        quantidade: 0
      }]);
      setEspeciesSelecionadas([null]);
      setCarregandoEspecies([false]);
    }
  }, [getValues, setValue]);

  // Function to add a new animal
  const handleAnimalAdd = useCallback(() => {
    const currentAnimais = getValues('animais') || [];
    setValue('animais', [
      ...currentAnimais,
      {
        classeTaxonomica: '',
        especieId: '',
        estadoSaude: '',
        atropelamento: '',
        estagioVida: '',
        quantidadeAdulto: 0,
        quantidadeFilhote: 0,
        quantidade: 0
      }
    ]);
    setEspeciesSelecionadas(prev => [...prev, null]);
    setCarregandoEspecies(prev => [...prev, false]);
  }, [getValues, setValue]);

  // Function to remove an animal
  const handleAnimalRemove = useCallback((index: number) => {
    const currentAnimais = getValues('animais') || [];
    if (currentAnimais.length <= 1) {
      toast.warning("É necessário pelo menos um animal no formulário");
      return;
    }
    
    const newAnimais = [...currentAnimais];
    newAnimais.splice(index, 1);
    setValue('animais', newAnimais);
    
    setEspeciesSelecionadas(prev => {
      const newEspecies = [...prev];
      newEspecies.splice(index, 1);
      return newEspecies;
    });
    
    setCarregandoEspecies(prev => {
      const newLoading = [...prev];
      newLoading.splice(index, 1);
      return newLoading;
    });
  }, [getValues, setValue]);

  // Function to update a single field in an animal
  const handleAnimalChange = useCallback((index: number, field: string, value: any) => {
    const currentAnimais = getValues('animais') || [];
    const newAnimais = [...currentAnimais];
    
    // Ensure the animal exists
    if (!newAnimais[index]) {
      newAnimais[index] = {
        classeTaxonomica: '',
        especieId: '',
        estadoSaude: '',
        atropelamento: '',
        estagioVida: '',
        quantidadeAdulto: 0,
        quantidadeFilhote: 0,
        quantidade: 0
      };
    }
    
    // Update the field
    (newAnimais[index] as any)[field] = value;
    
    // If classeTaxonomica changes, reset especieId
    if (field === 'classeTaxonomica') {
      newAnimais[index].especieId = '';
      
      // Clear the selected especie
      setEspeciesSelecionadas(prev => {
        const newEspecies = [...prev];
        newEspecies[index] = null;
        return newEspecies;
      });
    }
    
    setValue('animais', newAnimais);
  }, [getValues, setValue]);

  // Function to handle quantidade changes
  const handleAnimalQuantidadeChange = useCallback((index: number, tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => {
    const currentAnimais = getValues('animais') || [];
    const newAnimais = [...currentAnimais];
    
    // Ensure the animal exists
    if (!newAnimais[index]) {
      return;
    }
    
    const animal = newAnimais[index];
    
    if (tipo === 'adulto') {
      const currentValue = animal.quantidadeAdulto || 0;
      animal.quantidadeAdulto = operacao === 'aumentar' 
        ? currentValue + 1 
        : Math.max(0, currentValue - 1);
    } else {
      const currentValue = animal.quantidadeFilhote || 0;
      animal.quantidadeFilhote = operacao === 'aumentar' 
        ? currentValue + 1 
        : Math.max(0, currentValue - 1);
    }
    
    // Update total quantity for this animal
    animal.quantidade = (animal.quantidadeAdulto || 0) + (animal.quantidadeFilhote || 0);
    
    setValue('animais', newAnimais);
  }, [getValues, setValue]);

  // Function to fetch and set especie details
  const onBuscarDetalhesEspecie = useCallback(async (index: number, especieId: string, buscarEspeciePorId: (id: string) => Promise<Especie>) => {
    if (!especieId) {
      setEspeciesSelecionadas(prev => {
        const newEspecies = [...prev];
        newEspecies[index] = null;
        return newEspecies;
      });
      return;
    }
    
    // Set loading state for this index
    setCarregandoEspecies(prev => {
      const newLoading = [...prev];
      newLoading[index] = true;
      return newLoading;
    });
    
    try {
      const especie = await buscarEspeciePorId(especieId);
      
      setEspeciesSelecionadas(prev => {
        const newEspecies = [...prev];
        newEspecies[index] = especie;
        return newEspecies;
      });
    } catch (error) {
      console.error(`Erro ao buscar espécie ${especieId} para o animal ${index}:`, error);
      toast.error(`Não foi possível carregar os detalhes da espécie`);
      
      setEspeciesSelecionadas(prev => {
        const newEspecies = [...prev];
        newEspecies[index] = null;
        return newEspecies;
      });
    } finally {
      setCarregandoEspecies(prev => {
        const newLoading = [...prev];
        newLoading[index] = false;
        return newLoading;
      });
    }
  }, []);

  return {
    especiesSelecionadas,
    carregandoEspecies,
    initializeAnimais,
    handleAnimalAdd,
    handleAnimalRemove,
    handleAnimalChange,
    handleAnimalQuantidadeChange,
    onBuscarDetalhesEspecie
  };
};
