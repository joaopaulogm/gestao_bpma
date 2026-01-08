import React from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  columns?: boolean;
}

/**
 * A reusable component for form sections with optional title
 */
const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description,
  children, 
  className = "",
  columns = false
}) => {
  return (
    <div className={cn(
      "space-y-4 sm:space-y-5 p-4 sm:p-6 rounded-lg",
      "bg-card border border-border",
      "shadow-sm shadow-black/5",
      "transition-all duration-200",
      "hover:shadow-md hover:shadow-black/5",
      className
    )}>
      {title && (
        <div className="pb-3 sm:pb-4 border-b border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full"></span>
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 pl-3">{description}</p>
          )}
        </div>
      )}
      <div className={columns 
        ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-5" 
        : "space-y-4 sm:space-y-5"
      }>
        {children}
      </div>
    </div>
  );
};

export default FormSection;
