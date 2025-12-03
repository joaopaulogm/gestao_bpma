
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
      "space-y-4 p-6 rounded-2xl",
      "bg-background/85 backdrop-blur-xl",
      "border border-primary/10",
      "shadow-[0_4px_24px_hsl(var(--primary)/0.04)]",
      className
    )}>
      {title && (
        <div className="pb-4 border-b border-primary/10">
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
