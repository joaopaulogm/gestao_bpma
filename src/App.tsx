
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Hotspots from '@/pages/Hotspots';
import Registros from '@/pages/Registros';
import RegistroDetalhes from '@/pages/RegistroDetalhes';
import ResgateCadastro from '@/pages/ResgateCadastro';
import CrimesAmbientais from '@/pages/CrimesAmbientais';
import FaunaCadastrada from '@/pages/FaunaCadastrada';
import FaunaCadastro from '@/pages/FaunaCadastro';
import Relatorios from '@/pages/Relatorios';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import { Toaster } from 'sonner';
import ResgateEditar from '@/pages/ResgateEditar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SidebarLayout from '@/components/SidebarLayout';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Public home page */}
            <Route 
              path="/" 
              element={
                <SidebarLayout>
                  <Index />
                </SidebarLayout>
              } 
            />
            
            {/* Public Resgate Cadastro page */}
            <Route 
              path="/resgate-cadastro" 
              element={
                <SidebarLayout>
                  <ResgateCadastro />
                </SidebarLayout>
              } 
            />
            
            {/* Public Crimes Ambientais page */}
            <Route 
              path="/crimes-ambientais" 
              element={
                <SidebarLayout>
                  <CrimesAmbientais />
                </SidebarLayout>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Dashboard />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hotspots" 
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Hotspots />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/registros" 
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Registros />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/registro-detalhes/:id" 
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <RegistroDetalhes />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resgate-editar/:id" 
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <ResgateEditar />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/fauna-cadastrada" 
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <FaunaCadastrada />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/fauna-cadastro" 
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <FaunaCadastro />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/relatorios" 
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Relatorios />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
