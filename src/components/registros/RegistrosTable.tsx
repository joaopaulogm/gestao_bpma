import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Registro } from '@/types/hotspots';
import { useIsMobile } from '@/hooks/use-mobile';

interface RegistrosTableProps {
  registros: Registro[];
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, nome: string) => void;
}

const RegistrosTable: React.FC<RegistrosTableProps> = ({ 
  registros, 
  onViewDetails, 
  onEdit, 
  onDelete 
}) => {
  const isMobile = useIsMobile();
  
  const formatDateTime = (dateString: string) => {
    try {
      // Handle different date formats and ensure DD/MM/YYYY display
      
      // If date is in ISO or date object format
      if (dateString.includes('T') || dateString.includes('-')) {
        const date = new Date(dateString);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          return format(date, 'dd/MM/yyyy', { locale: ptBR });
        }
      }
      
      // If already in DD/MM/YYYY format
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      // Last resort, try to parse using date-fns
      try {
        // Try to parse the date assuming it's YYYY-MM-DD
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
        return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
      } catch (parseError) {
        console.error('Error parsing date:', parseError, dateString);
        return dateString;
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70px] px-1 md:px-2 whitespace-nowrap">Data</TableHead>
            <TableHead className="w-[100px] md:w-[130px] px-1 md:px-2 whitespace-nowrap">Região</TableHead>
            <TableHead className="w-[60px] px-1 md:px-2 whitespace-nowrap">Tipo</TableHead>
            {!isMobile && (
              <>
                <TableHead className="w-[120px]">Espécie</TableHead>
                <TableHead className="hidden lg:table-cell w-[120px]">Nome Científico</TableHead>
              </>
            )}
            <TableHead className="w-[90px] hidden sm:table-cell">Classe</TableHead>
            <TableHead className="w-[80px] hidden sm:table-cell">Estado</TableHead>
            <TableHead className="w-[80px] hidden md:table-cell">Estágio</TableHead>
            <TableHead className="w-[40px] px-1 md:px-2 text-center">Qtd.</TableHead>
            <TableHead className="w-[90px] hidden md:table-cell">Destinação</TableHead>
            <TableHead className="w-[80px] md:w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.length > 0 ? (
            registros.map((registro) => (
              <TableRow key={registro.id} className="hover:bg-gray-50">
                <TableCell className="px-1 md:px-2 whitespace-nowrap">{formatDateTime(registro.data)}</TableCell>
                <TableCell className="px-1 md:px-2 truncate max-w-[100px] md:max-w-[130px]">{registro.regiao_administrativa}</TableCell>
                <TableCell className="px-1 md:px-2 whitespace-nowrap">{registro.origem}</TableCell>
                {!isMobile && (
                  <>
                    <TableCell className="truncate max-w-[120px]">{registro.nome_popular}</TableCell>
                    <TableCell className="hidden lg:table-cell truncate max-w-[120px] italic">{registro.nome_cientifico}</TableCell>
                  </>
                )}
                <TableCell className="hidden sm:table-cell truncate">{registro.classe_taxonomica}</TableCell>
                <TableCell className="hidden sm:table-cell truncate">{registro.estado_saude}</TableCell>
                <TableCell className="hidden md:table-cell truncate">{registro.estagio_vida}</TableCell>
                <TableCell className="px-1 md:px-2 text-center">{registro.quantidade}</TableCell>
                <TableCell className="hidden md:table-cell truncate max-w-[90px]">{registro.destinacao}</TableCell>
                <TableCell className="p-1 text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => onViewDetails(registro.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5 text-fauna-blue" />
                      <span className="sr-only">Ver</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => onEdit(registro.id)}
                      title="Editar registro"
                    >
                      <Edit className="h-3.5 w-3.5 text-amber-500" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => onDelete(registro.id, registro.nome_popular)}
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
  );
};

export default RegistrosTable;
