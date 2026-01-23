import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Registro } from '@/types/hotspots';
import { useIsMobile } from '@/hooks/use-mobile';
import { Eye, Edit, Trash2 } from 'lucide-react';
import {
  TableCard,
  TableCardHeader,
  TableCardTitle,
  TableCardContent,
  TableCardField,
  TableCardBadge,
  TableCardActions,
} from '@/components/ui/table-card';

interface RegistrosTableProps {
  registros: Registro[];
  onViewDetails: (id: string) => void;
  onEdit?: (registro: Registro) => void;
  onDelete?: (id: string, nome: string) => void;
}

const RegistrosTable: React.FC<RegistrosTableProps> = ({ 
  registros, 
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const isMobile = useIsMobile();
  
  const formatDateTime = (dateString: string) => {
    try {
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return format(date, 'dd/MM/yyyy', { locale: ptBR });
        }
      }
      
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
          }
        }
      }
      
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

  const canEdit = (data: string) => {
    const year = new Date(data).getFullYear();
    return year >= 2026;
  };

  const getEstadoBadgeVariant = (estado: string | undefined): "success" | "warning" | "destructive" | "default" => {
    if (!estado) return "default";
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('saudável') || estadoLower.includes('bom')) return "success";
    if (estadoLower.includes('débil') || estadoLower.includes('fraco')) return "warning";
    if (estadoLower.includes('óbito') || estadoLower.includes('morto')) return "destructive";
    return "default";
  };

  if (registros.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm mb-2">Nenhum registro encontrado com os filtros atuais.</p>
          <p className="text-muted-foreground text-xs">Use os botões de ação para ver, editar ou excluir registros</p>
        </div>
      </div>
    );
  }

  const getClasseBadgeColor = (classe: string | undefined): string => {
    if (!classe) return 'bg-slate-100 text-slate-700';
    const classeLower = classe.toLowerCase();
    if (classeLower.includes('mamífero') || classeLower.includes('mammal')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (classeLower.includes('réptil') || classeLower.includes('reptile')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (classeLower.includes('ave') || classeLower.includes('bird')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (classeLower.includes('anfíbio') || classeLower.includes('amphibian')) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getTipoBadgeColor = (tipo: string | undefined): string => {
    if (!tipo) return 'bg-slate-100 text-slate-700';
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('copom')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (tipoLower.includes('resgate')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (tipoLower.includes('apreensão')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="w-full space-y-4">
      {registros.map((registro) => (
        <TableCard key={registro.id} className="hover:shadow-lg transition-shadow duration-200">
          <TableCardHeader>
            <TableCardTitle
              subtitle={
                !isMobile && registro.especie?.nome_cientifico
                  ? `${registro.especie.nome_cientifico}`
                  : undefined
              }
            >
              {registro.especie?.nome_popular || 'Espécie não identificada'}
            </TableCardTitle>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {registro.estado_saude?.nome && (
                <TableCardBadge variant={getEstadoBadgeVariant(registro.estado_saude.nome)}>
                  {registro.estado_saude.nome}
                </TableCardBadge>
              )}
              {registro.especie?.classe_taxonomica && (
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${getClasseBadgeColor(registro.especie.classe_taxonomica)}`}>
                  {registro.especie.classe_taxonomica}
                </span>
              )}
            </div>
          </TableCardHeader>

          <TableCardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <TableCardField
                label="Data"
                value={
                  <span className="font-semibold text-foreground">
                    {formatDateTime(registro.data)}
                  </span>
                }
              />
              <TableCardField
                label="Região"
                value={
                  <span className="text-sm">
                    {registro.regiao_administrativa?.nome || '-'}
                  </span>
                }
              />
              <TableCardField
                label="Tipo"
                value={
                  registro.origem?.nome ? (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTipoBadgeColor(registro.origem.nome)}`}>
                      {registro.origem.nome}
                    </span>
                  ) : (
                    '-'
                  )
                }
              />
              {!isMobile && (
                <>
                  <TableCardField
                    label="Estágio de Vida"
                    value={
                      registro.estagio_vida?.nome ? (
                        <span className="text-sm font-medium">
                          {registro.estagio_vida.nome}
                        </span>
                      ) : (
                        '-'
                      )
                    }
                  />
                  <TableCardField
                    label="Destinação"
                    value={
                      registro.destinacao?.nome ? (
                        <span className="text-sm">
                          {registro.destinacao.nome}
                        </span>
                      ) : (
                        '-'
                      )
                    }
                  />
                </>
              )}
              <TableCardField
                label="Quantidade"
                value={
                  <span className="text-primary font-bold text-lg">
                    {registro.quantidade || 0}
                  </span>
                }
              />
            </div>
          </TableCardContent>

          <TableCardActions>
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(registro.id)}
                className="h-9 px-3 hover:bg-primary/10"
                title="Ver detalhes"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ver</span>
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(registro)}
                  disabled={!canEdit(registro.data)}
                  className="h-9 px-3 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                  title={canEdit(registro.data) ? 'Editar' : 'Somente registros de 2026+'}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(registro.id, registro.especie?.nome_popular || 'registro')}
                  disabled={!canEdit(registro.data)}
                  className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  title={canEdit(registro.data) ? 'Excluir' : 'Somente registros de 2026+'}
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

export default RegistrosTable;
