
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormErrorDisplayProps {
  formLevelError?: string | null;
  fetchError?: string | null;
}

/**
 * Component to display form-level errors
 */
const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({
  formLevelError,
  fetchError
}) => {
  if (!formLevelError && !fetchError) return null;
  
  return (
    <>
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      
      {formLevelError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de validação</AlertTitle>
          <AlertDescription>{formLevelError}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default FormErrorDisplay;
