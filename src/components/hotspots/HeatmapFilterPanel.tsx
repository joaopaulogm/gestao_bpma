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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="resgates"
            checked={filters.resgates}
            onCheckedChange={(checked) => handleFilterChange('resgates', !!checked)}
            aria-label="Filtrar por Resgates"
          />
          <Label htmlFor="resgates" className="flex items-center gap-2">
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
          <Label htmlFor="apreensoes" className="flex items-center gap-2">
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
          <Label htmlFor="solturas" className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            Solturas
          </Label>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Período</Label>
        <div className="space-y-2">
          <div>
            <Label htmlFor="dataInicio" className="text-xs text-muted-foreground">De:</Label>
            <Input
              id="dataInicio"
              type="date"
              value={filters.dataInicio || ''}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dataFim" className="text-xs text-muted-foreground">Até:</Label>
            <Input
              id="dataFim"
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

      <div className="text-xs text-muted-foreground">
        {filteredData.length} ocorrências encontradas
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
            className="fixed top-4 left-4 z-10 bg-background/95 backdrop-blur-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="w-80 fixed left-4 top-4 z-10 bg-background/95 backdrop-blur-sm">
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