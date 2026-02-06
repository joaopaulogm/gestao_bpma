import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin, hasAccess, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admins têm acesso a tudo
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check for admin requirement
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <div className="text-2xl font-bold text-destructive">Acesso Negado</div>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        <a href="/area-do-operador" className="text-primary underline">Voltar para a página inicial</a>
      </div>
    );
  }

  // Check for specific role requirements
  if (requiredRoles.length > 0 && !hasAccess(requiredRoles)) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <div className="text-2xl font-bold text-destructive">Acesso Negado</div>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        <a href="/area-do-operador" className="text-primary underline">Voltar para a página inicial</a>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
