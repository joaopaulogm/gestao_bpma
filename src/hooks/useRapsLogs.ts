import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
const supabaseAny = supabase as any;

export interface RapsLog {
  id: string;
  created_at: string;
  file_id: string;
  file_name: string;
  folder_id: string | null;
  modified_time: string | null;
  rap_numero: string | null;
  rap_tipo: string | null;
  status: 'success' | 'needs_ocr' | 'missing_required_fields' | 'error';
  missing_fields: string[];
  warnings: string[];
  error_message: string | null;
  raw_excerpt: string | null;
  inserted_ids: string[] | null;
  processing_time_ms: number | null;
  pdf_size_bytes: number | null;
}

interface UseRapsLogsOptions {
  status?: string;
  rapNumero?: string;
  fileName?: string;
  page?: number;
  pageSize?: number;
}

export const useRapsLogs = (options: UseRapsLogsOptions = {}) => {
  const [logs, setLogs] = useState<RapsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(options.page || 1);
  const pageSize = options.pageSize || 20;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabaseAny
        .from('rap_import_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Aplicar filtros
      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.rapNumero) {
        query = query.ilike('rap_numero', `%${options.rapNumero}%`);
      }

      if (options.fileName) {
        query = query.ilike('file_name', `%${options.fileName}%`);
      }

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Erro ao buscar logs:', err);
      setError(err.message || 'Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, options.status, options.rapNumero, options.fileName]);

  const refresh = () => {
    fetchLogs();
  };

  return {
    logs,
    loading,
    error,
    refresh,
    totalCount,
    page,
    setPage,
    pageSize,
  };
};
