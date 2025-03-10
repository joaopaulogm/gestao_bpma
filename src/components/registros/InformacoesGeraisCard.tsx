
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DetailsField from './DetailsField';

interface InformacoesGeraisCardProps {
  data: string;
  regiao_administrativa: string;
  origem: string;
  latitude_origem: string;
  longitude_origem: string;
  desfecho_apreensao: string | null;
  numero_tco: string | null;
  outro_desfecho: string | null;
  formatDateTime: (dateString: string) => string;
}

const InformacoesGeraisCard = ({
  data,
  regiao_administrativa,
  origem,
  latitude_origem,
  longitude_origem,
  desfecho_apreensao,
  numero_tco,
  outro_desfecho,
  formatDateTime,
}: InformacoesGeraisCardProps) => {
  return (
    <Card className="border border-fauna-border">
      <CardHeader>
        <CardTitle className="text-fauna-blue">Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DetailsField label="Data" value={formatDateTime(data)} />
          <DetailsField label="Região Administrativa" value={regiao_administrativa} />
          <DetailsField label="Origem" value={origem} />
          <DetailsField label="Latitude da Origem" value={latitude_origem} />
          <DetailsField label="Longitude da Origem" value={longitude_origem} />
        </div>
        <div>
          {origem === 'Apreensão' && (
            <>
              <DetailsField label="Desfecho da Apreensão" value={desfecho_apreensao} />
              <DetailsField label="Número do TCO" value={numero_tco} />
              <DetailsField label="Outro Desfecho" value={outro_desfecho} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InformacoesGeraisCard;
