import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, BarChart, MapPin, Table, FileText, Package, Leaf, FolderSearch, Bird, AlertTriangle, Shield, TreePine, ExternalLink, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const menuItems = [
  // Formulários de Cadastro - Primeiro
  { title: 'Resgate de Fauna', description: 'Registrar resgate de animais', icon: Bird, path: '/secao-operacional/resgate-cadastro' },
  { title: 'Crimes Ambientais', description: 'Registrar crimes ambientais', icon: AlertTriangle, path: '/secao-operacional/crimes-ambientais' },
  { title: 'Crimes Comuns', description: 'Registrar crimes comuns', icon: Shield, path: '/secao-operacional/crimes-comuns' },
  { title: 'Atividades de Prevenção', description: 'Registrar atividades educativas', icon: TreePine, path: '/secao-operacional/atividades-prevencao' },
  // Demais cards
  { title: 'Dashboard', description: 'Visualizar estatísticas', icon: BarChart, path: '/secao-operacional/dashboard' },
  { title: 'Hotspots', description: 'Mapa de ocorrências', icon: MapPin, path: '/secao-operacional/hotspots' },
  { title: 'Registros de Resgate', description: 'Todos os registros de resgate', icon: Table, path: '/secao-operacional/registros' },
  { title: 'Registros de Crimes Ambientais', description: 'Todos os crimes ambientais', icon: Briefcase, path: '/secao-operacional/registros-crimes' },
  { title: 'Registros de Crimes Comuns', description: 'Todos os crimes comuns', icon: Shield, path: '/secao-operacional/registros-crimes-comuns' },
  { title: 'Registros de Prevenção', description: 'Todas as atividades de prevenção', icon: TreePine, path: '/secao-operacional/registros-prevencao' },
  { title: 'Relatórios', description: 'Gerar relatórios', icon: FileText, path: '/secao-operacional/relatorios' },
  { title: 'Bens Apreendidos', description: 'Gerenciar apreensões', icon: Package, path: '/secao-operacional/bens-apreendidos' },
  { title: 'Cadastrar Fauna', description: 'Registrar novas espécies de fauna', icon: PlusCircle, path: '/secao-operacional/fauna-cadastro' },
  { title: 'Fauna Cadastrada', description: 'Listar espécies de fauna', icon: List, path: '/secao-operacional/fauna-cadastrada' },
  { title: 'Cadastrar Flora', description: 'Registrar espécies de flora', icon: Leaf, path: '/secao-operacional/flora-cadastro' },
  { title: 'Flora Cadastrada', description: 'Listar espécies de flora', icon: List, path: '/secao-operacional/flora-cadastrada' },
  { title: 'Monitorar RAPs', description: 'Processar RAPs automaticamente', icon: FolderSearch, path: '/secao-operacional/monitorar-raps' },
];

const SecaoOperacional: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const publicDashboardUrl = 'https://gestao-bpma.lovable.app/dashboard-publico';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicDashboardUrl);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar link');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 h-full overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Seção Operacional</h1>
        </div>
        
        {/* Botão Dashboard Público */}
        <div className="flex items-center gap-2">
          <a 
            href={publicDashboardUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard Público</span>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copiar Link</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="h-full bg-primary border-primary/50 hover:shadow-[0_0_25px_rgba(255,204,0,0.5)] transition-all duration-300 cursor-pointer group active:scale-95">
              <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col items-center text-center">
                <div className="p-2 sm:p-3 md:p-4 rounded-full bg-accent/10 mb-2 sm:mb-3 md:mb-4 group-hover:bg-accent/20 transition-colors">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-accent" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-foreground mb-1 sm:mb-2 line-clamp-2 hyphens-auto">{item.title}</h3>
                <p className="text-xs sm:text-sm text-primary-foreground/70 hidden sm:block line-clamp-2">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SecaoOperacional;
