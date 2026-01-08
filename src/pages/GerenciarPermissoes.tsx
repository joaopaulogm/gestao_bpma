import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, UserPlus, Shield, Users, Mail, Search, UserCheck } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string | null;
}

interface AllowedUser {
  id: string;
  "Email 1": string | null;
  Nome: string | null;
  criado_em: string | null;
}

interface Efetivo {
  id: string;
  nome: string;
  nome_guerra: string;
  matricula: string;
  posto_graduacao: string;
  lotacao: string;
}

interface EfetivoWithRole extends Efetivo {
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
  publico: 'Público',
};

const GerenciarPermissoes: React.FC = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
  const [efetivo, setEfetivo] = useState<EfetivoWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAllowed, setLoadingAllowed] = useState(true);
  const [loadingEfetivo, setLoadingEfetivo] = useState(true);
  const [searchEfetivo, setSearchEfetivo] = useState('');
  
  // Form states for permissions
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('operador');
  const [adding, setAdding] = useState(false);
  
  // Form states for allowed users
  const [newEmail, setNewEmail] = useState('');
  const [newNome, setNewNome] = useState('');
  const [addingAllowed, setAddingAllowed] = useState(false);

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

  const fetchAllowedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios_permitidos')
        .select('id, "Email 1", Nome, criado_em')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setAllowedUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching allowed users:', error);
      toast.error('Erro ao carregar usuários permitidos');
    } finally {
      setLoadingAllowed(false);
    }
  };

  const fetchEfetivo = async () => {
    try {
      const { data, error } = await supabase
        .from('dim_efetivo')
        .select('id, nome, nome_guerra, matricula, posto_graduacao, lotacao')
        .order('nome_guerra', { ascending: true });

      if (error) throw error;
      
      // Fetch efetivo_roles (pré-configuração de roles)
      const { data: roles } = await supabase
        .from('efetivo_roles')
        .select('*');
      
      const rolesMap = new Map(roles?.map(r => [r.efetivo_id, { role: r.role as AppRole, roleId: r.id }]) || []);
      
      const efetivoWithRoles: EfetivoWithRole[] = (data || []).map(e => ({
        ...e,
        role: rolesMap.get(e.id)?.role,
        roleId: rolesMap.get(e.id)?.roleId,
      }));
      
      setEfetivo(efetivoWithRoles);
    } catch (error: any) {
      console.error('Error fetching efetivo:', error);
      toast.error('Erro ao carregar efetivo');
    } finally {
      setLoadingEfetivo(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
    fetchAllowedUsers();
    fetchEfetivo();
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
      fetchEfetivo();
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
      fetchEfetivo();
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
      fetchEfetivo();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const handleSetEfetivoRole = async (efetivoId: string, role: AppRole | 'remove', currentRoleId?: string) => {
    try {
      if (role === 'remove' && currentRoleId) {
        // Remove role
        const { error } = await supabase
          .from('efetivo_roles')
          .delete()
          .eq('id', currentRoleId);
        if (error) throw error;
        toast.success('Nível de acesso removido');
      } else if (currentRoleId && role !== 'remove') {
        // Update existing role
        const { error } = await supabase
          .from('efetivo_roles')
          .update({ role: role as AppRole })
          .eq('id', currentRoleId);
        if (error) throw error;
        toast.success('Nível de acesso atualizado');
      } else if (!currentRoleId && role !== 'remove') {
        // Create new role
        const { error } = await supabase
          .from('efetivo_roles')
          .insert({
            efetivo_id: efetivoId,
            role: role as AppRole,
          });
        if (error) throw error;
        toast.success('Nível de acesso definido');
      }
      fetchEfetivo();
    } catch (error: any) {
      console.error('Error setting efetivo role:', error);
      toast.error('Erro ao definir nível de acesso');
    }
  };

  const handleAddAllowedUser = async () => {
    if (!newEmail.trim()) {
      toast.error('Informe o e-mail');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('E-mail inválido');
      return;
    }

    setAddingAllowed(true);
    try {
      const { error } = await supabase
        .from('usuarios_permitidos')
        .insert({
          "Email 1": newEmail.trim().toLowerCase(),
          Nome: newNome.trim() || null,
        });

      if (error) throw error;

      toast.success('Usuário adicionado à lista de permitidos');
      setNewEmail('');
      setNewNome('');
      fetchAllowedUsers();
    } catch (error: any) {
      console.error('Error adding allowed user:', error);
      if (error.code === '23505') {
        toast.error('Este e-mail já está na lista de permitidos');
      } else {
        toast.error('Erro ao adicionar usuário');
      }
    } finally {
      setAddingAllowed(false);
    }
  };

  const handleDeleteAllowedUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('usuarios_permitidos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Usuário removido da lista de permitidos');
      fetchAllowedUsers();
    } catch (error: any) {
      console.error('Error deleting allowed user:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  // Filter efetivo by search term
  const filteredEfetivo = efetivo.filter(e => 
    e.nome_guerra.toLowerCase().includes(searchEfetivo.toLowerCase()) ||
    e.nome.toLowerCase().includes(searchEfetivo.toLowerCase()) ||
    e.matricula.includes(searchEfetivo)
  );

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Gerenciar Permissões</h1>
      </div>

      <Tabs defaultValue="efetivo" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="efetivo" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3">
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden xs:inline sm:inline">Efetivo</span>
            <span className="xs:hidden sm:hidden">Efet.</span>
          </TabsTrigger>
          <TabsTrigger value="allowed" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Permitidos</span>
            <span className="sm:hidden">Perm.</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Níveis</span>
            <span className="sm:hidden">Nív.</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Efetivo BPMA */}
        <TabsContent value="efetivo" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Definir Nível de Acesso do Efetivo
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Busque pelo nome de guerra ou matrícula e defina o nível de acesso de cada membro.
                Login: nome de guerra | Senha: matrícula
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome de guerra, nome ou matrícula..."
                  value={searchEfetivo}
                  onChange={(e) => setSearchEfetivo(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              {loadingEfetivo ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredEfetivo.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchEfetivo ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posto/Grad</TableHead>
                        <TableHead>Nome de Guerra</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Lotação</TableHead>
                        <TableHead className="w-64">Nível de Acesso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEfetivo.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium text-sm">
                            {member.posto_graduacao}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {member.nome_guerra}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {member.matricula}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {member.lotacao}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={member.role || 'none'} 
                              onValueChange={(value) => handleSetEfetivoRole(
                                member.id, 
                                value === 'none' ? 'remove' : value as AppRole,
                                member.roleId
                              )}
                            >
                              <SelectTrigger className="w-56 bg-background/50">
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Total: {filteredEfetivo.length} membros {searchEfetivo && `(de ${efetivo.length} total)`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Allowed Users */}
        <TabsContent value="allowed" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Adicionar Usuário Permitido
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Adicione e-mails de policiais autorizados a criar conta no sistema (incluindo contas Google)
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="E-mail do policial"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Nome (opcional)"
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <Button 
                  onClick={handleAddAllowedUser} 
                  disabled={addingAllowed}
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
              <CardTitle className="text-lg">Lista de Usuários Permitidos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAllowed ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : allowedUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário permitido cadastrado
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead className="w-20">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allowedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user["Email 1"] || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.Nome || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.criado_em 
                              ? new Date(user.criado_em).toLocaleDateString('pt-BR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAllowedUser(user.id)}
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

        {/* Tab: User Roles */}
        <TabsContent value="roles" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Alterar Nível de Acesso Manual
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Use esta opção apenas para usuários que não estão no efetivo (ex: usuários autenticados via Google).
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