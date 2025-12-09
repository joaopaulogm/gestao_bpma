
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-fauna-blue border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <div className="text-2xl font-bold text-destructive">Acesso Negado</div>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        <a href="/" className="text-primary underline">Voltar para a página inicial</a>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
