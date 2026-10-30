// Qual pacote cada página de vídeo oferece no fim. Para trocar o pacote ou o gancho de um vídeo, mude só aqui.
// A chave é a pasta da página (/agentes/ -> "agentes"). Preço e conteúdo do pacote vêm do banco.
export type OfertaDoVideo = { pacote: string; gancho: string };

export const OFERTA_DOS_VIDEOS: Record<string, OfertaDoVideo> = {
  agentes: { pacote: "times-de-agentes", gancho: "Gostou da empresa de agentes? No pacote tem um time pronto para cada área do negócio." },
  clonadora: { pacote: "design-copy-anuncios", gancho: "Gostou da bancada? No pacote tem as skills de design, copy e anúncios prontas." },
  harvey: { pacote: "times-de-agentes", gancho: "Gostou do Harvey? No pacote tem o time de vendas e mais cinco times de agentes." },
  banca: { pacote: "programacao-sem-codigo", gancho: "Gostou da banca? No pacote tem o time que planeja, programa, testa e revisa para você." },
  conselho: { pacote: "times-de-agentes", gancho: "Gostou do conselho? No pacote tem seis times de agentes com líder e revisor." },
  freellm: { pacote: "programacao-sem-codigo", gancho: "Gostou de ligar modelos grátis? No pacote tem o caminho completo do pedido ao projeto no ar." },
  ranking: { pacote: "design-copy-anuncios", gancho: "Gostou das skills em alta? No pacote tem as melhores de design e copy, explicadas em português." },
  gratis: { pacote: "programacao-sem-codigo", gancho: "Gostou do Claude Code de graça? No pacote tem o caminho completo do pedido ao projeto no ar." },
  futuro: { pacote: "times-de-agentes", gancho: "Gostou dos prompts? No pacote tem seis times de agentes com líder e revisor." },
  tv: { pacote: "programacao-sem-codigo", gancho: "Gostou de limpar a TV? No pacote tem o time que planeja, programa, testa e revisa para você." },
  guia: { pacote: "times-de-agentes", gancho: "Quer virar vermelho mais rápido? No pacote tem os times de agentes prontos." },
  biblioteca: { pacote: "design-copy-anuncios", gancho: "Gostou da find-skills? No pacote tem as melhores skills de design e copy, explicadas em português." },
};
