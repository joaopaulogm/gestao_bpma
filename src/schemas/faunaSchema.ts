
import { z } from "zod";

export const faunaSchema = z.object({
  classe_taxonomica: z.string().min(1, "A classe taxonômica é obrigatória"),
  nome_popular: z.string().min(1, "O nome popular é obrigatório"),
  nome_cientifico: z.string().min(1, "O nome científico é obrigatório"),
  ordem_taxonomica: z.string().min(1, "A ordem taxonômica é obrigatória"),
  estado_de_conservacao: z.string().min(1, "O estado de conservação é obrigatório"),
  tipo_de_fauna: z.string().min(1, "O tipo de fauna é obrigatório"),
});

export type FaunaFormData = z.infer<typeof faunaSchema>;
