
import React from 'react';
import Card from '@/components/Card';
import { Clipboard, LogIn, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Gestão de Dados do BPMA
        </h1>
        <p className="text-muted-foreground text-base">
          Sistema de gestão de ocorrências e dados ambientais
        </p>
      </div>
      
      <div className="space-y-10 max-w-5xl mx-auto">
        {/* Public cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            title="Ocorrências de Resgate e Animais Apreendidos" 
            subtitle="Registre uma nova atividade" 
            icon={Clipboard} 
            to="/resgate-cadastro"
          />
          <Card 
            title="Ocorrências Crimes Ambientais" 
            subtitle="Registre crimes contra o meio ambiente" 
            icon={Shield} 
            to="/crimes-ambientais"
          />
        </div>
        
        {/* Login card */}
        {!isAuthenticated && (
          <div className="max-w-md mx-auto">
            <div className="relative overflow-hidden rounded-2xl p-8 text-center bg-background/85 backdrop-blur-xl border border-primary/10 shadow-[0_4px_24px_hsl(var(--primary)/0.06)]">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent pointer-events-none" />
              
              <div className="relative">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                  <LogIn className="h-7 w-7 text-primary" />
                </div>
                
                {/* Content */}
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Área Restrita SOI/BPMA
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Para acessar as funcionalidades completas do sistema, faça login com suas credenciais.
                </p>
                
                {/* Button */}
                <Button 
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="gap-2 min-w-[160px]"
                >
                  <LogIn className="h-4 w-4" />
                  Fazer Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
