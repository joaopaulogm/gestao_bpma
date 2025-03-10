
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '@/components/resgate/FormField';
import FormSection from '@/components/resgate/FormSection';
import { useFormFaunaData } from '@/hooks/useFormFaunaData';
import { FormProvider } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

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
  const { form, errors, isSubmitting, isLoading, isEditing, handleSubmit } = useFormFaunaData();

  return (
    <Layout title={isEditing ? "Editar Espécie" : "Cadastrar Nova Espécie"} showBackButton>
      <div className="bg-white rounded-lg border border-fauna-border p-6 animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-fauna-blue" />
          </div>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="pt-4">
                <Button 
                  type="submit"
                  className="w-full bg-fauna-blue hover:bg-opacity-90 text-white"
                  disabled={isSubmitting || isLoading}
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
