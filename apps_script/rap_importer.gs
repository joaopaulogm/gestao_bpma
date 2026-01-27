/**
 * Google Apps Script: Importador Automático de RAPs
 * 
 * Este script monitora uma pasta do Google Drive e envia PDFs novos/atualizados
 * para a Supabase Edge Function para processamento.
 * 
 * Configuração necessária:
 * 1. Definir FOLDER_ID da pasta do Drive
 * 2. Definir EDGE_FUNCTION_URL da Supabase Edge Function
 * 3. Definir IMPORT_SECRET (mesmo valor configurado na Edge Function)
 * 4. Configurar gatilho temporal (a cada 10 minutos)
 */

// ============================================
// CONFIGURAÇÕES
// ============================================

const CONFIG = {
  // ID da pasta do Google Drive
  FOLDER_ID: '1Rx_056ruXq_NuiVwOQ5TKmRT9TcMIMog',
  
  // URL da Supabase Edge Function
  EDGE_FUNCTION_URL: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/rap-import',
  
  // Secret para autenticação (deve ser o mesmo configurado na Edge Function)
  IMPORT_SECRET: 'YOUR_IMPORT_SECRET_HERE',
  
  // Limite de arquivos processados por execução
  MAX_FILES_PER_RUN: 10,
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000, // 2 segundos
};

// Chave para armazenar estado no PropertiesService
const STATE_KEY = 'rap_importer_state';

// ============================================
// FUNÇÃO PRINCIPAL (Gatilho Temporal)
// ============================================

/**
 * Função principal executada pelo gatilho temporal
 */
function processRAPs() {
  try {
    Logger.log('=== Iniciando processamento de RAPs ===');
    Logger.log('Data/Hora: ' + new Date().toISOString());
    
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    if (!folder) {
      Logger.log('ERRO: Pasta não encontrada com ID: ' + CONFIG.FOLDER_ID);
      return;
    }
    
    // Carregar estado de processamento
    const state = loadState();
    
    // Listar arquivos PDF na pasta
    const files = folder.getFilesByType(MimeType.PDF);
    const filesToProcess: Array<{file: GoogleAppsScript.Drive.File, shouldProcess: boolean}> = [];
    
    while (files.hasNext() && filesToProcess.length < CONFIG.MAX_FILES_PER_RUN) {
      const file = files.next();
      const fileId = file.getId();
      const modifiedTime = file.getLastUpdated().getTime();
      
      // Verificar se arquivo já foi processado
      const processedKey = `processed_${fileId}`;
      const lastProcessedTime = state[processedKey];
      
      const shouldProcess = !lastProcessedTime || modifiedTime > lastProcessedTime;
      
      if (shouldProcess) {
        filesToProcess.push({ file: file, shouldProcess: true });
        Logger.log(`Arquivo para processar: ${file.getName()} (ID: ${fileId})`);
      }
    }
    
    Logger.log(`Total de arquivos para processar: ${filesToProcess.length}`);
    
    // Processar cada arquivo
    for (const item of filesToProcess) {
      const file = item.file;
      const fileId = file.getId();
      
      try {
        const success = processFile(file);
        
        if (success) {
          // Marcar como processado
          const processedKey = `processed_${fileId}`;
          state[processedKey] = file.getLastUpdated().getTime();
          Logger.log(`✓ Arquivo processado com sucesso: ${file.getName()}`);
        } else {
          Logger.log(`✗ Falha ao processar arquivo: ${file.getName()}`);
        }
      } catch (error) {
        Logger.log(`ERRO ao processar arquivo ${file.getName()}: ${error.toString()}`);
        // Marcar como processado mesmo em erro para evitar loop infinito
        // mas apenas se o erro for "missing_required_fields" ou "needs_ocr"
        const errorStr = error.toString();
        if (errorStr.includes('missing_required_fields') || errorStr.includes('needs_ocr')) {
          const processedKey = `processed_${fileId}`;
          state[processedKey] = file.getLastUpdated().getTime();
          Logger.log(`Arquivo marcado como processado (erro conhecido): ${file.getName()}`);
        }
      }
    }
    
    // Salvar estado
    saveState(state);
    
    Logger.log('=== Processamento concluído ===');
  } catch (error) {
    Logger.log('ERRO CRÍTICO: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
  }
}

// ============================================
// PROCESSAMENTO DE ARQUIVO
// ============================================

/**
 * Processa um arquivo PDF individual
 */
function processFile(file: GoogleAppsScript.Drive.File): boolean {
  const fileId = file.getId();
  const fileName = file.getName();
  const modifiedTime = file.getLastUpdated().toISOString();
  const folderId = CONFIG.FOLDER_ID;
  
  Logger.log(`Processando arquivo: ${fileName}`);
  
  try {
    // Baixar PDF como base64
    const pdfBlob = file.getBlob();
    const pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
    
    // Preparar payload
    const payload = {
      fileId: fileId,
      fileName: fileName,
      folderId: folderId,
      modifiedTime: modifiedTime,
      pdfBase64: pdfBase64
    };
    
    // Enviar para Edge Function com retry
    const response = sendToEdgeFunction(payload);
    
    if (response.success) {
      Logger.log(`Resposta do backend: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      Logger.log(`Erro na resposta: ${response.error}`);
      return false;
    }
  } catch (error) {
    Logger.log(`Erro ao processar arquivo ${fileName}: ${error.toString()}`);
    throw error;
  }
}

// ============================================
// COMUNICAÇÃO COM EDGE FUNCTION
// ============================================

/**
 * Envia payload para Edge Function com retry
 */
function sendToEdgeFunction(payload: object, retryCount: number = 0): {success: boolean, data?: any, error?: string} {
  try {
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-IMPORT-SECRET': CONFIG.IMPORT_SECRET
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(CONFIG.EDGE_FUNCTION_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      try {
        const data = JSON.parse(responseText);
        return { success: true, data: data };
      } catch (parseError) {
        Logger.log(`Erro ao parsear resposta: ${parseError.toString()}`);
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } else if (responseCode >= 500 && retryCount < CONFIG.MAX_RETRIES) {
      // Erro do servidor, tentar novamente
      Logger.log(`Erro ${responseCode}, tentando novamente (tentativa ${retryCount + 1}/${CONFIG.MAX_RETRIES})`);
      Utilities.sleep(CONFIG.RETRY_DELAY_MS * Math.pow(2, retryCount)); // Backoff exponencial
      return sendToEdgeFunction(payload, retryCount + 1);
    } else {
      Logger.log(`Erro HTTP ${responseCode}: ${responseText}`);
      return { success: false, error: `HTTP ${responseCode}: ${responseText}` };
    }
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      Logger.log(`Erro de rede, tentando novamente (tentativa ${retryCount + 1}/${CONFIG.MAX_RETRIES})`);
      Utilities.sleep(CONFIG.RETRY_DELAY_MS * Math.pow(2, retryCount));
      return sendToEdgeFunction(payload, retryCount + 1);
    } else {
      Logger.log(`Erro após ${CONFIG.MAX_RETRIES} tentativas: ${error.toString()}`);
      return { success: false, error: error.toString() };
    }
  }
}

// ============================================
// GERENCIAMENTO DE ESTADO
// ============================================

/**
 * Carrega estado de processamento do PropertiesService
 */
function loadState(): Record<string, any> {
  const properties = PropertiesService.getScriptProperties();
  const stateJson = properties.getProperty(STATE_KEY);
  
  if (stateJson) {
    try {
      return JSON.parse(stateJson);
    } catch (error) {
      Logger.log('Erro ao parsear estado, usando estado vazio');
      return {};
    }
  }
  
  return {};
}

/**
 * Salva estado de processamento no PropertiesService
 */
function saveState(state: Record<string, any>): void {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(STATE_KEY, JSON.stringify(state));
}

/**
 * Limpa estado de processamento (útil para testes)
 */
function clearState(): void {
  const properties = PropertiesService.getScriptProperties();
  properties.deleteProperty(STATE_KEY);
  Logger.log('Estado limpo');
}

// ============================================
// FUNÇÕES DE TESTE
// ============================================

/**
 * Função de teste para processar um arquivo específico
 */
function testProcessFile() {
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  const files = folder.getFilesByType(MimeType.PDF);
  
  if (files.hasNext()) {
    const file = files.next();
    Logger.log(`Testando processamento de: ${file.getName()}`);
    const success = processFile(file);
    Logger.log(`Resultado: ${success ? 'SUCESSO' : 'FALHA'}`);
  } else {
    Logger.log('Nenhum arquivo PDF encontrado na pasta');
  }
}

/**
 * Função de teste para verificar configuração
 */
function testConfiguration() {
  Logger.log('=== Teste de Configuração ===');
  Logger.log('FOLDER_ID: ' + CONFIG.FOLDER_ID);
  Logger.log('EDGE_FUNCTION_URL: ' + CONFIG.EDGE_FUNCTION_URL);
  Logger.log('IMPORT_SECRET configurado: ' + (CONFIG.IMPORT_SECRET !== 'YOUR_IMPORT_SECRET_HERE'));
  
  try {
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    Logger.log('Pasta encontrada: ' + folder.getName());
    
    const files = folder.getFilesByType(MimeType.PDF);
    let count = 0;
    while (files.hasNext() && count < 5) {
      const file = files.next();
      Logger.log(`  - ${file.getName()} (${file.getSize()} bytes)`);
      count++;
    }
    Logger.log(`Total de PDFs na pasta: ${count}+`);
  } catch (error) {
    Logger.log('ERRO: ' + error.toString());
  }
}
