import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useRapsLogs } from '@/hooks/useRapsLogs';
import RapsLogsTable from '@/components/raps/RapsLogsTable';
import RapsLogDetail from '@/components/raps/RapsLogDetail';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const RapsLogs = () => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rapNumeroFilter, setRapNumeroFilter] = useState<string>('');
  const [fileNameFilter, setFileNameFilter] = useState<string>('');

  const {
    logs,
    loading,
    error,
    refresh,
    totalCount,
    page,
    setPage,
    pageSize,
  } = useRapsLogs({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    rapNumero: rapNumeroFilter || undefined,
    fileName: fileNameFilter || undefined,
  });

  return (
    <Layout title="Logs de Importação de RAPs" showBackButton>
      <div className="page-container space-y-6 animate-fade-in">
        {/* Filtros */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="needs_ocr">Precisa OCR</SelectItem>
                  <SelectItem value="missing_required_fields">Campos Faltando</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Nº RAP</label>
              <Input
                placeholder="Ex: 007135-2026"
                value={rapNumeroFilter}
                onChange={(e) => setRapNumeroFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Nome do Arquivo</label>
              <Input
                placeholder="Buscar por nome..."
                value={fileNameFilter}
                onChange={(e) => setFileNameFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={refresh}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabela de Logs */}
        <RapsLogsTable
          logs={logs}
          loading={loading}
          error={error}
          onLogClick={setSelectedLogId}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          pageSize={pageSize}
        />

        {/* Modal de Detalhes */}
        {selectedLogId && (
          <RapsLogDetail
            logId={selectedLogId}
            onClose={() => setSelectedLogId(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default RapsLogs;
