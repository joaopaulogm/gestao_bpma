import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  loading?: boolean;
  required?: boolean;
  className?: string;
  hint?: string;
}

/**
 * A reusable component for form fields with label and optional error message
 */
const FormField: React.FC<FormFieldProps> = ({ 
  id, 
  label, 
  children, 
  error, 
  loading,
  required = false,
  className = "",
  hint
}) => {
  return (
    <div className={cn("space-y-2", error && "animate-shake", className)}>
      <Label 
        htmlFor={id} 
        className="flex items-center text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {loading && (
          <span className="ml-2 text-xs text-muted-foreground">(Carregando...)</span>
        )}
      </Label>
      
      <div className={cn(
        error && "ring-1 ring-destructive/50 rounded-lg"
      )}>
        {children}
      </div>
      
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive font-medium flex items-center gap-1.5">
          <svg 
            className="h-4 w-4 shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
