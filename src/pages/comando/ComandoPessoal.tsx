import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, UserMinus, FileCheck, Palmtree, Gift, UsersRound, Target, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Campanha', description: 'Calendário de campanha', icon: Target, path: '/comando/pessoal/campanha' },
  { title: 'Efetivo BPMA', description: 'Gerenciar efetivo policial', icon: Users, path: '/comando/pessoal/efetivo' },
  { title: 'Equipes', description: 'Gerenciar equipes de serviço', icon: UsersRound, path: '/comando/pessoal/equipes' },
  { title: 'Escalas', description: 'Escalas de serviço', icon: Calendar, path: '/comando/pessoal/escalas' },
  { title: 'Afastamentos', description: 'Registros de afastamentos', icon: UserMinus, path: '/comando/pessoal/afastamentos' },
  { title: 'Licenças', description: 'Licenças concedidas', icon: FileCheck, path: '/comando/pessoal/licencas' },
  { title: 'Férias', description: 'Controle de férias', icon: Palmtree, path: '/comando/pessoal/ferias' },
  { title: 'Abono', description: 'Dias de abono', icon: Gift, path: '/comando/pessoal/abono' },
];

const ComandoPessoal: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/comando">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 sm:gap-3">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pessoal</h1>
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

export default ComandoPessoal;
