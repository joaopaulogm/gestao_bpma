
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, RotateCcw, Filter } from 'lucide-react';
import { HeatmapFilters, OcorrenciaData } from '@/types/hotspots';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface HeatmapFilterPanelProps {
  filters: HeatmapFilters;
  onFiltersChange: (filters: HeatmapFilters) => void;
  onClearFilters: () => void;
  onExportData: () => void;
  filteredData: OcorrenciaData[];
  isMobile?: boolean;
}

const HeatmapFilterPanel = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onExportData,
  filteredData,
  isMobile = false
}: HeatmapFilterPanelProps) => {
  const handleFilterChange = (key: keyof HeatmapFilters, value: boolean | string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const FilterContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      {/* Filtros de tipo */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tipos de Ocorrência</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="resgates"
              checked={filters.resgates}
              onCheckedChange={(checked) => handleFilterChange('resgates', !!checked)}
              aria-label="Filtrar por Resgates"
            />
            <Label htmlFor="resgates" className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Resgates
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="apreensoes"
              checked={filters.apreensoes}
              onCheckedChange={(checked) => handleFilterChange('apreensoes', !!checked)}
              aria-label="Filtrar por Apreensões"
            />
            <Label htmlFor="apreensoes" className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              Apreensões
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="solturas"
              checked={filters.solturas}
              onCheckedChange={(checked) => handleFilterChange('solturas', !!checked)}
              aria-label="Filtrar por Solturas"
            />
            <Label htmlFor="solturas" className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              Solturas
            </Label>
          </div>
        </div>
      </div>

      {/* Filtro de data inicial */}
      <div className="space-y-2">
        <Label htmlFor="dataInicio" className="text-sm font-medium">De:</Label>
        <Input
          id="dataInicio"
          type="date"
          value={filters.dataInicio || ''}
          onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
        />
      </div>

      {/* Filtro de data final */}
      <div className="space-y-2">
        <Label htmlFor="dataFim" className="text-sm font-medium">Até:</Label>
        <Input
          id="dataFim"
          type="date"
          value={filters.dataFim || ''}
          onChange={(e) => handleFilterChange('dataFim', e.target.value)}
        />
      </div>

      {/* Ações */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          
          <Button
            onClick={onExportData}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          {filteredData.length} ocorrências
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros ({filteredData.length} ocorrências)
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <div className="mt-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resgates-mobile"
                    checked={filters.resgates}
                    onCheckedChange={(checked) => handleFilterChange('resgates', !!checked)}
                    aria-label="Filtrar por Resgates"
                  />
                  <Label htmlFor="resgates-mobile" className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Resgates
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="apreensoes-mobile"
                    checked={filters.apreensoes}
                    onCheckedChange={(checked) => handleFilterChange('apreensoes', !!checked)}
                    aria-label="Filtrar por Apreensões"
                  />
                  <Label htmlFor="apreensoes-mobile" className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Apreensões
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="solturas-mobile"
                    checked={filters.solturas}
                    onCheckedChange={(checked) => handleFilterChange('solturas', !!checked)}
                    aria-label="Filtrar por Solturas"
                  />
                  <Label htmlFor="solturas-mobile" className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Solturas
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Período</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dataInicio-mobile" className="text-xs text-muted-foreground">De:</Label>
                    <Input
                      id="dataInicio-mobile"
                      type="date"
                      value={filters.dataInicio || ''}
                      onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataFim-mobile" className="text-xs text-muted-foreground">Até:</Label>
                    <Input
                      id="dataFim-mobile"
                      type="date"
                      value={filters.dataFim || ''}
                      onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
                
                <Button
                  onClick={onExportData}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar dados (CSV)
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                {filteredData.length} ocorrências encontradas
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <FilterContent />
      </CardContent>
    </Card>
  );
};

export default HeatmapFilterPanel;
