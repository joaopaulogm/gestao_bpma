import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resgateSchema, type ResgateFormData } from '@/schemas/resgateSchema';

// Initialize Supabase client
const supabaseUrl = 'https://oiwwptnqaunsyhpkwbrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de regiões administrativas
export const regioes = [
  'Água Quente (RA XXXV)',
  'Arapoanga (RA XXXIV)',
  'Águas Claras (RA XX)',
  'Arniqueira (RA XXXIII)',
  'Brazlândia (RA IV)',
  'Candangolândia (RA XIX)',
  'Ceilândia (RA IX)',
  'Cruzeiro (RA XI)',
  'Fercal (RA XXXI)',
  'Gama (RA II)',
  'Guará (RA X)',
  'Itapoã (RA XXVIII)',
  'Jardim Botânico (RA XXVII)',
  'Lago Norte (RA XVIII)',
  'Lago Sul (RA XVI)',
  'Núcleo Bandeirante (RA VIII)',
  'Paranoá (RA VII)',
  'Park Way (RA XXIV)',
  'Planaltina (RA VI)',
  'Plano Piloto (RA I)',
  'Recanto das Emas (XV)',
  'Riacho Fundo (RA XVII)',
  'Riacho Fundo II (RA XXI)',
  'Samambaia (RA XII)',
  'Santa Maria (RA XIII)',
  'São Sebastião (RA XIV)',
  'SCIA/Estrutural (RA XXV)',
  'SIA (RA XXIX)',
  'Sobradinho (RA V)',
  'Sobradinho II (RA XXVI)',
  'Sol Nascente e Pôr do Sol ( RA XXXII)',
  'Sudoeste/Octogonal (RA XXII)',
  'Taguatinga (RA III)',
  'Varjão (RA XXIII)',
  'Vicente Pires (RA XXX)'
];

interface Especie {
  nome_popular: string;
}

export const useFormResgateData = () => {
  const [especiesLista, setEspeciesLista] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<ResgateFormData>({
    resolver: zodResolver(resgateSchema),
    defaultValues: {
      data: '',
      regiaoAdministrativa: '',
      origem: '',
      latitudeOrigem: '',
      longitudeOrigem: '',
      desfechoApreensao: '',
      numeroTCO: '',
      outroDesfecho: '',
      estadoSaude: '',
      atropelamento: '',
      estagioVida: '',
      quantidade: 1,
      destinacao: '',
      numeroTermoEntrega: '',
      horaGuardaCEAPA: '',
      motivoEntregaCEAPA: '',
      latitudeSoltura: '',
      longitudeSoltura: '',
      outroDestinacao: '',
      classeTaxonomica: '',
      nomePopular: ''
    }
  });

  const { watch, setValue, formState } = form;
  const formData = watch();
  const { errors } = formState;

  // Carregar lista de espécies com base na classe taxonômica selecionada
  useEffect(() => {
    const buscarEspecies = async () => {
      if (!formData.classeTaxonomica) return;
      
      setLoading(true);
      setError('');
      setEspeciesLista([]);
      console.log(`Buscando espécies para: ${formData.classeTaxonomica}`);
      
      let tabela = '';
      switch (formData.classeTaxonomica) {
        case 'Ave':
          tabela = 'lista_ave';
          break;
        case 'Mamífero':
          tabela = 'lista_mamifero';
          break;
        case 'Réptil':
          tabela = 'lista_reptil';
          break;
        case 'Peixe':
          tabela = 'lista_peixe';
          break;
        default:
          setLoading(false);
          return;
      }
      
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('nome_popular')
          .order('nome_popular');
          
        if (error) {
          console.error('Erro ao buscar espécies:', error);
          setError(`Erro ao carregar lista de espécies: ${error.message}`);
          toast.error(`Erro ao carregar lista de espécies: ${error.message}`);
        } else {
          console.log('Espécies carregadas:', data?.length || 0);
          console.log('Exemplo de espécie:', data?.[0]);
          
          // Garantir que os dados têm a estrutura correta
          if (data && Array.isArray(data)) {
            // Verificar se cada item tem a propriedade nome_popular
            const listaFiltrada = data.filter(item => item && typeof item === 'object' && 'nome_popular' in item && item.nome_popular);
            setEspeciesLista(listaFiltrada);
          } else {
            console.log('Dados não estão no formato esperado:', data);
            setEspeciesLista([]);
          }
        }
      } catch (err) {
        console.error('Exceção ao buscar espécies:', err);
        setError('Ocorreu um erro ao carregar a lista de espécies');
        toast.error('Ocorreu um erro ao carregar a lista de espécies');
      } finally {
        setLoading(false);
      }
    };
    
    buscarEspecies();
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
