import { Link } from 'react-router-dom';
import { Clipboard, LogIn, Shield, BookOpen, Lock, Trophy, Briefcase, Users, Wrench, Settings, HeartHandshake, BarChart3, FileText, Database, AlertTriangle, TreePine, Package, ClipboardList, LayoutDashboard, Calendar, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoBpma from '@/assets/logo-bpma.svg';
import { useIsMobile } from '@/hooks/use-mobile';
import { useViewportCompact } from '@/hooks/use-viewport-compact';
const CheckeredDivider = () => {
  const isMobile = useIsMobile();
  const count = isMobile ? 10 : 20;
  return <div className="flex gap-[2px] sm:gap-[3px]">
      {Array.from({
      length: count
    }).map((_, i) => <div key={`checkered-${i}`} className="flex flex-col gap-[2px] sm:gap-[3px]">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${i % 2 === 0 ? 'bg-primary' : 'bg-transparent'}`} />
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${i % 2 === 1 ? 'bg-primary' : 'bg-transparent'}`} />
        </div>)}
    </div>;
};
import type { ElementType } from 'react';
interface HomeCardProps {
  title: string;
  icon: ElementType;
  to: string;
}
const HomeCard = ({
  title,
  icon: Icon,
  to
}: HomeCardProps) => {
  return <Link to={to} className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl 
        bg-primary border border-primary/50
        shadow-[0_3px_0_0_#041230,0_4px_8px_rgba(0,0,0,0.3)]
        hover:shadow-[0_1px_0_0_#041230,0_3px_6px_rgba(0,0,0,0.2),0_0_12px_rgba(255,204,0,0.4)]
        hover:translate-y-[1px]
        active:shadow-[0_0px_0_0_#041230,0_1px_3px_rgba(0,0,0,0.1)]
        active:translate-y-[3px]
        transition-all duration-150 aspect-square w-[75%] mx-auto">
      <Icon className="w-[34%] h-[34%] text-accent shrink-0" />
      <span className="text-[clamp(10px,2.5vw,14px)] font-semibold text-center text-primary-foreground leading-tight break-words hyphens-auto px-1 line-clamp-2">{title}</span>
    </Link>;
};

// Componente para Atividade Operacional (todos os usuários autenticados)
const AtividadeOperacionalSection = () => <div className="space-y-3 sm:space-y-4">
    <div className="flex items-center gap-2 text-primary font-semibold px-1">
      <Lock className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Início</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <HomeCard title="Material de Apoio" icon={BookOpen} to="/material-apoio" />
      <HomeCard title="POP" icon={BookOpen} to="/material-apoio/pop" />
      <HomeCard title="Identificar Espécie" icon={BookOpen} to="/material-apoio/identificar-especie" />
      <HomeCard title="Manual RAP" icon={BookOpen} to="/material-apoio/manual-rap" />
      <HomeCard title="Mapa e Localização" icon={Clipboard} to="/mapa-localizacao" />
      <HomeCard title="Ranking de Ocorrências" icon={Trophy} to="/ranking" />
    </div>
  </div>;

// Componente para Seção Operacional (mesmos cards que /secao-operacional)
const SecaoOperacionalSection = () => <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
    <div className="flex items-center gap-2 text-primary font-semibold px-1">
      <Briefcase className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Seção Operacional</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <HomeCard title="Resgate de Fauna" icon={HeartHandshake} to="/secao-operacional/resgate-cadastro" />
      <HomeCard title="Crimes Ambientais" icon={AlertTriangle} to="/secao-operacional/crimes-ambientais" />
      <HomeCard title="Crimes Comuns" icon={Shield} to="/secao-operacional/crimes-comuns" />
      <HomeCard title="Atividades de Prevenção" icon={TreePine} to="/secao-operacional/atividades-prevencao" />
      <HomeCard title="Dashboard" icon={BarChart3} to="/secao-operacional/dashboard" />
      <HomeCard title="Registros" icon={Clipboard} to="/secao-operacional/registros" />
      <HomeCard title="Hotspots" icon={Trophy} to="/secao-operacional/hotspots" />
      <HomeCard title="Relatórios" icon={FileText} to="/secao-operacional/relatorios" />
      <HomeCard title="Bens Apreendidos" icon={Package} to="/secao-operacional/bens-apreendidos" />
      <HomeCard title="Cadastrar Fauna" icon={Clipboard} to="/secao-operacional/fauna-cadastro" />
      <HomeCard title="Fauna Cadastrada" icon={Database} to="/secao-operacional/fauna-cadastrada" />
      <HomeCard title="Cadastrar Flora" icon={Clipboard} to="/secao-operacional/flora-cadastro" />
      <HomeCard title="Flora Cadastrada" icon={Database} to="/secao-operacional/flora-cadastrada" />
      <HomeCard title="Controle de OS" icon={ClipboardList} to="/secao-operacional/controle-os" />
      <HomeCard title="Monitorar RAPs" icon={Briefcase} to="/secao-operacional/monitorar-raps" />
    </div>
  </div>;

// Componente para Comando (admin + comando)
const ComandoSection = () => (
  <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
    <div className="flex items-center gap-2 text-primary font-semibold px-1">
      <LayoutDashboard className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Comando</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <HomeCard title="Comando" icon={LayoutDashboard} to="/comando" />
      <HomeCard title="Agenda OS" icon={Calendar} to="/comando/agenda-OS" />
      <HomeCard title="Agenda CMD" icon={CalendarDays} to="/comando/agenda-CMD" />
      <HomeCard title="Dashboard" icon={BarChart3} to="/comando/dashboard" />
      <HomeCard title="Pessoal" icon={Users} to="/comando/pessoal" />
      <HomeCard title="Logística" icon={Wrench} to="/comando/logistica" />
    </div>
  </div>
);

// Componente para Seção de Pessoas
const SecaoPessoasSection = () => <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
    <div className="flex items-center gap-2 text-primary font-semibold px-1">
      <Users className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Seção de Pessoas</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <HomeCard title="Seção de Pessoas" icon={Users} to="/secao-pessoas" />
      <HomeCard title="Efetivo BPMA" icon={Users} to="/secao-pessoas/efetivo" />
      <HomeCard title="Equipes" icon={Users} to="/secao-pessoas/equipes" />
      <HomeCard title="Escalas" icon={Users} to="/secao-pessoas/escalas" />
      <HomeCard title="Afastamentos" icon={Users} to="/secao-pessoas/afastamentos" />
      <HomeCard title="Licenças" icon={Users} to="/secao-pessoas/licencas" />
      <HomeCard title="Férias" icon={Users} to="/secao-pessoas/ferias" />
      <HomeCard title="Minuta Férias" icon={FileText} to="/secao-pessoas/ferias/minuta" />
      <HomeCard title="Abono" icon={Users} to="/secao-pessoas/abono" />
      <HomeCard title="Minuta Abono" icon={FileText} to="/secao-pessoas/abono/minuta" />
      <HomeCard title="Campanha" icon={Users} to="/secao-pessoas/campanha" />
    </div>
  </div>;

// Componente para Seção de Logística
const SecaoLogisticaSection = () => <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
    <div className="flex items-center gap-2 text-primary font-semibold px-1">
      <Wrench className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Seção de Logística</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <HomeCard title="Seção de Logística" icon={Wrench} to="/secao-logistica" />
    </div>
  </div>;

// Componente para Administração (apenas admin)
const AdministracaoSection = () => <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
    <div className="flex items-center gap-2 text-primary font-semibold px-1">
      <Settings className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Administração</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <HomeCard title="Gerenciar Permissões" icon={Settings} to="/gerenciar-permissoes" />
    </div>
  </div>;
const Index = () => {
  const {
    isAuthenticated,
    isAdmin,
    userRole,
  } = useAuth();

  // Determinar quais seções mostrar com base no role
  const showComando = isAdmin || userRole === 'comando';
  const showSecaoOperacional = isAdmin || userRole === 'secao_operacional';
  const showSecaoPessoas = isAdmin || userRole === 'secao_pessoas';
  const showSecaoLogistica = isAdmin || userRole === 'secao_logistica';
  const showAdministracao = isAdmin;
  const compact = useViewportCompact();
  return <div className={compact ? 'p-4 min-h-screen' : 'p-4 sm:p-6 md:p-6 lg:p-6 xl:p-8 min-h-screen'}>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center mx-auto mb-4 sm:mb-5">
          <div className="relative transition-all duration-300 hover:scale-105" style={{
          filter: `
                drop-shadow(0 2px 4px rgba(7, 29, 73, 0.4))
                drop-shadow(0 4px 8px rgba(7, 29, 73, 0.3))
                drop-shadow(0 8px 16px rgba(7, 29, 73, 0.2))
                drop-shadow(0 16px 32px rgba(7, 29, 73, 0.15))
                drop-shadow(0 0 0 1px rgba(7, 29, 73, 0.1))
              `
        }}>
            <img src={logoBpma} alt="Logo BPMA" className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-contain relative z-10" style={{
            filter: `
                  drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))
                  drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))
                `
          }} />
            {/* Efeito de brilho sutil e auto-relevo */}
            <div className="absolute inset-0 rounded-full opacity-30 blur-2xl pointer-events-none" style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(7, 29, 73, 0.5) 0%, rgba(7, 29, 73, 0.2) 40%, transparent 70%)',
            transform: 'scale(1.3)',
            zIndex: 0
          }} />
            {/* Efeito de luz superior para auto-relevo */}
            <div className="absolute inset-0 rounded-full opacity-40 blur-sm pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
            transform: 'scale(1.1)',
            zIndex: 1
          }} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <CheckeredDivider />
          <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-[#071d49] whitespace-nowrap tracking-tight">
            Gestão - BPMA
          </h1>
          <CheckeredDivider />
        </div>
        <p className="text-muted-foreground text-base sm:text-lg px-4">Sistema de Gestão de Administrativa e Operacional</p>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {isAuthenticated ? (/* Usuário autenticado - mostrar seções conforme permissão */
      <>
            {/* Atividade Operacional - TODOS os usuários autenticados têm acesso */}
            <AtividadeOperacionalSection />

            {/* Comando - admin ou comando */}
            {showComando && <ComandoSection />}
            
            {/* Seção Operacional - apenas secao_operacional ou admin */}
            {showSecaoOperacional && <SecaoOperacionalSection />}
            
            {/* Seção de Pessoas - apenas secao_pessoas ou admin */}
            {showSecaoPessoas && <SecaoPessoasSection />}
            
            {/* Seção de Logística - apenas secao_logistica ou admin */}
            {showSecaoLogistica && <SecaoLogisticaSection />}
            
            {/* Administração - apenas admin */}
            {showAdministracao && <AdministracaoSection />}
          </>
        ) : (/* Usuário não autenticado - mostrar apenas botão de login */
      <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold px-1">
              <Lock className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Área Restrita</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              <HomeCard title="Fazer Login" icon={LogIn} to="/login" />
            </div>
          </div>)}

        {/* Footer with Legal Links */}
        <footer className="pt-8 pb-4 border-t border-border/30 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-muted-foreground">
            <Link to="/politica-privacidade" className="hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/politica-cookies" className="hover:text-primary transition-colors">
              Política de Cookies
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/termos-uso" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-3">
            © {new Date().getFullYear()} BPMA - Todos os direitos reservados
          </p>
        </footer>
      </div>
    </div>;
};
export default Index;