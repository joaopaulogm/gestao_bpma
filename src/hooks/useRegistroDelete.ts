
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;

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
      // Try fat_registros_de_resgate first (2026+)
      let { error } = await supabaseAny
        .from('fat_registros_de_resgate')
        .delete()
        .eq('id', registroToDelete.id);
      
      // If not found, try fat_resgates_diarios_2025
      if (error?.code === 'PGRST116' || error?.message?.includes('not found')) {
        const result = await supabaseAny
          .from('fat_resgates_diarios_2025')
          .delete()
          .eq('id', registroToDelete.id);
        error = result.error;
      }
      
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
