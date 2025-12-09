import React from 'react';
import { UserMinus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Afastamentos: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/secao-pessoas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <UserMinus className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Afastamentos</h1>
        </div>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Registro de Afastamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Módulo de afastamentos em desenvolvimento. Aqui será possível registrar e acompanhar afastamentos do efetivo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Afastamentos;
