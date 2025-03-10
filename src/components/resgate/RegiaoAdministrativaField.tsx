
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import FormField from './FormField';

interface RegiaoAdministrativaFieldProps {
  regioes: string[];
  value: string;
  onChange: (value: string) => void;
}

const RegiaoAdministrativaField: React.FC<RegiaoAdministrativaFieldProps> = ({ 
  regioes, 
  value, 
  onChange 
}) => {
  const [filtro, setFiltro] = useState('');
  const [regioesFiltradas, setRegioesFiltradas] = useState(regioes);

  useEffect(() => {
    if (filtro) {
      const filtradas = regioes.filter(regiao => 
        regiao.toLowerCase().includes(filtro.toLowerCase())
      );
      setRegioesFiltradas(filtradas);
    } else {
      setRegioesFiltradas(regioes);
    }
  }, [filtro, regioes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFiltro(value);
    onChange(value);
  };

  const handleRegiaoSelect = (regiao: string) => {
    onChange(regiao);
    setFiltro('');
  };

  return (
    <FormField id="regiaoAdministrativa" label="Região Administrativa">
      <div className="relative">
        <Input
          id="regiaoAdministrativa"
          name="regiaoAdministrativa"
          value={value}
          onChange={handleInputChange}
          placeholder="Digite para buscar ou selecione uma região"
          autoComplete="off"
          required
        />
        {filtro && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto">
            {regioesFiltradas.map((regiao) => (
              <div 
                key={regiao} 
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleRegiaoSelect(regiao)}
              >
                {regiao}
              </div>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
};

export default RegiaoAdministrativaField;
