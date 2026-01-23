import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lock, User, Link2, Mail, KeyRound, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/utils/errorHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

interface UsuarioPorLogin {
  id: string;
  user_id: string | null;
  efetivo_id: string | null;
  nome: string;
  login: string;
  senha: string;
  email: string | null;
  matricula: string | null;
  cpf: number | null;
  role: string;
  ativo: boolean | null;
  nome_guerra: string | null;
  post_grad: string | null;
  quadro: string | null;
  lotacao: string | null;
  data_nascimento: string | null;
  contato: string | null;
  vinculado_em: string | null;
}

interface PasswordValidation {
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasMinLength: boolean;
}

const Login = () => {
  // Estado para login por credenciais (usuarios_por_login)
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estado para login por email/senha (Supabase Auth)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para alteração de senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<UsuarioPorLogin | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showGoogleValidation, setShowGoogleValidation] = useState(false);
  const { login: authLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Password validation
  const validatePassword = (pwd: string): PasswordValidation => ({
    hasLowercase: /[a-z]/.test(pwd),
    hasUppercase: /[A-Z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    hasMinLength: pwd.length >= 8,
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
      const pendingEfetivoId = localStorage.getItem('pendingLinkEfetivoId');
      if (!pendingEfetivoId) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Vincular usando query direta
        const { error } = await supabase
          .from('usuarios_por_login')
          .update({
            auth_user_id: session.user.id,
            email: session.user.email,
            vinculado_em: new Date().toISOString()
          })
          .eq('efetivo_id', pendingEfetivoId);

        localStorage.removeItem('pendingLinkEfetivoId');

        if (error) {
          toast.error('Erro ao vincular conta');
          console.error('Link error:', error);
        } else {
          toast.success('Conta vinculada com sucesso!');
          navigate('/');
        }
      }
    };

    checkPendingLink();
  }, [navigate]);

  // Login com email/senha do Supabase Auth
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

  // Buscar usuário por login e senha usando query direta
  const buscarUsuarioPorLoginSenha = async (loginInput: string, senhaInput: string): Promise<UsuarioPorLogin | null> => {
    const loginLower = loginInput.toLowerCase().trim();
    // Limpar senha: manter zeros à esquerda (CPF tem 11 dígitos)
    const senhaLimpa = senhaInput.replace(/[^0-9]/g, '');
    
    // Buscar primeiro por login
    const query = supabase
      .from('usuarios_por_login')
      .select(`
        id,
        auth_user_id,
        efetivo_id,
        nome,
        login,
        senha,
        email,
        matricula,
        cpf,
        ativo,
        nome_guerra,
        post_grad,
        quadro,
        lotacao,
        data_nascimento,
        contato,
        vinculado_em
      `)
      .eq('ativo', true)
      .or(`login.eq.${loginLower},matricula.eq.${loginLower}`)
      .limit(1);

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const usuario = data[0];
    
    // Verificar senha (CPF ou matrícula)
    // Obs: como a coluna CPF/senha pode estar como bigint no banco, zeros à esquerda podem ter sido perdidos.
    // Para manter a experiência correta (CPF com 11 dígitos), fazemos comparação também com left-pad para 11.
    const senhaDBRaw = (usuario.senha?.toString() || '').replace(/[^0-9]/g, '');
    const cpfDBRaw = (usuario.cpf?.toString() || '').replace(/[^0-9]/g, '');
    const matriculaDB = (usuario.matricula || '').replace(/[^0-9]/g, '');

    const pad11 = (v: string) => (v && v.length < 11 ? v.padStart(11, '0') : v);
    const senhaDB11 = pad11(senhaDBRaw);
    const cpfDB11 = pad11(cpfDBRaw);

    const matches =
      (senhaLimpa && (senhaLimpa === senhaDBRaw || senhaLimpa === senhaDB11)) ||
      (senhaLimpa && (senhaLimpa === cpfDBRaw || senhaLimpa === cpfDB11)) ||
      (senhaLimpa && senhaLimpa === matriculaDB);

    if (!matches) {
      return null; // Senha não confere
    }

    // Buscar role em efetivo_roles
    let role = 'operador';
    if (usuario.efetivo_id) {
      const { data: roleData } = await supabase
        .from('efetivo_roles')
        .select('role')
        .eq('efetivo_id', usuario.efetivo_id)
        .order('role')
        .limit(1);
      
      if (roleData && roleData.length > 0) {
        role = roleData[0].role;
      }
    }

    return {
      id: usuario.id,
      user_id: usuario.auth_user_id,
      efetivo_id: usuario.efetivo_id,
      nome: usuario.nome || '',
      login: usuario.login || '',
      senha: senhaDBRaw,
      email: usuario.email,
      matricula: usuario.matricula,
      cpf: usuario.cpf,
      role: role,
      ativo: usuario.ativo,
      nome_guerra: usuario.nome_guerra,
      post_grad: usuario.post_grad,
      quadro: usuario.quadro,
      lotacao: usuario.lotacao,
      data_nascimento: usuario.data_nascimento,
      contato: usuario.contato,
      vinculado_em: usuario.vinculado_em
    };
  };

  // Login com credenciais da tabela usuarios_por_login
  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const senhaDigitada = senha.replace(/\D/g, '');
      
      if (!senhaDigitada) {
        toast.error('Digite sua senha (CPF ou matrícula, apenas números).');
        return;
      }

      console.log('Tentando buscar usuário:', {
        login: login.toLowerCase().trim(),
        senhaLength: senhaDigitada.length
      });
      
      const usuario = await buscarUsuarioPorLoginSenha(login, senhaDigitada);

      if (!usuario) {
        toast.error('Login ou senha incorretos. Verifique se está usando o formato: primeiro_nome.ultimo_nome');
        return;
      }

      if (usuario.ativo === false) {
        toast.error('Usuário desativado. Entre em contato com o administrador.');
        return;
      }

      // Se já tem user_id vinculado, redirecionar para login com Google
      if (usuario.user_id) {
        toast.info('Use o botão "Entrar com Google" ou a aba "E-mail" para acessar sua conta vinculada');
        return;
      }

      // Primeiro acesso - mostrar tela de alteração de senha
      setPendingUser(usuario);
      setShowPasswordChange(true);
      toast.success(`Bem-vindo, ${usuario.nome}! Por favor, altere sua senha.`);
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change and save
  const handlePasswordChangeSubmit = async () => {
    if (!pendingUser) return;
    if (!isPasswordValid) {
      toast.error('A senha não atende aos requisitos');
      return;
    }
    if (!passwordsMatch) {
      toast.error('As senhas não coincidem');
      return;
    }

    // Check if google email is provided and valid
    const emailToUse = googleEmail.trim();
    if (emailToUse && !emailToUse.endsWith('@gmail.com')) {
      toast.error('Por favor, informe um e-mail do Google (@gmail.com)');
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar email em usuarios_por_login
      if (emailToUse && pendingUser.efetivo_id) {
        const { error } = await supabase
          .from('usuarios_por_login')
          .update({ email: emailToUse })
          .eq('efetivo_id', pendingUser.efetivo_id);

        if (error) throw error;
      }

      // Now proceed to Google linking
      localStorage.setItem('pendingLinkEfetivoId', pendingUser.efetivo_id || pendingUser.id);

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
        localStorage.removeItem('pendingLinkEfetivoId');
        toast.error(handleSupabaseError(error, 'vincular com Google'));
      }
    } catch (error: unknown) {
      console.error('Password change error:', error);
      toast.error('Erro ao processar alteração');
    } finally {
      setIsLoading(false);
    }
  };

  // Google login with validation
  const handleGoogleLoginWithValidation = async () => {
    setShowGoogleValidation(true);
  };

  const handleValidateAndGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const senhaDigitada = senha.replace(/\D/g, '');
      
      if (!senhaDigitada) {
        toast.error('CPF incorreto. Digite apenas os números do seu CPF.');
        return;
      }

      const usuario = await buscarUsuarioPorLoginSenha(login, senhaDigitada);

      if (!usuario) {
        toast.error('Login ou senha incorretos');
        return;
      }

      if (usuario.ativo === false) {
        toast.error('Usuário desativado. Entre em contato com o administrador.');
        return;
      }

      // If already linked, just proceed with Google
      if (usuario.user_id) {
        const { error: googleError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (googleError) {
          toast.error(handleSupabaseError(googleError, 'fazer login com Google'));
        }
        return;
      }

      // First time - need password change
      setPendingUser(usuario);
      setShowGoogleValidation(false);
      setShowPasswordChange(true);
      toast.success(`Bem-vindo, ${usuario.nome}! Por favor, altere sua senha para continuar.`);
    } catch (error: unknown) {
      console.error('Validation error:', error);
      toast.error('Erro ao validar credenciais');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Validation Rule Component
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

  // Password Change Screen
  if (showPasswordChange && pendingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Alterar Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Olá, <span className="font-semibold">{pendingUser.nome}</span>!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-amber-700 dark:text-amber-400">
                  Este é seu primeiro acesso. Por favor, crie uma nova senha seguindo as regras abaixo.
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
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              {/* Password Rules */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos da senha:</p>
                <ValidationRule valid={passwordValidation.hasMinLength} text="Mínimo de 8 caracteres" />
                <ValidationRule valid={passwordValidation.hasLowercase} text="Pelo menos uma letra minúscula" />
                <ValidationRule valid={passwordValidation.hasUppercase} text="Pelo menos uma letra maiúscula" />
                <ValidationRule valid={passwordValidation.hasNumber} text="Pelo menos um número" />
                <ValidationRule valid={passwordValidation.hasSpecial} text="Pelo menos um caractere especial (!@#$%...)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleEmail">E-mail Google (opcional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="googleEmail"
                    type="email"
                    placeholder="seu.email@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Informe caso seu e-mail Google seja diferente do cadastrado
                </p>
              </div>
            </div>

            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2"
              onClick={handlePasswordChangeSubmit}
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setShowPasswordChange(false);
                setPendingUser(null);
                setNewPassword('');
                setConfirmPassword('');
                setGoogleEmail('');
              }}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Google Validation Screen
  if (showGoogleValidation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Link2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Vincular Conta
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Valide suas credenciais para vincular sua conta Google
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleValidateAndGoogleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkLogin">Login</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="linkLogin"
                    type="text"
                    placeholder="primeiro_nome.ultimo_nome"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkSenha">CPF (apenas números)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="linkSenha"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="00000000000"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value.replace(/\D/g, ''))}
                    className="pl-10"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Validando...' : 'Validar e Continuar'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setShowGoogleValidation(false);
                  setSenha('');
                }}
              >
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Login Screen
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
          <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="credentials" className="text-xs sm:text-sm">Primeiro Acesso</TabsTrigger>
              <TabsTrigger value="email" className="text-xs sm:text-sm">E-mail</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials">
              {/* Informativo sobre formato de login */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-blue-700 dark:text-blue-400">
                    <p className="font-medium mb-1">Formato do Login:</p>
                    <p className="text-xs">
                      Use <strong>primeiro_nome.ultimo_nome</strong>
                    </p>
                    <p className="text-xs mt-1">
                      Ex: João Paulo G. Maciel → <code className="bg-blue-500/20 px-1 rounded">joao.maciel</code>
                    </p>
                    <p className="text-xs mt-1">
                      Ou use sua <strong>matrícula</strong> como login.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCredentialLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Login</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="login"
                      type="text"
                      placeholder="primeiro_nome.ultimo_nome"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha (CPF ou Matrícula)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="senha"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Apenas números"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value.replace(/\D/g, ''))}
                      className="pl-10"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digite seu CPF ou matrícula (apenas números, sem pontos ou traços)
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

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
            onClick={handleGoogleLoginWithValidation}
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

          <div className="mt-3">
            <Button
              variant="link"
              className="w-full text-xs text-muted-foreground"
              onClick={handleDirectGoogleLogin}
              disabled={isGoogleLoading}
            >
              Já tenho conta vinculada - Entrar direto com Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground px-4 sm:px-6">
          <p>© 2025 BPMA - Todos os direitos reservados</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
