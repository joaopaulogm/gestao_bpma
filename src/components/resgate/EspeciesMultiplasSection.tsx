
import React, { useState, useEffect } from 'react';
import FormSection from './FormSection';
import FormField from './FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface EspecieItem {
  id: string;
  especieId: string;
  classeTaxonomica: string;
  nomeCientifico: string;
  ordemTaxonomica: string;
  estadoConservacao: string;
  tipoFauna: string;
  estadoSaude: string;
  atropelamento: string;
  estagioVida: string;
  quantidadeAdulto: number;
  quantidadeFilhote: number;
  quantidadeTotal: number;
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

interface DimensionItem {
  id: string;
  nome: string;
}

interface EspeciesMultiplasSectionProps {
  especies: EspecieItem[];
  onEspeciesChange: (especies: EspecieItem[]) => void;
  isEvadido?: boolean;
  errors?: any;
}

const EspeciesMultiplasSection: React.FC<EspeciesMultiplasSectionProps> = ({
  especies,
  onEspeciesChange,
  isEvadido = false,
  errors
}) => {
  const [especiesFauna, setEspeciesFauna] = useState<EspecieFauna[]>([]);
  const [classesTaxonomicas, setClassesTaxonomicas] = useState<string[]>([]);
  const [estadosSaude, setEstadosSaude] = useState<DimensionItem[]>([]);
  const [estagiosVida, setEstagiosVida] = useState<DimensionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [especiesRes, estadosSaudeRes, estagiosVidaRes] = await Promise.all([
          supabase.from('dim_especies_fauna').select('*').order('nome_popular', { ascending: true }),
          supabase.from('dim_estado_saude').select('id, nome').order('nome', { ascending: true }),
          supabase.from('dim_estagio_vida').select('id, nome').order('nome', { ascending: true })
        ]);

        if (especiesRes.data) {
          setEspeciesFauna(especiesRes.data);
          const classes = [...new Set(especiesRes.data.map(e => e.classe_taxonomica))].sort();
          setClassesTaxonomicas(classes);
        }
        if (estadosSaudeRes.data) setEstadosSaude(estadosSaudeRes.data);
        if (estagiosVidaRes.data) setEstagiosVida(estagiosVidaRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const getEspeciesPorClasse = (classe: string) => {
    return especiesFauna.filter(e => e.classe_taxonomica === classe);
  };

  const handleAddEspecie = () => {
    const novaEspecie: EspecieItem = {
      id: generateId(),
      especieId: '',
      classeTaxonomica: '',
      nomeCientifico: '',
      ordemTaxonomica: '',
      estadoConservacao: '',
      tipoFauna: '',
      estadoSaude: '',
      atropelamento: '',
      estagioVida: '',
      quantidadeAdulto: 0,
      quantidadeFilhote: 0,
      quantidadeTotal: 0
    };
    onEspeciesChange([...especies, novaEspecie]);
  };

  const handleRemoveEspecie = (id: string) => {
    onEspeciesChange(especies.filter(e => e.id !== id));
  };

  const handleEspecieChange = (id: string, field: keyof EspecieItem, value: string | number) => {
    const updated = especies.map(e => {
      if (e.id !== id) return e;

      const updatedEspecie = { ...e, [field]: value };

      // Se mudou a classe, limpa a espécie
      if (field === 'classeTaxonomica') {
        updatedEspecie.especieId = '';
        updatedEspecie.nomeCientifico = '';
        updatedEspecie.ordemTaxonomica = '';
        updatedEspecie.estadoConservacao = '';
        updatedEspecie.tipoFauna = '';
      }

      // Se selecionou uma espécie, preenche os detalhes
      if (field === 'especieId') {
        const especie = especiesFauna.find(ef => ef.id === value);
        if (especie) {
          updatedEspecie.nomeCientifico = especie.nome_cientifico;
          updatedEspecie.ordemTaxonomica = especie.ordem_taxonomica;
          updatedEspecie.estadoConservacao = especie.estado_de_conservacao;
          updatedEspecie.tipoFauna = especie.tipo_de_fauna;
        }
      }

      // Recalcula quantidade total
      if (field === 'quantidadeAdulto' || field === 'quantidadeFilhote') {
        const adultos = field === 'quantidadeAdulto' ? (value as number) : updatedEspecie.quantidadeAdulto;
        const filhotes = field === 'quantidadeFilhote' ? (value as number) : updatedEspecie.quantidadeFilhote;
        updatedEspecie.quantidadeTotal = adultos + filhotes;
      }

      return updatedEspecie;
    });
    onEspeciesChange(updated);
  };

  const handleQuantidadeChange = (id: string, tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => {
    const especie = especies.find(e => e.id === id);
    if (!especie) return;

    const field = tipo === 'adulto' ? 'quantidadeAdulto' : 'quantidadeFilhote';
    const currentValue = especie[field];
    const newValue = operacao === 'aumentar' ? currentValue + 1 : Math.max(0, currentValue - 1);
    handleEspecieChange(id, field, newValue);
  };

  return (
    <FormSection title="Identificação das Espécies">
      {isEvadido && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Como o desfecho é "Evadido", os campos nesta seção são opcionais.
              </p>
            </div>
          </div>
        </div>
      )}

      {especies.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma espécie adicionada. Clique no botão abaixo para adicionar.
        </div>
      )}

      {especies.map((especie, index) => (
        <div key={especie.id} className="border rounded-lg p-4 mb-4 bg-card">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-secondary">Espécie {index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveEspecie(especie.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField id={`classeTaxonomica-${especie.id}`} label="Classe Taxonômica" required={!isEvadido}>
              <Select
                value={especie.classeTaxonomica}
                onValueChange={(value) => handleEspecieChange(especie.id, 'classeTaxonomica', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Carregando..." : "Selecione a classe"} />
                </SelectTrigger>
                <SelectContent>
                  {classesTaxonomicas.map((classe) => (
                    <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id={`especieId-${especie.id}`} label="Espécie (Nome Popular)" required={!isEvadido}>
              <Select
                value={especie.especieId}
                onValueChange={(value) => handleEspecieChange(especie.id, 'especieId', value)}
                disabled={loading || !especie.classeTaxonomica}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!especie.classeTaxonomica ? "Selecione a classe primeiro" : "Selecione a espécie"} />
                </SelectTrigger>
                <SelectContent>
                  {getEspeciesPorClasse(especie.classeTaxonomica).map((ef) => (
                    <SelectItem key={ef.id} value={ef.id}>{ef.nome_popular}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id={`nomeCientifico-${especie.id}`} label="Nome Científico">
              <Input value={especie.nomeCientifico} readOnly className="bg-muted" />
            </FormField>

            <FormField id={`ordemTaxonomica-${especie.id}`} label="Ordem Taxonômica">
              <Input value={especie.ordemTaxonomica} readOnly className="bg-muted" />
            </FormField>

            <FormField id={`estadoConservacao-${especie.id}`} label="Estado de Conservação">
              <Input value={especie.estadoConservacao} readOnly className="bg-muted" />
            </FormField>

            <FormField id={`tipoFauna-${especie.id}`} label="Tipo de Fauna">
              <Input value={especie.tipoFauna} readOnly className="bg-muted" />
            </FormField>

            <FormField id={`estadoSaude-${especie.id}`} label="Estado de Saúde" required={!isEvadido}>
              <Select
                value={especie.estadoSaude}
                onValueChange={(value) => handleEspecieChange(especie.id, 'estadoSaude', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado de saúde" />
                </SelectTrigger>
                <SelectContent>
                  {estadosSaude.map((estado) => (
                    <SelectItem key={estado.id} value={estado.nome}>{estado.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id={`atropelamento-${especie.id}`} label="Atropelamento" required={!isEvadido}>
              <Select
                value={especie.atropelamento}
                onValueChange={(value) => handleEspecieChange(especie.id, 'atropelamento', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id={`estagioVida-${especie.id}`} label="Estágio da Vida" required={!isEvadido}>
              <Select
                value={especie.estagioVida}
                onValueChange={(value) => handleEspecieChange(especie.id, 'estagioVida', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estágio" />
                </SelectTrigger>
                <SelectContent>
                  {estagiosVida.map((estagio) => (
                    <SelectItem key={estagio.id} value={estagio.nome}>{estagio.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <FormField id={`quantidadeAdulto-${especie.id}`} label="Quantidade Adultos" required={!isEvadido}>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'adulto', 'diminuir')}
                  >
                    -
                  </Button>
                  <Input
                    value={especie.quantidadeAdulto}
                    readOnly
                    className="text-center w-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'adulto', 'aumentar')}
                  >
                    +
                  </Button>
                </div>
              </FormField>

              <FormField id={`quantidadeFilhote-${especie.id}`} label="Quantidade Filhotes" required={!isEvadido}>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'filhote', 'diminuir')}
                  >
                    -
                  </Button>
                  <Input
                    value={especie.quantidadeFilhote}
                    readOnly
                    className="text-center w-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'filhote', 'aumentar')}
                  >
                    +
                  </Button>
                </div>
              </FormField>

              <FormField id={`quantidadeTotal-${especie.id}`} label="Quantidade Total">
                <Input
                  value={especie.quantidadeTotal}
                  readOnly
                  className="bg-muted text-center font-semibold"
                />
              </FormField>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddEspecie}
        className="w-full mt-2 border-dashed border-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Espécie
      </Button>
    </FormSection>
  );
};

export default EspeciesMultiplasSection;
