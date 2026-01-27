// Normalizador de dados - Converte formatos diversos para formato padrão

import { ParsedRAP } from "./parser.ts";

export interface NormalizedRAP {
  numero_rap?: string;
  data?: string; // YYYY-MM-DD
  horario_acionamento?: string; // HH:MM:SS
  horario_termino?: string; // HH:MM:SS
  latitude_origem?: string;
  longitude_origem?: string;
  latitude_soltura?: string;
  longitude_soltura?: string;
  nome_popular?: string;
  nome_cientifico?: string;
  quantidade_total?: number;
  quantidade_adulto?: number;
  quantidade_filhote?: number;
  quantidade_jovem?: number;
  estagio_vida?: string;
  condicoes_fisicas?: string;
  destinacao?: string;
  circunstancias_resgate?: string;
  tipo?: string;
  relato?: string;
  numero_tco?: string;
  outro_desfecho?: string;
  numero_termo_entrega?: string;
  hora_guarda_ceapa?: string;
  motivo_entrega_ceapa?: string;
  outro_destinacao?: string;
}

export function normalizeData(parsed: ParsedRAP): NormalizedRAP {
  const normalized: NormalizedRAP = {
    numero_rap: parsed.numero_rap,
    tipo: parsed.tipo,
    relato: parsed.relato,
  };

  // Normalizar data (DD/MM/AAAA -> YYYY-MM-DD)
  if (parsed.data) {
    normalized.data = normalizeDate(parsed.data);
  }

  // Normalizar horários (14h07 -> 14:07:00)
  if (parsed.horario_acionamento) {
    normalized.horario_acionamento = normalizeTime(parsed.horario_acionamento);
  }
  if (parsed.horario_termino) {
    normalized.horario_termino = normalizeTime(parsed.horario_termino);
  }

  // Normalizar coordenadas do resgate
  if (parsed.dados_complementares?.coordenadas_resgate) {
    const coords = normalizeCoordinates(parsed.dados_complementares.coordenadas_resgate);
    if (coords) {
      normalized.latitude_origem = coords.latitude;
      normalized.longitude_origem = coords.longitude;
    }
  }

  // Normalizar coordenadas da destinação
  if (parsed.dados_complementares?.coordenadas_destinacao) {
    const coords = normalizeCoordinates(parsed.dados_complementares.coordenadas_destinacao);
    if (coords) {
      normalized.latitude_soltura = coords.latitude;
      normalized.longitude_soltura = coords.longitude;
    }
  }

  // Dados da espécie
  normalized.nome_popular = parsed.dados_complementares?.nome_popular?.trim();
  normalized.nome_cientifico = parsed.dados_complementares?.nome_cientifico?.trim();

  // Quantidade
  if (parsed.dados_complementares?.quantidade) {
    const qty = parseInt(parsed.dados_complementares.quantidade, 10);
    if (!isNaN(qty)) {
      normalized.quantidade_total = qty;
    }
  }

  // Estágio da vida
  normalized.estagio_vida = parsed.dados_complementares?.estagio_vida;

  // Distribuir quantidade por estágio
  if (normalized.quantidade_total && normalized.estagio_vida) {
    if (normalized.estagio_vida.toLowerCase() === "adulto") {
      normalized.quantidade_adulto = normalized.quantidade_total;
      normalized.quantidade_filhote = 0;
      normalized.quantidade_jovem = 0;
    } else if (normalized.estagio_vida.toLowerCase() === "jovem") {
      normalized.quantidade_adulto = 0;
      normalized.quantidade_filhote = 0;
      normalized.quantidade_jovem = normalized.quantidade_total;
    } else if (normalized.estagio_vida.toLowerCase() === "filhote") {
      normalized.quantidade_adulto = 0;
      normalized.quantidade_filhote = normalized.quantidade_total;
      normalized.quantidade_jovem = 0;
    } else if (normalized.estagio_vida.toLowerCase() === "ambos") {
      // Deixar apenas quantidade_total, outros como 0
      normalized.quantidade_adulto = 0;
      normalized.quantidade_filhote = 0;
      normalized.quantidade_jovem = 0;
    }
  }

  // Condições físicas
  normalized.condicoes_fisicas = parsed.dados_complementares?.condicoes_fisicas?.trim();

  // Destinação
  normalized.destinacao = normalizeDestinacao(parsed.dados_complementares?.local_soltura_encaminhamento);

  // Circunstâncias
  normalized.circunstancias_resgate = parsed.dados_complementares?.circunstancias_resgate?.trim();

  return normalized;
}

function normalizeDate(dateStr: string): string {
  // Formato esperado: DD/MM/AAAA
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

function normalizeTime(timeStr: string): string {
  // Formato esperado: 14h07 ou 14:07
  const match = timeStr.match(/(\d{1,2})[h:](\d{2})/);
  if (match) {
    const [, hour, minute] = match;
    const h = hour.padStart(2, "0");
    const m = minute.padStart(2, "0");
    return `${h}:${m}:00`;
  }
  return timeStr;
}

function normalizeCoordinates(coordStr: string): { latitude: string; longitude: string } | null {
  if (!coordStr) return null;

  // Formato 1: "16.042776°S, 48.029226°W"
  const format1Match = coordStr.match(/([\d.]+)°\s*([NS]),\s*([\d.]+)°\s*([EW])/i);
  if (format1Match) {
    const [, lat, latDir, lon, lonDir] = format1Match;
    const latitude = latDir.toUpperCase() === "S" ? `-${lat}` : lat;
    const longitude = lonDir.toUpperCase() === "W" ? `-${lon}` : lon;
    return { latitude, longitude };
  }

  // Formato 2: "-15.7801, -47.9292"
  const format2Match = coordStr.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (format2Match) {
    const [, lat, lon] = format2Match;
    return { latitude: lat, longitude: lon };
  }

  // Formato 3: "15°02'34.0\"S 47°55'45.0\"W" (graus, minutos, segundos)
  const format3Match = coordStr.match(/(\d+)°\s*(\d+)['']\s*([\d.]+)[""]\s*([NS]),?\s*(\d+)°\s*(\d+)['']\s*([\d.]+)[""]\s*([EW])/i);
  if (format3Match) {
    const [, latDeg, latMin, latSec, latDir, lonDeg, lonMin, lonSec, lonDir] = format3Match;
    const latDecimal = parseFloat(latDeg) + parseFloat(latMin) / 60 + parseFloat(latSec) / 3600;
    const lonDecimal = parseFloat(lonDeg) + parseFloat(lonMin) / 60 + parseFloat(lonSec) / 3600;
    const latitude = latDir.toUpperCase() === "S" ? `-${latDecimal}` : `${latDecimal}`;
    const longitude = lonDir.toUpperCase() === "W" ? `-${lonDecimal}` : `${lonDecimal}`;
    return { latitude, longitude };
  }

  return null;
}

function normalizeDestinacao(destinacaoStr?: string): string | undefined {
  if (!destinacaoStr) return undefined;

  const lower = destinacaoStr.toLowerCase();

  // Mapear variações para valores padrão
  if (lower.includes("cetas") || lower.includes("ibama")) {
    return "CETAS/IBAMA";
  }
  if (lower.includes("hfaus") || lower.includes("ibram")) {
    return "HFAUS/IBRAM";
  }
  if (lower.includes("hvet") || lower.includes("unb")) {
    return "HVet/UnB";
  }
  if (lower.includes("ceapa") || lower.includes("bpma")) {
    return "CEAPA/BPMA";
  }
  if (lower.includes("soltura")) {
    return "Soltura";
  }
  if (lower.includes("vida livre")) {
    return "Vida Livre";
  }
  if (lower.includes("outro") || lower.includes("outros")) {
    return "Outros";
  }

  return destinacaoStr.trim();
}
