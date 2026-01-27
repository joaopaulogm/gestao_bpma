import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User, KeyRound, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff, FileText, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError as _handleSupabaseError } from '@/utils/errorHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import logoBPMA from '@/assets/logo-bpma.png';

// Interface para usuário retornado das RPCs
interface UserRoleData {
  id: string;
  user_id: string | null;
  efetivo_id: string | null;
  nome: string | null;
  nome_guerra: string | null;
  matricula: string | null;
  cpf: number | null;
  email: string | null;
  post_grad: string | null;
  quadro: string | null;
  lotacao: string | null;
  role: string;
  ativo: boolean | null;
  senha: string | null;
  vinculado_em: string | null;
}

interface PasswordValidation {
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasValidLength: boolean;
}

// Estados do fluxo de login
type LoginStep = 'login' | 'password-change' | 'password-recovery' | 'password-reset';

// Glassmorphism Card Component - FORA do componente para evitar re-render
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`
    relative backdrop-blur-xl bg-white/10 
    border border-white/20 rounded-2xl 
    shadow-[0_8px_32px_rgba(0,0,0,0.3)]
    ${className}
  `}>
    {children}
  </div>
);

// Glass Input Component - FORA do componente para evitar re-render e perda de foco
interface GlassInputProps extends React.ComponentProps<typeof Input> {
  icon: React.ElementType;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const GlassInput = ({ 
  icon: Icon, 
  showPassword, 
  onTogglePassword,
  ...props 
}: GlassInputProps) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#ffcc00] z-10" />
    <Input
      {...props}
      type={props.type === 'password' && showPassword ? 'text' : props.type}
      className={`pl-10 ${onTogglePassword ? 'pr-10' : ''} 
                 bg-black/25 border-white/25
                 !text-white placeholder:text-white/50 caret-[#ffcc00]
                 hover:bg-black/30 hover:border-white/35
                 focus:bg-black/30 focus:border-[#ffcc00]/50 focus:ring-[#ffcc00]/20
                 focus-visible:outline-none focus-visible:bg-black/30 focus-visible:border-[#ffcc00]/50 focus-visible:ring-2 focus-visible:ring-[#ffcc00]/20
                 [&:-webkit-autofill]:![-webkit-text-fill-color:white]
                 [&:-webkit-autofill]:![-webkit-box-shadow:0_0_0_1000px_rgba(7,29,73,0.5)_inset]
                 transition-colors rounded-lg h-11`}
    />
    {onTogglePassword && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-[#ffcc00] transition-colors z-10"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    )}
  </div>
);

const Login = () => {
  // Estado para login
  const [matricula, setMatricula] = useState('');
  const [cpf, setCpf] = useState('');
  
  // Estado para login com senha (pós primeiro acesso)
  const [senhaLogin, setSenhaLogin] = useState('');
  
  // Estado para alteração de senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estado para mostrar/ocultar senhas
  const [showCpf, setShowCpf] = useState(false);
  const [showSenhaLogin, setShowSenhaLogin] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado geral
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserRoleData | null>(null);
  const [loginStep, setLoginStep] = useState<LoginStep>('login');
  const [activeTab, setActiveTab] = useState<'primeiro-acesso' | 'senha'>('senha');
  
  // Estado para modais
  const [openPolitica, setOpenPolitica] = useState(false);
  const [openTermos, setOpenTermos] = useState(false);
  
  // Estado para recuperação de senha
  const [recoveryMatricula, setRecoveryMatricula] = useState('');
  const [recoveryCpf, setRecoveryCpf] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Garante que o browser tenha sessão Supabase Auth (token "authenticated")
  // Necessário para operações com Storage (upload/remoção de fotos).
  const ensureSupabaseAuthenticated = async (matriculaLimpa: string, senha: string): Promise<boolean> => {
    try {
      // 1) sincroniza/cria o usuário no Supabase Auth com a senha atual (server-side)
      const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-auth-password', {
        body: { matricula: matriculaLimpa, senha },
      });

      if (syncError || !syncData?.success) {
        console.error('Falha ao sincronizar Supabase Auth:', syncError, syncData);
        toast.error('Não foi possível sincronizar o acesso para upload de fotos. Tente novamente.');
        return false;
      }

      // 2) autentica no Supabase Auth para obter JWT
      const supabaseEmail = `${matriculaLimpa.toLowerCase()}@bpma.local`;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: supabaseEmail,
        password: senha,
      });

      if (signInError) {
        console.error('Falha ao autenticar no Supabase Auth:', signInError);
        toast.error('Falha ao autenticar sessão necessária para upload de fotos.');
        return false;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast.error('Sessão de autenticação não foi criada.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('ensureSupabaseAuthenticated error:', err);
      toast.error('Erro ao preparar sessão para upload de fotos.');
      return false;
    }
  };

  // Password validation (6-10 chars, lowercase, uppercase, number, special)
  const validatePassword = (pwd: string): PasswordValidation => ({
    hasLowercase: /[a-z]/.test(pwd),
    hasUppercase: /[A-Z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\/'`~;]/.test(pwd),
    hasValidLength: pwd.length >= 6 && pwd.length <= 10,
  });

  const passwordValidation = validatePassword(newPassword);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/inicio');
    }
  }, [isAuthenticated, navigate]);



  // ==================== PRIMEIRO ACESSO ====================
  // Login = matrícula (números e letra X)
  // Senha = CPF (11 dígitos, apenas números)
  const handlePrimeiroAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aceita números e letra X na matrícula
      const matriculaLimpa = matricula.replace(/[^0-9Xx]/g, '').toUpperCase();
      const cpfLimpo = cpf.replace(/\D/g, '');

      if (!matriculaLimpa) {
        toast.error('Digite sua matrícula (números e letra X se houver)');
        return;
      }

      if (cpfLimpo.length !== 11) {
        toast.error('O CPF deve ter exatamente 11 números');
        return;
      }

      console.log('Verificando primeiro acesso:', { matricula: matriculaLimpa, cpfLength: cpfLimpo.length });

      // Chamar RPC para verificar primeiro acesso
      const { data, error } = await (supabase as any).rpc('verificar_primeiro_acesso', {
        p_matricula: matriculaLimpa,
        p_cpf: cpfLimpo,
      });

      if (error) {
        console.error('Erro RPC verificar_primeiro_acesso:', error);
        toast.error('Erro ao verificar credenciais');
        return;
      }

      const usuario = Array.isArray(data) ? data[0] : data;

      if (!usuario) {
        toast.error('Matrícula ou CPF incorretos. Verifique os dados informados.');
        return;
      }

      if (usuario.ativo === false) {
        toast.error('Usuário desativado. Entre em contato com o administrador.');
        return;
      }

      // Se já tem senha definida (hash bcrypt começa com $2)
      const senhaIsHash = usuario.senha && usuario.senha.startsWith('$2');
      if (senhaIsHash) {
        toast.info('Você já alterou sua senha. Use a aba "Com Senha" para entrar.');
        setActiveTab('senha');
        return;
      }


      // Primeiro acesso - mostrar tela de alteração de senha
      setPendingUser(usuario);
      setLoginStep('password-change');
      toast.success(`Bem-vindo(a), ${usuario.nome_guerra || usuario.nome}! Por favor, crie uma nova senha.`);
    } catch (error: unknown) {
      console.error('Primeiro acesso error:', error);
      toast.error('Erro ao processar primeiro acesso');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== LOGIN COM SENHA (pós primeiro acesso) ====================
  const handleLoginComSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aceita números e letra X na matrícula
      const matriculaLimpa = matricula.replace(/[^0-9Xx]/g, '').toUpperCase();

      if (!matriculaLimpa || !senhaLogin) {
        toast.error('Preencha matrícula e senha');
        return;
      }

      // Chamar RPC para validar login com senha
      const { data, error } = await (supabase as any).rpc('validar_login_senha', {
        p_matricula: matriculaLimpa,
        p_senha: senhaLogin,
      });

      if (error) {
        console.error('Erro RPC validar_login_senha:', error);
        toast.error('Erro ao validar credenciais');
        return;
      }

      const usuario = Array.isArray(data) ? data[0] : data;

      if (!usuario) {
        toast.error('Matrícula ou senha incorretos');
        return;
      }

      if (usuario.ativo === false) {
        toast.error('Usuário desativado. Entre em contato com o administrador.');
        return;
      }

      // Login válido - é OBRIGATÓRIO criar sessão Supabase Auth para upload de fotos
      const ok = await ensureSupabaseAuthenticated(matriculaLimpa, senhaLogin);
      if (!ok) return;

      // Salvar dados extras na sessão local (para informações não disponíveis no Supabase Auth)
      const userData = {
        id: usuario.id,
        nome: usuario.nome,
        nome_guerra: usuario.nome_guerra,
        matricula: usuario.matricula,
        email: usuario.email,
        role: usuario.role,
      };
      localStorage.setItem('bpma_auth_user', JSON.stringify(userData));
      
      // Disparar evento para AuthContext reagir imediatamente
      window.dispatchEvent(new CustomEvent('bpma_local_auth_changed', { detail: userData }));
      
      toast.success(`Bem-vindo(a), ${usuario.nome_guerra || usuario.nome}!`);
      
      // Redirecionar para página inicial
      setTimeout(() => {
        navigate('/inicio');
      }, 100);
    } catch (error: unknown) {
      console.error('Login com senha error:', error);
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== ALTERAR SENHA ====================
  const handlePasswordChange = async () => {
    if (!pendingUser) return;
    
    if (!isPasswordValid) {
      toast.error('A senha não atende aos requisitos');
      return;
    }
    if (!passwordsMatch) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      // Salvar nova senha com hash bcrypt
      const { data, error } = await (supabase as any).rpc('atualizar_senha_user_roles', {
        p_user_role_id: pendingUser.id,
        p_nova_senha: newPassword,
      });

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        toast.error('Erro ao salvar nova senha');
        return;
      }

      toast.success('Senha alterada com sucesso!');
      
      // Sincroniza Supabase Auth com a nova senha (para manter upload funcionando)
      if (pendingUser) {
        const matriculaLimpa = (pendingUser.matricula || '').replace(/[^0-9Xx]/g, '').toUpperCase();
        const ok = await ensureSupabaseAuthenticated(matriculaLimpa, newPassword);
        if (!ok) return;

        // Salvar dados extras na sessão local
        const userData = {
          id: pendingUser.id,
          nome: pendingUser.nome,
          nome_guerra: pendingUser.nome_guerra,
          matricula: pendingUser.matricula,
          email: pendingUser.email,
          role: pendingUser.role
        };
        localStorage.setItem('bpma_auth_user', JSON.stringify(userData));
        
        // Disparar evento para AuthContext reagir imediatamente
        window.dispatchEvent(new CustomEvent('bpma_local_auth_changed', { detail: userData }));
      }
      
      // Redirecionar para página inicial
      setTimeout(() => {
        navigate('/inicio');
      }, 100);
    } catch (error: unknown) {
      console.error('Password change error:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };



  // ==================== RESET ====================
  const resetToLogin = () => {
    setLoginStep('login');
    setPendingUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setCpf('');
    setSenhaLogin('');
    setRecoveryMatricula('');
    setRecoveryCpf('');
    setResetToken('');
    setResetNewPassword('');
    setResetConfirmPassword('');
  };

  // ==================== RECUPERAÇÃO DE SENHA ====================
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const matriculaLimpa = recoveryMatricula.replace(/[^0-9Xx]/g, '').toUpperCase();
      const cpfLimpo = recoveryCpf.replace(/\D/g, '');

      if (!matriculaLimpa) {
        toast.error('Digite sua matrícula');
        return;
      }

      if (cpfLimpo.length !== 11) {
        toast.error('O CPF deve ter exatamente 11 números');
        return;
      }

      const { data, error } = await (supabase as any).rpc('solicitar_recuperacao_senha', {
        p_matricula: matriculaLimpa,
        p_cpf: cpfLimpo,
      });

      if (error) {
        console.error('Erro RPC recuperação:', error);
        toast.error('Erro ao processar recuperação');
        return;
      }

      const resultado = Array.isArray(data) ? data[0] : data;

      if (!resultado?.sucesso) {
        toast.error(resultado?.mensagem || 'Matrícula ou CPF não encontrados');
        return;
      }

      // Token gerado com sucesso
      setResetToken(resultado.mensagem); // O token vem no campo mensagem
      setPendingUser({
        id: resultado.user_role_id,
        nome: resultado.nome,
        email: resultado.email,
      } as any);
      setLoginStep('password-reset');
      toast.success(`Verificação concluída, ${resultado.nome}! Crie sua nova senha.`);
    } catch (error) {
      console.error('Password recovery error:', error);
      toast.error('Erro ao recuperar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const resetValidation = validatePassword(resetNewPassword);
    const isResetPasswordValid = Object.values(resetValidation).every(Boolean);
    const resetPasswordsMatch = resetNewPassword === resetConfirmPassword && resetConfirmPassword.length > 0;

    if (!isResetPasswordValid) {
      toast.error('A senha não atende aos requisitos');
      return;
    }
    if (!resetPasswordsMatch) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await (supabase as any).rpc('redefinir_senha_com_token', {
        p_token: resetToken,
        p_nova_senha: resetNewPassword,
      });

      if (error) {
        console.error('Erro ao redefinir senha:', error);
        toast.error('Erro ao redefinir senha');
        return;
      }

      const resultado = Array.isArray(data) ? data[0] : data;

      if (!resultado?.sucesso) {
        toast.error(resultado?.mensagem || 'Token inválido ou expirado');
        return;
      }

      // Mantém Supabase Auth sincronizado com a senha redefinida (evita voltar a ficar anon)
      const matriculaLimpa = recoveryMatricula.replace(/[^0-9Xx]/g, '').toUpperCase();
      if (matriculaLimpa) {
        const ok = await ensureSupabaseAuthenticated(matriculaLimpa, resetNewPassword);
        if (!ok) {
          // Não bloqueia o fluxo (usuário ainda pode tentar login), mas avisa.
          toast.info('Senha redefinida, mas o acesso para upload de fotos pode não ter sido sincronizado.');
        }
      }

      toast.success('Senha redefinida com sucesso! Faça login com sua nova senha.');
      resetToLogin();
      setActiveTab('senha');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== COMPONENTES ====================
  const ValidationRule = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {valid ? (
        <CheckCircle2 className="h-3 w-3 text-green-400" />
      ) : (
        <XCircle className="h-3 w-3 text-white/40" />
      )}
      <span className={valid ? 'text-green-400' : 'text-white/60'}>{text}</span>
    </div>
  );

  // ==================== TELA: ALTERAR SENHA ====================
  if (loginStep === 'password-change' && pendingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
           style={{ background: 'linear-gradient(135deg, #071d49 0%, #0a2a5e 50%, #071d49 100%)' }}>
        <GlassCard className="w-full max-w-md p-6 sm:p-8">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffcc00]/30 to-[#ffcc00]/10 
                            border-2 border-[#ffcc00]/50 flex items-center justify-center">
              <KeyRound className="h-10 w-10 text-[#ffcc00]" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
            Criar Nova Senha
          </h2>
          <p className="text-white/70 text-center text-sm mb-6">
            Olá, <span className="text-[#ffcc00] font-semibold">{pendingUser.nome_guerra || pendingUser.nome}</span>!
          </p>

          {/* Alert */}
          <div className="bg-[#ffcc00]/10 border border-[#ffcc00]/30 rounded-lg p-3 mb-6 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-[#ffcc00] mt-0.5 shrink-0" />
              <p className="text-[#ffcc00]/90">
                Este é seu primeiro acesso. Crie uma senha segura seguindo as regras abaixo.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Nova Senha</Label>
              <GlassInput
                icon={Lock}
                type="password"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                maxLength={10}
                showPassword={showNewPassword}
                onTogglePassword={() => setShowNewPassword(!showNewPassword)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Confirmar Senha</Label>
              <GlassInput
                icon={Lock}
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={10}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-400">As senhas não coincidem</p>
              )}
            </div>

            {/* Password Rules */}
            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-white/70 mb-2">Requisitos da senha:</p>
              <ValidationRule valid={passwordValidation.hasValidLength} text="De 6 a 10 caracteres" />
              <ValidationRule valid={passwordValidation.hasLowercase} text="Pelo menos uma letra minúscula" />
              <ValidationRule valid={passwordValidation.hasUppercase} text="Pelo menos uma letra maiúscula" />
              <ValidationRule valid={passwordValidation.hasNumber} text="Pelo menos um número" />
              <ValidationRule valid={passwordValidation.hasSpecial} text="Pelo menos um caractere especial (!@#$%...)" />
            </div>

            <Button
              type="button"
              className="w-full h-11 bg-gradient-to-r from-[#ffcc00] to-[#e6b800] hover:from-[#e6b800] hover:to-[#cc9900] 
                         text-[#071d49] font-semibold rounded-lg shadow-lg shadow-[#ffcc00]/20
                         transition-all duration-300 hover:shadow-[#ffcc00]/40"
              onClick={handlePasswordChange}
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
            >
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
              onClick={resetToLogin}
            >
              Voltar
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }


  // ==================== TELA: RECUPERAÇÃO DE SENHA (Etapa 1 - Verificar identidade) ====================
  if (loginStep === 'password-recovery') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
           style={{ background: 'linear-gradient(135deg, #071d49 0%, #0a2a5e 50%, #071d49 100%)' }}>
        <GlassCard className="w-full max-w-md p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-500/10 
                            border-2 border-orange-500/50 flex items-center justify-center">
              <KeyRound className="h-10 w-10 text-orange-400" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
            Recuperar Senha
          </h2>
          <p className="text-white/70 text-center text-sm mb-6">
            Informe sua matrícula e CPF para verificar sua identidade
          </p>

          <form onSubmit={handlePasswordRecovery} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Matrícula</Label>
              <GlassInput
                icon={User}
                type="text"
                placeholder="Números da matrícula (e X se houver)"
                value={recoveryMatricula}
                onChange={(e) => setRecoveryMatricula(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 text-sm">CPF</Label>
              <GlassInput
                icon={Lock}
                type="text"
                placeholder="11 dígitos do CPF"
                value={recoveryCpf}
                onChange={(e) => setRecoveryCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                maxLength={11}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#ffcc00] to-[#e6b800] hover:from-[#e6b800] hover:to-[#cc9900] 
                         text-[#071d49] font-semibold"
            >
              {isLoading ? 'Verificando...' : 'Verificar Identidade'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
              onClick={resetToLogin}
            >
              Voltar ao Login
            </Button>
          </form>
        </GlassCard>
      </div>
    );
  }

  // ==================== TELA: REDEFINIR SENHA (Etapa 2) ====================
  if (loginStep === 'password-reset') {
    const resetValidation = validatePassword(resetNewPassword);
    const isResetValid = Object.values(resetValidation).every(Boolean);
    const resetMatch = resetNewPassword === resetConfirmPassword && resetConfirmPassword.length > 0;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
           style={{ background: 'linear-gradient(135deg, #071d49 0%, #0a2a5e 50%, #071d49 100%)' }}>
        <GlassCard className="w-full max-w-md p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffcc00]/30 to-[#ffcc00]/10 
                            border-2 border-[#ffcc00]/50 flex items-center justify-center">
              <KeyRound className="h-10 w-10 text-[#ffcc00]" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
            Nova Senha
          </h2>
          <p className="text-white/70 text-center text-sm mb-6">
            Crie uma nova senha segura
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Nova Senha</Label>
              <GlassInput
                icon={Lock}
                type="password"
                placeholder="Digite sua nova senha"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                maxLength={10}
                showPassword={showResetNewPassword}
                onTogglePassword={() => setShowResetNewPassword(!showResetNewPassword)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Confirmar Senha</Label>
              <GlassInput
                icon={Lock}
                type="password"
                placeholder="Confirme sua nova senha"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                maxLength={10}
                showPassword={showResetConfirmPassword}
                onTogglePassword={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
              />
            </div>

            {/* Validação */}
            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <ValidationRule valid={resetValidation.hasValidLength} text="6-10 caracteres" />
              <ValidationRule valid={resetValidation.hasLowercase} text="Letra minúscula" />
              <ValidationRule valid={resetValidation.hasUppercase} text="Letra maiúscula" />
              <ValidationRule valid={resetValidation.hasNumber} text="Número" />
              <ValidationRule valid={resetValidation.hasSpecial} text="Caractere especial" />
              <ValidationRule valid={resetMatch} text="Senhas coincidem" />
            </div>

            <Button
              type="button"
              disabled={isLoading || !isResetValid || !resetMatch}
              onClick={handlePasswordReset}
              className="w-full h-11 bg-gradient-to-r from-[#ffcc00] to-[#e6b800] hover:from-[#e6b800] hover:to-[#cc9900] 
                         text-[#071d49] font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Redefinir Senha'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
              onClick={resetToLogin}
            >
              Cancelar
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ==================== TELA PRINCIPAL DE LOGIN ====================
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
         style={{ background: 'linear-gradient(135deg, #071d49 0%, #0a2a5e 50%, #071d49 100%)' }}>
      <GlassCard className="w-full max-w-md p-6 sm:p-8">
        {/* Logo/Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffcc00]/20 to-[#ffcc00]/5 
                          border-2 border-[#ffcc00]/40 flex items-center justify-center p-2
                          shadow-[0_0_30px_rgba(255,204,0,0.2)]">
            <img src={logoBPMA} alt="BPMA" className="w-16 h-16 object-contain" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">
          Gestão BPMA
        </h1>
        <p className="text-white/60 text-center text-sm mb-6">
          Sistema de Gestão do Batalhão de Polícia Militar Ambiental
        </p>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-5 bg-white/10 border border-white/10 rounded-lg p-1">
            <TabsTrigger 
              value="primeiro-acesso" 
              className="text-xs sm:text-sm text-white/70 data-[state=active]:bg-[#ffcc00] data-[state=active]:text-[#071d49] rounded-md"
            >
              1º Acesso
            </TabsTrigger>
            <TabsTrigger 
              value="senha" 
              className="text-xs sm:text-sm text-white/70 data-[state=active]:bg-[#ffcc00] data-[state=active]:text-[#071d49] rounded-md"
            >
              Com Senha
            </TabsTrigger>
          </TabsList>

          {/* ========== PRIMEIRO ACESSO ========== */}
          <TabsContent value="primeiro-acesso">
            <div className="bg-[#ffcc00]/10 border border-[#ffcc00]/30 rounded-lg p-3 mb-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#ffcc00] mt-0.5 shrink-0" />
                <div className="text-[#ffcc00]/90">
                  <p className="font-medium mb-1">Primeiro acesso ao sistema:</p>
                  <p className="text-xs text-[#ffcc00]/70">
                    <strong>Login:</strong> Sua matrícula (números e X se houver)
                  </p>
                  <p className="text-xs mt-1 text-[#ffcc00]/70">
                    <strong>Senha:</strong> Seus 11 números do CPF
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePrimeiroAcesso} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Matrícula</Label>
                <GlassInput
                  icon={User}
                  type="text"
                  inputMode="text"
                  placeholder="Números da matrícula (e X se houver)"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value.replace(/[^0-9Xx]/g, '').toUpperCase())}
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">CPF (11 números)</Label>
                <GlassInput
                  icon={Lock}
                  type="password"
                  inputMode="numeric"
                  placeholder="00000000000"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  required
                  autoComplete="current-password"
                  showPassword={showCpf}
                  onTogglePassword={() => setShowCpf(!showCpf)}
                />
                <p className="text-xs text-white/50">
                  Digite os 11 números do seu CPF (sem pontos ou traços)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-[#ffcc00] to-[#e6b800] hover:from-[#e6b800] hover:to-[#cc9900] 
                           text-[#071d49] font-semibold rounded-lg shadow-lg shadow-[#ffcc00]/20
                           transition-all duration-300 hover:shadow-[#ffcc00]/40"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Verificar Primeiro Acesso'}
              </Button>
            </form>
          </TabsContent>

          {/* ========== LOGIN COM SENHA ========== */}
          <TabsContent value="senha">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <div className="text-green-300">
                  <p className="font-medium mb-1">Já alterou sua senha?</p>
                  <p className="text-xs text-green-300/70">
                    Use sua matrícula e a nova senha que você criou.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleLoginComSenha} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Matrícula</Label>
                <GlassInput
                  icon={User}
                  type="text"
                  inputMode="text"
                  placeholder="Números da matrícula (e X se houver)"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value.replace(/[^0-9Xx]/g, '').toUpperCase())}
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Senha</Label>
                <GlassInput
                  icon={Lock}
                  type="password"
                  placeholder="Sua senha"
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  maxLength={10}
                  required
                  autoComplete="current-password"
                  showPassword={showSenhaLogin}
                  onTogglePassword={() => setShowSenhaLogin(!showSenhaLogin)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-[#ffcc00] to-[#e6b800] hover:from-[#e6b800] hover:to-[#cc9900] 
                           text-[#071d49] font-semibold rounded-lg shadow-lg shadow-[#ffcc00]/20
                           transition-all duration-300 hover:shadow-[#ffcc00]/40"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar com Senha'}
              </Button>

              <button
                type="button"
                onClick={() => setLoginStep('password-recovery')}
                className="w-full text-sm text-white/60 hover:text-[#ffcc00] transition-colors mt-2"
              >
                Esqueci minha senha
              </button>
            </form>
          </TabsContent>
        </Tabs>


        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setOpenPolitica(true)}
              className="text-white/60 hover:text-[#ffcc00] transition-colors cursor-pointer underline-offset-2 hover:underline"
            >
              Política de Privacidade
            </button>
            <span className="text-white/40">•</span>
            <button
              type="button"
              onClick={() => setOpenTermos(true)}
              className="text-white/60 hover:text-[#ffcc00] transition-colors cursor-pointer underline-offset-2 hover:underline"
            >
              Termos de Uso
            </button>
          </div>
          <p className="text-xs text-white/40">© 2025 BPMA - Todos os direitos reservados</p>
        </div>
      </GlassCard>

      {/* Modal Política de Privacidade */}
      <Dialog open={openPolitica} onOpenChange={setOpenPolitica}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <Shield className="h-6 w-6 text-[#ffcc00]" />
              Política de Privacidade
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </DialogHeader>
          <div className="prose prose-sm max-w-none space-y-6 text-foreground mt-4">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Sistema de Gestão do BPMA (Batalhão de Polícia Militar Ambiental) está comprometido com a proteção 
                da privacidade e dos dados pessoais de seus usuários. Esta Política de Privacidade descreve como 
                coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a 
                Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Dados Coletados</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Coletamos os seguintes tipos de dados pessoais:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Dados de Identificação:</strong> Nome completo, nome de guerra, matrícula, posto/graduação.</li>
                <li><strong>Dados de Contato:</strong> E-mail institucional utilizado para autenticação.</li>
                <li><strong>Dados Funcionais:</strong> Lotação, equipe, função, escala de serviço.</li>
                <li><strong>Dados de Acesso:</strong> Endereço IP, data e hora de acesso, navegador utilizado.</li>
                <li><strong>Dados Operacionais:</strong> Registros de ocorrências, resgates e atividades de prevenção.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Finalidade da Coleta</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Os dados coletados são utilizados para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Autenticação e controle de acesso ao sistema.</li>
                <li>Registro e acompanhamento de ocorrências ambientais.</li>
                <li>Gestão de escalas, férias, abonos e licenças do efetivo.</li>
                <li>Geração de relatórios estatísticos e dashboards operacionais.</li>
                <li>Melhoria contínua dos serviços prestados.</li>
                <li>Cumprimento de obrigações legais e regulatórias.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Os dados podem ser compartilhados com:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Órgãos da Administração Pública:</strong> Quando necessário para cumprimento de obrigações legais.</li>
                <li><strong>Supabase Inc.:</strong> Provedor de infraestrutura de banco de dados e autenticação.</li>
                <li><strong>Lovable:</strong> Plataforma de hospedagem e desenvolvimento da aplicação.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Não comercializamos ou compartilhamos dados pessoais com terceiros para fins de marketing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Armazenamento e Segurança</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os dados são armazenados em servidores seguros com criptografia em trânsito (HTTPS/TLS) e em repouso. 
                Utilizamos Row Level Security (RLS) para garantir que cada usuário acesse apenas os dados pertinentes 
                à sua função. O acesso aos dados é restrito a usuários autenticados e autorizados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Direitos do Titular</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Em conformidade com a LGPD, você possui os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Acesso:</strong> Solicitar informações sobre seus dados pessoais armazenados.</li>
                <li><strong>Correção:</strong> Solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
                <li><strong>Eliminação:</strong> Solicitar a exclusão de dados pessoais, quando aplicável.</li>
                <li><strong>Portabilidade:</strong> Solicitar a transferência de seus dados para outro serviço.</li>
                <li><strong>Revogação:</strong> Revogar o consentimento a qualquer momento.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os dados pessoais são retidos pelo tempo necessário para cumprimento das finalidades descritas 
                nesta política, respeitando os prazos legais de guarda de documentos públicos e registros operacionais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato com 
                o Encarregado de Dados (DPO) através dos canais oficiais do BPMA.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Esta política pode ser atualizada periodicamente. Recomendamos que você a revise regularmente 
                para se manter informado sobre como protegemos seus dados.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Termos de Uso */}
      <Dialog open={openTermos} onOpenChange={setOpenTermos}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-6 w-6 text-[#ffcc00]" />
              Termos de Uso
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </DialogHeader>
          <div className="prose prose-sm max-w-none space-y-6 text-foreground mt-4">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar o Sistema de Gestão do BPMA, você concorda em cumprir e estar vinculado 
                a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar 
                este sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Sistema de Gestão do BPMA é uma plataforma digital destinada ao gerenciamento de ocorrências 
                ambientais, controle de efetivo, escalas de serviço e atividades operacionais do Batalhão de 
                Polícia Militar Ambiental. O sistema é de uso exclusivo para fins institucionais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Elegibilidade e Acesso</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>O acesso ao sistema é restrito a integrantes do BPMA devidamente cadastrados.</li>
                <li>Cada usuário é responsável por manter a confidencialidade de suas credenciais de acesso.</li>
                <li>O compartilhamento de senhas ou credenciais é estritamente proibido.</li>
                <li>O acesso pode ser revogado a qualquer momento pela administração do sistema.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Regras de Conduta</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Ao utilizar este sistema, você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Inserir informações falsas, imprecisas ou enganosas nos registros.</li>
                <li>Acessar dados ou funcionalidades não autorizadas para seu nível de acesso.</li>
                <li>Tentar contornar ou violar os mecanismos de segurança do sistema.</li>
                <li>Realizar ataques cibernéticos, incluindo DDoS, injeção de código ou phishing.</li>
                <li>Utilizar o sistema para fins não relacionados às atividades do BPMA.</li>
                <li>Copiar, modificar ou distribuir conteúdo do sistema sem autorização.</li>
                <li>Utilizar scripts automatizados, bots ou ferramentas de scraping.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Direitos Autorais e Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo do sistema, incluindo textos, imagens, logotipos, ícones, gráficos, 
                layouts e código-fonte, é protegido por direitos autorais e pertence ao BPMA ou seus 
                licenciadores. A reprodução, distribuição ou modificação não autorizada é proibida.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
                <li>O brasão e símbolos do BPMA são de uso exclusivo institucional.</li>
                <li>Os dados estatísticos gerados podem ser utilizados apenas para fins oficiais.</li>
                <li>Relatórios exportados devem ser tratados como documentos institucionais.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Responsabilidades do Usuário</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Manter suas credenciais de acesso seguras e não compartilhá-las.</li>
                <li>Inserir informações precisas e verídicas em todos os registros.</li>
                <li>Reportar imediatamente qualquer suspeita de uso não autorizado da sua conta.</li>
                <li>Utilizar o sistema de acordo com as normas e regulamentos do BPMA.</li>
                <li>Manter o sigilo das informações operacionais acessadas através do sistema.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                O BPMA não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
                <li>Interrupções temporárias no serviço devido a manutenção ou problemas técnicos.</li>
                <li>Perdas de dados decorrentes de falhas no dispositivo do usuário.</li>
                <li>Danos causados por uso indevido do sistema pelo usuário.</li>
                <li>Ações de terceiros que violem a segurança do sistema.</li>
                <li>Incompatibilidade com navegadores ou dispositivos não suportados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Disponibilidade do Sistema</h2>
              <p className="text-muted-foreground leading-relaxed">
                Embora nos esforcemos para manter o sistema disponível 24/7, não garantimos disponibilidade 
                ininterrupta. O sistema pode ficar indisponível para manutenção programada ou emergencial, 
                atualizações de segurança ou por motivos de força maior.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Penalidades</h2>
              <p className="text-muted-foreground leading-relaxed">
                O descumprimento destes termos pode resultar em:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
                <li>Suspensão temporária do acesso ao sistema.</li>
                <li>Revogação permanente das credenciais de acesso.</li>
                <li>Aplicação de sanções administrativas conforme regulamento interno.</li>
                <li>Responsabilização civil e criminal, quando aplicável.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Modificações nos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                Alterações significativas serão comunicadas através do próprio sistema. O uso 
                continuado após modificações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Legislação Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos são regidos pelas leis da República Federativa do Brasil. 
                Quaisquer disputas serão resolvidas no foro da Justiça Militar ou Civil, 
                conforme a natureza da questão.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para dúvidas sobre estes Termos de Uso, entre em contato através dos 
                canais oficiais do BPMA.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
