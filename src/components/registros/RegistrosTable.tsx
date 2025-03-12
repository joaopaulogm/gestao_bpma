
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Registro } from '@/types/hotspots';

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
  const formatDateTime = (dateString: string) => {
    try {
      // For database date format (YYYY-MM-DD)
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        // Create date object ensuring we use correct day/month (not US format)
        return format(new Date(year, month - 1, day), 'dd/MM/yyyy', { locale: ptBR });
      }
      
      // For ISO format dates (with 'T')
      if (dateString.includes('T')) {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
      }
      
      // If it's already in DD/MM/YYYY format
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      // Fallback
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">Data</TableHead>
            <TableHead className="w-[140px]">Região</TableHead>
            <TableHead className="w-[80px]">Tipo</TableHead>
            <TableHead className="w-[120px]">Espécie</TableHead>
            <TableHead className="w-[120px]">Nome Científico</TableHead>
            <TableHead className="w-[90px]">Classe</TableHead>
            <TableHead className="w-[90px]">Estado</TableHead>
            <TableHead className="w-[90px]">Estágio</TableHead>
            <TableHead className="w-[50px]">Qtd.</TableHead>
            <TableHead className="w-[120px]">Destinação</TableHead>
            <TableHead className="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.length > 0 ? (
            registros.map((registro) => (
              <TableRow key={registro.id}>
                <TableCell className="whitespace-nowrap">{formatDateTime(registro.data)}</TableCell>
                <TableCell className="truncate max-w-[140px]">{registro.regiao_administrativa}</TableCell>
                <TableCell className="whitespace-nowrap">{registro.origem}</TableCell>
                <TableCell className="truncate max-w-[120px]">{registro.nome_popular}</TableCell>
                <TableCell className="truncate max-w-[120px] italic">{registro.nome_cientifico}</TableCell>
                <TableCell className="truncate">{registro.classe_taxonomica}</TableCell>
                <TableCell className="truncate">{registro.estado_saude}</TableCell>
                <TableCell className="truncate">{registro.estagio_vida}</TableCell>
                <TableCell className="text-center">{registro.quantidade}</TableCell>
                <TableCell className="truncate max-w-[120px]">{registro.destinacao}</TableCell>
                <TableCell className="text-right p-2">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onViewDetails(registro.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4 text-fauna-blue" />
                      <span className="sr-only">Ver</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(registro.id)}
                      title="Editar registro"
                    >
                      <Edit className="h-4 w-4 text-amber-500" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onDelete(registro.id, registro.nome_popular)}
                      title="Excluir registro"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8">
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
