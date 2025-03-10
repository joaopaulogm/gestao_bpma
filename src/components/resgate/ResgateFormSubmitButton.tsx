
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ResgateFormSubmitButtonProps {
  isSubmitting: boolean;
}

const ResgateFormSubmitButton: React.FC<ResgateFormSubmitButtonProps> = ({ isSubmitting }) => {
  return (
    <div className="pt-4">
      <Button 
        type="submit" 
        className="w-full bg-fauna-blue hover:bg-opacity-90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Registro'
        )}
      </Button>
    </div>
  );
};

export default ResgateFormSubmitButton;
