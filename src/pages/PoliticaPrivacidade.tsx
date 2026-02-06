import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PoliticaPrivacidade: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="content-container">
        <div className="mb-6">
          <Link to="/area-do-operador">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                Política de Privacidade
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose max-w-none p-6 space-y-6 text-foreground">
            
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

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;
