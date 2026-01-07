import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, MapPin, Gavel, Users } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipoPenal {
  id: string;
  nome: string;
}

interface Regiao {
  id: string;
  nome: string;
}

interface TipoArea {
  id: string;
  "Tipo de Área": string;
}

interface Desfecho {
  id: string;
  nome: string;
}

const CrimesComuns: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dimension data
  const [tiposPenais, setTiposPenais] = useState<TipoPenal[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [tiposArea, setTiposArea] = useState<TipoArea[]>([]);
  const [desfechos, setDesfechos] = useState<Desfecho[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipoPenalId: '',
    regiaoAdministrativaId: '',
    tipoAreaId: '',
    latitude: '',
    longitude: '',
    desfechoId: '',
    situacaoAutor: '',
    qtdDetidosMaior: 0,
    qtdDetidosMenor: 0,
    qtdLiberadosMaior: 0,
    qtdLiberadosMenor: 0,
    observacoes: '',
  });
  
  // Combobox state
  const [openTipoPenal, setOpenTipoPenal] = useState(false);
  const [searchTipoPenal, setSearchTipoPenal] = useState('');
  
  useEffect(() => {
    fetchDimensionData();
  }, []);
  
  const fetchDimensionData = async () => {
    setIsLoading(true);
    try {
      const supabaseAny = supabase as any;
      
      const [tiposPenaisRes, regioesRes, tiposAreaRes, desfechosRes] = await Promise.all([
        supabaseAny.from('dim_tipo_penal').select('id, nome').order('nome'),
        supabase.from('dim_regiao_administrativa').select('id, nome').order('nome'),
        supabase.from('dim_tipo_de_area').select('id, "Tipo de Área"').order('"Tipo de Área"'),
        supabaseAny.from('dim_desfecho_crime_comum').select('id, nome').order('nome'),
      ]);
      
      if (tiposPenaisRes.data) setTiposPenais(tiposPenaisRes.data);
      if (regioesRes.data) setRegioes(regioesRes.data);
      if (tiposAreaRes.data) setTiposArea(tiposAreaRes.data);
      if (desfechosRes.data) setDesfechos(desfechosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do formulário');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data || !formData.tipoPenalId || !formData.latitude || !formData.longitude) {
      toast.error('Preencha os campos obrigatórios: Data, Tipo Penal, Latitude e Longitude');
      return;
    }
    
    setIsSaving(true);
    try {
      const supabaseAny = supabase as any;
      
      const { error } = await supabaseAny
        .from('fat_crimes_comuns')
        .insert({
          data: formData.data,
          tipo_penal_id: formData.tipoPenalId,
          regiao_administrativa_id: formData.regiaoAdministrativaId || null,
          tipo_area_id: formData.tipoAreaId || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          desfecho_id: formData.desfechoId || null,
          situacao_autor: formData.situacaoAutor || null,
          qtd_detidos_maior: formData.qtdDetidosMaior,
          qtd_detidos_menor: formData.qtdDetidosMenor,
          qtd_liberados_maior: formData.qtdLiberadosMaior,
          qtd_liberados_menor: formData.qtdLiberadosMenor,
          observacoes: formData.observacoes || null,
        });
      
      if (error) throw error;
      
      toast.success('Crime comum registrado com sucesso!');
      
      // Reset form
      setFormData({
        data: new Date().toISOString().split('T')[0],
        tipoPenalId: '',
        regiaoAdministrativaId: '',
        tipoAreaId: '',
        latitude: '',
        longitude: '',
        desfechoId: '',
        situacaoAutor: '',
        qtdDetidosMaior: 0,
        qtdDetidosMenor: 0,
        qtdLiberadosMaior: 0,
        qtdLiberadosMenor: 0,
        observacoes: '',
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const filteredTiposPenais = tiposPenais.filter(tipo =>
    tipo.nome.toLowerCase().includes(searchTipoPenal.toLowerCase())
  );
  
  const selectedTipoPenal = tiposPenais.find(t => t.id === formData.tipoPenalId);
  
  const totalDetidos = formData.qtdDetidosMaior + formData.qtdDetidosMenor;
  const totalLiberados = formData.qtdLiberadosMaior + formData.qtdLiberadosMenor;
  
  if (isLoading) {
    return (
      <Layout title="Ocorrências de Crimes Comuns" showBackButton>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Ocorrências de Crimes Comuns" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleInputChange('data', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo Penal (Gênesis) *</Label>
                <Popover open={openTipoPenal} onOpenChange={setOpenTipoPenal}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTipoPenal}
                      className="w-full justify-between"
                    >
                      {selectedTipoPenal?.nome || "Selecione o tipo penal..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar tipo penal..." 
                        value={searchTipoPenal}
                        onValueChange={setSearchTipoPenal}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum tipo penal encontrado.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {filteredTiposPenais.map((tipo) => (
                            <CommandItem
                              key={tipo.id}
                              value={tipo.nome}
                              onSelect={() => {
                                handleInputChange('tipoPenalId', tipo.id);
                                setOpenTipoPenal(false);
                                setSearchTipoPenal('');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.tipoPenalId === tipo.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {tipo.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Região Administrativa</Label>
                <Select
                  value={formData.regiaoAdministrativaId}
                  onValueChange={(value) => handleInputChange('regiaoAdministrativaId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a região..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regioes.map((regiao) => (
                      <SelectItem key={regiao.id} value={regiao.id}>
                        {regiao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Área</Label>
                <Select
                  value={formData.tipoAreaId}
                  onValueChange={(value) => handleInputChange('tipoAreaId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de área..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposArea.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area["Tipo de Área"]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="text"
                  placeholder="-15.7942"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="text"
                  placeholder="-47.8825"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Desfecho e Situação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Desfecho e Envolvidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desfecho</Label>
                <Select
                  value={formData.desfechoId}
                  onValueChange={(value) => handleInputChange('desfechoId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o desfecho..." />
                  </SelectTrigger>
                  <SelectContent>
                    {desfechos.map((desfecho) => (
                      <SelectItem key={desfecho.id} value={desfecho.id}>
                        {desfecho.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Situação do Autor</Label>
                <Select
                  value={formData.situacaoAutor}
                  onValueChange={(value) => handleInputChange('situacaoAutor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a situação..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Detido">Detido</SelectItem>
                    <SelectItem value="Liberado">Liberado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qtdDetidosMaior">Maiores Detidos</Label>
                <Input
                  id="qtdDetidosMaior"
                  type="number"
                  min="0"
                  value={formData.qtdDetidosMaior}
                  onChange={(e) => handleInputChange('qtdDetidosMaior', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qtdDetidosMenor">Menores Detidos</Label>
                <Input
                  id="qtdDetidosMenor"
                  type="number"
                  min="0"
                  value={formData.qtdDetidosMenor}
                  onChange={(e) => handleInputChange('qtdDetidosMenor', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qtdLiberadosMaior">Maiores Liberados</Label>
                <Input
                  id="qtdLiberadosMaior"
                  type="number"
                  min="0"
                  value={formData.qtdLiberadosMaior}
                  onChange={(e) => handleInputChange('qtdLiberadosMaior', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qtdLiberadosMenor">Menores Liberados</Label>
                <Input
                  id="qtdLiberadosMenor"
                  type="number"
                  min="0"
                  value={formData.qtdLiberadosMenor}
                  onChange={(e) => handleInputChange('qtdLiberadosMenor', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total de Detidos</p>
                <p className="text-2xl font-bold text-destructive">{totalDetidos}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total de Liberados</p>
                <p className="text-2xl font-bold text-green-600">{totalLiberados}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais..."
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Registrar Crime Comum
              </>
            )}
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default CrimesComuns;
