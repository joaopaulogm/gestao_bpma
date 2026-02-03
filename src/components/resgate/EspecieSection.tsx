import React, { useState, useEffect } from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie, getFaunaImageUrl } from '@/services/especieService';
import FormSection from './FormSection';
import FormField from './FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EspecieSectionProps {
  formData: ResgateFormData;
  handleSelectChange: (name: string, value: string) => void;
  errors: Record<string, { message?: string } | undefined>;
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
  familia_taxonomica: string | null;
  tipo_de_fauna: string;
  estado_de_conservacao: string;
  imagens_paths?: string[] | null;
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
        const PAGE_SIZE = 1000;
        let allData: EspecieFauna[] = [];
        let from = 0;
        let hasMore = true;

        while (hasMore) {
          const { data: pageData, error: pageError } = await supabase
            .from('dim_especies_fauna')
            .select('*')
            .order('nome_popular', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

          if (pageError) {
            console.error('Erro ao carregar página:', pageError);
            break;
          }

          if (pageData && pageData.length > 0) {
            allData = [...allData, ...(pageData as EspecieFauna[])];
            from += PAGE_SIZE;
            hasMore = pageData.length === PAGE_SIZE;
          } else {
            hasMore = false;
          }
        }

        if (allData.length > 0) {
          setEspeciesFauna(allData);
          const classes = [...new Set(allData.map(e => e.classe_taxonomica).filter(Boolean))].sort((a, b) => 
            (a || '').localeCompare(b || '', 'pt-BR')
          ) as string[];
          setClassesTaxonomicas(classes);
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
    const normalize = (v?: string | null) => (v ?? '').trim().toUpperCase();
    const wanted = normalize(classe);
    return especiesFauna
      .filter(e => normalize(e.classe_taxonomica) === wanted)
      .sort((a, b) => (a.nome_popular || '').localeCompare(b.nome_popular || '', 'pt-BR'));
  };

  const getEspecieDetails = (): EspecieFauna | null => {
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
            <SelectContent className="max-h-80">
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
          label="Nome Popular"
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
            <SelectContent className="max-h-80">
              {getEspeciesPorClasse(formData.classeTaxonomica).map((especie) => (
                <SelectItem key={especie.id} value={especie.id}>
                  {especie.nome_popular}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Card de Detalhes da Espécie - aparece após seleção */}
      {selectedEspecie && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
          {/* Header com nome da espécie */}
          <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
            <h4 className="font-semibold text-primary flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {selectedEspecie.nome_popular}
              <span className="font-normal text-muted-foreground italic text-sm">
                ({selectedEspecie.nome_cientifico})
              </span>
            </h4>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Informações Taxonômicas em layout elegante */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ordem</p>
                <p className="text-sm font-medium text-foreground">{selectedEspecie.ordem_taxonomica || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Família</p>
                <p className="text-sm font-medium text-foreground">{selectedEspecie.familia_taxonomica || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tipo</p>
                <p className="text-sm font-medium text-foreground">{selectedEspecie.tipo_de_fauna || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Conservação</p>
                <p className="text-sm font-medium text-foreground">{selectedEspecie.estado_de_conservacao || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Classe</p>
                <p className="text-sm font-medium text-foreground">{selectedEspecie.classe_taxonomica || '—'}</p>
              </div>
            </div>

            {/* Galeria de Fotos */}
            {Array.isArray(selectedEspecie.imagens_paths) && selectedEspecie.imagens_paths.length > 0 && (
              <div className="pt-3 border-t border-primary/10">
                <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Fotos da Espécie</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {selectedEspecie.imagens_paths.slice(0, 6).map((filename, imgIndex) => (
                    <div 
                      key={imgIndex} 
                      className="aspect-square rounded-lg overflow-hidden border border-border bg-muted shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={getFaunaImageUrl(filename)}
                        alt={`${selectedEspecie.nome_popular} ${imgIndex + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </FormSection>
  );
};

export default EspecieSection;
