// Fonte única das páginas dos vídeos (public/<pasta>/index.html): o card na página inicial, o pacote
// oferecido no fim de cada página e quais respondem pelo rewrite fixo do site estático anterior.
// Para cadastrar uma página nova, trocar o pacote ou o gancho de um vídeo, mude só aqui.
// Sem imports com "@/": next.config.ts lê este arquivo (via paginas-antigas.ts).
// Preço e conteúdo do pacote vêm do banco.

export type TipoPagina = "Prompt grátis" | "Passo a passo" | "Guia grátis" | "Ranking" | "Skill grátis" | "Pacote";

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
    titulo: "Esquadrão de Oferta",
    frase: "Estuda uma oferta escalada e monta a sua página.",
    tipo: "Prompt grátis",
    antiga: true,
    oferta: { pacote: "design-copy-anuncios", gancho: "Gostou do Esquadrão de Oferta? No pacote tem as skills de design, copy e anúncios prontas." },
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
    pasta: "mesa-de-validacao",
    titulo: "Mesa de Validação",
    frase: "Testa a sua ideia antes de você gastar meses nela.",
    tipo: "Prompt grátis",
    antiga: true,
    oferta: { pacote: "times-de-agentes", gancho: "Gostou da Mesa de Validação? No pacote tem seis times de agentes com líder e revisor." },
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
    pasta: "revisao-tripla",
    titulo: "Revisão Tripla",
    frase: "Três revisões antes de publicar: bugs, segurança e limpeza.",
    tipo: "Guia grátis",
    antiga: true,
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou da Revisão Tripla? No pacote tem o time que planeja, programa, testa e revisa para você." },
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
    pasta: "prompt-bola-de-cristal",
    titulo: "Prompt Bola de Cristal",
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
    titulo: "Guia: do básico ao piloto automático",
    frase: "Saia do uso básico e coloque o Claude para trabalhar sozinho com agentes e automações.",
    tipo: "Guia grátis",
    oferta: { pacote: "times-de-agentes", gancho: "Quer chegar mais rápido ao piloto automático? No pacote tem os times de agentes prontos." },
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
    titulo: "Ilha de Edição IA na prática",
    frase: "Peça o vídeo em português e receba o Reels pronto, com um time de 6 agentes de edição.",
    tipo: "Pacote",
    oferta: { pacote: "edicao-de-video", gancho: "Só a edição de vídeo, do bruto ao post, por {preco}" },
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
  {
    pasta: "lembra",
    titulo: "Memória para o Claude Code",
    frase: "O plugin Claude-Mem anota cada sessão e devolve o contexto na seguinte.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "motion",
    titulo: "Prompt Motion",
    frase: "Vídeos animados feitos com o Claude, cada um com o prompt que gerou.",
    tipo: "Passo a passo",
    oferta: { pacote: "edicao-de-video", gancho: "Gostou? O pacote de edição faz o vídeo inteiro com você só pedindo, por {preco}" },
  },
  {
    pasta: "fabrica",
    titulo: "O Claude como fábrica",
    frase: "O modelo de pedido para delegar documento, planilha, apresentação e site em vez de só perguntar.",
    tipo: "Prompt grátis",
    oferta: { pacote: "times-de-agentes", gancho: "Gostou? No pacote tem seis times de agentes com líder e revisor que já trabalham assim." },
  },
  {
    pasta: "faxina-de-pastas",
    titulo: "Faxina de Pastas",
    frase: "Pedidos prontos para o Claude Code arrumar a sua pasta sem apagar nada.",
    tipo: "Prompt grátis",
    oferta: { pacote: "times-de-agentes", gancho: "Gostou? No pacote tem seis times de agentes com líder e revisor." },
  },
  {
    pasta: "ecc",
    titulo: "ECC: time de engenharia",
    frase: "71 agentes e 314 skills grátis no Claude Code, instalados com dois comandos.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "games",
    titulo: "Um estúdio de games no Claude",
    frase: "Cinco repositórios grátis: time de agentes, Unreal, Godot, trilha sonora e rosto animado.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "aprender",
    titulo: "Agentes que te ensinam",
    frase: "O LearnHarness mede o que você já sabe e ensina um passo de cada vez até o seu objetivo.",
    tipo: "Passo a passo",
    oferta: { pacote: "times-de-agentes", gancho: "Gostou? No pacote tem seis times de agentes com líder e revisor." },
  },
  {
    pasta: "arena",
    titulo: "Arena Skill",
    frase: "100 subagentes do Claude duelam pela mesma tarefa até sobrar a melhor resposta, com o modo econômico --quick.",
    tipo: "Passo a passo",
    oferta: { pacote: "times-de-agentes", gancho: "Gostou? No pacote tem seis times de agentes com líder e revisor." },
  },
  {
    pasta: "trio",
    titulo: "Trio: 3 repositórios grátis",
    frase: "Context Mode, a auditoria de segurança da Cloudflare e o VoiceStudio, com os links oficiais.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "placa",
    titulo: "GPU Unlock: destrave sua placa para IA",
    frase: "Código aberto que tira o limite dos núcleos de IA das placas RTX 20, 30 e 40 no Linux.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "cad",
    titulo: "SolidCraft: peças 3D com o Claude",
    frase: "CAD 3D grátis que conecta no Claude: descreva a peça e mude as medidas conversando.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "clone",
    titulo: "Replica: 11 skills que clonam um app",
    frase: "11 skills grátis para o Claude estudar um app, reconstruir as funções e colocar a sua versão no ar.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
  {
    pasta: "craft",
    titulo: "Craft Anything: refaça um site com IA",
    frase: "Cole o link, diga o que quer e a IA monta uma versão nova, compara com o original e corrige.",
    tipo: "Passo a passo",
    oferta: { pacote: "programacao-sem-codigo", gancho: "Gostou? No pacote tem o caminho completo do pedido ao projeto no ar." },
  },
];

// A chave é a pasta da página (/agentes/ -> "agentes")
export const OFERTA_DOS_VIDEOS: Record<string, OfertaDoVideo> = Object.fromEntries(PAGINAS_VIDEOS.map((p) => [p.pasta, p.oferta]));

export function paginasDoPacote(slug: string): PaginaVideo[] {
  return PAGINAS_VIDEOS.filter((p) => p.oferta.pacote === slug);
}
