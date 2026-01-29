import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ANO_MIN = 2025;
const ANO_MAX = 2040;
const ANOS = Array.from({ length: ANO_MAX - ANO_MIN + 1 }, (_, i) => ANO_MIN + i);

interface NumeroOSFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

/**
 * Valor completo no banco: ANO.00707.0000XXX (XXX = até 3 dígitos preenchidos com zeros à esquerda em 7 posições)
 * Ex.: 1 → 2026.00707.0000001 | 13 → 2026.00707.0000013 | 118 → 2026.00707.0000118
 */
function parseNumeroOS(full: string): { ano: number; sufixo: number } | null {
  if (!full || typeof full !== 'string') return null;
  const match = full.match(/^(\d{4})\.00707\.(\d+)$/);
  if (!match) return null;
  const ano = parseInt(match[1], 10);
  const sufixo = parseInt(match[2], 10);
  if (Number.isNaN(ano) || Number.isNaN(sufixo)) return null;
  return { ano, sufixo };
}

function buildNumeroOS(ano: number, sufixoNum: number): string {
  const sufixoStr = String(sufixoNum).padStart(7, '0');
  return `${ano}.00707.${sufixoStr}`;
}

const NumeroOSField: React.FC<NumeroOSFieldProps> = ({
  value,
  onChange,
  error,
  required = false
}) => {
  const currentYear = new Date().getFullYear();
  const parsed = parseNumeroOS(value);

  const [ano, setAno] = useState<number>(parsed?.ano ?? currentYear);
  const [sufixoInput, setSufixoInput] = useState<string>(
    parsed !== null ? String(parsed.sufixo) : ''
  );

  useEffect(() => {
    const p = parseNumeroOS(value);
    if (p) {
      setAno(p.ano);
      setSufixoInput(String(p.sufixo));
    } else if (!value) {
      setAno(currentYear);
      setSufixoInput('');
    }
  }, [value, currentYear]);

  const handleAnoChange = (v: string) => {
    const num = parseInt(v, 10);
    if (!Number.isNaN(num)) {
      setAno(num);
      if (sufixoInput !== '') {
        const n = parseInt(sufixoInput, 10);
        if (!Number.isNaN(n)) onChange(buildNumeroOS(num, n));
      }
    }
  };

  const handleSufixoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, 3);
    setSufixoInput(limited);
    if (limited === '') {
      onChange('');
      return;
    }
    const n = parseInt(limited, 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 999) {
      onChange(buildNumeroOS(ano, n));
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm">
        Número da OS {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(ano)} onValueChange={handleAnoChange}>
          <SelectTrigger id="numeroOS-ano" className="w-[100px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {ANOS.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground font-mono">.00707.0000</span>
        <Input
          id="numeroOS"
          name="numeroOS"
          type="text"
          inputMode="numeric"
          value={sufixoInput}
          onChange={handleSufixoChange}
          placeholder="001"
          maxLength={3}
          className={`w-20 font-mono ${error ? 'border-red-500' : ''}`}
          pattern="[0-9]{1,3}"
          aria-label="Últimos 3 dígitos da OS"
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
