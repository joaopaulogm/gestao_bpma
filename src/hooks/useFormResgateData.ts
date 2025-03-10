
import { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resgateSchema, type ResgateFormData } from '@/schemas/resgateSchema';
import { defaultResgateForm } from '@/constants/defaultResgateForm';
import { regioes } from '@/constants/regioes';
import { buscarEspeciePorId, type Especie } from '@/services/especieService';

export { regioes } from '@/constants/regioes';

export const useFormResgateData = () => {
  const [especieSelecionada, setEspecieSelecionada] = useState<Especie | null>(null);
  const [carregandoEspecie, setCarregandoEspecie] = useState(false);
  
  const form = useForm<ResgateFormData>({
    resolver: zodResolver(resgateSchema),
    defaultValues: defaultResgateForm
  });

  const { watch, setValue, formState } = form;
  const formData = watch();
  const { errors } = formState;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValue(name as any, value);
  };

  const handleSelectChange = (name: string, value: string) => {
    setValue(name as any, value);
    
    // Se o campo alterado for a espécie, busca os detalhes da espécie
    if (name === 'especieId' && value) {
      buscarDetalhesEspecie(value);
    }
    
    // Se o campo alterado for a classe taxonômica, limpa a espécie selecionada
    if (name === 'classeTaxonomica') {
      setValue('especieId', '');
      setEspecieSelecionada(null);
    }
  };

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

  const handleQuantidadeChange = (operacao: 'aumentar' | 'diminuir') => {
    const currentValue = formData.quantidade;
    setValue('quantidade', operacao === 'aumentar' 
      ? currentValue + 1 
      : Math.max(1, currentValue - 1)
    );
  };

  const handleSubmit = form.handleSubmit((data) => {
    console.log('Form submitted:', data);
    toast.success('Registro de resgate cadastrado com sucesso!');
    
    // Resetar formulário após envio
    form.reset();
    setEspecieSelecionada(null);
  });

  return {
    form,
    formData,
    errors,
    handleChange,
    handleSelectChange,
    handleQuantidadeChange,
    handleSubmit,
    especieSelecionada,
    carregandoEspecie
  };
};
