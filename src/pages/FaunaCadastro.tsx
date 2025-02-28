
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const FaunaCadastro = () => {
  const [formData, setFormData] = useState({
    nomeComum: '',
    nomeCientifico: '',
    grupo: '',
    status: '',
    sexo: '',
    idade: '',
    peso: '',
    altura: '',
    condicao: '',
    observacoes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    toast.success('Fauna cadastrada com sucesso!');
    setFormData({
      nomeComum: '',
      nomeCientifico: '',
      grupo: '',
      status: '',
      sexo: '',
      idade: '',
      peso: '',
      altura: '',
      condicao: '',
      observacoes: ''
    });
  };

  return (
    <Layout title="Cadastrar Fauna" showBackButton>
      <div className="bg-white rounded-lg border border-fauna-border p-6 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nomeComum">Nome Comum</Label>
              <Input
                id="nomeComum"
                name="nomeComum"
                value={formData.nomeComum}
                onChange={handleChange}
                required
                placeholder="Ex: Onça-pintada"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nomeCientifico">Nome Científico</Label>
              <Input
                id="nomeCientifico"
                name="nomeCientifico"
                value={formData.nomeCientifico}
                onChange={handleChange}
                required
                placeholder="Ex: Panthera onca"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grupo">Grupo Taxonômico</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('grupo', value)}
                value={formData.grupo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mamifero">Mamífero</SelectItem>
                  <SelectItem value="ave">Ave</SelectItem>
                  <SelectItem value="reptil">Réptil</SelectItem>
                  <SelectItem value="anfibio">Anfíbio</SelectItem>
                  <SelectItem value="peixe">Peixe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status de Conservação</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('status', value)}
                value={formData.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lc">Pouco Preocupante (LC)</SelectItem>
                  <SelectItem value="nt">Quase Ameaçada (NT)</SelectItem>
                  <SelectItem value="vu">Vulnerável (VU)</SelectItem>
                  <SelectItem value="en">Em Perigo (EN)</SelectItem>
                  <SelectItem value="cr">Criticamente em Perigo (CR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Sexo</Label>
              <RadioGroup 
                defaultValue={formData.sexo} 
                onValueChange={(value) => handleSelectChange('sexo', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="macho" id="macho" />
                  <Label htmlFor="macho">Macho</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="femea" id="femea" />
                  <Label htmlFor="femea">Fêmea</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="indeterminado" id="indeterminado" />
                  <Label htmlFor="indeterminado">Indeterminado</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="idade">Idade Estimada</Label>
              <Input
                id="idade"
                name="idade"
                value={formData.idade}
                onChange={handleChange}
                placeholder="Ex: 2 anos"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                name="peso"
                type="number"
                step="0.01"
                value={formData.peso}
                onChange={handleChange}
                placeholder="Ex: 10.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="altura">Altura/Comprimento (cm)</Label>
              <Input
                id="altura"
                name="altura"
                type="number"
                value={formData.altura}
                onChange={handleChange}
                placeholder="Ex: 120"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condicao">Condição de Saúde</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('condicao', value)}
                value={formData.condicao}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="otima">Ótima</SelectItem>
                  <SelectItem value="boa">Boa</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ruim">Ruim</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Informações adicionais importantes"
              rows={4}
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-fauna-blue hover:bg-opacity-90 text-white"
            >
              Cadastrar Fauna
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default FaunaCadastro;
