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
  // Campos para óbito
  estagioVidaObito: z.string().optional(),
  quantidadeAdultoObito: z.number().min(0).max(1000).optional(),
  quantidadeFilhoteObito: z.number().min(0).max(1000).optional(),
  quantidadeTotalObito: z.number().min(0).max(2000).optional(),
  // Campos para Crime Contra a Flora
  floraItems: z.array(floraItemSchema).optional(),
  numeroTermoEntregaFlora: z.string().optional(),
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
  
  // Se tipoCrime é "Crime Contra a Fauna", campos de espécie são obrigatórios
  if (data.tipoCrime === "Crime Contra a Fauna") {
    if (!data.classeTaxonomica) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Classe Taxonômica é obrigatória para Crime Contra a Fauna",
        path: ["classeTaxonomica"]
      });
    }
    if (!data.especieId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Espécie é obrigatória para Crime Contra a Fauna",
        path: ["especieId"]
      });
    }
    if (!data.estadoSaudeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Estado de Saúde é obrigatório para Crime Contra a Fauna",
        path: ["estadoSaudeId"]
      });
    }
    if (!data.atropelamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informação sobre atropelamento é obrigatória para Crime Contra a Fauna",
        path: ["atropelamento"]
      });
    }
    if (!data.estagioVidaId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Estágio da Vida é obrigatório para Crime Contra a Fauna",
        path: ["estagioVidaId"]
      });
    }
    if (!data.destinacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Destinação é obrigatória para Crime Contra a Fauna",
        path: ["destinacao"]
      });
    }
    
    // Se destinação é Óbito, campos de óbito são obrigatórios
    if (data.destinacao === "Óbito") {
      if (!data.estagioVidaObito) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Estágio da Vida é obrigatório para óbito",
          path: ["estagioVidaObito"]
        });
      }
    }
  }

  // Se tipoCrime é "Crime Contra a Flora", validar itens de flora
  if (data.tipoCrime === "Crime Contra a Flora") {
    if (!data.floraItems || data.floraItems.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "É necessário adicionar pelo menos uma espécie de flora",
        path: ["floraItems"]
      });
    } else {
      data.floraItems.forEach((item, index) => {
        if (!item.especieId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Espécie é obrigatória para o item ${index + 1}`,
            path: ["floraItems", index, "especieId"]
          });
        }
        if (!item.condicao) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Condição é obrigatória para o item ${index + 1}`,
            path: ["floraItems", index, "condicao"]
          });
        }
        if (!item.destinacao) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Destinação é obrigatória para o item ${index + 1}`,
            path: ["floraItems", index, "destinacao"]
          });
        }
      });
    }
  }
});

export type CrimesAmbientaisFormData = z.infer<typeof crimesAmbientaisSchema>;

// Constantes para os selects (agora carregados do banco de dados)
// Mantidas apenas para compatibilidade - os valores reais vêm de dim_tipo_de_crime e dim_enquadramento

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