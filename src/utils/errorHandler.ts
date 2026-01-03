/**
 * Utilitário para tratamento de erros de conexão e rede
 */

/**
 * Verifica se um erro é relacionado a problemas de conexão/rede
 */
export function isConnectionError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString() || '';
  const errorName = error.name || '';
  
  return (
    errorMessage.includes('Connection failed') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('Network request failed') ||
    errorMessage.includes('ERR_NETWORK') ||
    errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
    errorName === 'AbortError' ||
    errorName === 'NetworkError' ||
    errorName === 'TypeError' && errorMessage.includes('fetch')
  );
}

/**
 * Obtém uma mensagem de erro amigável baseada no tipo de erro
 */
export function getErrorMessage(error: any, defaultMessage?: string): string {
  if (!error) return defaultMessage || 'Ocorreu um erro desconhecido';
  
  // Erros de conexão
  if (isConnectionError(error)) {
    return 'Erro de conexão com o servidor. Verifique sua conexão com a internet e tente novamente.';
  }
  
  // Mensagens específicas do Supabase
  const errorMessage = error.message || error.toString() || '';
  
  if (errorMessage === 'Invalid login credentials') {
    return 'Credenciais inválidas';
  }
  
  if (errorMessage === 'User already registered') {
    return 'Usuário já cadastrado. Faça login.';
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
    return 'A requisição demorou muito para responder. Tente novamente.';
  }
  
  // Retornar mensagem padrão ou a mensagem do erro
  return defaultMessage || errorMessage || 'Ocorreu um erro desconhecido';
}

/**
 * Trata erros do Supabase e retorna uma mensagem amigável
 */
export function handleSupabaseError(error: any, context?: string): string {
  if (!error) return 'Ocorreu um erro desconhecido';
  
  // Erros de conexão
  if (isConnectionError(error)) {
    return 'Erro de conexão com o servidor. Verifique sua conexão com a internet e tente novamente.';
  }
  
  // Códigos de erro específicos do Supabase
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'Nenhum resultado encontrado';
      case 'PGRST200':
        return 'Erro de relacionamento de dados';
      case '42501':
        return 'Você não tem permissão para realizar esta ação';
      case '23505':
        return 'Este registro já existe';
      case '23503':
        return 'Erro de referência: registro relacionado não encontrado';
      default:
        break;
    }
  }
  
  // Mensagens específicas
  const errorMessage = error.message || '';
  
  if (errorMessage === 'Invalid login credentials') {
    return 'Credenciais inválidas';
  }
  
  if (errorMessage === 'User already registered') {
    return 'Usuário já cadastrado. Faça login.';
  }
  
  // Mensagem genérica com contexto se fornecido
  if (context) {
    return `Erro ao ${context}: ${errorMessage || 'Ocorreu um erro desconhecido'}`;
  }
  
  return errorMessage || 'Ocorreu um erro desconhecido';
}

