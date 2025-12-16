import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lock, User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        // Validate passwords match
        if (password !== confirmPassword) {
          toast.error('As senhas não conferem');
          return;
        }

        // Check if user is allowed
        const { data: isAllowed, error: checkError } = await supabase
          .rpc('is_allowed_user', { check_email: email });

        if (checkError) {
          console.error('Error checking allowed user:', checkError);
          toast.error('Erro ao verificar permissão de cadastro');
          return;
        }

        if (!isAllowed) {
          toast.error('E-mail não autorizado para cadastro. Entre em contato com o administrador.');
          return;
        }

        // Sign up new user
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          if (error.message === 'User already registered') {
            toast.error('Usuário já cadastrado. Faça login.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Cadastro realizado! Verifique seu e-mail para confirmar.');
          setIsSignup(false);
        }
      } else {
        // Login existing user
        await login(email, password);
        navigate('/');
      }
    } catch (error) {
      // Error is already handled
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
        toast.error('Erro ao fazer login com Google: ' + error.message);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error('Erro ao fazer login com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isSignup ? 'Cadastro SOI/BPMA' : 'Atividade Operacional SOI/BPMA'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignup 
              ? 'Registrar novo usuário autorizado' 
              : 'Acesso restrito a usuários autorizados'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            {isSignup && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="password"
                    placeholder="Confirmar Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignup ? 'Cadastrando...' : 'Entrando...') 
                : (isSignup ? 'Cadastrar' : 'Entrar')
              }
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-primary hover:text-primary/80"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isSignup ? 'Já tem conta? Fazer login' : 'Cadastrar novo usuário'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground pt-0">
          <p className="w-full">
            Este sistema é de uso exclusivo para membros autorizados do SOI/BPMA.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
