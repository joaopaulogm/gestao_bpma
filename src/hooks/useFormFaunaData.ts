
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { faunaSchema, type FaunaFormData } from '@/schemas/faunaSchema';
import { cadastrarEspecie, atualizarEspecie, buscarEspeciePorId } from '@/services/especieService';

export const useFormFaunaData = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const { handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    const fetchEspecie = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const especie = await buscarEspeciePorId(id);
        if (especie) {
          reset({
            classe_taxonomica: especie.classe_taxonomica,
            nome_popular: especie.nome_popular,
            nome_cientifico: especie.nome_cientifico,
            ordem_taxonomica: especie.ordem_taxonomica,
            estado_de_conservacao: especie.estado_de_conservacao,
            tipo_de_fauna: especie.tipo_de_fauna,
          });
        } else {
          toast.error('Espécie não encontrada');
          navigate('/fauna-cadastrada');
        }
      } catch (error) {
        console.error('Erro ao buscar espécie:', error);
        toast.error('Erro ao buscar dados da espécie');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEspecie();
  }, [id, reset, navigate]);

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
      
      let result;
      
      if (id) {
        // Atualizar espécie existente
        result = await atualizarEspecie(id, especieData);
        if (result) {
          toast.success('Espécie atualizada com sucesso!');
        } else {
          toast.error('Erro ao atualizar espécie');
        }
      } else {
        // Cadastrar nova espécie
        result = await cadastrarEspecie(especieData);
        if (result) {
          toast.success('Espécie cadastrada com sucesso!');
        } else {
          toast.error('Erro ao cadastrar espécie');
        }
      }
      
      if (result) {
        navigate('/fauna-cadastrada');
      }
    } catch (error) {
      console.error('Erro ao processar espécie:', error);
      toast.error(id ? 'Erro ao atualizar espécie' : 'Erro ao cadastrar espécie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    errors,
    isSubmitting,
    isLoading,
    isEditing: !!id,
    handleSubmit: handleSubmit(onSubmit),
  };
};
