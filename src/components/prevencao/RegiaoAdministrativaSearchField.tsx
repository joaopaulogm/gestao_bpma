import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Regiao {
  id: string;
  nome: string;
}

interface RegiaoAdministrativaSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const RegiaoAdministrativaSearchField: React.FC<RegiaoAdministrativaSearchFieldProps> = ({
  value,
  onChange,
  error,
  required = false
}) => {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [filtro, setFiltro] = useState('');
  const [regioesFiltradas, setRegioesFiltradas] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRegiao, setSelectedRegiao] = useState<Regiao | null>(null);

  useEffect(() => {
    fetchRegioes();
  }, []);

  const fetchRegioes = async () => {
    try {
      const { data, error } = await supabase
        .from('dim_regiao_administrativa')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      if (data) {
        setRegioes(data);
        setRegioesFiltradas(data);
      }
    } catch (error) {
      console.error('Erro ao buscar regiões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filtro) {
      const filtradas = regioes.filter(regiao =>
        regiao.nome.toLowerCase().includes(filtro.toLowerCase())
      );
      setRegioesFiltradas(filtradas);
      setShowDropdown(true);
    } else {
      setRegioesFiltradas(regioes);
      setShowDropdown(false);
    }
  }, [filtro, regioes]);

  useEffect(() => {
    // Atualizar nome exibido quando value mudar
    if (value) {
      const regiao = regioes.find(r => r.id === value);
      setSelectedRegiao(regiao || null);
      if (regiao) {
        setFiltro(regiao.nome);
      }
    } else {
      setSelectedRegiao(null);
      setFiltro('');
    }
  }, [value, regioes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFiltro(newValue);
    if (!newValue) {
      onChange('');
      setSelectedRegiao(null);
    }
  };

  const handleRegiaoSelect = (regiao: Regiao) => {
    onChange(regiao.id);
    setSelectedRegiao(regiao);
    setFiltro(regiao.nome);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="regiaoAdministrativa" className="text-sm">
        Região Administrativa {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Input
          id="regiaoAdministrativa"
          name="regiaoAdministrativa"
          value={filtro}
          onChange={handleInputChange}
          onFocus={() => {
            if (filtro) {
              setShowDropdown(true);
            }
          }}
          placeholder="Digite para buscar ou selecione uma região"
          autoComplete="off"
          className={error ? "border-red-500" : ""}
          disabled={loading}
        />
        {showDropdown && regioesFiltradas.length > 0 && (
          <div className="absolute z-10 w-full bg-background border border-border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
            {regioesFiltradas.map((regiao) => (
              <div
                key={regiao.id}
                className="px-4 py-2 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleRegiaoSelect(regiao)}
              >
                {regiao.nome}
              </div>
            ))}
          </div>
        )}
        {showDropdown && regioesFiltradas.length === 0 && filtro && (
          <div className="absolute z-10 w-full bg-background border border-border rounded-md mt-1 p-4 text-sm text-muted-foreground">
            Nenhuma região encontrada
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default RegiaoAdministrativaSearchField;
