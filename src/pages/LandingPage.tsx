import { Link } from 'react-router-dom';
import { Shield, BarChart3, Leaf, MapPin, LogIn, FileText } from 'lucide-react';
import logoBpma from '@/assets/logo-bpma.png';
import { useViewportCompact } from '@/hooks/use-viewport-compact';

const LandingPage = () => {
  const compact = useViewportCompact();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#071d49]/5 via-background to-background">
      {/* Hero - padding e títulos reduzidos em viewport compacto (ex.: 1366×768) */}
      <header className={compact ? 'relative overflow-hidden py-8 sm:py-10 px-4 sm:px-6' : 'relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6'}>
        {/* Fundo com gradiente animado sutil */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,204,0,0.15), transparent)',
            animation: 'pulse-slow 4s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes pulse-slow { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.35; } }
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
          .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
          .delay-300 { animation-delay: 300ms; }
          .delay-400 { animation-delay: 400ms; }
          .delay-500 { animation-delay: 500ms; }
        `}</style>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Logo com animação */}
          <div 
            className="inline-flex justify-center mb-6 opacity-0 animate-scale-in"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="relative">
              <img 
                src={logoBpma} 
                alt="BPMA" 
                className={compact ? 'h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain drop-shadow-lg' : 'h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 object-contain drop-shadow-lg'}
              />
              <div className="absolute inset-0 rounded-full bg-[#ffcc00]/10 blur-2xl -z-10" />
            </div>
          </div>

          <h1 
            className={compact ? 'text-2xl sm:text-3xl md:text-3xl font-bold text-[#071d49] mb-3 opacity-0 animate-fade-in-up delay-100' : 'text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#071d49] mb-3 opacity-0 animate-fade-in-up delay-100'}
            style={{ animationFillMode: 'forwards' }}
          >
            Gestão BPMA
          </h1>
          <p 
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-2 opacity-0 animate-fade-in-up delay-200"
            style={{ animationFillMode: 'forwards' }}
          >
            Sistema de Gestão Administrativa e Operacional
          </p>
          <p 
            className="text-sm sm:text-base text-muted-foreground/80 max-w-xl mx-auto mb-10 opacity-0 animate-fade-in-up delay-300"
            style={{ animationFillMode: 'forwards' }}
          >
            Batalhão de Polícia Militar Ambiental
          </p>

          {/* CTA */}
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[#071d49] 
              bg-[#ffcc00] hover:bg-[#e6b800] shadow-lg shadow-[#ffcc00]/25 
              transition-all duration-300 hover:shadow-[#ffcc00]/40 hover:scale-[1.02] active:scale-[0.98]
              opacity-0 animate-fade-in-up delay-400"
            style={{ animationFillMode: 'forwards' }}
          >
            <LogIn className="h-5 w-5" />
            Acessar o sistema
          </Link>
        </div>
      </header>

      {/* Seção: O que é o app - padding alinhado ao Layout/Index */}
      <section className={compact ? 'flex-1 py-8 sm:py-10 px-4 sm:px-6' : 'flex-1 py-12 sm:py-16 px-4 sm:px-6'}>
        <div className="max-w-4xl mx-auto">
          <h2 
            className={compact ? 'text-lg sm:text-xl font-semibold text-[#071d49] text-center mb-6 opacity-0 animate-fade-in-up delay-300' : 'text-xl sm:text-2xl md:text-2xl lg:text-2xl font-semibold text-[#071d49] text-center mb-8 opacity-0 animate-fade-in-up delay-300'}
            style={{ animationFillMode: 'forwards' }}
          >
            O que é o Gestão BPMA?
          </h2>
          <p 
            className="text-muted-foreground text-center max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in-up delay-400"
            style={{ animationFillMode: 'forwards' }}
          >
            Plataforma digital para o gerenciamento de ocorrências ambientais, controle de efetivo, 
            escalas de serviço e atividades operacionais do Batalhão de Polícia Militar Ambiental. 
            Acesso restrito a integrantes devidamente cadastrados.
          </p>

          {/* Cards de funcionalidades */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: BarChart3, title: 'Dashboard', desc: 'Indicadores e relatórios operacionais' },
              { icon: Leaf, title: 'Fauna e Flora', desc: 'Cadastro e acompanhamento de espécies' },
              { icon: MapPin, title: 'Mapas', desc: 'Localização e camadas geográficas' },
              { icon: Shield, title: 'Segurança', desc: 'Controle de acesso por perfil' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div 
                key={title}
                className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm 
                  hover:border-[#071d49]/20 hover:shadow-md transition-all duration-300
                  opacity-0 animate-fade-in-up"
                style={{ animationFillMode: 'forwards', animationDelay: `${400 + i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#071d49]/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-[#071d49]" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Link para dashboard público (se existir) */}
          <div className="text-center mt-10">
            <Link 
              to="/dashboard-publico" 
              className="text-sm text-muted-foreground hover:text-[#071d49] transition-colors inline-flex items-center gap-1.5"
            >
              <BarChart3 className="h-4 w-4" />
              Ver dashboard público
            </Link>
          </div>
        </div>
      </section>

      {/* Footer com Política de Privacidade e Termos */}
      <footer className="border-t border-border/50 bg-muted/30 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
          <Link 
            to="/politica-privacidade" 
            className="text-muted-foreground hover:text-[#071d49] transition-colors flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4" />
            Política de Privacidade
          </Link>
          <span className="hidden sm:inline text-muted-foreground/50">•</span>
          <Link 
            to="/termos-uso" 
            className="text-muted-foreground hover:text-[#071d49] transition-colors"
          >
            Termos de Uso
          </Link>
          <span className="hidden sm:inline text-muted-foreground/50">•</span>
          <Link 
            to="/politica-cookies" 
            className="text-muted-foreground hover:text-[#071d49] transition-colors"
          >
            Política de Cookies
          </Link>
        </div>
        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          © {new Date().getFullYear()} BPMA - Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
