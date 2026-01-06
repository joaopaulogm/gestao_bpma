
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Download, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Relatorios = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [formato, setFormato] = useState('');
  
  const [camposSelecionados, setCamposSelecionados] = useState({
    dataRegistro: true,
    local: true,
    tipoOcorrencia: true,
    especies: true,
    responsavel: true,
    statusConservacao: false,
    coordenadas: false,
    observacoes: false
  });

  const handleCheckboxChange = (field: string) => {
    setCamposSelecionados(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof camposSelecionados]
    }));
  };

  const handleGerarRelatorio = () => {
    toast.success('Relatório gerado com sucesso!');
    console.log('Gerando relatório:', { tipoRelatorio, periodo, formato, camposSelecionados });
  };

  return (
    <Layout title="Relatórios" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="gerar" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="gerar">Gerar Relatório</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gerar">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-medium text-fauna-blue">Gerar Novo Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipoRelatorio">Tipo de Relatório</Label>
                    <Select 
                      onValueChange={setTipoRelatorio}
                      value={tipoRelatorio}
                    >
                      <SelectTrigger id="tipoRelatorio">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ocorrencias">Ocorrências de Resgate/Apreensão</SelectItem>
                        <SelectItem value="especies">Espécies Catalogadas</SelectItem>
                        <SelectItem value="estatisticas">Estatísticas Gerais</SelectItem>
                        <SelectItem value="ameacadas">Espécies Ameaçadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <Select 
                      onValueChange={setPeriodo}
                      value={periodo}
                    >
                      <SelectTrigger id="periodo">
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultimo-mes">Último mês</SelectItem>
                        <SelectItem value="ultimo-trimestre">Último trimestre</SelectItem>
                        <SelectItem value="ultimo-semestre">Último semestre</SelectItem>
                        <SelectItem value="ultimo-ano">Último ano</SelectItem>
                        <SelectItem value="personalizado">Período personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {periodo === 'personalizado' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="dataInicial">Data Inicial</Label>
                        <Input
                          id="dataInicial"
                          type="date"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dataFinal">Data Final</Label>
                        <Input
                          id="dataFinal"
                          type="date"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="formato">Formato de Saída</Label>
                    <Select 
                      onValueChange={setFormato}
                      value={formato}
                    >
                      <SelectTrigger id="formato">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <h3 className="text-fauna-blue font-medium">Campos a incluir no relatório:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="dataRegistro" 
                        checked={camposSelecionados.dataRegistro}
                        onCheckedChange={() => handleCheckboxChange('dataRegistro')}
                      />
                      <Label htmlFor="dataRegistro">Data de Registro</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="local" 
                        checked={camposSelecionados.local}
                        onCheckedChange={() => handleCheckboxChange('local')}
                      />
                      <Label htmlFor="local">Local</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tipoOcorrencia" 
                        checked={camposSelecionados.tipoOcorrencia}
                        onCheckedChange={() => handleCheckboxChange('tipoOcorrencia')}
                      />
                      <Label htmlFor="tipoOcorrencia">Tipo de Ocorrência</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="especies" 
                        checked={camposSelecionados.especies}
                        onCheckedChange={() => handleCheckboxChange('especies')}
                      />
                      <Label htmlFor="especies">Espécies</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="responsavel" 
                        checked={camposSelecionados.responsavel}
                        onCheckedChange={() => handleCheckboxChange('responsavel')}
                      />
                      <Label htmlFor="responsavel">Responsável</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="statusConservacao" 
                        checked={camposSelecionados.statusConservacao}
                        onCheckedChange={() => handleCheckboxChange('statusConservacao')}
                      />
                      <Label htmlFor="statusConservacao">Status de Conservação</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="coordenadas" 
                        checked={camposSelecionados.coordenadas}
                        onCheckedChange={() => handleCheckboxChange('coordenadas')}
                      />
                      <Label htmlFor="coordenadas">Coordenadas</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="observacoes" 
                        checked={camposSelecionados.observacoes}
                        onCheckedChange={() => handleCheckboxChange('observacoes')}
                      />
                      <Label htmlFor="observacoes">Observações</Label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full bg-fauna-blue hover:bg-opacity-90 text-white gap-2" 
                    onClick={handleGerarRelatorio}
                    disabled={!tipoRelatorio || !periodo || !formato}
                  >
                    <FileText className="h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-medium text-fauna-blue">Histórico de Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-fauna-border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Relatório de Ocorrências</h3>
                      <p className="text-sm text-muted-foreground">Gerado em 10/08/2023 - PDF</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-4 w-4 text-fauna-blue" />
                      <span>Baixar</span>
                    </Button>
                  </div>
                  
                  <div className="border border-fauna-border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Estatísticas Gerais</h3>
                      <p className="text-sm text-muted-foreground">Gerado em 05/08/2023 - Excel</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-4 w-4 text-fauna-blue" />
                      <span>Baixar</span>
                    </Button>
                  </div>
                  
                  <div className="border border-fauna-border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Espécies Ameaçadas</h3>
                      <p className="text-sm text-muted-foreground">Gerado em 01/08/2023 - PDF</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-4 w-4 text-fauna-blue" />
                      <span>Baixar</span>
                    </Button>
                  </div>
                  
                  <div className="border border-fauna-border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Relatório de Ocorrências por Localidade</h3>
                      <p className="text-sm text-muted-foreground">Gerado em 25/07/2023 - CSV</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-4 w-4 text-fauna-blue" />
                      <span>Baixar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Relatorios;
