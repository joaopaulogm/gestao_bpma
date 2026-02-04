import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
      // PRIMEIRO: Verificar role nos metadados do JWT (mais rápido e já sincronizado pela edge function)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.user_metadata?.role) {
        const metadataRole = authUser.user_metadata.role as string;
        console.log('Role obtido dos metadados do JWT:', metadataRole);
        return metadataRole as AppRole;
      }

      // SEGUNDO: Verificar role em user_roles (tabela consolidada)
      // (Removido hardcoded emails - segurança baseada apenas em banco de dados)
      const { data: userRoleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && userRoleData?.role) {
        console.log('Role obtido de user_roles:', userRoleData.role);
        return userRoleData.role;
      }

      console.log('Usando role padrão: operador');
      return 'operador';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'operador';
    }
  };

  const STORAGE_KEY = 'bpma_auth_user';

  const getLocalAuthUser = (): string | null =>
    localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);

  const clearLocalAuthStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
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

  // Renovar sessão Supabase periodicamente e ao voltar à aba para evitar logout por inatividade
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { error } = await supabase.auth.refreshSession();
          if (error) console.warn('Refresh de sessão:', error.message);
        }
      } catch (e) {
        console.warn('Erro ao renovar sessão:', e);
      }
    };

    const REFRESH_INTERVAL_MS = 25 * 60 * 1000; // 25 minutos (antes do JWT expirar em 1h)
    const intervalId = setInterval(refreshSession, REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshSession();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // Listener para evento customizado de login local
    const handleLocalAuthEvent = (event: CustomEvent) => {
      handleLocalAuthChange(event.detail);
    };
    globalThis.addEventListener('bpma_local_auth_changed', handleLocalAuthEvent as EventListener);

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
          clearLocalAuthStorage();
        } else {
          // Verificar se há sessão local (login com matrícula/senha - localStorage ou sessionStorage)
          const localAuthUser = getLocalAuthUser();
          if (localAuthUser) {
            try {
              const localUser = JSON.parse(localAuthUser);
              handleLocalAuthChange(localUser);
            } catch (e) {
              console.error('Error parsing local auth user:', e);
              clearLocalAuthStorage();
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
        clearLocalAuthStorage();
      } else {
        // Verificar se há sessão local (login com matrícula/senha - localStorage ou sessionStorage)
        const localAuthUser = getLocalAuthUser();
        if (localAuthUser) {
          try {
            const localUser = JSON.parse(localAuthUser);
            handleLocalAuthChange(localUser);
          } catch (e) {
            console.error('Error parsing local auth user:', e);
            clearLocalAuthStorage();
          }
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      globalThis.removeEventListener('bpma_local_auth_changed', handleLocalAuthEvent as EventListener);
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
      // Mesmo com erro, limpar sessão local em ambos os storages
      clearLocalAuthStorage();
      setUser(null);
      setUserRole(null);
      if (error instanceof Error) {
        console.error('Logout error:', error.message);
      }
      toast.success('Logout realizado');
    }
  };

  const isAdmin = userRole === 'admin';

  // ADMIN tem acesso a todas as páginas (rotas e itens do menu).
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

    // comando tem acesso a /comando/* (admin + comando)
    if (userRole === 'comando') {
      if (requiredRoles.includes('comando')) {
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

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      userRole,
      isAdmin,
      hasAccess,
    }),
    [user, loading, userRole, login, logout, hasAccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
