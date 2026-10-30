import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Alerta } from "@/components/Alerta";
import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { Markdown, secoesDoGuia } from "@/components/Markdown";
import { usuarioAtual } from "@/lib/auth/sessao";
import { aulaDoProduto, conteudoDoProduto, produtoVisivel, temAcesso, type Conteudo } from "@/lib/loja/membros";
import { BotaoDownload } from "./BotaoDownload";
import { Instalacao } from "./Instalacao";
import { PlayerAula } from "./PlayerAula";

export const metadata: Metadata = { title: "Conteúdo", robots: { index: false } };
export const dynamic = "force-dynamic";

// Gerado pelo script de publicação a partir do pacote.json e das pastas skills/ e agents/
const manifesto = z.object({
  terceiros: z.array(
    z.object({ fonte: z.string(), url: z.string(), licenca: z.string(), skills: z.array(z.string()), codex: z.boolean() }),
  ),
  autorais: z.object({
    skills: z.array(z.object({ nome: z.string(), descricao: z.string() })),
    agentes: z.array(z.object({ nome: z.string(), descricao: z.string() })),
  }),
});

function lerJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

// Seções do README que a página já mostra em blocos próprios
const SECOES_EM_BLOCO = ["Instalação no Claude Code", "Instalação no Codex", "Skills incluídas", "Prompts prontos", "Créditos"];

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ download?: string }> };

export default async function ConteudoProduto({ params, searchParams }: Props) {
  const { slug } = await params;
  const { download } = await searchParams;
  const usuario = await usuarioAtual();
  const produto = await produtoVisivel(usuario, slug);
  if (!produto) notFound();
  const liberado = usuario ? await temAcesso(usuario, slug) : false;

  return (
    <>
      <Cabecalho ativa="membros" />
      <main className="wrap" id="conteudo">
        <ol className="migalha" aria-label="Você está em">
          <li>
            <Link href="/membros/">Minha área</Link>
          </li>
          <li aria-current="page">{produto.titulo}</li>
        </ol>
        <section aria-labelledby="titulo" style={{ marginBottom: 40 }}>
          {liberado ? (
            <span className="chip ok">
              <Icone nome="check" tamanho={12} />
              Liberado para você
            </span>
          ) : (
            <span className="chip">
              <Icone nome="cadeado" tamanho={12} />
              Conteúdo para quem comprou
            </span>
          )}
          <h1 id="titulo">{produto.titulo}</h1>
          <p className="lead" style={{ marginBottom: 0 }}>
            {produto.resumo}
          </p>
        </section>

        {liberado && usuario ? (
          <Liberado slug={slug} erroDownload={download ?? null} titulo={produto.titulo} githubUrl={produto.githubUrl} conteudo={await conteudoDoProduto(usuario, slug)} />
        ) : (
          <Bloqueado
            slug={slug}
            email={usuario?.email ?? null}
            numeros={[
              ["Aula", produto.aulaDuracaoS ? `${produto.aulaDuracaoS} s` : "1 min"],
              ["Agentes", String(produto.qtdAgentes)],
              ["Skills", String(produto.qtdSkills)],
              ["Prompts", String(produto.qtdPrompts)],
            ]}
          />
        )}
      </main>
      <Rodape />
    </>
  );
}

async function Liberado({
  slug,
  erroDownload,
  titulo,
  githubUrl,
  conteudo,
}: {
  slug: string;
  erroDownload: string | null;
  titulo: string;
  githubUrl: string | null;
  conteudo: Conteudo[];
}) {
  const guia = conteudo.find((c) => c.tipo === "guia");
  const roteiro = conteudo.find((c) => c.tipo === "roteiro");
  const prompts = conteudo.filter((c) => c.tipo === "prompt");
  const bruto = conteudo.find((c) => c.tipo === "manifesto");
  const lido = bruto ? manifesto.safeParse(lerJson(bruto.corpo)) : null;
  const dados = lido?.success ? lido.data : null;
  const aula = await aulaDoProduto(slug);
  const secoes = guia ? secoesDoGuia(guia.corpo) : new Map<string, string>();
  const restante = [...secoes.entries()].filter(([nome, texto]) => nome !== "inicio" && !SECOES_EM_BLOCO.includes(nome) && texto);
  const primeiro = dados?.terceiros[0];
  const exemplo = primeiro?.skills[0] ? { fonte: primeiro.fonte, skill: primeiro.skills[0] } : null;

  if (conteudo.length === 0) {
    return (
      <Alerta tipo="warn" titulo="O conteúdo está sendo atualizado">
        O seu acesso está ativo. Volte em alguns minutos; se continuar assim, fale com o suporte.
      </Alerta>
    );
  }

  return (
    <div className="produto-grid">
      <nav className="indice" aria-label="Seções do produto">
        <a href="#aula">Aula</a>
        <a href="#skills">Skills e agentes</a>
        <a href="#instalar">Instalação</a>
        <a href="#uso">Como usar</a>
        <a href="#prompts">Prompts</a>
        <a href="#arquivos">Arquivos</a>
      </nav>
      <div>
        <section className="bloco" id="aula" aria-labelledby="aula-t">
          <h2 id="aula-t">Aula</h2>
          <p className="muted">Instalação no Claude Code e no Codex, como pedir ao time e onde estão os prompts.</p>
          <div className="shell">
            <div className="core" style={{ padding: 6 }}>
              {aula ? (
                <PlayerAula video={aula.video} legenda={aula.legenda} titulo={`Aula: ${titulo}`} />
              ) : (
                <div className="player">
                  <div className="estado-video" role="status">
                    <p>A aula deste produto está sendo publicada. O resto do conteúdo já está liberado abaixo.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {roteiro && (
            <details className="faq" style={{ marginTop: 12, display: "block" }}>
              <summary style={{ background: "var(--surface)", boxShadow: "0 0 0 1px var(--line)" }}>Ler o roteiro da aula</summary>
              <div style={{ padding: "4px 18px 8px" }}>
                <Markdown texto={roteiro.corpo} />
              </div>
            </details>
          )}
        </section>

        <section className="bloco" id="skills" aria-labelledby="skills-t">
          <h2 id="skills-t">Skills e agentes</h2>
          {dados ? (
            <>
              <p className="muted">
                As de outros autores são instaladas direto do repositório original, com a licença de cada um. As marcadas como do
                pacote são autorais.
              </p>
              <div className="skills">
                {dados.autorais.skills.map((s) => (
                  <article key={s.nome} className="skill">
                    <div className="linha">
                      <h3>{s.nome}</h3>
                      <span className="chip accent">do pacote</span>
                    </div>
                    <p>{s.descricao}</p>
                  </article>
                ))}
                {dados.autorais.agentes.length > 0 && (
                  <article className="skill">
                    <div className="linha">
                      <h3>{dados.autorais.agentes.length} agentes</h3>
                      <span className="chip accent">do pacote</span>
                    </div>
                    <p>{dados.autorais.agentes.map((a) => a.nome).join(", ")}</p>
                  </article>
                )}
                {dados.terceiros.map((t) => (
                  <article key={t.fonte} className="skill">
                    <div className="linha">
                      <h3>{t.fonte}</h3>
                      <span className="chip">{t.licenca}</span>
                    </div>
                    <p>
                      {t.skills.join(", ")}
                      {t.codex ? "" : " (só Claude Code)"}
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">A lista está no guia abaixo.</p>
          )}
        </section>

        <section className="bloco" id="instalar" aria-labelledby="instalar-t">
          <h2 id="instalar-t">Instalação</h2>
          <p className="muted">Escolha onde você usa e o seu sistema. Os comandos mudam sozinhos.</p>
          <Instalacao slug={slug} exemplo={exemplo} />
        </section>

        <section className="bloco" id="uso" aria-labelledby="uso-t">
          <h2 id="uso-t">Como usar</h2>
          {restante.map(([nome, texto]) => (
            <div key={nome}>
              <Markdown texto={`## ${nome}\n\n${texto}`} />
            </div>
          ))}
        </section>

        <section className="bloco" id="prompts" aria-labelledby="prompts-t">
          <h2 id="prompts-t">Prompts</h2>
          <p className="muted">Cole no Claude Code ou no Codex e troque o que está entre colchetes.</p>
          {prompts.length === 0 ? (
            <p className="muted">Nenhum prompt publicado ainda.</p>
          ) : (
            prompts.map((p, i) => (
              <article key={p.chave} className="prompt">
                <h3>
                  {i + 1}. {p.titulo}
                </h3>
                <Markdown texto={p.corpo.replace(/^# .*\n?/, "")} />
              </article>
            ))
          )}
        </section>

        <section className="bloco" id="arquivos" aria-labelledby="arquivos-t">
          <h2 id="arquivos-t">Arquivos</h2>
          <p className="muted">O .zip tem tudo o que é do pacote. As skills de terceiros vêm pelo instalador.</p>
          <div className="arquivos">
            <div className="arquivo shell">
              <div className="core">
                <span className="icone-grande" aria-hidden="true">
                  <Icone nome="baixar" tamanho={24} />
                </span>
                <h3>{slug}.zip</h3>
                <p>Guia, instaladores, skills autorais, time de agentes e prompts.</p>
                <BotaoDownload slug={slug} erro={erroDownload} />
              </div>
            </div>
            {githubUrl && (
              <div className="arquivo shell">
                <div className="core">
                  <span className="icone-grande" aria-hidden="true">
                    <Icone nome="github" tamanho={24} />
                  </span>
                  <h3>Código no GitHub</h3>
                  <p>Veja cada arquivo, os créditos e as licenças antes de instalar.</p>
                  <a className="btn secondary" href={githubUrl} target="_blank" rel="noopener noreferrer">
                    Abrir no GitHub
                    <span className="ico">
                      <Icone nome="seta" tamanho={16} />
                    </span>
                    <span className="sr-only">(abre em nova aba)</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Bloqueado({ slug, email, numeros }: { slug: string; email: string | null; numeros: [string, string][] }) {
  return (
    <section className="bloqueio" aria-labelledby="bloq-t">
      <div className="shell">
        <div className="core">
          <div style={{ display: "flex", gap: 16, alignItems: "start", flexWrap: "wrap" }}>
            <span className="icone-grande" aria-hidden="true">
              <Icone nome="cadeado" tamanho={26} />
            </span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h2 id="bloq-t">Este conteúdo é de quem comprou</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Ao comprar, a aula, os instaladores, os prompts e o .zip ficam liberados na sua área, com as atualizações.
              </p>
            </div>
          </div>
          {email && (
            <Alerta tipo="warn" titulo={`Você está como ${email}`}>
              Este e-mail não tem este produto. Se comprou com outro e-mail, saia e entre com ele.
            </Alerta>
          )}
          <dl className="inclui">
            {numeros.map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt>{rotulo}</dt>
                <dd className="num">{valor}</dd>
              </div>
            ))}
          </dl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link className="btn" href={`/loja/?produto=${slug}`}>
              Comprar este produto
              <span className="ico">
                <Icone nome="direita" tamanho={16} />
              </span>
            </Link>
            {!email && (
              <Link className="btn secondary" href={`/entrar/?next=${encodeURIComponent(`/membros/${slug}/`)}`}>
                Já comprei, entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
