import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, BarChart, MapPin, Table, FileText, Package, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

const menuItems = [
  { title: 'Cadastrar Fauna', description: 'Registrar novas espécies de fauna', icon: PlusCircle, path: '/secao-operacional/fauna-cadastro' },
  { title: 'Fauna Cadastrada', description: 'Listar espécies de fauna', icon: List, path: '/secao-operacional/fauna-cadastrada' },
  { title: 'Dashboard', description: 'Visualizar estatísticas', icon: BarChart, path: '/secao-operacional/dashboard' },
  { title: 'Hotspots', description: 'Mapa de ocorrências', icon: MapPin, path: '/secao-operacional/hotspots' },
  { title: 'Registros de Resgate', description: 'Todos os registros de resgate', icon: Table, path: '/secao-operacional/registros' },
  { title: 'Registros de Crimes', description: 'Todos os registros de crimes', icon: Briefcase, path: '/secao-operacional/registros-crimes' },
  { title: 'Relatórios', description: 'Gerar relatórios', icon: FileText, path: '/secao-operacional/relatorios' },
  { title: 'Bens Apreendidos', description: 'Gerenciar apreensões', icon: Package, path: '/secao-operacional/bens-apreendidos' },
  { title: 'Cadastrar Flora', description: 'Registrar espécies de flora', icon: Leaf, path: '/secao-operacional/flora-cadastro' },
  { title: 'Flora Cadastrada', description: 'Listar espécies de flora', icon: List, path: '/secao-operacional/flora-cadastrada' },
];

const SecaoOperacional: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Seção Operacional</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="h-full bg-primary border-primary/50 hover:shadow-[0_0_25px_rgba(255,204,0,0.5)] transition-all duration-300 cursor-pointer group active:scale-95">
              <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col items-center text-center">
                <div className="p-2 sm:p-3 md:p-4 rounded-full bg-accent/10 mb-2 sm:mb-3 md:mb-4 group-hover:bg-accent/20 transition-colors">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-accent" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-foreground mb-1 sm:mb-2 line-clamp-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-primary-foreground/70 hidden sm:block">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SecaoOperacional;
