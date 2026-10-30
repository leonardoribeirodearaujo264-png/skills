// Qual pacote cada página de vídeo oferece no fim. Para trocar o pacote ou o gancho de um vídeo, mude só aqui.
// A chave é a pasta da página (/agentes/ -> "agentes"). Preço e conteúdo do pacote vêm do banco.
// {preco} no gancho vira o preço atual do pacote no banco. descricao troca o resumo do pacote neste card.
export type OfertaDoVideo = { pacote: string; gancho: string; descricao?: string };

export const OFERTA_DOS_VIDEOS: Record<string, OfertaDoVideo> = {
  agentes: {
    pacote: "times-de-agentes",
    gancho: "Sua equipe inteira de IA, por {preco}",
    // Conferido no README do pacote: 25 agentes, seis times, cada um com líder e revisor
    descricao:
      "25 agentes cobrindo marketing, vendas, financeiro, atendimento, operações e conteúdo. Cada área tem um líder que coordena e um revisor que confere antes de entregar.",
  },
  clonadora: { pacote: "design-copy-anuncios", gancho: "Gostou da bancada? No pacote tem as skills de design, copy e anúncios prontas." },
  harvey: { pacote: "times-de-agentes", gancho: "Gostou do Harvey? No pacote tem o time de vendas e mais cinco times de agentes." },
  banca: { pacote: "programacao-sem-codigo", gancho: "Gostou da banca? No pacote tem o time que planeja, programa, testa e revisa para você." },
  conselho: { pacote: "times-de-agentes", gancho: "Gostou do conselho? No pacote tem seis times de agentes com líder e revisor." },
  freellm: { pacote: "programacao-sem-codigo", gancho: "Gostou de ligar modelos grátis? No pacote tem o caminho completo do pedido ao projeto no ar." },
  ranking: { pacote: "design-copy-anuncios", gancho: "Gostou das skills em alta? No pacote tem as melhores de design e copy, explicadas em português." },
};
