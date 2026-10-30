import { BlocoCodigo } from "@/components/BlocoCodigo";
import { Icone, type NomeIcone } from "@/components/Icone";
import { porGrupo, type Demonstracao, type ItemVenda, type Venda } from "@/lib/loja/conteudo";

// Seções da página pública do pacote. Todo texto vem de src/lib/loja/conteudo-pacotes.json (gerado dos
// arquivos do pacote) ou do banco; aqui só há rótulos.

// Cada prompt de demonstração seguido do que o agente (ou a skill) faz, quando usar e o que você recebe
export function SecaoDemonstracoes({ demonstracoes }: { demonstracoes: Demonstracao[] }) {
  if (!demonstracoes.length) return null;
  return (
    <section className="pp-secao" aria-labelledby="h-demo">
      <h2 id="h-demo">Veja como você pede</h2>
      <p className="sub">Prompts que vêm no pacote. Copie, troque o que está entre colchetes e cole no Claude Code.</p>
      <ol className="demos">
        {demonstracoes.map((d) => (
          <li key={d.titulo} className="demo">
            <h3>{d.titulo}</h3>
            <BlocoCodigo rotulo={`Prompt: ${d.titulo}`} texto={d.texto} />
            <CartaoFuncao demonstracao={d} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function CartaoFuncao({ demonstracao: d }: { demonstracao: Demonstracao }) {
  return (
    <dl className="funcao">
      <div>
        <dt>
          <Icone nome="raio" tamanho={16} />O que {d.tipo === "skill" ? "a skill" : "o agente"} <code>{d.nome}</code> faz
        </dt>
        <dd>{d.funcao}</dd>
      </div>
      <div>
        <dt>
          <Icone nome="relogio" tamanho={16} />
          Quando usar
        </dt>
        <dd>{d.quando}</dd>
      </div>
      <div>
        <dt>
          <Icone nome="ok" tamanho={16} />O que você recebe
        </dt>
        <dd>{d.resultado}</dd>
      </div>
    </dl>
  );
}

export type ItemLeva = { icone: NomeIcone; titulo: string; leva: string; ganha: string };

// O que vem no pacote e o resultado prático de cada item
export function SecaoLevaGanha({ itens }: { itens: ItemLeva[] }) {
  return (
    <section className="pp-secao" aria-labelledby="h-leva">
      <h2 id="h-leva">O que você leva e o que ganha</h2>
      <p className="sub">Guia, instaladores e prompts em português, nos formatos do Claude Code e do Codex.</p>
      <ul className="leva">
        {itens.map((i) => (
          <li key={i.titulo}>
            <span className="ic" aria-hidden="true">
              <Icone nome={i.icone} tamanho={20} />
            </span>
            <div>
              <h3>{i.titulo}</h3>
              <p>{i.leva}</p>
              <p className="ganha">
                <strong>Você ganha:</strong> {i.ganha}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Lista completa de agentes e skills do venda.json, por grupo, cada um com o que faz, quando usar e o ganho
export function SecaoCatalogoVenda({ venda }: { venda: Venda }) {
  return (
    <>
      <section className="pp-secao" aria-labelledby="h-para-quem">
        <h2 id="h-para-quem">Para quem é</h2>
        <ul className="pp-destaques">
          {venda.paraQuem.map((t) => (
            <li key={t}>
              <Icone nome="check" tamanho={16} />
              {t}
            </li>
          ))}
        </ul>
      </section>
      <ListaPorGrupo id="agentes" titulo={`Os ${venda.agentes.length} agentes`} itens={venda.agentes} />
      <ListaPorGrupo id="skills" titulo={`As ${venda.skills.length} skills`} itens={venda.skills} />
    </>
  );
}

function ListaPorGrupo({ id, titulo, itens }: { id: string; titulo: string; itens: ItemVenda[] }) {
  return (
    <section className="pp-secao" aria-labelledby={`h-${id}`}>
      <h2 id={`h-${id}`}>{titulo}</h2>
      <p className="sub">Toque em um grupo para ver o que cada um faz, quando usar e o que você recebe.</p>
      <div className="grupos">
        {porGrupo(itens).map((g, n) => (
          <details key={g.grupo} className="grupo" open={n === 0}>
            <summary>
              {g.grupo} <span className="chip">{g.itens.length}</span>
            </summary>
            <ul>
              {g.itens.map((i) => (
                <li key={i.nome}>
                  <code>{i.nome}</code>
                  <p>{i.faz}</p>
                  <p className="small muted">
                    <strong>Quando usar:</strong> {i.quando}
                  </p>
                  <p className="small">
                    <strong>Você recebe:</strong> {i.ganho}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
