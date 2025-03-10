
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// Initialize Supabase client
const supabaseUrl = 'https://oiwwptnqaunsyhpkwbrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de regiões administrativas
const regioes = [
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

const ResgateCadastro = () => {
  const [formData, setFormData] = useState({
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
  });

  const [especiesLista, setEspeciesLista] = useState<any[]>([]);
  const [regiaoFiltrada, setRegiaoFiltrada] = useState('');
  const [regioesExibidas, setRegioesExibidas] = useState(regioes);
  const [loading, setLoading] = useState(false);

  // Carregar lista de espécies com base na classe taxonômica selecionada
  useEffect(() => {
    const buscarEspecies = async () => {
      if (!formData.classeTaxonomica) return;
      
      setLoading(true);
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
          toast.error(`Erro ao carregar lista de espécies: ${error.message}`);
        } else {
          console.log('Espécies carregadas:', data?.length || 0);
          console.log('Exemplo de espécie:', data?.[0]);
          setEspeciesLista(data || []);
        }
      } catch (err) {
        console.error('Exceção ao buscar espécies:', err);
        toast.error('Ocorreu um erro ao carregar a lista de espécies');
      } finally {
        setLoading(false);
      }
    };
    
    buscarEspecies();
  }, [formData.classeTaxonomica]);

  // Filtrar regiões administrativas
  useEffect(() => {
    if (regiaoFiltrada) {
      const filtradas = regioes.filter(regiao => 
        regiao.toLowerCase().includes(regiaoFiltrada.toLowerCase())
      );
      setRegioesExibidas(filtradas);
    } else {
      setRegioesExibidas(regioes);
    }
  }, [regiaoFiltrada]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'classeTaxonomica') {
      // Resetar nome popular quando mudar classe taxonômica
      setFormData(prev => ({ ...prev, [name]: value, nomePopular: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRegiaoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegiaoFiltrada(value);
    setFormData(prev => ({ ...prev, regiaoAdministrativa: value }));
  };

  const handleRegiaoSelect = (value: string) => {
    setFormData(prev => ({ ...prev, regiaoAdministrativa: value }));
    setRegiaoFiltrada('');
  };

  const handleQuantidadeChange = (operacao: 'aumentar' | 'diminuir') => {
    setFormData(prev => ({
      ...prev,
      quantidade: operacao === 'aumentar' 
        ? prev.quantidade + 1 
        : Math.max(1, prev.quantidade - 1)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    toast.success('Registro de resgate cadastrado com sucesso!');
    // Resetar formulário após envio
    setFormData({
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
    });
  };

  return (
    <Layout title="Registro de Atividade de Resgate de Fauna" showBackButton>
      <div className="bg-white rounded-lg border border-fauna-border p-6 animate-fade-in">
        <h2 className="text-lg text-gray-600 mb-6">Preencha os dados do registro de atividade</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              placeholder="DD/MM/AAAA"
              required
            />
          </div>
          
          {/* Região Administrativa */}
          <div className="space-y-2">
            <Label htmlFor="regiaoAdministrativa">Região Administrativa</Label>
            <div className="relative">
              <Input
                id="regiaoAdministrativa"
                name="regiaoAdministrativa"
                value={formData.regiaoAdministrativa}
                onChange={handleRegiaoInputChange}
                placeholder="Digite para buscar ou selecione uma região"
                autoComplete="off"
                required
              />
              {regiaoFiltrada && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto">
                  {regioesExibidas.map((regiao) => (
                    <div 
                      key={regiao} 
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRegiaoSelect(regiao)}
                    >
                      {regiao}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Origem */}
          <div className="space-y-2">
            <Label htmlFor="origem">Origem</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('origem', value)}
              value={formData.origem}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Resgate de Fauna">Resgate de Fauna</SelectItem>
                <SelectItem value="Apreensão">Apreensão</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Coordenadas de Origem (condicional) */}
          {(formData.origem === 'Resgate de Fauna' || formData.origem === 'Apreensão') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitudeOrigem">Latitude do {formData.origem} (DD - Decimal Degres)</Label>
                <Input
                  id="latitudeOrigem"
                  name="latitudeOrigem"
                  value={formData.latitudeOrigem}
                  onChange={handleChange}
                  placeholder="Ex: -15.7801"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitudeOrigem">Longitude do {formData.origem} (DD - Decimal Degres)</Label>
                <Input
                  id="longitudeOrigem"
                  name="longitudeOrigem"
                  value={formData.longitudeOrigem}
                  onChange={handleChange}
                  placeholder="Ex: -47.9292"
                  required
                />
              </div>
            </div>
          )}
          
          {/* Desfecho da Apreensão (condicional) */}
          {formData.origem === 'Apreensão' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desfechoApreensao">Desfecho da Apreensão</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('desfechoApreensao', value)}
                  value={formData.desfechoApreensao}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o desfecho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TCO PMDF">TCO PMDF</SelectItem>
                    <SelectItem value="TCO PCDF">TCO PCDF</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.desfechoApreensao === 'TCO PMDF' && (
                <div className="space-y-2">
                  <Label htmlFor="numeroTCO">Nº TCO PMDF</Label>
                  <Input
                    id="numeroTCO"
                    name="numeroTCO"
                    value={formData.numeroTCO}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              
              {formData.desfechoApreensao === 'TCO PCDF' && (
                <div className="space-y-2">
                  <Label htmlFor="numeroTCO">Nº TCO PCDF</Label>
                  <Input
                    id="numeroTCO"
                    name="numeroTCO"
                    value={formData.numeroTCO}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              
              {formData.desfechoApreensao === 'Outros' && (
                <div className="space-y-2">
                  <Label htmlFor="outroDesfecho">Descreva o Desfecho</Label>
                  <Textarea
                    id="outroDesfecho"
                    name="outroDesfecho"
                    value={formData.outroDesfecho}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Estado de Saúde */}
          <div className="space-y-2">
            <Label htmlFor="estadoSaude">Estado de Saúde</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('estadoSaude', value)}
              value={formData.estadoSaude}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado de saúde" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Saudável">Saudável</SelectItem>
                <SelectItem value="Ferido">Ferido</SelectItem>
                <SelectItem value="Debilitado">Debilitado</SelectItem>
                <SelectItem value="Óbito">Óbito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Atropelamento */}
          <div className="space-y-2">
            <Label>Animal sofreu atropelamento?</Label>
            <RadioGroup 
              value={formData.atropelamento} 
              onValueChange={(value) => handleSelectChange('atropelamento', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sim" id="atropelamento-sim" />
                <Label htmlFor="atropelamento-sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Não" id="atropelamento-nao" />
                <Label htmlFor="atropelamento-nao">Não</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Estágio da Vida */}
          <div className="space-y-2">
            <Label htmlFor="estagioVida">Estágio da Vida</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('estagioVida', value)}
              value={formData.estagioVida}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estágio da vida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Adulto">Adulto</SelectItem>
                <SelectItem value="Filhote">Filhote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                className="h-10 w-10 p-0"
                onClick={() => handleQuantidadeChange('diminuir')}
              >
                -
              </Button>
              <Input
                id="quantidade"
                name="quantidade"
                type="number"
                value={formData.quantidade}
                onChange={handleChange}
                className="text-center"
                min="1"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                className="h-10 w-10 p-0"
                onClick={() => handleQuantidadeChange('aumentar')}
              >
                +
              </Button>
            </div>
          </div>
          
          {/* Destinação */}
          <div className="space-y-2">
            <Label htmlFor="destinacao">Destinação</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('destinacao', value)}
              value={formData.destinacao}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a destinação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CETAS/IBAMA">CETAS/IBAMA</SelectItem>
                <SelectItem value="HFAUS/IBRAM">HFAUS/IBRAM</SelectItem>
                <SelectItem value="CEAPA/BPMA">CEAPA/BPMA</SelectItem>
                <SelectItem value="Soltura">Soltura</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Campos condicionais para Destinação */}
          {(formData.destinacao === 'CETAS/IBAMA' || formData.destinacao === 'HFAUS/IBRAM') && (
            <div className="space-y-2">
              <Label htmlFor="numeroTermoEntrega">Nº Termo de Entrega</Label>
              <Input
                id="numeroTermoEntrega"
                name="numeroTermoEntrega"
                value={formData.numeroTermoEntrega}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          {formData.destinacao === 'CEAPA/BPMA' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="horaGuardaCEAPA">Hora de Guarda no CEAPA</Label>
                <Input
                  id="horaGuardaCEAPA"
                  name="horaGuardaCEAPA"
                  value={formData.horaGuardaCEAPA}
                  onChange={handleChange}
                  placeholder="HH:MM (formato 24h)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivoEntregaCEAPA">Motivo</Label>
                <Textarea
                  id="motivoEntregaCEAPA"
                  name="motivoEntregaCEAPA"
                  value={formData.motivoEntregaCEAPA}
                  onChange={handleChange}
                  placeholder="Descreva o motivo da entrega"
                  required
                />
              </div>
            </div>
          )}
          
          {formData.destinacao === 'Soltura' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitudeSoltura">Latitude da Soltura (DD - Decimal Degres)</Label>
                <Input
                  id="latitudeSoltura"
                  name="latitudeSoltura"
                  value={formData.latitudeSoltura}
                  onChange={handleChange}
                  placeholder="Ex: -15.7801"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitudeSoltura">Longitude da Soltura (DD - Decimal Degres)</Label>
                <Input
                  id="longitudeSoltura"
                  name="longitudeSoltura"
                  value={formData.longitudeSoltura}
                  onChange={handleChange}
                  placeholder="Ex: -47.9292"
                  required
                />
              </div>
            </div>
          )}
          
          {formData.destinacao === 'Outros' && (
            <div className="space-y-2">
              <Label htmlFor="outroDestinacao">Especifique a Destinação</Label>
              <Textarea
                id="outroDestinacao"
                name="outroDestinacao"
                value={formData.outroDestinacao}
                onChange={handleChange}
                placeholder="Descreva a destinação"
                required
              />
            </div>
          )}
          
          {/* Classe Taxonômica */}
          <div className="space-y-2">
            <Label htmlFor="classeTaxonomica">Classe Taxonômica</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('classeTaxonomica', value)}
              value={formData.classeTaxonomica}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a classe taxonômica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ave">Ave</SelectItem>
                <SelectItem value="Mamífero">Mamífero</SelectItem>
                <SelectItem value="Réptil">Réptil</SelectItem>
                <SelectItem value="Peixe">Peixe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Nome Popular (condicional, baseado na classe taxonômica) */}
          {formData.classeTaxonomica && (
            <div className="space-y-2">
              <Label htmlFor="nomePopular">
                Nome Popular 
                {loading && <span className="ml-2 text-gray-500 text-sm">(Carregando...)</span>}
              </Label>
              <Select 
                onValueChange={(value) => handleSelectChange('nomePopular', value)}
                value={formData.nomePopular}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione a espécie de ${formData.classeTaxonomica.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {especiesLista.length > 0 ? (
                    especiesLista.map((especie, index) => (
                      <SelectItem key={index} value={especie.nome_popular}>
                        {especie.nome_popular}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      {loading ? 'Carregando espécies...' : 'Nenhuma espécie encontrada'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-fauna-blue hover:bg-opacity-90 text-white"
            >
              Salvar Registro
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ResgateCadastro;
