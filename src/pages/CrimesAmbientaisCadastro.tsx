import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import FormSection from '@/components/resgate/FormSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Types
interface DimensionItem {
  id: string;
  nome: string;
}

interface TipoCrime {
  id_tipo_de_crime: string;
  'Tipo de Crime': string;
}

interface Enquadramento {
  id_enquadramento: string;
  id_tipo_de_crime: string;
  Enquadramento: string;
}

interface EspecieFauna {
  id: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  ordem_taxonomica: string;
  estado_de_conservacao: string;
  tipo_de_fauna: string;
}

interface EspecieFlora {
  id: string;
  'Nome Popular': string;
  'Nome Científico': string;
  Classe: string;
  Ordem: string;
  Família: string;
  'Estado de Conservação': string;
  'Tipo de Planta': string;
  'Madeira de Lei': string;
  'Imune ao Corte': string;
}

interface FaunaItem {
  id: string;
  especieId: string;
  estadoSaudeId: string;
  atropelamento: boolean;
  estagioVidaId: string;
  quantidadeAdulto: number;
  quantidadeFilhote: number;
  destinacaoId: string;
}

interface FloraItem {
  id: string;
  especieId: string;
  condicao: string;
  quantidade: number;
  destinacao: string;
}

interface ItemApreendido {
  id: string;
  tipo_crime_relacionado: string;
  categoria: string;
  item: string;
  uso_ilicito: string;
}

interface BemApreendido {
  id: string;
  itemId: string;
  quantidade: number;
}

interface AreaProtegida {
  id: string;
  nome: string;
}

const CrimesAmbientaisCadastro = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dimension data
  const [regioes, setRegioes] = useState<DimensionItem[]>([]);
  const [tiposArea, setTiposArea] = useState<{id: string; nome: string}[]>([]);
  const [tiposCrime, setTiposCrime] = useState<TipoCrime[]>([]);
  const [enquadramentos, setEnquadramentos] = useState<Enquadramento[]>([]);
  const [desfechos, setDesfechos] = useState<DimensionItem[]>([]);
  const [especiesFauna, setEspeciesFauna] = useState<EspecieFauna[]>([]);
  const [especiesFlora, setEspeciesFlora] = useState<EspecieFlora[]>([]);
  const [estadosSaude, setEstadosSaude] = useState<DimensionItem[]>([]);
  const [estagiosVida, setEstagiosVida] = useState<DimensionItem[]>([]);
  const [destinacoes, setDestinacoes] = useState<DimensionItem[]>([]);
  const [itensApreendidos, setItensApreendidos] = useState<ItemApreendido[]>([]);
  const [areasProtegidas, setAreasProtegidas] = useState<AreaProtegida[]>([]);
  
  // Form state - Informações Gerais
  const [data, setData] = useState('');
  const [regiaoId, setRegiaoId] = useState('');
  const [tipoAreaId, setTipoAreaId] = useState('');
  const [areaProtegida, setAreaProtegida] = useState(false);
  const [areasProtegidasSelecionadas, setAreasProtegidasSelecionadas] = useState<string[]>([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Classificação do Crime
  const [tipoCrimeId, setTipoCrimeId] = useState('');
  const [enquadramentoId, setEnquadramentoId] = useState('');
  const [ocorreuApreensao, setOcorreuApreensao] = useState(false);
  
  // Campos de Poluição
  const [tipoPoluicao, setTipoPoluicao] = useState('');
  const [descricaoPoluicao, setDescricaoPoluicao] = useState('');
  const [materialVisivel, setMaterialVisivel] = useState('');
  const [volumeAparente, setVolumeAparente] = useState('');
  const [origemAparente, setOrigemAparente] = useState('');
  const [animalAfetado, setAnimalAfetado] = useState(false);
  const [vegetacaoAfetada, setVegetacaoAfetada] = useState(false);
  const [alteracaoVisual, setAlteracaoVisual] = useState(false);
  const [odorForte, setOdorForte] = useState(false);
  const [mortandadeAnimais, setMortandadeAnimais] = useState(false);
  const [riscoImediato, setRiscoImediato] = useState(false);
  const [intensidadePercebida, setIntensidadePercebida] = useState('');
  
  // Campos de Ordenamento Urbano
  const [tipoIntervencao, setTipoIntervencao] = useState('');
  const [estruturasEncontradas, setEstruturasEncontradas] = useState('');
  const [qtdEstruturas, setQtdEstruturas] = useState(0);
  const [danoPerceptivel, setDanoPerceptivel] = useState('');
  const [maquinasPresentes, setMaquinasPresentes] = useState(false);
  const [materialApreendidoOrd, setMaterialApreendidoOrd] = useState(false);
  const [descricaoMaterialOrd, setDescricaoMaterialOrd] = useState('');
  
  // Campos de Administração Ambiental
  const [tipoImpedimento, setTipoImpedimento] = useState('');
  const [descricaoAdmAmbiental, setDescricaoAdmAmbiental] = useState('');
  const [docIrregular, setDocIrregular] = useState(false);
  const [tipoIrregularidade, setTipoIrregularidade] = useState('');
  const [veiculoRelacionado, setVeiculoRelacionado] = useState(false);
  const [materialApreendidoAdm, setMaterialApreendidoAdm] = useState(false);
  const [descricaoMaterialAdm, setDescricaoMaterialAdm] = useState('');
  
  // Fauna items
  const [faunaItems, setFaunaItems] = useState<FaunaItem[]>([]);
  
  // Flora items
  const [floraItems, setFloraItems] = useState<FloraItem[]>([]);
  
  // Bens apreendidos
  const [bensApreendidos, setBensApreendidos] = useState<BemApreendido[]>([]);
  
  // Conclusão
  const [desfechoId, setDesfechoId] = useState('');
  const [procedimentoLegal, setProcedimentoLegal] = useState('');
  const [qtdDetidosMaior, setQtdDetidosMaior] = useState(0);
  const [qtdDetidosMenor, setQtdDetidosMenor] = useState(0);
  const [qtdLiberadosMaior, setQtdLiberadosMaior] = useState(0);
  const [qtdLiberadosMenor, setQtdLiberadosMenor] = useState(0);

  // Computed values
  const tipoCrimeSelecionado = tiposCrime.find(t => t.id_tipo_de_crime === tipoCrimeId);
  const tipoCrimeNome = tipoCrimeSelecionado?.['Tipo de Crime']?.toLowerCase() || '';
  
  const isFauna = tipoCrimeNome.includes('fauna');
  const isFlora = tipoCrimeNome.includes('flora');
  const isPoluicao = tipoCrimeNome.includes('poluição') || tipoCrimeNome.includes('poluicao');
  const isOrdenamento = tipoCrimeNome.includes('ordenamento') || tipoCrimeNome.includes('patrimônio') || tipoCrimeNome.includes('patrimonio');
  const isAdministracao = tipoCrimeNome.includes('administração') || tipoCrimeNome.includes('administracao');
  
  const desfechoSelecionado = desfechos.find(d => d.id === desfechoId);
  const isFlagrante = desfechoSelecionado?.nome?.toLowerCase().includes('flagrante');
  
  const enquadramentosFiltrados = enquadramentos.filter(e => e.id_tipo_de_crime === tipoCrimeId);

  // Load dimensions on mount
  useEffect(() => {
    loadDimensions();
  }, []);

  const loadDimensions = async () => {
    try {
      const [
        regioesRes,
        tiposAreaRes,
        tiposCrimeRes,
        enquadramentosRes,
        desfechosRes,
        especiesFaunaRes,
        especiesFloraRes,
        estadosSaudeRes,
        estagiosVidaRes,
        destinacoesRes,
        itensRes,
        areasRes
      ] = await Promise.all([
        supabase.from('dim_regiao_administrativa').select('id, nome').order('nome'),
        supabase.from('dim_tipo_de_area').select('id, "Tipo de Área"'),
        supabase.from('dim_tipo_de_crime').select('id_tipo_de_crime, "Tipo de Crime"'),
        supabase.from('dim_enquadramento').select('id_enquadramento, id_tipo_de_crime, "Enquadramento"'),
        supabase.from('dim_desfecho').select('id, nome'),
        supabase.from('dim_especies_fauna').select('*').order('nome_popular'),
        supabase.from('dim_especies_flora').select('*').order('"Nome Popular"'),
        supabase.from('dim_estado_saude').select('id, nome'),
        supabase.from('dim_estagio_vida').select('id, nome'),
        supabase.from('dim_destinacao').select('id, nome'),
        supabase.from('dim_itens_apreendidos').select('*'),
        supabase.from('dim_area_protegida').select('id, nome')
      ]);

      if (regioesRes.data) setRegioes(regioesRes.data);
      if (tiposAreaRes.data) {
        setTiposArea(tiposAreaRes.data.map(t => ({ id: t.id, nome: t['Tipo de Área'] || '' })));
      }
      if (tiposCrimeRes.data) setTiposCrime(tiposCrimeRes.data as TipoCrime[]);
      if (enquadramentosRes.data) setEnquadramentos(enquadramentosRes.data as Enquadramento[]);
      if (desfechosRes.data) setDesfechos(desfechosRes.data);
      if (especiesFaunaRes.data) setEspeciesFauna(especiesFaunaRes.data);
      if (especiesFloraRes.data) setEspeciesFlora(especiesFloraRes.data as unknown as EspecieFlora[]);
      if (estadosSaudeRes.data) setEstadosSaude(estadosSaudeRes.data);
      if (estagiosVidaRes.data) setEstagiosVida(estagiosVidaRes.data);
      if (destinacoesRes.data) setDestinacoes(destinacoesRes.data);
      if (itensRes.data) setItensApreendidos(itensRes.data as ItemApreendido[]);
      if (areasRes.data) setAreasProtegidas(areasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dimensões:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  // Add fauna item
  const addFaunaItem = () => {
    if (faunaItems.length >= 50) return;
    setFaunaItems([...faunaItems, {
      id: crypto.randomUUID(),
      especieId: '',
      estadoSaudeId: '',
      atropelamento: false,
      estagioVidaId: '',
      quantidadeAdulto: 0,
      quantidadeFilhote: 0,
      destinacaoId: ''
    }]);
  };

  const removeFaunaItem = (id: string) => {
    setFaunaItems(faunaItems.filter(f => f.id !== id));
  };

  const updateFaunaItem = (id: string, field: keyof FaunaItem, value: any) => {
    setFaunaItems(faunaItems.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  // Add flora item
  const addFloraItem = () => {
    if (floraItems.length >= 50) return;
    setFloraItems([...floraItems, {
      id: crypto.randomUUID(),
      especieId: '',
      condicao: '',
      quantidade: 1,
      destinacao: ''
    }]);
  };

  const removeFloraItem = (id: string) => {
    setFloraItems(floraItems.filter(f => f.id !== id));
  };

  const updateFloraItem = (id: string, field: keyof FloraItem, value: any) => {
    setFloraItems(floraItems.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  // Add bem apreendido
  const addBemApreendido = () => {
    setBensApreendidos([...bensApreendidos, {
      id: crypto.randomUUID(),
      itemId: '',
      quantidade: 1
    }]);
  };

  const removeBemApreendido = (id: string) => {
    setBensApreendidos(bensApreendidos.filter(b => b.id !== id));
  };

  const updateBemApreendido = (id: string, field: keyof BemApreendido, value: any) => {
    setBensApreendidos(bensApreendidos.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  // Toggle area protegida
  const toggleAreaProtegida = (areaId: string) => {
    if (areasProtegidasSelecionadas.includes(areaId)) {
      setAreasProtegidasSelecionadas(areasProtegidasSelecionadas.filter(id => id !== areaId));
    } else {
      setAreasProtegidasSelecionadas([...areasProtegidasSelecionadas, areaId]);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data || !regiaoId || !latitude || !longitude || !tipoCrimeId || !enquadramentoId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert main record
      const { data: crimeRecord, error: crimeError } = await supabase
        .from('fat_registros_de_crime')
        .insert({
          data,
          regiao_administrativa_id: regiaoId,
          tipo_area_id: tipoAreaId || null,
          area_protegida: areaProtegida,
          areas_protegidas_ids: areasProtegidasSelecionadas,
          latitude,
          longitude,
          tipo_crime_id: tipoCrimeId,
          enquadramento_id: enquadramentoId,
          ocorreu_apreensao: ocorreuApreensao,
          // Poluição
          tipo_poluicao: isPoluicao ? tipoPoluicao : null,
          descricao_poluicao: isPoluicao ? descricaoPoluicao : null,
          material_visivel: isPoluicao ? materialVisivel : null,
          volume_aparente: isPoluicao ? volumeAparente : null,
          origem_aparente: isPoluicao ? origemAparente : null,
          animal_afetado: isPoluicao ? animalAfetado : null,
          vegetacao_afetada: isPoluicao ? vegetacaoAfetada : null,
          alteracao_visual: isPoluicao ? alteracaoVisual : null,
          odor_forte: isPoluicao ? odorForte : null,
          mortandade_animais: isPoluicao ? mortandadeAnimais : null,
          risco_imediato: isPoluicao ? riscoImediato : null,
          intensidade_percebida: isPoluicao ? intensidadePercebida : null,
          // Ordenamento
          tipo_intervencao: isOrdenamento ? tipoIntervencao : null,
          estruturas_encontradas: isOrdenamento ? estruturasEncontradas : null,
          qtd_estruturas: isOrdenamento ? qtdEstruturas : null,
          dano_perceptivel: isOrdenamento ? danoPerceptivel : null,
          maquinas_presentes: isOrdenamento ? maquinasPresentes : null,
          material_apreendido_ord: isOrdenamento ? materialApreendidoOrd : null,
          descricao_material_ord: isOrdenamento ? descricaoMaterialOrd : null,
          // Administração
          tipo_impedimento: isAdministracao ? tipoImpedimento : null,
          descricao_adm_ambiental: isAdministracao ? descricaoAdmAmbiental : null,
          doc_irregular: isAdministracao ? docIrregular : null,
          tipo_irregularidade_visual: isAdministracao ? tipoIrregularidade : null,
          veiculo_relacionado: isAdministracao ? veiculoRelacionado : null,
          material_apreendido_adm: isAdministracao ? materialApreendidoAdm : null,
          descricao_material_adm: isAdministracao ? descricaoMaterialAdm : null,
          // Conclusão
          desfecho_id: desfechoId || null,
          procedimento_legal: isFlagrante ? procedimentoLegal : null,
          qtd_detidos_maior: qtdDetidosMaior,
          qtd_detidos_menor: qtdDetidosMenor,
          qtd_liberados_maior: qtdLiberadosMaior,
          qtd_liberados_menor: qtdLiberadosMenor
        })
        .select('id')
        .single();

      if (crimeError) throw crimeError;

      const ocorrenciaId = crimeRecord.id;

      // Insert fauna items
      if (isFauna && ocorreuApreensao && faunaItems.length > 0) {
        const faunaRecords = faunaItems.filter(f => f.especieId).map(f => ({
          id_ocorrencia: ocorrenciaId,
          especie_id: f.especieId,
          estado_saude_id: f.estadoSaudeId || null,
          atropelamento: f.atropelamento,
          estagio_vida_id: f.estagioVidaId || null,
          quantidade_adulto: f.quantidadeAdulto,
          quantidade_filhote: f.quantidadeFilhote,
          quantidade_total: f.quantidadeAdulto + f.quantidadeFilhote,
          destinacao_id: f.destinacaoId || null
        }));

        if (faunaRecords.length > 0) {
          const { error: faunaError } = await supabase
            .from('fat_crime_fauna')
            .insert(faunaRecords);
          if (faunaError) throw faunaError;
        }
      }

      // Insert flora items
      if (isFlora && ocorreuApreensao && floraItems.length > 0) {
        const floraRecords = floraItems.filter(f => f.especieId).map(f => ({
          id_ocorrencia: ocorrenciaId,
          especie_id: f.especieId,
          condicao: f.condicao,
          quantidade: f.quantidade,
          destinacao: f.destinacao
        }));

        if (floraRecords.length > 0) {
          const { error: floraError } = await supabase
            .from('fat_crime_flora')
            .insert(floraRecords);
          if (floraError) throw floraError;
        }
      }

      // Insert bens apreendidos
      if (ocorreuApreensao && bensApreendidos.length > 0) {
        const bensRecords = bensApreendidos.filter(b => b.itemId).map(b => ({
          id_ocorrencia: ocorrenciaId,
          id_item_apreendido: b.itemId,
          quantidade: b.quantidade
        }));

        if (bensRecords.length > 0) {
          const { error: bensError } = await supabase
            .from('fat_ocorrencia_apreensao')
            .insert(bensRecords);
          if (bensError) throw bensError;
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
    setRegiaoId('');
    setTipoAreaId('');
    setAreaProtegida(false);
    setAreasProtegidasSelecionadas([]);
    setLatitude('');
    setLongitude('');
    setTipoCrimeId('');
    setEnquadramentoId('');
    setOcorreuApreensao(false);
    setTipoPoluicao('');
    setDescricaoPoluicao('');
    setMaterialVisivel('');
    setVolumeAparente('');
    setOrigemAparente('');
    setAnimalAfetado(false);
    setVegetacaoAfetada(false);
    setAlteracaoVisual(false);
    setOdorForte(false);
    setMortandadeAnimais(false);
    setRiscoImediato(false);
    setIntensidadePercebida('');
    setTipoIntervencao('');
    setEstruturasEncontradas('');
    setQtdEstruturas(0);
    setDanoPerceptivel('');
    setMaquinasPresentes(false);
    setMaterialApreendidoOrd(false);
    setDescricaoMaterialOrd('');
    setTipoImpedimento('');
    setDescricaoAdmAmbiental('');
    setDocIrregular(false);
    setTipoIrregularidade('');
    setVeiculoRelacionado(false);
    setMaterialApreendidoAdm(false);
    setDescricaoMaterialAdm('');
    setFaunaItems([]);
    setFloraItems([]);
    setBensApreendidos([]);
    setDesfechoId('');
    setProcedimentoLegal('');
    setQtdDetidosMaior(0);
    setQtdDetidosMenor(0);
    setQtdLiberadosMaior(0);
    setQtdLiberadosMenor(0);
  };

  // Flora condition options
  const floraCondicoes = [
    'Árvore em pé (viva)', 'Árvore em pé (morta)', 'Árvore caída', 'Tora', 'Prancha',
    'Caibro', 'Ripa', 'Lenha (achas)', 'Lenha (feixes)', 'Carvão vegetal',
    'Estaca', 'Moirão', 'Mourão', 'Poste', 'Esteio', 'Dormentes',
    'Madeira serrada', 'Madeira beneficiada', 'Madeira em tora', 'Tronco',
    'Galho', 'Raiz', 'Casca', 'Folhas', 'Frutos', 'Sementes',
    'Mudas', 'Palmito', 'Xaxim', 'Orquídea', 'Bromélia',
    'Cacto', 'Samambaia', 'Outra espécie ornamental'
  ];

  // Flora destination options
  const floraDestinacoes = [
    'IBRAM/DF', 'IBAMA', 'DEPASA/DF', 'Outro órgão ambiental competente',
    'Entregue a fiel depositário', 'Mantido sob guarda do BPMA',
    'Reintroduzido no ambiente (quando autorizado)', 'Destruído/descartado conforme autorização'
  ];

  // Group itens by category
  const itensPorCategoria = itensApreendidos.reduce((acc, item) => {
    const cat = item.categoria || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ItemApreendido[]>);

  return (
    <Layout title="Ocorrências Crimes Ambientais" showBackButton>
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
              Tipo de Área <span className="text-destructive">*</span>
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

          <div className="space-y-2">
            <Label className="text-sm font-medium">Ocorrência em Área Protegida?</Label>
            <Select value={areaProtegida ? 'sim' : 'nao'} onValueChange={(v) => setAreaProtegida(v === 'sim')}>
              <SelectTrigger className="input-glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Não</SelectItem>
                <SelectItem value="sim">Sim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {areaProtegida && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de Área Protegida</Label>
              <Select 
                value={areasProtegidasSelecionadas[0] || ''} 
                onValueChange={(v) => setAreasProtegidasSelecionadas([v])}
              >
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {areasProtegidas.map(area => (
                    <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
        </FormSection>

        {/* Card: Classificação do Crime */}
        <FormSection title="Classificação do Crime" columns>
          <div className="space-y-2">
            <Label htmlFor="tipoCrime" className="text-sm font-medium">
              Tipo de Crime <span className="text-destructive">*</span>
            </Label>
            <Select value={tipoCrimeId} onValueChange={(v) => { setTipoCrimeId(v); setEnquadramentoId(''); }}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="Selecione o tipo de crime" />
              </SelectTrigger>
              <SelectContent>
                {tiposCrime.map(t => (
                  <SelectItem key={t.id_tipo_de_crime} value={t.id_tipo_de_crime}>
                    {t['Tipo de Crime']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquadramento" className="text-sm font-medium">
              Enquadramento <span className="text-destructive">*</span>
            </Label>
            <Select value={enquadramentoId} onValueChange={setEnquadramentoId} disabled={!tipoCrimeId}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="Selecione o enquadramento" />
              </SelectTrigger>
              <SelectContent>
                {enquadramentosFiltrados.map(e => (
                  <SelectItem key={e.id_enquadramento} value={e.id_enquadramento}>
                    {e.Enquadramento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {/* Card: Informações Específicas - Crime de Poluição */}
        {isPoluicao && (
          <FormSection title="Informações Específicas – Crime de Poluição" columns>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de poluição constatada</Label>
              <Select value={tipoPoluicao} onValueChange={setTipoPoluicao}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Hídrica', 'Atmosférica', 'Solo', 'Sonora', 'Luminosa', 'Resíduos sólidos', 
                    'Resíduos perigosos aparentes', 'Efluente possivelmente doméstico', 
                    'Efluente possivelmente industrial', 'Queima irregular', 'Outro'].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Material visível</Label>
              <Select value={materialVisivel} onValueChange={setMaterialVisivel}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Óleo ou derivado', 'Lixo doméstico', 'Entulho', 'Esgoto aparente', 
                    'Fumaça', 'Líquido desconhecido', 'Outro'].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Volume aparente</Label>
              <Select value={volumeAparente} onValueChange={setVolumeAparente}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Pequeno', 'Moderado', 'Grande', 'Muito grande', 'Não estimável'].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Origem aparente</Label>
              <Select value={origemAparente} onValueChange={setOrigemAparente}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Residência', 'Comércio', 'Indústria', 'Veículo', 'Área pública', 'Não identificada'].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-full space-y-2">
              <Label className="text-sm font-medium">Descrição objetiva da situação</Label>
              <Textarea
                value={descricaoPoluicao}
                onChange={(e) => setDescricaoPoluicao(e.target.value)}
                placeholder="Descreva a situação..."
                className="input-glass"
              />
            </div>

            <div className="col-span-full grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label className="text-sm">Animal visivelmente afetado</Label>
                <Switch checked={animalAfetado} onCheckedChange={setAnimalAfetado} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label className="text-sm">Vegetação visivelmente afetada</Label>
                <Switch checked={vegetacaoAfetada} onCheckedChange={setVegetacaoAfetada} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label className="text-sm">Alteração visual em água, solo ou ar</Label>
                <Switch checked={alteracaoVisual} onCheckedChange={setAlteracaoVisual} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label className="text-sm">Odor forte perceptível</Label>
                <Switch checked={odorForte} onCheckedChange={setOdorForte} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label className="text-sm">Mortandade de animais visível</Label>
                <Switch checked={mortandadeAnimais} onCheckedChange={setMortandadeAnimais} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label className="text-sm">Risco imediato percebido</Label>
                <Switch checked={riscoImediato} onCheckedChange={setRiscoImediato} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Intensidade percebida</Label>
              <Select value={intensidadePercebida} onValueChange={setIntensidadePercebida}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Baixa', 'Moderada', 'Alta', 'Muito alta'].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormSection>
        )}

        {/* Card: Informações Específicas - Ordenamento Urbano */}
        {isOrdenamento && (
          <FormSection title="Informações Específicas – Ordenamento Urbano / Patrimônio Cultural" columns>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de intervenção irregular</Label>
              <Input
                value={tipoIntervencao}
                onChange={(e) => setTipoIntervencao(e.target.value)}
                placeholder="Descreva o tipo de intervenção"
                className="input-glass"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Estruturas encontradas</Label>
              <Input
                value={estruturasEncontradas}
                onChange={(e) => setEstruturasEncontradas(e.target.value)}
                placeholder="Ex: obra, tapume, máquinas"
                className="input-glass"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Quantidade de estruturas/itens</Label>
              <Input
                type="number"
                min="0"
                value={qtdEstruturas}
                onChange={(e) => setQtdEstruturas(parseInt(e.target.value) || 0)}
                className="input-glass"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Dano ou alteração perceptível</Label>
              <Input
                value={danoPerceptivel}
                onChange={(e) => setDanoPerceptivel(e.target.value)}
                placeholder="Descreva o dano"
                className="input-glass"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="text-sm">Máquinas presentes</Label>
              <Switch checked={maquinasPresentes} onCheckedChange={setMaquinasPresentes} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="text-sm">Material apreendido</Label>
              <Switch checked={materialApreendidoOrd} onCheckedChange={setMaterialApreendidoOrd} />
            </div>

            {materialApreendidoOrd && (
              <div className="col-span-full space-y-2">
                <Label className="text-sm font-medium">Descrição do material apreendido</Label>
                <Input
                  value={descricaoMaterialOrd}
                  onChange={(e) => setDescricaoMaterialOrd(e.target.value)}
                  placeholder="Descreva o material"
                  className="input-glass"
                />
              </div>
            )}
          </FormSection>
        )}

        {/* Card: Informações Específicas - Administração Ambiental */}
        {isAdministracao && (
          <FormSection title="Informações Específicas – Administração Ambiental" columns>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de impedimento ou obstrução</Label>
              <Input
                value={tipoImpedimento}
                onChange={(e) => setTipoImpedimento(e.target.value)}
                placeholder="Descreva o impedimento"
                className="input-glass"
              />
            </div>

            <div className="col-span-full space-y-2">
              <Label className="text-sm font-medium">Descrição objetiva</Label>
              <Textarea
                value={descricaoAdmAmbiental}
                onChange={(e) => setDescricaoAdmAmbiental(e.target.value)}
                placeholder="Descreva a situação..."
                className="input-glass"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="text-sm">Documento ambiental aparentemente irregular</Label>
              <Switch checked={docIrregular} onCheckedChange={setDocIrregular} />
            </div>

            {docIrregular && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de irregularidade visual</Label>
                <Input
                  value={tipoIrregularidade}
                  onChange={(e) => setTipoIrregularidade(e.target.value)}
                  placeholder="Ex: rasura, falta de dado, incoerência"
                  className="input-glass"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="text-sm">Veículo relacionado</Label>
              <Switch checked={veiculoRelacionado} onCheckedChange={setVeiculoRelacionado} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="text-sm">Material apreendido</Label>
              <Switch checked={materialApreendidoAdm} onCheckedChange={setMaterialApreendidoAdm} />
            </div>

            {materialApreendidoAdm && (
              <div className="col-span-full space-y-2">
                <Label className="text-sm font-medium">Descrição do material apreendido</Label>
                <Input
                  value={descricaoMaterialAdm}
                  onChange={(e) => setDescricaoMaterialAdm(e.target.value)}
                  placeholder="Descreva o material"
                  className="input-glass"
                />
              </div>
            )}
          </FormSection>
        )}

        {/* Card: Identificação de Fauna */}
        {isFauna && ocorreuApreensao && (
          <FormSection title="Identificação das Espécies de Fauna">
            <div className="space-y-4">
              {faunaItems.map((item, index) => {
                const especie = especiesFauna.find(e => e.id === item.especieId);
                return (
                  <div key={item.id} className="p-4 rounded-lg border border-primary/10 bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Espécie {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaunaItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Espécie</Label>
                        <Select 
                          value={item.especieId} 
                          onValueChange={(v) => updateFaunaItem(item.id, 'especieId', v)}
                        >
                          <SelectTrigger className="input-glass">
                            <SelectValue placeholder="Selecione a espécie" />
                          </SelectTrigger>
                          <SelectContent>
                            {especiesFauna.map(e => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.nome_popular} - {e.nome_cientifico}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {especie && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Classe Taxonômica</Label>
                            <Input value={especie.classe_taxonomica} disabled className="bg-muted/50" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Estado de Conservação</Label>
                            <Input value={especie.estado_de_conservacao} disabled className="bg-muted/50" />
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm">Estado de Saúde</Label>
                        <Select 
                          value={item.estadoSaudeId} 
                          onValueChange={(v) => updateFaunaItem(item.id, 'estadoSaudeId', v)}
                        >
                          <SelectTrigger className="input-glass">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {estadosSaude.map(e => (
                              <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Estágio de Vida</Label>
                        <Select 
                          value={item.estagioVidaId} 
                          onValueChange={(v) => updateFaunaItem(item.id, 'estagioVidaId', v)}
                        >
                          <SelectTrigger className="input-glass">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {estagiosVida.map(e => (
                              <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <Label className="text-sm">Atropelamento</Label>
                        <Switch 
                          checked={item.atropelamento} 
                          onCheckedChange={(v) => updateFaunaItem(item.id, 'atropelamento', v)} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Qtd. Adultos</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantidadeAdulto}
                          onChange={(e) => updateFaunaItem(item.id, 'quantidadeAdulto', parseInt(e.target.value) || 0)}
                          className="input-glass"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Qtd. Filhotes</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantidadeFilhote}
                          onChange={(e) => updateFaunaItem(item.id, 'quantidadeFilhote', parseInt(e.target.value) || 0)}
                          className="input-glass"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Destinação</Label>
                        <Select 
                          value={item.destinacaoId} 
                          onValueChange={(v) => updateFaunaItem(item.id, 'destinacaoId', v)}
                        >
                          <SelectTrigger className="input-glass">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {destinacoes.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={addFaunaItem}
                disabled={faunaItems.length >= 50}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Espécie ({faunaItems.length}/50)
              </Button>
            </div>
          </FormSection>
        )}

        {/* Card: Identificação de Flora */}
        {isFlora && ocorreuApreensao && (
          <FormSection title="Identificação das Espécies de Flora">
            <div className="space-y-4">
              {floraItems.map((item, index) => {
                const especie = especiesFlora.find(e => e.id === item.especieId);
                return (
                  <div key={item.id} className="p-4 rounded-lg border border-primary/10 bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Espécie {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFloraItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Espécie</Label>
                        <Select 
                          value={item.especieId} 
                          onValueChange={(v) => updateFloraItem(item.id, 'especieId', v)}
                        >
                          <SelectTrigger className="input-glass">
                            <SelectValue placeholder="Selecione a espécie" />
                          </SelectTrigger>
                          <SelectContent>
                            {especiesFlora.map(e => (
                              <SelectItem key={e.id} value={e.id}>
                                {e['Nome Popular']} - {e['Nome Científico']}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {especie && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Classe</Label>
                            <Input value={especie.Classe || ''} disabled className="bg-muted/50" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Estado de Conservação</Label>
                            <Input value={especie['Estado de Conservação'] || ''} disabled className="bg-muted/50" />
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm">Condição</Label>
                        <Select 
                          value={item.condicao} 
                          onValueChange={(v) => updateFloraItem(item.id, 'condicao', v)}
                        >
                          <SelectTrigger className="input-glass">
                            <SelectValue placeholder="Selecione a condição" />
                          </SelectTrigger>
                          <SelectContent>
                            {floraCondicoes.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => updateFloraItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                          className="input-glass"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Destinação</Label>
                        <Select 
                          value={item.destinacao} 
                          onValueChange={(v) => updateFloraItem(item.id, 'destinacao', v)}
                        >
                          <SelectTrigger className="input-glass">
                            <SelectValue placeholder="Selecione a destinação" />
                          </SelectTrigger>
                          <SelectContent>
                            {floraDestinacoes.map(d => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={addFloraItem}
                disabled={floraItems.length >= 50}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Espécie ({floraItems.length}/50)
              </Button>
            </div>
          </FormSection>
        )}

        {/* Card: Bens Apreendidos */}
        {ocorreuApreensao && (
          <FormSection title="Bens Apreendidos">
            <div className="space-y-4">
              {bensApreendidos.map((bem, index) => {
                const itemSelecionado = itensApreendidos.find(i => i.id === bem.itemId);
                return (
                  <div key={bem.id} className="p-4 rounded-lg border border-primary/10 bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Item {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBemApreendido(bem.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm">Item Apreendido</Label>
                        <Select 
                          value={bem.itemId} 
                          onValueChange={(v) => updateBemApreendido(bem.id, 'itemId', v)}
                        >
                          <SelectTrigger className="input-glass">
                            <SelectValue placeholder="Selecione o item" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(itensPorCategoria).map(([categoria, items]) => (
                              <div key={categoria}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                  {categoria}
                                </div>
                                {items.map(item => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.item} ({item.uso_ilicito})
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={bem.quantidade}
                          onChange={(e) => updateBemApreendido(bem.id, 'quantidade', parseInt(e.target.value) || 1)}
                          className="input-glass"
                        />
                      </div>

                      {itemSelecionado && (
                        <div className="md:col-span-3 text-xs text-muted-foreground">
                          <span className="font-medium">Uso ilícito:</span> {itemSelecionado.uso_ilicito} | 
                          <span className="font-medium ml-2">Categoria:</span> {itemSelecionado.categoria}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={addBemApreendido}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item Apreendido
              </Button>
            </div>
          </FormSection>
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

          {isFlagrante && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Procedimento Legal</Label>
              <Select value={procedimentoLegal} onValueChange={setProcedimentoLegal}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['TCO PMDF', 'TCO PCDF', 'Em Apuração PCDF', 'QT'].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

export default CrimesAmbientaisCadastro;
