import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { handleSupabaseError } from '@/utils/errorHandler';

type AppRole = Database['public']['Enums']['app_role'];

type User = {
  id: string;
  email: string;
  role?: AppRole;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: AppRole | null;
  isAdmin: boolean;
  hasAccess: (requiredRoles: AppRole[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  const fetchUserRole = async (userId: string): Promise<AppRole | null> => {
    try {
      // PRIMEIRO: Verificar se é email admin por natureza (verificação direta)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const emailLower = authUser.email.toLowerCase().trim();
        if (emailLower === 'soi.bpma@gmail.com' || emailLower === 'joaopaulogm@gmail.com') {
          console.log('Email admin detectado:', emailLower);
          return 'admin';
        }
      }

      // SEGUNDO: Buscar role em user_roles (tabela consolidada)
      const { data: userRoleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && userRoleData?.role) {
        console.log('Role obtido de user_roles:', userRoleData.role);
        return userRoleData.role as AppRole;
      }

      console.log('Usando role padrão: operador');
      return 'operador';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'operador';
    }
  };

  // Handler para sessão local (login com matrícula/senha)
  const handleLocalAuthChange = (userData: { id: string; email?: string; role?: string }) => {
    setUser({
      id: userData.id,
      email: userData.email || '',
    });
    setUserRole((userData.role as AppRole) || 'operador');
    setLoading(false);
  };

  useEffect(() => {
    // Listener para evento customizado de login local
    const handleLocalAuthEvent = (event: CustomEvent) => {
      handleLocalAuthChange(event.detail);
    };
    window.addEventListener('bpma_local_auth_changed', handleLocalAuthEvent as EventListener);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          setTimeout(() => {
            fetchUserRole(session.user.id).then(setUserRole);
          }, 0);
          // Limpar sessão local se existir (Supabase Auth tem prioridade)
          localStorage.removeItem('bpma_auth_user');
        } else {
          // Verificar se há sessão local (login com matrícula/senha)
          const localAuthUser = localStorage.getItem('bpma_auth_user');
          if (localAuthUser) {
            try {
              const localUser = JSON.parse(localAuthUser);
              handleLocalAuthChange(localUser);
            } catch (e) {
              console.error('Error parsing local auth user:', e);
              localStorage.removeItem('bpma_auth_user');
              setUser(null);
              setUserRole(null);
            }
          } else {
            setUser(null);
            setUserRole(null);
          }
        }
        setLoading(false);
      }
    );

    // Verificar sessão Supabase primeiro
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        });
        fetchUserRole(session.user.id).then(setUserRole);
        // Limpar sessão local se existir
        localStorage.removeItem('bpma_auth_user');
      } else {
        // Verificar se há sessão local (login com matrícula/senha - persistente)
        const localAuthUser = localStorage.getItem('bpma_auth_user');
        if (localAuthUser) {
          try {
            const localUser = JSON.parse(localAuthUser);
            handleLocalAuthChange(localUser);
          } catch (e) {
            console.error('Error parsing local auth user:', e);
            localStorage.removeItem('bpma_auth_user');
          }
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('bpma_local_auth_changed', handleLocalAuthEvent as EventListener);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Login realizado com sucesso!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Login error:', errorMessage);
      const handledError = handleSupabaseError(error as Error, 'fazer login');
      toast.error(handledError);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Limpar sessão local (login com matrícula/senha)
      localStorage.removeItem('bpma_auth_user');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Ignorar erro se não havia sessão Supabase
        console.log('Supabase signOut info:', error.message);
      }
      
      // Limpar estados locais
      setUser(null);
      setUserRole(null);
      
      toast.success('Logout realizado com sucesso');
    } catch (error: unknown) {
      // Mesmo com erro, limpar sessão local
      localStorage.removeItem('bpma_auth_user');
      setUser(null);
      setUserRole(null);
      toast.success('Logout realizado');
    }
  };

  const isAdmin = userRole === 'admin';

  const hasAccess = (requiredRoles: AppRole[]): boolean => {
    if (!userRole) return false;
    if (userRole === 'admin') return true;
    
    // secao_operacional tem acesso irrestrito a /secao-operacional/* e rotas de operador
    if (userRole === 'secao_operacional') {
      if (requiredRoles.includes('secao_operacional') || requiredRoles.includes('operador')) {
        return true;
      }
    }
    
    // secao_pessoas tem acesso irrestrito a /secao-pessoas/* e rotas de operador
    if (userRole === 'secao_pessoas') {
      if (requiredRoles.includes('secao_pessoas') || requiredRoles.includes('operador')) {
        return true;
      }
    }
    
    // secao_logistica tem acesso irrestrito a /secao-logistica/* e rotas de operador
    if (userRole === 'secao_logistica') {
      if (requiredRoles.includes('secao_logistica') || requiredRoles.includes('operador')) {
        return true;
      }
    }
    
    // Section roles also have operator access
    const operatorRoles: AppRole[] = ['operador', 'secao_operacional', 'secao_pessoas', 'secao_logistica'];
    
    if (requiredRoles.includes('operador') && operatorRoles.includes(userRole)) {
      return true;
    }
    
    return requiredRoles.includes(userRole);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    userRole,
    isAdmin,
    hasAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
