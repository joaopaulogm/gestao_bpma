import { AuthorFormCard } from "@/components/ui/form-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export default function FormCardDemo() {
  const [isOpen, setIsOpen] = useState(false);

  const handleFormSubmit = (data: { name: string; title: string; imageUrl?: string }) => {
    console.log("Formulário enviado:", data);
    toast.success(`Autor "${data.name}" foi salvo com sucesso!`);
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log("Ação cancelada");
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar Novo Autor
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
          <AuthorFormCard
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
