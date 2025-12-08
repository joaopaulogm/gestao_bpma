import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SidebarLayout from '@/components/SidebarLayout';

// Lazy load all pages with webpackChunkName comments for better debugging
const Index = lazy(() => import(/* webpackChunkName: "index" */ '@/pages/Index'));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/pages/Dashboard'));
const Hotspots = lazy(() => import(/* webpackChunkName: "hotspots" */ '@/pages/Hotspots'));
const Registros = lazy(() => import(/* webpackChunkName: "registros" */ '@/pages/Registros'));
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

const queryClient = new QueryClient();

// Loading component for Suspense fallback
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
              <Route path="/" element={<SidebarLayout><Index /></SidebarLayout>} />
              <Route path="/resgate-cadastro" element={<SidebarLayout><ResgateCadastro /></SidebarLayout>} />
              <Route path="/crimes-ambientais" element={<SidebarLayout><CrimesAmbientaisCadastro /></SidebarLayout>} />
              
              <Route path="/dashboard" element={<ProtectedRoute><SidebarLayout><Dashboard /></SidebarLayout></ProtectedRoute>} />
              <Route path="/hotspots" element={<ProtectedRoute><SidebarLayout><Hotspots /></SidebarLayout></ProtectedRoute>} />
              <Route path="/registros" element={<ProtectedRoute><SidebarLayout><Registros /></SidebarLayout></ProtectedRoute>} />
              <Route path="/registro-detalhes/:id" element={<ProtectedRoute><SidebarLayout><RegistroDetalhes /></SidebarLayout></ProtectedRoute>} />
              <Route path="/resgate-editar/:id" element={<ProtectedRoute><SidebarLayout><ResgateEditar /></SidebarLayout></ProtectedRoute>} />
              <Route path="/fauna-cadastrada" element={<ProtectedRoute><SidebarLayout><FaunaCadastrada /></SidebarLayout></ProtectedRoute>} />
              <Route path="/fauna-cadastro" element={<ProtectedRoute><SidebarLayout><FaunaCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/fauna-cadastro/:id" element={<ProtectedRoute><SidebarLayout><FaunaCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><SidebarLayout><Relatorios /></SidebarLayout></ProtectedRoute>} />
              <Route path="/bens-apreendidos" element={<ProtectedRoute><SidebarLayout><BensApreendidosCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/flora-cadastro" element={<ProtectedRoute><SidebarLayout><FloraCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/flora-cadastro/:id" element={<ProtectedRoute><SidebarLayout><FloraCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/flora-cadastrada" element={<ProtectedRoute><SidebarLayout><FloraCadastrada /></SidebarLayout></ProtectedRoute>} />
              <Route path="/efetivo" element={<ProtectedRoute><SidebarLayout><EfetivoBPMA /></SidebarLayout></ProtectedRoute>} />
              <Route path="/pop" element={<POP />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
