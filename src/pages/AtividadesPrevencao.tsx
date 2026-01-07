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
import { Loader2, Save, MapPin, Shield, Users, TreePine, Theater, GraduationCap, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TipoAtividade {
  id: string;
  categoria: string;
  nome: string;
  ordem: number;
}

interface Regiao {
  id: string;
  nome: string;
}

const AtividadesPrevencao: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('prevencao');
  
  // Dimension data
  const [tiposAtividades, setTiposAtividades] = useState<TipoAtividade[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipoAtividadeId: '',
    regiaoAdministrativaId: '',
    latitude: '',
    longitude: '',
    quantidadePublico: 0,
    observacoes: '',
  });
  
  useEffect(() => {
    fetchDimensionData();
  }, []);
  
  const fetchDimensionData = async () => {
    setIsLoading(true);
    try {
      const supabaseAny = supabase as any;
      
      const [tiposRes, regioesRes] = await Promise.all([
        supabaseAny.from('dim_tipo_atividade_prevencao').select('id, categoria, nome, ordem').order('categoria').order('ordem'),
        supabase.from('dim_regiao_administrativa').select('id, nome').order('nome'),
      ]);
      
      if (tiposRes.data) setTiposAtividades(tiposRes.data);
      if (regioesRes.data) setRegioes(regioesRes.data);
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
    
    if (!formData.data || !formData.tipoAtividadeId) {
      toast.error('Preencha os campos obrigatórios: Data e Tipo de Atividade');
      return;
    }
    
    setIsSaving(true);
    try {
      const supabaseAny = supabase as any;
      
      const { error } = await supabaseAny
        .from('fat_atividades_prevencao')
        .insert({
          data: formData.data,
          tipo_atividade_id: formData.tipoAtividadeId,
          regiao_administrativa_id: formData.regiaoAdministrativaId || null,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          quantidade_publico: formData.quantidadePublico,
          observacoes: formData.observacoes || null,
        });
      
      if (error) throw error;
      
      toast.success('Atividade registrada com sucesso!');
      
      // Reset form
      setFormData({
        data: new Date().toISOString().split('T')[0],
        tipoAtividadeId: '',
        regiaoAdministrativaId: '',
        latitude: '',
        longitude: '',
        quantidadePublico: 0,
        observacoes: '',
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Group activities by category
  const categorias = {
    'Prevenção': tiposAtividades.filter(t => t.categoria === 'Prevenção'),
    'Policiamento Comunitário': tiposAtividades.filter(t => t.categoria === 'Policiamento Comunitário'),
    'Teatro Lobo Guará': tiposAtividades.filter(t => t.categoria === 'Teatro Lobo Guará'),
    'Guardiões Ambientais': tiposAtividades.filter(t => t.categoria === 'Guardiões Ambientais'),
    'Saber Cerrado': tiposAtividades.filter(t => t.categoria === 'Saber Cerrado'),
  };
  
  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'Prevenção': return <TreePine className="h-4 w-4" />;
      case 'Policiamento Comunitário': return <Shield className="h-4 w-4" />;
      case 'Teatro Lobo Guará': return <Theater className="h-4 w-4" />;
      case 'Guardiões Ambientais': return <GraduationCap className="h-4 w-4" />;
      case 'Saber Cerrado': return <BookOpen className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };
  
  const selectedActivity = tiposAtividades.find(t => t.id === formData.tipoAtividadeId);
  
  if (isLoading) {
    return (
      <Layout title="Atividades de Prevenção e Policiamento Comunitário" showBackButton>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Atividades de Prevenção e Policiamento Comunitário" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Tabs de Categorias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Tipo de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full mb-4">
                <TabsTrigger value="prevencao" className="gap-1 text-xs sm:text-sm">
                  <TreePine className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Prevenção</span>
                </TabsTrigger>
                <TabsTrigger value="policiamento" className="gap-1 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Pol. Comunitário</span>
                </TabsTrigger>
                <TabsTrigger value="teatro" className="gap-1 text-xs sm:text-sm">
                  <Theater className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Teatro</span>
                </TabsTrigger>
                <TabsTrigger value="guardioes" className="gap-1 text-xs sm:text-sm">
                  <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Guardiões</span>
                </TabsTrigger>
                <TabsTrigger value="saber" className="gap-1 text-xs sm:text-sm">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Saber Cerrado</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="prevencao">
                <div className="space-y-2">
                  <Label>Atividade de Prevenção</Label>
                  <Select
                    value={categorias['Prevenção'].some(t => t.id === formData.tipoAtividadeId) ? formData.tipoAtividadeId : ''}
                    onValueChange={(value) => handleInputChange('tipoAtividadeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a atividade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias['Prevenção'].map((atividade) => (
                        <SelectItem key={atividade.id} value={atividade.id}>
                          {atividade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="policiamento">
                <div className="space-y-2">
                  <Label>Atividade de Policiamento Comunitário</Label>
                  <Select
                    value={categorias['Policiamento Comunitário'].some(t => t.id === formData.tipoAtividadeId) ? formData.tipoAtividadeId : ''}
                    onValueChange={(value) => handleInputChange('tipoAtividadeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a atividade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias['Policiamento Comunitário'].map((atividade) => (
                        <SelectItem key={atividade.id} value={atividade.id}>
                          {atividade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="teatro">
                <div className="space-y-2">
                  <Label>Teatro Lobo Guará</Label>
                  <Select
                    value={categorias['Teatro Lobo Guará'].some(t => t.id === formData.tipoAtividadeId) ? formData.tipoAtividadeId : ''}
                    onValueChange={(value) => handleInputChange('tipoAtividadeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a atividade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias['Teatro Lobo Guará'].map((atividade) => (
                        <SelectItem key={atividade.id} value={atividade.id}>
                          {atividade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="guardioes">
                <div className="space-y-2">
                  <Label>Curso Guardiões Ambientais</Label>
                  <Select
                    value={categorias['Guardiões Ambientais'].some(t => t.id === formData.tipoAtividadeId) ? formData.tipoAtividadeId : ''}
                    onValueChange={(value) => handleInputChange('tipoAtividadeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o encontro/atividade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias['Guardiões Ambientais'].map((atividade) => (
                        <SelectItem key={atividade.id} value={atividade.id}>
                          {atividade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="saber">
                <div className="space-y-2">
                  <Label>Saber Cerrado</Label>
                  <Select
                    value={categorias['Saber Cerrado'].some(t => t.id === formData.tipoAtividadeId) ? formData.tipoAtividadeId : ''}
                    onValueChange={(value) => handleInputChange('tipoAtividadeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a atividade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias['Saber Cerrado'].map((atividade) => (
                        <SelectItem key={atividade.id} value={atividade.id}>
                          {atividade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
            
            {selectedActivity && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2">
                {getCategoryIcon(selectedActivity.categoria)}
                <span className="text-sm font-medium">
                  {selectedActivity.categoria}: {selectedActivity.nome}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informações da Atividade
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantidadePublico">Quantidade de Público Atendido</Label>
              <Input
                id="quantidadePublico"
                type="number"
                min="0"
                value={formData.quantidadePublico}
                onChange={(e) => handleInputChange('quantidadePublico', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização (Opcional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="text"
                  placeholder="-15.7942"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="text"
                  placeholder="-47.8825"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Observações adicionais sobre a atividade..."
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={4}
            />
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
                Registrar Atividade
              </>
            )}
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AtividadesPrevencao;
