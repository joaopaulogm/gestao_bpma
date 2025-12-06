import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import CrimesAmbientaisCadastro from '@/pages/CrimesAmbientaisCadastro';
import SidebarLayout from '@/components/SidebarLayout';

// Lazy load pages
const Index = React.lazy(() => import('@/pages/Index'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Hotspots = React.lazy(() => import('@/pages/Hotspots'));
const Registros = React.lazy(() => import('@/pages/Registros'));
const RegistroDetalhes = React.lazy(() => import('@/pages/RegistroDetalhes'));
const ResgateCadastro = React.lazy(() => import('@/pages/ResgateCadastro'));
const FaunaCadastrada = React.lazy(() => import('@/pages/FaunaCadastrada'));
const FaunaCadastro = React.lazy(() => import('@/pages/FaunaCadastro'));
const Relatorios = React.lazy(() => import('@/pages/Relatorios'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Login = React.lazy(() => import('@/pages/Login'));
const ResgateEditar = React.lazy(() => import('@/pages/ResgateEditar'));
const BensApreendidosCadastro = React.lazy(() => import('@/pages/BensApreendidosCadastro'));
const FloraCadastro = React.lazy(() => import('@/pages/FloraCadastro'));
const FloraCadastrada = React.lazy(() => import('@/pages/FloraCadastrada'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
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
              <Route path="/relatorios" element={<ProtectedRoute><SidebarLayout><Relatorios /></SidebarLayout></ProtectedRoute>} />
              <Route path="/bens-apreendidos" element={<ProtectedRoute><SidebarLayout><BensApreendidosCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/flora-cadastro" element={<ProtectedRoute><SidebarLayout><FloraCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/flora-cadastro/:id" element={<ProtectedRoute><SidebarLayout><FloraCadastro /></SidebarLayout></ProtectedRoute>} />
              <Route path="/flora-cadastrada" element={<ProtectedRoute><SidebarLayout><FloraCadastrada /></SidebarLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;