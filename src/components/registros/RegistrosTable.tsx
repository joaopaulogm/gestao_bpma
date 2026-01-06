
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

  return (
    <div className="w-full overflow-x-auto">
      <ScrollArea className="w-full rounded-lg">
        <div className="min-w-[1200px]">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px] px-2 whitespace-nowrap">Data</TableHead>
                <TableHead className="w-[150px] px-2 whitespace-nowrap">Região</TableHead>
                <TableHead className="w-[100px] px-2 whitespace-nowrap">Tipo</TableHead>
                {!isMobile && (
                  <>
                    <TableHead className="w-[150px] px-2">Espécie</TableHead>
                    <TableHead className="hidden lg:table-cell w-[180px] px-2">Nome Científico</TableHead>
                  </>
                )}
                <TableHead className="w-[120px] hidden sm:table-cell px-2">Classe</TableHead>
                <TableHead className="w-[100px] hidden sm:table-cell px-2">Estado</TableHead>
                <TableHead className="w-[100px] hidden md:table-cell px-2">Estágio</TableHead>
                <TableHead className="w-[60px] px-2 text-center">Qtd.</TableHead>
                <TableHead className="w-[120px] hidden md:table-cell px-2">Destinação</TableHead>
                <TableHead className="w-[180px] px-2 text-right whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.length > 0 ? (
                registros.map((registro) => (
                  <TableRow key={registro.id} className="hover:bg-muted/50">
                    <TableCell className="px-2 whitespace-nowrap">{formatDateTime(registro.data)}</TableCell>
                    <TableCell className="px-2 min-w-[150px]">{registro.regiao_administrativa?.nome || '-'}</TableCell>
                    <TableCell className="px-2 whitespace-nowrap">{registro.origem?.nome || '-'}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell className="px-2 min-w-[150px]">{registro.especie?.nome_popular || '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell px-2 min-w-[180px] italic">{registro.especie?.nome_cientifico || '-'}</TableCell>
                      </>
                    )}
                    <TableCell className="hidden sm:table-cell px-2">{registro.especie?.classe_taxonomica || '-'}</TableCell>
                    <TableCell className="hidden sm:table-cell px-2">{registro.estado_saude?.nome || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell px-2">{registro.estagio_vida?.nome || '-'}</TableCell>
                    <TableCell className="px-2 text-center">{registro.quantidade}</TableCell>
                    <TableCell className="hidden md:table-cell px-2 min-w-[120px]">{registro.destinacao?.nome || '-'}</TableCell>
                    <TableCell className="px-2 text-right">
                      <div className="flex justify-end gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 flex-shrink-0"
                          onClick={() => onViewDetails(registro.id)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-3.5 w-3.5 text-fauna-blue" />
                          <span className="sr-only">Ver</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 flex-shrink-0"
                          onClick={() => onEdit(registro.id)}
                          title="Editar registro"
                        >
                          <Edit className="h-3.5 w-3.5 text-amber-500" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 flex-shrink-0"
                          onClick={() => onDuplicate(registro.id)}
                          title="Duplicar registro"
                        >
                          <Copy className="h-3.5 w-3.5 text-blue-500" />
                          <span className="sr-only">Duplicar</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 flex-shrink-0"
                          onClick={() => onDelete(registro.id, registro.especie?.nome_popular || 'este registro')}
                          title="Excluir registro"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isMobile ? 5 : 11} className="text-center py-8">
                    Nenhum registro encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default RegistrosTable;
