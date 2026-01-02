
import { DashboardData, Registro } from '@/types/hotspots';
import * as transformations from './dashboardDataTransformations';

/**
 * Processes raw registry data into dashboard data structure
 */
export const processDashboardData = (registros: Registro[]): DashboardData => {
  // Filter data for different categories
  // Se origem for 'Resgate de Fauna' ou se não houver origem (tabela específica de resgates), considerar como resgate
  const resgates = registros.filter(r => 
    r.origem?.nome === 'Resgate de Fauna' || 
    !r.origem || 
    r.tipo_registro === 'resgate' ||
    r.tipo_registro === 'historico'
  );
  const apreensoes = registros.filter(r => r.origem?.nome === 'Apreensão' || r.origem?.nome === 'Ação Policial');
  const animaisAtropelados = registros.filter(r => r.atropelamento === 'Sim' || r.atropelamento === true);
  
  // Transform data for different charts and metrics
  const regiaoAdministrativa = transformations.transformRegionalData(registros);
  const origemDistribuicao = transformations.transformOriginData(resgates, apreensoes);
  const classeTaxonomica = transformations.transformTaxonomicClassData(registros);
  const desfechoResgate = transformations.transformRescueOutcomeData(resgates);
  const desfechoApreensao = transformations.transformSeizureOutcomeData(apreensoes);
  const estadoSaude = transformations.transformHealthStatusData(registros);
  const destinacaoTipos = transformations.transformDestinationTypesData(registros);
  const atropelamentoDistribuicao = transformations.transformRoadkillData(registros, animaisAtropelados);
  const estagioVidaDistribuicao = transformations.transformLifeStageData(registros);
  const especiesMaisResgatadas = transformations.transformMostRescuedSpeciesData(resgates);
  const especiesMaisApreendidas = transformations.transformMostSeizedSpeciesData(apreensoes);
  const especiesAtropeladas = transformations.transformRoadkillSpeciesData(animaisAtropelados);
  const motivosEntregaCEAPA = transformations.transformCEAPAReasonsData(registros);
  const mapDataOrigem = transformations.transformOriginMapData(registros);
  const mapDataSoltura = transformations.transformReleaseMapData(registros);
  const timeSeriesData = transformations.transformTimeSeriesData(registros);
  const quantidadePorOcorrencia = transformations.transformQuantityStatistics(registros);
  const metricas = transformations.transformDashboardMetrics(registros, resgates, apreensoes, animaisAtropelados);
  
  // Create the dashboard data object
  return {
    totalRegistros: registros.length,
    totalResgates: resgates.length,
    totalApreensoes: apreensoes.length,
    totalAtropelamentos: animaisAtropelados.length,
    timeSeriesData,
    regiaoAdministrativa,
    origemDistribuicao,
    classeTaxonomica,
    desfechoResgate,
    desfechoApreensao,
    estadoSaude,
    destinacaoTipos,
    atropelamentoDistribuicao,
    estagioVidaDistribuicao,
    especiesMaisResgatadas,
    especiesMaisApreendidas,
    especiesAtropeladas,
    motivosEntregaCEAPA,
    mapDataOrigem,
    mapDataSoltura,
    quantidadePorOcorrencia,
    metricas,
    ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
    distribuicaoPorClasse: classeTaxonomica,
    destinos: destinacaoTipos,
    desfechos: desfechoApreensao,
    atropelamentos: especiesAtropeladas,
    rawData: registros
  };
};
