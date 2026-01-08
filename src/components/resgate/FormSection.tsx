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
      "space-y-5 p-6 rounded-2xl mb-6",
      "bg-background/85 backdrop-blur-xl",
      "border border-primary/10",
      "shadow-[0_8px_32px_hsl(var(--primary)/0.06)]",
      "hover:shadow-[0_12px_40px_hsl(var(--primary)/0.08)]",
      "hover:border-primary/15",
      "transition-all duration-300",
      className
    )}>
      {title && (
        <div className="pb-4 border-b border-primary/10">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full"></span>
            {title}
          </h3>
          {description && <p className="text-sm text-muted-foreground mt-1.5 pl-3">{description}</p>}
        </div>
      )}
      <div className={columns 
        ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5" 
        : "space-y-5"
      }>
        {children}
      </div>
    </div>
  );
};

export default FormSection;
