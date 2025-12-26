import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SpeciesImageSection from "@/components/species/SpeciesImageSection";
import {
  uploadFloraImage,
  deleteFloraImage,
  getFloraImageUrl,
  atualizarImagensFlora,
} from "@/services/especieService";

const CLASSES_FLORA = [
  "Magnoliopsida",
  "Liliopsida",
  "Polypodiopsida",
  "Pinopsida",
  "Cycadopsida",
  "Gnetopsida",
  "Bryopsida",
  "Marchantiopsida",
];

const ESTADOS_CONSERVACAO = [
  "Não Avaliada (NE)",
  "Pouco Preocupante (LC)",
  "Quase Ameaçada (NT)",
  "Vulnerável (VU)",
  "Em Perigo (EN)",
  "Criticamente em Perigo (CR)",
  "Extinta na Natureza (EW)",
  "Extinta (EX)",
  "Dados Insuficientes (DD)",
];

const TIPOS_PLANTA = [
  "Árvore",
  "Arbusto",
  "Herbácea",
  "Palmeira",
  "Samambaia",
  "Cipó/Liana",
  "Epífita",
  "Aquática",
  "Cacto/Suculenta",
];

const SIM_NAO = ["Sim", "Não"];

const floraSchema = z.object({
  nomePopular: z.string().min(1, "Nome popular é obrigatório"),
  nomeCientifico: z.string().min(1, "Nome científico é obrigatório"),
  classe: z.string().min(1, "Classe é obrigatória"),
  ordem: z.string().optional(),
  familia: z.string().optional(),
  estadoConservacao: z.string().min(1, "Estado de conservação é obrigatório"),
  tipoPlanta: z.string().min(1, "Tipo de planta é obrigatório"),
  madeiraLei: z.string().optional(),
  imuneCorte: z.string().optional(),
});

type FloraFormData = z.infer<typeof floraSchema>;

export default function FloraCadastro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
    reset,
  } = useForm<FloraFormData>({
    resolver: zodResolver(floraSchema),
    defaultValues: {
      nomePopular: "",
      nomeCientifico: "",
      classe: "",
      ordem: "",
      familia: "",
      estadoConservacao: "",
      tipoPlanta: "",
      madeiraLei: "",
      imuneCorte: "",
    },
  });

  useEffect(() => {
    if (id) {
      loadFlora(id);
    }
  }, [id]);

  const loadFlora = async (floraId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("dim_especies_flora")
        .select("*")
        .eq("id", floraId)
        .single();

      if (error) throw error;

      if (data) {
        reset({
          nomePopular: data.nome_popular || "",
          nomeCientifico: data.nome_cientifico || "",
          classe: data.classe_taxonomica || "",
          ordem: data.ordem_taxonomica || "",
          familia: data.familia_taxonomica || "",
          estadoConservacao: data.estado_de_conservacao || "",
          tipoPlanta: data.tipo_de_planta || "",
          madeiraLei: data.madeira_de_lei || "",
          imuneCorte: data.imune_ao_corte || "",
        });
        setImages(Array.isArray(data.imagens) ? data.imagens as string[] : []);
      }
    } catch (error) {
      console.error("Erro ao carregar espécie:", error);
      toast.error("Erro ao carregar espécie de flora");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImages = async (files: File[]) => {
    const availableSlots = 6 - images.length;
    if (availableSlots <= 0) {
      toast.error('Máximo de 6 fotos por espécie');
      return;
    }

    const nomePopular = getValues('nomePopular');
    if (!nomePopular) {
      toast.error('Preencha o nome popular antes de adicionar fotos');
      return;
    }

    setIsUploading(true);
    try {
      const targetId = id || 'new';
      const filesToUpload = files.slice(0, availableSlots);
      const uploadedFilenames: string[] = [];

      for (const file of filesToUpload) {
        const filename = await uploadFloraImage(targetId, nomePopular, file);
        if (filename) {
          uploadedFilenames.push(filename);
        }
      }

      if (uploadedFilenames.length > 0) {
        const newImages = [...images, ...uploadedFilenames];
        setImages(newImages);
        
        if (id) {
          await atualizarImagensFlora(id, newImages);
        }
        
        toast.success(`${uploadedFilenames.length} foto(s) adicionada(s) com sucesso`);
      } else {
        toast.error('Erro ao fazer upload das fotos');
      }
    } catch (error) {
      console.error('Erro ao adicionar fotos:', error);
      toast.error('Erro ao adicionar fotos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const filename = images[index];
    
    setIsUploading(true);
    try {
      const deleted = await deleteFloraImage(filename);
      
      if (deleted) {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        
        if (id) {
          await atualizarImagensFlora(id, newImages);
        }
        
        toast.success('Foto removida com sucesso');
      } else {
        toast.error('Erro ao remover foto');
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast.error('Erro ao remover foto');
    } finally {
      setIsUploading(false);
    }
  };

  const checkDuplicateScientificName = async (nomeCientifico: string, currentId?: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("dim_especies_flora")
      .select("id")
      .ilike("nome_cientifico", nomeCientifico.trim());

    if (error) {
      console.error("Erro ao verificar duplicidade:", error);
      return false;
    }

    // If editing, exclude current record from check
    if (currentId && data) {
      return data.some(item => item.id !== currentId);
    }

    return (data?.length || 0) > 0;
  };

  const onSubmit = async (data: FloraFormData) => {
    setIsSubmitting(true);
    try {
      // Check for duplicate scientific name
      if (data.nomeCientifico) {
        const isDuplicate = await checkDuplicateScientificName(data.nomeCientifico, id);
        if (isDuplicate) {
          toast.error(`Já existe uma espécie cadastrada com o nome científico "${data.nomeCientifico}"`);
          setIsSubmitting(false);
          return;
        }
      }

      const newId = crypto.randomUUID();
      
      const floraData = {
        id: isEditing && id ? id : newId,
        nome_popular: data.nomePopular.trim(),
        nome_cientifico: data.nomeCientifico.trim(),
        classe_taxonomica: data.classe,
        ordem_taxonomica: data.ordem?.trim() || null,
        familia_taxonomica: data.familia?.trim() || null,
        estado_de_conservacao: data.estadoConservacao,
        tipo_de_planta: data.tipoPlanta,
        madeira_de_lei: data.madeiraLei || null,
        imune_ao_corte: data.imuneCorte || null,
        imagens: images,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from("dim_especies_flora")
          .update(floraData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Espécie de flora atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("dim_especies_flora")
          .insert([floraData]);

        if (error) throw error;
        toast.success("Espécie de flora cadastrada com sucesso!");
      }

      navigate("/secao-operacional/flora-cadastrada");
      reset();
    } catch (error) {
      console.error("Erro ao salvar espécie:", error);
      toast.error("Erro ao salvar espécie de flora");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("dim_especies_flora")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Espécie de flora excluída com sucesso!");
      navigate("/secao-operacional/flora-cadastrada");
    } catch (error) {
      console.error("Erro ao excluir espécie:", error);
      toast.error("Erro ao excluir espécie de flora");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Carregando...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditing ? "Editar Espécie de Flora" : "Cadastrar Espécie de Flora"} showBackButton>
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/80 backdrop-blur-md border border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">
              {isEditing ? "Editar Espécie de Flora" : "Nova Espécie de Flora"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Identificação */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Identificação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomePopular" className="text-foreground font-medium">Nome Popular *</Label>
                    <Input
                      id="nomePopular"
                      {...register("nomePopular")}
                      className="bg-background border-input"
                    />
                    {errors.nomePopular && (
                      <p className="text-sm text-destructive">{errors.nomePopular.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomeCientifico" className="text-foreground font-medium">Nome Científico *</Label>
                    <Input
                      id="nomeCientifico"
                      {...register("nomeCientifico")}
                      className="bg-background border-input"
                    />
                    {errors.nomeCientifico && (
                      <p className="text-sm text-destructive">{errors.nomeCientifico.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Taxonomia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Taxonomia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Classe *</Label>
                    <Select
                      value={watch("classe")}
                      onValueChange={(value) => setValue("classe", value)}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Selecione a classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASSES_FLORA.map((classe) => (
                          <SelectItem key={classe} value={classe}>
                            {classe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.classe && (
                      <p className="text-sm text-destructive">{errors.classe.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ordem" className="text-foreground font-medium">Ordem</Label>
                    <Input
                      id="ordem"
                      {...register("ordem")}
                      className="bg-background border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="familia" className="text-foreground font-medium">Família</Label>
                    <Input
                      id="familia"
                      {...register("familia")}
                      className="bg-background border-input"
                    />
                  </div>
                </div>
              </div>

              {/* Classificação */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Classificação e Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Tipo de Planta *</Label>
                    <Select
                      value={watch("tipoPlanta")}
                      onValueChange={(value) => setValue("tipoPlanta", value)}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_PLANTA.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tipoPlanta && (
                      <p className="text-sm text-destructive">{errors.tipoPlanta.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Estado de Conservação *</Label>
                    <Select
                      value={watch("estadoConservacao")}
                      onValueChange={(value) => setValue("estadoConservacao", value)}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_CONSERVACAO.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.estadoConservacao && (
                      <p className="text-sm text-destructive">{errors.estadoConservacao.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Madeira de Lei</Label>
                    <Select
                      value={watch("madeiraLei")}
                      onValueChange={(value) => setValue("madeiraLei", value)}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIM_NAO.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Imune ao Corte</Label>
                    <Select
                      value={watch("imuneCorte")}
                      onValueChange={(value) => setValue("imuneCorte", value)}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIM_NAO.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Fotos da Espécie */}
              <SpeciesImageSection
                images={images}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                getImageUrl={getFloraImageUrl}
                isUploading={isUploading}
                maxImages={6}
                disabled={isSubmitting}
                title="Fotos da Espécie"
              />

              {/* Botões */}
              <div className="flex justify-between pt-4 border-t border-border">
                <div>
                  {isEditing && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta espécie de flora? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/secao-operacional/flora-cadastrada")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isEditing ? "Atualizar" : "Cadastrar"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
