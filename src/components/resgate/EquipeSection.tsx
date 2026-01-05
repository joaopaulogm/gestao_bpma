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
      toast.error('Digite uma matrícula ou nome do policial');
      return;
    }

    // Remove leading zeros for search
    const matriculaSemZeros = matriculaInput.replace(/^0+/, '');
    const searchTerm = matriculaInput.trim().toLowerCase();

    // Check if already added
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
      // Sanitizar inputs para prevenir problemas de segurança
      const sanitizedMatricula = matriculaInput.trim().replace(/[^0-9]/g, '');
      const sanitizedMatriculaSemZeros = matriculaSemZeros.replace(/[^0-9]/g, '');
      const sanitizedSearchTerm = searchTerm.replace(/[<>'"&]/g, '').substring(0, 100); // Limitar tamanho
      
      // Validar que temos algo para buscar
      if (!sanitizedMatricula && !sanitizedSearchTerm) {
        toast.error('Digite uma matrícula ou nome válido');
        return;
      }
      
      // Buscar por matrícula ou nome (nome_guerra ou nome completo)
      // Usar métodos seguros do Supabase que previnem SQL injection
      let query = supabase
        .from('dim_efetivo')
        .select('id, matricula, posto_graduacao, nome_guerra, nome')
        .limit(10);
      
      // Construir query de forma segura usando métodos do Supabase
      // O PostgREST sanitiza automaticamente os valores, mas ainda validamos
      if (sanitizedMatricula && sanitizedMatricula.length > 0) {
        // Buscar por matrícula exata (com e sem zeros)
        query = query.or(`matricula.eq.${sanitizedMatricula},matricula.eq.${sanitizedMatriculaSemZeros}`);
      } else if (sanitizedSearchTerm && sanitizedSearchTerm.length >= 2) {
        // Buscar por nome (nome_guerra ou nome completo)
        // Usar ilike para busca case-insensitive e parcial
        query = query.or(`nome_guerra.ilike.%${sanitizedSearchTerm}%,nome.ilike.%${sanitizedSearchTerm}%`);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Erro na busca:', error);
        toast.error('Erro ao buscar policial');
        return;
      }

      if (!data || data.length === 0) {
        toast.error('Policial não encontrado');
        return;
      }

      // Se houver múltiplos resultados, usar o primeiro que corresponder exatamente à matrícula
      // ou o primeiro resultado se for busca por nome
      let policialEncontrado = data[0];
      
      if (data.length > 1) {
        // Priorizar correspondência exata de matrícula
        const matchExato = data.find(p => 
          p.matricula === matriculaInput || 
          p.matricula === matriculaSemZeros ||
          p.matricula.replace(/^0+/, '') === matriculaSemZeros
        );
        if (matchExato) {
          policialEncontrado = matchExato;
        }
      }

      const novoMembro: MembroEquipe = {
        id: crypto.randomUUID(),
        efetivo_id: policialEncontrado.id,
        matricula: policialEncontrado.matricula,
        posto_graduacao: policialEncontrado.posto_graduacao,
        nome_guerra: policialEncontrado.nome_guerra
      };

      onMembrosChange([...membros, novoMembro]);
      setMatriculaInput('');
      toast.success(`${policialEncontrado.posto_graduacao} ${policialEncontrado.nome_guerra} adicionado à equipe`);
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
              Matrícula ou Nome do Policial
            </Label>
            <Input
              id="matricula"
              type="text"
              value={matriculaInput}
              onChange={(e) => setMatriculaInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite a matrícula ou nome do policial"
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
