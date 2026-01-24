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

/**
 * Mapeia erros comuns do OAuth/Google ao vincular conta para mensagens em português.
 * Uso: vincular conta Google (Login e Perfil).
 */
export function getOAuthLinkErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Erro ao vincular com Google. Tente novamente.';
  const msg = String((error as any).message || (error as any).error_description || '');
  const code = String((error as any).code || (error as any).error || '').toLowerCase();

  // Erros típicos do Google OAuth / Supabase
  if (msg.includes('redirect_uri_mismatch') || code === 'redirect_uri_mismatch') {
    return 'Redirect URI incorreto no Google. Adicione: https://oiwwptnqaunsyhpkwbrz.supabase.co/auth/v1/callback';
  }
  if (msg.includes('access_denied') || code === 'access_denied') {
    return 'Acesso negado pelo Google. Aceite as permissões para vincular.';
  }
  if (msg.includes('invalid_client') || code === 'invalid_client') {
    return 'Client ID ou Secret inválidos. Verifique Supabase → Auth → Providers → Google.';
  }
  if (msg.includes('invalid_grant') || code === 'invalid_grant') {
    return 'Sessão expirada ou recusada. Tente vincular novamente.';
  }
  if (msg.includes('Provider not enabled') || msg.includes('provider not enabled')) {
    return 'Provedor Google não habilitado. Ative em Supabase → Auth → Providers → Google.';
  }
  if (msg.includes('redirect') && msg.includes('not allowed') || msg.includes('Redirect URL')) {
    return 'URL de redirecionamento não permitida. Adicione em Supabase → Auth → URL Configuration → Redirect URLs.';
  }
  if (msg) return `Erro ao vincular com Google: ${msg}`;
  return 'Erro ao vincular com Google. Verifique o console (F12) e a configuração do OAuth.';
}

