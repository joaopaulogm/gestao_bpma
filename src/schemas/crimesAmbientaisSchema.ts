import { z } from 'zod';

// Schema para item de flora
export const floraItemSchema = z.object({
  id: z.string(),
  especieId: z.string(),
  nomePopular: z.string(),
  nomeCientifico: z.string(),
  classe: z.string(),
  ordem: z.string(),
  familia: z.string(),
  estadoConservacao: z.string(),
  tipoPlanta: z.string(),
  madeiraLei: z.string(),
  imuneCote: z.string(),
  condicao: z.string(),
  quantidade: z.number().min(1),
  destinacao: z.string()
});

export type FloraItemData = z.infer<typeof floraItemSchema>;

// Schema para bem apreendido
export const bemApreendidoSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  categoria: z.string(),
  item: z.string(),
  usoIlicito: z.string(),
  aplicacao: z.string(),
  quantidade: z.number().min(1)
});

export type BemApreendidoData = z.infer<typeof bemApreendidoSchema>;

export const crimesAmbientaisSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  regiaoAdministrativa: z.string().min(1, "Região Administrativa é obrigatória"),
  tipoAreaId: z.string().optional(),
  latitudeOcorrencia: z.string().optional(),
  longitudeOcorrencia: z.string().optional(),
  tipoCrime: z.string().min(1, "Tipo de Crime é obrigatório"),
  enquadramento: z.string().min(1, "Enquadramento é obrigatório"),
  ocorreuApreensao: z.boolean().default(false),
  
  // Campos para Crime Contra a Fauna
  classeTaxonomica: z.string().optional(),
  especieId: z.string().optional(),
  estadoSaudeId: z.string().optional(),
  atropelamento: z.string().optional(),
  estagioVidaId: z.string().optional(),
  quantidadeAdulto: z.number().min(0).max(1000).optional(),
  quantidadeFilhote: z.number().min(0).max(1000).optional(),
  quantidadeTotal: z.number().min(0).max(2000).optional(),
  destinacao: z.string().optional(),
  estagioVidaObito: z.string().optional(),
  quantidadeAdultoObito: z.number().min(0).max(1000).optional(),
  quantidadeFilhoteObito: z.number().min(0).max(1000).optional(),
  quantidadeTotalObito: z.number().min(0).max(2000).optional(),
  
  // Campos para Crime Contra a Flora
  floraItems: z.array(floraItemSchema).optional(),
  numeroTermoEntregaFlora: z.string().optional(),
  
  // Campos para Crimes de Poluição
  tipoPoluicao: z.string().optional(),
  descricaoSituacaoPoluicao: z.string().optional(),
  materialVisivel: z.string().optional(),
  volumeAparente: z.string().optional(),
  origemAparente: z.string().optional(),
  animalAfetado: z.boolean().optional(),
  vegetacaoAfetada: z.boolean().optional(),
  alteracaoVisual: z.boolean().optional(),
  odorForte: z.boolean().optional(),
  mortandadeAnimais: z.boolean().optional(),
  riscoImediato: z.string().optional(),
  intensidadePercebida: z.string().optional(),
  
  // Campos para Crimes Contra Ordenamento Urbano
  tipoIntervencaoIrregular: z.string().optional(),
  estruturasEncontradas: z.string().optional(),
  quantidadeEstruturas: z.number().min(0).optional(),
  danoAlteracaoPerceptivel: z.string().optional(),
  maquinasPresentes: z.boolean().optional(),
  materialApreendidoUrbano: z.boolean().optional(),
  descricaoMaterialUrbano: z.string().optional(),
  
  // Campos para Crimes Contra Administração Ambiental
  tipoImpedimentoObstrucao: z.string().optional(),
  descricaoAdministracao: z.string().optional(),
  documentoIndicioVisual: z.boolean().optional(),
  tipoIndicio: z.string().optional(),
  materialApreendidoAdmin: z.boolean().optional(),
  descricaoMaterialAdmin: z.string().optional(),
  veiculoRelacionado: z.boolean().optional(),
  
  // Bens Apreendidos
  bensApreendidos: z.array(bemApreendidoSchema).optional(),
  
  // Desfecho e quantidades de detidos/liberados
  desfecho: z.string().min(1, "Desfecho é obrigatório"),
  procedimentoLegal: z.string().optional(),
  quantidadeDetidosMaiorIdade: z.number().min(0).max(1000).optional(),
  quantidadeDetidosMenorIdade: z.number().min(0).max(1000).optional(),
  quantidadeLiberadosMaiorIdade: z.number().min(0).max(1000).optional(),
  quantidadeLiberadosMenorIdade: z.number().min(0).max(1000).optional()
}).superRefine((data, ctx) => {
  // Se desfecho é "Flagrante", procedimento legal é obrigatório
  if (data.desfecho === "Flagrante" && !data.procedimentoLegal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Procedimento Legal é obrigatório quando o desfecho é Flagrante",
      path: ["procedimentoLegal"]
    });
  }
});

export type CrimesAmbientaisFormData = z.infer<typeof crimesAmbientaisSchema>;

export const DESFECHOS = [
  "Em Apuração pela PCDF",
  "Em Monitoramento pela PMDF", 
  "Averiguado e Nada Constatado",
  "Resolvido no Local",
  "Flagrante"
];

export const PROCEDIMENTOS_LEGAIS = [
  "TCO-PMDF",
  "TCO-PCDF", 
  "Em Apuração PCDF"
];
