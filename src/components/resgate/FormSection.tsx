
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
    <div className={cn("space-y-4 p-5 bg-card rounded-xl border border-border", className)}>
      {title && (
        <div className="pb-3 border-b border-border">
          <h3 className="text-md font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className={columns 
        ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" 
        : "space-y-4"
      }>
        {children}
      </div>
    </div>
  );
};

export default FormSection;
