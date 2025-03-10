
import { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resgateSchema, type ResgateFormData } from '@/schemas/resgateSchema';
import { defaultResgateForm } from '@/constants/defaultResgateForm';
import { regioes } from '@/constants/regioes';
import { buscarEspeciePorId, type Especie } from '@/services/especieService';
import { supabase } from '@/integrations/supabase/client';

export { regioes } from '@/constants/regioes';

export const useFormResgateData = () => {
  const [especieSelecionada, setEspecieSelecionada] = useState<Especie | null>(null);
  const [carregandoEspecie, setCarregandoEspecie] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ResgateFormData>({
    resolver: zodResolver(resgateSchema),
    defaultValues: defaultResgateForm
  });

  const { watch, setValue, formState, reset } = form;
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

  const salvarRegistroNoBanco = async (data: ResgateFormData) => {
    if (!especieSelecionada) {
      console.error("Espécie não selecionada");
      return false;
    }

    try {
      // Converter a data para formato ISO string para o banco de dados
      const dataFormatada = new Date(data.data).toISOString();
      
      const { error } = await supabase.from('registros').insert({
        data: dataFormatada,
        classe_taxonomica: data.classeTaxonomica,
        nome_cientifico: especieSelecionada.nome_cientifico,
        nome_popular: especieSelecionada.nome_popular,
        regiao_administrativa: data.regiaoAdministrativa,
        origem: data.origem,
        latitude_origem: data.latitudeOrigem,
        longitude_origem: data.longitudeOrigem,
        desfecho_apreensao: data.desfechoApreensao || null,
        numero_tco: data.numeroTCO || null,
        outro_desfecho: data.outroDesfecho || null,
        estado_saude: data.estadoSaude,
        atropelamento: data.atropelamento,
        estagio_vida: data.estagioVida,
        quantidade: data.quantidade,
        destinacao: data.destinacao,
        numero_termo_entrega: data.numeroTermoEntrega || null,
        hora_guarda_ceapa: data.horaGuardaCEAPA || null,
        motivo_entrega_ceapa: data.motivoEntregaCEAPA || null,
        latitude_soltura: data.latitudeSoltura || null,
        longitude_soltura: data.longitudeSoltura || null,
        outro_destinacao: data.outroDestinacao || null
      });

      if (error) {
        console.error("Erro ao salvar registro:", error);
        toast.error("Erro ao salvar registro: " + error.message);
        return false;
      }

      console.log("Registro salvo com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      toast.error("Erro ao salvar registro no banco de dados");
      return false;
    }
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('Form submitted:', data);
    
    setIsSubmitting(true);
    try {
      const sucesso = await salvarRegistroNoBanco(data);
      
      if (sucesso) {
        toast.success('Registro de resgate cadastrado com sucesso!');
        
        // Resetar formulário após envio bem-sucedido
        reset();
        setEspecieSelecionada(null);
      }
    } catch (error) {
      console.error("Erro ao processar submissão:", error);
      toast.error("Ocorreu um erro ao processar o cadastro");
    } finally {
      setIsSubmitting(false);
    }
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
    carregandoEspecie,
    isSubmitting
  };
};
