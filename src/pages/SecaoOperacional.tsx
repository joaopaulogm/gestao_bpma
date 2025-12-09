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
  { title: 'Lista de Registros', description: 'Todos os registros', icon: Table, path: '/secao-operacional/registros' },
  { title: 'Relatórios', description: 'Gerar relatórios', icon: FileText, path: '/secao-operacional/relatorios' },
  { title: 'Bens Apreendidos', description: 'Gerenciar apreensões', icon: Package, path: '/secao-operacional/bens-apreendidos' },
  { title: 'Cadastrar Flora', description: 'Registrar espécies de flora', icon: Leaf, path: '/secao-operacional/flora-cadastro' },
  { title: 'Flora Cadastrada', description: 'Listar espécies de flora', icon: List, path: '/secao-operacional/flora-cadastrada' },
];

const SecaoOperacional: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Briefcase className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Seção Operacional</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="h-full bg-[#071d49] border-[#071d49]/50 hover:shadow-[0_0_25px_rgba(255,204,0,0.5)] transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-[#ffcc00]/10 mb-4 group-hover:bg-[#ffcc00]/20 transition-colors">
                  <item.icon className="h-8 w-8 text-[#ffcc00]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/70">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SecaoOperacional;
