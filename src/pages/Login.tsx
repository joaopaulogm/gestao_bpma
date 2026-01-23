import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lock, User, Mail, KeyRound, CheckCircle2, XCircle, AlertCircle, Shield, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/utils/errorHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

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
type LoginStep = 'login' | 'password-change' | 'google-link-offer';

const Login = () => {
  // Estado para login
  const [matricula, setMatricula] = useState('');
  const [cpf, setCpf] = useState('');
  
  // Estado para login com senha (pós primeiro acesso)
  const [senhaLogin, setSenhaLogin] = useState('');
  
  // Estado para login por email/senha (Supabase Auth)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para alteração de senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estado geral
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserRoleData | null>(null);
  const [loginStep, setLoginStep] = useState<LoginStep>('login');
  const [activeTab, setActiveTab] = useState<'primeiro-acesso' | 'senha' | 'email'>('primeiro-acesso');
  
  const { login: authLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Check if user just linked account via Google OAuth
  React.useEffect(() => {
    const checkPendingLink = async () => {
      const pendingUserRoleId = localStorage.getItem('pendingLinkUserRoleId');
      if (!pendingUserRoleId) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Vincular usando RPC
        const { data, error } = await (supabase as any).rpc('vincular_google_user_roles', {
          p_user_role_id: pendingUserRoleId,
          p_auth_user_id: session.user.id,
          p_email: session.user.email
        });

        localStorage.removeItem('pendingLinkUserRoleId');

        if (error) {
          toast.error('Erro ao vincular conta Google');
          console.error('Link error:', error);
        } else {
          toast.success('Conta Google vinculada com sucesso!');
          navigate('/');
        }
      }
    };

    checkPendingLink();
  }, [navigate]);

  // ==================== PRIMEIRO ACESSO ====================
  // Login = matrícula (apenas números)
  // Senha = CPF (11 dígitos, apenas números)
  const handlePrimeiroAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const matriculaLimpa = matricula.replace(/\D/g, '');
      const cpfLimpo = cpf.replace(/\D/g, '');

      if (!matriculaLimpa) {
        toast.error('Digite sua matrícula (apenas números)');
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

      // Se já tem user_id vinculado (Google)
      if (usuario.user_id) {
        toast.info('Sua conta já está vinculada ao Google. Use o botão "Entrar com Google".');
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
      const matriculaLimpa = matricula.replace(/\D/g, '');

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

      // Se tem user_id, pode fazer login via Supabase Auth
      if (usuario.user_id) {
        // Usuário já vinculado ao Google, redirecionar
        toast.success(`Bem-vindo(a), ${usuario.nome_guerra || usuario.nome}!`);
        // Para login com senha quando já vinculado, precisamos de uma sessão
        // Como não temos a senha do Supabase Auth, oferecemos Google
        toast.info('Use o botão "Entrar com Google" para acessar sua conta vinculada.');
        return;
      }

      // Login com senha válido, mas sem vínculo Google
      // Oferecer vincular Google (opcional)
      setPendingUser(usuario);
      setLoginStep('google-link-offer');
      toast.success(`Bem-vindo(a), ${usuario.nome_guerra || usuario.nome}!`);
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
      
      // Ir para oferta de vínculo Google
      setLoginStep('google-link-offer');
    } catch (error: unknown) {
      console.error('Password change error:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== VINCULAR GOOGLE ====================
  const handleLinkGoogle = async () => {
    if (!pendingUser) return;
    
    setIsGoogleLoading(true);

    try {
      // Salvar ID para vincular após retorno do OAuth
      localStorage.setItem('pendingLinkUserRoleId', pendingUser.id);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        localStorage.removeItem('pendingLinkUserRoleId');
        toast.error(handleSupabaseError(error, 'vincular com Google'));
      }
    } catch (error: unknown) {
      console.error('Google link error:', error);
      toast.error('Erro ao vincular com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSkipGoogleLink = () => {
    toast.success('Login realizado! Você pode vincular sua conta Google a qualquer momento.');
    // Como não temos sessão Supabase Auth, resetar para login
    resetToLogin();
    setActiveTab('senha');
    toast.info('Use a aba "Com Senha" para entrar com sua nova senha.');
  };

  // ==================== LOGIN COM EMAIL (Supabase Auth) ====================
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authLogin(email, password);
      navigate('/');
    } catch (error: unknown) {
      // Error já tratado no authLogin
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== LOGIN DIRETO COM GOOGLE ====================
  const handleDirectGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast.error(handleSupabaseError(error, 'fazer login com Google'));
      }
    } catch (error: unknown) {
      console.error('Google login error:', error);
      toast.error('Erro ao fazer login com Google');
    } finally {
      setIsGoogleLoading(false);
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
  };

  // ==================== COMPONENTES ====================
  const ValidationRule = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {valid ? (
        <CheckCircle2 className="h-3 w-3 text-green-500" />
      ) : (
        <XCircle className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={valid ? 'text-green-600' : 'text-muted-foreground'}>{text}</span>
    </div>
  );

  // ==================== TELA: ALTERAR SENHA ====================
  if (loginStep === 'password-change' && pendingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Criar Nova Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Olá, <span className="font-semibold">{pendingUser.nome_guerra || pendingUser.nome}</span>!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-amber-700 dark:text-amber-400">
                  Este é seu primeiro acesso. Crie uma senha segura seguindo as regras abaixo.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              {/* Password Rules */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos da senha:</p>
                <ValidationRule valid={passwordValidation.hasValidLength} text="De 6 a 10 caracteres" />
                <ValidationRule valid={passwordValidation.hasLowercase} text="Pelo menos uma letra minúscula" />
                <ValidationRule valid={passwordValidation.hasUppercase} text="Pelo menos uma letra maiúscula" />
                <ValidationRule valid={passwordValidation.hasNumber} text="Pelo menos um número" />
                <ValidationRule valid={passwordValidation.hasSpecial} text="Pelo menos um caractere especial (!@#$%...)" />
              </div>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={handlePasswordChange}
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
            >
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={resetToLogin}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== TELA: OFERTA VÍNCULO GOOGLE ====================
  if (loginStep === 'google-link-offer' && pendingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Senha Criada!
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Deseja vincular sua conta Google para facilitar o acesso?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <Link2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-blue-700 dark:text-blue-400">
                  <p className="font-medium mb-1">Vantagens do vínculo Google:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Login mais rápido com um clique</li>
                    <li>Não precisa lembrar a senha</li>
                    <li>Maior segurança com autenticação Google</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleLinkGoogle}
              disabled={isGoogleLoading}
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isGoogleLoading ? 'Conectando...' : 'Vincular Conta Google'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSkipGoogleLink}
            >
              Pular por agora
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Você pode vincular sua conta Google a qualquer momento nas configurações.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== TELA PRINCIPAL DE LOGIN ====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1 text-center pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Gestão BPMA
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sistema de Gestão do Batalhão de Polícia Militar Ambiental
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="primeiro-acesso" className="text-xs sm:text-sm">1º Acesso</TabsTrigger>
              <TabsTrigger value="senha" className="text-xs sm:text-sm">Com Senha</TabsTrigger>
              <TabsTrigger value="email" className="text-xs sm:text-sm">E-mail</TabsTrigger>
            </TabsList>

            {/* ========== PRIMEIRO ACESSO ========== */}
            <TabsContent value="primeiro-acesso">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-blue-700 dark:text-blue-400">
                    <p className="font-medium mb-1">Primeiro acesso ao sistema:</p>
                    <p className="text-xs">
                      <strong>Login:</strong> Sua matrícula (apenas números)
                    </p>
                    <p className="text-xs mt-1">
                      <strong>Senha:</strong> Seus 11 números do CPF
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePrimeiroAcesso} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="matricula"
                      type="text"
                      inputMode="numeric"
                      placeholder="Apenas números da matrícula"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ''))}
                      className="pl-10"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (11 números)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="cpf"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="00000000000"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                      className="pl-10"
                      maxLength={11}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digite os 11 números do seu CPF (sem pontos ou traços)
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verificando...' : 'Verificar Primeiro Acesso'}
                </Button>
              </form>
            </TabsContent>

            {/* ========== LOGIN COM SENHA ========== */}
            <TabsContent value="senha">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div className="text-green-700 dark:text-green-400">
                    <p className="font-medium mb-1">Já alterou sua senha?</p>
                    <p className="text-xs">
                      Use sua matrícula e a nova senha que você criou.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLoginComSenha} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matriculaSenha">Matrícula</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="matriculaSenha"
                      type="text"
                      inputMode="numeric"
                      placeholder="Apenas números da matrícula"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ''))}
                      className="pl-10"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senhaLogin">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="senhaLogin"
                      type="password"
                      placeholder="Sua senha"
                      value={senhaLogin}
                      onChange={(e) => setSenhaLogin(e.target.value)}
                      className="pl-10"
                      maxLength={10}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar com Senha'}
                </Button>
              </form>
            </TabsContent>

            {/* ========== LOGIN COM E-MAIL ========== */}
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar com E-mail'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleDirectGoogleLogin}
            disabled={isGoogleLoading}
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isGoogleLoading ? 'Conectando...' : 'Entrar com Google'}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-3">
            Use Google se já vinculou sua conta anteriormente
          </p>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground px-4 sm:px-6">
          <p>© 2025 BPMA - Todos os direitos reservados</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
