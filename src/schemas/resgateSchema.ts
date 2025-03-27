
import { z } from "zod";

export const resgateSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  regiaoAdministrativa: z.string().min(1, "Região Administrativa é obrigatória"),
  origem: z.string().min(1, "Origem é obrigatória"),
  desfechoResgate: z.string().optional(),
  latitudeOrigem: z.string().min(1, "Latitude é obrigatória")
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    }, "Latitude deve ser um número entre -90 e 90"),
  longitudeOrigem: z.string().min(1, "Longitude é obrigatória")
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    }, "Longitude deve ser um número entre -180 e 180"),
  desfechoApreensao: z.string().optional(),
  numeroTCO: z.string().optional(),
  outroDesfecho: z.string().optional(),
  estadoSaude: z.string().optional(),
  atropelamento: z.string().optional(),
  estagioVida: z.string().optional(),
  quantidadeAdulto: z.number().min(0, "Quantidade de adultos não pode ser negativa").default(0),
  quantidadeFilhote: z.number().min(0, "Quantidade de filhotes não pode ser negativa").default(0),
  quantidade: z.number().default(0),
  destinacao: z.string().min(1, "Destinação é obrigatória"),
  numeroTermoEntrega: z.string().optional(),
  horaGuardaCEAPA: z.string().optional(),
  motivoEntregaCEAPA: z.string().optional(),
  latitudeSoltura: z.string().optional(),
  longitudeSoltura: z.string().optional(),
  outroDestinacao: z.string().optional(),
  classeTaxonomica: z.string().optional(),
  especieId: z.string().optional(),
})
.superRefine((data, ctx) => {
  // If desfechoResgate is "Evadido", several fields become optional
  const isEvadido = data.desfechoResgate === "Evadido";
  
  // For non-evadido cases, validate required fields
  if (!isEvadido) {
    // Validate classeTaxonomica
    if (!data.classeTaxonomica) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Classe Taxonômica é obrigatória",
        path: ["classeTaxonomica"],
      });
    }
    
    // Validate especieId
    if (!data.especieId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Espécie é obrigatória",
        path: ["especieId"],
      });
    }
    
    // Validate estadoSaude
    if (!data.estadoSaude) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Estado de Saúde é obrigatório",
        path: ["estadoSaude"],
      });
    }
    
    // Validate atropelamento
    if (!data.atropelamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informação sobre atropelamento é obrigatória",
        path: ["atropelamento"],
      });
    }
    
    // Validate estagioVida
    if (!data.estagioVida) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Estágio da Vida é obrigatório",
        path: ["estagioVida"],
      });
    }
    
    // Validate that at least one adult or juvenile is present
    if (data.quantidadeAdulto === 0 && data.quantidadeFilhote === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "É necessário adicionar pelo menos um animal adulto ou filhote",
        path: ["quantidadeAdulto"],
      });
    }
    
    // Validate quantidade
    if (data.quantidade < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantidade total deve ser maior que zero",
        path: ["quantidade"],
      });
    }
  }
  
  // Validate desfechoApreensao fields based on origem
  if (data.origem === "Apreensão") {
    if (!data.desfechoApreensao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Desfecho da Apreensão é obrigatório",
        path: ["desfechoApreensao"],
      });
      return; // Early return to avoid additional validation
    }
    
    if (data.desfechoApreensao === "TCO PMDF" || data.desfechoApreensao === "TCO PCDF") {
      if (!data.numeroTCO) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número do TCO é obrigatório",
          path: ["numeroTCO"],
        });
      }
    }
    
    if (data.desfechoApreensao === "Outros") {
      if (!data.outroDesfecho) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Especificação do outro desfecho é obrigatória",
          path: ["outroDesfecho"],
        });
      }
    }
  }
  
  // Validate destinação related fields
  if (data.destinacao === "CETAS/IBAMA" || data.destinacao === "HFAUS/IBRAM") {
    if (!data.numeroTermoEntrega) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número do Termo de Entrega é obrigatório",
        path: ["numeroTermoEntrega"],
      });
    }
  }
  
  if (data.destinacao === "CEAPA/BPMA") {
    if (!data.horaGuardaCEAPA) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hora da Guarda CEAPA é obrigatória",
        path: ["horaGuardaCEAPA"],
      });
    }
    
    if (!data.motivoEntregaCEAPA) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Motivo da Entrega CEAPA é obrigatório",
        path: ["motivoEntregaCEAPA"],
      });
    }
  }
  
  if (data.destinacao === "Soltura") {
    if (!data.latitudeSoltura) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude de Soltura é obrigatória",
        path: ["latitudeSoltura"],
      });
    }
    
    if (!data.longitudeSoltura) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Longitude de Soltura é obrigatória",
        path: ["longitudeSoltura"],
      });
    }
  }
  
  if (data.destinacao === "Outros") {
    if (!data.outroDestinacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Especificação da outra destinação é obrigatória",
        path: ["outroDestinacao"],
      });
    }
  }
});

export type ResgateFormData = z.infer<typeof resgateSchema>;
