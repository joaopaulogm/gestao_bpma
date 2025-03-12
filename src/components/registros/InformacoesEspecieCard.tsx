
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DetailsField from './DetailsField';

interface InformacoesEspecieCardProps {
  classe_taxonomica: string;
  nome_cientifico: string;
  nome_popular: string;
  estado_saude: string;
  atropelamento: string;
  estagio_vida: string;
  quantidade: number;
  quantidade_adulto?: number;
  quantidade_filhote?: number;
}

const InformacoesEspecieCard = ({
  classe_taxonomica,
  nome_cientifico,
  nome_popular,
  estado_saude,
  atropelamento,
  estagio_vida,
  quantidade,
  quantidade_adulto = 0,
  quantidade_filhote = 0,
}: InformacoesEspecieCardProps) => {
  const showDetailedQuantities = quantidade_adulto > 0 || quantidade_filhote > 0;

  return (
    <Card className="border border-fauna-border">
      <CardHeader>
        <CardTitle className="text-fauna-blue">Informações da Espécie</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DetailsField label="Classe Taxonômica" value={classe_taxonomica} />
          <DetailsField label="Nome Científico" value={nome_cientifico} />
          <DetailsField label="Nome Popular" value={nome_popular} />
        </div>
        <div>
          <DetailsField label="Estado de Saúde" value={estado_saude} />
          <DetailsField label="Atropelamento" value={atropelamento} />
          <DetailsField label="Estágio de Vida" value={estagio_vida} />
          
          {showDetailedQuantities ? (
            <>
              <DetailsField label="Quantidade Total" value={quantidade} />
              {quantidade_adulto > 0 && (
                <DetailsField label="Quantidade (Adultos)" value={quantidade_adulto} />
              )}
              {quantidade_filhote > 0 && (
                <DetailsField label="Quantidade (Filhotes)" value={quantidade_filhote} />
              )}
            </>
          ) : (
            <DetailsField label="Quantidade" value={quantidade} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InformacoesEspecieCard;
