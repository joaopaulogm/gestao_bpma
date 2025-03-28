
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
      <Label htmlFor={id} className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {loading && <span className="ml-2 text-gray-500 text-sm">(Carregando...)</span>}
      </Label>
      
      <div className={error ? "ring-1 ring-red-500 rounded-md" : ""}>
        {children}
      </div>
      
      {error && (
        <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-md border-l-2 border-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
