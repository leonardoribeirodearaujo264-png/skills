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
    return { beforeFiles: reescritasAntigas, afterFiles: [], fallback: [] };
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
      { source: "/api/:path*", headers: semCache },
    ];
  },
};

export default config;
