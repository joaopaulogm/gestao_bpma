
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData, AnimalItem } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import ResgateFormWrapper from './ResgateFormWrapper';

interface ResgateFormProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleAnimalChange: (index: number, field: string, value: any) => void;
  handleAnimalAdd: () => void;
  handleAnimalRemove: (index: number) => void;
  handleAnimalQuantidadeChange: (index: number, tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  handleFormSubmit: (data: any) => Promise<void>;
  especiesSelecionadas: (Especie | null)[];
  carregandoEspecies: boolean[];
  onBuscarDetalhesEspecie: (index: number, especieId: string) => void; 
  isSubmitting: boolean;
  isEditing: boolean;
  fetchError?: string | null;
}

const ResgateForm: React.FC<ResgateFormProps> = (props) => {
  return <ResgateFormWrapper {...props} />;
};

export default ResgateForm;
