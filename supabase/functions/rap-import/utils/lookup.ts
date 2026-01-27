// Resolução de lookups (FKs) - Busca IDs nas tabelas de dimensão

import { NormalizedRAP } from "./normalizer.ts";

export interface ResolvedRAP extends NormalizedRAP {
  especie_id?: string;
  regiao_administrativa_id?: string;
  origem_id?: string;
  destinacao_id?: string;
  estado_saude_id?: string;
  estagio_vida_id?: string;
  desfecho_id?: string;
  tipo_area_id?: string;
  warnings?: string[];
}

export async function resolveLookups(
  supabase: any,
  data: NormalizedRAP
): Promise<ResolvedRAP> {
  const resolved: ResolvedRAP = { ...data };
  resolved.warnings = [];

  // Resolver especie_id
  if (data.nome_popular) {
    const especieId = await lookupEspecie(supabase, data.nome_popular, data.nome_cientifico);
    if (especieId) {
      resolved.especie_id = especieId;
    } else {
      resolved.warnings.push("especie_id_nao_resolvida");
    }
  }

  // Resolver destinacao_id
  if (data.destinacao) {
    const destinacaoId = await lookupDestinacao(supabase, data.destinacao);
    if (destinacaoId) {
      resolved.destinacao_id = destinacaoId;
    } else {
      resolved.warnings.push("destinacao_id_nao_resolvida");
    }
  }

  // Resolver origem_id (tentar inferir do relato ou usar padrão)
  // Por enquanto, vamos usar um valor padrão ou deixar NULL
  // Se houver indicação clara no relato, podemos buscar
  const origemId = await lookupOrigem(supabase, data.relato || "");
  if (origemId) {
    resolved.origem_id = origemId;
  }

  // Resolver estado_saude_id
  if (data.condicoes_fisicas) {
    const estadoSaudeId = await lookupEstadoSaude(supabase, data.condicoes_fisicas);
    if (estadoSaudeId) {
      resolved.estado_saude_id = estadoSaudeId;
    }
  }

  // Resolver estagio_vida_id
  if (data.estagio_vida) {
    const estagioVidaId = await lookupEstagioVida(supabase, data.estagio_vida);
    if (estagioVidaId) {
      resolved.estagio_vida_id = estagioVidaId;
    }
  }

  // Resolver desfecho_id (tentar inferir do tipo ou relato)
  const desfechoId = await lookupDesfecho(supabase, data.tipo || "resgate");
  if (desfechoId) {
    resolved.desfecho_id = desfechoId;
  }

  // regiao_administrativa_id e tipo_area_id podem ser inferidos das coordenadas
  // mas isso requer geocoding reverso, deixamos NULL por enquanto

  return resolved;
}

async function lookupEspecie(
  supabase: any,
  nomePopular: string,
  nomeCientifico?: string
): Promise<string | null> {
  // Buscar por nome popular primeiro
  let query = supabase
    .from("dim_especies_fauna")
    .select("id")
    .ilike("nome_popular", `%${nomePopular}%`)
    .limit(1);

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar espécie:", error);
    return null;
  }

  if (data && data.length > 0) {
    return data[0].id;
  }

  // Se não encontrou e tem nome científico, tentar por nome científico
  if (nomeCientifico) {
    const { data: dataCientifico, error: errorCientifico } = await supabase
      .from("dim_especies_fauna")
      .select("id")
      .ilike("nome_cientifico", `%${nomeCientifico}%`)
      .limit(1);

    if (!errorCientifico && dataCientifico && dataCientifico.length > 0) {
      return dataCientifico[0].id;
    }
  }

  return null;
}

async function lookupDestinacao(supabase: any, nome: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("dim_destinacao")
    .select("id")
    .ilike("nome", `%${nome}%`)
    .limit(1);

  if (error) {
    console.error("Erro ao buscar destinação:", error);
    return null;
  }

  return data && data.length > 0 ? data[0].id : null;
}

async function lookupOrigem(supabase: any, relato: string): Promise<string | null> {
  // Tentar inferir origem do relato
  const lowerRelato = relato.toLowerCase();

  const origens = [
    { nome: "COPOM", keywords: ["copom", "central"] },
    { nome: "Ação Policial", keywords: ["ação policial", "acao policial", "patrulha"] },
    { nome: "Comunidade", keywords: ["comunidade", "cidadão", "cidadao", "população"] },
    { nome: "Outras instituições", keywords: ["ibama", "icmbio", "instituto"] },
    { nome: "PMDF", keywords: ["pmdf", "polícia militar"] },
  ];

  for (const origem of origens) {
    if (origem.keywords.some((kw) => lowerRelato.includes(kw))) {
      const { data, error } = await supabase
        .from("dim_origem")
        .select("id")
        .ilike("nome", `%${origem.nome}%`)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0].id;
      }
    }
  }

  return null;
}

async function lookupEstadoSaude(supabase: any, condicoes: string): Promise<string | null> {
  const lowerCondicoes = condicoes.toLowerCase();

  // Mapear condições para nomes na tabela
  const mapeamento: Record<string, string> = {
    debilitado: "Debilitado",
    ferido: "Ferido",
    saudável: "Saudável",
    saudavel: "Saudável",
    óbito: "Óbito",
    obito: "Óbito",
    morto: "Óbito",
  };

  for (const [key, nome] of Object.entries(mapeamento)) {
    if (lowerCondicoes.includes(key)) {
      const { data, error } = await supabase
        .from("dim_estado_saude")
        .select("id")
        .ilike("nome", `%${nome}%`)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0].id;
      }
    }
  }

  return null;
}

async function lookupEstagioVida(supabase: any, estagio: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("dim_estagio_vida")
    .select("id")
    .ilike("nome", `%${estagio}%`)
    .limit(1);

  if (error) {
    console.error("Erro ao buscar estágio de vida:", error);
    return null;
  }

  return data && data.length > 0 ? data[0].id : null;
}

async function lookupDesfecho(supabase: any, tipo: string): Promise<string | null> {
  // Para resgate, buscar desfecho padrão "Resgatado"
  if (tipo === "resgate") {
    const { data, error } = await supabase
      .from("dim_desfecho_resgates")
      .select("id")
      .ilike("nome", "%Resgatado%")
      .eq("tipo", "resgate")
      .limit(1);

    if (!error && data && data.length > 0) {
      return data[0].id;
    }
  }

  return null;
}
