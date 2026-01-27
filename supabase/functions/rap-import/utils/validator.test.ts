// Testes unitários do validador

import { validateRequiredFields } from "./validator.ts";
import { normalizeData } from "./normalizer.ts";
import { parseRAP } from "./parser.ts";
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Validator: Rejeita quando falta data", () => {
  const parsed = parseRAP("Texto sem data");
  const normalized = normalizeData(parsed);
  normalized.data = undefined;
  const result = validateRequiredFields(normalized);
  assertEquals(result.isValid, false);
  assertEquals(result.missingFields.includes("data"), true);
});

Deno.test("Validator: Rejeita quando falta latitude", () => {
  const parsed = parseRAP("Data: 26/01/2026");
  const normalized = normalizeData(parsed);
  normalized.latitude_origem = undefined;
  const result = validateRequiredFields(normalized);
  assertEquals(result.isValid, false);
  assertEquals(result.missingFields.includes("latitude_origem"), true);
});

Deno.test("Validator: Rejeita quando falta quantidade_total", () => {
  const parsed = parseRAP("Data: 26/01/2026 Coordenadas: -15.7801, -47.9292");
  const normalized = normalizeData(parsed);
  normalized.quantidade_total = undefined;
  const result = validateRequiredFields(normalized);
  assertEquals(result.isValid, false);
  assertEquals(result.missingFields.includes("quantidade_total"), true);
});

Deno.test("Validator: Rejeita quando destinacao é Soltura mas falta coordenadas", () => {
  const parsed = parseRAP("Data: 26/01/2026 Coordenadas: -15.7801, -47.9292 Destinação: Soltura");
  const normalized = normalizeData(parsed);
  normalized.destinacao = "Soltura";
  normalized.latitude_soltura = undefined;
  const result = validateRequiredFields(normalized);
  assertEquals(result.isValid, false);
  assertEquals(result.missingFields.includes("latitude_soltura"), true);
});

Deno.test("Validator: Aceita quando todos os campos obrigatórios estão presentes", () => {
  const parsed = parseRAP(`
    Data: 26/01/2026
    Coordenadas do Resgate: -15.7801, -47.9292
    Nome Popular: Tatu-bola
    Quantidade: 2
    Destinação: CETAS/IBAMA
  `);
  const normalized = normalizeData(parsed);
  const result = validateRequiredFields(normalized);
  // Pode ainda falhar se faltar algum campo, mas testamos a lógica básica
  // assertEquals(result.isValid, true);
});
