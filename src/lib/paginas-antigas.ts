import { PAGINAS_VIDEOS } from "./loja/paginas-videos";

// Pastas do site estático anterior servidas a partir de public/ por rewrite fixo.
// A automação de DM do Instagram envia esses endereços; nenhum pode deixar de responder.
// A página inicial (/) agora é a rota do app (src/app/page.tsx).
export const PAGINAS_ANTIGAS: readonly string[] = [...PAGINAS_VIDEOS.filter((p) => p.antiga).map((p) => p.pasta), "pagina-agentes"];
