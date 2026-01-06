import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, MapPin, AlertCircle, Camera, Users, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ManualRAP: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/material-apoio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manual de Confecção de RAP</h1>
            <p className="text-sm text-muted-foreground">Relatório de Atividade Policial - BPMA</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-6 pr-4">
          {/* Introdução */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Introdução
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                O Relatório de Atividade Policial (RAP) constitui instrumento técnico e administrativo indispensável 
                ao registro, à formalização e à padronização das ações desenvolvidas no âmbito do Policiamento 
                Ambiental Ostensivo.
              </p>
              <p>
                Por meio do RAP, são consolidadas as informações referentes às atividades operacionais, preventivas 
                e repressivas, garantindo a rastreabilidade dos atos praticados, a transparência institucional e a 
                segurança jurídica dos policiais militares envolvidos.
              </p>
              <p>
                Este manual tem por finalidade orientar o efetivo do Policiamento Ambiental Ostensivo quanto à 
                correta confecção do Relatório de Atividade Policial, estabelecendo diretrizes, critérios e 
                procedimentos padronizados.
              </p>
            </CardContent>
          </Card>

          <Accordion type="multiple" className="space-y-3">
            {/* 1. Preenchimento de Endereço */}
            <AccordionItem value="endereco" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">1. Preenchimento dos Campos de Endereço</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    Todos os campos obrigatórios de endereço devem ser preenchidos de forma completa e coerente:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                    <li><strong>UF e Cidade:</strong> Selecionar corretamente conforme o local exato da ocorrência.</li>
                    <li><strong>Tipo de Endereço:</strong> Definir se o local é logradouro, área rural, unidade de conservação, lago, parque, reserva, entre outros.</li>
                    <li><strong>Bairro, via, escola ou área:</strong> Informar o nome oficial ou mais conhecido do local.</li>
                    <li><strong>Quadra, número do imóvel e complemento:</strong> Preencher sempre que existentes. Em áreas ambientais, utilizar o complemento para descrever acesso, trilha, margem de lago, setor ou ponto específico.</li>
                    <li><strong>Ponto de referência:</strong> Informar obrigatoriamente um ponto que facilite a identificação do local.</li>
                    <li><strong>CEP:</strong> Preencher quando aplicável.</li>
                    <li><strong>Latitude e longitude:</strong> Sempre que possível, informar as coordenadas geográficas exatas.</li>
                  </ul>
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-amber-600 dark:text-amber-400 font-medium text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      O correto preenchimento do endereço é essencial para a validação do RAP, para fins estatísticos, operacionais e jurídicos.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Tipo de Serviço */}
            <AccordionItem value="tipo-servico" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Badge className="bg-green-500/20 text-green-600 border-0">Tipo</Badge>
                  </div>
                  <span className="font-semibold">2. Tipo de Serviço</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    O campo Tipo de Serviço deve refletir fielmente a unidade ou modalidade de atuação empregada na ocorrência:
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <p className="font-semibold text-foreground">GOC – Grupo de Operações no Cerrado</p>
                      <p className="text-muted-foreground text-xs mt-1">Deve utilizar exclusivamente o Tipo de Serviço: <Badge variant="outline" className="ml-1">GOC</Badge></p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <p className="font-semibold text-foreground">GTA – Grupo Tático Ambiental</p>
                      <p className="text-muted-foreground text-xs mt-1">Deve utilizar exclusivamente o Tipo de Serviço: <Badge variant="outline" className="ml-1">GTA</Badge></p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border md:col-span-2">
                      <p className="font-semibold text-foreground">RP Ambiental e Voluntário</p>
                      <p className="text-muted-foreground text-xs mt-1">Para Resgate de Fauna, usar obrigatoriamente: <Badge variant="outline" className="ml-1">RP Ambiental</Badge></p>
                    </div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-red-600 dark:text-red-400 font-medium text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      A escolha incorreta do Tipo de Serviço compromete a correta identificação da atividade e a consolidação dos dados institucionais.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Tipo Penal ou Natureza */}
            <AccordionItem value="tipo-penal" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FileText className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="font-semibold">3. Tipo Penal ou Natureza da Ocorrência</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="font-semibold text-foreground mb-2">Regra Atual:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Não se registra mais natureza inicial e natureza final.</li>
                      <li>• Deve ser lançado <strong>apenas o Tipo Penal ou Natureza que efetivamente finalizou a ocorrência</strong>.</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Resgate de Fauna:</p>
                    <p className="text-muted-foreground">
                      Nos casos de RP Ambiental para resgate de animais silvestres, usar obrigatoriamente:
                    </p>
                    <Badge className="mt-2 bg-green-500/20 text-green-600 border-0">
                      Tipo Penal: Resgate de Fauna Silvestre
                    </Badge>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Esquema de Preenchimento */}
            <AccordionItem value="esquema" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="font-semibold">4. Esquema de Preenchimento Correto</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ Cadastramento Incorreto</p>
                      <p className="text-muted-foreground text-xs">Lançamento de múltiplas naturezas incluindo hipóteses iniciais.</p>
                      <div className="mt-2 space-y-1">
                        <Badge variant="outline" className="text-xs block w-fit">13.05 – Tráfico de Substância</Badge>
                        <Badge variant="outline" className="text-xs block w-fit">13.26 – Crimes Contra a Fauna</Badge>
                        <Badge variant="outline" className="text-xs block w-fit">19.27 – Prevenção</Badge>
                        <Badge variant="outline" className="text-xs block w-fit">19.30 – Averiguado e Nada Constatado</Badge>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ Cadastramento Correto</p>
                      <p className="text-muted-foreground text-xs">Apenas a natureza que finalizou a ocorrência.</p>
                      <div className="mt-2">
                        <Badge className="bg-green-500/20 text-green-600 border-0 text-xs">19.30 – Averiguado e Nada Constatado</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mt-2">As demais naturezas devem constar no <strong>histórico</strong>.</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="border p-2 text-left">Situação</th>
                          <th className="border p-2 text-left">Local de Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2">Hipóteses iniciais, denúncias ou informações</td>
                          <td className="border p-2 font-medium">Histórico da Ocorrência</td>
                        </tr>
                        <tr>
                          <td className="border p-2">Atividade realizada (averiguação, patrulhamento)</td>
                          <td className="border p-2 font-medium">Histórico da Ocorrência</td>
                        </tr>
                        <tr>
                          <td className="border p-2">Resultado final da ação policial</td>
                          <td className="border p-2 font-medium text-primary">Campo Natureza(s)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Comunicante e Envolvidos */}
            <AccordionItem value="comunicante" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Users className="h-4 w-4 text-cyan-500" />
                  </div>
                  <span className="font-semibold">5. Cadastro de Comunicante e Envolvidos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    É obrigatório o cadastramento do Comunicante e de todas as pessoas envolvidas no campo específico <strong>PESSOAS</strong>:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Comunicante', 'Solicitante', 'Atendido', 'Autor', 'Vítima', 'Testemunha', 'Proprietário', 'Responsável legal'].map(tipo => (
                      <Badge key={tipo} variant="outline" className="text-xs">{tipo}</Badge>
                    ))}
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-amber-600 dark:text-amber-400 font-medium text-xs">
                      ⚠️ Não é permitido substituir o correto cadastramento por descrições genéricas no histórico.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Cadastro do Comunicante:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>• Preencher corretamente os campos obrigatórios disponíveis.</li>
                      <li>• Se não houver CPF/RG, registrar essa condição - não criar dados fictícios.</li>
                      <li>• O campo Relato deve conter a versão apresentada pelo comunicante.</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 6. Imagens */}
            <AccordionItem value="imagens" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/10">
                    <Camera className="h-4 w-4 text-pink-500" />
                  </div>
                  <span className="font-semibold">6. Inclusão de Imagens</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Campo IMAGENS da ocorrência:</p>
                    <p className="text-muted-foreground">Utilizar exclusivamente para:</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground text-xs list-disc list-inside">
                      <li>Locais da ocorrência</li>
                      <li>Objetos apreendidos ou coletados</li>
                      <li>Vestígios e animais resgatados</li>
                      <li>Situações ambientais</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="font-semibold text-red-600 dark:text-red-400 text-xs mb-2">❌ É VEDADA a inclusão de:</p>
                    <ul className="space-y-1 text-red-600 dark:text-red-400 text-xs">
                      <li>• Fotos de pessoas envolvidas</li>
                      <li>• Imagens de documentos pessoais (RG, CPF, CNH)</li>
                      <li>• Qualquer imagem com dados pessoais identificáveis</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="font-semibold text-green-600 dark:text-green-400 text-xs">
                      ✅ Imagens de pessoas e documentos devem ser inseridas na seção PESSOAS.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 7. Objetos Apreendidos */}
            <AccordionItem value="objetos" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="font-semibold">7. Objetos Apreendidos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    Todos os itens apreendidos devem ser cadastrados no campo específico <strong>OBJETOS</strong>:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-xs list-disc list-inside">
                    <li>Registrar cada objeto de forma individual</li>
                    <li>Vincular ao respectivo envolvido (autor, proprietário, etc.)</li>
                    <li>Selecionar a providência adotada (apreendido, recolhido, devolvido)</li>
                    <li>Discriminar corretamente quantidades (unidades, volumes, metros, litros)</li>
                    <li>Evitar descrições genéricas como "diversos objetos"</li>
                  </ul>
                  <Separator />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Descrição do objeto:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>• <strong>Bem apreendido:</strong> identificação precisa</li>
                      <li>• <strong>Uso ilícito:</strong> finalidade ilícita no contexto ambiental</li>
                      <li>• <strong>Item:</strong> marca, modelo, cor, estado de conservação, numeração</li>
                      <li>• <strong>Valor estimado:</strong> aproximado e compatível com mercado</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Considerações Finais */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Considerações Finais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                O correto preenchimento do RAP é responsabilidade funcional de todo policial militar e constitui 
                instrumento essencial para a legitimidade dos atos praticados, a produção de dados confiáveis e 
                a segurança jurídica da atuação institucional.
              </p>
              <p>
                A observância rigorosa das orientações estabelecidas neste manual assegura a padronização dos 
                registros, a adequada classificação das naturezas e tipos penais, bem como a correta vinculação 
                de pessoas, objetos e imagens.
              </p>
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-amber-600 dark:text-amber-400 font-medium text-xs">
                  ⚠️ O descumprimento das diretrizes pode resultar em inconsistências, necessidade de retrabalho, 
                  prejuízos estatísticos e eventuais implicações administrativas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ManualRAP;
