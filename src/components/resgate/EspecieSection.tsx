
import React, { useState, useEffect } from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import FormSection from './FormSection';
import FormField from './FormField';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EspecieSectionProps {
  formData: ResgateFormData;
  handleSelectChange: (name: string, value: string) => void;
  errors: any;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  isEvadido?: boolean;
}

interface EspecieFauna {
  id: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  ordem_taxonomica: string;
  tipo_de_fauna: string;
  estado_de_conservacao: string;
}

const EspecieSection: React.FC<EspecieSectionProps> = ({
  formData,
  handleSelectChange,
  errors,
  especieSelecionada,
  carregandoEspecie,
  isEvadido = false
}) => {
  const [especiesFauna, setEspeciesFauna] = useState<EspecieFauna[]>([]);
  const [classesTaxonomicas, setClassesTaxonomicas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('dim_especies_fauna')
          .select('*')
          .order('nome_popular', { ascending: true })
          .range(0, 9999);

        if (data) {
          setEspeciesFauna(data);
          // Extrair classes taxonômicas únicas da coluna classe_taxonomica
          const classes = [...new Set(data.map(e => e.classe_taxonomica).filter(Boolean))].sort((a, b) => 
            (a || '').localeCompare(b || '', 'pt-BR')
          ) as string[];
          setClassesTaxonomicas(classes);
          console.log('Classes encontradas:', classes.join(', '));
          console.log('Total espécies:', data.length);
        }
        if (error) {
          console.error('Erro ao carregar espécies:', error);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getEspeciesPorClasse = (classe: string) => {
    if (!classe) return [];
    // Filtrar espécies pela classe taxonômica selecionada (comparação case-insensitive)
    const normalize = (v?: string | null) => (v ?? '').trim().toUpperCase();
    const wanted = normalize(classe);
    const especiesFiltradas = especiesFauna.filter(e => normalize(e.classe_taxonomica) === wanted);
    
    console.log(`Filtrando espécies para classe "${classe}":`, {
      classeSelecionada: classe,
      totalEspecies: especiesFauna.length,
      especiesFiltradas: especiesFiltradas.length
    });
    
    // Ordenar por nome popular
    return especiesFiltradas.sort((a, b) => 
      (a.nome_popular || '').localeCompare(b.nome_popular || '', 'pt-BR')
    );
  };

  const getEspecieDetails = () => {
    if (especieSelecionada) {
      return especieSelecionada;
    }
    // Fallback: buscar nos dados locais
    if (formData.especieId) {
      return especiesFauna.find(e => e.id === formData.especieId) || null;
    }
    return null;
  };

  const selectedEspecie = getEspecieDetails();

  return (
    <FormSection title="Identificação da Espécie">
      {isEvadido && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Como o desfecho é "Evadido", os campos nesta seção são opcionais.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="classeTaxonomica"
          label="Classe Taxonômica"
          required={!isEvadido}
          error={errors.classeTaxonomica?.message}
        >
          <Select
            value={formData.classeTaxonomica}
            onValueChange={(value) => handleSelectChange('classeTaxonomica', value)}
            disabled={loading}
          >
            <SelectTrigger className={errors.classeTaxonomica?.message ? "border-red-500" : ""}>
              <SelectValue placeholder={loading ? "Carregando..." : "Selecione a classe"} />
            </SelectTrigger>
            <SelectContent>
              {classesTaxonomicas.map((classe) => (
                <SelectItem key={classe} value={classe}>
                  {classe}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="especieId"
          label="Espécie (Nome Popular)"
          required={!isEvadido}
          error={errors.especieId?.message}
        >
          <Select
            value={formData.especieId}
            onValueChange={(value) => handleSelectChange('especieId', value)}
            disabled={loading || !formData.classeTaxonomica}
          >
            <SelectTrigger className={errors.especieId?.message ? "border-red-500" : ""}>
              <SelectValue placeholder={!formData.classeTaxonomica ? "Selecione a classe primeiro" : "Selecione a espécie"} />
            </SelectTrigger>
            <SelectContent>
              {getEspeciesPorClasse(formData.classeTaxonomica).map((especie) => (
                <SelectItem key={especie.id} value={especie.id}>
                  {especie.nome_popular}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="nomeCientifico"
          label="Nome Científico"
        >
          <Input
            value={selectedEspecie?.nome_cientifico || ''}
            readOnly
            className="bg-muted"
          />
        </FormField>

        <FormField
          id="ordemTaxonomica"
          label="Ordem Taxonômica"
        >
          <Input
            value={selectedEspecie?.ordem_taxonomica || ''}
            readOnly
            className="bg-muted"
          />
        </FormField>

        <FormField
          id="estadoConservacao"
          label="Estado de Conservação"
        >
          <Input
            value={selectedEspecie?.estado_de_conservacao || ''}
            readOnly
            className="bg-muted"
          />
        </FormField>

        <FormField
          id="tipoFauna"
          label="Tipo de Fauna"
        >
          <Input
            value={selectedEspecie?.tipo_de_fauna || ''}
            readOnly
            className="bg-muted"
          />
        </FormField>
      </div>
    </FormSection>
  );
};

export default EspecieSection;
