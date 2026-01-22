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
      // Buscar role através da função que vincula auth_user_id com efetivo_roles
      const { data, error } = await supabase
        .rpc('get_role_by_auth_user_id', { p_auth_user_id: userId });

      if (error) {
        console.error('Error fetching user role:', error);
        // Fallback: tentar buscar através de usuarios_por_login -> efetivo_roles
        try {
          const { data: usuario } = await supabase
            .from('usuarios_por_login')
            .select('efetivo_id')
            .eq('auth_user_id', userId)
            .single();

          if (usuario?.efetivo_id) {
            const { data: roleData } = await supabase
              .from('efetivo_roles')
              .select('role')
              .eq('efetivo_id', usuario.efetivo_id)
              .order('role', { ascending: true })
              .limit(1)
              .maybeSingle();

            if (roleData?.role) {
              return roleData.role as AppRole;
            }
          }
        } catch (fallbackError) {
          console.error('Fallback role fetch error:', fallbackError);
        }
        return 'operador'; // Default role
      }

      // RPC retorna o valor diretamente (não um objeto)
      return (data as AppRole) || 'operador';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'operador';
    }
  };

  useEffect(() => {
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
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        });
        fetchUserRole(session.user.id).then(setUserRole);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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
    } catch (error: any) {
      console.error('Login error:', error.message);
      const errorMessage = handleSupabaseError(error, 'fazer login');
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Logout realizado com sucesso');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(`Erro ao fazer logout: ${error.message}`);
    }
  };

  const isAdmin = userRole === 'admin';

  const hasAccess = (requiredRoles: AppRole[]): boolean => {
    if (!userRole) return false;
    if (userRole === 'admin') return true;
    
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
