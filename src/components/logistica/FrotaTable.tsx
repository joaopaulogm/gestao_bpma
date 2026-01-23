import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Frota } from '@/services/logisticaService';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface FrotaTableProps {
  frota: Frota[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const getSituacaoBadgeVariant = (situacao?: string) => {
  if (!situacao) return 'secondary';
  const situacaoLower = situacao.toLowerCase();
  if (situacaoLower.includes('disponível')) return 'default';
  if (situacaoLower.includes('indisponível')) return 'destructive';
  if (situacaoLower.includes('baixada')) return 'outline';
  if (situacaoLower.includes('descarga')) return 'secondary';
  return 'secondary';
};

const FrotaTable: React.FC<FrotaTableProps> = ({ frota, onEdit, onDelete, onView }) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="w-full min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[80px]">Prefixo</TableHead>
            <TableHead className="min-w-[100px]">Tipo</TableHead>
            <TableHead className="min-w-[140px]">Marca/Modelo</TableHead>
            <TableHead className="min-w-[100px]">Placa</TableHead>
            <TableHead className="min-w-[120px]">Localização</TableHead>
            <TableHead className="min-w-[100px]">KM/HM Atual</TableHead>
            <TableHead className="min-w-[120px]">Situação</TableHead>
            <TableHead className="min-w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {frota.length > 0 ? (
            frota.map((veiculo) => (
              <TableRow key={veiculo.id} className="hover:bg-muted/50">
                <TableCell className="font-medium whitespace-nowrap">{veiculo.prefixo || '-'}</TableCell>
                <TableCell className="whitespace-nowrap">{veiculo.tipo || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{veiculo.marca || '-'}</span>
                    {veiculo.modelo && (
                      <span className="text-xs text-muted-foreground">{veiculo.modelo}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{veiculo.placa || '-'}</TableCell>
                <TableCell className="whitespace-nowrap">{veiculo.localizacao || '-'}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {(veiculo.km_atual || veiculo.km_hm_atual) ? (veiculo.km_atual || veiculo.km_hm_atual)?.toLocaleString('pt-BR') : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={getSituacaoBadgeVariant(veiculo.situacao)} className="w-fit">
                    {veiculo.situacao || '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(veiculo.id)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(veiculo.id)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(veiculo.id)}
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
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nenhum veículo encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FrotaTable;
