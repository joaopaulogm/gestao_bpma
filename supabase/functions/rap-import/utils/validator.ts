// Validador - Implementa o gate de inserção

import { NormalizedRAP } from "./normalizer.ts";

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

export function validateRequiredFields(data: NormalizedRAP): ValidationResult {
  const missingFields: string[] = [];

  // 1. Data válida
  if (!data.data || !isValidDate(data.data)) {
    missingFields.push("data");
  }

  // 2. Latitude origem válida
  if (!data.latitude_origem || !isValidCoordinate(data.latitude_origem)) {
    missingFields.push("latitude_origem");
  }

  // 3. Longitude origem válida
  if (!data.longitude_origem || !isValidCoordinate(data.longitude_origem)) {
    missingFields.push("longitude_origem");
  }

  // 4. Nome popular OU especie_id (será resolvido depois, mas precisamos do nome_popular)
  if (!data.nome_popular || data.nome_popular.trim().length === 0) {
    missingFields.push("nome_popular");
  }

  // 5. Quantidade total presente e >= 1
  if (!data.quantidade_total || data.quantidade_total < 1) {
    missingFields.push("quantidade_total");
  }

  // 6. Destinação presente
  if (!data.destinacao || data.destinacao.trim().length === 0) {
    missingFields.push("destinacao");
  }

  // Validações condicionais
  if (data.destinacao === "Soltura") {
    if (!data.latitude_soltura || !isValidCoordinate(data.latitude_soltura)) {
      missingFields.push("latitude_soltura");
    }
    if (!data.longitude_soltura || !isValidCoordinate(data.longitude_soltura)) {
      missingFields.push("longitude_soltura");
    }
  }

  if (data.destinacao === "CEAPA/BPMA") {
    if (!data.hora_guarda_ceapa || data.hora_guarda_ceapa.trim().length === 0) {
      missingFields.push("hora_guarda_ceapa");
    }
    if (!data.motivo_entrega_ceapa || data.motivo_entrega_ceapa.trim().length === 0) {
      missingFields.push("motivo_entrega_ceapa");
    }
  }

  // Verificar se origem/desfecho indicam necessidade de TCO
  // (isso seria verificado após resolução de lookups, mas podemos fazer uma validação básica aqui)
  // Por enquanto, deixamos essa validação para depois da resolução

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

function isValidDate(dateStr: string): boolean {
  // Formato esperado: YYYY-MM-DD
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, year, month, day] = match;
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  if (yearNum < 2020 || yearNum > 2100) return false;
  if (monthNum < 1 || monthNum > 12) return false;
  if (dayNum < 1 || dayNum > 31) return false;

  // Validação básica de data válida
  const date = new Date(`${year}-${month}-${day}`);
  return date.getFullYear() === yearNum &&
         date.getMonth() + 1 === monthNum &&
         date.getDate() === dayNum;
}

function isValidCoordinate(coordStr: string): boolean {
  if (!coordStr || coordStr.trim().length === 0) return false;

  const num = parseFloat(coordStr);
  if (isNaN(num)) return false;

  // Latitude: -90 a 90
  // Longitude: -180 a 180
  // Mas não sabemos qual é qual aqui, então validamos um range mais amplo
  return num >= -180 && num <= 180;
}
