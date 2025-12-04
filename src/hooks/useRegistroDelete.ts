
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRegistroDelete = (onDeleteSuccess: (deletedId: string) => void) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState<{ id: string, nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string, nome: string) => {
    setRegistroToDelete({ id, nome });
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!registroToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('fat_registros_de_resgate')
        .delete()
        .eq('id', registroToDelete.id);
      
      if (error) throw error;
      
      onDeleteSuccess(registroToDelete.id);
      
      toast.success(`Registro de "${registroToDelete.nome}" excluído com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      toast.error('Erro ao excluir o registro');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setRegistroToDelete(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setRegistroToDelete(null);
  };

  return {
    isDeleteDialogOpen,
    registroToDelete,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel
  };
};
