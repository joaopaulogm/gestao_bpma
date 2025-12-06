import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { regioes } from '@/constants/regioes';

const DESFECHOS = [
  "Em Apuração pela PCDF",
  "Em Monitoramento pela PMDF",
  "Averiguado e Nada Constatado",
  "Resolvido no Local",
  "Flagrante"
];

const PROCEDIMENTOS_LEGAIS = [
  "TCO-PMDF",
  "TCO-PCDF",
  "Em Apuração PCDF"
];

interface TipoCrime {
  id_tipo_de_crime: string;
  "Tipo de Crime": string | null;
}

interface Enquadramento {
  id_enquadramento: string;
  id_tipo_de_crime: string;
  "Enquadramento": string | null;
}

interface TipoArea {
  id: string;
  "Tipo de Área": string | null;
}

const CrimesAmbientais: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Options from database
  const [tiposCrime, setTiposCrime] = useState<TipoCrime[]>([]);
  const [enquadramentos, setEnquadramentos] = useState<Enquadramento[]>([]);
  const [enquadramentosFiltrados, setEnquadramentosFiltrados] = useState<Enquadramento[]>([]);
  const [tiposArea, setTiposArea] = useState<TipoArea[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    data: '',
    regiaoAdministrativa: '',
    tipoAreaId: '',
    latitudeOcorrencia: '',
    longitudeOcorrencia: '',
    tipoCrime: '',
    enquadramento: '',
    ocorreuApreensao: false,
    desfecho: '',
    procedimentoLegal: '',
    quantidadeDetidosMaiorIdade: 0,
    quantidadeDetidosMenorIdade: 0,
    quantidadeLiberadosMaiorIdade: 0,
    quantidadeLiberadosMenorIdade: 0
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tiposCrimeRes, enquadramentosRes, tiposAreaRes] = await Promise.all([
          supabase.from('dim_tipo_de_crime').select('*').order('Tipo de Crime'),
          supabase.from('dim_enquadramento').select('*').order('Enquadramento'),
          supabase.from('dim_tipo_de_area').select('*').order('Tipo de Área')
        ]);

        if (tiposCrimeRes.data) setTiposCrime(tiposCrimeRes.data);
        if (enquadramentosRes.data) setEnquadramentos(enquadramentosRes.data);
        if (tiposAreaRes.data) setTiposArea(tiposAreaRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do formulário');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter enquadramentos based on selected crime type
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

  const handleChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data || !formData.regiaoAdministrativa || !formData.tipoCrime || !formData.enquadramento || !formData.desfecho) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.desfecho === 'Flagrante' && !formData.procedimentoLegal) {
      toast.error('Procedimento Legal é obrigatório quando o desfecho é Flagrante');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get region ID
      const { data: regiaoData } = await supabase
        .from('dim_regiao_administrativa')
        .select('id')
        .eq('nome', formData.regiaoAdministrativa)
        .maybeSingle();

      // Get crime type ID
      const tipoCrimeSelecionado = tiposCrime.find(t => t["Tipo de Crime"] === formData.tipoCrime);
      
      // Get enquadramento ID
      const enquadramentoSelecionado = enquadramentosFiltrados.find(e => e["Enquadramento"] === formData.enquadramento);

      const record = {
        data: formData.data,
        regiao_administrativa_id: regiaoData?.id || null,
        tipo_area_id: formData.tipoAreaId || null,
        latitude_ocorrencia: formData.latitudeOcorrencia || null,
        longitude_ocorrencia: formData.longitudeOcorrencia || null,
        tipo_crime_id: tipoCrimeSelecionado?.id_tipo_de_crime || null,
        enquadramento_id: enquadramentoSelecionado?.id_enquadramento || null,
        ocorreu_apreensao: formData.ocorreuApreensao,
        desfecho: formData.desfecho,
        procedimento_legal: formData.procedimentoLegal || null,
        quantidade_detidos_maior_idade: formData.quantidadeDetidosMaiorIdade,
        quantidade_detidos_menor_idade: formData.quantidadeDetidosMenorIdade,
        quantidade_liberados_maior_idade: formData.quantidadeLiberadosMaiorIdade,
        quantidade_liberados_menor_idade: formData.quantidadeLiberadosMenorIdade,
        tipo_registro: 'outro'
      };

      const { error } = await supabase
        .from('fat_registros_de_crime')
        .insert(record);

      if (error) throw error;

      toast.success('Ocorrência registrada com sucesso!');
      
      // Reset form
      setFormData({
        data: '',
        regiaoAdministrativa: '',
        tipoAreaId: '',
        latitudeOcorrencia: '',
        longitudeOcorrencia: '',
        tipoCrime: '',
        enquadramento: '',
        ocorreuApreensao: false,
        desfecho: '',
        procedimentoLegal: '',
        quantidadeDetidosMaiorIdade: 0,
        quantidadeDetidosMenorIdade: 0,
        quantidadeLiberadosMaiorIdade: 0,
        quantidadeLiberadosMenorIdade: 0
      });
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao registrar ocorrência');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tipoCrimeLower = formData.tipoCrime?.toLowerCase() || '';
  const isCrimeContraFauna = tipoCrimeLower.includes('fauna');
  const isCrimeContraFlora = tipoCrimeLower.includes('flora');

  return (
    <Layout title="Ocorrências Crimes Ambientais" showBackButton>
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Informações Gerais */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
              Informações Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data <span className="text-destructive">*</span></Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleChange('data', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regiaoAdministrativa">Região Administrativa <span className="text-destructive">*</span></Label>
                <Select value={formData.regiaoAdministrativa} onValueChange={(v) => handleChange('regiaoAdministrativa', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione a região" /></SelectTrigger>
                  <SelectContent>
                    {regioes.map((regiao) => (
                      <SelectItem key={regiao} value={regiao}>{regiao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoAreaId">Tipo de Área</Label>
                <Select value={formData.tipoAreaId} onValueChange={(v) => handleChange('tipoAreaId', v)} disabled={isLoading}>
                  <SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o tipo de área"} /></SelectTrigger>
                  <SelectContent>
                    {tiposArea.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>{tipo["Tipo de Área"]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitudeOcorrencia">Latitude</Label>
                <Input
                  id="latitudeOcorrencia"
                  placeholder="Ex: -15.7801"
                  value={formData.latitudeOcorrencia}
                  onChange={(e) => handleChange('latitudeOcorrencia', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitudeOcorrencia">Longitude</Label>
                <Input
                  id="longitudeOcorrencia"
                  placeholder="Ex: -47.9292"
                  value={formData.longitudeOcorrencia}
                  onChange={(e) => handleChange('longitudeOcorrencia', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classificação do Crime */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
              Classificação do Crime
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoCrime">Tipo de Crime <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.tipoCrime} 
                  onValueChange={(v) => {
                    handleChange('tipoCrime', v);
                    handleChange('enquadramento', '');
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o tipo de crime"} /></SelectTrigger>
                  <SelectContent>
                    {tiposCrime.map((tipo) => (
                      <SelectItem key={tipo.id_tipo_de_crime} value={tipo["Tipo de Crime"] || ''}>
                        {tipo["Tipo de Crime"]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.tipoCrime && (
                <div className="space-y-2">
                  <Label htmlFor="enquadramento">Enquadramento <span className="text-destructive">*</span></Label>
                  <Select 
                    value={formData.enquadramento} 
                    onValueChange={(v) => handleChange('enquadramento', v)}
                    disabled={enquadramentosFiltrados.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={enquadramentosFiltrados.length === 0 ? "Nenhum enquadramento disponível" : "Selecione o enquadramento"} />
                    </SelectTrigger>
                    <SelectContent>
                      {enquadramentosFiltrados.map((enq) => (
                        <SelectItem key={enq.id_enquadramento} value={enq["Enquadramento"] || ''}>
                          {enq["Enquadramento"]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Ocorreu Apreensão */}
          {formData.enquadramento && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Switch
                  id="ocorreuApreensao"
                  checked={formData.ocorreuApreensao}
                  onCheckedChange={(checked) => handleChange('ocorreuApreensao', checked)}
                />
                <div>
                  <Label htmlFor="ocorreuApreensao" className="text-base font-semibold cursor-pointer">
                    Ocorreu Apreensão?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Marque se houve apreensão de animais, flora ou itens
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Seções de Fauna/Flora (placeholder) */}
          {isCrimeContraFauna && formData.enquadramento && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Identificação das Espécies de Fauna
              </h3>
              <p className="text-muted-foreground">Seção de fauna em desenvolvimento.</p>
            </div>
          )}

          {isCrimeContraFlora && formData.enquadramento && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Identificação das Espécies de Flora
              </h3>
              <p className="text-muted-foreground">Seção de flora em desenvolvimento.</p>
            </div>
          )}

          {/* Desfecho */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
              Desfecho
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desfecho">Desfecho <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.desfecho} 
                  onValueChange={(v) => {
                    handleChange('desfecho', v);
                    if (v !== 'Flagrante') handleChange('procedimentoLegal', '');
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o desfecho" /></SelectTrigger>
                  <SelectContent>
                    {DESFECHOS.map((desfecho) => (
                      <SelectItem key={desfecho} value={desfecho}>{desfecho}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.desfecho === 'Flagrante' && (
                <div className="space-y-2">
                  <Label htmlFor="procedimentoLegal">Procedimento Legal <span className="text-destructive">*</span></Label>
                  <Select value={formData.procedimentoLegal} onValueChange={(v) => handleChange('procedimentoLegal', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o procedimento" /></SelectTrigger>
                    <SelectContent>
                      {PROCEDIMENTOS_LEGAIS.map((proc) => (
                        <SelectItem key={proc} value={proc}>{proc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Quantidade de Envolvidos */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
              Quantidade de Envolvidos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidadeDetidosMaiorIdade">Detidos Maior de Idade</Label>
                <Input
                  id="quantidadeDetidosMaiorIdade"
                  type="number"
                  min={0}
                  max={1000}
                  value={formData.quantidadeDetidosMaiorIdade}
                  onChange={(e) => handleChange('quantidadeDetidosMaiorIdade', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeDetidosMenorIdade">Detidos Menor de Idade</Label>
                <Input
                  id="quantidadeDetidosMenorIdade"
                  type="number"
                  min={0}
                  max={1000}
                  value={formData.quantidadeDetidosMenorIdade}
                  onChange={(e) => handleChange('quantidadeDetidosMenorIdade', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeLiberadosMaiorIdade">Liberados Maior de Idade</Label>
                <Input
                  id="quantidadeLiberadosMaiorIdade"
                  type="number"
                  min={0}
                  max={1000}
                  value={formData.quantidadeLiberadosMaiorIdade}
                  onChange={(e) => handleChange('quantidadeLiberadosMaiorIdade', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeLiberadosMenorIdade">Liberados Menor de Idade</Label>
                <Input
                  id="quantidadeLiberadosMenorIdade"
                  type="number"
                  min={0}
                  max={1000}
                  value={formData.quantidadeLiberadosMenorIdade}
                  onChange={(e) => handleChange('quantidadeLiberadosMenorIdade', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="flex justify-end">
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
    </Layout>
  );
};

export default CrimesAmbientais;
