import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FormSection from './FormSection';

export interface MembroEquipe {
  id: string;
  efetivo_id: string;
  matricula: string;
  posto_graduacao: string;
  nome_guerra: string;
}

interface EquipeSectionProps {
  membros: MembroEquipe[];
  onMembrosChange: (membros: MembroEquipe[]) => void;
}

const EquipeSection: React.FC<EquipeSectionProps> = ({ membros, onMembrosChange }) => {
  const [matriculaInput, setMatriculaInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const buscarPolicial = useCallback(async () => {
    if (!matriculaInput.trim()) {
      toast.error('Digite uma matrícula');
      return;
    }

    // Remove leading zeros for search
    const matriculaSemZeros = matriculaInput.replace(/^0+/, '');

    // Check if already added
    if (membros.some(m => m.matricula === matriculaSemZeros || m.matricula === matriculaInput)) {
      toast.error('Este policial já foi adicionado');
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase
        .from('dim_efetivo')
        .select('id, matricula, posto_graduacao, nome_guerra')
        .or(`matricula.eq.${matriculaInput},matricula.eq.${matriculaSemZeros}`)
        .limit(1)
        .single();

      if (error || !data) {
        toast.error('Policial não encontrado');
        return;
      }

      const novoMembro: MembroEquipe = {
        id: crypto.randomUUID(),
        efetivo_id: data.id,
        matricula: data.matricula,
        posto_graduacao: data.posto_graduacao,
        nome_guerra: data.nome_guerra
      };

      onMembrosChange([...membros, novoMembro]);
      setMatriculaInput('');
      toast.success(`${data.posto_graduacao} ${data.nome_guerra} adicionado à equipe`);
    } catch (err) {
      console.error('Erro ao buscar policial:', err);
      toast.error('Erro ao buscar policial');
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
    <FormSection title="Identificação da Equipe">
      <div className="space-y-4">
        {/* Input para buscar policial */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="matricula" className="text-sm font-medium">
              Matrícula do Policial
            </Label>
            <Input
              id="matricula"
              type="text"
              value={matriculaInput}
              onChange={(e) => setMatriculaInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite a matrícula"
              className="input-glass"
            />
          </div>
          <Button
            type="button"
            onClick={buscarPolicial}
            disabled={isSearching || !matriculaInput.trim()}
            className="btn-primary"
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

        {/* Lista de membros adicionados */}
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
    </FormSection>
  );
};

export default EquipeSection;
