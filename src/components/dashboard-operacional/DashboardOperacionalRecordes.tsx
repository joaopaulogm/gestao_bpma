import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface RecordeApreensao {
  id: string;
  data_ocorrencia: string;
  ano: number;
  mes: number;
  especie_nome_popular: string;
  especie_nome_cientifico?: string;
  quantidade: number;
  tipo_crime?: string;
  descricao?: string;
}

interface Props {
  recordes: RecordeApreensao[];
  year?: number;
}

const DashboardOperacionalRecordes: React.FC<Props> = ({ recordes, year }) => {
  if (!recordes || recordes.length === 0) return null;

  // Filtrar por ano se especificado - mostrar apenas recordes do ano selecionado
  const recordesDoAno = year 
    ? [...recordes].filter(r => r.ano === year).sort((a, b) => b.quantidade - a.quantidade)
    : [...recordes].sort((a, b) => b.quantidade - a.quantidade);
  
  // Se não houver recordes para o ano selecionado, não renderizar
  if (recordesDoAno.length === 0) return null;
  
  // Maior recorde do ano selecionado
  const maiorRecorde = recordesDoAno[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Recordes de Apreensão</h3>
      </div>

      {/* Card do maior recorde do ano */}
      <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Maior Apreensão {year ? `de ${year}` : 'do Ano'}
            </CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {year || 'Recorde'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-amber-600">{maiorRecorde.quantidade.toLocaleString()}</p>
              <p className="text-lg font-medium">{maiorRecorde.especie_nome_popular}</p>
              {maiorRecorde.especie_nome_cientifico && (
                <p className="text-sm text-muted-foreground italic">{maiorRecorde.especie_nome_cientifico}</p>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1 justify-end">
                <Calendar className="h-3 w-3" />
                {format(new Date(maiorRecorde.data_ocorrencia), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              {maiorRecorde.tipo_crime && (
                <Badge variant="outline" className="mt-1">{maiorRecorde.tipo_crime}</Badge>
              )}
            </div>
          </div>
          {maiorRecorde.descricao && (
            <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{maiorRecorde.descricao}</p>
          )}
        </CardContent>
      </Card>

      {/* Lista de outros recordes do ano */}
      {recordesDoAno.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recordesDoAno.slice(1).map((recorde, index) => (
            <Card key={recorde.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 2}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{recorde.ano}</span>
                </div>
                <p className="text-2xl font-bold text-primary">{recorde.quantidade.toLocaleString()}</p>
                <p className="font-medium text-sm truncate" title={recorde.especie_nome_popular}>
                  {recorde.especie_nome_popular}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(recorde.data_ocorrencia), "dd/MM/yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardOperacionalRecordes;
