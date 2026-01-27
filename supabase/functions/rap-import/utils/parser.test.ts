// Testes unitários do parser de RAP

import { parseRAP } from "./parser.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Parser: Extrai número do RAP", () => {
  const text = "RAP Nº 007135-2026";
  const result = parseRAP(text);
  assertEquals(result.numero_rap, "007135-2026");
});

Deno.test("Parser: Extrai data", () => {
  const text = "Data: 26/01/2026";
  const result = parseRAP(text);
  assertEquals(result.data, "26/01/2026");
});

Deno.test("Parser: Extrai horários", () => {
  const text = "Acionamento: 14h07 Término: 16h45";
  const result = parseRAP(text);
  assertExists(result.horario_acionamento);
  assertExists(result.horario_termino);
});

Deno.test("Parser: Detecta tipo resgate", () => {
  const text = "Resgate de fauna silvestre";
  const result = parseRAP(text);
  assertEquals(result.tipo, "resgate");
});

Deno.test("Parser: Extrai dados complementares", () => {
  const text = `
    DADOS COMPLEMENTARES:
    Coordenadas do Resgate: 16.042776°S, 48.029226°W
    Nome Popular: Tatu-bola
    Quantidade: 2
    Estágio da Vida: Adulto
  `;
  const result = parseRAP(text);
  assertExists(result.dados_complementares);
  assertExists(result.dados_complementares?.coordenadas_resgate);
  assertExists(result.dados_complementares?.nome_popular);
  assertEquals(result.dados_complementares?.quantidade, "2");
});
