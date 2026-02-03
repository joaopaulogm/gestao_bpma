import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ComandoDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/comando">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard Comando</h1>
        </div>
      </div>

      <Card className="bg-primary border-primary/50">
        <CardContent className="p-6 sm:p-8 text-center">
          <p className="text-primary-foreground/90">Visão geral do Comando em desenvolvimento.</p>
          <Button asChild variant="secondary" className="mt-4">
            <Link to="/comando">Voltar ao Comando</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComandoDashboard;
