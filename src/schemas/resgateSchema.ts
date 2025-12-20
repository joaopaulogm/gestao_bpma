
import { z } from "zod";

export const resgateSchema = z
  .object({
    data: z.string().min(1, "Data é obrigatória"),
    regiaoAdministrativa: z.string().min(1, "Região Administrativa é obrigatória"),
    origem: z.string().min(1, "Origem é obrigatória"),
    desfechoResgate: z.string().optional(),
    latitudeOrigem: z
      .string()
      .min(1, "Latitude é obrigatória")
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
      }, "Latitude deve ser um número entre -90 e 90"),
    longitudeOrigem: z
      .string()
      .min(1, "Longitude é obrigatória")
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
      }, "Longitude deve ser um número entre -180 e 180"),

    // Apreensão (campos de nível do registro)
    desfechoApreensao: z.string().optional(),
    numeroTCO: z.string().optional(),
    outroDesfecho: z.string().optional(),

    // Campos abaixo ficaram opcionais pois agora são controlados por espécie
    // (via EspeciesMultiplasSection) e não devem bloquear o submit do formulário.
    estadoSaude: z.string().optional(),
    atropelamento: z.string().optional(),
    estagioVida: z.string().optional(),
    quantidadeAdulto: z.number().min(0).default(0),
    quantidadeFilhote: z.number().min(0).default(0),
    quantidade: z.number().default(0),
    destinacao: z.string().optional(),
    numeroTermoEntrega: z.string().optional(),
    horaGuardaCEAPA: z.string().optional(),
    motivoEntregaCEAPA: z.string().optional(),
    latitudeSoltura: z.string().optional(),
    longitudeSoltura: z.string().optional(),
    outroDestinacao: z.string().optional(),
    classeTaxonomica: z.string().optional(),
    especieId: z.string().optional(),
    tipoAreaId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validação específica para Apreensão (mantida)
    if (data.origem === "Apreensão") {
      if (!data.desfechoApreensao) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Desfecho da Apreensão é obrigatório",
          path: ["desfechoApreensao"],
        });
        return;
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

    // Observação: regras de "destinação" e "informações do animal" agora são
    // validadas por item de espécie no componente EspeciesMultiplasSection.
  });

export type ResgateFormData = z.infer<typeof resgateSchema>;

