import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SidebarLayout from '@/components/SidebarLayout';
import CookieConsentBanner from '@/components/CookieConsentBanner';

// Lazy load all pages
const LandingPage = lazy(() => import(/* webpackChunkName: "landing" */ '@/pages/LandingPage'));
const Index = lazy(() => import(/* webpackChunkName: "index" */ '@/pages/Index'));
const DashboardOperacional = lazy(() => import(/* webpackChunkName: "dashboard-operacional" */ '@/pages/DashboardOperacional'));
const Hotspots = lazy(() => import(/* webpackChunkName: "hotspots" */ '@/pages/Hotspots'));
const ResgateCadastro = lazy(() => import(/* webpackChunkName: "resgate-cadastro" */ '@/pages/ResgateCadastro'));
const Relatorios = lazy(() => import(/* webpackChunkName: "relatorios" */ '@/pages/Relatorios'));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ '@/pages/NotFound'));
const Login = lazy(() => import(/* webpackChunkName: "login" */ '@/pages/Login'));
const BensApreendidosCadastro = lazy(() => import(/* webpackChunkName: "bens-apreendidos" */ '@/pages/BensApreendidosCadastro'));
const EfetivoBPMA = lazy(() => import(/* webpackChunkName: "efetivo" */ '@/pages/EfetivoBPMA'));
const POP = lazy(() => import(/* webpackChunkName: "pop" */ '@/pages/POP'));
const CrimesAmbientaisCadastro = lazy(() => import(/* webpackChunkName: "crimes" */ '@/pages/CrimesAmbientaisCadastro'));
const CrimesComuns = lazy(() => import(/* webpackChunkName: "crimes-comuns" */ '@/pages/CrimesComuns'));
const GerenciarPermissoes = lazy(() => import(/* webpackChunkName: "gerenciar-permissoes" */ '@/pages/GerenciarPermissoes'));
const SecaoPessoas = lazy(() => import(/* webpackChunkName: "secao-pessoas" */ '@/pages/SecaoPessoas'));
const Equipes = lazy(() => import(/* webpackChunkName: "equipes" */ '@/pages/pessoas/Equipes'));
const Escalas = lazy(() => import(/* webpackChunkName: "escalas" */ '@/pages/pessoas/Escalas'));
const Afastamentos = lazy(() => import(/* webpackChunkName: "afastamentos" */ '@/pages/pessoas/Afastamentos'));
const Licencas = lazy(() => import(/* webpackChunkName: "licencas" */ '@/pages/pessoas/Licencas'));
const Ferias = lazy(() => import(/* webpackChunkName: "ferias" */ '@/pages/pessoas/Ferias'));
const Abono = lazy(() => import(/* webpackChunkName: "abono" */ '@/pages/pessoas/Abono'));
const MinutaFerias = lazy(() => import(/* webpackChunkName: "minuta-ferias" */ '@/pages/pessoas/MinutaFerias'));
const MinutaAbono = lazy(() => import(/* webpackChunkName: "minuta-abono" */ '@/pages/pessoas/MinutaAbono'));
const Campanha = lazy(() => import(/* webpackChunkName: "campanha" */ '@/pages/pessoas/Campanha'));
const CampanhaDia = lazy(() => import(/* webpackChunkName: "campanha-dia" */ '@/pages/pessoas/CampanhaDia'));
const SecaoOperacional = lazy(() => import(/* webpackChunkName: "secao-operacional" */ '@/pages/SecaoOperacional'));
const RegistrarRAP = lazy(() => import(/* webpackChunkName: "registrar-rap" */ '@/pages/secao-operacional/RegistrarRAP'));
const ControleFaunaFlora = lazy(() => import(/* webpackChunkName: "controle-fauna-flora" */ '@/pages/secao-operacional/ControleFaunaFlora'));
const SecaoLogistica = lazy(() => import(/* webpackChunkName: "secao-logistica" */ '@/pages/SecaoLogistica'));
const Comando = lazy(() => import(/* webpackChunkName: "comando" */ '@/pages/Comando'));
const AgendaOS = lazy(() => import(/* webpackChunkName: "comando-agenda-os" */ '@/pages/comando/AgendaOS'));
const AgendaCMD = lazy(() => import(/* webpackChunkName: "comando-agenda-cmd" */ '@/pages/comando/AgendaCMD'));
const ComandoPessoal = lazy(() => import(/* webpackChunkName: "comando-pessoal" */ '@/pages/comando/ComandoPessoal'));
const ApresentacaoBPMADeck = lazy(() => import(/* webpackChunkName: "apresentacao-bpma" */ '@/pages/apresentacao/ApresentacaoBPMADeck'));
const MaterialApoio = lazy(() => import(/* webpackChunkName: "material-apoio" */ '@/pages/MaterialApoio'));
const IdentificarEspecie = lazy(() => import(/* webpackChunkName: "identificar-especie" */ '@/pages/apoio/IdentificarEspecie'));
const ManualRAP = lazy(() => import(/* webpackChunkName: "manual-rap" */ '@/pages/apoio/ManualRAP'));
const RankingOcorrencias = lazy(() => import(/* webpackChunkName: "ranking" */ '@/pages/RankingOcorrencias'));
const AtividadesPrevencao = lazy(() => import(/* webpackChunkName: "atividades-prevencao" */ '@/pages/AtividadesPrevencao'));
const DashboardPublico = lazy(() => import(/* webpackChunkName: "dashboard-publico" */ '@/pages/DashboardPublico'));
const ControleOS = lazy(() => import(/* webpackChunkName: "controle-os" */ '@/pages/ControleOS'));
const RegistrosUnificados = lazy(() => import(/* webpackChunkName: "registros-unificados" */ '@/pages/RegistrosUnificados'));
const RegistroDetalhes = lazy(() => import(/* webpackChunkName: "registro-detalhes" */ '@/pages/RegistroDetalhes'));
const MonitorarRAPs = lazy(() => import(/* webpackChunkName: "monitorar-raps" */ '@/pages/MonitorarRAPs'));
const Perfil = lazy(() => import(/* webpackChunkName: "perfil" */ '@/pages/Perfil'));
const MapaLocalizacao = lazy(() => import(/* webpackChunkName: "mapa-localizacao" */ '@/pages/MapaLocalizacao'));
const RadioOperador = lazy(() => import(/* webpackChunkName: "radio-operador" */ '@/pages/RadioOperador'));

// Legal pages
const PoliticaPrivacidade = lazy(() => import(/* webpackChunkName: "politica-privacidade" */ '@/pages/PoliticaPrivacidade'));
const PoliticaCookies = lazy(() => import(/* webpackChunkName: "politica-cookies" */ '@/pages/PoliticaCookies'));
const TermosUso = lazy(() => import(/* webpackChunkName: "termos-uso" */ '@/pages/TermosUso'));

const queryClient = new QueryClient();

const PageLoading = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard-publico" element={<DashboardPublico />} />
              
              {/* Legal pages - public */}
              <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/politica-cookies" element={<PoliticaCookies />} />
              <Route path="/termos-uso" element={<TermosUso />} />
              
              {/* Página inicial pública - sem login */}
              <Route path="/" element={<LandingPage />} />
              {/* Área do Operador (página inicial autenticada); admin vê tudo; /inicio redireciona para manter links antigos */}
              <Route path="/area-do-operador" element={<ProtectedRoute requiredRoles={['operador', 'operador_radio', 'secao_operacional', 'secao_pessoas', 'secao_logistica', 'comando']}><SidebarLayout><Index /></SidebarLayout></ProtectedRoute>} />
              <Route path="/inicio" element={<Navigate to="/area-do-operador" replace />} />
              
              {/* Área do Operador: Material de Apoio, Mapa, Ranking (operador + seções + comando) */}
              <Route path="/resgate-cadastro" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><ResgateCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/material-apoio" element={<ProtectedRoute requiredRoles={['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando']}><SidebarLayout><MaterialApoio /></SidebarLayout></ProtectedRoute>} />
              <Route path="/material-apoio/pop" element={<ProtectedRoute requiredRoles={['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando']}><SidebarLayout><POP /></SidebarLayout></ProtectedRoute>} />
              <Route path="/material-apoio/identificar-especie" element={<ProtectedRoute requiredRoles={['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando']}><SidebarLayout><IdentificarEspecie /></SidebarLayout></ProtectedRoute>} />
              <Route path="/material-apoio/manual-rap" element={<ProtectedRoute requiredRoles={['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando']}><SidebarLayout><ManualRAP /></SidebarLayout></ProtectedRoute>} />
              <Route path="/ranking" element={<ProtectedRoute requiredRoles={['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando']}><SidebarLayout><RankingOcorrencias /></SidebarLayout></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute requiredRoles={['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando']}><SidebarLayout><Perfil /></SidebarLayout></ProtectedRoute>} />
              <Route path="/mapa-localizacao" element={<ProtectedRoute requiredRoles={['operador', 'secao_pessoas', 'secao_operacional', 'secao_logistica', 'comando']}><SidebarLayout><MapaLocalizacao /></SidebarLayout></ProtectedRoute>} />
              {/* Rádio Operador: apenas operador_radio, secao_operacional, comando */}
              <Route path="/radio-operador" element={<ProtectedRoute requiredRoles={['operador_radio', 'secao_operacional', 'comando']}><SidebarLayout><RadioOperador /></SidebarLayout></ProtectedRoute>} />
              
              {/* Admin only */}
              <Route path="/gerenciar-permissoes" element={<ProtectedRoute requireAdmin><SidebarLayout><GerenciarPermissoes /></SidebarLayout></ProtectedRoute>} />
              
              {/* Seção Operacional */}
              <Route path="/secao-operacional" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><SecaoOperacional /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/registrar-RAP" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><RegistrarRAP /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/controle-fauna-flora" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><ControleFaunaFlora /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/resgate-cadastro" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><ResgateCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/crimes-ambientais" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><CrimesAmbientaisCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/crimes-comuns" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><CrimesComuns /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/atividades-prevencao" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><AtividadesPrevencao /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/dashboard" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><DashboardOperacional /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/hotspots" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><Hotspots /></SidebarLayout></ProtectedRoute>} />
              {/* Página Unificada de Registros */}
              <Route path="/secao-operacional/registros" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><RegistrosUnificados /></SidebarLayout></ProtectedRoute>} />
              <Route path="/registro-detalhes/:id" element={<ProtectedRoute requiredRoles={['secao_operacional', 'comando']}><SidebarLayout><RegistroDetalhes /></SidebarLayout></ProtectedRoute>} />
              {/* Redirecionamentos para compatibilidade */}
              <Route path="/secao-operacional/registros-resgates" element={<Navigate to="/secao-operacional/registros" replace />} />
              <Route path="/secao-operacional/registros-crimes-ambientais" element={<Navigate to="/secao-operacional/registros" replace />} />
              <Route path="/secao-operacional/registros-crimes-comuns" element={<Navigate to="/secao-operacional/registros" replace />} />
              <Route path="/secao-operacional/registros-prevencao" element={<Navigate to="/secao-operacional/registros" replace />} />
              <Route path="/secao-operacional/registros-unificados" element={<Navigate to="/secao-operacional/registros" replace />} />
              <Route path="/registros" element={<Navigate to="/secao-operacional/registros" replace />} />
              <Route path="/secao-operacional/relatorios" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><Relatorios /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/bens-apreendidos" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><BensApreendidosCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/controle-os" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><ControleOS /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/apresentacao" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><ApresentacaoBPMADeck /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/monitorar-raps" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><MonitorarRAPs /></SidebarLayout></ProtectedRoute>} />
              
              {/* Seção Pessoas */}
              <Route path="/secao-pessoas" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><SecaoPessoas /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/efetivo" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><EfetivoBPMA /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/equipes" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Equipes /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/escalas" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Escalas /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/afastamentos" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Afastamentos /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/licencas" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Licencas /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/ferias" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Ferias /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/ferias/minuta" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><MinutaFerias /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/abono" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Abono /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/abono/minuta" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><MinutaAbono /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/campanha" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Campanha /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/campanha/:data" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><CampanhaDia /></SidebarLayout></ProtectedRoute>} />
              
              {/* Seção Logística */}
              <Route path="/secao-logistica" element={<ProtectedRoute requiredRoles={['secao_logistica']}><SidebarLayout><SecaoLogistica /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-logistica/frota" element={<ProtectedRoute requiredRoles={['secao_logistica']}><SidebarLayout><SecaoLogistica /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-logistica/bens-equipamentos" element={<ProtectedRoute requiredRoles={['secao_logistica']}><SidebarLayout><SecaoLogistica /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-logistica/patrimonio" element={<ProtectedRoute requiredRoles={['secao_logistica']}><SidebarLayout><SecaoLogistica /></SidebarLayout></ProtectedRoute>} />

              {/* Comando (comando + secao_operacional) */}
              <Route path="/comando" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><Comando /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/agenda-OS" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><AgendaOS /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/agenda-CMD" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><AgendaCMD /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/dashboard" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><DashboardOperacional /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><ComandoPessoal /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/efetivo" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><EfetivoBPMA /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/equipes" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><Equipes /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/escalas" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><Escalas /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/afastamentos" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><Afastamentos /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/licencas" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><Licencas /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/ferias" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><Ferias /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/ferias/minuta" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><MinutaFerias /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/abono" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><Abono /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/abono/minuta" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><MinutaAbono /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/campanha" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><Campanha /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/pessoal/campanha/:data" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><CampanhaDia /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/apresentacao" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><ApresentacaoBPMADeck /></SidebarLayout></ProtectedRoute>} />
              <Route path="/comando/logistica" element={<ProtectedRoute requiredRoles={['comando', 'secao_operacional']}><SidebarLayout><SecaoLogistica /></SidebarLayout></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsentBanner />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
