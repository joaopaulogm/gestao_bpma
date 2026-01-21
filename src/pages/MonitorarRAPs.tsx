import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, CheckCircle2, XCircle, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProcessedRAP {
  id: string;
  drive_file_id: string;
  drive_file_name: string;
  form_type: string;
  rap_numero: string;
  processed_at: string;
  confidence_score: number;
  extracted_data: unknown;
  created_at: string;
}

interface ProcessResult {
  success: boolean;
  message?: string;
  processed?: number;
  errors?: number;
  error?: string;
  results?: Array<{
    file: string;
    status: string;
    error?: string;
    rap_numero?: string;
    form_type?: string;
    confidence?: number;
  }>;
  // List action fields
  total_files?: number;
  processed_count?: number;
  pending_count?: number;
}

const MonitorarRAPs = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ProcessResult | null>(null);

  // Buscar RAPs já processados
  const { data: processedRAPs, isLoading } = useQuery({
    queryKey: ['rap_processados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rap_processados')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ProcessedRAP[];
    },
  });

  // Mutation para processar RAPs
  const processRAPs = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('process-raps-folder', {
        body: { action: 'process', limit: 5 }
      });
      
      if (error) throw error;
      return data as ProcessResult;
    },
    onSuccess: (result) => {
      setLastResult(result);
      queryClient.invalidateQueries({ queryKey: ['rap_processados'] });
      
      const processedCount = result.processed ?? 0;
      const results = result.results ?? [];
      const errorCount = results.filter(r => r.status === 'error').length;
      
      if (processedCount > 0) {
        toast.success(`${processedCount} RAP(s) processado(s) com sucesso!`);
      } else if (errorCount === 0 && results.length === 0) {
        toast.info('Nenhum RAP novo encontrado para processar.');
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} RAP(s) com erro no processamento.`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao processar RAPs: ${error.message}`);
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const getStatusBadge = (rap: ProcessedRAP) => {
    if (rap.confidence_score < 0.5) {
      return <Badge variant="destructive">Baixa Confiança</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Processado</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    if (tipo === 'resgate_fauna') {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Resgate de Fauna</Badge>;
    }
    return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Crime Ambiental</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento de RAPs</h1>
          <p className="text-muted-foreground">
            Processa automaticamente os RAPs da pasta do Google Drive
          </p>
        </div>
        <Button
          onClick={() => processRAPs.mutate()}
          disabled={isProcessing}
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Processar RAPs
            </>
          )}
        </Button>
      </div>

      {/* Resultado do último processamento */}
      {lastResult && (() => {
        const results = lastResult.results ?? [];
        const successCount = results.filter(r => r.status === 'success').length;
        const errorCount = results.filter(r => r.status === 'error').length;
        const hasError = errorCount > 0 || !!lastResult.error;
        
        return (
          <Card className={hasError ? 'border-orange-300' : 'border-green-300'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {!hasError ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-orange-600" />
                )}
                Último Processamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastResult.error ? (
                <div className="p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  <strong>Erro:</strong> {lastResult.error}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{successCount}</div>
                      <div className="text-sm text-muted-foreground">Processados</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-destructive">{errorCount}</div>
                      <div className="text-sm text-muted-foreground">Erros</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{results.length}</div>
                      <div className="text-sm text-muted-foreground">Total Analisado</div>
                    </div>
                  </div>
                  
                  {results.length > 0 && (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {results.map((detail, idx) => (
                          <div 
                            key={idx} 
                            className={`p-2 rounded-lg text-sm flex items-center gap-2 ${
                              detail.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                            }`}
                          >
                            {detail.status === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            )}
                            <span className="truncate flex-1">{detail.file}</span>
                            {detail.rap_numero && (
                              <Badge variant="outline" className="text-xs">{detail.rap_numero}</Badge>
                            )}
                            {detail.error && (
                              <span className="text-red-600 text-xs">{detail.error}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Lista de RAPs processados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>RAPs Processados</CardTitle>
              <CardDescription>Histórico de RAPs processados automaticamente</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['rap_processados'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : processedRAPs && processedRAPs.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                  {processedRAPs.map((rap) => (
                  <div 
                    key={rap.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rap.drive_file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(rap.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">RAP: {rap.rap_numero}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTipoBadge(rap.form_type)}
                      {getStatusBadge(rap)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum RAP processado ainda.</p>
              <p className="text-sm">Clique em "Processar RAPs" para iniciar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitorarRAPs;
