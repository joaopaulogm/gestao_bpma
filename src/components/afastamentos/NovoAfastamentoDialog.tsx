import React, { useState, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Palmtree, Activity, AlertTriangle, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { upsertRestricao, upsertLicenca, insertFerias } from '@/lib/adminPessoasApi';

interface Efetivo {
  id: string;
  matricula: string;
  posto_graduacao: string;
  nome_guerra: string;
  nome: string;
}

const MESES = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const TIPOS_FERIAS = [
  { value: 'INTEGRAL', label: 'Integral (30 dias)' },
  { value: 'PARCELA_1', label: 'Parcela 1' },
  { value: 'PARCELA_2', label: 'Parcela 2' },
  { value: 'PARCELA_3', label: 'Parcela 3' },
];

const TIPOS_LICENCA = [
  { value: 'LICENÇA MÉDICA', label: 'Licença Médica' },
  { value: 'LICENÇA MATERNIDADE', label: 'Licença Maternidade' },
  { value: 'LICENÇA PATERNIDADE', label: 'Licença Paternidade' },
  { value: 'LICENÇA LUTO', label: 'Licença Luto' },
  { value: 'LICENÇA CASAMENTO', label: 'Licença Casamento' },
];

const TIPOS_RESTRICAO = [
  { value: 'PO', label: 'Policiamento Ostensivo' },
  { value: 'PA', label: 'Porte de Arma' },
  { value: 'SN', label: 'Serviço Noturno' },
  { value: 'EF', label: 'Educação Física' },
];

// Schemas
const feriasSchema = z.object({
  efetivo_id: z.string().min(1, 'Selecione um policial'),
  ano: z.number().min(2020).max(2030),
  mes_inicio: z.string().min(1, 'Selecione o mês'),
  dias: z.number().min(5, 'Mínimo de 5 dias').max(30, 'Máximo de 30 dias'),
  tipo: z.string().min(1, 'Selecione o tipo'),
});

const licencaSchema = z.object({
  efetivo_id: z.string().min(1, 'Selecione um policial'),
  ano: z.number().min(2020).max(2030),
  data_inicio: z.date({ required_error: 'Selecione a data de início' }),
  data_fim: z.date().optional().nullable(),
  dias: z.number().min(1, 'Mínimo de 1 dia').optional().nullable(),
  tipo: z.string().min(1, 'Selecione o tipo'),
  cid: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
});

const restricaoSchema = z.object({
  efetivo_id: z.string().min(1, 'Selecione um policial'),
  ano: z.number().min(2020).max(2030),
  data_inicio: z.date({ required_error: 'Selecione a data de início' }),
  data_fim: z.date().optional().nullable(),
  tipo_restricao: z.string().min(1, 'Selecione o tipo'),
  observacao: z.string().optional().nullable(),
});

interface NovoAfastamentoDialogProps {
  ano: number;
  onSuccess?: () => void;
}

export const NovoAfastamentoDialog: React.FC<NovoAfastamentoDialogProps> = ({ ano, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ferias');
  const [efetivo, setEfetivo] = useState<Efetivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEfetivo, setSearchEfetivo] = useState('');

  // Forms
  const feriasForm = useForm<z.infer<typeof feriasSchema>>({
    resolver: zodResolver(feriasSchema),
    defaultValues: {
      efetivo_id: '',
      ano: ano,
      mes_inicio: '',
      dias: 30,
      tipo: 'INTEGRAL',
    },
  });

  const licencaForm = useForm<z.infer<typeof licencaSchema>>({
    resolver: zodResolver(licencaSchema),
    defaultValues: {
      efetivo_id: '',
      ano: ano,
      tipo: 'LICENÇA MÉDICA',
      cid: '',
      observacao: '',
    },
  });

  const restricaoForm = useForm<z.infer<typeof restricaoSchema>>({
    resolver: zodResolver(restricaoSchema),
    defaultValues: {
      efetivo_id: '',
      ano: ano,
      tipo_restricao: '',
      observacao: '',
    },
  });

  // Fetch efetivo
  useEffect(() => {
    const fetchEfetivo = async () => {
      const { data, error } = await supabase
        .from('dim_efetivo')
        .select('id, matricula, posto_graduacao, nome_guerra, nome')
        .order('posto_graduacao')
        .order('nome_guerra');
      
      if (error) {
        console.error('Erro ao carregar efetivo:', error);
        return;
      }
      setEfetivo(data || []);
    };
    
    if (open) {
      fetchEfetivo();
    }
  }, [open]);

  const filteredEfetivo = efetivo.filter(e => 
    e.nome_guerra?.toLowerCase().includes(searchEfetivo.toLowerCase()) ||
    e.matricula?.includes(searchEfetivo)
  );

  // Submit handlers
  const onSubmitFerias = async (data: z.infer<typeof feriasSchema>) => {
    setLoading(true);
    try {
      const result = await insertFerias({
        efetivo_id: data.efetivo_id,
        ano: data.ano,
        mes_inicio: parseInt(data.mes_inicio),
        dias: data.dias,
        tipo: data.tipo,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao cadastrar férias');
      }

      toast.success('Férias cadastradas com sucesso!');
      feriasForm.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Erro ao cadastrar férias:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar férias');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitLicenca = async (data: z.infer<typeof licencaSchema>) => {
    setLoading(true);
    try {
      const result = await upsertLicenca({
        efetivo_id: data.efetivo_id,
        data_inicio: format(data.data_inicio, 'yyyy-MM-dd'),
        data_fim: data.data_fim ? format(data.data_fim, 'yyyy-MM-dd') : null,
        dias: data.dias || null,
        tipo: data.tipo,
        cid: data.cid || null,
        observacao: data.observacao || null,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao cadastrar licença');
      }

      toast.success('Licença cadastrada com sucesso!');
      licencaForm.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Erro ao cadastrar licença:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar licença');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRestricao = async (data: z.infer<typeof restricaoSchema>) => {
    setLoading(true);
    try {
      const result = await upsertRestricao({
        efetivo_id: data.efetivo_id,
        tipo_restricao: data.tipo_restricao,
        data_inicio: format(data.data_inicio, 'yyyy-MM-dd'),
        data_fim: data.data_fim ? format(data.data_fim, 'yyyy-MM-dd') : null,
        observacao: data.observacao || null,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao cadastrar restrição');
      }

      toast.success('Restrição cadastrada com sucesso!');
      restricaoForm.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Erro ao cadastrar restrição:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar restrição');
    } finally {
      setLoading(false);
    }
  };

  const renderPolicialSelect = (form: UseFormReturn<{ efetivo_id?: string }>, name: 'efetivo_id') => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Policial</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o policial" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <div className="p-2">
                <Input
                  placeholder="Buscar..."
                  value={searchEfetivo}
                  onChange={(e) => setSearchEfetivo(e.target.value)}
                  className="mb-2"
                />
              </div>
              {filteredEfetivo.slice(0, 50).map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  <span className="font-mono text-xs">{e.posto_graduacao}</span> {e.nome_guerra}
                  <span className="text-muted-foreground ml-2 text-xs">({e.matricula})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Afastamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Afastamento</DialogTitle>
          <DialogDescription>
            Registre férias, licenças médicas ou restrições para o efetivo
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ferias" className="flex items-center gap-2">
              <Palmtree className="h-4 w-4" />
              Férias
            </TabsTrigger>
            <TabsTrigger value="licenca" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Licença
            </TabsTrigger>
            <TabsTrigger value="restricao" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Restrição
            </TabsTrigger>
          </TabsList>

          {/* FÉRIAS */}
          <TabsContent value="ferias" className="mt-6">
            <Form {...feriasForm}>
              <form onSubmit={feriasForm.handleSubmit(onSubmitFerias)} className="space-y-4">
                {renderPolicialSelect(feriasForm, 'efetivo_id')}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={feriasForm.control}
                    name="mes_inicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mês de Início</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MESES.map((mes) => (
                              <SelectItem key={mes.value} value={mes.value}>
                                {mes.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={feriasForm.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIPOS_FERIAS.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={feriasForm.control}
                  name="dias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={5} 
                          max={30} 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Mínimo 5 dias, máximo 30 dias. Para férias parceladas, cada parcela deve ter no mínimo 5 dias.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cadastrar Férias
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* LICENÇA */}
          <TabsContent value="licenca" className="mt-6">
            <Form {...licencaForm}>
              <form onSubmit={licencaForm.handleSubmit(onSubmitLicenca)} className="space-y-4">
                {renderPolicialSelect(licencaForm, 'efetivo_id')}

                <FormField
                  control={licencaForm.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Licença</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIPOS_LICENCA.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={licencaForm.control}
                    name="data_inicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Início</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                                ) : (
                                  <span>Selecione</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ptBR}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={licencaForm.control}
                    name="data_fim"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Fim (opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                                ) : (
                                  <span>Selecione</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              locale={ptBR}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={licencaForm.control}
                    name="dias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            placeholder="Quantidade"
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={licencaForm.control}
                    name="cid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CID (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: M54" 
                            {...field} 
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={licencaForm.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais..."
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cadastrar Licença
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* RESTRIÇÃO */}
          <TabsContent value="restricao" className="mt-6">
            <Form {...restricaoForm}>
              <form onSubmit={restricaoForm.handleSubmit(onSubmitRestricao)} className="space-y-4">
                {renderPolicialSelect(restricaoForm, 'efetivo_id')}

                <FormField
                  control={restricaoForm.control}
                  name="tipo_restricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Restrição</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIPOS_RESTRICAO.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={restricaoForm.control}
                    name="data_inicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Início</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                                ) : (
                                  <span>Selecione</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ptBR}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={restricaoForm.control}
                    name="data_fim"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Fim (opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                                ) : (
                                  <span>Selecione</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              locale={ptBR}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={restricaoForm.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais..."
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cadastrar Restrição
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
