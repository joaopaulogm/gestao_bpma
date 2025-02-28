
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResgateCadastro from "./pages/ResgateCadastro";
import FaunaCadastro from "./pages/FaunaCadastro";
import FaunaCadastrada from "./pages/FaunaCadastrada";
import Dashboard from "./pages/Dashboard";
import Hotspots from "./pages/Hotspots";
import Registros from "./pages/Registros";
import Relatorios from "./pages/Relatorios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/resgate-cadastro" element={<ResgateCadastro />} />
          <Route path="/fauna-cadastro" element={<FaunaCadastro />} />
          <Route path="/fauna-cadastrada" element={<FaunaCadastrada />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/registros" element={<Registros />} />
          <Route path="/relatorios" element={<Relatorios />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
