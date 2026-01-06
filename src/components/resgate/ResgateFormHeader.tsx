interface ResgateFormHeaderProps {
  isSubmitting?: boolean;
  isEditing?: boolean;
}

const ResgateFormHeader = ({ 
  isEditing = false, 
  isSubmitting = false 
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg text-foreground">
        {isEditing ? "Editar registro de atividade" : "Preencha os dados do registro de atividade"}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        Todos os campos marcados com * são obrigatórios.
      </p>
    </div>
  );
};

export default ResgateFormHeader;
