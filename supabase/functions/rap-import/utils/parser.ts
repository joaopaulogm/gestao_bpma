// Parser de RAP - Extrai dados do texto do PDF

export interface ParsedRAP {
  numero_rap?: string;
  data?: string;
  horario_acionamento?: string;
  horario_termino?: string;
  relato?: string;
  dados_complementares?: {
    coordenadas_resgate?: string;
    local_soltura_encaminhamento?: string;
    coordenadas_destinacao?: string;
    nome_popular?: string;
    nome_cientifico?: string;
    quantidade?: string;
    estagio_vida?: string;
    condicoes_fisicas?: string;
    circunstancias_resgate?: string;
  };
  tipo?: "resgate" | "crime_ambiental" | "crime_comum" | "prevencao";
}

export function parseRAP(text: string): ParsedRAP {
  const parsed: ParsedRAP = {
    relato: text,
  };

  // Extrair número do RAP (formato: 007135-2026 ou similar)
  const rapNumeroMatch = text.match(/\b(\d{6,7}[-/]\d{4})\b/);
  if (rapNumeroMatch) {
    parsed.numero_rap = rapNumeroMatch[1];
  }

  // Extrair data (formato DD/MM/AAAA)
  const dataMatch = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  if (dataMatch) {
    parsed.data = dataMatch[1];
  }

  // Extrair horários (formato: 14h07, 14:07, etc)
  const horarioMatches = text.match(/\b(\d{1,2})[h:](\d{2})\b/g);
  if (horarioMatches && horarioMatches.length >= 1) {
    parsed.horario_acionamento = horarioMatches[0];
  }
  if (horarioMatches && horarioMatches.length >= 2) {
    parsed.horario_termino = horarioMatches[1];
  }

  // Detectar tipo do RAP
  const lowerText = text.toLowerCase();
  if (lowerText.includes("resgate") || lowerText.includes("fauna") || lowerText.includes("animal")) {
    parsed.tipo = "resgate";
  } else if (lowerText.includes("crime ambiental") || lowerText.includes("infração ambiental")) {
    parsed.tipo = "crime_ambiental";
  } else if (lowerText.includes("crime comum") || lowerText.includes("delito")) {
    parsed.tipo = "crime_comum";
  } else if (lowerText.includes("prevenção") || lowerText.includes("prevencao")) {
    parsed.tipo = "prevencao";
  } else {
    parsed.tipo = "resgate"; // Default
  }

  // Extrair seção "Dados Complementares"
  const dadosComplementaresMatch = text.match(/DADOS\s+COMPLEMENTARES[:\s]*(.*?)(?=\n\n|\n[A-Z]{3,}|$)/is);
  if (dadosComplementaresMatch) {
    const dadosText = dadosComplementaresMatch[1];
    parsed.dados_complementares = extractDadosComplementares(dadosText);
  } else {
    // Tentar extrair dados mesmo sem seção explícita
    parsed.dados_complementares = extractDadosComplementares(text);
  }

  return parsed;
}

function extractDadosComplementares(text: string): ParsedRAP["dados_complementares"] {
  const dados: ParsedRAP["dados_complementares"] = {};

  // Coordenadas do resgate (vários formatos)
  const coordResgateMatch = text.match(/(?:coordenadas?\s*(?:do\s*)?resgate|localiza[çc][ãa]o)[:\s]*([^\n]+)/i);
  if (coordResgateMatch) {
    dados.coordenadas_resgate = coordResgateMatch[1].trim();
  } else {
    // Tentar encontrar coordenadas genéricas no início do texto
    const coordGenericMatch = text.match(/(?:coord|lat|long)[:\s]*([^\n]+)/i);
    if (coordGenericMatch) {
      dados.coordenadas_resgate = coordGenericMatch[1].trim();
    }
  }

  // Local de soltura/encaminhamento
  const localMatch = text.match(/(?:local\s*(?:de\s*)?(?:soltura|encaminhamento|destina[çc][ãa]o)|destina[çc][ãa]o|encaminhado\s*para)[:\s]*([^\n]+)/i);
  if (localMatch) {
    dados.local_soltura_encaminhamento = localMatch[1].trim();
  }

  // Coordenadas da destinação
  const coordDestMatch = text.match(/(?:coordenadas?\s*(?:da\s*)?(?:soltura|destina[çc][ãa]o))[:\s]*([^\n]+)/i);
  if (coordDestMatch) {
    dados.coordenadas_destinacao = coordDestMatch[1].trim();
  }

  // Nome popular
  const nomePopularMatch = text.match(/(?:nome\s*(?:popular|vulgar|comum)|esp[ée]cie)[:\s]*([^\n]+)/i);
  if (nomePopularMatch) {
    dados.nome_popular = nomePopularMatch[1].trim();
  }

  // Nome científico
  const nomeCientificoMatch = text.match(/(?:nome\s*(?:cient[íi]fico|científico))[:\s]*([A-Z][a-z]+\s+[a-z]+)/);
  if (nomeCientificoMatch) {
    dados.nome_cientifico = nomeCientificoMatch[1].trim();
  }

  // Quantidade
  const quantidadeMatch = text.match(/(?:quantidade|qtd|qtde)[:\s]*(\d+)/i);
  if (quantidadeMatch) {
    dados.quantidade = quantidadeMatch[1];
  }

  // Estágio da vida
  const estagioMatch = text.match(/(?:est[áa]gio\s*(?:da\s*)?vida|idade)[:\s]*(adulto|jovem|filhote|ambos)/i);
  if (estagioMatch) {
    dados.estagio_vida = estagioMatch[1].toLowerCase();
  }

  // Condições físicas
  const condicoesMatch = text.match(/(?:condi[çc][õo]es?\s*(?:f[íi]sicas?|do\s*animal)|estado\s*(?:de\s*)?sa[úu]de)[:\s]*([^\n]+)/i);
  if (condicoesMatch) {
    dados.condicoes_fisicas = condicoesMatch[1].trim();
  }

  // Circunstâncias do resgate
  const circunstanciasMatch = text.match(/(?:circunst[âa]ncias?\s*(?:do\s*)?resgate|origem|como\s*foi\s*encontrado)[:\s]*([^\n]+)/i);
  if (circunstanciasMatch) {
    dados.circunstancias_resgate = circunstanciasMatch[1].trim();
  }

  return dados;
}
