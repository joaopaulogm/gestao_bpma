import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SidebarLayout from '@/components/SidebarLayout';

// Lazy load all pages
const Index = lazy(() => import('@/pages/Index'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Hotspots = lazy(() => import('@/pages/Hotspots'));
const Registros = lazy(() => import('@/pages/Registros'));
const RegistroDetalhes = lazy(() => import('@/pages/RegistroDetalhes'));
const ResgateCadastro = lazy(() => import('@/pages/ResgateCadastro'));
const FaunaCadastrada = lazy(() => import('@/pages/FaunaCadastrada'));
const FaunaCadastro = lazy(() => import('@/pages/FaunaCadastro'));
const Relatorios = lazy(() => import('@/pages/Relatorios'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Login = lazy(() => import('@/pages/Login'));
const ResgateEditar = lazy(() => import('@/pages/ResgateEditar'));
const BensApreendidosCadastro = lazy(() => import('@/pages/BensApreendidosCadastro'));
const FloraCadastro = lazy(() => import('@/pages/FloraCadastro'));
const FloraCadastrada = lazy(() => import('@/pages/FloraCadastrada'));
const EfetivoBPMA = lazy(() => import('@/pages/EfetivoBPMA'));
const POP = lazy(() => import('@/pages/POP'));
const CrimesAmbientaisCadastro = lazy(() => import('@/pages/CrimesAmbientaisCadastro'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
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
