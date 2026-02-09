import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Search,
  FileText,
  Calendar,
  Bell,
  User,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import SillitoeTartan from '@/components/SillitoeTartan';
import { cn } from '@/lib/utils';

const SIDEBAR_BG = 'bg-[#071d49]'; /* Azul PMDF – Regulamento Identidade Visual */
const SIDEBAR_ACTIVE = 'bg-white/15 rounded-lg';

const sidebarLinks = [
  { path: '/area-do-operador', icon: Home, label: 'Início' },
  { path: '/radio-operador', icon: LayoutDashboard, label: 'Visão geral' },
  { path: '/secao-operacional', icon: Users, label: 'Clientes' },
  { path: '/secao-operacional', icon: Building2, label: 'Organizações' },
  { path: '/perfil', icon: Settings, label: 'Configurações' },
];

interface RadioOperadorLayoutProps {
  children: React.ReactNode;
}

export default function RadioOperadorLayout({ children }: RadioOperadorLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-white">
      {/* Sidebar roxa */}
      <aside
        className={cn(
          'flex w-16 flex-shrink-0 flex-col items-center py-4 text-white',
          SIDEBAR_BG
        )}
      >
        {sidebarLinks.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === '/radio-operador'
              ? location.pathname === '/radio-operador'
              : location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path + label}
              to={path}
              className={cn(
                'mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                isActive ? SIDEBAR_ACTIVE : 'hover:bg-white/10'
              )}
              title={label}
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header branco */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <nav className="flex items-center gap-6 text-sm text-gray-700">
            <Link
              to="/area-do-operador"
              className="hover:text-[#071d49] font-medium transition-colors"
            >
              Início
            </Link>
            <Link
              to="/secao-operacional"
              className="hover:text-[#071d49] transition-colors"
            >
              Clientes
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-[#071d49] transition-colors">
                Organizações
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <span className="text-gray-500 text-xs">Atualizar conta</span>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {format(new Date(), "d 'de' MMMM, yyyy", { locale: ptBR })}
            </span>
            <span className="text-sm text-[#071d49] font-medium cursor-pointer hover:underline">
              Chat
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Pesquisar"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Documentos"
              >
                <FileText className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Calendário"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Notificações"
              >
                <Bell className="h-4 w-4" />
              </button>
              <Link
                to="/perfil"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Perfil"
              >
                <User className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Faixa quadriculada Sillitoe Tartan (Regulamento Identidade Visual 1.19) */}
        <div className="flex-shrink-0 overflow-hidden">
          <SillitoeTartan rows={2} variant="blueWhite" squareSize={8} gap={1} className="w-full justify-center" />
        </div>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-auto bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
