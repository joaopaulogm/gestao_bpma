
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
    <div className="p-6 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Gestão de Dados do BPMA
        </h1>
        <p className="text-muted-foreground">
          Sistema de gestão de ocorrências e dados ambientais
        </p>
      </div>
      
      <div className="space-y-10">
        {/* Public cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
        
        {/* Login information */}
        {!isAuthenticated && (
          <div className="max-w-md mx-auto text-center bg-card p-8 rounded-xl shadow-sm border border-border">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Área Restrita SOI/BPMA</h2>
            <p className="text-muted-foreground mb-6">
              Para acessar as funcionalidades completas do sistema, faça login com suas credenciais.
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="gap-2"
              size="lg"
            >
              <LogIn className="h-4 w-4" />
              Fazer Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
