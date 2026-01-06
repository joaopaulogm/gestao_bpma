interface RegistrosSummaryProps {
  filteredCount: number;
  totalCount: number;
}

const RegistrosSummary = ({ 
  filteredCount, 
  totalCount 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredCount} de {totalCount} registros
      </div>
    </div>
  );
};

export default RegistrosSummary;
