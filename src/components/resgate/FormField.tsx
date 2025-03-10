
import React from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  loading?: boolean;
}

/**
 * A reusable component for form fields with label and optional error message
 */
const FormField: React.FC<FormFieldProps> = ({ 
  id, 
  label, 
  children, 
  error, 
  loading 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center">
        {label}
        {loading && <span className="ml-2 text-gray-500 text-sm">(Carregando...)</span>}
      </Label>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      {children}
    </div>
  );
};

export default FormField;
