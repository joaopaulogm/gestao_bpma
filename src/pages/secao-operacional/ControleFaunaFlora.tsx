import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PawPrint, List, Leaf, TreePine } from 'lucide-react';

const FaunaCadastro = lazy(() => import(/* webpackChunkName: "fauna-cadastro" */ '@/pages/FaunaCadastro'));
const FaunaCadastrada = lazy(() => import(/* webpackChunkName: "fauna-cadastrada" */ '@/pages/FaunaCadastrada'));
const FloraCadastro = lazy(() => import(/* webpackChunkName: "flora-cadastro" */ '@/pages/FloraCadastro'));
const FloraCadastrada = lazy(() => import(/* webpackChunkName: "flora-cadastrada" */ '@/pages/FloraCadastrada'));

const PageFallback = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
  </div>
);

const ControleFaunaFlora: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/secao-operacional">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Controle de Fauna e Flora</h1>
            <p className="text-sm text-muted-foreground">Cadastro e consulta de fauna e flora</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Fauna e Flora</CardTitle>
          <CardDescription>Selecione a aba desejada</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fauna-cadastrar" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="fauna-cadastrar" className="gap-2">
                <PawPrint className="h-4 w-4" />
                Fauna — Cadastrar
              </TabsTrigger>
              <TabsTrigger value="fauna-cadastrada" className="gap-2">
                <List className="h-4 w-4" />
                Fauna — Cadastrada
              </TabsTrigger>
              <TabsTrigger value="flora-cadastrar" className="gap-2">
                <Leaf className="h-4 w-4" />
                Flora — Cadastrar
              </TabsTrigger>
              <TabsTrigger value="flora-cadastrada" className="gap-2">
                <TreePine className="h-4 w-4" />
                Flora — Cadastrada
              </TabsTrigger>
            </TabsList>
            <TabsContent value="fauna-cadastrar" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <FaunaCadastro />
              </Suspense>
            </TabsContent>
            <TabsContent value="fauna-cadastrada" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <FaunaCadastrada />
              </Suspense>
            </TabsContent>
            <TabsContent value="flora-cadastrar" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <FloraCadastro />
              </Suspense>
            </TabsContent>
            <TabsContent value="flora-cadastrada" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <FloraCadastrada />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControleFaunaFlora;
