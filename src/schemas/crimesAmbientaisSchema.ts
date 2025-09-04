import { z } from 'zod';

export const crimesAmbientaisSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  regiaoAdministrativa: z.string().min(1, "Região Administrativa é obrigatória"),
  latitudeOcorrencia: z.string().optional(),
  longitudeOcorrencia: z.string().optional(),
  tipoCrime: z.string().min(1, "Tipo de Crime é obrigatório"),
  enquadramento: z.string().min(1, "Enquadramento é obrigatório"),
  desfecho: z.string().min(1, "Desfecho é obrigatório"),
  procedimentoLegal: z.string().optional(),
  quantidadeDetidosMaiorIdade: z.number().min(0).max(1000).optional(),
  quantidadeDetidosMenorIdade: z.number().min(0).max(1000).optional(),
  quantidadeLiberadosMaiorIdade: z.number().min(0).max(1000).optional(),
  quantidadeLiberadosMenorIdade: z.number().min(0).max(1000).optional()
}).superRefine((data, ctx) => {
  // Se desfecho é "Flagrante", procedimento legal é obrigatório
  if (data.desfecho === "Flagrante" && !data.procedimentoLegal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Procedimento Legal é obrigatório quando o desfecho é Flagrante",
      path: ["procedimentoLegal"]
    });
  }
});

export type CrimesAmbientaisFormData = z.infer<typeof crimesAmbientaisSchema>;

// Constantes para os selects
export const TIPOS_CRIME = [
  "Crime Contra a Fauna",
  "Crime Contra a Flora", 
  "Crimes de poluição e outros crimes ambientais",
  "Crimes contra o ordenamento urbano e o patrimônio cultural",
  "Crimes contra a administração ambiental"
];

export const ENQUADRAMENTOS = {
  "Crime Contra a Fauna": [
    "Art. 29. Matar, perseguir, caçar, apanhar, utilizar espécimes da fauna silvestre, nativos ou em rota migratória, sem a devida permissão, licença ou autorização da autoridade competente, ou em desacordo com a obtida",
    "Art. 29, I - quem impede a procriação da fauna, sem licença, autorização ou em desacordo com a obtida",
    "Art. 29, II - quem modifica, danifica ou destrói ninho, abrigo ou criadouro natural",
    "Art. 29, III - quem vende, expõe à venda, exporta ou adquire, guarda, tem em cativeiro ou depósito, utiliza ou transporta ovos, larvas ou espécimes da fauna silvestre, nativa ou em rota migratória, bem como produtos e objetos dela oriundos, provenientes de criadouros não autorizados ou sem a devida permissão, licença ou autorização da autoridade competente",
    "Introduzir espécime animal no País sem parecer técnico oficial favorável e licença (Art. 31)",
    "Exportar peles e couros de anfíbios e répteis sem permissão (Art. 32)",
    "Praticar ato de abuso, maus-tratos, ferir ou mutilar animais silvestres, domésticos ou domesticados (Art. 32)",
    "Realizar experiências dolorosas em animal vivo, quando existirem métodos alternativos (Art. 32, §1º-A)",
    "Pescar em período no qual a pesca seja proibida ou em lugares interditados (Art. 34)",
    "Pescar com métodos, aparelhos ou substâncias não permitidos (Art. 34)",
    "Pescar quantidade superior à permitida, espécies proibidas ou abaixo do tamanho mínimo (Art. 35)",
    "Transportar, comercializar, beneficiar ou industrializar produto da pesca proibida (Art. 36)",
    "Pescar com explosivos, substâncias tóxicas ou outros meios de destruição em massa (Art. 37)"
  ],
  "Crime Contra a Flora": [
    "Destruir ou danificar floresta considerada de preservação permanente, mesmo que em formação, sem autorização (Art. 38)",
    "Cortar árvores em floresta de preservação permanente sem permissão (Art. 39)",
    "Causar dano direto ou indireto às Unidades de Conservação (Art. 40)",
    "Cortar ou transformar em carvão madeira de lei sem licença (Art. 45)",
    "Receber, adquirir, transportar, comercializar ou guardar madeira, lenha, carvão ou outros produtos de origem vegetal sem licença (Art. 46)",
    "Vender, expor à venda, ter em depósito ou guardar madeira, lenha, carvão sem licença (Art. 46)",
    "Destruir ou danificar florestas nativas ou plantadas de domínio público (Art. 50)",
    "Impedir ou dificultar regeneração natural de florestas (Art. 50-A)",
    "Fabricar, vender, transportar ou soltar balões que possam provocar incêndios (Art. 42)"
  ],
  "Crimes de poluição e outros crimes ambientais": [
    "Causar poluição de qualquer natureza em níveis que resultem ou possam resultar em danos à saúde humana, mortandade de animais ou destruição significativa da flora (Art. 54)",
    "Causar poluição hídrica que torne necessária a interrupção do abastecimento público de água (Art. 54, §2º)",
    "Lançar resíduos sólidos, líquidos ou gasosos em desacordo com as exigências legais (Art. 54)",
    "Produzir, processar, embalar, importar, exportar, comercializar ou transportar substâncias tóxicas, perigosas ou nocivas em desacordo com a legislação (Art. 56)",
    "Manipular, acondicionar, armazenar ou transportar substância perigosa de forma inadequada (Art. 56)",
    "Executar pesquisa, lavra ou extração de recursos minerais sem autorização ou licença (Art. 55)",
    "Destruir ou danificar vegetação primária ou secundária em estágio avançado de regeneração do Bioma Mata Atlântica (Art. 38-A)"
  ],
  "Crimes contra o ordenamento urbano e o patrimônio cultural": [
    "Destruir, inutilizar ou deteriorar bem especialmente protegido por lei (Art. 62)",
    "Alterar aspecto ou estrutura de edificação protegida sem autorização (Art. 63)",
    "Promover construção em solo não edificável ou no seu entorno protegido (Art. 64)",
    "Pichar, grafitar ou por outro meio conspurcar edificação ou monumento urbano (Art. 65)",
    "Produzir ou comercializar bens especialmente protegidos falsificados (Art. 66)"
  ],
  "Crimes contra a administração ambiental": [
    "Obstar ou dificultar ação fiscalizadora do Poder Público no trato de questões ambientais (Art. 69)",
    "Prestar informações falsas, omitir dados ou fraudar processo de licenciamento ambiental (Art. 69-A)",
    "Deixar de cumprir obrigação de relevante interesse ambiental (Art. 68)",
    "Elaboração ou apresentação de estudo, laudo ou relatório ambiental total ou parcialmente falso ou enganoso (Art. 69-A)"
  ]
};

export const DESFECHOS = [
  "Em Apuração pela PCDF",
  "Em Monitoramento pela PMDF", 
  "Averiguado e Nada Constatado",
  "Resolvido no Local",
  "Flagrante"
];

export const PROCEDIMENTOS_LEGAIS = [
  "TCO-PMDF",
  "TCO-PCDF", 
  "Em Apuração PCDF"
];