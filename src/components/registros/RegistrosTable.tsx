
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
      // Make sure we parse the date correctly before formatting
      const date = dateString.includes('T') ? parseISO(dateString) : new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Região</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Espécie</TableHead>
            <TableHead>Nome Científico</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Estágio de Vida</TableHead>
            <TableHead>Qtd.</TableHead>
            <TableHead>Destinação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.length > 0 ? (
            registros.map((registro) => (
              <TableRow key={registro.id}>
                <TableCell>{formatDateTime(registro.data)}</TableCell>
                <TableCell className="max-w-[150px] truncate">{registro.regiao_administrativa}</TableCell>
                <TableCell>{registro.origem}</TableCell>
                <TableCell className="max-w-[150px] truncate">{registro.nome_popular}</TableCell>
                <TableCell className="max-w-[150px] truncate italic">{registro.nome_cientifico}</TableCell>
                <TableCell>{registro.classe_taxonomica}</TableCell>
                <TableCell>{registro.estado_saude}</TableCell>
                <TableCell>{registro.estagio_vida}</TableCell>
                <TableCell>{registro.quantidade}</TableCell>
                <TableCell className="max-w-[150px] truncate">{registro.destinacao}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => onViewDetails(registro.id)}
                    >
                      <Eye className="h-4 w-4 text-fauna-blue" />
                      <span className="hidden sm:inline">Ver</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => onEdit(registro.id)}
                    >
                      <Edit className="h-4 w-4 text-amber-500" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => onDelete(registro.id, registro.nome_popular)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="hidden sm:inline">Excluir</span>
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
