
import { ResgateFormData } from '@/schemas/resgateSchema';

/**
 * Valores padrão para o formulário de resgate
 */
export const defaultResgateForm: ResgateFormData = {
  data: '',
  regiaoAdministrativa: '',
  origem: '',
  latitudeOrigem: '',
  longitudeOrigem: '',
  desfechoApreensao: '',
  numeroTCO: '',
  outroDesfecho: '',
  estadoSaude: '',
  atropelamento: '',
  estagioVida: '',
  quantidade: 1,
  destinacao: '',
  numeroTermoEntrega: '',
  horaGuardaCEAPA: '',
  motivoEntregaCEAPA: '',
  latitudeSoltura: '',
  longitudeSoltura: '',
  outroDestinacao: '',
  classeTaxonomica: '',
  especieId: '',
};
