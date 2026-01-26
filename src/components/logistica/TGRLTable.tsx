import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { TGRL } from '@/services/logisticaService';
import {
  TableCard,
  TableCardHeader,
  TableCardTitle,
  TableCardContent,
  TableCardField,
  TableCardBadge,
  TableCardActions,
} from '@/components/ui/table-card';

interface TGRLTableProps {
  tgrl: TGRL[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const getEstadoBadgeVariant = (estado?: string): "success" | "warning" | "destructive" | "default" => {
  if (!estado) return 'default';
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes('bom') || estadoLower.includes('excelente')) return 'success';
  if (estadoLower.includes('regular') || estadoLower.includes('razoável')) return 'warning';
  if (estadoLower.includes('ruim') || estadoLower.includes('péssimo')) return 'destructive';
  return 'default';
};

const TGRLTable: React.FC<TGRLTableProps> = ({ tgrl, onEdit, onDelete, onView }) => {
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (tgrl.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">Nenhum equipamento encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {tgrl.map((equipamento) => (
        <TableCard key={equipamento.id} className="hover:shadow-lg transition-shadow duration-200">
          <TableCardHeader>
            <TableCardTitle
              subtitle={equipamento.subitem ? `Subitem: ${equipamento.subitem}` : undefined}
            >
              {equipamento.tombamento || 'Sem tombamento'}
            </TableCardTitle>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {equipamento.estado_conservacao && (
                <TableCardBadge variant={getEstadoBadgeVariant(equipamento.estado_conservacao)}>
                  {equipamento.estado_conservacao}
                </TableCardBadge>
              )}
            </div>
          </TableCardHeader>

          <TableCardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <TableCardField
                label="Descrição"
                value={
                  <span className="text-sm font-medium">
                    {equipamento.descricao || equipamento.especificacao_bem || '-'}
                  </span>
                }
              />
              {equipamento.chassi_serie && (
                <TableCardField
                  label="Chassi/Série"
                  value={
                    <span className="text-sm">
                      {equipamento.chassi_serie}
                    </span>
                  }
                />
              )}
              <TableCardField
                label="Valor de Aquisição"
                value={
                  <span className="text-primary font-bold text-lg">
                    {formatCurrency(equipamento.valor_aquisicao || equipamento.valor)}
                  </span>
                }
              />
              <TableCardField
                label="Localização"
                value={
                  <span className="text-sm">
                    {equipamento.localizacao || '-'}
                  </span>
                }
              />
              {equipamento.situacao && (
                <TableCardField
                  label="Situação"
                  value={
                    <span className="text-sm font-medium">
                      {equipamento.situacao}
                    </span>
                  }
                />
              )}
            </div>
          </TableCardContent>

          <TableCardActions>
            <div className="flex items-center justify-end gap-2 w-full">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(equipamento.id)}
                  className="h-9 px-3 hover:bg-primary/10"
                  title="Ver detalhes"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ver</span>
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(equipamento.id)}
                  className="h-9 px-3 hover:bg-blue-50 hover:text-blue-700"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(equipamento.id)}
                  className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              )}
            </div>
          </TableCardActions>
        </TableCard>
      ))}
    </div>
  );
};

export default TGRLTable;
