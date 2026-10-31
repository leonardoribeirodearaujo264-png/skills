// Fonte única das páginas dos vídeos (public/<pasta>/index.html): o card na página inicial, o pacote
// oferecido no fim de cada página e quais respondem pelo rewrite fixo do site estático anterior.
// Para cadastrar uma página nova, trocar o pacote ou o gancho de um vídeo, mude só aqui.
// Sem imports com "@/": next.config.ts lê este arquivo (via paginas-antigas.ts).
// Preço e conteúdo do pacote vêm do banco.

export type TipoPagina = "Prompt grátis" | "Passo a passo" | "Guia grátis" | "Ranking" | "Skill grátis";

// {preco} no gancho vira o preço atual do pacote no banco. descricao troca o resumo do pacote neste card.
export type OfertaDoVideo = { pacote: string; gancho: string; descricao?: string };

export type PaginaVideo = {
  // endereço /<pasta>/
  pasta: string;
  // texto curto do card na página inicial
  titulo: string;
  frase: string;
  tipo: TipoPagina;
  oferta: OfertaDoVideo;
  // estava no site estático: responde pelo rewrite fixo (a automação de DM já divulgou o endereço)
  antiga?: boolean;
};

export const PAGINAS_VIDEOS: readonly PaginaVideo[] = [
  {
    pasta: "agentes",
    titulo: "13 agentes",
    frase: "Uma empresa inteira no seu Claude Code, com você de CEO.",
    tipo: "Prompt grátis",
    antiga: true,
    oferta: {
      pacote: "times-de-agentes",
      gancho: "Sua equipe inteira de IA, por {preco}",
      // Conferido no README do pacote: 25 agentes, seis times, cada um com líder e revisor
      descricao:
        "25 agentes cobrindo marketing, vendas, financeiro, atendimento, operações e conteúdo. Cada área tem um líder que coordena e um revisor que confere antes de entregar.",
    },
  },
  {
    pasta: "clonadora",
    titulo: "Bancada de 6 Claudes",
    frase: "Estuda uma oferta escalada e monta a sua página.",
    tipo: "Prompt grátis",
    antiga: true,
    oferta: { pacote: "design-copy-anuncios", gancho: "Gostou da bancada? No pacote tem as skills de design, copy e anúncios prontas." },
  },
  {
    pasta: "harvey",
    titulo: "Harvey",
    frase: "O agente open source que arruma cliente para você.",
    tipo: "Passo a passo",
    antiga: true,
    oferta: { pacote: "times-de-agentes", gancho: "Gostou do Harvey? No pacote tem o time de vendas e mais cinco times de agentes." },
  },
  {
    pasta: "conselho",
    titulo: "Conselho de 4 Claudes",
    frase: "Testa a sua ideia antes de você gastar meses nela.",
    tipo: "Prompt grátis",
    antiga: true,
    oferta: { pacote: "times-de-agentes", gancho: "Gostou do conselho? No pacote tem seis times de agentes com líder e revisor." },
  },
  {
    pasta: "freellm",
    titulo: "Claude Code com modelos grátis",
    frase: "A FreeLLMAPI e o passo a passo para ligar.",
    tipo: "Passo a passo",
    antiga: true,
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou de ligar modelos grátis? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "banca",
    titulo: "A banca do seu código",
    frase: "Três revisões antes de publicar: bugs, segurança e limpeza.",
    tipo: "Guia grátis",
    antiga: true,
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou da banca? No pacote tem o time que planeja, programa, testa e revisa para você." },
  },
  {
    pasta: "ranking",
    titulo: "Top 5 skills",
    frase: "As skills do Claude Code em alta, com o comando de cada uma.",
    tipo: "Ranking",
    antiga: true,
    oferta: { pacote: "design-copy-anuncios", gancho: "Gostou das skills em alta? No pacote tem as melhores de design e copy, explicadas em português." },
  },
  {
    pasta: "gratis",
    titulo: "Free Claude Code",
    frase: "Rode o Claude Code com chave da NVIDIA, OpenRouter ou Ollama no seu computador.",
    tipo: "Guia grátis",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou do Claude Code de graça? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "futuro",
    titulo: "Os 4 prompts do futuro",
    frase: "O Claude prevê os seus próximos 5 anos a partir da memória das suas conversas.",
    tipo: "Prompt grátis",
    oferta: { pacote: "times-de-agentes", gancho: "Gostou dos prompts? No pacote tem seis times de agentes com líder e revisor." },
  },
  {
    pasta: "tv",
    titulo: "Tire os anúncios da sua TV",
    frase: "O Claude Code limpa anúncios e apps de fábrica da Android TV ou Google TV pelo Wi-Fi.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou de limpar a TV? No pacote tem o time que planeja, programa, testa e revisa para você." },
  },
  {
    pasta: "guia",
    titulo: "Guia: virar vermelho na IA",
    frase: "Saia do uso básico e coloque o Claude para trabalhar sozinho com agentes e automações.",
    tipo: "Guia grátis",
    oferta: { pacote: "times-de-agentes", gancho: "Quer virar vermelho mais rápido? No pacote tem os times de agentes prontos." },
  },
  {
    pasta: "biblioteca",
    titulo: "Find Skills",
    frase: "A skill do time da Vercel que encontra e instala as skills certas para cada tarefa.",
    tipo: "Skill grátis",
    oferta: { pacote: "design-copy-anuncios", gancho: "Gostou da find-skills? No pacote tem as melhores skills de design e copy, explicadas em português." },
  },
  {
    pasta: "editar",
    titulo: "O Claude editando vídeo",
    frase: "Cortes, legendas e animações em código com a skill HyperFrames, sem timeline.",
    tipo: "Passo a passo",
    oferta: { pacote: "edicao-de-video", gancho: "Gostou? No pacote de edição tem as skills prontas, do bruto ao post." },
  },
  {
    pasta: "trem",
    titulo: "O trem dos vídeos",
    frase: "Roteiro, voz, cenário em código e Reel pronto, uma estação por vez.",
    tipo: "Passo a passo",
    oferta: { pacote: "edicao-de-video", gancho: "Quer o trem completo? O pacote de edição traz as skills prontas." },
  },
  {
    pasta: "ringue",
    titulo: "O ringue dos modelos",
    frase: "Gemini 4 Carbon, Opus 5.5 e GPT-6 Astra comparados, com as fontes.",
    tipo: "Guia grátis",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "viral",
    titulo: "7 Claudes avaliam seu vídeo",
    frase: "O prompt da equipe que reprova o roteiro antes de você gravar e devolve corrigido.",
    tipo: "Prompt grátis",
    oferta: { pacote: "design-copy-anuncios", gancho: "Gostou? No pacote de copy tem mais prompts prontos para conteúdo e anúncios." },
  },
  {
    pasta: "leis",
    titulo: "As leis do Brasil no Claude",
    frase: "Mais de 1,2 milhão de normas em Markdown para o Claude responder em cima do texto.",
    tipo: "Passo a passo",
    oferta: { pacote: "times-de-agentes", gancho: "Gostou? No pacote tem seis times de agentes com líder e revisor." },
  },
];

// A chave é a pasta da página (/agentes/ -> "agentes")
export const OFERTA_DOS_VIDEOS: Record<string, OfertaDoVideo> = Object.fromEntries(PAGINAS_VIDEOS.map((p) => [p.pasta, p.oferta]));

export function paginasDoPacote(slug: string): PaginaVideo[] {
  return PAGINAS_VIDEOS.filter((p) => p.oferta.pacote === slug);
}
