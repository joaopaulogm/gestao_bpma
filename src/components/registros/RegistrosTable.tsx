
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Copy } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Registro } from '@/types/hotspots';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface RegistrosTableProps {
  registros: Registro[];
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, nome: string) => void;
  onDuplicate: (id: string) => void;
}

const RegistrosTable: React.FC<RegistrosTableProps> = ({ 
  registros, 
  onViewDetails, 
  onEdit, 
  onDelete,
  onDuplicate
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
    <div className="w-full">
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="px-4 py-3 whitespace-nowrap font-semibold">Data</TableHead>
              <TableHead className="px-4 py-3 whitespace-nowrap font-semibold">Região</TableHead>
              <TableHead className="px-4 py-3 whitespace-nowrap font-semibold">Tipo</TableHead>
              {!isMobile && (
                <>
                  <TableHead className="px-4 py-3 font-semibold">Espécie</TableHead>
                  <TableHead className="hidden lg:table-cell px-4 py-3 font-semibold">Nome Científico</TableHead>
                </>
              )}
              <TableHead className="hidden sm:table-cell px-4 py-3 font-semibold">Classe</TableHead>
              <TableHead className="hidden sm:table-cell px-4 py-3 font-semibold">Estado</TableHead>
              <TableHead className="hidden md:table-cell px-4 py-3 font-semibold">Estágio</TableHead>
              <TableHead className="px-4 py-3 text-center font-semibold">Qtd.</TableHead>
              <TableHead className="hidden md:table-cell px-4 py-3 font-semibold">Destinação</TableHead>
              <TableHead className="px-4 py-3 text-right whitespace-nowrap font-semibold">Ações</TableHead>
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
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium">{formatDateTime(registro.data)}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm">{registro.regiao_administrativa?.nome || '-'}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm">{registro.origem?.nome || '-'}</span>
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm font-medium text-primary hover:underline">
                          {registro.especie?.nome_popular || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell px-4 py-3">
                        <span className="text-sm italic text-muted-foreground">
                          {registro.especie?.nome_cientifico || '-'}
                        </span>
                      </TableCell>
                    </>
                  )}
                  <TableCell className="hidden sm:table-cell px-4 py-3">
                    <span className="text-sm">{registro.especie?.classe_taxonomica || '-'}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell px-4 py-3">
                    <span className="text-sm">{registro.estado_saude?.nome || '-'}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-4 py-3">
                    <span className="text-sm">{registro.estagio_vida?.nome || '-'}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold">{registro.quantidade}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-4 py-3">
                    <span className="text-sm">{registro.destinacao?.nome || '-'}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 flex-shrink-0 hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(registro.id);
                        }}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="sr-only">Ver</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 flex-shrink-0 hover:bg-amber-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(registro.id);
                        }}
                        title="Editar registro"
                      >
                        <Edit className="h-4 w-4 text-amber-600" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 flex-shrink-0 hover:bg-blue-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(registro.id);
                        }}
                        title="Duplicar registro"
                      >
                        <Copy className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">Duplicar</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 flex-shrink-0 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(registro.id, registro.especie?.nome_popular || 'este registro');
                        }}
                        title="Excluir registro"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isMobile ? 5 : 11} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground text-sm">Nenhum registro encontrado com os filtros atuais.</p>
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
