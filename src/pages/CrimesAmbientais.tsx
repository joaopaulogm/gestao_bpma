import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { regioes } from '@/constants/regioes';

// Constants
const DESFECHOS = [
  "Em Apuração pela PCDF",
  "Em Monitoramento pela PMDF",
  "Averiguado e Nada Constatado",
  "Resolvido no Local",
  "Flagrante"
];

const PROCEDIMENTOS_LEGAIS = ["TCO-PMDF", "TCO-PCDF", "Em Apuração PCDF"];

const TIPOS_POLUICAO = [
  "Poluição atmosférica",
  "Poluição hídrica",
  "Poluição do solo",
  "Poluição sonora",
  "Poluição visual",
  "Descarte irregular de resíduos",
  "Queimada irregular",
  "Outro"
];

const INTENSIDADES = ["Baixa", "Moderada", "Alta", "Muito Alta"];

const TIPOS_INTERVENCAO = [
  "Construção irregular",
  "Desmatamento",
  "Terraplanagem",
  "Ocupação irregular",
  "Parcelamento irregular do solo",
  "Dano ao patrimônio histórico",
  "Outro"
];

const TIPOS_IMPEDIMENTO = [
  "Impedimento de fiscalização",
  "Obstrução de acesso",
  "Falsificação de documento",
  "Declaração falsa",
  "Outro"
];

const TIPOS_INDICIO = [
  "Rasura",
  "Falta de dado obrigatório",
  "Incoerência de informações",
  "Adulteração visível",
  "Outro"
];

const DESTINACOES_FAUNA = ["CETAS-IBAMA", "HFAUS-IBRAM", "Óbito"];

const CONDICOES_FLORA = [
  "Árvore em pé (viva)",
  "Árvore em pé (morta)",
  "Árvore caída",
  "Tora",
  "Lenha (achas)",
  "Carvão vegetal",
  "Muda",
  "Outro"
];

const DESTINACOES_FLORA = [
  "IBRAM/DF",
  "IBAMA",
  "DEPASA/DF",
  "Outro órgão ambiental competente",
  "Entregue a fiel depositário",
  "Mantido sob guarda do BPMA",
  "Reintroduzido no ambiente (quando autorizado)",
  "Destruído/descartado conforme autorização"
];

// Types
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

interface EspecieFauna {
  id: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  ordem_taxonomica: string;
  tipo_de_fauna: string;
  estado_de_conservacao: string;
}

interface EspecieFlora {
  id: string;
  "Nome Popular": string | null;
  "Nome Científico": string | null;
  "Classe": string | null;
  "Ordem": string | null;
  "Família": string | null;
  "Estado de Conservação": string | null;
  "Tipo de Planta": string | null;
  "Madeira de Lei": string | null;
  "Imune ao Corte": string | null;
}

interface EstadoSaude {
  id: string;
  nome: string;
}

interface EstagioVida {
  id: string;
  nome: string;
}

interface ItemApreensao {
  id: string;
  "Categoria": string | null;
  "Item": string | null;
  "Uso Ilicito": string | null;
  "Aplicacao": string | null;
}

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
  imuneCorte: string;
  condicao: string;
  quantidade: number;
  destinacao: string;
}

interface BemApreendido {
  id: string;
  itemId: string;
  categoria: string;
  item: string;
  quantidade: number;
}

const CrimesAmbientais: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Database options
  const [tiposCrime, setTiposCrime] = useState<TipoCrime[]>([]);
  const [enquadramentos, setEnquadramentos] = useState<Enquadramento[]>([]);
  const [enquadramentosFiltrados, setEnquadramentosFiltrados] = useState<Enquadramento[]>([]);
  const [tiposArea, setTiposArea] = useState<TipoArea[]>([]);
  const [especiesFauna, setEspeciesFauna] = useState<EspecieFauna[]>([]);
  const [especiesFlora, setEspeciesFlora] = useState<EspecieFlora[]>([]);
  const [estadosSaude, setEstadosSaude] = useState<EstadoSaude[]>([]);
  const [estagiosVida, setEstagiosVida] = useState<EstagioVida[]>([]);
  const [itensApreensao, setItensApreensao] = useState<ItemApreensao[]>([]);

  // Form arrays
  const [faunaItems, setFaunaItems] = useState<FaunaItem[]>([]);
  const [floraItems, setFloraItems] = useState<FloraItem[]>([]);
  const [bensApreendidos, setBensApreendidos] = useState<BemApreendido[]>([]);

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
    // Poluição
    tipoPoluicao: '',
    descricaoSituacaoPoluicao: '',
    materialVisivel: '',
    volumeAparente: '',
    origemAparente: '',
    animalAfetado: false,
    vegetacaoAfetada: false,
    alteracaoVisual: false,
    odorForte: false,
    mortandadeAnimais: false,
    riscoImediato: '',
    intensidadePercebida: '',
    // Ordenamento Urbano
    tipoIntervencaoIrregular: '',
    estruturasEncontradas: '',
    quantidadeEstruturas: 0,
    danoAlteracaoPerceptivel: '',
    maquinasPresentes: false,
    materialApreendidoUrbano: false,
    descricaoMaterialUrbano: '',
    // Administração Ambiental
    tipoImpedimentoObstrucao: '',
    descricaoAdministracao: '',
    documentoIndicioVisual: false,
    tipoIndicio: '',
    materialApreendidoAdmin: false,
    descricaoMaterialAdmin: '',
    veiculoRelacionado: false,
    // Flora
    numeroTermoEntregaFlora: '',
    // Desfecho
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
        const [
          tiposCrimeRes,
          enquadramentosRes,
          tiposAreaRes,
          especiesFaunaRes,
          especiesFloraRes,
          estadosSaudeRes,
          estagiosVidaRes,
          itensApreensaoRes
        ] = await Promise.all([
          supabase.from('dim_tipo_de_crime').select('*').order('Tipo de Crime'),
          supabase.from('dim_enquadramento').select('*').order('Enquadramento'),
          supabase.from('dim_tipo_de_area').select('*').order('Tipo de Área'),
          supabase.from('dim_especies_fauna').select('*').order('nome_popular'),
          supabase.from('dim_especies_flora').select('*').order('Nome Popular'),
          supabase.from('dim_estado_saude').select('*').order('nome'),
          supabase.from('dim_estagio_vida').select('*').order('nome'),
          supabase.from('dim_itens_apreensao').select('*').order('Categoria')
        ]);

        if (tiposCrimeRes.data) setTiposCrime(tiposCrimeRes.data);
        if (enquadramentosRes.data) setEnquadramentos(enquadramentosRes.data);
        if (tiposAreaRes.data) setTiposArea(tiposAreaRes.data);
        if (especiesFaunaRes.data) setEspeciesFauna(especiesFaunaRes.data);
        if (especiesFloraRes.data) setEspeciesFlora(especiesFloraRes.data);
        if (estadosSaudeRes.data) setEstadosSaude(estadosSaudeRes.data);
        if (estagiosVidaRes.data) setEstagiosVida(estagiosVidaRes.data);
        if (itensApreensaoRes.data) setItensApreensao(itensApreensaoRes.data);
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

  // Fauna handlers
  const addFaunaItem = () => {
    const newItem: FaunaItem = {
      id: crypto.randomUUID(),
      especieId: '',
      nomePopular: '',
      nomeCientifico: '',
      classeTaxonomica: '',
      ordemTaxonomica: '',
      tipoFauna: '',
      estadoConservacao: '',
      estadoSaudeId: '',
      estagioVidaId: '',
      atropelamento: 'Não',
      quantidadeAdulto: 0,
      quantidadeFilhote: 0,
      quantidadeTotal: 0,
      destinacao: '',
      quantidadeAdultoObito: 0,
      quantidadeFilhoteObito: 0,
      quantidadeTotalObito: 0
    };
    setFaunaItems(prev => [...prev, newItem]);
  };

  const updateFaunaItem = (id: string, field: string, value: any) => {
    setFaunaItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      
      // Auto-fill species data
      if (field === 'especieId' && value) {
        const especie = especiesFauna.find(e => e.id === value);
        if (especie) {
          updated.nomePopular = especie.nome_popular;
          updated.nomeCientifico = especie.nome_cientifico;
          updated.classeTaxonomica = especie.classe_taxonomica;
          updated.ordemTaxonomica = especie.ordem_taxonomica;
          updated.tipoFauna = especie.tipo_de_fauna;
          updated.estadoConservacao = especie.estado_de_conservacao;
        }
      }
      
      // Calculate totals
      if (field === 'quantidadeAdulto' || field === 'quantidadeFilhote') {
        updated.quantidadeTotal = (updated.quantidadeAdulto || 0) + (updated.quantidadeFilhote || 0);
      }
      if (field === 'quantidadeAdultoObito' || field === 'quantidadeFilhoteObito') {
        updated.quantidadeTotalObito = (updated.quantidadeAdultoObito || 0) + (updated.quantidadeFilhoteObito || 0);
      }
      
      return updated;
    }));
  };

  const removeFaunaItem = (id: string) => {
    setFaunaItems(prev => prev.filter(item => item.id !== id));
  };

  // Flora handlers
  const addFloraItem = () => {
    const newItem: FloraItem = {
      id: crypto.randomUUID(),
      especieId: '',
      nomePopular: '',
      nomeCientifico: '',
      classe: '',
      ordem: '',
      familia: '',
      estadoConservacao: '',
      tipoPlanta: '',
      madeiraLei: '',
      imuneCorte: '',
      condicao: '',
      quantidade: 1,
      destinacao: ''
    };
    setFloraItems(prev => [...prev, newItem]);
  };

  const updateFloraItem = (id: string, field: string, value: any) => {
    setFloraItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      
      // Auto-fill species data
      if (field === 'especieId' && value) {
        const especie = especiesFlora.find(e => e.id === value);
        if (especie) {
          updated.nomePopular = especie["Nome Popular"] || '';
          updated.nomeCientifico = especie["Nome Científico"] || '';
          updated.classe = especie["Classe"] || '';
          updated.ordem = especie["Ordem"] || '';
          updated.familia = especie["Família"] || '';
          updated.estadoConservacao = especie["Estado de Conservação"] || '';
          updated.tipoPlanta = especie["Tipo de Planta"] || '';
          updated.madeiraLei = especie["Madeira de Lei"] || '';
          updated.imuneCorte = especie["Imune ao Corte"] || '';
        }
      }
      
      return updated;
    }));
  };

  const removeFloraItem = (id: string) => {
    setFloraItems(prev => prev.filter(item => item.id !== id));
  };

  // Bens apreendidos handlers
  const addBemApreendido = () => {
    const newItem: BemApreendido = {
      id: crypto.randomUUID(),
      itemId: '',
      categoria: '',
      item: '',
      quantidade: 1
    };
    setBensApreendidos(prev => [...prev, newItem]);
  };

  const updateBemApreendido = (id: string, field: string, value: any) => {
    setBensApreendidos(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      
      if (field === 'itemId' && value) {
        const itemApreensao = itensApreensao.find(i => i.id === value);
        if (itemApreensao) {
          updated.categoria = itemApreensao["Categoria"] || '';
          updated.item = itemApreensao["Item"] || '';
        }
      }
      
      return updated;
    }));
  };

  const removeBemApreendido = (id: string) => {
    setBensApreendidos(prev => prev.filter(item => item.id !== id));
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
      const { data: regiaoData } = await supabase
        .from('dim_regiao_administrativa')
        .select('id')
        .eq('nome', formData.regiaoAdministrativa)
        .maybeSingle();

      const tipoCrimeSelecionado = tiposCrime.find(t => t["Tipo de Crime"] === formData.tipoCrime);
      const enquadramentoSelecionado = enquadramentosFiltrados.find(e => e["Enquadramento"] === formData.enquadramento);

      const baseRecord = {
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
        // Poluição
        tipo_poluicao: formData.tipoPoluicao || null,
        descricao_situacao_poluicao: formData.descricaoSituacaoPoluicao || null,
        material_visivel: formData.materialVisivel || null,
        volume_aparente: formData.volumeAparente || null,
        origem_aparente: formData.origemAparente || null,
        animal_afetado: formData.animalAfetado,
        vegetacao_afetada: formData.vegetacaoAfetada,
        alteracao_visual: formData.alteracaoVisual,
        odor_forte: formData.odorForte,
        mortandade_animais: formData.mortandadeAnimais,
        risco_imediato: formData.riscoImediato || null,
        intensidade_percebida: formData.intensidadePercebida || null,
        // Ordenamento Urbano
        tipo_intervencao_irregular: formData.tipoIntervencaoIrregular || null,
        estruturas_encontradas: formData.estruturasEncontradas || null,
        quantidade_estruturas: formData.quantidadeEstruturas,
        dano_alteracao_perceptivel: formData.danoAlteracaoPerceptivel || null,
        maquinas_presentes: formData.maquinasPresentes,
        material_apreendido_urbano: formData.materialApreendidoUrbano,
        descricao_material_urbano: formData.descricaoMaterialUrbano || null,
        // Administração Ambiental
        tipo_impedimento_obstrucao: formData.tipoImpedimentoObstrucao || null,
        descricao_administracao: formData.descricaoAdministracao || null,
        documento_indicio_visual: formData.documentoIndicioVisual,
        tipo_indicio: formData.tipoIndicio || null,
        material_apreendido_admin: formData.materialApreendidoAdmin,
        descricao_material_admin: formData.descricaoMaterialAdmin || null,
        veiculo_relacionado: formData.veiculoRelacionado
      };

      const tipoCrimeLower = formData.tipoCrime?.toLowerCase() || '';
      const isCrimeContraFauna = tipoCrimeLower.includes('fauna');
      const isCrimeContraFlora = tipoCrimeLower.includes('flora');

      if (isCrimeContraFauna && faunaItems.length > 0) {
        for (const item of faunaItems) {
          const faunaRecord = {
            ...baseRecord,
            tipo_registro: 'fauna',
            especie_fauna_id: item.especieId || null,
            nome_popular_fauna: item.nomePopular || null,
            nome_cientifico_fauna: item.nomeCientifico || null,
            classe_taxonomica: item.classeTaxonomica || null,
            ordem_taxonomica: item.ordemTaxonomica || null,
            tipo_fauna: item.tipoFauna || null,
            estado_conservacao_fauna: item.estadoConservacao || null,
            estado_saude_id: item.estadoSaudeId || null,
            estagio_vida_id: item.estagioVidaId || null,
            atropelamento: item.atropelamento || null,
            quantidade_adulto: item.quantidadeAdulto,
            quantidade_filhote: item.quantidadeFilhote,
            quantidade_total: item.quantidadeTotal,
            destinacao_fauna: item.destinacao || null,
            quantidade_adulto_obito: item.quantidadeAdultoObito,
            quantidade_filhote_obito: item.quantidadeFilhoteObito,
            quantidade_total_obito: item.quantidadeTotalObito
          };

          const { data: insertedRecord, error } = await supabase
            .from('fat_registros_de_crime')
            .insert(faunaRecord)
            .select('id')
            .single();

          if (error) throw error;

          // Insert seized items
          if (formData.ocorreuApreensao && bensApreendidos.length > 0 && insertedRecord) {
            for (const bem of bensApreendidos) {
              if (bem.itemId) {
                await supabase.from('fat_ocorrencia_apreensao').insert({
                  ocorrencia_id: insertedRecord.id,
                  item_id: bem.itemId,
                  quantidade: bem.quantidade
                });
              }
            }
          }
        }
      } else if (isCrimeContraFlora && floraItems.length > 0) {
        for (const item of floraItems) {
          const floraRecord = {
            ...baseRecord,
            tipo_registro: 'flora',
            especie_flora_id: item.especieId || null,
            nome_popular_flora: item.nomePopular || null,
            nome_cientifico_flora: item.nomeCientifico || null,
            classe_flora: item.classe || null,
            ordem_flora: item.ordem || null,
            familia_flora: item.familia || null,
            estado_conservacao_flora: item.estadoConservacao || null,
            tipo_planta: item.tipoPlanta || null,
            madeira_lei: item.madeiraLei || null,
            imune_corte: item.imuneCorte || null,
            condicao_flora: item.condicao || null,
            quantidade_flora: item.quantidade,
            destinacao_flora: item.destinacao || null,
            numero_termo_entrega: formData.numeroTermoEntregaFlora || null
          };

          const { data: insertedRecord, error } = await supabase
            .from('fat_registros_de_crime')
            .insert(floraRecord)
            .select('id')
            .single();

          if (error) throw error;

          if (formData.ocorreuApreensao && bensApreendidos.length > 0 && insertedRecord) {
            for (const bem of bensApreendidos) {
              if (bem.itemId) {
                await supabase.from('fat_ocorrencia_apreensao').insert({
                  ocorrencia_id: insertedRecord.id,
                  item_id: bem.itemId,
                  quantidade: bem.quantidade
                });
              }
            }
          }
        }
      } else {
        const { data: insertedRecord, error } = await supabase
          .from('fat_registros_de_crime')
          .insert({ ...baseRecord, tipo_registro: 'outro' })
          .select('id')
          .single();

        if (error) throw error;

        if (formData.ocorreuApreensao && bensApreendidos.length > 0 && insertedRecord) {
          for (const bem of bensApreendidos) {
            if (bem.itemId) {
              await supabase.from('fat_ocorrencia_apreensao').insert({
                ocorrencia_id: insertedRecord.id,
                item_id: bem.itemId,
                quantidade: bem.quantidade
              });
            }
          }
        }
      }

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
        tipoPoluicao: '',
        descricaoSituacaoPoluicao: '',
        materialVisivel: '',
        volumeAparente: '',
        origemAparente: '',
        animalAfetado: false,
        vegetacaoAfetada: false,
        alteracaoVisual: false,
        odorForte: false,
        mortandadeAnimais: false,
        riscoImediato: '',
        intensidadePercebida: '',
        tipoIntervencaoIrregular: '',
        estruturasEncontradas: '',
        quantidadeEstruturas: 0,
        danoAlteracaoPerceptivel: '',
        maquinasPresentes: false,
        materialApreendidoUrbano: false,
        descricaoMaterialUrbano: '',
        tipoImpedimentoObstrucao: '',
        descricaoAdministracao: '',
        documentoIndicioVisual: false,
        tipoIndicio: '',
        materialApreendidoAdmin: false,
        descricaoMaterialAdmin: '',
        veiculoRelacionado: false,
        numeroTermoEntregaFlora: '',
        desfecho: '',
        procedimentoLegal: '',
        quantidadeDetidosMaiorIdade: 0,
        quantidadeDetidosMenorIdade: 0,
        quantidadeLiberadosMaiorIdade: 0,
        quantidadeLiberadosMenorIdade: 0
      });
      setFaunaItems([]);
      setFloraItems([]);
      setBensApreendidos([]);

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
  const isCrimePoluicao = tipoCrimeLower.includes('poluição') || tipoCrimeLower.includes('poluicao');
  const isCrimeOrdenamento = tipoCrimeLower.includes('ordenamento') || tipoCrimeLower.includes('patrimônio');
  const isCrimeAdministracao = tipoCrimeLower.includes('administração') || tipoCrimeLower.includes('administracao');

  // Group items by category for the seizure items select
  const categorias = [...new Set(itensApreensao.map(i => i["Categoria"]).filter(Boolean))];

  return (
    <Layout title="Ocorrências Crimes Ambientais" showBackButton>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Informações Gerais */}
          <Section title="Informações Gerais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Data" required>
                <Input type="date" value={formData.data} onChange={(e) => handleChange('data', e.target.value)} />
              </Field>

              <Field label="Região Administrativa" required>
                <Select value={formData.regiaoAdministrativa} onValueChange={(v) => handleChange('regiaoAdministrativa', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {regioes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Tipo de Área">
                <Select value={formData.tipoAreaId} onValueChange={(v) => handleChange('tipoAreaId', v)} disabled={isLoading}>
                  <SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione"} /></SelectTrigger>
                  <SelectContent>
                    {tiposArea.map((t) => <SelectItem key={t.id} value={t.id}>{t["Tipo de Área"]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Latitude">
                <Input placeholder="-15.7801" value={formData.latitudeOcorrencia} onChange={(e) => handleChange('latitudeOcorrencia', e.target.value)} />
              </Field>

              <Field label="Longitude">
                <Input placeholder="-47.9292" value={formData.longitudeOcorrencia} onChange={(e) => handleChange('longitudeOcorrencia', e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* Classificação do Crime */}
          <Section title="Classificação do Crime">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tipo de Crime" required>
                <Select
                  value={formData.tipoCrime}
                  onValueChange={(v) => {
                    handleChange('tipoCrime', v);
                    handleChange('enquadramento', '');
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione"} /></SelectTrigger>
                  <SelectContent>
                    {tiposCrime.map((t) => <SelectItem key={t.id_tipo_de_crime} value={t["Tipo de Crime"] || ''}>{t["Tipo de Crime"]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              {formData.tipoCrime && (
                <Field label="Enquadramento" required>
                  <Select value={formData.enquadramento} onValueChange={(v) => handleChange('enquadramento', v)} disabled={enquadramentosFiltrados.length === 0}>
                    <SelectTrigger><SelectValue placeholder={enquadramentosFiltrados.length === 0 ? "Nenhum disponível" : "Selecione"} /></SelectTrigger>
                    <SelectContent>
                      {enquadramentosFiltrados.map((e) => <SelectItem key={e.id_enquadramento} value={e["Enquadramento"] || ''}>{e["Enquadramento"]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </div>
          </Section>

          {/* Ocorreu Apreensão */}
          {formData.enquadramento && (
            <Section>
              <div className="flex items-center gap-4">
                <Switch checked={formData.ocorreuApreensao} onCheckedChange={(c) => handleChange('ocorreuApreensao', c)} />
                <div>
                  <Label className="text-base font-semibold">Ocorreu Apreensão?</Label>
                  <p className="text-sm text-muted-foreground">Marque se houve apreensão de animais, flora ou itens</p>
                </div>
              </div>
            </Section>
          )}

          {/* Seção de Poluição */}
          {isCrimePoluicao && formData.enquadramento && (
            <Section title="Informações Específicas – Crime de Poluição">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Tipo de Poluição">
                  <Select value={formData.tipoPoluicao} onValueChange={(v) => handleChange('tipoPoluicao', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_POLUICAO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Intensidade Percebida">
                  <Select value={formData.intensidadePercebida} onValueChange={(v) => handleChange('intensidadePercebida', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {INTENSIDADES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Descrição da Situação">
                    <Textarea value={formData.descricaoSituacaoPoluicao} onChange={(e) => handleChange('descricaoSituacaoPoluicao', e.target.value)} rows={3} />
                  </Field>
                </div>

                <Field label="Material Visível">
                  <Input value={formData.materialVisivel} onChange={(e) => handleChange('materialVisivel', e.target.value)} />
                </Field>

                <Field label="Volume Aparente">
                  <Input value={formData.volumeAparente} onChange={(e) => handleChange('volumeAparente', e.target.value)} />
                </Field>

                <Field label="Origem Aparente">
                  <Input value={formData.origemAparente} onChange={(e) => handleChange('origemAparente', e.target.value)} />
                </Field>

                <Field label="Risco Imediato">
                  <Select value={formData.riscoImediato} onValueChange={(v) => handleChange('riscoImediato', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <SwitchField label="Animal Afetado" checked={formData.animalAfetado} onChange={(c) => handleChange('animalAfetado', c)} />
                <SwitchField label="Vegetação Afetada" checked={formData.vegetacaoAfetada} onChange={(c) => handleChange('vegetacaoAfetada', c)} />
                <SwitchField label="Alteração Visual" checked={formData.alteracaoVisual} onChange={(c) => handleChange('alteracaoVisual', c)} />
                <SwitchField label="Odor Forte" checked={formData.odorForte} onChange={(c) => handleChange('odorForte', c)} />
                <SwitchField label="Mortandade de Animais" checked={formData.mortandadeAnimais} onChange={(c) => handleChange('mortandadeAnimais', c)} />
              </div>
            </Section>
          )}

          {/* Seção Ordenamento Urbano */}
          {isCrimeOrdenamento && formData.enquadramento && (
            <Section title="Informações Específicas – Ordenamento Urbano / Patrimônio">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Tipo de Intervenção Irregular">
                  <Select value={formData.tipoIntervencaoIrregular} onValueChange={(v) => handleChange('tipoIntervencaoIrregular', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_INTERVENCAO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Estruturas Encontradas">
                  <Input value={formData.estruturasEncontradas} onChange={(e) => handleChange('estruturasEncontradas', e.target.value)} />
                </Field>

                <Field label="Quantidade de Estruturas">
                  <Input type="number" min={0} value={formData.quantidadeEstruturas} onChange={(e) => handleChange('quantidadeEstruturas', parseInt(e.target.value) || 0)} />
                </Field>

                <Field label="Dano ou Alteração Perceptível">
                  <Select value={formData.danoAlteracaoPerceptivel} onValueChange={(v) => handleChange('danoAlteracaoPerceptivel', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <SwitchField label="Máquinas Presentes" checked={formData.maquinasPresentes} onChange={(c) => handleChange('maquinasPresentes', c)} />
                <SwitchField label="Material Apreendido" checked={formData.materialApreendidoUrbano} onChange={(c) => handleChange('materialApreendidoUrbano', c)} />
              </div>

              {formData.materialApreendidoUrbano && (
                <div className="mt-4">
                  <Field label="Descrição do Material">
                    <Input value={formData.descricaoMaterialUrbano} onChange={(e) => handleChange('descricaoMaterialUrbano', e.target.value)} />
                  </Field>
                </div>
              )}
            </Section>
          )}

          {/* Seção Administração Ambiental */}
          {isCrimeAdministracao && formData.enquadramento && (
            <Section title="Informações Específicas – Administração Ambiental">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Tipo de Impedimento/Obstrução">
                  <Select value={formData.tipoImpedimentoObstrucao} onValueChange={(v) => handleChange('tipoImpedimentoObstrucao', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_IMPEDIMENTO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Descrição">
                    <Textarea value={formData.descricaoAdministracao} onChange={(e) => handleChange('descricaoAdministracao', e.target.value)} rows={3} />
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <SwitchField label="Documento c/ Indício Visual" checked={formData.documentoIndicioVisual} onChange={(c) => handleChange('documentoIndicioVisual', c)} />
                <SwitchField label="Material Apreendido" checked={formData.materialApreendidoAdmin} onChange={(c) => handleChange('materialApreendidoAdmin', c)} />
                <SwitchField label="Veículo Relacionado" checked={formData.veiculoRelacionado} onChange={(c) => handleChange('veiculoRelacionado', c)} />
              </div>

              {formData.documentoIndicioVisual && (
                <div className="mt-4">
                  <Field label="Tipo de Indício">
                    <Select value={formData.tipoIndicio} onValueChange={(v) => handleChange('tipoIndicio', v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {TIPOS_INDICIO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}

              {formData.materialApreendidoAdmin && (
                <div className="mt-4">
                  <Field label="Descrição do Material">
                    <Input value={formData.descricaoMaterialAdmin} onChange={(e) => handleChange('descricaoMaterialAdmin', e.target.value)} />
                  </Field>
                </div>
              )}
            </Section>
          )}

          {/* Seção Fauna */}
          {isCrimeContraFauna && formData.enquadramento && (
            <Section title="Identificação das Espécies de Fauna">
              {faunaItems.map((item, index) => (
                <div key={item.id} className="border border-border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Animal #{index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFaunaItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Espécie">
                      <Select value={item.especieId} onValueChange={(v) => updateFaunaItem(item.id, 'especieId', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione a espécie" /></SelectTrigger>
                        <SelectContent>
                          {especiesFauna.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome_popular}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>

                    {item.especieId && (
                      <>
                        <Field label="Nome Científico">
                          <Input value={item.nomeCientifico} disabled className="bg-muted" />
                        </Field>
                        <Field label="Classe Taxonômica">
                          <Input value={item.classeTaxonomica} disabled className="bg-muted" />
                        </Field>
                        <Field label="Estado de Conservação">
                          <Input value={item.estadoConservacao} disabled className="bg-muted" />
                        </Field>
                      </>
                    )}

                    <Field label="Estado de Saúde">
                      <Select value={item.estadoSaudeId} onValueChange={(v) => updateFaunaItem(item.id, 'estadoSaudeId', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {estadosSaude.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Estágio de Vida">
                      <Select value={item.estagioVidaId} onValueChange={(v) => updateFaunaItem(item.id, 'estagioVidaId', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {estagiosVida.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Atropelamento">
                      <Select value={item.atropelamento} onValueChange={(v) => updateFaunaItem(item.id, 'atropelamento', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sim">Sim</SelectItem>
                          <SelectItem value="Não">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Qtd Adultos">
                      <Input type="number" min={0} value={item.quantidadeAdulto} onChange={(e) => updateFaunaItem(item.id, 'quantidadeAdulto', parseInt(e.target.value) || 0)} />
                    </Field>

                    <Field label="Qtd Filhotes">
                      <Input type="number" min={0} value={item.quantidadeFilhote} onChange={(e) => updateFaunaItem(item.id, 'quantidadeFilhote', parseInt(e.target.value) || 0)} />
                    </Field>

                    <Field label="Quantidade Total">
                      <Input type="number" value={item.quantidadeTotal} disabled className="bg-muted" />
                    </Field>

                    <Field label="Destinação">
                      <Select value={item.destinacao} onValueChange={(v) => updateFaunaItem(item.id, 'destinacao', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {DESTINACOES_FAUNA.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {item.destinacao === 'Óbito' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                      <Field label="Adultos Óbito">
                        <Input type="number" min={0} value={item.quantidadeAdultoObito} onChange={(e) => updateFaunaItem(item.id, 'quantidadeAdultoObito', parseInt(e.target.value) || 0)} />
                      </Field>
                      <Field label="Filhotes Óbito">
                        <Input type="number" min={0} value={item.quantidadeFilhoteObito} onChange={(e) => updateFaunaItem(item.id, 'quantidadeFilhoteObito', parseInt(e.target.value) || 0)} />
                      </Field>
                      <Field label="Total Óbito">
                        <Input type="number" value={item.quantidadeTotalObito} disabled className="bg-muted" />
                      </Field>
                    </div>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addFaunaItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Animal
              </Button>
            </Section>
          )}

          {/* Seção Flora */}
          {isCrimeContraFlora && formData.enquadramento && (
            <Section title="Identificação das Espécies de Flora">
              {floraItems.map((item, index) => (
                <div key={item.id} className="border border-border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Espécie #{index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFloraItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Espécie">
                      <Select value={item.especieId} onValueChange={(v) => updateFloraItem(item.id, 'especieId', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione a espécie" /></SelectTrigger>
                        <SelectContent>
                          {especiesFlora.map((e) => <SelectItem key={e.id} value={e.id}>{e["Nome Popular"]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>

                    {item.especieId && (
                      <>
                        <Field label="Nome Científico">
                          <Input value={item.nomeCientifico} disabled className="bg-muted" />
                        </Field>
                        <Field label="Classe">
                          <Input value={item.classe} disabled className="bg-muted" />
                        </Field>
                        <Field label="Estado de Conservação">
                          <Input value={item.estadoConservacao} disabled className="bg-muted" />
                        </Field>
                      </>
                    )}

                    <Field label="Condição">
                      <Select value={item.condicao} onValueChange={(v) => updateFloraItem(item.id, 'condicao', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {CONDICOES_FLORA.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Quantidade">
                      <Input type="number" min={1} value={item.quantidade} onChange={(e) => updateFloraItem(item.id, 'quantidade', parseInt(e.target.value) || 1)} />
                    </Field>

                    <Field label="Destinação">
                      <Select value={item.destinacao} onValueChange={(v) => updateFloraItem(item.id, 'destinacao', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {DESTINACOES_FLORA.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addFloraItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Espécie de Flora
              </Button>

              <div className="mt-4">
                <Field label="Nº Termo de Entrega">
                  <Input value={formData.numeroTermoEntregaFlora} onChange={(e) => handleChange('numeroTermoEntregaFlora', e.target.value)} />
                </Field>
              </div>
            </Section>
          )}

          {/* Bens Apreendidos */}
          {formData.ocorreuApreensao && formData.enquadramento && (
            <Section title="Bens Apreendidos">
              {bensApreendidos.map((bem, index) => (
                <div key={bem.id} className="border border-border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Item #{index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeBemApreendido(bem.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Item">
                      <Select value={bem.itemId} onValueChange={(v) => updateBemApreendido(bem.id, 'itemId', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione o item" /></SelectTrigger>
                        <SelectContent>
                          {categorias.map((cat) => (
                            <React.Fragment key={cat}>
                              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{cat}</div>
                              {itensApreensao.filter(i => i["Categoria"] === cat).map((item) => (
                                <SelectItem key={item.id} value={item.id}>{item["Item"]}</SelectItem>
                              ))}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Quantidade">
                      <Input type="number" min={1} value={bem.quantidade} onChange={(e) => updateBemApreendido(bem.id, 'quantidade', parseInt(e.target.value) || 1)} />
                    </Field>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addBemApreendido} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Item Apreendido
              </Button>
            </Section>
          )}

          {/* Desfecho */}
          <Section title="Desfecho">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Desfecho" required>
                <Select
                  value={formData.desfecho}
                  onValueChange={(v) => {
                    handleChange('desfecho', v);
                    if (v !== 'Flagrante') handleChange('procedimentoLegal', '');
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {DESFECHOS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              {formData.desfecho === 'Flagrante' && (
                <Field label="Procedimento Legal" required>
                  <Select value={formData.procedimentoLegal} onValueChange={(v) => handleChange('procedimentoLegal', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {PROCEDIMENTOS_LEGAIS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </div>
          </Section>

          {/* Quantidade de Envolvidos */}
          <Section title="Quantidade de Envolvidos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Detidos Maior de Idade">
                <Input type="number" min={0} max={1000} value={formData.quantidadeDetidosMaiorIdade} onChange={(e) => handleChange('quantidadeDetidosMaiorIdade', parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Detidos Menor de Idade">
                <Input type="number" min={0} max={1000} value={formData.quantidadeDetidosMenorIdade} onChange={(e) => handleChange('quantidadeDetidosMenorIdade', parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Liberados Maior de Idade">
                <Input type="number" min={0} max={1000} value={formData.quantidadeLiberadosMaiorIdade} onChange={(e) => handleChange('quantidadeLiberadosMaiorIdade', parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Liberados Menor de Idade">
                <Input type="number" min={0} max={1000} value={formData.quantidadeLiberadosMenorIdade} onChange={(e) => handleChange('quantidadeLiberadosMenorIdade', parseInt(e.target.value) || 0)} />
              </Field>
            </div>
          </Section>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="mr-2 h-5 w-5" /> Salvar Ocorrência</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

// Helper Components
const Section: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
    {title && (
      <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h3>
    )}
    {children}
  </div>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="space-y-2">
    <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
    {children}
  </div>
);

const SwitchField: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2">
    <Switch checked={checked} onCheckedChange={onChange} />
    <Label className="cursor-pointer">{label}</Label>
  </div>
);

export default CrimesAmbientais;
