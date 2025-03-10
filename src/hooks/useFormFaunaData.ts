
import { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { faunaSchema, type FaunaFormData } from '@/schemas/faunaSchema';
import { cadastrarEspecie } from '@/services/especieService';

export const useFormFaunaData = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FaunaFormData>({
    resolver: zodResolver(faunaSchema),
    defaultValues: {
      classe_taxonomica: '',
      nome_popular: '',
      nome_cientifico: '',
      ordem_taxonomica: '',
      estado_de_conservacao: '',
      tipo_de_fauna: '',
    }
  });

  const { handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: FaunaFormData) => {
    setIsSubmitting(true);
    try {
      // Garantir que todos os campos necessários estejam presentes
      const especieData = {
        classe_taxonomica: data.classe_taxonomica,
        nome_popular: data.nome_popular,
        nome_cientifico: data.nome_cientifico,
        ordem_taxonomica: data.ordem_taxonomica,
        estado_de_conservacao: data.estado_de_conservacao,
        tipo_de_fauna: data.tipo_de_fauna
      };
      
      const result = await cadastrarEspecie(especieData);
      if (result) {
        toast.success('Espécie cadastrada com sucesso!');
        navigate('/fauna-cadastrada');
      } else {
        toast.error('Erro ao cadastrar espécie');
      }
    } catch (error) {
      console.error('Erro ao cadastrar espécie:', error);
      toast.error('Erro ao cadastrar espécie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    errors,
    isSubmitting,
    handleSubmit: handleSubmit(onSubmit),
  };
};
