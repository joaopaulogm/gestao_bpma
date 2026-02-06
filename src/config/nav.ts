import type { LucideIcon } from 'lucide-react';
import {
  Home,
  LogIn,
  BookOpen,
  FileText,
  Search,
  MapPin,
  Trophy,
  Briefcase,
  BarChart3,
  FolderOpen,
  Presentation,
  PawPrint,
  List,
  Leaf,
  TreePine,
  Camera,
  Clipboard,
  AlertTriangle,
  Shield,
  Package,
  FileCheck,
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Target,
  UsersRound,
  UserMinus,
  Palmtree,
  Gift,
  Wrench,
  Settings,
  Radio,
  Truck,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: (AppRole | 'guest')[];
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  icon?: LucideIcon;
  items: NavItem[];
}

/** Fonte única de verdade para navegação: sidebar, /area-do-operador e homes das seções */
export const navSections: NavSection[] = [
  {
    title: 'Início',
    items: [{ path: '/area-do-operador', label: 'Página Inicial', icon: Home }],
  },
  {
    title: 'Área do Operador',
    icon: BookOpen,
    items: [
      { path: '/login', label: 'Fazer Login', icon: LogIn, roles: ['guest'] },
      {
        path: '/material-apoio',
        label: 'Material de Apoio',
        icon: BookOpen,
        roles: ['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando'],
        children: [
          { path: '/material-apoio/pop', label: 'POP', icon: FileText },
          { path: '/material-apoio/identificar-especie', label: 'Identificar Espécie', icon: Search },
          { path: '/material-apoio/manual-rap', label: 'Manual RAP', icon: BookOpen },
        ],
      },
      { path: '/mapa-localizacao', label: 'Mapa e Localização', icon: MapPin, roles: ['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando'] },
      { path: '/ranking', label: 'Ranking de Ocorrências', icon: Trophy, roles: ['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando'] },
      { path: '/radio-operador', label: 'Rádio Operador', icon: Radio, roles: ['operador_radio', 'secao_operacional', 'comando'] },
    ],
  },
  {
    title: 'Seção Operacional',
    icon: Briefcase,
    items: [
      {
        path: '/secao-operacional',
        label: 'Seção Operacional',
        icon: Briefcase,
        roles: ['secao_operacional'],
        children: [
          { path: '/secao-operacional/registrar-RAP', label: 'Registrar de RAP', icon: Clipboard },
          { path: '/secao-operacional/registros', label: 'Registros', icon: FolderOpen },
          { path: '/secao-operacional/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/secao-operacional/hotspots', label: 'Mapas e Mapa de Calor', icon: MapPin },
          { path: '/secao-operacional/relatorios', label: 'Relatórios', icon: FileText },
          { path: '/secao-operacional/controle-fauna-flora', label: 'Controle de Fauna e Flora', icon: PawPrint },
          { path: '/secao-operacional/apresentacao', label: 'Apresentação', icon: Presentation },
          { path: '/secao-operacional/monitorar-raps', label: 'Monitorar RAPs', icon: Camera },
          { path: '/secao-operacional/controle-os', label: 'Controle OS', icon: FileCheck },
        ],
      },
    ],
  },
  {
    title: 'Comando',
    icon: LayoutDashboard,
    items: [
      {
        path: '/comando',
        label: 'Comando',
        icon: LayoutDashboard,
        roles: ['comando', 'secao_operacional'],
        children: [
          { path: '/comando/agenda-OS', label: 'Agenda OS', icon: Calendar },
          { path: '/comando/agenda-CMD', label: 'Agenda CMD', icon: CalendarDays },
          { path: '/comando/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/comando/apresentacao', label: 'Apresentação', icon: Presentation },
          { path: '/comando/pessoal', label: 'Pessoal', icon: Users },
          { path: '/comando/pessoal/campanha', label: 'Campanha', icon: Target },
          { path: '/comando/pessoal/efetivo', label: 'Efetivo BPMA', icon: UsersRound },
          { path: '/comando/pessoal/equipes', label: 'Equipes', icon: Users },
          { path: '/comando/pessoal/escalas', label: 'Escalas', icon: Calendar },
          { path: '/comando/pessoal/afastamentos', label: 'Afastamentos', icon: UserMinus },
          { path: '/comando/pessoal/licencas', label: 'Licenças', icon: FileCheck },
          { path: '/comando/pessoal/ferias', label: 'Férias', icon: Palmtree },
          { path: '/comando/pessoal/abono', label: 'Abono', icon: Gift },
          { path: '/comando/logistica', label: 'Logística', icon: Wrench },
        ],
      },
    ],
  },
  {
    title: 'Seção Pessoas',
    icon: Users,
    items: [
      {
        path: '/secao-pessoas',
        label: 'Seção Pessoas',
        icon: Users,
        roles: ['secao_pessoas'],
        children: [
          { path: '/secao-pessoas/campanha', label: 'Campanha', icon: Target },
          { path: '/secao-pessoas/efetivo', label: 'Efetivo BPMA', icon: UsersRound },
          { path: '/secao-pessoas/equipes', label: 'Equipes', icon: Users },
          { path: '/secao-pessoas/escalas', label: 'Escalas', icon: Calendar },
          { path: '/secao-pessoas/afastamentos', label: 'Afastamentos', icon: UserMinus },
          { path: '/secao-pessoas/licencas', label: 'Licenças', icon: FileCheck },
          { path: '/secao-pessoas/ferias', label: 'Férias', icon: Palmtree },
          { path: '/secao-pessoas/abono', label: 'Abono', icon: Gift },
        ],
      },
    ],
  },
  {
    title: 'Seção Logística',
    icon: Wrench,
    items: [
      {
        path: '/secao-logistica',
        label: 'Seção Logística',
        icon: Wrench,
        roles: ['secao_logistica'],
        children: [
          { path: '/secao-logistica/frota', label: 'Gestão de Frota', icon: Truck },
          { path: '/secao-logistica/bens-equipamentos', label: 'Gestão de Bens e Equipamentos', icon: Package },
          { path: '/secao-logistica/patrimonio', label: 'Painel de Gestão do Patrimônio', icon: BarChart3 },
        ],
      },
    ],
  },
  {
    title: 'Administração',
    icon: Settings,
    items: [
      { path: '/gerenciar-permissoes', label: 'Gerenciar Permissões', icon: Settings, roles: ['admin'] },
    ],
  },
];

/**
 * Retorna os itens para exibir como cards na home de uma seção.
 * Para seções com children (ex: /secao-operacional, /comando), retorna os children.
 * Para seções sem children, retorna um array com o próprio item.
 */
export function getSectionCardItems(sectionPath: string): NavItem[] {
  for (const sec of navSections) {
    for (const item of sec.items) {
      if (item.path === sectionPath) {
        if (item.children?.length) return item.children;
        return [item];
      }
    }
  }
  return [];
}

/** Retorna a seção (título e ícone) pelo path do primeiro item da seção (ex: /secao-operacional, /comando). */
export function getSectionByPath(sectionPath: string): NavSection | null {
  for (const sec of navSections) {
    for (const item of sec.items) {
      if (item.path === sectionPath) return sec;
    }
  }
  return null;
}

/**
 * Retorna itens para cards de uma seção pelo título (ex: "Área do Operador").
 * Achata: itens com children viram [item, ...children], sem children viram [item].
 */
export function getSectionFlatCardItemsByTitle(sectionTitle: string): NavItem[] {
  const sec = navSections.find((s) => s.title === sectionTitle);
  if (!sec) return [];
  const flat: NavItem[] = [];
  for (const item of sec.items) {
    if (item.children?.length) {
      flat.push(item, ...item.children);
    } else {
      flat.push(item);
    }
  }
  return flat;
}

/**
 * Retorna itens para exibir como cards na home (/area-do-operador), alinhados ao sidebar e às homes das seções.
 * Para itens com children (ex: Comando, Seção Operacional), retorna os children.
 * Para itens sem children, retorna o próprio item.
 */
export function getHomeCardItemsForSection(sectionTitle: string): NavItem[] {
  const sec = navSections.find((s) => s.title === sectionTitle);
  if (!sec) return [];
  const cards: NavItem[] = [];
  for (const item of sec.items) {
    if (item.children?.length) {
      cards.push(...item.children);
    } else {
      cards.push(item);
    }
  }
  return cards;
}
