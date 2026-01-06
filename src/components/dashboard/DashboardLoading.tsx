import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DashboardLoadingProps {
  onRefresh?: () => void;
  isError?: boolean;
}

const DashboardLoading = ({ 
  onRefresh,
  isError = false
}) => {
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-lg text-red-500 font-medium">Erro ao carregar dados do painel</div>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Ocorreu um problema ao buscar os dados. Por favor, tente novamente mais tarde ou contacte o suporte.
          </p>
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh} 
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg text-foreground">Carregando dados...</div>
      </div>
    </div>
  );
};

export default DashboardLoading;
