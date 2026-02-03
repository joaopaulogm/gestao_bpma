import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, UserPlus, Shield, Users, Search, UserCheck, Mail, Check, X } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Switch } from '@/components/ui/switch';

type AppRole = Database['public']['Enums']['app_role'];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string | null;
}

interface UsuarioPorLogin {
  id: string;
  nome: string | null;
  nome_guerra: string | null;
  matricula: string | null;
  post_grad: string | null;
  quadro: string | null;
  email: string | null;
  login: string | null;
  cpf: number | null;
  senha: number | null;
  auth_user_id: string | null;
  vinculado_em: string | null;
  ativo: boolean | null;
  lotacao: string | null;
}

interface UsuarioWithRole extends UsuarioPorLogin {
  role?: AppRole;
  roleId?: string;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  user: 'Usuário',
  operador: 'Operador',
  secao_operacional: 'Seção Operacional',
  secao_pessoas: 'Seção de Pessoas',
  secao_logistica: 'Seção de Logística e Manutenção',
  comando: 'Comando',
  publico: 'Público',
};

const GerenciarPermissoes: React.FC = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [searchUsuarios, setSearchUsuarios] = useState('');
  
  // Form states for permissions
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('operador');
  const [adding, setAdding] = useState(false);
  
  // Form states for new user
  const [newUserNome, setNewUserNome] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserMatricula, setNewUserMatricula] = useState('');
  const [addingUser, setAddingUser] = useState(false);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      toast.error('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios_por_login')
        .select('id, nome, nome_guerra, matricula, post_grad, quadro, email, login, cpf, senha, auth_user_id, vinculado_em, ativo, lotacao')
        .order('nome', { ascending: true });

      if (error) throw error;
      
      // Fetch efetivo_roles para obter roles pre-configuradas via matricula
      const { data: efetivoRoles } = await supabase
        .from('efetivo_roles')
        .select('id, efetivo_id, role');
      
      // Fetch dim_efetivo para mapear matricula -> efetivo_id
      const { data: efetivo } = await supabase
        .from('dim_efetivo')
        .select('id, matricula');
      
      // Criar mapa matricula -> efetivo_id
      const matriculaToEfetivoId = new Map(efetivo?.map(e => [e.matricula, e.id]) || []);
      
      // Criar mapa efetivo_id -> role
      const efetivoIdToRole = new Map(efetivoRoles?.map(r => [r.efetivo_id, { role: r.role as AppRole, roleId: r.id }]) || []);
      
      const usuariosWithRoles: UsuarioWithRole[] = (data || []).map(u => {
        const efetivoId = u.matricula ? matriculaToEfetivoId.get(u.matricula) : null;
        const roleInfo = efetivoId ? efetivoIdToRole.get(efetivoId) : null;
        return {
          ...u,
          role: roleInfo?.role,
          roleId: roleInfo?.roleId,
        };
      });
      
      setUsuarios(usuariosWithRoles);
    } catch (error: any) {
      console.error('Error fetching usuarios:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
    fetchUsuarios();
  }, []);

  const handleAddRole = async () => {
    if (!newUserId.trim()) {
      toast.error('Informe o ID do usuário');
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUserId.trim(),
          role: newRole,
        });

      if (error) throw error;

      toast.success('Permissão adicionada com sucesso');
      setNewUserId('');
      setNewRole('operador');
      fetchUserRoles();
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error adding role:', error);
      if (error.code === '23505') {
        toast.error('Este usuário já possui esta permissão');
      } else {
        toast.error('Erro ao adicionar permissão');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Permissão removida com sucesso');
      fetchUserRoles();
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error('Erro ao remover permissão');
    }
  };

  const handleUpdateRole = async (id: string, newRoleValue: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRoleValue })
        .eq('id', id);

      if (error) throw error;

      toast.success('Permissão atualizada com sucesso');
      fetchUserRoles();
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const handleSetUsuarioRole = async (usuario: UsuarioWithRole, role: AppRole | 'remove') => {
    try {
      // Primeiro, buscar o efetivo_id pela matricula
      if (!usuario.matricula) {
        toast.error('Usuário não possui matrícula cadastrada');
        return;
      }
      
      const { data: efetivoData } = await supabase
        .from('dim_efetivo')
        .select('id')
        .eq('matricula', usuario.matricula)
        .single();
      
      if (!efetivoData) {
        // Se não existe no efetivo, criar user_role diretamente via auth_user_id
        if (!usuario.auth_user_id) {
          toast.error('Usuário ainda não vinculou conta Google');
          return;
        }
        
        if (role === 'remove') {
          const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', usuario.auth_user_id);
          if (error) throw error;
          toast.success('Nível de acesso removido');
        } else {
          const { error } = await supabase
            .from('user_roles')
            .upsert({
              user_id: usuario.auth_user_id,
              role: role,
            }, { onConflict: 'user_id' });
          if (error) throw error;
          toast.success('Nível de acesso atualizado');
        }
      } else {
        // Usar efetivo_roles
        if (role === 'remove' && usuario.roleId) {
          const { error } = await supabase
            .from('efetivo_roles')
            .delete()
            .eq('id', usuario.roleId);
          if (error) throw error;
          toast.success('Nível de acesso removido');
        } else if (usuario.roleId && role !== 'remove') {
          const { error } = await supabase
            .from('efetivo_roles')
            .update({ role: role as AppRole })
            .eq('id', usuario.roleId);
          if (error) throw error;
          toast.success('Nível de acesso atualizado');
        } else if (!usuario.roleId && role !== 'remove') {
          const { error } = await supabase
            .from('efetivo_roles')
            .insert({
              efetivo_id: efetivoData.id,
              role: role as AppRole,
            });
          if (error) throw error;
          toast.success('Nível de acesso definido');
        }
      }
      
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error setting usuario role:', error);
      toast.error('Erro ao definir nível de acesso');
    }
  };

  const handleAddUser = async () => {
    if (!newUserNome.trim()) {
      toast.error('Informe o nome');
      return;
    }

    setAddingUser(true);
    try {
      // Gerar login baseado no nome
      const nameParts = newUserNome.trim().split(' ');
      const firstName = nameParts[0].toLowerCase().replace(/[^a-z]/g, '');
      const lastName = nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
      const generatedLogin = `${firstName}.${lastName}`;

      const { error } = await supabase
        .from('usuarios_por_login')
        .insert({
          nome: newUserNome.trim(),
          email: newUserEmail.trim().toLowerCase() || null,
          matricula: newUserMatricula.trim() || null,
          login: generatedLogin,
          ativo: true,
        });

      if (error) throw error;

      toast.success('Usuário adicionado com sucesso');
      setNewUserNome('');
      setNewUserEmail('');
      setNewUserMatricula('');
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error adding user:', error);
      if (error.code === '23505') {
        toast.error('Este usuário já está cadastrado');
      } else {
        toast.error('Erro ao adicionar usuário');
      }
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('usuarios_por_login')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Usuário removido com sucesso');
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('usuarios_por_login')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(currentStatus ? 'Usuário desativado' : 'Usuário ativado');
      fetchUsuarios();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  // Filter usuarios by search term
  const filteredUsuarios = usuarios.filter(u => 
    (u.nome?.toLowerCase() || '').includes(searchUsuarios.toLowerCase()) ||
    (u.nome_guerra?.toLowerCase() || '').includes(searchUsuarios.toLowerCase()) ||
    (u.matricula || '').includes(searchUsuarios) ||
    (u.email?.toLowerCase() || '').includes(searchUsuarios.toLowerCase()) ||
    (u.login?.toLowerCase() || '').includes(searchUsuarios.toLowerCase())
  );

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Gerenciar Permissões</h1>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="usuarios" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3">
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Usuários</span>
            <span className="sm:hidden">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Níveis Manuais</span>
            <span className="sm:hidden">Níveis</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Usuários (tabela unificada) */}
        <TabsContent value="usuarios" className="space-y-6">
          {/* Adicionar Usuário */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Adicionar Usuário
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Adicione novos usuários autorizados a acessar o sistema
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Nome completo *"
                    value={newUserNome}
                    onChange={(e) => setNewUserNome(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="E-mail (opcional)"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Input
                    placeholder="Matrícula"
                    value={newUserMatricula}
                    onChange={(e) => setNewUserMatricula(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <Button 
                  onClick={handleAddUser} 
                  disabled={addingUser}
                  className="bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Usuários */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Usuários Cadastrados
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie usuários e seus níveis de acesso. Login: nome.sobrenome | Senha: CPF
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, matrícula, email ou login..."
                  value={searchUsuarios}
                  onChange={(e) => setSearchUsuarios(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              {loadingUsuarios ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredUsuarios.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchUsuarios ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Posto/Grad</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Login</TableHead>
                        <TableHead>Senha (CPF)</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>ID Único</TableHead>
                        <TableHead className="w-56">Nível de Acesso</TableHead>
                        <TableHead className="w-16">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsuarios.map((usuario) => (
                        <TableRow key={usuario.id} className={usuario.ativo === false ? 'opacity-50' : ''}>
                          <TableCell>
                            <Switch
                              checked={usuario.ativo !== false}
                              onCheckedChange={() => handleToggleUserStatus(usuario.id, usuario.ativo)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {usuario.post_grad || '-'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-semibold">{usuario.nome_guerra || usuario.nome}</span>
                              {usuario.nome_guerra && usuario.nome && (
                                <p className="text-xs text-muted-foreground">{usuario.nome}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {usuario.matricula || '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {usuario.login || '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {usuario.senha || usuario.cpf ? (
                              <span title={String(usuario.senha || usuario.cpf)}>
                                {String(usuario.senha || usuario.cpf).slice(0, 3)}***
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {usuario.email ? (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[120px]" title={usuario.email}>
                                  {usuario.email}
                                </span>
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {usuario.auth_user_id ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-xs font-mono" title={usuario.auth_user_id}>
                                  {usuario.auth_user_id.slice(0, 8)}...
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span className="text-xs">Pendente</span>
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={usuario.role || 'none'} 
                              onValueChange={(value) => handleSetUsuarioRole(
                                usuario, 
                                value === 'none' ? 'remove' : value as AppRole
                              )}
                            >
                              <SelectTrigger className="w-52 bg-background/50">
                                <SelectValue placeholder="Sem acesso definido" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <span className="text-muted-foreground">Sem acesso definido</span>
                                </SelectItem>
                                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(usuario.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Total: {filteredUsuarios.length} usuários {searchUsuarios && `(de ${usuarios.length} total)`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: User Roles (manual) */}
        <TabsContent value="roles" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Alterar Nível de Acesso Manual
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Use esta opção apenas para usuários especiais que não estão na lista de usuários.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="ID do Usuário (UUID)"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="w-full sm:w-64">
                  <Select value={newRole} onValueChange={(value: AppRole) => setNewRole(value)}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddRole} 
                  disabled={adding}
                  className="bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Níveis de Acesso Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : userRoles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum nível de acesso cadastrado
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID do Usuário</TableHead>
                        <TableHead>Nível de Acesso</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead className="w-20">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRoles.map((userRole) => (
                        <TableRow key={userRole.id}>
                          <TableCell className="font-mono text-sm">
                            {userRole.user_id}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={userRole.role} 
                              onValueChange={(value: AppRole) => handleUpdateRole(userRole.id, value)}
                            >
                              <SelectTrigger className="w-56 bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {userRole.created_at 
                              ? new Date(userRole.created_at).toLocaleDateString('pt-BR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRole(userRole.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GerenciarPermissoes;
