import { rotaDoPacote } from "./rotas-pacotes";

// Apresentação dos pacotes na vitrine e na página pública: capa e textos que não cabem no banco.
// Preço, título, resumo, ordem e contagens vêm sempre de loja_produtos. Tudo aqui foi conferido no README
// e no roteiro da aula de cada pacote (pacotes/<slug>/): nada de benefício que o pacote não entrega.

// mini: 240x160 em WebP (~5 KB), para miniaturas ao lado do nome
export type Capa = { webp: string; png: string; mini: string; alt: string };

export type ItemFluxo = { titulo: string; texto: string };

export type Apresentacao = {
  capaAlt: string;
  // Frase depois do resumo, na página do pacote
  complemento?: string;
  // Explica cada número do bloco "O que você leva e o que ganha"
  inclui?: { agentes?: string; skills?: string; prompts?: string };
  // Resultado prático de cada item, conferido no README do pacote
  ganhos?: { agentes?: string; skills?: string; prompts?: string };
  // Números que não estão em loja_produtos (ex.: quantos times)
  numerosExtras?: { n: number; rotulo: string; texto: string }[];
  times?: { titulo: string; texto: string; nomes: string[] };
  fluxo?: { titulo: string; texto: string; passos: ItemFluxo[]; nota: string };
};

const APRESENTACOES: Record<string, Apresentacao> = {
  "times-de-agentes": {
    capaAlt: "Capa do pacote Kit Empresa IA: um diretor no centro ligado a seis times.",
    complemento: "Um diretor-geral recebe o seu pedido, escolhe o time e cobra a entrega.",
    inclui: {
      agentes: "O diretor-geral e seis times, cada um com líder, dois especialistas e revisor.",
      skills: "Uma autoral, que monta um time novo para qualquer área, e duas gratuitas de código aberto.",
      prompts: "Um por time, um para o diretor-geral e um para criar um time novo.",
    },
    ganhos: {
      agentes: "Você pede em português a um só agente e recebe a entrega já conferida pelo revisor do time.",
      skills: "Quando faltar uma área, como jurídico ou RH, a skill entrevista você e monta o time novo.",
      prompts: "Você começa a usar cada time sem escrever o pedido do zero.",
    },
    numerosExtras: [{ n: 6, rotulo: "times", texto: "Marketing, vendas, financeiro, atendimento, operações e conteúdo." }],
    times: {
      titulo: "Os 6 times",
      texto: "Cada um com líder, dois especialistas e revisor.",
      nomes: ["Marketing", "Vendas", "Financeiro", "Atendimento", "Operações", "Conteúdo"],
    },
    fluxo: {
      titulo: "Como o pedido anda",
      texto: "Você fala com um só agente. Ele organiza o resto.",
      passos: [
        { titulo: "Você pede", texto: "Em português, para o diretor-geral." },
        { titulo: "Diretor escolhe o time", texto: "E cobra a entrega." },
        { titulo: "Líder divide", texto: "Dois especialistas executam." },
        { titulo: "Revisor confere", texto: "Antes de chegar até você." },
      ],
      nota: "Nenhum agente publica, envia, compra ou paga nada sem o seu OK.",
    },
  },
  "design-copy-anuncios": {
    capaAlt: "Capa do pacote Kit Vitrine de Vendas: uma página, um anúncio e um medidor de velocidade.",
  },
  "edicao-de-video": {
    capaAlt: "Capa do pacote Ilha de Edição IA: tela vertical com legenda, tesoura e linha do tempo.",
  },
  "motion-mockup-fontes": {
    capaAlt: "Capa do pacote Kit Cena: notebook com tipografia, celular e trilha de animação.",
  },
  "lancamento-pro": {
    capaAlt: "Capa do pacote Lançamento Pro: página, anúncio, e-mail e balão de atendimento.",
  },
  "programacao-sem-codigo": {
    capaAlt: "Capa do pacote Kit Código Seguro: terminal, bloco de código e sinal de concluído.",
  },
};

// Janela animada do card: mostra o que o kit faz. Sem nota, porcentagem ou número inventado.
export type Demonstracao = {
  resumo: string;
  janela: string;
  pedido: string;
  passos: string[];
  previa: { titulo: string; botao: string; selo: string; extras: [string, string] };
};

// Como cada pacote aparece na página inicial: nome de vitrine, frase curta e rótulo do botão.
// A ordem desta lista é a ordem dos cards (pedido do dono); pacote à venda fora dela vai para o fim
// com o título e o resumo do banco. Textos conferidos no README de cada pacote.
export type VitrineInicial = {
  slug: string;
  demonstracao: Demonstracao;
  nome: string;
  // nome curto: filtros, painel de agentes grátis e lista da Coleção Completa
  curto: string;
  descricao: string;
  botao: string;
  // primeiro card, com a etiqueta "Comece por aqui" e o brilho de destaque
  destaque?: boolean;
  novo?: boolean;
};

export const VITRINE_INICIAL: readonly VitrineInicial[] = [
  {
    slug: "design-copy-anuncios",
    nome: "Kit Vitrine de Vendas",
    curto: "Kit Vitrine de Vendas",
    botao: "Ver o Kit Vitrine de Vendas",
    destaque: true,
    descricao:
      "Peça em português e a IA monta sua página de venda, escreve a oferta, prepara os anúncios e mede a velocidade. Um revisor confere antes de publicar.",
    demonstracao: {
      resumo: "Demonstração: a partir de um pedido em português, a IA monta a página de venda, escreve a oferta, prepara os anúncios, mede a velocidade e o revisor aprova.",
      janela: "Nova página de venda",
      pedido: "Monte a página de venda do meu escritório e prepare os anúncios.",
      passos: ["Página montada", "Oferta escrita", "Anúncios para Facebook e Instagram", "Velocidade medida", "Revisor aprovou"],
      previa: { titulo: "Sua página de venda", botao: "Quero contratar", selo: "Revisado", extras: ["Facebook", "Instagram"] },
    },
  },
  {
    slug: "edicao-de-video",
    nome: "Ilha de Edição IA",
    curto: "Ilha de Edição IA",
    botao: "Ver a Ilha de Edição IA",
    descricao:
      "Peça em português e a IA tira silêncios e erros, coloca legenda e exporta seu vídeo em 1080x1920, no seu computador. Um revisor confere antes da entrega.",
    demonstracao: {
      resumo: "Demonstração: a partir de um pedido em português, a IA corta silêncios e erros, coloca a legenda, exporta para Reels e o revisor aprova.",
      janela: "Novo vídeo",
      pedido: "Corte as pausas, coloque legenda e deixe pronto para o Reels.",
      passos: ["Silêncios e erros cortados", "Legenda colocada", "Exportado em 1080x1920", "Revisor aprovou"],
      previa: { titulo: "Seu vídeo", botao: "Pronto para postar", selo: "Revisado", extras: ["Reels", "Shorts"] },
    },
  },
  {
    slug: "motion-mockup-fontes",
    nome: "Kit Cena",
    curto: "Kit Cena",
    botao: "Ver o Kit Cena",
    descricao:
      "Peça em português e a IA coloca seu site num notebook, seu app num celular e cria animações e pares de fontes, no seu computador, sem programa de design.",
    demonstracao: {
      resumo: "Demonstração: a partir de um pedido em português, a IA gera o mockup no notebook, o app no celular, o post do feed e escolhe as fontes, e o revisor aprova.",
      janela: "Nova imagem",
      pedido: "Coloque o print do meu site num notebook e monte o post para o feed.",
      passos: ["Site no notebook", "App no celular", "Post para o feed", "Fontes escolhidas", "Revisor aprovou"],
      previa: { titulo: "Seu mockup", botao: "Exportar imagem", selo: "Revisado", extras: ["Notebook", "Celular"] },
    },
  },
  {
    slug: "programacao-sem-codigo",
    nome: "Kit Código Seguro",
    curto: "Kit Código Seguro",
    botao: "Ver o Kit Código Seguro",
    descricao:
      "Do pedido em português ao projeto no ar: entrevista, plano simples, teste como cliente e revisão de segurança. Nada é apagado ou publicado sem o seu sim.",
    demonstracao: {
      resumo: "Demonstração: a partir de um pedido em português, a IA entrevista, faz o plano, constrói por etapas, testa como cliente, revisa a segurança e espera o seu sim.",
      janela: "Novo projeto",
      pedido: "Crie um sistema simples de agendamento para o meu escritório.",
      passos: ["Plano em linguagem simples", "Uma etapa por vez", "Teste como cliente", "Segurança revisada", "Aguardando o seu sim"],
      previa: { titulo: "Seu projeto", botao: "Publicar", selo: "Falta seu sim", extras: ["Plano", "Testes"] },
    },
  },
  {
    slug: "times-de-agentes",
    nome: "Kit Empresa IA",
    curto: "Kit Empresa IA",
    botao: "Ver o Kit Empresa IA",
    novo: true,
    descricao:
      "Um diretor-geral recebe o seu pedido em português, escolhe o time certo e cobra a entrega. Seis áreas da empresa, cada uma com líder, especialistas e revisor.",
    demonstracao: {
      resumo: "Demonstração: o diretor-geral recebe o pedido em português e escolhe o time, o líder divide o trabalho, os especialistas executam e o revisor confere.",
      janela: "Novo pedido",
      pedido: "Prepare a campanha de vendas deste mês.",
      passos: ["Diretor escolheu o time", "Líder dividiu o trabalho", "Especialistas executaram", "Revisor conferiu"],
      previa: { titulo: "Sua entrega", botao: "Ver a entrega", selo: "Revisado", extras: ["Marketing", "Vendas"] },
    },
  },
];

export function vitrineInicial(slug: string): VitrineInicial | null {
  return VITRINE_INICIAL.find((v) => v.slug === slug) ?? null;
}

export const CAPA_COMBO: Capa = {
  webp: "/capas/combo.webp",
  png: "/capas/combo.png",
  mini: "/capas/mini/combo.webp",
  alt: "Capa da Coleção Completa: todos os pacotes empilhados.",
};

export const DEMONSTRACAO_COLECAO: Demonstracao = {
  resumo: "Demonstração: um único pedido libera os kits, com os agentes, as skills e os prompts de cada um.",
  janela: "Coleção Completa",
  pedido: "Quero todos os kits numa compra só.",
  passos: ["Todos os kits", "Todos os agentes", "Todas as skills", "Todos os prompts"],
  previa: { titulo: "Sua coleção", botao: "Começar", selo: "Liberada", extras: ["Claude Code", "Codex"] },
};

export function apresentacao(slug: string): Apresentacao | null {
  return APRESENTACOES[slug] ?? null;
}

// Pacote novo sem capa cadastrada aqui fica sem imagem (o layout segura a proporção 3:2)
export function capaDoPacote(slug: string, titulo: string): Capa | null {
  const a = APRESENTACOES[slug];
  if (!a) return null;
  return { webp: `/capas/${slug}.webp`, png: `/capas/${slug}.png`, mini: `/capas/mini/${slug}.webp`, alt: a.capaAlt || `Capa do pacote ${titulo}.` };
}

export function urlDoPacote(slug: string): string {
  return `/pacotes/${rotaDoPacote(slug)}/`;
}
