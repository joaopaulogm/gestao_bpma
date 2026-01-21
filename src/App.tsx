import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SidebarLayout from '@/components/SidebarLayout';

// Lazy load all pages
const Index = lazy(() => import(/* webpackChunkName: "index" */ '@/pages/Index'));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/pages/Dashboard'));
const DashboardOperacional = lazy(() => import(/* webpackChunkName: "dashboard-operacional" */ '@/pages/DashboardOperacional'));
const Hotspots = lazy(() => import(/* webpackChunkName: "hotspots" */ '@/pages/Hotspots'));
const Registros = lazy(() => import(/* webpackChunkName: "registros" */ '@/pages/Registros'));
const RegistrosCrimes = lazy(() => import(/* webpackChunkName: "registros-crimes" */ '@/pages/RegistrosCrimes'));
const RegistroDetalhes = lazy(() => import(/* webpackChunkName: "registro-detalhes" */ '@/pages/RegistroDetalhes'));
const ResgateCadastro = lazy(() => import(/* webpackChunkName: "resgate-cadastro" */ '@/pages/ResgateCadastro'));
const FaunaCadastrada = lazy(() => import(/* webpackChunkName: "fauna-cadastrada" */ '@/pages/FaunaCadastrada'));
const FaunaCadastro = lazy(() => import(/* webpackChunkName: "fauna-cadastro" */ '@/pages/FaunaCadastro'));
const Relatorios = lazy(() => import(/* webpackChunkName: "relatorios" */ '@/pages/Relatorios'));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ '@/pages/NotFound'));
const Login = lazy(() => import(/* webpackChunkName: "login" */ '@/pages/Login'));
const ResgateEditar = lazy(() => import(/* webpackChunkName: "resgate-editar" */ '@/pages/ResgateEditar'));
const BensApreendidosCadastro = lazy(() => import(/* webpackChunkName: "bens-apreendidos" */ '@/pages/BensApreendidosCadastro'));
const FloraCadastro = lazy(() => import(/* webpackChunkName: "flora-cadastro" */ '@/pages/FloraCadastro'));
const FloraCadastrada = lazy(() => import(/* webpackChunkName: "flora-cadastrada" */ '@/pages/FloraCadastrada'));
const EfetivoBPMA = lazy(() => import(/* webpackChunkName: "efetivo" */ '@/pages/EfetivoBPMA'));
const POP = lazy(() => import(/* webpackChunkName: "pop" */ '@/pages/POP'));
const CrimesAmbientaisCadastro = lazy(() => import(/* webpackChunkName: "crimes" */ '@/pages/CrimesAmbientaisCadastro'));
const GerenciarPermissoes = lazy(() => import(/* webpackChunkName: "gerenciar-permissoes" */ '@/pages/GerenciarPermissoes'));
const SecaoPessoas = lazy(() => import(/* webpackChunkName: "secao-pessoas" */ '@/pages/SecaoPessoas'));
const Equipes = lazy(() => import(/* webpackChunkName: "equipes" */ '@/pages/pessoas/Equipes'));
const Escalas = lazy(() => import(/* webpackChunkName: "escalas" */ '@/pages/pessoas/Escalas'));
const EscalaAdministrativo = lazy(() => import(/* webpackChunkName: "escala-administrativo" */ '@/pages/pessoas/EscalaAdministrativo'));
const Afastamentos = lazy(() => import(/* webpackChunkName: "afastamentos" */ '@/pages/pessoas/Afastamentos'));
const Licencas = lazy(() => import(/* webpackChunkName: "licencas" */ '@/pages/pessoas/Licencas'));
const Ferias = lazy(() => import(/* webpackChunkName: "ferias" */ '@/pages/pessoas/Ferias'));
const Abono = lazy(() => import(/* webpackChunkName: "abono" */ '@/pages/pessoas/Abono'));
const MinutaFerias = lazy(() => import(/* webpackChunkName: "minuta-ferias" */ '@/pages/pessoas/MinutaFerias'));
const MinutaAbono = lazy(() => import(/* webpackChunkName: "minuta-abono" */ '@/pages/pessoas/MinutaAbono'));
const Campanha = lazy(() => import(/* webpackChunkName: "campanha" */ '@/pages/pessoas/Campanha'));
const SecaoOperacional = lazy(() => import(/* webpackChunkName: "secao-operacional" */ '@/pages/SecaoOperacional'));
const SecaoLogistica = lazy(() => import(/* webpackChunkName: "secao-logistica" */ '@/pages/SecaoLogistica'));
const MaterialApoio = lazy(() => import(/* webpackChunkName: "material-apoio" */ '@/pages/MaterialApoio'));
const IdentificarEspecie = lazy(() => import(/* webpackChunkName: "identificar-especie" */ '@/pages/apoio/IdentificarEspecie'));
const ManualRAP = lazy(() => import(/* webpackChunkName: "manual-rap" */ '@/pages/apoio/ManualRAP'));
const RankingOcorrencias = lazy(() => import(/* webpackChunkName: "ranking" */ '@/pages/RankingOcorrencias'));
const UploadSchemas = lazy(() => import(/* webpackChunkName: "upload-schemas" */ '@/pages/UploadSchemas'));
const CrimesComuns = lazy(() => import(/* webpackChunkName: "crimes-comuns" */ '@/pages/CrimesComuns'));
const AtividadesPrevencao = lazy(() => import(/* webpackChunkName: "atividades-prevencao" */ '@/pages/AtividadesPrevencao'));
const DashboardPublico = lazy(() => import(/* webpackChunkName: "dashboard-publico" */ '@/pages/DashboardPublico'));
const ProcessarRAP = lazy(() => import(/* webpackChunkName: "processar-rap" */ '@/pages/ProcessarRAP'));
const MonitorarRAPs = lazy(() => import(/* webpackChunkName: "monitorar-raps" */ '@/pages/MonitorarRAPs'));

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
              <Route path="/" element={<SidebarLayout><Index /></SidebarLayout>} />
              
              {/* Operador level - requires authentication */}
              <Route path="/resgate-cadastro" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><ResgateCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/crimes-ambientais" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><CrimesAmbientaisCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/material-apoio" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><MaterialApoio /></SidebarLayout></ProtectedRoute>} />
              <Route path="/material-apoio/pop" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><POP /></SidebarLayout></ProtectedRoute>} />
              <Route path="/material-apoio/identificar-especie" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><IdentificarEspecie /></SidebarLayout></ProtectedRoute>} />
              <Route path="/material-apoio/manual-rap" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><ManualRAP /></SidebarLayout></ProtectedRoute>} />
              <Route path="/ranking" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><RankingOcorrencias /></SidebarLayout></ProtectedRoute>} />
              <Route path="/crimes-comuns" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><CrimesComuns /></SidebarLayout></ProtectedRoute>} />
              <Route path="/atividades-prevencao" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><AtividadesPrevencao /></SidebarLayout></ProtectedRoute>} />
              {/* Admin only */}
              <Route path="/gerenciar-permissoes" element={<ProtectedRoute requireAdmin><SidebarLayout><GerenciarPermissoes /></SidebarLayout></ProtectedRoute>} />
              <Route path="/upload-schemas" element={<ProtectedRoute requireAdmin><UploadSchemas /></ProtectedRoute>} />
              <Route path="/registro-detalhes/:id" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><RegistroDetalhes /></SidebarLayout></ProtectedRoute>} />
              <Route path="/resgate-editar/:id" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><ResgateEditar /></SidebarLayout></ProtectedRoute>} />
              
              {/* Seção Operacional */}
              <Route path="/secao-operacional" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><SecaoOperacional /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/fauna-cadastro" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><FaunaCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/fauna-cadastro/:id" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><FaunaCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/fauna-cadastrada" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><FaunaCadastrada /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/dashboard" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><DashboardOperacional /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/dashboard-historico" element={<Navigate to="/secao-operacional/dashboard" replace />} />
              <Route path="/secao-operacional/dashboard-antigo" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><Dashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/hotspots" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><Hotspots /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/registros" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><Registros /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/registros-crimes" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><RegistrosCrimes /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/relatorios" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><Relatorios /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/bens-apreendidos" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><BensApreendidosCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/flora-cadastro" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><FloraCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/flora-cadastro/:id" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><FloraCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/flora-cadastrada" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><FloraCadastrada /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/processar-rap" element={<ProtectedRoute requiredRoles={['operador']}><SidebarLayout><ProcessarRAP /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-operacional/monitorar-raps" element={<ProtectedRoute requiredRoles={['secao_operacional']}><SidebarLayout><MonitorarRAPs /></SidebarLayout></ProtectedRoute>} />
              
              {/* Seção Pessoas */}
              <Route path="/secao-pessoas" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><SecaoPessoas /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/efetivo" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><EfetivoBPMA /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/equipes" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Equipes /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/escalas" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Escalas /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/escala-administrativo" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><EscalaAdministrativo /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/afastamentos" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Afastamentos /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/licencas" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Licencas /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/ferias" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Ferias /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/ferias/minuta" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><MinutaFerias /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/abono" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Abono /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/abono/minuta" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><MinutaAbono /></SidebarLayout></ProtectedRoute>} />
              <Route path="/secao-pessoas/campanha" element={<ProtectedRoute requiredRoles={['secao_pessoas']}><SidebarLayout><Campanha /></SidebarLayout></ProtectedRoute>} />
              
              {/* Seção Logística */}
              <Route path="/secao-logistica" element={<ProtectedRoute requiredRoles={['secao_logistica']}><SidebarLayout><SecaoLogistica /></SidebarLayout></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
