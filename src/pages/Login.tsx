
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
  const [isSignup, setIsSignup] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
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
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is already handled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-fauna-blue">
            {isSignup ? 'Cadastro SOI/BPMA' : 'Área Restrita SOI/BPMA'}
          </CardTitle>
          <CardDescription>
            {isSignup 
              ? 'Registrar novo usuário autorizado' 
              : 'Acesso restrito a usuários autorizados'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
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
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
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
              className="w-full bg-fauna-blue hover:bg-fauna-blue/90"
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
                className="text-sm text-fauna-blue hover:text-fauna-blue/80"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isSignup ? 'Já tem conta? Fazer login' : 'Cadastrar novo usuário'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-600">
          <p className="w-full">
            Este sistema é de uso exclusivo para membros autorizados do SOI/BPMA.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
