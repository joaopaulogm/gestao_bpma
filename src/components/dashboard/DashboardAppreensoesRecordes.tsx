
import React, { useState, useMemo } from 'react';
import ChartCard from './ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Registro {
  id: string;
  data: string;
  origem?: {
    nome: string;
  };
  quantidade?: number;
  quantidade_total?: number;
  especie?: {
    classe_taxonomica: string;
    nome_cientifico: string;
    nome_popular: string;
  };
  numero_tco?: string;
  [key: string]: any;
}

interface DashboardAppreensoesRecordesProps {
  registros: Registro[];
}

const DashboardAppreensoesRecordes: React.FC<DashboardAppreensoesRecordesProps> = ({ 
  registros 
}) => {
  // Find record with most animals
  const recordeMaiorQuantidade = useMemo(() => {
    if (!registros || registros.length === 0) return null;
    
    return registros.reduce((maior, atual) => {
      const quantidadeAtual = atual.quantidade_total || atual.quantidade || 0;
      const quantidadeMaior = maior.quantidade_total || maior.quantidade || 0;
      return quantidadeAtual > quantidadeMaior ? atual : maior;
    }, registros[0]);
  }, [registros]);
  
  // Find largest seizure (TCO) by number of animals
  const recordeApreensao = useMemo(() => {
    if (!registros || registros.length === 0) return null;
    
    const apreensoes = registros.filter(r => 
      r.origem?.nome === 'Apreensão' || r.origem?.nome === 'Apreensão/Resgate');
    
    if (apreensoes.length === 0) return null;
    
    return apreensoes.reduce((maior, atual) => {
      const quantidadeAtual = atual.quantidade_total || atual.quantidade || 0;
      const quantidadeMaior = maior.quantidade_total || maior.quantidade || 0;
      return quantidadeAtual > quantidadeMaior ? atual : maior;
    }, apreensoes[0]);
  }, [registros]);

  return (
    <ChartCard 
      title="Recordes de Apreensões" 
      subtitle="Ocorrências com maior número de animais"
    >
      <div className="grid grid-cols-1 gap-4 h-auto pb-4">
        {recordeMaiorQuantidade && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-blue-700">
                  Maior Número de Animais
                </CardTitle>
                <Award className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                <span className="text-2xl font-bold text-blue-800">
                  {recordeMaiorQuantidade.quantidade_total || recordeMaiorQuantidade.quantidade || 0} {(recordeMaiorQuantidade.quantidade_total || recordeMaiorQuantidade.quantidade || 0) > 1 ? 'animais' : 'animal'}
                </span>
                <span className="text-sm text-blue-800">
                  {recordeMaiorQuantidade.especie?.nome_popular} ({recordeMaiorQuantidade.especie?.nome_cientifico})
                </span>
                <div className="flex items-center mt-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">
                    {format(parseISO(recordeMaiorQuantidade.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <Badge variant="outline" className="mt-1 w-fit bg-blue-100 text-blue-700 border-blue-200">
                  {recordeMaiorQuantidade.origem?.nome}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
        
        {recordeApreensao && (
          <Card className="bg-purple-50 border-purple-200 mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-purple-700">
                  Maior Apreensão
                </CardTitle>
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                <span className="text-2xl font-bold text-purple-800">
                  {recordeApreensao.quantidade_total || recordeApreensao.quantidade || 0} {(recordeApreensao.quantidade_total || recordeApreensao.quantidade || 0) > 1 ? 'animais' : 'animal'}
                </span>
                <span className="text-sm text-purple-800">
                  {recordeApreensao.especie?.nome_popular} ({recordeApreensao.especie?.nome_cientifico})
                </span>
                <div className="flex items-center mt-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-600 mr-1" />
                  <span className="text-xs text-purple-600">
                    {format(parseISO(recordeApreensao.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                {recordeApreensao.numero_tco && (
                  <span className="text-xs text-purple-600 mt-1">
                    TCO: {recordeApreensao.numero_tco}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ChartCard>
  );
};

export default DashboardAppreensoesRecordes;
