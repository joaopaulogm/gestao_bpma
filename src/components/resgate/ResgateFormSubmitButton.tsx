
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Plus } from 'lucide-react';

interface ResgateFormSubmitButtonProps {
  isSubmitting: boolean;
  isEditing?: boolean;
}

const ResgateFormSubmitButton = ({ isSubmitting, isEditing = false }: ResgateFormSubmitButtonProps) => {
  return (
    <div className="flex justify-end">
      <Button 
        type="submit" 
        disabled={isSubmitting}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? 'Salvando...' : 'Cadastrando...'}
          </>
        ) : (
          <>
            {isEditing ? (
              <>
                <Save className="mr-2 h-5 w-5" />
                Salvar alterações
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                Cadastrar resgate
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
};

export default ResgateFormSubmitButton;
