import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  Briefcase
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
  const [buscandoCep, setBuscandoCep] = useState(false);
  
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
    if (user?.id) {
      fetchPerfil();
    }
  }, [user?.id]);

  const fetchPerfil = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('buscar_perfil_usuario', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const perfilData = data[0] as PerfilData;
        setPerfil(perfilData);
        
        // Preencher campos editáveis
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
    // Formatar CEP: 12345-678
    const cepLimpo = value.replace(/\D/g, '');
    let cepFormatado = cepLimpo;
    if (cepLimpo.length > 5) {
      cepFormatado = `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`;
    }
    setCep(cepFormatado);
    
    // Buscar automaticamente quando completo
    if (cepLimpo.length === 8) {
      buscarCep(cepLimpo);
    }
  };

  const handleSave = async () => {
    if (!perfil?.id) {
      toast.error('Perfil não encontrado');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('atualizar_perfil_usuario', {
        p_user_role_id: perfil.id,
        p_nome: nome || null,
        p_telefone: telefone || null,
        p_email: email || null,
        p_cep: cep.replace(/\D/g, '') || null,
        p_logradouro: logradouro || null,
        p_numero: numero || null,
        p_complemento: complemento || null,
        p_bairro: bairro || null,
        p_cidade: cidade || null,
        p_uf: uf || null
      });

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

  // Campos somente leitura (não editáveis)
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

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground">Visualize e edite seus dados pessoais</p>
        </div>
        <Badge variant={perfil.ativo ? 'default' : 'destructive'}>
          {perfil.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* Nível de Acesso */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Nível de Acesso</p>
              <p className="text-lg font-semibold text-primary">
                {ROLE_LABELS[perfil.role || ''] || perfil.role || 'Operador'}
              </p>
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
