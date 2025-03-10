
import { z } from "zod";

export const resgateSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  regiaoAdministrativa: z.string().min(1, "Região Administrativa é obrigatória"),
  origem: z.string().min(1, "Origem é obrigatória"),
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
  estadoSaude: z.string().min(1, "Estado de Saúde é obrigatório"),
  atropelamento: z.string().min(1, "Informação sobre atropelamento é obrigatória"),
  estagioVida: z.string().min(1, "Estágio da Vida é obrigatório"),
  quantidade: z.number().min(1, "Quantidade deve ser maior que zero"),
  destinacao: z.string().min(1, "Destinação é obrigatória"),
  numeroTermoEntrega: z.string().optional(),
  horaGuardaCEAPA: z.string().optional(),
  motivoEntregaCEAPA: z.string().optional(),
  latitudeSoltura: z.string().optional(),
  longitudeSoltura: z.string().optional(),
  outroDestinacao: z.string().optional(),
  classeTaxonomica: z.string().min(1, "Classe Taxonômica é obrigatória"),
  nomePopular: z.string().min(1, "Nome Popular é obrigatório"),
}).refine(data => {
  // Validate desfechoApreensao fields based on origem
  if (data.origem === "Apreensão") {
    if (!data.desfechoApreensao) return false;
    
    if (data.desfechoApreensao === "TCO PMDF" || data.desfechoApreensao === "TCO PCDF") {
      return !!data.numeroTCO;
    }
    
    if (data.desfechoApreensao === "Outros") {
      return !!data.outroDesfecho;
    }
  }
  
  // Validate destinação related fields
  if (data.destinacao === "CETAS/IBAMA" || data.destinacao === "HFAUS/IBRAM") {
    return !!data.numeroTermoEntrega;
  }
  
  if (data.destinacao === "CEAPA/BPMA") {
    return !!data.horaGuardaCEAPA && !!data.motivoEntregaCEAPA;
  }
  
  if (data.destinacao === "Soltura") {
    return !!data.latitudeSoltura && !!data.longitudeSoltura;
  }
  
  if (data.destinacao === "Outros") {
    return !!data.outroDestinacao;
  }
  
  return true;
}, {
  message: "Por favor, preencha todos os campos obrigatórios",
  path: ["root"]
});

export type ResgateFormData = z.infer<typeof resgateSchema>;
