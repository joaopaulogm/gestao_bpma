import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PoliticaCookies: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="content-container">
        <div className="mb-6">
          <Link to="/inicio">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <Cookie className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                Política de Cookies
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose max-w-none p-6 space-y-6 text-foreground">
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. O que são Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. 
                Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente, bem como 
                para fornecer informações aos proprietários do site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Tipos de Cookies Utilizados</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">🔒 Cookies Essenciais (Obrigatórios)</h3>
                  <p className="text-muted-foreground text-sm">
                    São necessários para o funcionamento básico do sistema. Incluem cookies de autenticação 
                    e sessão que permitem manter você conectado de forma segura.
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground text-sm mt-2 space-y-1">
                    <li><code className="bg-muted px-1 rounded">sb-access-token</code> - Token de autenticação Supabase</li>
                    <li><code className="bg-muted px-1 rounded">sb-refresh-token</code> - Token de renovação de sessão</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">⚙️ Cookies de Funcionalidade</h3>
                  <p className="text-muted-foreground text-sm">
                    Permitem que o site lembre suas preferências, como tema (claro/escuro) e configurações de exibição.
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground text-sm mt-2 space-y-1">
                    <li><code className="bg-muted px-1 rounded">theme</code> - Preferência de tema visual</li>
                    <li><code className="bg-muted px-1 rounded">sidebar-state</code> - Estado da barra lateral</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">📊 Cookies de Desempenho</h3>
                  <p className="text-muted-foreground text-sm">
                    Coletam informações sobre como você usa o site, como páginas visitadas e erros encontrados. 
                    Esses dados são usados para melhorar o funcionamento do sistema.
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground text-sm mt-2 space-y-1">
                    <li><code className="bg-muted px-1 rounded">cookie-consent</code> - Registro do seu consentimento</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Cookies de Terceiros</h2>
              <p className="text-muted-foreground leading-relaxed">
                Este sistema pode utilizar serviços de terceiros que definem seus próprios cookies:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
                <li><strong>Supabase:</strong> Para autenticação e gerenciamento de sessão.</li>
                <li><strong>Mapbox/Google Maps:</strong> Para exibição de mapas e geolocalização.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Gerenciamento de Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Você pode gerenciar suas preferências de cookies a qualquer momento:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Pelo Banner de Cookies:</strong> Ao acessar o site pela primeira vez, você pode 
                  aceitar ou recusar cookies não essenciais.
                </li>
                <li>
                  <strong>Pelas Configurações do Navegador:</strong> A maioria dos navegadores permite 
                  bloquear ou excluir cookies. Consulte a documentação do seu navegador para mais informações.
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3 text-sm italic">
                Nota: Desativar cookies essenciais pode impedir o funcionamento adequado do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Tempo de Retenção</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-border rounded-lg overflow-hidden">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-foreground">Tipo</th>
                      <th className="px-4 py-2 text-left font-semibold text-foreground">Duração</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-2 text-muted-foreground">Cookies de Sessão</td>
                      <td className="px-4 py-2 text-muted-foreground">Até fechar o navegador</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-muted-foreground">Cookies de Autenticação</td>
                      <td className="px-4 py-2 text-muted-foreground">7 dias (renovável)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-muted-foreground">Cookies de Preferências</td>
                      <td className="px-4 py-2 text-muted-foreground">1 ano</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para dúvidas sobre o uso de cookies, entre em contato através dos canais oficiais do BPMA.
              </p>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PoliticaCookies;
