import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumeroOSFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const NumeroOSField: React.FC<NumeroOSFieldProps> = ({
  value,
  onChange,
  error,
  required = false
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Extrair apenas os últimos 3 dígitos do valor completo
    if (value) {
      const match = value.match(/\.(\d{3})$/);
      if (match) {
        setInputValue(match[1]);
      } else {
        setInputValue(value.slice(-3));
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  const formatOS = (input: string): string => {
    // Remover tudo que não é número
    const numbersOnly = input.replace(/\D/g, '');
    
    // Limitar a 3 dígitos
    const limited = numbersOnly.slice(0, 3);
    
    // Preencher com zeros à esquerda se necessário
    const padded = limited.padStart(3, '0');
    
    // Formatar como 2026.00707.0000XXX
    const currentYear = new Date().getFullYear();
    return `${currentYear}.00707.0000${padded}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Remover tudo que não é número
    const numbersOnly = newValue.replace(/\D/g, '');
    
    // Limitar a 3 dígitos
    const limited = numbersOnly.slice(0, 3);
    
    setInputValue(limited);
    
    // Formatar e enviar valor completo
    if (limited.length > 0) {
      const formatted = formatOS(limited);
      onChange(formatted);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="numeroOS" className="text-sm">
        Número da OS {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-mono">
          {new Date().getFullYear()}.00707.0000
        </span>
        <Input
          id="numeroOS"
          name="numeroOS"
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="000"
          maxLength={3}
          className={`w-20 ${error ? "border-red-500" : ""}`}
          pattern="[0-9]{1,3}"
        />
      </div>
      {value && (
        <p className="text-xs text-muted-foreground font-mono">
          OS completa: {value}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default NumeroOSField;
