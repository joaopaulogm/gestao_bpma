
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Registro } from '@/types/hotspots';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface RegistrosTableProps {
  registros: Registro[];
  onViewDetails: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, nome: string) => void;
  onDuplicate?: (id: string) => void;
}

const RegistrosTable: React.FC<RegistrosTableProps> = ({ 
  registros, 
  onViewDetails
}) => {
  const isMobile = useIsMobile();
  
  const formatDateTime = (dateString: string) => {
    try {
      // If already in DD/MM/YYYY format
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      // If date is in ISO format (with T)
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return format(date, 'dd/MM/yyyy', { locale: ptBR });
        }
      }
      
      // If date is in YYYY-MM-DD format
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          // Ensure we're parsing in the correct format
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
          const day = parseInt(parts[2]);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
          }
        }
      }
      
      // Generic fallback
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

  const handleRowClick = (e: React.MouseEvent, registroId: string) => {
    // Não abrir detalhes se clicou em um botão ou link
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    onViewDetails(registroId);
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className="w-full min-w-[640px]">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Data</TableHead>
            <TableHead className="min-w-[120px] px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Região</TableHead>
            <TableHead className="min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Tipo</TableHead>
            {!isMobile && (
              <>
                <TableHead className="min-w-[140px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Espécie</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[160px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Nome Científico</TableHead>
              </>
            )}
            <TableHead className="hidden sm:table-cell min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Classe</TableHead>
            <TableHead className="hidden sm:table-cell min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Estado</TableHead>
            <TableHead className="hidden md:table-cell min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Estágio</TableHead>
            <TableHead className="min-w-[60px] px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">Qtd.</TableHead>
            <TableHead className="hidden md:table-cell min-w-[120px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Destinação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.length > 0 ? (
            registros.map((registro) => (
              <TableRow 
                key={registro.id} 
                className="hover:bg-primary/5 cursor-pointer transition-colors border-b border-border/50"
                onClick={(e) => handleRowClick(e, registro.id)}
              >
                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-medium">{formatDateTime(registro.data)}</span>
                </TableCell>
                <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                  <span className="text-xs sm:text-sm">{registro.regiao_administrativa?.nome || '-'}</span>
                </TableCell>
                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  <span className="text-xs sm:text-sm">{registro.origem?.nome || '-'}</span>
                </TableCell>
                {!isMobile && (
                  <>
                    <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className="text-xs sm:text-sm font-medium text-primary hover:underline">
                        {registro.especie?.nome_popular || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3">
                      <span className="text-xs sm:text-sm italic text-muted-foreground">
                        {registro.especie?.nome_cientifico || '-'}
                      </span>
                    </TableCell>
                  </>
                )}
                <TableCell className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3">
                  <span className="text-xs sm:text-sm">{registro.especie?.classe_taxonomica || '-'}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3">
                  <span className="text-xs sm:text-sm">{registro.estado_saude?.nome || '-'}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3">
                  <span className="text-xs sm:text-sm">{registro.estagio_vida?.nome || '-'}</span>
                </TableCell>
                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <span className="text-xs sm:text-sm font-semibold">{registro.quantidade}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3">
                  <span className="text-xs sm:text-sm">{registro.destinacao?.nome || '-'}</span>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isMobile ? 5 : 10} className="text-center py-8 sm:py-12">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-muted-foreground text-xs sm:text-sm">Nenhum registro encontrado com os filtros atuais.</p>
                  <p className="text-muted-foreground text-xs">Clique em uma linha para ver os detalhes do registro</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RegistrosTable;
