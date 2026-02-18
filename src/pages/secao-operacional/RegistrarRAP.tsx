import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clipboard, AlertTriangle, Shield, TreePine, Package } from 'lucide-react';

const ResgateCadastro = lazy(() => import(/* webpackChunkName: "resgate-cadastro" */ '@/pages/ResgateCadastro'));
const CrimesAmbientaisCadastro = lazy(() => import(/* webpackChunkName: "crimes" */ '@/pages/CrimesAmbientaisCadastro'));
const CrimesComuns = lazy(() => import(/* webpackChunkName: "crimes-comuns" */ '@/pages/CrimesComuns'));
const AtividadesPrevencao = lazy(() => import(/* webpackChunkName: "atividades-prevencao" */ '@/pages/AtividadesPrevencao'));
const BensApreendidosCadastro = lazy(() => import(/* webpackChunkName: "bens-apreendidos" */ '@/pages/BensApreendidosCadastro'));

const PageFallback = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
  </div>
);

const RegistrarRAP: React.FC = () => {
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Registrar de RAP</h1>
            <p className="text-sm text-muted-foreground">Formulários de registro por tipo de ocorrência</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Formulários</CardTitle>
          <CardDescription>Selecione a aba correspondente ao tipo de registro</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resgate" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="resgate" className="gap-2">
                <Clipboard className="h-4 w-4" />
                Resgate
              </TabsTrigger>
              <TabsTrigger value="crimes-ambientais" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Crimes Ambientais
              </TabsTrigger>
              <TabsTrigger value="crimes-comuns" className="gap-2">
                <Shield className="h-4 w-4" />
                Crimes Comuns
              </TabsTrigger>
              <TabsTrigger value="atividades-prevencao" className="gap-2">
                <TreePine className="h-4 w-4" />
                Atividades Prevenção
              </TabsTrigger>
              <TabsTrigger value="bens-apreendidos" className="gap-2">
                <Package className="h-4 w-4" />
                Bens Apreendidos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="resgate" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <ResgateCadastro embedded />
              </Suspense>
            </TabsContent>
            <TabsContent value="crimes-ambientais" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <CrimesAmbientaisCadastro embedded />
              </Suspense>
            </TabsContent>
            <TabsContent value="crimes-comuns" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <CrimesComuns embedded />
              </Suspense>
            </TabsContent>
            <TabsContent value="atividades-prevencao" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <AtividadesPrevencao embedded />
              </Suspense>
            </TabsContent>
            <TabsContent value="bens-apreendidos" className="mt-4">
              <Suspense fallback={<PageFallback />}>
                <BensApreendidosCadastro embedded />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrarRAP;
