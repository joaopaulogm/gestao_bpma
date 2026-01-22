import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Registro } from '@/types/hotspots';
import { useIsMobile } from '@/hooks/use-mobile';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface RegistrosTableProps {
  registros: Registro[];
  onViewDetails: (id: string) => void;
  onEdit?: (registro: Registro) => void;
  onDelete?: (id: string, nome: string) => void;
}

const RegistrosTable: React.FC<RegistrosTableProps> = ({ 
  registros, 
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const isMobile = useIsMobile();
  
  const formatDateTime = (dateString: string) => {
    try {
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return format(date, 'dd/MM/yyyy', { locale: ptBR });
        }
      }
      
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
          }
        }
      }
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };

  const canEdit = (data: string) => {
    const year = new Date(data).getFullYear();
    return year >= 2026;
  };

  return (
    <div className="w-full overflow-x-auto -mx-1 px-1">
      <div className="inline-block min-w-full rounded-lg border border-border bg-card">
        <Table className="w-full" style={{ minWidth: isMobile ? '800px' : '1200px' }}>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-[100px] px-3 py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Data</TableHead>
              <TableHead className="min-w-[140px] px-3 py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Região</TableHead>
              <TableHead className="min-w-[100px] px-3 py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Tipo</TableHead>
              {!isMobile && (
                <>
                  <TableHead className="min-w-[160px] px-3 py-3 font-semibold text-xs sm:text-sm">Espécie</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[180px] px-3 py-3 font-semibold text-xs sm:text-sm">Nome Científico</TableHead>
                </>
              )}
              <TableHead className="hidden sm:table-cell min-w-[100px] px-3 py-3 font-semibold text-xs sm:text-sm">Classe</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[100px] px-3 py-3 font-semibold text-xs sm:text-sm">Estado</TableHead>
              <TableHead className="hidden md:table-cell min-w-[100px] px-3 py-3 font-semibold text-xs sm:text-sm">Estágio</TableHead>
              <TableHead className="min-w-[60px] px-3 py-3 text-center font-semibold text-xs sm:text-sm">Qtd.</TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px] px-3 py-3 font-semibold text-xs sm:text-sm">Destinação</TableHead>
              <TableHead className="min-w-[120px] px-3 py-3 text-right font-semibold text-xs sm:text-sm whitespace-nowrap">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.length > 0 ? (
              registros.map((registro) => (
                <TableRow 
                  key={registro.id} 
                  className="hover:bg-primary/5 transition-colors border-b border-border/50"
                >
                  <TableCell className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs sm:text-sm font-medium">{formatDateTime(registro.data)}</span>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <span className="text-xs sm:text-sm">{registro.regiao_administrativa?.nome || '-'}</span>
                  </TableCell>
                  <TableCell className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs sm:text-sm">{registro.origem?.nome || '-'}</span>
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell className="px-3 py-3">
                        <span className="text-xs sm:text-sm font-medium text-primary">
                          {registro.especie?.nome_popular || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell px-3 py-3">
                        <span className="text-xs sm:text-sm italic text-muted-foreground">
                          {registro.especie?.nome_cientifico || '-'}
                        </span>
                      </TableCell>
                    </>
                  )}
                  <TableCell className="hidden sm:table-cell px-3 py-3">
                    <span className="text-xs sm:text-sm">{registro.especie?.classe_taxonomica || '-'}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
                    <span className="text-xs sm:text-sm">{registro.estado_saude?.nome || '-'}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-3 py-3">
                    <span className="text-xs sm:text-sm">{registro.estagio_vida?.nome || '-'}</span>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-center">
                    <span className="text-xs sm:text-sm font-semibold">{registro.quantidade}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-3 py-3">
                    <span className="text-xs sm:text-sm">{registro.destinacao?.nome || '-'}</span>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(registro.id)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(registro)}
                          disabled={!canEdit(registro.data)}
                          className="h-8 w-8 p-0 flex-shrink-0"
                          title={canEdit(registro.data) ? 'Editar' : 'Somente registros de 2026+'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(registro.id, registro.especie?.nome_popular || 'registro')}
                          disabled={!canEdit(registro.data)}
                          className="h-8 w-8 p-0 flex-shrink-0 text-destructive hover:text-destructive"
                          title={canEdit(registro.data) ? 'Excluir' : 'Somente registros de 2026+'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isMobile ? 6 : 11} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground text-sm">Nenhum registro encontrado com os filtros atuais.</p>
                    <p className="text-muted-foreground text-xs">Use os botões de ação para ver, editar ou excluir registros</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RegistrosTable;
