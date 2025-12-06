import React from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  loading?: boolean;
  required?: boolean;
  className?: string;
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
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${error ? 'animate-shake' : ''} ${className}`}>
      <Label 
        htmlFor={id} 
        className="flex items-center text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {loading && <span className="ml-2 text-muted-foreground text-sm">(Carregando...)</span>}
      </Label>
      
      <div className={error ? "ring-1 ring-destructive/50 rounded-xl" : ""}>
        {children}
      </div>
      
      {error && (
        <div className="text-destructive text-sm font-medium bg-destructive/5 backdrop-blur-sm p-2.5 rounded-lg border-l-2 border-destructive">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
