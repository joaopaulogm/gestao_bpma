import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, Calendar, Umbrella } from 'lucide-react';
import { QuotaData } from '@/hooks/useCampanhaQuotas';

interface CampanhaQuotaSectionProps {
  feriasQuota: QuotaData;
  abonoQuota: QuotaData;
  ano: number;
  mes: number;
  loading?: boolean;
}

export const CampanhaQuotaSection: React.FC<CampanhaQuotaSectionProps> = ({
  feriasQuota,
  abonoQuota,
  ano,
  mes,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const mesNum = mes + 1;

  const QuotaCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    quota: QuotaData;
    colorClass: string;
    minutaUrl: string;
    minutaLabel: string;
  }> = ({ title, icon, quota, colorClass, minutaUrl, minutaLabel }) => (
    <Card className={`border-${colorClass}/30 bg-${colorClass}/5`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">Limite mensal:</span>
          <span className="font-medium text-right">{quota.limite} dias</span>
          
          <span className="text-muted-foreground">Previsto:</span>
          <span className="text-right">
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
              {quota.previsto} dias
            </Badge>
          </span>
          
          <span className="text-muted-foreground">Marcados:</span>
          <span className="text-right">
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              {quota.marcados} dias
            </Badge>
          </span>
          
          <span className="text-muted-foreground font-medium">Saldo disponível:</span>
          <span className="text-right">
            <Badge 
              variant="outline" 
              className={quota.saldo >= 0 
                ? 'bg-blue-100 text-blue-700 border-blue-300' 
                : 'bg-red-100 text-red-700 border-red-300'
              }
            >
              {quota.saldo} dias
            </Badge>
          </span>
        </div>
        
        <div className="pt-2 border-t">
          <Link to={`${minutaUrl}?mes=${mesNum}&ano=${ano}`}>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <FileText className="h-4 w-4" />
              {minutaLabel}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <CardTitle className="text-base">Cotas do Mês</CardTitle>
              </Button>
            </CollapsibleTrigger>
            <div className="flex gap-2">
              <Link to={`/secao-pessoas/ferias/minuta?mes=${mesNum}&ano=${ano}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Gerar Minuta</span> Férias
                </Button>
              </Link>
              <Link to={`/secao-pessoas/abono/minuta?mes=${mesNum}&ano=${ano}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Gerar Minuta</span> Abono
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <QuotaCard
                  title="Cota de Férias"
                  icon={<Umbrella className="h-4 w-4 text-blue-600" />}
                  quota={feriasQuota}
                  colorClass="blue"
                  minutaUrl="/secao-pessoas/ferias/minuta"
                  minutaLabel="Gerar Minuta Férias"
                />
                <QuotaCard
                  title="Cota de Abono"
                  icon={<Calendar className="h-4 w-4 text-green-600" />}
                  quota={abonoQuota}
                  colorClass="green"
                  minutaUrl="/secao-pessoas/abono/minuta"
                  minutaLabel="Gerar Minuta Abono"
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
