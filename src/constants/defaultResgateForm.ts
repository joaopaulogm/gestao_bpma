
import { ResgateFormData } from '@/schemas/resgateSchema';

export const defaultResgateForm: ResgateFormData = {
  data: '',
  regiaoAdministrativa: '',
  origem: '',
  latitudeOrigem: '',
  longitudeOrigem: '',
  destinacao: '',
  animais: [{
    classeTaxonomica: '',
    especieId: '',
    estadoSaude: '',
    atropelamento: '',
    estagioVida: '',
    quantidadeAdulto: 0,
    quantidadeFilhote: 0,
    quantidade: 0,
  }]
};
