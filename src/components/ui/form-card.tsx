import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Info, X, Upload, Image } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Required shadcn/ui components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Animation Variants for Framer Motion ---
const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 25, stiffness: 300 } },
};

// --- FormCard Container Component ---
interface FormCardProps {
  title: string;
  description?: string;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  description,
  onClose,
  children,
  className,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={FADE_IN_VARIANTS}
      className={cn(
        "w-full rounded-xl sm:rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50 bg-muted/30">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </motion.div>
  );
};

// --- FormCardSection Component ---
interface FormCardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const FormCardSection: React.FC<FormCardSectionProps> = ({ children, className }) => (
  <div className={cn("space-y-4", className)}>{children}</div>
);

// --- FormCardField Component ---
interface FormCardFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormCardField: React.FC<FormCardFieldProps> = ({
  label,
  htmlFor,
  required,
  tooltip,
  children,
  className,
}) => (
  <div className={cn("space-y-2", className)}>
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {tooltip && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-3.5 w-3.5" />
                <span className="sr-only">Mais informações</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    {children}
  </div>
);

// --- FormCardImageUpload Component ---
interface FormCardImageUploadProps {
  imageUrl?: string;
  onImageChange?: (url: string) => void;
  fallback?: string;
  className?: string;
}

export const FormCardImageUpload: React.FC<FormCardImageUploadProps> = ({
  imageUrl,
  onImageChange,
  fallback = "IMG",
  className,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      // In a real app, you would upload to a server/storage
      // Here we create a local URL for preview
      const url = URL.createObjectURL(file);
      onImageChange(url);
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-border/50 shadow-sm">
        <AvatarImage src={imageUrl} alt="Preview" className="object-cover" />
        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
          <Image className="h-6 w-6 opacity-50" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium text-foreground">Carregar Imagem</p>
          <p className="text-xs text-muted-foreground">Tamanho máximo: 1MB</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-1.5 text-xs h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

// --- FormCardActions Component ---
interface FormCardActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

export const FormCardActions: React.FC<FormCardActionsProps> = ({
  onCancel,
  onSubmit,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  className,
}) => (
  <div className={cn("flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border/50 mt-4", className)}>
    {onCancel && (
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="h-10 sm:h-9"
      >
        {cancelLabel}
      </Button>
    )}
    <Button
      type="submit"
      onClick={onSubmit}
      disabled={isSubmitting}
      className="h-10 sm:h-9 bg-primary hover:bg-primary/90"
    >
      {isSubmitting ? "Salvando..." : submitLabel}
    </Button>
  </div>
);

// --- Example: AuthorFormCard (Adapted to Design System) ---
interface AuthorFormCardProps {
  initialData?: {
    name: string;
    title: string;
    imageUrl?: string;
  };
  onSubmit: (data: { name: string; title: string; imageUrl?: string }) => void;
  onCancel: () => void;
  className?: string;
}

export const AuthorFormCard: React.FC<AuthorFormCardProps> = ({
  initialData,
  onSubmit,
  onCancel,
  className,
}) => {
  const [name, setName] = React.useState(initialData?.name || "");
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [imageUrl, setImageUrl] = React.useState(initialData?.imageUrl);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), title: title.trim(), imageUrl });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormCard
      title="Adicionar Autor"
      description="Preencha as informações do novo autor"
      onClose={onCancel}
      className={className}
    >
      <form onSubmit={handleSubmit}>
        <FormCardSection>
          {/* Image Upload */}
          <FormCardImageUpload
            imageUrl={imageUrl}
            onImageChange={setImageUrl}
          />

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormCardField label="Nome" htmlFor="author-name" required>
              <Input
                id="author-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do autor"
                required
                className="h-10 sm:h-9"
              />
            </FormCardField>

            <FormCardField 
              label="Cargo/Função" 
              htmlFor="author-title"
              tooltip="A função ou posição do autor na organização"
            >
              <Input
                id="author-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Desenvolvedor"
                className="h-10 sm:h-9"
              />
            </FormCardField>
          </div>

          {/* Actions */}
          <FormCardActions
            onCancel={onCancel}
            submitLabel="Salvar Autor"
            isSubmitting={isSubmitting}
          />
        </FormCardSection>
      </form>
    </FormCard>
  );
};

export default AuthorFormCard;
