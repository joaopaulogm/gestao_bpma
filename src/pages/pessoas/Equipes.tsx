import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit2, Trash2, Search, UserPlus, Save, X, UsersRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Efetivo {
  id: string;
  matricula: string;
  posto_graduacao: string;
  nome_guerra: string;
  nome: string;
}

interface MembroEquipe {
  id: string;
  efetivo_id: string;
  funcao: string;
  efetivo?: Efetivo;
}

interface Equipe {
  id: string;
  nome: string;
  grupamento: string;
  escala: string | null;
  servico: string | null;
  membros?: MembroEquipe[];
}

const GRUPAMENTOS = [
  'ARMEIRO', 'COMISSÕES', 'EXPEDIENTE', 'GOC', 'GTA', 'GUARDA', 
  'INSTRUÇÕES E CURSO', 'LACUSTRE', 'P2', 'PATRULHA AMBIENTAL'
];

const ESCALAS = [
  '24 X 72', '12 X 36', '12 X 60', 'EXPEDIENTE'
];

const SERVICOS = [
  'OPERACIONAL', 'APOIO OPERACIONAL', 'ADMINISTRATIVO'
];

const FUNCOES = [
  'COMANDANTE', 'PATRULHEIRO', 'MOTORISTA', 'TRIPULANTE', 'RÁDIO OPERADOR',
  'ADJ OFICIAL DE DIA', 'ADJUNTO', 'INSTRUTOR', 'ARMEIRO', 'APOIO GERAL',
  'AUXILIAR ADMINISTRATIVO', 'COORDENADOR'
];

const Equipes: React.FC = () => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [efetivos, setEfetivos] = useState<Efetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cadastradas');
  
  // Form state
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    grupamento: '',
    escala: '',
    servico: ''
  });
  const [selectedMembros, setSelectedMembros] = useState<{efetivo_id: string; funcao: string}[]>([]);
  
  // Search states
  const [searchEquipe, setSearchEquipe] = useState('');
  const [searchEfetivo, setSearchEfetivo] = useState('');
  const [matriculaInput, setMatriculaInput] = useState('');

  const fetchEquipes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: equipesData, error: equipesError } = await supabase
        .from('dim_equipes')
        .select('*')
        .order('grupamento', { ascending: true });

      if (equipesError) throw equipesError;

      // Fetch members for each team
      const equipesWithMembros = await Promise.all(
        (equipesData || []).map(async (equipe) => {
          const { data: membrosData } = await supabase
            .from('fat_equipe_membros')
            .select(`
              id,
              efetivo_id,
              funcao,
              dim_efetivo!inner(id, matricula, posto_graduacao, nome_guerra, nome)
            `)
            .eq('equipe_id', equipe.id);

          return {
            ...equipe,
            membros: (membrosData || []).map((m: any) => ({
              id: m.id,
              efetivo_id: m.efetivo_id,
              funcao: m.funcao,
              efetivo: m.dim_efetivo
            }))
          };
        })
      );

      setEquipes(equipesWithMembros);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      toast.error('Erro ao carregar equipes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEfetivos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dim_efetivo')
        .select('id, matricula, posto_graduacao, nome_guerra, nome')
        .order('nome_guerra', { ascending: true });

      if (error) throw error;
      setEfetivos(data || []);
    } catch (error) {
      console.error('Erro ao carregar efetivos:', error);
    }
  }, []);

  useEffect(() => {
    fetchEquipes();
    fetchEfetivos();
  }, [fetchEquipes, fetchEfetivos]);

  const resetForm = () => {
    setFormData({ nome: '', grupamento: '', escala: '', servico: '' });
    setSelectedMembros([]);
    setEditingEquipe(null);
    setMatriculaInput('');
  };

  const handleEdit = (equipe: Equipe) => {
    setEditingEquipe(equipe);
    setFormData({
      nome: equipe.nome,
      grupamento: equipe.grupamento,
      escala: equipe.escala || '',
      servico: equipe.servico || ''
    });
    setSelectedMembros(
      (equipe.membros || []).map(m => ({ efetivo_id: m.efetivo_id, funcao: m.funcao }))
    );
    setActiveTab('cadastrar');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta equipe?')) return;

    try {
      const { error } = await supabase.from('dim_equipes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Equipe excluída com sucesso');
      fetchEquipes();
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      toast.error('Erro ao excluir equipe');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.grupamento) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      let equipeId = editingEquipe?.id;

      if (editingEquipe) {
        const { error } = await supabase
          .from('dim_equipes')
          .update({
            nome: formData.nome,
            grupamento: formData.grupamento,
            escala: formData.escala || null,
            servico: formData.servico || null
          })
          .eq('id', editingEquipe.id);

        if (error) throw error;

        // Delete existing members
        await supabase.from('fat_equipe_membros').delete().eq('equipe_id', editingEquipe.id);
      } else {
        const { data, error } = await supabase
          .from('dim_equipes')
          .insert({
            nome: formData.nome,
            grupamento: formData.grupamento,
            escala: formData.escala || null,
            servico: formData.servico || null
          })
          .select()
          .single();

        if (error) throw error;
        equipeId = data.id;
      }

      // Insert members
      if (selectedMembros.length > 0 && equipeId) {
        const { error: membrosError } = await supabase
          .from('fat_equipe_membros')
          .insert(selectedMembros.map(m => ({
            equipe_id: equipeId,
            efetivo_id: m.efetivo_id,
            funcao: m.funcao
          })));

        if (membrosError) throw membrosError;
      }

      toast.success(editingEquipe ? 'Equipe atualizada com sucesso' : 'Equipe cadastrada com sucesso');
      resetForm();
      fetchEquipes();
      setActiveTab('cadastradas');
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      toast.error('Erro ao salvar equipe');
    }
  };

  const addMembroByMatricula = () => {
    if (!matriculaInput.trim()) return;
    
    const matriculaSemZeros = matriculaInput.replace(/^0+/, '');
    const efetivo = efetivos.find(e => 
      e.matricula === matriculaInput || e.matricula === matriculaSemZeros
    );
    
    if (!efetivo) {
      toast.error('Policial não encontrado');
      return;
    }
    
    if (selectedMembros.some(m => m.efetivo_id === efetivo.id)) {
      toast.error('Este policial já está na equipe');
      return;
    }
    
    setSelectedMembros([...selectedMembros, { efetivo_id: efetivo.id, funcao: 'PATRULHEIRO' }]);
    setMatriculaInput('');
    toast.success(`${efetivo.posto_graduacao} ${efetivo.nome_guerra} adicionado`);
  };

  const removeMembro = (efetivoId: string) => {
    setSelectedMembros(selectedMembros.filter(m => m.efetivo_id !== efetivoId));
  };

  const updateMembroFuncao = (efetivoId: string, funcao: string) => {
    setSelectedMembros(selectedMembros.map(m => 
      m.efetivo_id === efetivoId ? { ...m, funcao } : m
    ));
  };

  const filteredEquipes = equipes.filter(e => 
    e.nome.toLowerCase().includes(searchEquipe.toLowerCase()) ||
    e.grupamento.toLowerCase().includes(searchEquipe.toLowerCase())
  );

  const groupedEquipes = filteredEquipes.reduce((acc, equipe) => {
    if (!acc[equipe.grupamento]) acc[equipe.grupamento] = [];
    acc[equipe.grupamento].push(equipe);
    return acc;
  }, {} as Record<string, Equipe[]>);

  const getMembroInfo = (efetivoId: string) => {
    return efetivos.find(e => e.id === efetivoId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UsersRound className="h-8 w-8 text-[#ffcc00]" />
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Equipes</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#071d49]/10">
          <TabsTrigger value="cadastradas" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Equipes Cadastradas
          </TabsTrigger>
          <TabsTrigger value="cadastrar" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">
            <Plus className="h-4 w-4 mr-2" />
            {editingEquipe ? 'Editar Equipe' : 'Cadastrar Equipe'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cadastradas" className="mt-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar equipe ou grupamento..."
                value={searchEquipe}
                onChange={(e) => setSearchEquipe(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffcc00]" />
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEquipes).map(([grupamento, equipesGrupo]) => (
                <div key={grupamento} className="space-y-4">
                  <h2 className="text-lg font-semibold text-[#071d49] border-b border-[#ffcc00]/30 pb-2">
                    {grupamento}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipesGrupo.map((equipe) => (
                      <Card 
                        key={equipe.id} 
                        className="bg-gradient-to-br from-[#071d49] to-[#0a2a5e] border-[#071d49]/50 
                                   hover:shadow-[0_0_25px_rgba(255,204,0,0.3)] transition-all duration-300
                                   transform hover:scale-[1.02] group"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white text-lg group-hover:text-[#ffcc00] transition-colors">
                                {equipe.nome}
                              </CardTitle>
                              <div className="flex gap-2 mt-2">
                                {equipe.escala && (
                                  <Badge variant="outline" className="border-[#ffcc00]/50 text-[#ffcc00] text-xs">
                                    {equipe.escala}
                                  </Badge>
                                )}
                                {equipe.servico && (
                                  <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                                    {equipe.servico}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(equipe)}
                                className="h-8 w-8 text-white/70 hover:text-[#ffcc00] hover:bg-white/10"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(equipe.id)}
                                className="h-8 w-8 text-white/70 hover:text-red-400 hover:bg-white/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="space-y-1">
                            <p className="text-white/50 text-xs uppercase tracking-wider">
                              Membros ({equipe.membros?.length || 0})
                            </p>
                            <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin">
                              {equipe.membros?.map((membro) => (
                                <div 
                                  key={membro.id} 
                                  className="flex items-center justify-between text-sm p-2 rounded
                                             bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#ffcc00]/80 font-mono text-xs">
                                      {membro.efetivo?.matricula}
                                    </span>
                                    <span className="text-white/80">
                                      {membro.efetivo?.posto_graduacao} {membro.efetivo?.nome_guerra}
                                    </span>
                                  </div>
                                  <Badge variant="secondary" className="bg-[#ffcc00]/20 text-[#ffcc00] text-xs">
                                    {membro.funcao}
                                  </Badge>
                                </div>
                              ))}
                              {(!equipe.membros || equipe.membros.length === 0) && (
                                <p className="text-white/40 text-sm italic py-2">Nenhum membro cadastrado</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedEquipes).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma equipe cadastrada</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cadastrar" className="mt-6">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingEquipe ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingEquipe ? 'Editar Equipe' : 'Nova Equipe'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Equipe *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: ALFA, BRAVO, CHARLIE..."
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grupamento">Grupamento *</Label>
                    <Select
                      value={formData.grupamento}
                      onValueChange={(value) => setFormData({ ...formData, grupamento: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Selecione o grupamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRUPAMENTOS.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escala">Escala</Label>
                    <Select
                      value={formData.escala}
                      onValueChange={(value) => setFormData({ ...formData, escala: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Selecione a escala" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESCALAS.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servico">Tipo de Serviço</Label>
                    <Select
                      value={formData.servico}
                      onValueChange={(value) => setFormData({ ...formData, servico: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Selecione o tipo de serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICOS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Membros da Equipe */}
                <div className="space-y-4 border-t border-border/50 pt-6">
                  <Label className="text-lg font-semibold">Membros da Equipe</Label>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Matrícula do policial"
                      value={matriculaInput}
                      onChange={(e) => setMatriculaInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMembroByMatricula())}
                      className="bg-background/50 flex-1"
                    />
                    <Button type="button" onClick={addMembroByMatricula} variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  {selectedMembros.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {selectedMembros.map((membro) => {
                        const efetivo = getMembroInfo(membro.efetivo_id);
                        if (!efetivo) return null;
                        
                        return (
                          <div 
                            key={membro.efetivo_id}
                            className="flex items-center justify-between p-3 rounded-lg 
                                       bg-[#071d49]/10 border border-[#071d49]/20"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm text-muted-foreground">
                                {efetivo.matricula}
                              </span>
                              <span className="font-medium">
                                {efetivo.posto_graduacao} {efetivo.nome_guerra}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={membro.funcao}
                                onValueChange={(value) => updateMembroFuncao(membro.efetivo_id, value)}
                              >
                                <SelectTrigger className="w-[180px] h-8 bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FUNCOES.map((f) => (
                                    <SelectItem key={f} value={f}>{f}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMembro(membro.efetivo_id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#071d49] hover:bg-[#0a2a5e] text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingEquipe ? 'Atualizar' : 'Cadastrar'} Equipe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Equipes;
