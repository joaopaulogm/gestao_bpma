
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegistrosFiltersProps {
  filterTipo: string;
  setFilterTipo: (value: string) => void;
  filterEstado: string;
  setFilterEstado: (value: string) => void;
  filterDestinacao: string;
  setFilterDestinacao: (value: string) => void;
  filterClasse: string;
  setFilterClasse: (value: string) => void;
}

const RegistrosFilters: React.FC<RegistrosFiltersProps> = ({
  filterTipo,
  setFilterTipo,
  filterEstado,
  setFilterEstado,
  filterDestinacao,
  setFilterDestinacao,
  filterClasse,
  setFilterClasse,
}) => {
  return (
    <Card className="border border-fauna-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-fauna-blue">Filtros avançados</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Select 
            onValueChange={setFilterTipo}
            value={filterTipo}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de ocorrência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="Resgate de Fauna">Resgate de Fauna</SelectItem>
              <SelectItem value="Apreensão">Apreensão</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            onValueChange={setFilterEstado}
            value={filterEstado}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado de saúde" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="Bom">Bom</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Ruim">Ruim</SelectItem>
              <SelectItem value="Óbito">Óbito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            onValueChange={setFilterClasse}
            value={filterClasse}
          >
            <SelectTrigger>
              <SelectValue placeholder="Classe taxonômica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as classes</SelectItem>
              <SelectItem value="Aves">Aves</SelectItem>
              <SelectItem value="Mamíferos">Mamíferos</SelectItem>
              <SelectItem value="Répteis">Répteis</SelectItem>
              <SelectItem value="Anfíbios">Anfíbios</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            onValueChange={setFilterDestinacao}
            value={filterDestinacao}
          >
            <SelectTrigger>
              <SelectValue placeholder="Destinação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as destinações</SelectItem>
              <SelectItem value="CETAS/IBAMA">CETAS/IBAMA</SelectItem>
              <SelectItem value="HFAUS/IBRAM">HFAUS/IBRAM</SelectItem>
              <SelectItem value="CEAPA/BPMA">CEAPA/BPMA</SelectItem>
              <SelectItem value="Soltura">Soltura</SelectItem>
              <SelectItem value="Óbito">Óbito</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegistrosFilters;

