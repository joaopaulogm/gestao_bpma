
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import FormSection from '@/components/resgate/FormSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Trash2, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import BensApreendidosSection, { BemApreendido as BemApreendidoType } from '@/components/crimes/BensApreendidosSection';

// Interface for team member
interface MembroEquipeCrime {
  id: string;
  efetivo_id: string;
  matricula: string;
  posto_graduacao: string;
  nome_guerra: string;
}

// Types
interface DimensionItem {
  id: string;
  nome: string;
}

interface TipoPenal {
  id: string;
  nome: string;
  codigo: string | null;
  descricao: string | null;
}

interface DesfechoCrimeComum {
  id: string;
  nome: string;
}

interface ItemApreendido {
  id: string;
  Categoria: string;
  Item: string;
  'Uso Ilicito': string;
  Aplicacao: string;
}

const CrimesComuns = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dimension data
  const [regioes, setRegioes] = useState<DimensionItem[]>([]);
  const [tiposArea, setTiposArea] = useState<{id: string; nome: string}[]>([]);
  const [tiposPenais, setTiposPenais] = useState<TipoPenal[]>([]);
  const [desfechos, setDesfechos] = useState<DesfechoCrimeComum[]>([]);
  const [itensApreendidos, setItensApreendidos] = useState<ItemApreendido[]>([]);
  
  // Form state - Informações Gerais
  const [data, setData] = useState('');
  const [horarioAcionamento, setHorarioAcionamento] = useState('');
  const [horarioTermino, setHorarioTermino] = useState('');
  const [regiaoId, setRegiaoId] = useState('');
  const [tipoAreaId, setTipoAreaId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Classificação do Crime
  const [tipoPenalId, setTipoPenalId] = useState('');
  const [naturezaCrime, setNaturezaCrime] = useState('');
  const [enquadramentoLegal, setEnquadramentoLegal] = useState('');
  const [ocorreuApreensao, setOcorreuApreensao] = useState(false);
  
  // Detalhes da Ocorrência
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState('');
  const [localEspecifico, setLocalEspecifico] = useState('');
  const [vitimasEnvolvidas, setVitimasEnvolvidas] = useState(0);
  const [suspeitosEnvolvidos, setSuspeitosEnvolvidos] = useState(0);
  
  // Armas e Materiais
  const [armaUtilizada, setArmaUtilizada] = useState(false);
  const [tipoArma, setTipoArma] = useState('');
  const [materialApreendido, setMaterialApreendido] = useState(false);
  const [descricaoMaterial, setDescricaoMaterial] = useState('');
  
  // Veículos
  const [veiculoEnvolvido, setVeiculoEnvolvido] = useState(false);
  const [tipoVeiculo, setTipoVeiculo] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  
  // Bens apreendidos
  const [bensApreendidos, setBensApreendidos] = useState<BemApreendidoType[]>([]);
  
  // Equipe
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipeCrime[]>([]);
  const [matriculaInput, setMatriculaInput] = useState('');
  const [isSearchingMembro, setIsSearchingMembro] = useState(false);
  
  // Conclusão
  const [desfechoId, setDesfechoId] = useState('');
  const [procedimentoLegal, setProcedimentoLegal] = useState('');
  const [qtdDetidosMaior, setQtdDetidosMaior] = useState(0);
  const [qtdDetidosMenor, setQtdDetidosMenor] = useState(0);
  const [qtdLiberadosMaior, setQtdLiberadosMaior] = useState(0);
  const [qtdLiberadosMenor, setQtdLiberadosMenor] = useState(0);
  const [observacoes, setObservacoes] = useState('');

  // Load dimensions on mount
  useEffect(() => {
    loadDimensions();
  }, []);

  const loadDimensions = async () => {
    try {
      const [
        regioesRes,
        tiposAreaRes,
        tiposPenaisRes,
        desfechosRes,
        itensRes
      ] = await Promise.all([
        supabase.from('dim_regiao_administrativa').select('id, nome').order('nome'),
        supabase.from('dim_tipo_de_area').select('id, "Tipo de Área"'),
        supabase.from('dim_tipo_penal').select('*').order('nome'),
        supabase.from('dim_desfecho_crime_comum').select('*').order('nome'),
        supabase.from('dim_itens_apreensao').select('*')
      ]);

      if (regioesRes.data) setRegioes(regioesRes.data);
      if (tiposAreaRes.data) {
        setTiposArea(tiposAreaRes.data.map(t => ({ id: t.id, nome: t['Tipo de Área'] || '' })));
      }
      if (tiposPenaisRes.data) setTiposPenais(tiposPenaisRes.data as TipoPenal[]);
      if (desfechosRes.data) setDesfechos(desfechosRes.data);
      if (itensRes.data) setItensApreendidos(itensRes.data as unknown as ItemApreendido[]);
    } catch (error) {
      console.error('Erro ao carregar dimensões:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  // Equipe functions
  const buscarPolicial = useCallback(async () => {
    if (!matriculaInput.trim()) {
      toast.error('Digite uma matrícula');
      return;
    }
    const matriculaSemZeros = matriculaInput.replace(/^0+/, '');
    if (membrosEquipe.some(m => m.matricula === matriculaSemZeros || m.matricula === matriculaInput)) {
      toast.error('Este policial já foi adicionado');
      return;
    }
    setIsSearchingMembro(true);
    try {
      const { data: policialData, error } = await supabase
        .from('dim_efetivo')
        .select('id, matricula, posto_graduacao, nome_guerra')
        .or(`matricula.eq.${matriculaInput},matricula.eq.${matriculaSemZeros}`)
        .limit(1)
        .single();
      if (error || !policialData) {
        toast.error('Policial não encontrado');
        return;
      }
      const novoMembro: MembroEquipeCrime = {
        id: crypto.randomUUID(),
        efetivo_id: policialData.id,
        matricula: policialData.matricula,
        posto_graduacao: policialData.posto_graduacao,
        nome_guerra: policialData.nome_guerra
      };
      setMembrosEquipe([...membrosEquipe, novoMembro]);
      setMatriculaInput('');
      toast.success(`${policialData.posto_graduacao} ${policialData.nome_guerra} adicionado`);
    } catch (err) {
      toast.error('Erro ao buscar policial');
    } finally {
      setIsSearchingMembro(false);
    }
  }, [matriculaInput, membrosEquipe]);

  const removerMembro = (id: string) => {
    setMembrosEquipe(membrosEquipe.filter(m => m.id !== id));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data || !regiaoId || !latitude || !longitude || !tipoPenalId || !desfechoId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert main record
      const { data: crimeRecord, error: crimeError } = await supabase
        .from('fat_crimes_comuns')
        .insert({
          data,
          horario_acionamento: horarioAcionamento || null,
          horario_termino: horarioTermino || null,
          regiao_administrativa_id: regiaoId,
          tipo_area_id: tipoAreaId || null,
          latitude,
          longitude,
          tipo_penal_id: tipoPenalId,
          natureza_crime: naturezaCrime || null,
          enquadramento_legal: enquadramentoLegal || null,
          ocorreu_apreensao: ocorreuApreensao,
          descricao_ocorrencia: descricaoOcorrencia || null,
          local_especifico: localEspecifico || null,
          vitimas_envolvidas: vitimasEnvolvidas,
          suspeitos_envolvidos: suspeitosEnvolvidos,
          arma_utilizada: armaUtilizada,
          tipo_arma: armaUtilizada ? tipoArma : null,
          material_apreendido: materialApreendido,
          descricao_material: materialApreendido ? descricaoMaterial : null,
          veiculo_envolvido: veiculoEnvolvido,
          tipo_veiculo: veiculoEnvolvido ? tipoVeiculo : null,
          placa_veiculo: veiculoEnvolvido ? placaVeiculo : null,
          desfecho_id: desfechoId,
          procedimento_legal: procedimentoLegal || null,
          qtd_detidos_maior: qtdDetidosMaior,
          qtd_detidos_menor: qtdDetidosMenor,
          qtd_liberados_maior: qtdLiberadosMaior,
          qtd_liberados_menor: qtdLiberadosMenor,
          observacoes: observacoes || null
        })
        .select('id')
        .single();

      if (crimeError) throw crimeError;

      const ocorrenciaId = crimeRecord.id;

      // Insert bens apreendidos
      if (ocorreuApreensao && bensApreendidos.length > 0) {
        const bensRecords = bensApreendidos.filter(b => b.itemId).map(b => ({
          id_ocorrencia: ocorrenciaId,
          id_item_apreendido: b.itemId,
          quantidade: b.quantidade
        }));

        if (bensRecords.length > 0) {
          const { error: bensError } = await supabase
            .from('fat_ocorrencia_apreensao_crime_comum')
            .insert(bensRecords);
          if (bensError) throw bensError;
        }
      }

      // Save team members
      if (membrosEquipe.length > 0) {
        const equipeRecords = membrosEquipe.map(m => ({
          registro_id: ocorrenciaId,
          efetivo_id: m.efetivo_id
        }));
        const { error: equipeError } = await supabase
          .from('fat_equipe_crime_comum')
          .insert(equipeRecords);
        if (equipeError) {
          console.error('Erro ao salvar equipe:', equipeError);
        }
      }

      toast.success('Ocorrência registrada com sucesso!');
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao registrar ocorrência');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setData('');
    setHorarioAcionamento('');
    setHorarioTermino('');
    setRegiaoId('');
    setTipoAreaId('');
    setLatitude('');
    setLongitude('');
    setTipoPenalId('');
    setNaturezaCrime('');
    setEnquadramentoLegal('');
    setOcorreuApreensao(false);
    setDescricaoOcorrencia('');
    setLocalEspecifico('');
    setVitimasEnvolvidas(0);
    setSuspeitosEnvolvidos(0);
    setArmaUtilizada(false);
    setTipoArma('');
    setMaterialApreendido(false);
    setDescricaoMaterial('');
    setVeiculoEnvolvido(false);
    setTipoVeiculo('');
    setPlacaVeiculo('');
    setBensApreendidos([]);
    setMembrosEquipe([]);
    setMatriculaInput('');
    setDesfechoId('');
    setProcedimentoLegal('');
    setQtdDetidosMaior(0);
    setQtdDetidosMenor(0);
    setQtdLiberadosMaior(0);
    setQtdLiberadosMenor(0);
    setObservacoes('');
  };

  // Group itens by category
  const itensPorCategoria = itensApreendidos.reduce((acc, item) => {
    const cat = item.Categoria || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ItemApreendido[]>);

  return (
    <Layout title="Crimes Comuns" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        
        {/* Card: Informações Gerais */}
        <FormSection title="Informações Gerais" columns>
          <div className="space-y-2">
            <Label htmlFor="data" className="text-sm font-medium">
              Data <span className="text-destructive">*</span>
            </Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="input-glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horarioAcionamento" className="text-sm font-medium">
              Horário de Acionamento
            </Label>
            <Input
              id="horarioAcionamento"
              type="time"
              value={horarioAcionamento}
              onChange={(e) => setHorarioAcionamento(e.target.value)}
              className="input-glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horarioTermino" className="text-sm font-medium">
              Horário de Término
            </Label>
            <Input
              id="horarioTermino"
              type="time"
              value={horarioTermino}
              onChange={(e) => setHorarioTermino(e.target.value)}
              className="input-glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regiao" className="text-sm font-medium">
              Região Administrativa <span className="text-destructive">*</span>
            </Label>
            <Select value={regiaoId} onValueChange={setRegiaoId}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="Selecione a região" />
              </SelectTrigger>
              <SelectContent>
                {regioes.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoArea" className="text-sm font-medium">
              Tipo de Área
            </Label>
            <Select value={tipoAreaId} onValueChange={setTipoAreaId}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposArea.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-full grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm font-medium">
                Latitude da Ocorrência <span className="text-destructive">*</span>
              </Label>
              <Input
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Ex: -15.7801"
                required
                className="input-glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm font-medium">
                Longitude da Ocorrência <span className="text-destructive">*</span>
              </Label>
              <Input
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Ex: -47.9292"
                required
                className="input-glass"
              />
            </div>
          </div>
        </FormSection>

        {/* Card: Identificação da Equipe */}
        <FormSection title="Identificação da Equipe">
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="matriculaCrime" className="text-sm font-medium">Matrícula do Policial</Label>
                <Input
                  id="matriculaCrime"
                  type="text"
                  value={matriculaInput}
                  onChange={(e) => setMatriculaInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), buscarPolicial())}
                  placeholder="Digite a matrícula"
                  className="input-glass"
                />
              </div>
              <Button type="button" onClick={buscarPolicial} disabled={isSearchingMembro || !matriculaInput.trim()} className="btn-primary">
                {isSearchingMembro ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" />Buscar</>}
              </Button>
            </div>
            {membrosEquipe.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Policiais na Equipe ({membrosEquipe.length})</Label>
                {membrosEquipe.map((membro) => (
                  <div key={membro.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border/50">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{membro.matricula}</span>
                      <span className="text-muted-foreground">{membro.posto_graduacao}</span>
                      <span className="font-medium">{membro.nome_guerra}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removerMembro(membro.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {membrosEquipe.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum policial adicionado</p>}
          </div>
        </FormSection>

        {/* Card: Classificação do Crime */}
        <FormSection title="Classificação do Crime" columns>
          <div className="space-y-2">
            <Label htmlFor="tipoPenal" className="text-sm font-medium">
              Tipo Penal <span className="text-destructive">*</span>
            </Label>
            <Select value={tipoPenalId} onValueChange={setTipoPenalId}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="Selecione o tipo penal" />
              </SelectTrigger>
              <SelectContent>
                {tiposPenais.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.codigo ? `${t.codigo} - ${t.nome}` : t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="naturezaCrime" className="text-sm font-medium">
              Natureza do Crime
            </Label>
            <Input
              id="naturezaCrime"
              value={naturezaCrime}
              onChange={(e) => setNaturezaCrime(e.target.value)}
              placeholder="Ex: Roubo, Furto, Vandalismo"
              className="input-glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquadramentoLegal" className="text-sm font-medium">
              Enquadramento Legal
            </Label>
            <Input
              id="enquadramentoLegal"
              value={enquadramentoLegal}
              onChange={(e) => setEnquadramentoLegal(e.target.value)}
              placeholder="Ex: Art. 155 do CP"
              className="input-glass"
            />
          </div>

          <div className="col-span-full space-y-2">
            <Label className="text-sm font-medium">Ocorreu Apreensão?</Label>
            <Select value={ocorreuApreensao ? 'sim' : 'nao'} onValueChange={(v) => setOcorreuApreensao(v === 'sim')}>
              <SelectTrigger className="input-glass w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Não</SelectItem>
                <SelectItem value="sim">Sim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        {/* Card: Detalhes da Ocorrência */}
        <FormSection title="Detalhes da Ocorrência" columns>
          <div className="col-span-full space-y-2">
            <Label htmlFor="descricaoOcorrencia" className="text-sm font-medium">
              Descrição da Ocorrência
            </Label>
            <Textarea
              id="descricaoOcorrencia"
              value={descricaoOcorrencia}
              onChange={(e) => setDescricaoOcorrencia(e.target.value)}
              placeholder="Descreva os detalhes da ocorrência..."
              className="input-glass"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localEspecifico" className="text-sm font-medium">
              Local Específico
            </Label>
            <Input
              id="localEspecifico"
              value={localEspecifico}
              onChange={(e) => setLocalEspecifico(e.target.value)}
              placeholder="Ex: Via pública, Residência, Comércio"
              className="input-glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vitimasEnvolvidas" className="text-sm font-medium">
              Vítimas Envolvidas
            </Label>
            <Input
              id="vitimasEnvolvidas"
              type="number"
              min="0"
              value={vitimasEnvolvidas}
              onChange={(e) => setVitimasEnvolvidas(parseInt(e.target.value) || 0)}
              className="input-glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspeitosEnvolvidos" className="text-sm font-medium">
              Suspeitos Envolvidos
            </Label>
            <Input
              id="suspeitosEnvolvidos"
              type="number"
              min="0"
              value={suspeitosEnvolvidos}
              onChange={(e) => setSuspeitosEnvolvidos(parseInt(e.target.value) || 0)}
              className="input-glass"
            />
          </div>
        </FormSection>

        {/* Card: Armas e Materiais */}
        <FormSection title="Armas e Materiais" columns>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label className="text-sm">Arma Utilizada</Label>
            <Switch checked={armaUtilizada} onCheckedChange={setArmaUtilizada} />
          </div>

          {armaUtilizada && (
            <div className="space-y-2">
              <Label htmlFor="tipoArma" className="text-sm font-medium">
                Tipo de Arma
              </Label>
              <Select value={tipoArma} onValueChange={setTipoArma}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {['Arma de fogo', 'Arma branca', 'Arma de fogo e branca', 'Outro'].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label className="text-sm">Material Apreendido</Label>
            <Switch checked={materialApreendido} onCheckedChange={setMaterialApreendido} />
          </div>

          {materialApreendido && (
            <div className="col-span-full space-y-2">
              <Label htmlFor="descricaoMaterial" className="text-sm font-medium">
                Descrição do Material
              </Label>
              <Textarea
                id="descricaoMaterial"
                value={descricaoMaterial}
                onChange={(e) => setDescricaoMaterial(e.target.value)}
                placeholder="Descreva o material apreendido..."
                className="input-glass"
                rows={3}
              />
            </div>
          )}
        </FormSection>

        {/* Card: Veículos */}
        <FormSection title="Veículos" columns>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label className="text-sm">Veículo Envolvido</Label>
            <Switch checked={veiculoEnvolvido} onCheckedChange={setVeiculoEnvolvido} />
          </div>

          {veiculoEnvolvido && (
            <>
              <div className="space-y-2">
                <Label htmlFor="tipoVeiculo" className="text-sm font-medium">
                  Tipo de Veículo
                </Label>
                <Select value={tipoVeiculo} onValueChange={setTipoVeiculo}>
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Automóvel', 'Motocicleta', 'Caminhão', 'Ônibus', 'Bicicleta', 'Outro'].map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placaVeiculo" className="text-sm font-medium">
                  Placa do Veículo
                </Label>
                <Input
                  id="placaVeiculo"
                  value={placaVeiculo}
                  onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC1234"
                  maxLength={7}
                  className="input-glass"
                />
              </div>
            </>
          )}
        </FormSection>

        {/* Card: Bens Apreendidos */}
        {ocorreuApreensao && (
          <BensApreendidosSection 
            bensApreendidos={bensApreendidos}
            onBensChange={setBensApreendidos}
          />
        )}

        {/* Card: Conclusão da Ocorrência */}
        <FormSection title="Conclusão da Ocorrência" columns>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Desfecho <span className="text-destructive">*</span>
            </Label>
            <Select value={desfechoId} onValueChange={setDesfechoId}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="Selecione o desfecho" />
              </SelectTrigger>
              <SelectContent>
                {desfechos.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedimentoLegal" className="text-sm font-medium">
              Procedimento Legal
            </Label>
            <Input
              id="procedimentoLegal"
              value={procedimentoLegal}
              onChange={(e) => setProcedimentoLegal(e.target.value)}
              placeholder="Ex: TCO-PMDF, TCO-PCDF, QT"
              className="input-glass"
            />
          </div>

          <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Qtd Detidos Maior de Idade</Label>
              <Input
                type="number"
                min="0"
                value={qtdDetidosMaior}
                onChange={(e) => setQtdDetidosMaior(parseInt(e.target.value) || 0)}
                className="input-glass"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Qtd Detidos Menor de Idade</Label>
              <Input
                type="number"
                min="0"
                value={qtdDetidosMenor}
                onChange={(e) => setQtdDetidosMenor(parseInt(e.target.value) || 0)}
                className="input-glass"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Qtd Liberados Maior de Idade</Label>
              <Input
                type="number"
                min="0"
                value={qtdLiberadosMaior}
                onChange={(e) => setQtdLiberadosMaior(parseInt(e.target.value) || 0)}
                className="input-glass"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Qtd Liberados Menor de Idade</Label>
              <Input
                type="number"
                min="0"
                value={qtdLiberadosMenor}
                onChange={(e) => setQtdLiberadosMenor(parseInt(e.target.value) || 0)}
                className="input-glass"
              />
            </div>
          </div>

          <div className="col-span-full space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              className="input-glass"
              rows={3}
            />
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-glass min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Registrar Ocorrência'
            )}
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default CrimesComuns;
