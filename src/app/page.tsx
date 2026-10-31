import type { Metadata, Viewport } from "next";
import { cache, Suspense } from "react";
import { ComboBanner } from "@/components/vendas/ComboBanner";
import { FinalCta } from "@/components/vendas/FinalCta";
import { Footer } from "@/components/vendas/Footer";
import { FreeAgentsSection } from "@/components/vendas/FreeAgentsSection";
import { HeroHeader } from "@/components/vendas/HeroHeader";
import { PackageList, PackageListSkeleton } from "@/components/vendas/PackageList";
import type { Catalogo } from "@/lib/loja/dominio";
import { montarPaginaInicial } from "@/lib/loja/paginaInicial";
import { carregarCatalogo } from "@/lib/loja/repositorio";
import { clientePublico } from "@/lib/supabase/clientes";
import "./vendas.css";

export const metadata: Metadata = {
  title: { absolute: "Leonardo Skills: pacotes de skills para Claude Code e Codex" },
  description: "Pacotes de skills, agentes e prompts para Claude Code e Codex, explicados em português, e os prompts grátis dos vídeos.",
};
// Preço e oferta ativa vêm do banco a cada visita, como na /loja/
export const dynamic = "force-dynamic";
export const viewport: Viewport = { themeColor: "#14100D" };

// Uma leitura do catálogo por requisição, dividida entre a pílula do combo e a lista.
// Falha no banco vira null: a página mostra os cards sem preço e bloqueia a compra, nunca um valor de reserva.
const paginaDaVisita = cache(async () => {
  let catalogo: Catalogo | null = null;
  try {
    catalogo = await carregarCatalogo(clientePublico());
  } catch (e) {
    console.error("catálogo da página inicial", e instanceof Error ? e.message : "erro desconhecido");
  }
  return montarPaginaInicial(catalogo);
});

async function Pilula() {
  return <ComboBanner combo={(await paginaDaVisita()).combo} />;
}

async function Lista() {
  return <PackageList pagina={await paginaDaVisita()} />;
}

export default function PaginaInicial() {
  // Os agentes grátis e os filtros não dependem do banco: saem já na primeira resposta
  const fixo = montarPaginaInicial(null);
  return (
    <div className="vendas">
      <div className="brilho" aria-hidden="true" />
      <a className="sr-only pular" href="#pacotes">
        Pular para os pacotes
      </a>
      <HeroHeader
        combo={
          <Suspense fallback={null}>
            <Pilula />
          </Suspense>
        }
      />
      <main id="conteudo">
        <section className="pacotes wrap" id="pacotes" aria-labelledby="pacotes-titulo">
          {/* Compatibilidade: links antigos apontam para /#oferta */}
          <span id="oferta" aria-hidden="true" />
          <div className="secao-cabeca">
            <div>
              <p className="olho">Os pacotes</p>
              <h2 className="secao-titulo" id="pacotes-titulo">
                Um pacote por área
              </h2>
            </div>
            <p className="secao-apoio">Cada pacote traz as skills, o time de agentes e os prompts da área, com instalador para Windows, Mac e Linux.</p>
          </div>
          <Suspense fallback={<PackageListSkeleton />}>
            <Lista />
          </Suspense>
        </section>
        <FreeAgentsSection agentes={fixo.agentes} filtros={fixo.filtros} />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
