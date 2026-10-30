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
  // Explica cada número do bloco "O que vem no pacote"
  inclui?: { agentes?: string; skills?: string; prompts?: string };
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
  "programacao-sem-codigo": {
    capaAlt: "Capa do pacote Programação para quem não programa: terminal, bloco de código e sinal de concluído.",
  },
};

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
