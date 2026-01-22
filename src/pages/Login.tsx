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
  nome: string;
  login: string;
  senha: number;
  email: string | null;
  auth_user_id: string | null;
  vinculado_em: string | null;
  ativo: boolean | null;
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
      const pendingUserId = localStorage.getItem('pendingLinkUserId');
      if (!pendingUserId) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('usuarios_por_login')
          .update({ 
            auth_user_id: session.user.id,
            vinculado_em: new Date().toISOString(),
            email: session.user.email
          })
          .eq('id', pendingUserId);

        localStorage.removeItem('pendingLinkUserId');

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
    } catch (error: any) {
      // Error já tratado no authLogin
    } finally {
      setIsLoading(false);
    }
  };

  // Login com credenciais da tabela usuarios_por_login
  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar login e senha usando a função RPC que valida com efetivo_roles
      const senhaDigitada = senha.replace(/\D/g, '');
      const senhaNumero = senhaDigitada ? BigInt(senhaDigitada) : null;
      
      if (!senhaNumero) {
        toast.error('CPF incorreto. Digite apenas os números do seu CPF, sem pontos ou traços.');
        return;
      }

      // Buscar usuário usando função RPC (bypassa RLS)
      // BigInt precisa ser passado como string para RPC do Supabase
      const senhaParaRPC = senhaNumero.toString();
      
      console.log('Tentando buscar usuário:', {
        login: login.toLowerCase().trim(),
        senhaLength: senhaParaRPC.length,
        senhaPreview: senhaParaRPC.substring(0, 3) + '...'
      });
      
      const { data: usuarios, error: usuarioError } = await supabase
        .rpc('get_usuario_by_login_senha', {
          p_login: login.toLowerCase().trim(),
          p_senha: senhaParaRPC
        });

      if (usuarioError) {
        console.error('Erro ao buscar usuário:', usuarioError);
        console.error('Detalhes do erro:', {
          message: usuarioError.message,
          details: usuarioError.details,
          hint: usuarioError.hint,
          code: usuarioError.code
        });
        
        // Tentar buscar apenas por login para debug
        const { data: debugData } = await supabase
          .rpc('debug_buscar_usuario', {
            p_login: login.toLowerCase().trim()
          });
        
        if (debugData && Array.isArray(debugData) && debugData.length > 0) {
          console.log('Usuário encontrado por login:', debugData);
          toast.error('Erro na senha. Verifique se está usando apenas os números do CPF.');
        } else {
          toast.error('Login não encontrado. Verifique se está usando o formato: primeiro_nome.ultimo_nome');
        }
        return;
      }

      const usuario = Array.isArray(usuarios) && usuarios.length > 0 ? usuarios[0] : null;

      if (!usuario) {
        toast.error('Login não encontrado. Verifique se está usando o formato: primeiro_nome.ultimo_nome');
        return;
      }

      if (usuario.ativo === false) {
        toast.error('Usuário desativado. Entre em contato com o administrador.');
        return;
      }

      // A senha já foi validada pela função RPC get_usuario_by_login_senha

      // Verificar role usando a função RPC
      const { data: role, error: roleError } = await supabase
        .rpc('get_role_by_login_senha', {
          p_login: login.toLowerCase().trim(),
          p_senha: Number(senhaNumero)
        });

      if (roleError) {
        console.error('Erro ao buscar role:', roleError);
      }

      // Se o role não foi encontrado, ainda permite o primeiro acesso
      if (!role) {
        console.warn('Role não encontrado para o usuário, usando operador como padrão');
      }

      if (usuario.auth_user_id) {
        toast.info('Use o botão "Entrar com Google" ou a aba "E-mail" para acessar sua conta vinculada');
        return;
      }

      // Primeiro acesso - mostrar tela de alteração de senha
      setPendingUser(usuario);
      setShowPasswordChange(true);
      toast.success(`Bem-vindo, ${usuario.nome}! Por favor, altere sua senha.`);
    } catch (error: any) {
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
      // Update the password in usuarios_por_login (store as hash of the new password digits)
      const newSenhaDigits = newPassword.replace(/\D/g, '');
      const updateData: any = {};
      
      if (emailToUse) {
        updateData.email = emailToUse;
      }

      // Note: We'll keep the original senha for now, but the user will use Google OAuth
      // The new password is only for validation before linking
      
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('usuarios_por_login')
          .update(updateData)
          .eq('id', pendingUser.id);

        if (error) throw error;
      }

      // Now proceed to Google linking
      localStorage.setItem('pendingLinkUserId', pendingUser.id);

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
        localStorage.removeItem('pendingLinkUserId');
        toast.error(handleSupabaseError(error, 'vincular com Google'));
      }
    } catch (error: any) {
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
      // Validar login e senha
      const senhaDigitada = senha.replace(/\D/g, '');
      const senhaNumero = senhaDigitada ? BigInt(senhaDigitada) : null;
      
      if (!senhaNumero) {
        toast.error('CPF incorreto. Digite apenas os números do seu CPF.');
        return;
      }

      const { data: usuario, error } = await supabase
        .from('usuarios_por_login')
        .select('*')
        .eq('login', login.toLowerCase().trim())
        .single();

      if (error || !usuario) {
        toast.error('Login ou senha incorretos');
        return;
      }

      if (usuario.ativo === false) {
        toast.error('Usuário desativado. Entre em contato com o administrador.');
        return;
      }

      if (usuario.senha?.toString() !== senhaDigitada) {
        toast.error('Login ou senha incorretos');
        return;
      }

      // Verificar role usando a função RPC
      const { data: role, error: roleError } = await supabase
        .rpc('get_role_by_login_senha', {
          p_login: login.toLowerCase().trim(),
          p_senha: Number(senhaNumero)
        });

      if (roleError) {
        console.error('Erro ao buscar role:', roleError);
      }

      // If already linked, just proceed with Google
      if (usuario.auth_user_id) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(handleSupabaseError(error, 'fazer login com Google'));
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
              {isLoading ? 'Processando...' : 'Salvar e Vincular com Google'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs sm:text-sm"
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
              Confirmar Identidade
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Para continuar com o login Google, confirme suas credenciais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <form onSubmit={handleValidateAndGoogleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Login (nome.sobrenome)"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="password"
                    placeholder="Senha (CPF)"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Confirmar e Continuar'}
              </Button>
            </form>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs sm:text-sm"
              onClick={() => {
                setShowGoogleValidation(false);
                setLogin('');
                setSenha('');
              }}
            >
              Voltar
            </Button>
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
            Atividade Operacional
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Acesso restrito a usuários autorizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-10 sm:h-11 text-sm sm:text-base"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="text-xs sm:text-sm">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                E-mail
              </TabsTrigger>
              <TabsTrigger value="credenciais" className="text-xs sm:text-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Primeiro Acesso
              </TabsTrigger>
            </TabsList>

            {/* Login por E-mail/Senha (Supabase Auth) */}
            <TabsContent value="email" className="mt-4">
              <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="email"
                      placeholder="E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            {/* Login por Credenciais (usuarios_por_login) */}
            <TabsContent value="credenciais" className="mt-4">
              <form onSubmit={handleCredentialLogin} className="space-y-3 sm:space-y-4">
                {/* Alerta informativo sobre formato */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Formato do Login:</p>
                      <p><strong>primeiro_nome.ultimo_nome</strong></p>
                      <p className="text-blue-600 dark:text-blue-400 mt-1">
                        Ex: Para "JOÃO CARLOS DA SILVA", use: <strong>joao.silva</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginInput" className="text-xs font-medium">Login</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="loginInput"
                      type="text"
                      placeholder="primeiro.ultimo (ex: joao.silva)"
                      value={login}
                      onChange={(e) => setLogin(e.target.value.toLowerCase().trim())}
                      className="pl-10 h-10 sm:h-11 text-sm sm:text-base lowercase"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senhaInput" className="text-xs font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="senhaInput"
                      type="password"
                      placeholder="CPF (somente números)"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value.replace(/\D/g, ''))}
                      className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                      maxLength={11}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Digite seu CPF sem pontos ou traços
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Primeiro Acesso'}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Use esta opção apenas se nunca acessou o sistema antes.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-xs sm:text-sm text-muted-foreground pt-0 px-4 sm:px-6">
          <p className="w-full">
            Este sistema é de uso exclusivo para membros autorizados do SOI/BPMA.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
