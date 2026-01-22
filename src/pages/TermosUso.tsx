import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TermosUso: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="content-container">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                Termos de Uso
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose max-w-none p-6 space-y-6 text-foreground">
            
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

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermosUso;
