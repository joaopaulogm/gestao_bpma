import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, UserPlus, Shield, Users, Mail } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [loadingAllowed, setLoadingAllowed] = useState(true);
  
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

  useEffect(() => {
    fetchUserRoles();
    fetchAllowedUsers();
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
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar permissão');
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Permissões</h1>
      </div>

      <Tabs defaultValue="allowed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="allowed" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Usuários Permitidos
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Níveis de Acesso
          </TabsTrigger>
        </TabsList>

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
                Alterar Nível de Acesso
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Novos usuários recebem automaticamente o nível "Operador". Altere aqui para conceder níveis especiais.
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
