import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, X, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
const supabaseAny = supabase as any;
import { RapsLog } from '@/hooks/useRapsLogs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface RapsLogDetailProps {
  logId: string;
  onClose: () => void;
}

const RapsLogDetail: React.FC<RapsLogDetailProps> = ({ logId, onClose }) => {
  const [log, setLog] = useState<RapsLog | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabaseAny
          .from('rap_import_logs')
          .select('*')
          .eq('id', logId)
          .maybeSingle();

        if (error) throw error;
        setLog(data);
      } catch (error: any) {
        console.error('Erro ao buscar log:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [logId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, icon: React.ReactNode }> = {
      success: {
        variant: 'default',
        label: 'Sucesso',
        icon: <CheckCircle className="h-4 w-4" />
      },
      needs_ocr: {
        variant: 'secondary',
        label: 'Precisa OCR',
        icon: <AlertTriangle className="h-4 w-4" />
      },
      missing_required_fields: {
        variant: 'destructive',
        label: 'Campos Faltando',
        icon: <AlertTriangle className="h-4 w-4" />
      },
      error: {
        variant: 'destructive',
        label: 'Erro',
        icon: <AlertTriangle className="h-4 w-4" />
      },
    };

    const config = variants[status] || { variant: 'outline' as const, label: status, icon: null };
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!log) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log não encontrado</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Log de Importação</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Arquivo</label>
              <p className="text-sm font-medium">{log.file_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                {getStatusBadge(log.status)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nº RAP</label>
              <p className="text-sm">{log.rap_numero || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <p className="text-sm">{log.rap_tipo || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data/Hora</label>
              <p className="text-sm">
                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tempo de Processamento</label>
              <p className="text-sm">{log.processing_time_ms ? `${log.processing_time_ms}ms` : '-'}</p>
            </div>
          </div>

          {/* Campos Faltantes */}
          {log.missing_fields && log.missing_fields.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Campos Faltantes
              </label>
              <div className="flex flex-wrap gap-2">
                {log.missing_fields.map((field, index) => (
                  <Badge key={index} variant="destructive">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Avisos */}
          {log.warnings && log.warnings.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Avisos
              </label>
              <div className="flex flex-wrap gap-2">
                {log.warnings.map((warning, index) => (
                  <Badge key={index} variant="secondary">
                    {warning}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Registros Inseridos */}
          {log.inserted_ids && log.inserted_ids.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Registros Inseridos ({log.inserted_ids.length})
              </label>
              <div className="space-y-2">
                {log.inserted_ids.map((id) => (
                  <div key={id} className="flex items-center justify-between p-2 bg-accent rounded">
                    <code className="text-sm">{id}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate(`/secao-operacional/registros?highlight=${id}`);
                        onClose();
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Registro
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {log.error_message && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Mensagem de Erro
              </label>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm">
                {log.error_message}
              </div>
            </div>
          )}

          {/* Trecho do Texto Extraído */}
          {log.raw_excerpt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Trecho do Texto Extraído
              </label>
              <div className="p-3 bg-muted rounded text-sm font-mono max-h-48 overflow-y-auto">
                {log.raw_excerpt}
              </div>
            </div>
          )}

          {/* Metadados */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-muted-foreground">File ID</label>
              <p className="font-mono text-xs">{log.file_id}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Tamanho do PDF</label>
              <p>{log.pdf_size_bytes ? `${(log.pdf_size_bytes / 1024).toFixed(2)} KB` : '-'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RapsLogDetail;
