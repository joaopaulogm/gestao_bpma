import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export interface MembroEquipePrevencao {
  id: string;
  efetivo_id: string;
  matricula: string;
  posto_graduacao: string;
  nome_guerra: string;
}

interface EquipeSectionPrevencaoProps {
  membros: MembroEquipePrevencao[];
  onMembrosChange: (membros: MembroEquipePrevencao[]) => void;
}

const EquipeSectionPrevencao: React.FC<EquipeSectionPrevencaoProps> = ({ membros, onMembrosChange }) => {
  const [matriculaInput, setMatriculaInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const buscarPolicial = useCallback(async () => {
    if (!matriculaInput.trim()) {
      toast.error('Digite uma matrícula ou nome do policial');
      return;
    }

    const matriculaSemZeros = matriculaInput.replace(/^0+/, '');
    const searchTerm = matriculaInput.trim().toLowerCase();

    if (membros.some(m => {
      const matriculaMembro = m.matricula.replace(/^0+/, '');
      return matriculaMembro === matriculaSemZeros ||
        m.matricula === matriculaInput ||
        m.nome_guerra.toLowerCase() === searchTerm;
    })) {
      toast.error('Este policial já foi adicionado');
      return;
    }

    setIsSearching(true);

    try {
      const sanitizedMatricula = matriculaInput.trim().replace(/[^0-9]/g, '');
      const sanitizedMatriculaSemZeros = sanitizedMatricula.replace(/^0+/, '');
      const sanitizedSearchTerm = matriculaInput.trim().replace(/[<>'"&]/g, '').substring(0, 100);

      if (!sanitizedMatricula && sanitizedSearchTerm.length < 2) {
        toast.error('Digite uma matrícula ou nome válido (mínimo 2 caracteres)');
        setIsSearching(false);
        return;
      }

      let query = supabase
        .from('dim_efetivo')
        .select('id, matricula, posto_graduacao, nome_guerra, nome')
        .eq('ativo', true)
        .limit(20);

      const conditions: string[] = [];

      if (sanitizedMatricula && sanitizedMatricula.length > 0) {
        conditions.push(`matricula.eq.${sanitizedMatricula}`);
        if (sanitizedMatriculaSemZeros && sanitizedMatriculaSemZeros !== sanitizedMatricula) {
          conditions.push(`matricula.eq.${sanitizedMatriculaSemZeros}`);
        }
        conditions.push(`matricula.ilike.%${sanitizedMatricula}%`);
      }

      if (sanitizedSearchTerm && sanitizedSearchTerm.length >= 2) {
        conditions.push(`nome_guerra.ilike.%${sanitizedSearchTerm}%`);
        conditions.push(`nome.ilike.%${sanitizedSearchTerm}%`);
      }

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      } else {
        toast.error('Digite uma matrícula ou nome válido');
        setIsSearching(false);
        return;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro na busca:', error);
        toast.error(`Erro ao buscar policial: ${error.message}`);
        setIsSearching(false);
        return;
      }

      if (!data || data.length === 0) {
        toast.error('Policial não encontrado. Verifique a matrícula ou nome digitado.');
        setIsSearching(false);
        return;
      }

      let policialEncontrado = data[0];

      if (data.length > 1) {
        const matchExato = data.find(p =>
          p.matricula === matriculaInput ||
          p.matricula === sanitizedMatricula ||
          p.matricula === sanitizedMatriculaSemZeros ||
          p.matricula.replace(/^0+/, '') === sanitizedMatriculaSemZeros
        );
        if (matchExato) {
          policialEncontrado = matchExato;
        }
      }

      const novoMembro: MembroEquipePrevencao = {
        id: crypto.randomUUID(),
        efetivo_id: policialEncontrado.id,
        matricula: policialEncontrado.matricula,
        posto_graduacao: policialEncontrado.posto_graduacao || '',
        nome_guerra: policialEncontrado.nome_guerra || ''
      };

      onMembrosChange([...membros, novoMembro]);
      setMatriculaInput('');
      toast.success(`${policialEncontrado.posto_graduacao || ''} ${policialEncontrado.nome_guerra || ''} adicionado à equipe`);
    } catch (err: any) {
      console.error('Erro ao buscar policial:', err);
      toast.error(`Erro ao buscar policial: ${err?.message || 'Erro desconhecido'}`);
    } finally {
      setIsSearching(false);
    }
  }, [matriculaInput, membros, onMembrosChange]);

  const removerMembro = (id: string) => {
    onMembrosChange(membros.filter(m => m.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarPolicial();
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span>Identificação da Equipe</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="matricula" className="text-sm font-medium">
                Matrícula ou Nome do Policial
              </Label>
              <Input
                id="matricula"
                type="text"
                value={matriculaInput}
                onChange={(e) => setMatriculaInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite a matrícula ou nome do policial"
                className="h-10 sm:h-11"
              />
            </div>
            <Button
              type="button"
              onClick={buscarPolicial}
              disabled={isSearching || !matriculaInput.trim()}
              className="h-10 sm:h-11"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {membros.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Policiais na Equipe ({membros.length})
              </Label>
              <div className="space-y-2">
                {membros.map((membro) => (
                  <div
                    key={membro.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium text-foreground">{membro.matricula}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {membro.posto_graduacao}
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {membro.nome_guerra}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerMembro(membro.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {membros.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Nenhum policial adicionado à equipe
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipeSectionPrevencao;
