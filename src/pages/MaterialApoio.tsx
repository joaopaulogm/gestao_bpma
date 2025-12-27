import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const menuItems = [
  { title: 'POP Ambiental', description: 'Procedimento Operacional Padrão', icon: BookOpen, path: '/material-apoio/pop' },
  { title: 'Identificar Espécie', description: 'Ferramenta de identificação', icon: Search, path: '/material-apoio/identificar-especie' },
  { title: 'Manual de RAP', description: 'Manual de Confecção de Relatório', icon: FileText, path: '/material-apoio/manual-rap' },
];

const MaterialApoio: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Material de Apoio</h1>
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

export default MaterialApoio;
