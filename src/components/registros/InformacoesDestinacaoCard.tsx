
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DetailsField from './DetailsField';

interface InformacoesDestinacaoCardProps {
  destinacao: string;
  numero_termo_entrega: string | null;
  hora_guarda_ceapa: string | null;
  motivo_entrega_ceapa: string | null;
  latitude_soltura: string | null;
  longitude_soltura: string | null;
  outro_destinacao: string | null;
}

const InformacoesDestinacaoCard = ({
  destinacao,
  numero_termo_entrega,
  hora_guarda_ceapa,
  motivo_entrega_ceapa,
  latitude_soltura,
  longitude_soltura,
  outro_destinacao,
}: InformacoesDestinacaoCardProps) => {
  return (
    <Card className="border border-fauna-border">
      <CardHeader>
        <CardTitle className="text-fauna-blue">Informações de Destinação</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DetailsField label="Destinação" value={destinacao} />
          <DetailsField label="Número do Termo de Entrega" value={numero_termo_entrega} />
          <DetailsField label="Hora da Guarda CEAPA" value={hora_guarda_ceapa} />
          <DetailsField label="Motivo da Entrega CEAPA" value={motivo_entrega_ceapa} />
        </div>
        <div>
          <DetailsField label="Latitude da Soltura" value={latitude_soltura} />
          <DetailsField label="Longitude da Soltura" value={longitude_soltura} />
          <DetailsField label="Outras Informações de Destinação" value={outro_destinacao} />
        </div>
      </CardContent>
    </Card>
  );
};

export default InformacoesDestinacaoCard;
