import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Frota } from '@/services/logisticaService';
import {
  TableCard,
  TableCardHeader,
  TableCardTitle,
  TableCardContent,
  TableCardField,
  TableCardBadge,
  TableCardActions,
} from '@/components/ui/table-card';

interface FrotaTableProps {
  frota: Frota[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const getSituacaoBadgeVariant = (situacao?: string): "success" | "warning" | "destructive" | "default" => {
  if (!situacao) return 'default';
  const situacaoLower = situacao.toLowerCase();
  if (situacaoLower.includes('disponível')) return 'success';
  if (situacaoLower.includes('indisponível')) return 'destructive';
  if (situacaoLower.includes('baixada') || situacaoLower.includes('descarga')) return 'warning';
  return 'default';
};

const FrotaTable: React.FC<FrotaTableProps> = ({ frota, onEdit, onDelete, onView }) => {
  if (frota.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">Nenhum veículo encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {frota.map((veiculo) => (
        <TableCard key={veiculo.id} className="hover:shadow-lg transition-shadow duration-200">
          <TableCardHeader>
            <TableCardTitle
              subtitle={veiculo.placa ? `Placa: ${veiculo.placa}` : undefined}
            >
              {veiculo.prefixo || 'Sem prefixo'}
            </TableCardTitle>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {veiculo.situacao && (
                <TableCardBadge variant={getSituacaoBadgeVariant(veiculo.situacao)}>
                  {veiculo.situacao}
                </TableCardBadge>
              )}
              {veiculo.tipo && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium border bg-slate-100 text-slate-700 border-slate-200">
                  {veiculo.tipo}
                </span>
              )}
            </div>
          </TableCardHeader>

          <TableCardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <TableCardField
                label="Marca"
                value={
                  <span className="font-semibold text-foreground">
                    {veiculo.marca || '-'}
                  </span>
                }
              />
              <TableCardField
                label="Modelo"
                value={
                  <span className="text-sm">
                    {veiculo.modelo || '-'}
                  </span>
                }
              />
              <TableCardField
                label="Ano"
                value={
                  <span className="text-sm">
                    {veiculo.ano || veiculo.ano_fabricacao || '-'}
                  </span>
                }
              />
              <TableCardField
                label="Localização"
                value={
                  <span className="text-sm">
                    {veiculo.localizacao || '-'}
                  </span>
                }
              />
              <TableCardField
                label="KM/HM Atual"
                value={
                  <span className="text-primary font-bold text-lg">
                    {(veiculo.km_atual || veiculo.km_hm_atual) 
                      ? (veiculo.km_atual || veiculo.km_hm_atual)?.toLocaleString('pt-BR') 
                      : '-'}
                  </span>
                }
              />
              {veiculo.km_proxima_revisao || veiculo.km_hm_proxima_revisao ? (
                <TableCardField
                  label="Próxima Revisão"
                  value={
                    <span className="text-sm font-medium">
                      {(veiculo.km_proxima_revisao || veiculo.km_hm_proxima_revisao)?.toLocaleString('pt-BR')} km
                    </span>
                  }
                />
              ) : null}
            </div>
          </TableCardContent>

          <TableCardActions>
            <div className="flex items-center justify-end gap-2 w-full">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(veiculo.id)}
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
                  onClick={() => onEdit(veiculo.id)}
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
                  onClick={() => onDelete(veiculo.id)}
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

export default FrotaTable;
