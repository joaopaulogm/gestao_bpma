import { cn } from '@/lib/utils';

interface DashboardYearTabsProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

const DashboardYearTabs = ({
  selectedYear,
  onYearChange
}) => {
  return (
    <div className="w-full border-b border-border/40 bg-background/50 backdrop-blur-sm -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
      <div className="flex items-end gap-0.5 sm:gap-1 pt-2 overflow-x-auto scrollbar-hide">
        {AVAILABLE_YEARS.map((year) => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={cn(
              "relative px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200",
              "border border-b-0 min-w-[60px] sm:min-w-[80px]",
              "hover:bg-muted/50",
              selectedYear === year
                ? "bg-background text-primary border-border shadow-sm z-10 -mb-px"
                : "bg-muted/30 text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <span className="relative z-10">{year}</span>
            {selectedYear === year && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardYearTabs;
