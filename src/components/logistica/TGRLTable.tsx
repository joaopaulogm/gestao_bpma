import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { TGRL } from '@/services/logisticaService';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface TGRLTableProps {
  tgrl: TGRL[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const getEstadoBadgeVariant = (estado?: string) => {
  if (!estado) return 'secondary';
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes('bom')) return 'default';
  if (estadoLower.includes('regular')) return 'secondary';
  if (estadoLower.includes('ruim')) return 'destructive';
  return 'secondary';
};

const TGRLTable: React.FC<TGRLTableProps> = ({ tgrl, onEdit, onDelete, onView }) => {
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className="w-full min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Tombamento</TableHead>
            <TableHead className="min-w-[200px]">Especificação do Bem</TableHead>
            <TableHead className="min-w-[80px]">Subitem</TableHead>
            <TableHead className="min-w-[100px]">Valor</TableHead>
            <TableHead className="min-w-[100px]">Estado</TableHead>
            <TableHead className="min-w-[120px]">Localização</TableHead>
            <TableHead className="min-w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tgrl.length > 0 ? (
            tgrl.map((equipamento) => (
              <TableRow key={equipamento.id} className="hover:bg-muted/50">
                <TableCell className="font-medium whitespace-nowrap">{equipamento.tombamento || '-'}</TableCell>
                <TableCell>
                  <div className="max-w-full truncate" title={equipamento.especificacao_bem}>
                    {equipamento.especificacao_bem || '-'}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{equipamento.subitem || '-'}</TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(equipamento.valor)}</TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadgeVariant(equipamento.estado_conservacao)} className="w-fit">
                    {equipamento.estado_conservacao || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{equipamento.localizacao || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(equipamento.id)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(equipamento.id)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(equipamento.id)}
                        className="h-8 w-8 p-0 flex-shrink-0 text-destructive hover:text-destructive"
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
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum equipamento encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TGRLTable;
