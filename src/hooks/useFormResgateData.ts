
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resgateSchema, type ResgateFormData } from '@/schemas/resgateSchema';
import { buscarEspeciesPorClasse, type Especie } from '@/services/especiesService';
import { defaultResgateForm } from '@/constants/defaultResgateForm';
import { regioes } from '@/constants/regioes';

export { regioes } from '@/constants/regioes';

export const useFormResgateData = () => {
  const [especiesLista, setEspeciesLista] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<ResgateFormData>({
    resolver: zodResolver(resgateSchema),
    defaultValues: defaultResgateForm
  });

  const { watch, setValue, formState } = form;
  const formData = watch();
  const { errors } = formState;

  // Carregar lista de espécies com base na classe taxonômica selecionada
  useEffect(() => {
    const fetchEspecies = async () => {
      if (!formData.classeTaxonomica) {
        setEspeciesLista([]);
        return;
      }
      
      console.log(`Iniciando busca de espécies para: ${formData.classeTaxonomica}`);
      setLoading(true);
      setError('');
      
      try {
        const { data, error } = await buscarEspeciesPorClasse(formData.classeTaxonomica);
        
        if (error) {
          console.error('Erro na busca de espécies:', error);
          setError(error);
          toast.error(`Erro ao carregar lista de espécies: ${error}`);
        } else {
          console.log(`Espécies carregadas: ${data.length}`);
          setEspeciesLista(data);
        }
      } catch (err) {
        console.error('Exceção na busca de espécies:', err);
        setError('Erro ao carregar espécies');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEspecies();
  }, [formData.classeTaxonomica]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValue(name as any, value);
  };

  const handleSelectChange = (name: string, value: string) => {
    setValue(name as any, value);
    
    if (name === 'classeTaxonomica') {
      // Resetar nome popular quando mudar classe taxonômica
      setValue('nomePopular', '');
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
  });

  return {
    form,
    formData,
    errors,
    especiesLista,
    loading,
    error,
    handleChange,
    handleSelectChange,
    handleQuantidadeChange,
    handleSubmit
  };
};
