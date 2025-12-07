// Procedimento Operacional Padrão - Dados estruturados

export const roteiroGeral = {
  titulo: "Roteiro geral que vale para qualquer ocorrência ambiental",
  secoes: [
    {
      titulo: "Chegada ao local",
      itens: [
        "1.1. Garantir segurança da guarnição e de terceiros.",
        "1.2. Estacionar a viatura em posição segura.",
        "1.3. Identificar quem é o solicitante e o responsável pelo local."
      ]
    },
    {
      titulo: "Reconhecimento inicial",
      itens: [
        "2.1. Identificar rapidamente: é fauna, flora, poluição, construção, documento, tudo junto.",
        "2.2. Avaliar se existe risco imediato à vida ou à integridade física.",
        "2.3. Se houver risco grave imediato, acionar CBMDF, Defesa Civil, Samu, PCDF, IBRAM conforme o caso."
      ]
    },
    {
      titulo: "Preservar o cenário",
      itens: [
        "3.1. Evitar que pessoas mexam em animais, madeira, resíduos, documentos, obras etc.",
        "3.2. Registrar fotos e vídeos do estado inicial, antes de qualquer intervenção."
      ]
    },
    {
      titulo: "Classificar a ocorrência",
      itens: [
        "4.1. Resgate de fauna apenas.",
        "4.2. Crime ambiental em flagrante.",
        "4.3. Situação administrativa e orientativa.",
        "4.4. Ocorrência mista (por exemplo fauna em cativeiro irregular)."
      ]
    },
    {
      titulo: "Decidir: polícia administrativa, polícia judiciária ou ambas",
      itens: [
        "5.1. Crime ambiental: Lei 9.605 de 1998.",
        "5.2. Infração administrativa: Decreto 6.514 de 2008 e normas distritais.",
        "5.3. Em regra o BPMA atua nos dois planos ao mesmo tempo."
      ]
    }
  ]
};

export const faunaPops = {
  aves: {
    titulo: "Resgate de Aves",
    baseOperacional: "Base operacional principal: Manual de Policiamento Ambiental da PMDF (Manejo Policial de Fauna em 7 fases).",
    situacaoTipica: "Ave ferida, dentro de comércio ou residência, presa em fio, dentro de estabelecimento.",
    secoes: [
      {
        titulo: "Avaliação inicial",
        itens: [
          "1.1. Confirmar que realmente precisa de intervenção.",
          "1.2. Identificar se é nativa, exótica ou doméstica, se souber.",
          "1.3. Verificar se há risco de ataque ao público (aves de rapina, grandes psitacídeos)."
        ]
      },
      {
        titulo: "Planejamento da captura",
        itens: [
          "2.1. Definir quem entra no ambiente e quem fica no apoio.",
          "2.2. Separar EPIs: luvas, óculos, máscara, perneiras se for área de campo.",
          "2.3. Escolher equipamentos: puçá, rede, caixa ou gaiola de transporte adequada.",
          "2.4. Definir provável destinação: soltura imediata, CEAPA, CETAS, Zoológico."
        ]
      },
      {
        titulo: "Contenção",
        itens: [
          "3.1. Reduzir estímulos: apagar luz quando possível, fechar portas e janelas.",
          "3.2. Aproximar devagar e usar o puçá para envolver a ave inteira.",
          "3.3. Ao segurar, imobilizar o corpo e as asas, evitando compressão exagerada no tórax.",
          "3.4. Em aves de rapina: segurar primeiro as pernas, controlar garras e depois o bico."
        ]
      },
      {
        titulo: "Acondicionamento",
        itens: [
          "4.1. Colocar a ave em caixa ou gaiola ventilada, de tamanho proporcional.",
          "4.2. Garantir que não haja pontas ou ferragens que possam quebrar asas.",
          "4.3. Fechar bem o recipiente e testar se está travado."
        ]
      },
      {
        titulo: "Registro e identificação",
        itens: [
          "5.1. Registrar fotos da ave, do local e do possível ponto de impacto (vidro, fio, veículo).",
          "5.2. Anotar nome popular e, se possível, nome científico."
        ]
      },
      {
        titulo: "Destinação",
        itens: [
          "6.1. Ave sem lesões aparentes e com voo preservado: soltura imediata em local adequado, longe de vias e vidraças.",
          "6.2. Ave ferida, desorientada ou muito debilitada: encaminhar para CEAPA ou CETAS/IBAMA.",
          "6.3. Em qualquer hipótese de soltura: registrar coordenadas e fotos da soltura no RAP."
        ]
      },
      {
        titulo: "Encerramento",
        itens: [
          "7.1. Preencher RAP com todas as fases do manejo.",
          "7.2. Se o fato decorreu de crime (tiro, captura em cativeiro etc.), seguir também o roteiro de crime contra a fauna."
        ]
      }
    ]
  },
  mamiferos: {
    titulo: "Resgate de Mamíferos",
    baseOperacional: "Base operacional principal: Manual de Policiamento Ambiental da PMDF (Manejo Policial de Fauna em 7 fases).",
    situacaoTipica: "Cachorro do mato em área urbana, quati, raposa, tamanduá, morcego em área interna.",
    secoes: [
      {
        titulo: "Avaliação inicial",
        itens: [
          "1.1. Estimar porte, espécie provável e comportamento (apático, agressivo, normal).",
          "1.2. Identificar se há risco de zoonoses, especialmente em morcegos e carnívoros silvestres.",
          "1.3. Ver se há possibilidade de o animal sair sozinho se o ambiente for esvaziado."
        ]
      },
      {
        titulo: "Planejamento da ação",
        itens: [
          "2.1. Delimitar área segura, afastando curiosos.",
          "2.2. Selecionar EPIs: luvas reforçadas, máscara, óculos, perneiras.",
          "2.3. Equipamentos: cambão para médio e grande porte, puçá e redes para menores, jaulas de contenção.",
          "2.4. Definir destinação: soltura imediata em área de vegetação adequada ou encaminhamento a CEAPA/CETAS."
        ]
      },
      {
        titulo: "Contenção",
        itens: [
          "3.1. Para animais dóceis ou presos em canto: usar puçá ou caixa isca.",
          "3.2. Para animais agressivos ou que tentam morder: usar cambão, ajustando o laço no pescoço ou tronco sem estrangular.",
          "3.3. Evitar contenção manual direta, exceto em filhotes muito pequenos e com técnica adequada."
        ]
      },
      {
        titulo: "Acondicionamento",
        itens: [
          "4.1. Transferir o animal contido para jaula ou caixa de transporte.",
          "4.2. Fixar a porta com cadeado ou sistema de travamento.",
          "4.3. Reduzir estímulo visual (cobrir parcialmente a jaula) para diminuir estresse."
        ]
      },
      {
        titulo: "Registro e identificação",
        itens: [
          "5.1. Fotos do animal, do local e de possíveis danos (porta arrombada, telha quebrada etc.).",
          "5.2. Registro de espécie, sexo possível, idade aproximada (filhote, jovem, adulto)."
        ]
      },
      {
        titulo: "Destinação",
        itens: [
          "6.1. Animal saudável, sem sinais de imprinted e com comportamento típico da espécie: soltura em local de habitat compatível.",
          "6.2. Animal ferido, com fratura, muita magreza ou comportamento alterado: CEAPA ou CETAS.",
          "6.3. Suspeita de zoonoses: seguir protocolos de vigilância de zoonoses definidos com a Secretaria de Saúde."
        ]
      },
      {
        titulo: "Encerramento",
        itens: [
          "7.1. Preencher RAP detalhado.",
          "7.2. Se a presença do animal decorre de cárcere, maus tratos ou outras irregularidades, aplicar também roteiro de crime contra a fauna."
        ]
      }
    ]
  },
  repteis: {
    titulo: "Resgate de Répteis",
    baseOperacional: "Base operacional principal: Manual de Policiamento Ambiental da PMDF (Manejo Policial de Fauna em 7 fases).",
    situacaoTipica: "Serpente em residência, área urbana, dentro de veículo, jacaré em lago ou via.",
    secoes: [
      {
        titulo: "Avaliação inicial",
        itens: [
          "1.1. Ver se é serpente, lagarto, jacaré ou outro réptil.",
          "1.2. Tentar identificar se a serpente é possivelmente peçonhenta, usando conhecimento técnico e, depois, fotos para confirmação.",
          "1.3. Garantir que ninguém tente matar o animal ou mexer."
        ]
      },
      {
        titulo: "Planejamento",
        itens: [
          "2.1. Isolar o cômodo ou a área, mantendo portas fechadas e afastando pessoas.",
          "2.2. EPIs: luvas, perneiras, botas, óculos.",
          "2.3. Equipamentos: gancho para serpentes, pinção, cambão para jacarés e caixas rígidas antifuga.",
          "2.4. Definir destinação: soltura em local adequado ou CETAS/CEAPA se ferido ou muito debilitado."
        ]
      },
      {
        titulo: "Contenção de serpentes",
        itens: [
          "3.1. Nunca usar mão diretamente, ainda que pareça não peçonhenta.",
          "3.2. Posicionar o gancho sob a serpente em 1/3 do corpo, erguendo suavemente.",
          "3.3. Conduzir a serpente ao interior da caixa, mantendo sempre a cabeça direcionada para longe do corpo do policial.",
          "3.4. Pinção apenas quando absolutamente necessário, em trechos musculares sem apertar a ponto de ferir."
        ]
      },
      {
        titulo: "Contenção de jacarés e outros répteis grandes",
        itens: [
          "4.1. Utilizar cambão, cordas, engradados específicos e equipe suficiente.",
          "4.2. Em muitos casos, acionar apoio especializado do CETAS ou Zoológico."
        ]
      },
      {
        titulo: "Acondicionamento",
        itens: [
          "5.1. Caixa plástica rígida ou metálica, com tampa perfurada e sistema de travamento.",
          "5.2. Nunca usar gaiolas de arame para serpentes.",
          "5.3. Conferir se não há frestas por onde possa escapar."
        ]
      },
      {
        titulo: "Destinação",
        itens: [
          "6.1. Espécime saudável: soltura em área com fitofisionomia e corpos d'água compatíveis.",
          "6.2. Ferido ou debilitado: encaminhar para CEAPA, CETAS ou outra instituição.",
          "6.3. Em caso de espécies exóticas invasoras, observar IN IBRAM 21 de 2025, que define regras para uso, manejo e criação de fauna exótica no DF."
        ]
      },
      {
        titulo: "Encerramento",
        itens: [
          "7.1. RAP com fotos, localização, espécie e destino.",
          "7.2. Se houve ataque ou acidente, registrar também informações para vigilância de saúde."
        ]
      }
    ]
  }
};

export const crimesPops = {
  fauna: {
    titulo: "Crime contra a Fauna",
    baseLegal: "Base legal principal: Lei 9.605, arts. 29 a 37, crimes contra a fauna; Lei DF 4.060, maus tratos no DF.",
    situacaoTipica: "Caça, morte, captura, comércio, transporte, cativeiro irregular, maus tratos.",
    secoes: [
      {
        titulo: "Segurança e preservação de prova",
        itens: [
          "1.1. Afastar curiosos e impedir fuga do autor, respeitando segurança.",
          "1.2. Evitar que se mexa em animais mortos ou vivos, gaiolas, armadilhas, armas, munições."
        ]
      },
      {
        titulo: "Verificar flagrante",
        itens: [
          "2.1. Flagrante próprio: autor praticando ou acabando de praticar.",
          "2.2. Flagrante impróprio: perseguição logo após o crime.",
          "2.3. Flagrante presumido: encontrado logo depois com instrumentos, armas, munições, animais ou produtos etc."
        ]
      },
      {
        titulo: "Identificar a conduta",
        itens: [
          "3.1. Matar, perseguir, caçar, apanhar espécimes silvestres sem autorização, art. 29 da Lei 9.605.",
          "3.2. Manter em cativeiro, transportar, comercializar sem licença.",
          "3.3. Maus tratos, art. 32 da Lei 9.605 e Lei DF 4.060."
        ]
      },
      {
        titulo: "Ação imediata",
        itens: [
          "4.1. Apreender os animais, vivos ou mortos.",
          "4.2. Apreender gaiolas, armas, munições, redes, alçapões, veículos usados na prática do crime.",
          "4.3. Fotografar tudo no local."
        ]
      },
      {
        titulo: "Checagem de documentação",
        itens: [
          "5.1. Se o autor alega que é criador, comerciante ou possui licença, exigir: licenças ambientais, autorizações de manejo, cadastro no SISPASS ou SisFauna, notas fiscais etc.",
          "5.2. Se a documentação não bate, presumir irregularidade."
        ]
      },
      {
        titulo: "Procedimento penal",
        itens: [
          "6.1. Para crimes de menor potencial ofensivo, lavrar TCO com base na Lei 9.099.",
          "6.2. Nas hipóteses em que a pena supera 2 anos ou há concurso de crimes, adotar flagrante com condução à delegacia."
        ]
      },
      {
        titulo: "Destinação de fauna apreendida",
        itens: [
          "7.1. Aplicar as mesmas etapas do manejo de fauna (resgate e destinação).",
          "7.2. Em caso de passeriformes, ver POP específico de passeriformes."
        ]
      }
    ],
    subtipos: [
      { id: "caca-ilegal", nome: "Caça ilegal" },
      { id: "cativeiro-irregular", nome: "Cativeiro irregular de animais silvestres" },
      { id: "maus-tratos", nome: "Maus tratos a animais" },
      { id: "comercio-ilegal", nome: "Comércio ilegal de fauna" },
      { id: "passeriformes", nome: "Passeriformes (IBAMA/IBRAM)" }
    ]
  },
  flora: {
    titulo: "Crime contra a Flora",
    baseLegal: "Base legal principal: Lei 9.605, arts. 38 a 53; Lei 12.651, proteção da vegetação nativa; Decreto 5.975, manejo florestal.",
    situacaoTipica: "Corte de árvores, desmatamento, transporte de madeira, carvão ou toras sem documento.",
    secoes: [
      {
        titulo: "Identificação da situação",
        itens: [
          "1.1. Há árvores cortadas, pilhas de tora, lenha, carvão, máquinas em funcionamento.",
          "1.2. Verificar se é área urbana, rural, APP, unidade de conservação ou outro tipo de área protegida."
        ]
      },
      {
        titulo: "Checagem de documentos",
        itens: [
          "2.1. Solicitar ao responsável: licenças ambientais, autorização de supressão de vegetação, DOF ou sistema equivalente para transporte.",
          "2.2. Sem documento: considerar corte ou transporte irregular."
        ]
      },
      {
        titulo: "Avaliação do dano",
        itens: [
          "3.1. Estimar quantidade de árvores, extensão da área e tipo de vegetação.",
          "3.2. Registrar fotos amplas e detalhes de tocos, pilhas de madeira."
        ]
      },
      {
        titulo: "Medidas imediatas",
        itens: [
          "4.1. Interromper a atividade de corte, se ainda em curso.",
          "4.2. Apreender máquinas (motosserras, tratores) e produtos florestais.",
          "4.3. Identificar todos os envolvidos."
        ]
      },
      {
        titulo: "Procedimento penal e administrativo",
        itens: [
          "5.1. Lavrar TCO ou encaminhar para flagrante, conforme gravidade.",
          "5.2. Lavrar auto de infração ambiental com base na Lei 9.605 e Decreto 6.514.",
          "5.3. Comunicar IBRAM para providências de compensação e recuperação ambiental."
        ]
      },
      {
        titulo: "Encerramento",
        itens: [
          "6.1. RAP com croqui da área, fotos e coordenadas.",
          "6.2. Se possível, anexar referência ao Código Florestal e demais normas aplicadas."
        ]
      }
    ],
    subtipos: [
      { id: "supressao-vegetal", nome: "Supressão vegetal sem autorização" },
      { id: "desmatamento-app", nome: "Desmatamento em APP" },
      { id: "transporte-madeira", nome: "Transporte irregular de madeira" },
      { id: "producao-carvao", nome: "Produção ilegal de carvão" },
      { id: "incendio-florestal", nome: "Incêndio florestal" }
    ]
  },
  poluicao: {
    titulo: "Crime de Poluição e Outros Crimes Ambientais",
    baseLegal: "Base: Lei 9.605, art. 54 e seguintes; Decreto-lei 1.413 de 1975, poluição industrial; Lei 12.305 e Decreto 10.936, Política Nacional de Resíduos Sólidos.",
    situacaoTipica: "Lançamento de esgoto sem tratamento, queima de lixo, derramamento de óleo, depósito irregular de resíduos.",
    secoes: [
      {
        titulo: "Avaliação do risco",
        itens: [
          "1.1. Identificar se há perigo imediato à população (fumaça tóxica, risco de explosão, contaminação aguda).",
          "1.2. Se necessário, acionar CBMDF e Defesa Civil."
        ]
      },
      {
        titulo: "Identificação da fonte",
        itens: [
          "2.1. Descobrir quem é o responsável: indústria, condomínio, empresa de transporte, pessoa física.",
          "2.2. Ver se há redes de drenagem, tubulações clandestinas, pontos de lançamento."
        ]
      },
      {
        titulo: "Coleta de evidências",
        itens: [
          "3.1. Fotografar e filmar a poluição em andamento.",
          "3.2. Registrar pontos de lançamento, tipo de resíduo, cor, cheiro, presença de peixes mortos etc.",
          "3.3. Se possível, georreferenciar."
        ]
      },
      {
        titulo: "Verificar cumprimento da PNRS e normas locais",
        itens: [
          "4.1. Empresas geradoras devem ter plano de gerenciamento de resíduos sólidos, coleta seletiva e destinação adequada.",
          "4.2. Ver se há recipientes apropriados ou se está tudo sendo jogado em área indevida."
        ]
      },
      {
        titulo: "Providências administrativas e penais",
        itens: [
          "5.1. Autuar por infração administrativa, se tiver competência, ou comunicar IBRAM para auto de infração.",
          "5.2. Lavrar TCO com base no art. 54 da Lei 9.605, se a conduta se enquadrar em crime de poluição.",
          "5.3. Em casos graves, sugerir perícia ambiental."
        ]
      },
      {
        titulo: "Encerramento",
        itens: [
          "6.1. RAP detalhado com descrição do tipo de poluição, local, responsáveis e medidas adotadas.",
          "6.2. Encaminhar cópia a órgãos ambientais e Ministério Público, quando necessário."
        ]
      }
    ],
    subtipos: [
      { id: "poluicao-hidrica", nome: "Poluição de curso d'água" },
      { id: "poluicao-sonora", nome: "Poluição sonora" },
      { id: "queima-residuos", nome: "Queima irregular de resíduos" },
      { id: "deposito-irregular", nome: "Depósito irregular de resíduos" },
      { id: "derramamento-oleo", nome: "Derramamento de óleo/produtos químicos" }
    ]
  },
  ordenamento: {
    titulo: "Crime contra o Ordenamento Territorial e Patrimônio Cultural",
    baseLegal: "Base: Lei 9.605, arts. 62 a 65.",
    situacaoTipica: "Obra em área protegida, destruição de bem tombado, parcelamento irregular, intervenção em APP com construção.",
    secoes: [
      {
        titulo: "Identificação do bem afetado",
        itens: [
          "1.1. Ver se é área tombada, patrimônio histórico, área de preservação permanente ou unidade de conservação.",
          "1.2. Quando necessário, consultar rapidamente IBRAM ou órgão de cultura para confirmar proteção especial."
        ]
      },
      {
        titulo: "Verificar licenças",
        itens: [
          "2.1. Solicitar alvará de construção, licença ambiental, autorizações específicas.",
          "2.2. Obra em área especial sem licença é forte indício de crime."
        ]
      },
      {
        titulo: "Coleta de evidências",
        itens: [
          "3.1. Fotografar obra, maquinário, placas de obra, placas de empreiteira.",
          "3.2. Registrar estruturas já destruídas (muros, edificações antigas, vegetação de APP)."
        ]
      },
      {
        titulo: "Medidas imediatas",
        itens: [
          "4.1. Interromper atividade, se possível, dentro da legalidade.",
          "4.2. Identificar responsáveis: proprietário, engenheiro, mestre de obras."
        ]
      },
      {
        titulo: "Procedimentos",
        itens: [
          "5.1. Lavrar TCO com enquadramento nos artigos 62 a 65 da Lei 9.605.",
          "5.2. Comunicar DF Legal, IBRAM e órgãos de patrimônio cultural para providências administrativas."
        ]
      },
      {
        titulo: "Encerramento",
        itens: [
          "6.1. RAP com croqui, fotos e descrição minuciosa das intervenções."
        ]
      }
    ],
    subtipos: [
      { id: "construcao-app", nome: "Construção irregular em APP" },
      { id: "parcelamento-solo", nome: "Parcelamento irregular do solo" },
      { id: "dano-patrimonio", nome: "Dano ao patrimônio cultural" },
      { id: "construcao-uc", nome: "Construção em Unidade de Conservação" }
    ]
  },
  administracao: {
    titulo: "Crime contra a Administração Ambiental",
    baseLegal: "Base: Lei 9.605, arts. 66 a 69-A; Lei DF 4.060, por descumprimento de medidas de proteção dos animais.",
    situacaoTipica: "Responsável recusa acesso ao local, nega documentos, apresenta licença falsificada, descumpre ordem de regularização, quebra lacre.",
    secoes: [
      {
        titulo: "Situação inicial",
        itens: [
          "1.1. O BPMA está em fiscalização ambiental regular ou atendimento de denúncia.",
          "1.2. O responsável impede entrada, nega documentos, some com animais ou tenta destruir provas."
        ]
      },
      {
        titulo: "Orientar sobre dever de colaboração",
        itens: [
          "2.1. Informar calmamente que obstar ação fiscalizadora pode configurar crime contra a administração ambiental (Lei 9.605).",
          "2.2. Dar nova chance para que colabore."
        ]
      },
      {
        titulo: "Em persistindo a resistência",
        itens: [
          "3.1. Registrar em áudio, vídeo ou no mínimo no RAP a recusa nominal.",
          "3.2. Se houver mandado ou base legal objetiva para ingresso, seguir protocolo de ingresso em domicílio conforme CPP e CF.",
          "3.3. Se não for possível o ingresso imediato, registrar os fatos e representar à autoridade competente para medidas judiciais."
        ]
      },
      {
        titulo: "Documentos falsos ou adulterados",
        itens: [
          "4.1. Se licença, nota fiscal ou certificado parecerem falsos, reter cópia ou apreender original como prova.",
          "4.2. Registrar as razões da suspeita (rasuras, numeração estranha, dados incompatíveis).",
          "4.3. Lavrar TCO por uso de documento falso, além do crime ambiental correspondente."
        ]
      },
      {
        titulo: "Descumprimento de medidas administrativas",
        itens: [
          "5.1. Se o responsável descumprir ordem de embargo, lacre ou determinação do IBRAM, registrar tudo.",
          "5.2. Aplicar dispositivos da Lei DF 4.060 quando o descumprimento envolver guarda de animais, sanções e perdimento."
        ]
      },
      {
        titulo: "Encerramento",
        itens: [
          "6.1. RAP detalhando a tentativa de fiscalização, a resistência e as medidas adotadas.",
          "6.2. Encaminhar cópia ao órgão ambiental e ao Ministério Público, se cabível."
        ]
      }
    ],
    subtipos: [
      { id: "obstrucao-fiscalizacao", nome: "Obstrução à fiscalização ambiental" },
      { id: "documento-falso", nome: "Documento ambiental falso ou adulterado" },
      { id: "descumprimento-embargo", nome: "Descumprimento de embargo/lacre" },
      { id: "informacao-falsa", nome: "Prestação de informação falsa" }
    ]
  }
};

export const passeriformesPop = {
  titulo: "Passeriformes (IBAMA/IBRAM)",
  baseLegal: "Base legal: IN IBAMA 10 de 2011, criação de passeriformes; IN IBAMA 7 de 2015, empreendimentos de fauna; Portaria IBAMA 117 de 1997, comerciante revendedor; Lei DF 5.758 de 2016, CAPD e passeriformes domesticados; IN IBRAM 163 de 2018, renovação de licença CAPD.",
  situacaoTipica: "Vários pássaros em gaiolas em residência, comércio ou evento.",
  secoes: [
    {
      titulo: "Chegada e preservação",
      itens: [
        "1.1. Ver quantidade de aves, espécies aparentes (canários, trincas, curiós etc.).",
        "1.2. Garantir que ninguém mexa nas gaiolas ou retire anilhas."
      ]
    },
    {
      titulo: "Identificar o tipo de estabelecimento ou pessoa",
      itens: [
        "2.1. Perguntar se é CAPD amador, criador comercial, revenda ou apenas \"apaixonado por pássaros\".",
        "2.2. Perguntar se possui licença do IBRAM ou cadastro SISPASS."
      ]
    },
    {
      titulo: "Exigir documentação imediata - Para CAPD amador",
      itens: [
        "3.1. Licença de CAPD emitida pelo IBRAM, válida (vinculada ao período definido pela Lei 5.758 e pela IN 163).",
        "3.2. Relação de passeriformes atualizada, impressa, sem rasuras, com no máximo 90 dias para transporte.",
        "3.3. Documento pessoal do criador.",
        "3.4. Para aves provenientes de criadores comerciais: nota fiscal original e, se necessário, termo de transferência."
      ]
    },
    {
      titulo: "Exigir documentação imediata - Para criador comercial",
      itens: [
        "3.5. Cadastro no CTF/IBAMA na categoria correta.",
        "3.6. Autorização de uso e manejo AM no SisFauna.",
        "3.7. Projeto técnico aprovado, registro de plantel e livro de movimentação."
      ]
    },
    {
      titulo: "Conferir as aves uma a uma",
      itens: [
        "4.1. Contar a quantidade total e comparar com o limite da licença CAPD.",
        "4.2. Verificar se todas estão anilhadas com anilhas íntegras e compatíveis.",
        "4.3. Conferir se os números de anilha aparecem na relação de passeriformes."
      ]
    },
    {
      titulo: "Classificar a situação",
      itens: [
        "5.1. Regular: Licença válida, relação atualizada, todas as aves anilhadas e declaradas.",
        "5.2. Irregular: Anilhas íntegras, mas ave não consta na relação - pássaro irregular, passível de regularização.",
        "5.3. Ilegal: Ave sem anilha, com anilha violada ou com forte indício de falsificação - pássaro ilegal, sujeito à apreensão e responsabilização por crime ambiental."
      ]
    },
    {
      titulo: "Medidas administrativas e penais - Irregular sanável",
      itens: [
        "6.1. Notificar para regularização, quando a legislação distrital permitir, com base nos artigos de sanções e advertências da Lei 5.758.",
        "6.2. Registrar em RAP e comunicar IBRAM."
      ]
    },
    {
      titulo: "Medidas administrativas e penais - Ilegal ou com fortes indícios de crime",
      itens: [
        "6.3. Apreender aves, gaiolas, documentos e equipamentos.",
        "6.4. Lavrar TCO com base no art. 29 da Lei 9.605, captura ou manutenção irregular de fauna silvestre.",
        "6.5. Se houver maus tratos evidentes, somar art. 32 da Lei 9.605 e Lei DF 4.060."
      ]
    },
    {
      titulo: "Destinação das aves",
      itens: [
        "7.1. Encaminhar para CETAS ou outro local definido pelo IBRAM, conforme normas de destinação.",
        "7.2. Se o IBRAM designar fiel depositário, registrar claramente dados da pessoa e das aves."
      ]
    },
    {
      titulo: "Registros finais",
      itens: [
        "8.1. RAP completo com: número de gaiolas, espécies, quantidade, anilhas, situação documental.",
        "8.2. Citar no histórico as normas aplicáveis: IN IBAMA 10, Portaria 117, Lei 5.758, IN 163, Lei 9.605."
      ]
    }
  ]
};
