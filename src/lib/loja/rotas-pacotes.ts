// Endereços públicos com os nomes novos. O slug interno continua o mesmo: é a chave de loja_produtos,
// loja_acessos, loja_pedido_itens e do caminho do ZIP no Storage, e não pode mudar sem migrar compras já feitas.
// Sem imports com "@/": next.config.ts lê este arquivo.

const ROTAS: Readonly<Record<string, string>> = {
  "design-copy-anuncios": "kit-vitrine-de-vendas",
  "edicao-de-video": "ilha-de-edicao-ia",
  "motion-mockup-fontes": "kit-cena",
  "programacao-sem-codigo": "kit-codigo-seguro",
  "times-de-agentes": "kit-empresa-ia",
};

// Páginas dos vídeos que trocaram de pasta em public/: [pasta antiga, pasta nova]
const PASTAS_RENOMEADAS: readonly (readonly [string, string])[] = [
  ["conselho", "mesa-de-validacao"],
  ["banca", "revisao-tripla"],
  ["futuro", "prompt-bola-de-cristal"],
  ["espanador", "faxina-de-pastas"],
];

export function rotaDoPacote(slug: string): string {
  return ROTAS[slug] ?? slug;
}

export function slugDaRota(rota: string): string {
  return Object.entries(ROTAS).find(([, r]) => r === rota)?.[0] ?? rota;
}

// [endereço antigo, endereço novo], para os redirecionamentos 301
export const ENDERECOS_RENOMEADOS: readonly (readonly [string, string])[] = [
  ...Object.entries(ROTAS).map(([slug, rota]) => [`/pacotes/${slug}`, `/pacotes/${rota}/`] as const),
  ...PASTAS_RENOMEADAS.map(([de, para]) => [`/${de}`, `/${para}/`] as const),
];
