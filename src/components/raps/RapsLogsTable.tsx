import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RapsLog } from '@/hooks/useRapsLogs';
import { cn } from '@/lib/utils';

interface RapsLogsTableProps {
  logs: RapsLog[];
  loading: boolean;
  error: string | null;
  onLogClick: (logId: string) => void;
  page: number;
  setPage: (page: number) => void;
  totalCount: number;
  pageSize: number;
}

const RapsLogsTable: React.FC<RapsLogsTableProps> = ({
  logs,
  loading,
  error,
  onLogClick,
  page,
  setPage,
  totalCount,
  pageSize,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      success: { variant: 'default', label: 'Sucesso' },
      needs_ocr: { variant: 'secondary', label: 'Precisa OCR' },
      missing_required_fields: { variant: 'destructive', label: 'Campos Faltando' },
      error: { variant: 'destructive', label: 'Erro' },
    };

    const config = variants[status] || { variant: 'outline' as const, label: status };
    return (
      <Badge variant={config.variant}>{config.label}</Badge>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum log encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Arquivo</TableHead>
              <TableHead>Nº RAP</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registros Inseridos</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="cursor-pointer hover:bg-accent/50">
                <TableCell>
                  {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell className="max-w-xs truncate" title={log.file_name}>
                  {log.file_name}
                </TableCell>
                <TableCell>
                  {log.rap_numero || '-'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(log.status)}
                </TableCell>
                <TableCell>
                  {log.inserted_ids && log.inserted_ids.length > 0 ? (
                    <span className="text-green-600 font-medium">
                      {log.inserted_ids.length} registro(s)
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogClick(log.id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({totalCount} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || loading}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapsLogsTable;
