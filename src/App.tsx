
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Hotspots from '@/pages/Hotspots';
import Registros from '@/pages/Registros';
import RegistroDetalhes from '@/pages/RegistroDetalhes';
import ResgateCadastro from '@/pages/ResgateCadastro';
import FaunaCadastrada from '@/pages/FaunaCadastrada';
import FaunaCadastro from '@/pages/FaunaCadastro';
import Relatorios from '@/pages/Relatorios';
import NotFound from '@/pages/NotFound';
import { Toaster } from 'sonner';
import ResgateEditar from '@/pages/ResgateEditar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/registros" element={<Registros />} />
          <Route path="/registro-detalhes/:id" element={<RegistroDetalhes />} />
          <Route path="/resgate-cadastro" element={<ResgateCadastro />} />
          <Route path="/resgate-editar/:id" element={<ResgateEditar />} />
          <Route path="/fauna-cadastrada" element={<FaunaCadastrada />} />
          <Route path="/fauna-cadastro" element={<FaunaCadastro />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
