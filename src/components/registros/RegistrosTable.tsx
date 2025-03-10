
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Registro {
  id: string;
  data: string;
  regiao_administrativa: string;
  origem: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  estado_saude: string;
  estagio_vida: string;
  quantidade: number;
  destinacao: string;
}

interface RegistrosTableProps {
  registros: Registro[];
  onViewDetails: (id: string) => void;
}

const RegistrosTable: React.FC<RegistrosTableProps> = ({ registros, onViewDetails }) => {
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
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
            <TableHead className="text-right">Detalhes</TableHead>
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => onViewDetails(registro.id)}
                  >
                    <Eye className="h-4 w-4 text-fauna-blue" />
                    <span className="hidden sm:inline">Ver</span>
                  </Button>
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

