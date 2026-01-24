import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getOAuthLinkErrorMessage } from '@/utils/errorHandler';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Shield, 
  Save,
  Loader2,
  IdCard,
  Calendar,
  Users,
  Briefcase,
  Camera,
  Link2
} from 'lucide-react';

interface PerfilData {
  id: string;
  user_id: string | null;
  efetivo_id: string | null;
  nome: string | null;
  nome_guerra: string | null;
  matricula: string | null;
  cpf: number | null;
  email: string | null;
  data_nascimento: string | null;
  idade: number | null;
  sexo: string | null;
  contato: string | null;
  telefone: string | null;
  post_grad: string | null;
  quadro: string | null;
  lotacao: string | null;
  porte_arma: string | null;
  grupamento: string | null;
  escala: string | null;
  equipe: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  role: string | null;
  ativo: boolean | null;
  foto_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  operador: 'Operador',
  secao_operacional: 'Seção Operacional',
  secao_pessoas: 'Seção de Pessoas',
  secao_logistica: 'Seção de Logística',
};

const Perfil = () => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Campos editáveis
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  useEffect(() => {
    // Se há vínculo Google pendente, não chamar fetchPerfil aqui: checkPendingLink
    // vai rodar a RPC primeiro (para preencher user_id) e depois chama fetchPerfil.
    // Caso contrário a RLS bloqueia o SELECT (user_id ainda null).
    if (localStorage.getItem('pendingLinkUserRoleId')) return;
    fetchPerfil();
  }, [user?.id]);

  const fetchPerfil = async () => {
    setLoading(true);
    try {
      const localAuth = localStorage.getItem('bpma_auth_user');
      const pendingLink = localStorage.getItem('pendingLinkUserRoleId');
      let userId: string | undefined = user?.id;

      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id ?? undefined;
      }
      if (!userId && localAuth) {
        try {
          const localUser = JSON.parse(localAuth);
          userId = localUser.id;
        } catch (e) {
          console.error('Error parsing local auth:', e);
        }
      }

      // user_roles.id: ao voltar do OAuth de vínculo, o id está em pendingLink;
      // com sessão Supabase/Google, user.id é auth.users.id; com login local, user.id é user_roles.id
      let userRoleId: string | null = pendingLink || null;

      if (!userRoleId && userId) {
        const { data: roleRow, error: roleError } = await supabase
          .from('user_roles')
          .select('id')
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .maybeSingle();
        if (roleError) {
          console.error('Erro ao buscar user_role por user_id:', roleError);
        } else if (roleRow?.id) {
          userRoleId = roleRow.id;
        }
      }

      if (!userRoleId) {
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', userRoleId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const perfilData = data as unknown as PerfilData;
        setPerfil(perfilData);

        setNome(perfilData.nome || '');
        setTelefone(perfilData.telefone || perfilData.contato || '');
        setEmail(perfilData.email || '');
        setCep(perfilData.cep || '');
        setLogradouro(perfilData.logradouro || '');
        setNumero(perfilData.numero || '');
        setComplemento(perfilData.complemento || '');
        setBairro(perfilData.bairro || '');
        setCidade(perfilData.cidade || '');
        setUf(perfilData.uf || '');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setLogradouro(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setUf(data.uf || '');
      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    const cepLimpo = value.replace(/\D/g, '');
    let cepFormatado = cepLimpo;
    if (cepLimpo.length > 5) {
      cepFormatado = `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`;
    }
    setCep(cepFormatado);
    
    if (cepLimpo.length === 8) {
      buscarCep(cepLimpo);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !perfil?.id) return;

    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG, WebP ou GIF.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${perfil.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const fotoUrl = urlData.publicUrl;

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ foto_url: fotoUrl })
        .eq('id', perfil.id);

      if (updateError) throw updateError;

      setPerfil({ ...perfil, foto_url: fotoUrl });
      toast.success('Foto de perfil atualizada!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (!perfil?.id) return;
    
    setLinkingGoogle(true);
    try {
      // Salvar ID para vincular após retorno do OAuth
      localStorage.setItem('pendingLinkUserRoleId', perfil.id);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/perfil`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        localStorage.removeItem('pendingLinkUserRoleId');
        toast.error(getOAuthLinkErrorMessage(error));
        console.error('signInWithOAuth (link) error:', error);
      }
    } catch (error) {
      console.error('Google link error:', error);
      toast.error(getOAuthLinkErrorMessage(error));
    } finally {
      setLinkingGoogle(false);
    }
  };

  // Detectar erro na URL ao voltar do OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash ? new URLSearchParams(window.location.hash.replace('#', '?')) : new URLSearchParams();
    const err = params.get('error') || hash.get('error');
    const desc = params.get('error_description') || hash.get('error_description') || '';
    if (err) {
      toast.error(getOAuthLinkErrorMessage({ message: desc || err, error: err }));
      console.error('OAuth return error:', err, desc);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Verificar vínculo Google pendente: rodar a RPC antes de buscar o perfil.
  // A RLS em user_roles exige user_id = auth.uid(); só após a RPC o SELECT é permitido.
  useEffect(() => {
    const checkPendingLink = async () => {
      const pendingUserRoleId = localStorage.getItem('pendingLinkUserRoleId');
      if (!pendingUserRoleId) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await (supabase as any).rpc('vincular_google_user_roles', {
          p_user_role_id: pendingUserRoleId,
          p_auth_user_id: session.user.id,
          p_email: session.user.email
        });

        localStorage.removeItem('pendingLinkUserRoleId');

        if (error) {
          toast.error(getOAuthLinkErrorMessage(error));
          console.error('vincular_google_user_roles error:', error);
          setLoading(false);
        } else {
          toast.success('Conta Google vinculada com sucesso!');
          fetchPerfil();
        }
      } else {
        // Sem sessão após redirect (improvável): remove pendência e tenta fetch (ex.: localAuth)
        localStorage.removeItem('pendingLinkUserRoleId');
        fetchPerfil();
      }
    };

    checkPendingLink();
  }, []);

  const handleSave = async () => {
    if (!perfil?.id) {
      toast.error('Perfil não encontrado');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          nome: nome || null,
          telefone: telefone || null,
          email: email || null,
          cep: cep.replace(/\D/g, '') || null,
          logradouro: logradouro || null,
          numero: numero || null,
          complemento: complemento || null,
          bairro: bairro || null,
          cidade: cidade || null,
          uf: uf || null
        })
        .eq('id', perfil.id);

      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso!');
      fetchPerfil();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Perfil não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = () => {
    if (perfil.nome_guerra) return perfil.nome_guerra.slice(0, 2).toUpperCase();
    if (perfil.nome) return perfil.nome.slice(0, 2).toUpperCase();
    return 'US';
  };

  // Campos somente leitura
  const readOnlyFields = [
    { label: 'Matrícula', value: perfil.matricula, icon: IdCard },
    { label: 'CPF', value: perfil.cpf?.toString().padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'), icon: IdCard },
    { label: 'Nome de Guerra', value: perfil.nome_guerra, icon: User },
    { label: 'Posto/Graduação', value: perfil.post_grad, icon: Shield },
    { label: 'Quadro', value: perfil.quadro, icon: Shield },
    { label: 'Lotação', value: perfil.lotacao, icon: Building2 },
    { label: 'Data de Nascimento', value: perfil.data_nascimento ? new Date(perfil.data_nascimento).toLocaleDateString('pt-BR') : null, icon: Calendar },
    { label: 'Idade', value: perfil.idade?.toString(), icon: Calendar },
    { label: 'Sexo', value: perfil.sexo, icon: User },
    { label: 'Grupamento', value: perfil.grupamento, icon: Building2 },
    { label: 'Escala', value: perfil.escala, icon: Calendar },
    { label: 'Equipe', value: perfil.equipe, icon: Users },
    { label: 'Porte de Arma', value: perfil.porte_arma, icon: Shield },
  ].filter(field => field.value);

  const isGoogleLinked = !!perfil.user_id;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Banner destacado para vincular Google - só aparece se não vinculado */}
      {!isGoogleLinked && (
        <Card className="overflow-hidden border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Ícone Google */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 shrink-0">
                <svg className="h-8 w-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">Vincule sua conta Google</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Recomendado</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Acesse o sistema com apenas um clique e aproveite os benefícios:
                </p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground justify-center sm:justify-start">
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Login rápido com um clique
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Sem precisar lembrar senha
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Maior segurança
                  </li>
                </ul>
              </div>
              
              {/* Botão */}
              <Button
                onClick={handleLinkGoogle}
                disabled={linkingGoogle}
                className="shrink-0 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                {linkingGoogle ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Vincular Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Header com foto */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar com upload */}
            <div className="relative group">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/20">
                <AvatarImage src={perfil.foto_url || undefined} alt="Foto de perfil" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Info do usuário */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {perfil.nome_guerra || perfil.nome || 'Usuário'}
                </h1>
                <Badge variant={perfil.ativo ? 'default' : 'destructive'}>
                  {perfil.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-2">{perfil.post_grad} - {perfil.matricula}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {ROLE_LABELS[perfil.role || ''] || perfil.role || 'Operador'}
                </span>
              </div>
            </div>

            {/* Status de vínculo Google */}
            <div className="shrink-0">
              {isGoogleLinked ? (
                <Badge variant="outline" className="gap-1 border-green-500/30 bg-green-500/10 text-green-600">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google Vinculado
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600">
                  <Link2 className="h-3.5 w-3.5" />
                  Não vinculado
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Editáveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>
            Você pode editar: Nome Completo, Telefone, E-mail e Endereço
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(61) 99999-9999"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Endereço */}
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {buscandoCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Nº"
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apt, Bloco, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                  placeholder="DF"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dados Somente Leitura */}
      {readOnlyFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Dados Funcionais
            </CardTitle>
            <CardDescription>
              Esses dados são gerenciados pela administração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {readOnlyFields.map((field, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <field.icon className="h-3 w-3" />
                    {field.label}
                  </p>
                  <p className="font-medium">{field.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Perfil;
