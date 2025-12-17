
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '@/components/resgate/FormField';
import FormSection from '@/components/resgate/FormSection';
import FaunaImageSection from '@/components/fauna/FaunaImageSection';
import { Loader2 } from 'lucide-react';
import { faunaSchema, type FaunaFormData } from '@/schemas/faunaSchema';
import { 
  cadastrarEspecie, 
  atualizarEspecie, 
  buscarEspeciePorId,
  uploadFaunaImage,
  deleteFaunaImage,
  atualizarImagensEspecie
} from '@/services/especieService';

const CLASSES_TAXONOMICAS = ['AVE', 'MAMIFERO', 'REPTIL', 'PEIXE'];
const ESTADOS_CONSERVACAO = [
  'Pouco Preocupante',
  'Quase Ameaçada',
  'Vulnerável',
  'Em Perigo',
  'Criticamente Ameaçado',
  'Dados Insuficientes'
];
const TIPOS_FAUNA = ['Silvestre', 'Exótico'];

const FaunaCadastro = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [especieId, setEspecieId] = useState<string | null>(null);
  
  const isEditing = !!id;
  
  const form = useForm<FaunaFormData>({
    resolver: zodResolver(faunaSchema),
    defaultValues: {
      classe_taxonomica: '',
      nome_popular: '',
      nome_cientifico: '',
      ordem_taxonomica: '',
      estado_de_conservacao: '',
      tipo_de_fauna: '',
    }
  });

  const { handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    const fetchEspecie = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const especie = await buscarEspeciePorId(id);
        if (especie) {
          reset({
            classe_taxonomica: especie.classe_taxonomica,
            nome_popular: especie.nome_popular,
            nome_cientifico: especie.nome_cientifico,
            ordem_taxonomica: especie.ordem_taxonomica,
            estado_de_conservacao: especie.estado_de_conservacao,
            tipo_de_fauna: especie.tipo_de_fauna,
          });
          setImages(especie.imagens || []);
          setEspecieId(especie.id);
        } else {
          toast.error('Espécie não encontrada');
          navigate('/secao-operacional/fauna-cadastrada');
        }
      } catch (error) {
        console.error('Erro ao buscar espécie:', error);
        toast.error('Erro ao buscar dados da espécie');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEspecie();
  }, [id, reset, navigate]);

  const onSubmit = async (data: FaunaFormData) => {
    setIsSubmitting(true);
    try {
      const especieData = {
        classe_taxonomica: data.classe_taxonomica,
        nome_popular: data.nome_popular,
        nome_cientifico: data.nome_cientifico,
        ordem_taxonomica: data.ordem_taxonomica,
        estado_de_conservacao: data.estado_de_conservacao,
        tipo_de_fauna: data.tipo_de_fauna
      };
      
      let result;
      
      if (id) {
        result = await atualizarEspecie(id, especieData);
        if (result) {
          // Update images if they changed
          await atualizarImagensEspecie(id, images);
          toast.success('Espécie atualizada com sucesso!');
          queryClient.invalidateQueries({ queryKey: ['especies'] });
        } else {
          toast.error('Erro ao atualizar espécie');
        }
      } else {
        result = await cadastrarEspecie(especieData);
        if (result) {
          // Update images for new species
          if (images.length > 0) {
            await atualizarImagensEspecie(result.id, images);
          }
          toast.success('Espécie cadastrada com sucesso!');
          queryClient.invalidateQueries({ queryKey: ['especies'] });
        } else {
          toast.error('Erro ao cadastrar espécie');
        }
      }
      
      if (result) {
        navigate('/secao-operacional/fauna-cadastrada');
      }
    } catch (error) {
      console.error('Erro ao processar espécie:', error);
      toast.error(id ? 'Erro ao atualizar espécie' : 'Erro ao cadastrar espécie');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImages = async (files: File[]) => {
    const availableSlots = 6 - images.length;
    if (availableSlots <= 0) {
      toast.error('Máximo de 6 fotos por espécie');
      return;
    }

    const nomePopular = form.getValues('nome_popular');
    if (!nomePopular) {
      toast.error('Preencha o nome popular antes de adicionar fotos');
      return;
    }

    setIsUploading(true);
    try {
      const targetId = especieId || id || 'new';
      const filesToUpload = files.slice(0, availableSlots);
      const uploadedFilenames: string[] = [];

      for (const file of filesToUpload) {
        const filename = await uploadFaunaImage(targetId, nomePopular, file);
        if (filename) {
          uploadedFilenames.push(filename);
        }
      }

      if (uploadedFilenames.length > 0) {
        const newImages = [...images, ...uploadedFilenames];
        setImages(newImages);
        
        // If editing, update images in database immediately
        if (id) {
          await atualizarImagensEspecie(id, newImages);
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
      const deleted = await deleteFaunaImage(filename);
      
      if (deleted) {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        
        // If editing, update images in database immediately
        if (id) {
          await atualizarImagensEspecie(id, newImages);
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

  return (
    <Layout title={isEditing ? "Editar Espécie" : "Cadastrar Nova Espécie"} showBackButton>
      <div className="bg-white rounded-lg border border-fauna-border p-6 animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-fauna-blue" />
          </div>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormSection title="Informações Taxonômicas">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    id="classe_taxonomica"
                    label="Classe Taxonômica"
                    error={errors.classe_taxonomica?.message}
                    required
                  >
                    <Select
                      onValueChange={(value) => form.setValue('classe_taxonomica', value)}
                      value={form.watch('classe_taxonomica')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASSES_TAXONOMICAS.map((classe) => (
                          <SelectItem key={classe} value={classe}>
                            {classe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    id="ordem_taxonomica"
                    label="Ordem Taxonômica"
                    error={errors.ordem_taxonomica?.message}
                    required
                  >
                    <Input
                      {...form.register('ordem_taxonomica')}
                      placeholder="Ex: Carnivora"
                    />
                  </FormField>
                </div>

                <FormField
                  id="nome_popular"
                  label="Nome Popular"
                  error={errors.nome_popular?.message}
                  required
                >
                  <Input
                    {...form.register('nome_popular')}
                    placeholder="Ex: Onça-pintada"
                  />
                </FormField>

                <FormField
                  id="nome_cientifico"
                  label="Nome Científico"
                  error={errors.nome_cientifico?.message}
                  required
                >
                  <Input
                    {...form.register('nome_cientifico')}
                    placeholder="Ex: Panthera onca"
                  />
                </FormField>
              </FormSection>

              <FormSection title="Status e Classificação">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    id="estado_de_conservacao"
                    label="Estado de Conservação"
                    error={errors.estado_de_conservacao?.message}
                    required
                  >
                    <Select
                      onValueChange={(value) => form.setValue('estado_de_conservacao', value)}
                      value={form.watch('estado_de_conservacao')}
                    >
                      <SelectTrigger>
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
                  </FormField>

                  <FormField
                    id="tipo_de_fauna"
                    label="Tipo de Fauna"
                    error={errors.tipo_de_fauna?.message}
                    required
                  >
                    <Select
                      onValueChange={(value) => form.setValue('tipo_de_fauna', value)}
                      value={form.watch('tipo_de_fauna')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_FAUNA.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </FormSection>

              <FaunaImageSection
                images={images}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                isUploading={isUploading}
                maxImages={6}
                disabled={isSubmitting}
              />

              <div className="pt-4">
                <Button 
                  type="submit"
                  className="w-full bg-fauna-blue hover:bg-opacity-90 text-white"
                  disabled={isSubmitting || isLoading || isUploading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Atualizando...' : 'Cadastrando...'}
                    </>
                  ) : (
                    isEditing ? 'Atualizar Espécie' : 'Cadastrar Espécie'
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </Layout>
  );
};

export default FaunaCadastro;
