import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DimOption {
  id: string;
  nome: string;
}

// Whitelists for filtering by tab
export const DESFECHO_RESGATE = [
  'RESGATADO', 'EXÓTICO', 'EVADIDO', 'VIDA LIVRE', 'ÓBITO',
  'SEM CONTATO', 'NINHO', 'INACESSÍVEL', 'OUTRO ÓRGÃO', 'NADA CONSTATADO',
];

export const DESFECHO_CRIME = [
  'TCO (PMDF)', 'TCO (PCDF)', 'PRISÃO FLAGRANTE (PCDF)',
  'RESOLVIDO NO LOCAL', 'NADA CONSTATADO', 'EM APURAÇÃO',
];

export const DESTINACAO_RESGATE = [
  'CETAS', 'HFAUS', 'HVET/UnB', 'CEAPA', 'SOLTURA', 'SEM DESTINAÇÃO',
];

export const DESTINACAO_CRIME = [
  'CETAS (APREENSÃO)', 'BPMA (APREENSÃO)', 'PCDF (APREENSÃO)', 'LIBERADO NO LOCAL',
];

export const GRUPAMENTO_RESGATE = ['RP AMBIENTAL', 'SVG', 'GOC', 'GTA', 'LACUSTRE', 'NÃO HOUVE'];
export const GRUPAMENTO_CRIME = ['RP AMBIENTAL', 'SVG', 'GOC', 'GTA', 'LACUSTRE'];

export function useRadioDimensions() {
  const [equipes, setEquipes] = useState<DimOption[]>([]);
  const [grupamentos, setGrupamentos] = useState<DimOption[]>([]);
  const [desfechos, setDesfechos] = useState<DimOption[]>([]);
  const [destinacoes, setDestinacoes] = useState<DimOption[]>([]);
  const [locais, setLocais] = useState<DimOption[]>([]);
  const [regioes, setRegioes] = useState<DimOption[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Sincronizar dim_regiao_administrativa -> dim_local antes de carregar
      await (supabase as any).rpc('sync_dim_local_from_ra').then(() => {}).catch(() => {});

      const [eqRes, grRes, dfRes, dsRes, lcRes, raRes] = await Promise.all([
        (supabase as any).from('dim_equipe').select('id, nome').order('nome'),
        (supabase as any).from('dim_grupamento').select('id, nome').order('nome'),
        (supabase as any).from('dim_desfecho').select('id, nome').order('nome'),
        (supabase as any).from('dim_destinacao').select('id, nome').order('nome'),
        (supabase as any).from('dim_local').select('id, nome').order('nome'),
        (supabase as any).from('dim_regiao_administrativa').select('id, nome').order('nome'),
      ]);
      setEquipes(eqRes.data ?? []);
      setGrupamentos(grRes.data ?? []);
      setDesfechos(dfRes.data ?? []);
      setDestinacoes(dsRes.data ?? []);
      setLocais(lcRes.data ?? []);
      setRegioes(raRes.data ?? []);
      setLoaded(true);
    };
    load();
  }, []);

  const getDesfechosForTab = (tab: 'resgate' | 'crime') => {
    const whitelist = tab === 'resgate' ? DESFECHO_RESGATE : DESFECHO_CRIME;
    return desfechos.filter(d => whitelist.includes(d.nome));
  };

  const getDestinacoesForTab = (tab: 'resgate' | 'crime') => {
    const whitelist = tab === 'resgate' ? DESTINACAO_RESGATE : DESTINACAO_CRIME;
    return destinacoes.filter(d => whitelist.includes(d.nome));
  };

  const getGrupamentosForTab = (tab: 'resgate' | 'crime') => {
    const whitelist = tab === 'resgate' ? GRUPAMENTO_RESGATE : GRUPAMENTO_CRIME;
    return grupamentos.filter(g => whitelist.includes(g.nome));
  };

  /** Locais mapeados a partir de regioes (RA) - para Select Local que usa dim_regiao_administrativa */
  const locaisFromRegioes = useMemo(() => {
    return regioes
      .map(r => {
        const loc = locais.find(l => l.nome === r.nome);
        return loc ? { id: loc.id, nome: r.nome } : null;
      })
      .filter((x): x is { id: string; nome: string } => x != null);
  }, [regioes, locais]);

  /** Ensure a dim_local row exists for a given RA name, return the local_id */
  const ensureLocalByName = async (nome: string): Promise<string | null> => {
    if (!nome.trim()) return null;
    // Check existing
    const existing = locais.find(l => l.nome === nome);
    if (existing) return existing.id;
    // Upsert
    const { data, error } = await (supabase as any)
      .from('dim_local')
      .upsert({ id: crypto.randomUUID(), nome: nome.trim() }, { onConflict: 'nome' })
      .select('id')
      .single();
    if (error || !data) return null;
    // Refresh locais cache
    setLocais(prev => [...prev, { id: data.id, nome: nome.trim() }]);
    return data.id;
  };

  return {
    equipes, grupamentos, desfechos, destinacoes, locais, regioes, loaded,
    getDesfechosForTab, getDestinacoesForTab, getGrupamentosForTab,
    locaisFromRegioes,
    ensureLocalByName,
  };
}

/** Convert interval string from DB (e.g. "01:30:00" or "1 hour 30 mins") to minutes */
export function intervalToMinutes(interval: string | null | undefined): number | null {
  if (!interval || String(interval).trim() === '') return null;
  const s = String(interval).trim();
  // Try HH:MM:SS or HH:MM
  const hms = s.match(/^(\d+):(\d+)(?::(\d+))?$/);
  if (hms) return parseInt(hms[1]!) * 60 + parseInt(hms[2]!);
  // Try "X hours Y mins" postgres format
  let total = 0;
  const hrs = s.match(/(\d+)\s*hour/i);
  const mins = s.match(/(\d+)\s*min/i);
  if (hrs) total += parseInt(hrs[1]!) * 60;
  if (mins) total += parseInt(mins[1]!);
  return total || null;
}

/** Format interval to HH:MM */
export function formatIntervalHHMM(interval: string | null | undefined): string {
  if (!interval || String(interval).trim() === '') return '-';
  const s = String(interval).trim();
  const hms = s.match(/^(\d+):(\d+)(?::(\d+))?$/);
  if (hms) return `${hms[1]!.padStart(2, '0')}:${hms[2]!.padStart(2, '0')}`;
  // postgres verbose
  let h = 0, m = 0;
  const hrs = s.match(/(\d+)\s*hour/i);
  const mins = s.match(/(\d+)\s*min/i);
  if (hrs) h = parseInt(hrs[1]!);
  if (mins) m = parseInt(mins[1]!);
  if (h || m) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return s;
}
