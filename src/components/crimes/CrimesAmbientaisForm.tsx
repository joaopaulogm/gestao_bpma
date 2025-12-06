import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CrimesAmbientaisFormData, DESFECHOS, PROCEDIMENTOS_LEGAIS } from '@/schemas/crimesAmbientaisSchema';
import { regioes } from '@/constants/regioes';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import TipoAreaField from '@/components/resgate/TipoAreaField';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define types inline to avoid import issues
interface FaunaItem {
  id: string;
  especieId: string;
  nomePopular: string;
  nomeCientifico: string;
  classeTaxonomica: string;
  ordemTaxonomica: string;
  tipoFauna: string;
  estadoConservacao: string;
  estadoSaudeId: string;
  estagioVidaId: string;
  atropelamento: string;
  quantidadeAdulto: number;
  quantidadeFilhote: number;
  quantidadeTotal: number;
  destinacao: string;
  estagioVidaObitoId: string;
  quantidadeAdultoObito: number;
  quantidadeFilhoteObito: number;
  quantidadeTotalObito: number;
}

interface FloraItem {
  id: string;
  especieId: string;
  nomePopular: string;
  nomeCientifico: string;
  classe: string;
  ordem: string;
  familia: string;
  estadoConservacao: string;
  tipoPlanta: string;
  madeiraLei: string;
  imuneCote: string;
  condicao: string;
  quantidade: number;
  destinacao: string;
}

interface BemApreendido {
  id: string;
  itemId: string;
  categoria: string;
  item: string;
  usoIlicito: string;
  aplicacao: string;
  quantidade: number;
}

interface TipoCrime {
  id_tipo_de_crime: string;
  "Tipo de Crime": string | null;
}

interface Enquadramento {
  id_enquadramento: string;
  id_tipo_de_crime: string;
  "Tipo de Crime": string | null;
  "Enquadramento": string | null;
}

interface CrimesAmbientaisFormProps {
  form: UseFormReturn<CrimesAmbientaisFormData>;
  formData: CrimesAmbientaisFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  getFieldError: (fieldName: string) => string | undefined;
  floraItems: FloraItem[];
  onFloraItemsChange: (items: FloraItem[]) => void;
  onNumeroTermoEntregaFloraChange: (value: string) => void;
  faunaItems: FaunaItem[];
  onFaunaItemsChange: (items: FaunaItem[]) => void;
  bensApreendidos: BemApreendido[];
  onBensApreendidosChange: (bens: BemApreendido[]) => void;
}

const CrimesAmbientaisForm: React.FC<CrimesAmbientaisFormProps> = ({
  form,
  formData,
  handleChange,
  handleSelectChange,
  handleSubmit,
  isSubmitting,
  getFieldError,
  floraItems,
  onFloraItemsChange,
  onNumeroTermoEntregaFloraChange,
  faunaItems,
  onFaunaItemsChange,
  bensApreendidos,
  onBensApreendidosChange
}) => {
  const [tiposCrime, setTiposCrime] = useState<TipoCrime[]>([]);
  const [enquadramentos, setEnquadramentos] = useState<Enquadramento[]>([]);
  const [enquadramentosFiltrados, setEnquadramentosFiltrados] = useState<Enquadramento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tiposCrimeRes, enquadramentosRes] = await Promise.all([
          supabase.from('dim_tipo_de_crime').select('*').order('Tipo de Crime'),
          supabase.from('dim_enquadramento').select('*').order('Enquadramento')
        ]);

        if (tiposCrimeRes.data) setTiposCrime(tiposCrimeRes.data);
        if (enquadramentosRes.data) setEnquadramentos(enquadramentosRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (formData.tipoCrime && tiposCrime.length > 0 && enquadramentos.length > 0) {
      const tipoCrimeSelecionado = tiposCrime.find(t => t["Tipo de Crime"] === formData.tipoCrime);
      if (tipoCrimeSelecionado) {
        const filtrados = enquadramentos.filter(
          e => e.id_tipo_de_crime === tipoCrimeSelecionado.id_tipo_de_crime && e["Enquadramento"]
        );
        setEnquadramentosFiltrados(filtrados);
      } else {
        setEnquadramentosFiltrados([]);
      }
    } else {
      setEnquadramentosFiltrados([]);
    }
  }, [formData.tipoCrime, tiposCrime, enquadramentos]);

  const tipoCrimeLower = formData.tipoCrime?.toLowerCase() || '';
  const isCrimeContraFauna = tipoCrimeLower.includes('fauna');
  const isCrimeContraFlora = tipoCrimeLower.includes('flora');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        
        {/* Informações Gerais */}
        <FormSection title="Informações Gerais" columns>
          <FormField id="data" label="Data" required error={getFieldError('data')}>
            <Input
              id="data"
              name="data"
              type="date"
              value={formData.data || ''}
              onChange={handleChange}
              className="h-11 rounded-xl border-primary/15 bg-background/80"
            />
          </FormField>

          <FormField id="regiaoAdministrativa" label="Região Administrativa" required error={getFieldError('regiaoAdministrativa')}>
            <Select value={formData.regiaoAdministrativa || ''} onValueChange={(value) => handleSelectChange('regiaoAdministrativa', value)}>
              <SelectTrigger><SelectValue placeholder="Selecione a região administrativa" /></SelectTrigger>
              <SelectContent>
                {regioes.map((regiao) => (
                  <SelectItem key={regiao} value={regiao}>{regiao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <TipoAreaField value={formData.tipoAreaId || ''} onChange={(value) => handleSelectChange('tipoAreaId', value)} error={getFieldError('tipoAreaId')} />

          <FormField id="latitudeOcorrencia" label="Latitude da Ocorrência" error={getFieldError('latitudeOcorrencia')}>
            <Input id="latitudeOcorrencia" name="latitudeOcorrencia" placeholder="Ex: -15.7801" value={formData.latitudeOcorrencia || ''} onChange={handleChange} className="h-11 rounded-xl border-primary/15 bg-background/80" />
          </FormField>

          <FormField id="longitudeOcorrencia" label="Longitude da Ocorrência" error={getFieldError('longitudeOcorrencia')}>
            <Input id="longitudeOcorrencia" name="longitudeOcorrencia" placeholder="Ex: -47.9292" value={formData.longitudeOcorrencia || ''} onChange={handleChange} className="h-11 rounded-xl border-primary/15 bg-background/80" />
          </FormField>
        </FormSection>

        {/* Tipo de Crime e Enquadramento */}
        <FormSection title="Classificação do Crime" columns>
          <FormField id="tipoCrime" label="Tipo de Crime" required error={getFieldError('tipoCrime')}>
            <Select
              value={formData.tipoCrime || ''}
              onValueChange={(value) => {
                handleSelectChange('tipoCrime', value);
                if (formData.enquadramento) handleSelectChange('enquadramento', '');
              }}
              disabled={isLoading}
            >
              <SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o tipo de crime"} /></SelectTrigger>
              <SelectContent>
                {tiposCrime.map((tipo) => (
                  <SelectItem key={tipo.id_tipo_de_crime} value={tipo["Tipo de Crime"] || ''}>{tipo["Tipo de Crime"]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {formData.tipoCrime && (
            <FormField id="enquadramento" label="Enquadramento" required error={getFieldError('enquadramento')}>
              <Select value={formData.enquadramento || ''} onValueChange={(value) => handleSelectChange('enquadramento', value)} disabled={enquadramentosFiltrados.length === 0}>
                <SelectTrigger><SelectValue placeholder={enquadramentosFiltrados.length === 0 ? "Nenhum enquadramento disponível" : "Selecione o enquadramento"} /></SelectTrigger>
                <SelectContent>
                  {enquadramentosFiltrados.map((enq) => (
                    <SelectItem key={enq.id_enquadramento} value={enq["Enquadramento"] || ''}>{enq["Enquadramento"]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        </FormSection>

        {/* Ocorreu Apreensão? */}
        {formData.enquadramento && (
          <FormSection>
            <div className="flex items-center gap-4 p-5 bg-background/80 rounded-xl border border-primary/15 shadow-sm">
              <Switch id="ocorreuApreensao" checked={formData.ocorreuApreensao || false} onCheckedChange={(checked) => handleSelectChange('ocorreuApreensao', String(checked))} />
              <div className="flex flex-col">
                <Label htmlFor="ocorreuApreensao" className="text-base font-semibold text-foreground cursor-pointer">Ocorreu Apreensão?</Label>
                <span className="text-sm text-muted-foreground">Marque se houve apreensão de animais, flora ou itens</span>
              </div>
            </div>
          </FormSection>
        )}

        {/* Placeholder for fauna/flora sections */}
        {isCrimeContraFauna && formData.enquadramento && (
          <FormSection title="Identificação das Espécies de Fauna">
            <p className="text-muted-foreground">Seção de fauna será exibida aqui. ({faunaItems.length} itens)</p>
          </FormSection>
        )}

        {isCrimeContraFlora && formData.enquadramento && (
          <FormSection title="Identificação das Espécies de Flora">
            <p className="text-muted-foreground">Seção de flora será exibida aqui. ({floraItems.length} itens)</p>
          </FormSection>
        )}

        {/* Desfecho */}
        <FormSection title="Desfecho" columns>
          <FormField id="desfecho" label="Desfecho" required error={getFieldError('desfecho')}>
            <Select
              value={formData.desfecho || ''}
              onValueChange={(value) => {
                handleSelectChange('desfecho', value);
                if (value !== 'Flagrante' && formData.procedimentoLegal) handleSelectChange('procedimentoLegal', '');
              }}
            >
              <SelectTrigger><SelectValue placeholder="Selecione o desfecho" /></SelectTrigger>
              <SelectContent>
                {DESFECHOS.map((desfecho) => (
                  <SelectItem key={desfecho} value={desfecho}>{desfecho}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {formData.desfecho === 'Flagrante' && (
            <FormField id="procedimentoLegal" label="Procedimento Legal" required error={getFieldError('procedimentoLegal')}>
              <Select value={formData.procedimentoLegal || ''} onValueChange={(value) => handleSelectChange('procedimentoLegal', value)}>
                <SelectTrigger><SelectValue placeholder="Selecione o procedimento legal" /></SelectTrigger>
                <SelectContent>
                  {PROCEDIMENTOS_LEGAIS.map((procedimento) => (
                    <SelectItem key={procedimento} value={procedimento}>{procedimento}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        </FormSection>

        {/* Quantidade de Envolvidos */}
        <FormSection title="Quantidade de Envolvidos" columns>
          <FormField id="quantidadeDetidosMaiorIdade" label="Qtd Detidos Maior de Idade" error={getFieldError('quantidadeDetidosMaiorIdade')}>
            <Input id="quantidadeDetidosMaiorIdade" name="quantidadeDetidosMaiorIdade" type="number" min={0} max={1000} value={formData.quantidadeDetidosMaiorIdade || 0} onChange={handleChange} className="h-11 rounded-xl border-primary/15 bg-background/80" />
          </FormField>

          <FormField id="quantidadeDetidosMenorIdade" label="Qtd Detidos Menor de Idade" error={getFieldError('quantidadeDetidosMenorIdade')}>
            <Input id="quantidadeDetidosMenorIdade" name="quantidadeDetidosMenorIdade" type="number" min={0} max={1000} value={formData.quantidadeDetidosMenorIdade || 0} onChange={handleChange} className="h-11 rounded-xl border-primary/15 bg-background/80" />
          </FormField>

          <FormField id="quantidadeLiberadosMaiorIdade" label="Qtd Liberados Maior de Idade" error={getFieldError('quantidadeLiberadosMaiorIdade')}>
            <Input id="quantidadeLiberadosMaiorIdade" name="quantidadeLiberadosMaiorIdade" type="number" min={0} max={1000} value={formData.quantidadeLiberadosMaiorIdade || 0} onChange={handleChange} className="h-11 rounded-xl border-primary/15 bg-background/80" />
          </FormField>

          <FormField id="quantidadeLiberadosMenorIdade" label="Qtd Liberados Menor de Idade" error={getFieldError('quantidadeLiberadosMenorIdade')}>
            <Input id="quantidadeLiberadosMenorIdade" name="quantidadeLiberadosMenorIdade" type="number" min={0} max={1000} value={formData.quantidadeLiberadosMenorIdade || 0} onChange={handleChange} className="h-11 rounded-xl border-primary/15 bg-background/80" />
          </FormField>
        </FormSection>

        {/* Botão de Envio */}
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Salvar Ocorrência
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CrimesAmbientaisForm;