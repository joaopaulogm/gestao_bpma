import React from 'react';
import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SecaoLogistica: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Wrench className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Seção de Logística e Manutenção</h1>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Gestão de Logística</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Módulo de logística em desenvolvimento. Aqui será possível gerenciar recursos, equipamentos e manutenção.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecaoLogistica;
