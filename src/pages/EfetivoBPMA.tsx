import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { useEfetivoTable, Efetivo } from '@/hooks/useEfetivoTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import * as XLSX from 'xlsx';

const POSTOS_OFICIAIS = [
  'CEL QOPM',
  'TC QOPM',
  'MAJ QOPM',
  'CAP QOPM',
  '1º TEN QOPM',
  '2º TEN QOPM',
  'ASP QOPM',
  'CAP QOPMA',
  '1º TEN QOPMA',
  '2º TEN QOPMA',
];

const POSTOS_PRACAS = [
  'ST QPPMC',
  '1º SGT QPPMC',
  '2º SGT QPPMC',
  '3º SGT QPPMC',
  'CB QPPMC',
  'SD QPPMC',
  'SD 2ª CL QPPMC',
];

const QUADROS = ['Oficiais', 'Praças'];

interface FormData {
  antiguidade: string;
  posto_graduacao: string;
  quadro: string;
  quadro_sigla: string;
  nome_guerra: string;
  nome: string;
  matricula: string;
  sexo: string;
  lotacao: string;
}

const initialFormData: FormData = {
  antiguidade: '',
  posto_graduacao: '',
  quadro: '',
  quadro_sigla: '',
  nome_guerra: '',
  nome: '',
  matricula: '',
  sexo: '',
  lotacao: 'BPMA',
};

const EfetivoBPMA = () => {
  const {
    efetivo,
    loading,
    searchTerm,
    setSearchTerm,
    quadroFilter,
    setQuadroFilter,
    postoFilter,
    setPostoFilter,
    postosDisponiveis,
    deleteEfetivo,
    refetch,
  } = useEfetivoTable();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const postosDisponivelParaQuadro = formData.quadro === 'Oficiais' ? POSTOS_OFICIAIS : POSTOS_PRACAS;

  const handleQuadroChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      quadro: value,
      posto_graduacao: '',
      quadro_sigla: '',
    }));
  };

  const handlePostoChange = (value: string) => {
    // Extract quadro_sigla from posto (e.g., "TC QOPM" -> "QOPM")
    const parts = value.split(' ');
    const sigla = parts[parts.length - 1];
    setFormData(prev => ({
      ...prev,
      posto_graduacao: value,
      quadro_sigla: sigla,
    }));
  };

  const removeLeadingZeros = (matricula: string): string => {
    return matricula.replace(/^0+/, '') || '0';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        antiguidade: formData.antiguidade ? parseInt(formData.antiguidade) : null,
        posto_graduacao: formData.posto_graduacao,
        quadro: formData.quadro,
        quadro_sigla: formData.quadro_sigla,
        nome_guerra: formData.nome_guerra.toUpperCase(),
        nome: formData.nome.toUpperCase(),
        matricula: removeLeadingZeros(formData.matricula),
        sexo: formData.sexo,
        lotacao: formData.lotacao,
      };

      if (editingId) {
        const { error } = await supabase
          .from('dim_efetivo')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Policial atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('dim_efetivo')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('Policial cadastrado com sucesso');
      }

      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
      refetch();
    } catch (error: any) {
      console.error('Error saving efetivo:', error);
      toast.error(error.message || 'Erro ao salvar policial');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Efetivo) => {
    setFormData({
      antiguidade: item.antiguidade?.toString() || '',
      posto_graduacao: item.posto_graduacao,
      quadro: item.quadro,
      quadro_sigla: item.quadro_sigla,
      nome_guerra: item.nome_guerra,
      nome: item.nome,
      matricula: item.matricula,
      sexo: item.sexo,
      lotacao: item.lotacao,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      await deleteEfetivo(selectedId);
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  const handleNewClick = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const records = jsonData.map((row: any) => {
        // Map column names - handle different possible column names
        const antiguidade = row['Antiguidade'] || row['antiguidade'];
        const postoGrad = row['PostGrad'] || row['Posto/Grad'] || row['posto_graduacao'] || '';
        const quadro = row['Quadro'] || row['quadro'] || '';
        const quadroSiglaValue = Object.values(row).find((val: any) => 
          typeof val === 'string' && ['QOPM', 'QOPMA', 'QPPMC'].includes(val)
        );
        const quadroSigla = typeof quadroSiglaValue === 'string' ? quadroSiglaValue : '';
        const nomeGuerra = row['Nome Guerra'] || row['nome_guerra'] || '';
        const nome = row['Nome'] || row['nome'] || '';
        const matricula = row['Matrícula'] || row['Matricula'] || row['matricula'] || '';
        const sexo = row['Sexo'] || row['sexo'] || 'Masculino';
        const lotacao = row['Lotação'] || row['Lotacao'] || row['lotacao'] || 'BPMA';

        // Combine posto with quadro_sigla
        const postoCompleto = `${postoGrad} ${quadroSigla}`.trim();
        
        // Determine quadro if not provided
        const finalQuadro = quadro || (POSTOS_OFICIAIS.some(p => postoCompleto.includes(p.split(' ')[0])) ? 'Oficiais' : 'Praças');

        return {
          antiguidade: antiguidade ? parseInt(String(antiguidade)) : null,
          posto_graduacao: postoCompleto,
          quadro: finalQuadro,
          quadro_sigla: quadroSigla,
          nome_guerra: (nomeGuerra || '').toUpperCase(),
          nome: (nome || '').toUpperCase(),
          matricula: removeLeadingZeros(String(matricula || '')),
          sexo: sexo || 'Masculino',
          lotacao: lotacao,
        };
      }).filter(r => r.nome && r.matricula);

      if (records.length === 0) {
        throw new Error('Nenhum registro válido encontrado na planilha');
      }

      // Insert in batches
      const batchSize = 50;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await supabase
          .from('dim_efetivo')
          .upsert(batch, { onConflict: 'matricula' });

        if (error) throw error;
      }

      toast.success(`${records.length} registros importados com sucesso`);
      refetch();
    } catch (error: any) {
      console.error('Error importing:', error);
      toast.error(error.message || 'Erro ao importar planilha');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <Layout title="Efetivo BPMA">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={quadroFilter} onValueChange={(val) => { setQuadroFilter(val); setPostoFilter('all'); }}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px]">
                <SelectValue placeholder="Filtrar por Quadro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Quadros</SelectItem>
                {QUADROS.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={postoFilter} onValueChange={setPostoFilter}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px]">
                <SelectValue placeholder="Filtrar por Posto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Postos</SelectItem>
                {postosDisponiveis.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <label htmlFor="import-excel">
              <Button variant="outline" asChild disabled={importing}>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? 'Importando...' : 'Importar Excel'}
                </span>
              </Button>
            </label>
            <input
              id="import-excel"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Policial
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Policial' : 'Novo Policial'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quadro">Quadro *</Label>
                      <Select value={formData.quadro} onValueChange={handleQuadroChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o quadro" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUADROS.map((q) => (
                            <SelectItem key={q} value={q}>{q}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="posto">Posto/Graduação *</Label>
                      <Select 
                        value={formData.posto_graduacao} 
                        onValueChange={handlePostoChange} 
                        disabled={!formData.quadro}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o posto" />
                        </SelectTrigger>
                        <SelectContent>
                          {postosDisponivelParaQuadro.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        required
                        className="uppercase"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nome_guerra">Nome de Guerra *</Label>
                      <Input
                        id="nome_guerra"
                        value={formData.nome_guerra}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome_guerra: e.target.value }))}
                        required
                        className="uppercase"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="matricula">Matrícula *</Label>
                      <Input
                        id="matricula"
                        value={formData.matricula}
                        onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="antiguidade">Antiguidade</Label>
                      <Input
                        id="antiguidade"
                        type="number"
                        value={formData.antiguidade}
                        onChange={(e) => setFormData(prev => ({ ...prev, antiguidade: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sexo">Sexo *</Label>
                      <Select value={formData.sexo} onValueChange={(val) => setFormData(prev => ({ ...prev, sexo: val }))} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lotacao">Lotação</Label>
                      <Input
                        id="lotacao"
                        value={formData.lotacao}
                        onChange={(e) => setFormData(prev => ({ ...prev, lotacao: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary */}
        <div className="text-sm text-muted-foreground">
          Mostrando {efetivo.length} policial(is)
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm overflow-hidden">
          <ScrollArea className="h-[calc(100vh-350px)] min-h-[400px]">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Antig.</TableHead>
                    <TableHead className="whitespace-nowrap">Posto/Grad</TableHead>
                    <TableHead className="whitespace-nowrap">Quadro</TableHead>
                    <TableHead className="whitespace-nowrap">Nome de Guerra</TableHead>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead className="whitespace-nowrap">Matrícula</TableHead>
                    <TableHead className="whitespace-nowrap">Sexo</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : efetivo.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum policial encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    efetivo.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.antiguidade || '-'}</TableCell>
                        <TableCell className="font-medium">{item.posto_graduacao}</TableCell>
                        <TableCell>{item.quadro}</TableCell>
                        <TableCell>{item.nome_guerra}</TableCell>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.matricula}</TableCell>
                        <TableCell>{item.sexo}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName="este policial"
      />
    </Layout>
  );
};

export default EfetivoBPMA;
