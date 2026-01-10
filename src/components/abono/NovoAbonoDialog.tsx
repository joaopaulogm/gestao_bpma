import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Calendar, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { upsertAbono } from '@/lib/adminPessoasApi';

interface Militar {
  id: string;
  matricula: string;
  posto_graduacao: string;
  nome: string;
  nome_guerra: string;
}

interface AbonoExistente {
  efetivo_id: string;
  mes: number;
}

interface FeriasExistente {
  efetivo_id: string;
  mes_inicio: number;
  mes_fim: number | null;
}

const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface NovoAbonoDialogProps {
  selectedYear: number;
  onSuccess: () => void;
}

export const NovoAbonoDialog: React.FC<NovoAbonoDialogProps> = ({ selectedYear, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMilitar, setSelectedMilitar] = useState<Militar | null>(null);
  const [selectedMes, setSelectedMes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [abonosExistentes, setAbonosExistentes] = useState<AbonoExistente[]>([]);
  const [feriasExistentes, setFeriasExistentes] = useState<FeriasExistente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch militares
      const { data: militaresData } = await supabase
        .from('dim_efetivo')
        .select('id, matricula, posto_graduacao, nome, nome_guerra')
        .order('nome_guerra');
      
      // Fetch abonos existentes do ano
      const { data: abonosData } = await supabase
        .from('fat_abono')
        .select('efetivo_id, mes')
        .eq('ano', selectedYear);
      
      // Fetch férias existentes do ano
      const { data: feriasData } = await supabase
        .from('fat_ferias')
        .select('efetivo_id, mes_inicio, mes_fim')
        .eq('ano', selectedYear);

      setMilitares(militaresData || []);
      setAbonosExistentes(abonosData || []);
      setFeriasExistentes(feriasData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMilitares = useMemo(() => {
    if (!searchTerm) return militares.slice(0, 20);
    const term = searchTerm.toLowerCase();
    return militares.filter(m => 
      m.nome.toLowerCase().includes(term) ||
      m.nome_guerra.toLowerCase().includes(term) ||
      m.matricula.includes(searchTerm)
    ).slice(0, 20);
  }, [militares, searchTerm]);

  // Verificar validações para o militar selecionado
  const validacoes = useMemo(() => {
    if (!selectedMilitar || !selectedMes) return { valido: true, erros: [] };
    
    const mes = parseInt(selectedMes);
    const erros: string[] = [];
    
    // Verificar abonos do militar
    const abonosMilitar = abonosExistentes.filter(a => a.efetivo_id === selectedMilitar.id);
    
    // Verificar meses consecutivos
    const mesesAbono = abonosMilitar.map(a => a.mes);
    if (mesesAbono.includes(mes - 1)) {
      erros.push(`Já possui abono em ${mesesNome[mes - 2]} (mês anterior)`);
    }
    if (mesesAbono.includes(mes + 1)) {
      erros.push(`Já possui abono em ${mesesNome[mes]} (mês seguinte)`);
    }
    if (mesesAbono.includes(mes)) {
      erros.push(`Já possui abono em ${mesesNome[mes - 1]}`);
    }
    
    // Verificar férias no mesmo mês
    const feriasMilitar = feriasExistentes.filter(f => f.efetivo_id === selectedMilitar.id);
    for (const ferias of feriasMilitar) {
      const mesFim = ferias.mes_fim || ferias.mes_inicio;
      if (mes >= ferias.mes_inicio && mes <= mesFim) {
        erros.push(`Possui férias de ${mesesNome[ferias.mes_inicio - 1]} a ${mesesNome[mesFim - 1]}`);
      }
    }
    
    return { valido: erros.length === 0, erros };
  }, [selectedMilitar, selectedMes, abonosExistentes, feriasExistentes]);

  const handleSubmit = async () => {
    if (!selectedMilitar || !selectedMes) return;
    
    if (!validacoes.valido) {
      toast.error('Não é possível cadastrar devido às validações');
      return;
    }
    
    setSubmitting(true);
    try {
      const result = await upsertAbono({
        efetivo_id: selectedMilitar.id,
        mes: parseInt(selectedMes),
        ano: selectedYear,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao cadastrar abono');
      }
      
      toast.success(`Abono cadastrado para ${selectedMilitar.nome_guerra} em ${mesesNome[parseInt(selectedMes) - 1]}`);
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao cadastrar abono:', error);
      toast.error(error.message || 'Erro ao cadastrar abono');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedMilitar(null);
    setSelectedMes('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Abono
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Cadastrar Novo Abono
          </DialogTitle>
          <DialogDescription>
            Selecione o militar e o mês para cadastrar o abono.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Busca de militar */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Militar</label>
              {selectedMilitar ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{selectedMilitar.posto_graduacao}</Badge>
                    <div>
                      <p className="font-medium">{selectedMilitar.nome_guerra}</p>
                      <p className="text-xs text-muted-foreground">Mat: {selectedMilitar.matricula}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMilitar(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou matrícula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-[200px] border rounded-lg">
                    <div className="p-2 space-y-1">
                      {filteredMilitares.map((militar) => (
                        <button
                          key={militar.id}
                          onClick={() => setSelectedMilitar(militar)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Badge variant="outline" className="shrink-0">{militar.posto_graduacao}</Badge>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{militar.nome_guerra}</p>
                            <p className="text-xs text-muted-foreground">Mat: {militar.matricula}</p>
                          </div>
                        </button>
                      ))}
                      {filteredMilitares.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          Nenhum militar encontrado
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Seleção de mês */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês do Abono</label>
              <Select value={selectedMes} onValueChange={setSelectedMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {mesesNome.map((mes, idx) => (
                    <SelectItem key={idx} value={(idx + 1).toString()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Validações */}
            {selectedMilitar && selectedMes && (
              <div className={`p-3 rounded-lg border ${validacoes.valido ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                {validacoes.valido ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Sem conflitos - pode cadastrar</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Conflitos encontrados:</span>
                    </div>
                    <ul className="text-sm text-red-600 space-y-1 ml-6">
                      {validacoes.erros.map((erro, idx) => (
                        <li key={idx}>• {erro}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedMilitar || !selectedMes || submitting || !validacoes.valido}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Cadastrar Abono
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
