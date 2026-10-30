import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { PAGINAS_ANTIGAS } from "./src/lib/paginas-antigas";

// As páginas dos vídeos continuam como HTML estático em public/. Cada endereço responde 200,
// com e sem barra no fim, igual ao site estático anterior (os links da DM dependem disso).
const reescritasAntigas = PAGINAS_ANTIGAS.flatMap((pasta) =>
  pasta === ""
    ? [{ source: "/", destination: "/index.html" }]
    : [
        { source: `/${pasta}`, destination: `/${pasta}/index.html` },
        { source: `/${pasta}/`, destination: `/${pasta}/index.html` },
      ],
);

const semCache = [{ key: "Cache-Control", value: "private, no-store" }];

const config: NextConfig = {
  poweredByHeader: false,
  // Sem redirecionar por causa da barra final: /agentes e /agentes/ seguem em 200
  skipTrailingSlashRedirect: true,
  // Há outro package-lock.json acima desta pasta; a raiz do projeto é esta
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  async rewrites() {
    // Páginas novas que o gerador da automação cria em public/<pasta>/ também respondem com e sem barra.
    // Fica no fallback: só vale quando nenhuma rota do app atende; pasta inexistente continua 404.
    const paginasNovas = [
      { source: "/:pasta([a-z0-9-]+)", destination: "/:pasta/index.html" },
      { source: "/:pasta([a-z0-9-]+)/", destination: "/:pasta/index.html" },
    ];
    return { beforeFiles: reescritasAntigas, afterFiles: [], fallback: paginasNovas };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      { source: "/membros/:path*", headers: semCache },
      { source: "/entrar/:path*", headers: semCache },
      // A vitrine pública das páginas dos vídeos define o próprio cache
      { source: "/api/((?!loja/vitrine).*)", headers: semCache },
    ];
  },
};

export default config;
