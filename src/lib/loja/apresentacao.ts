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
    capaAlt: "Capa do pacote Equipe Completa de Agentes: um diretor no centro ligado a seis times.",
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
    capaAlt: "Capa do pacote Design, copy, anúncios e velocidade: uma página, um anúncio e um medidor de velocidade.",
  },
  "edicao-de-video": {
    capaAlt: "Capa do pacote Edição de vídeo por skills: tela vertical com legenda, tesoura e linha do tempo.",
  },
  "motion-mockup-fontes": {
    capaAlt: "Capa do pacote Motion, mockup e fontes: notebook com tipografia, celular e trilha de animação.",
  },
  "lancamento-pro": {
    capaAlt: "Capa do pacote Lançamento Pro: página, anúncio, e-mail e balão de atendimento.",
  },
  "programacao-sem-codigo": {
    capaAlt: "Capa do pacote Programação para quem não programa: terminal, bloco de código e sinal de concluído.",
  },
};

// Como cada pacote aparece na página inicial: nome de vitrine, frase curta e rótulo do botão.
// A ordem desta lista é a ordem dos cards (pedido do dono); pacote à venda fora dela vai para o fim
// com o título e o resumo do banco. Textos conferidos no README de cada pacote.
export type VitrineInicial = {
  slug: string;
  nome: string;
  // nome curto: filtros, painel de agentes grátis e lista do pacote completo
  curto: string;
  descricao: string;
  botao: string;
  // primeiro card, maior, com a etiqueta "Comece por aqui"
  destaque?: boolean;
  novo?: boolean;
};

export const VITRINE_INICIAL: readonly VitrineInicial[] = [
  {
    slug: "design-copy-anuncios",
    nome: "Pacote Base de Skills para sua IA",
    curto: "Pacote Base",
    botao: "Ver o Pacote Base",
    destaque: true,
    descricao:
      "Você pede em português e o Claude Code ou o Codex monta a página com visual profissional, escreve o texto da oferta, prepara anúncios para Facebook e Instagram e mede a velocidade do site. Um revisor confere tudo antes de você publicar.",
  },
  {
    slug: "edicao-de-video",
    nome: "Edição de Vídeo no Claude Code",
    curto: "Edição de vídeo",
    botao: "Ver o pacote Edição de vídeo",
    descricao:
      "Corte, legenda e montagem de Reels, Shorts e aulas no seu computador, pedindo em português. O time tira silêncios e erros, legenda e exporta em 1080x1920, e um revisor confere o vídeo antes da entrega.",
  },
  {
    slug: "motion-mockup-fontes",
    nome: "Motion e Mockups",
    curto: "Motion e Mockups",
    botao: "Ver o pacote Motion e Mockups",
    descricao:
      "O print do seu site num notebook, o app num celular, o post como aparece no feed, animações de entrada e pares de fontes com escala pronta. Os mockups são gerados no seu computador, sem programa de design.",
  },
  {
    slug: "programacao-sem-codigo",
    nome: "Programação no Claude Code",
    curto: "Programação",
    botao: "Ver o pacote Programação",
    descricao:
      "Do pedido em português ao projeto no ar: entrevista, plano em linguagem simples, uma etapa por vez, teste como cliente e revisão de segurança. Nada é apagado, instalado ou publicado sem o seu sim.",
  },
  {
    slug: "times-de-agentes",
    nome: "Times de Agentes",
    curto: "Times de Agentes",
    botao: "Ver o pacote Times de Agentes",
    novo: true,
    descricao:
      "Seis times de marketing, vendas, financeiro, atendimento, operações e conteúdo, cada um com líder, dois especialistas e revisor. Um diretor-geral recebe o seu pedido, escolhe o time e cobra a entrega.",
  },
];

export function vitrineInicial(slug: string): VitrineInicial | null {
  return VITRINE_INICIAL.find((v) => v.slug === slug) ?? null;
}

export const CAPA_COMBO: Capa = {
  webp: "/capas/combo.webp",
  png: "/capas/combo.png",
  mini: "/capas/mini/combo.webp",
  alt: "Capa do pacote completo: todos os pacotes empilhados.",
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
  return `/pacotes/${slug}/`;
}
