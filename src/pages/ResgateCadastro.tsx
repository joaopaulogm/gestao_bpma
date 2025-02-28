
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ResgateCadastro = () => {
  const [formData, setFormData] = useState({
    data: '',
    local: '',
    coordenadas: '',
    tipoOcorrencia: '',
    responsavel: '',
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
    toast.success('Registro de resgate/apreensão cadastrado com sucesso!');
    setFormData({
      data: '',
      local: '',
      coordenadas: '',
      tipoOcorrencia: '',
      responsavel: '',
      observacoes: ''
    });
  };

  return (
    <Layout title="Cadastrar Resgate/Apreensão" showBackButton>
      <div className="bg-white rounded-lg border border-fauna-border p-6 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="data">Data da Ocorrência</Label>
              <Input
                id="data"
                name="data"
                type="date"
                value={formData.data}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipoOcorrencia">Tipo de Ocorrência</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('tipoOcorrencia', value)}
                value={formData.tipoOcorrencia}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resgate">Resgate</SelectItem>
                  <SelectItem value="apreensao">Apreensão</SelectItem>
                  <SelectItem value="entrega">Entrega Voluntária</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                name="local"
                value={formData.local}
                onChange={handleChange}
                required
                placeholder="Ex: Nome da rua, bairro, cidade"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coordenadas">Coordenadas (opcional)</Label>
              <Input
                id="coordenadas"
                name="coordenadas"
                value={formData.coordenadas}
                onChange={handleChange}
                placeholder="Ex: -23.5505, -46.6333"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                name="responsavel"
                value={formData.responsavel}
                onChange={handleChange}
                required
                placeholder="Nome do responsável"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Detalhes adicionais sobre a ocorrência"
              rows={4}
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-fauna-blue hover:bg-opacity-90 text-white"
            >
              Cadastrar Resgate/Apreensão
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ResgateCadastro;
