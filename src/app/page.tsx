import type { Metadata, Viewport } from "next";
import { cache, Suspense } from "react";
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
  title: { absolute: "Leonardo Skills: kits prontos para o Claude Code e o Codex" },
  description: "Uma equipe de IA trabalhando por você: kits com skills, agentes e prompts para o Claude Code e o Codex, além dos prompts grátis dos vídeos.",
};
// Preço e oferta ativa vêm do banco, renovados a cada 60 s (mesmo prazo da vitrine das páginas dos vídeos).
// A página não lê sessão, então sai do cache da CDN em vez de rodar a função a cada visita.
// O checkout recalcula o preço no servidor na hora de pagar.
export const revalidate = 60;
export const viewport: Viewport = { themeColor: "#05070D" };

// Uma leitura do catálogo por requisição.
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
      <HeroHeader />
      <main id="conteudo">
        <section className="pacotes wrap" id="pacotes" aria-labelledby="pacotes-titulo">
          {/* Compatibilidade: links antigos apontam para /#oferta */}
          <span id="oferta" aria-hidden="true" />
          <div className="secao-cabeca">
            <div>
              <p className="olho">Os kits</p>
              <h2 className="secao-titulo" id="pacotes-titulo">
                Escolha o kit do seu próximo projeto
              </h2>
            </div>
            <p className="secao-apoio">Cada kit já vem com as instruções, os agentes e os pedidos prontos. O instalador funciona no Windows, no Mac e no Linux.</p>
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
