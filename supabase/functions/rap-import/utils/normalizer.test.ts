// Testes unitários do normalizador

import { normalizeData } from "./normalizer.ts";
import { parseRAP } from "./parser.ts";
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Normalizer: Converte data DD/MM/AAAA para YYYY-MM-DD", () => {
  const parsed = parseRAP("Data: 26/01/2026");
  const normalized = normalizeData(parsed);
  assertEquals(normalized.data, "2026-01-26");
});

Deno.test("Normalizer: Converte horário 14h07 para 14:07:00", () => {
  const parsed = parseRAP("Horário: 14h07");
  const normalized = normalizeData(parsed);
  assertEquals(normalized.horario_acionamento, "14:07:00");
});

Deno.test("Normalizer: Normaliza coordenadas S/W para decimais negativos", () => {
  const parsed = parseRAP("Coordenadas: 16.042776°S, 48.029226°W");
  const normalized = normalizeData(parsed);
  assertEquals(normalized.latitude_origem, "-16.042776");
  assertEquals(normalized.longitude_origem, "-48.029226");
});

Deno.test("Normalizer: Aceita coordenadas já em formato decimal", () => {
  const parsed = parseRAP("Coordenadas: -15.7801, -47.9292");
  const normalized = normalizeData(parsed);
  assertEquals(normalized.latitude_origem, "-15.7801");
  assertEquals(normalized.longitude_origem, "-47.9292");
});

Deno.test("Normalizer: Distribui quantidade por estágio", () => {
  const parsed = parseRAP(`
    Quantidade: 3
    Estágio da Vida: Adulto
  `);
  const normalized = normalizeData(parsed);
  assertEquals(normalized.quantidade_total, 3);
  assertEquals(normalized.quantidade_adulto, 3);
  assertEquals(normalized.quantidade_filhote, 0);
});

Deno.test("Normalizer: Normaliza destinação", () => {
  const parsed = parseRAP("Destinação: CETAS IBAMA");
  const normalized = normalizeData(parsed);
  assertEquals(normalized.destinacao, "CETAS/IBAMA");
});
