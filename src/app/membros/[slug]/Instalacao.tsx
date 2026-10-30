"use client";

import { useState } from "react";
import { BlocoCodigo } from "@/components/BlocoCodigo";

type Ferramenta = "claude" | "codex";
type Sistema = "win" | "unix";

const ROTULO: Record<Ferramenta, string> = { claude: "Claude Code", codex: "Codex" };
const PASTAS: Record<Ferramenta, { skills: string; agentes: string }> = {
  claude: { skills: "~/.claude/skills", agentes: "~/.claude/agents" },
  codex: { skills: "~/.agents/skills", agentes: "~/.codex/agents" },
};

export function Instalacao({ slug, exemplo }: { slug: string; exemplo: { fonte: string; skill: string } | null }) {
  const [ferramenta, setFerramenta] = useState<Ferramenta>("claude");
  const [sistema, setSistema] = useState<Sistema>("win");
  const comando =
    sistema === "win"
      ? `cd ${slug}\npowershell -ExecutionPolicy Bypass -File .\\instalar-${ferramenta}.ps1`
      : `cd ${slug}\nbash instalar-${ferramenta}.sh`;

  return (
    <>
      <div className="abas-linha">
        <div className="abas" role="group" aria-label="Ferramenta">
          {(["claude", "codex"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={ferramenta === f} onClick={() => setFerramenta(f)}>
              {ROTULO[f]}
            </button>
          ))}
        </div>
        <div className="abas" role="group" aria-label="Sistema">
          <button type="button" aria-pressed={sistema === "win"} onClick={() => setSistema("win")}>
            Windows
          </button>
          <button type="button" aria-pressed={sistema === "unix"} onClick={() => setSistema("unix")}>
            macOS e Linux
          </button>
        </div>
      </div>
      <div className="passos" aria-live="polite">
        <div className="passo">
          <span className="step-num" aria-hidden="true">1</span>
          <div>
            <h3>Baixe e extraia o pacote</h3>
            <p>
              Baixe o .zip em <a href="#arquivos">Arquivos</a> e extraia numa pasta qualquer. Precisa do Node.js 22 ou mais novo.
            </p>
          </div>
        </div>
        <div className="passo">
          <span className="step-num" aria-hidden="true">2</span>
          <div>
            <h3>Rode o instalador</h3>
            <p>
              {sistema === "win" ? "No PowerShell, na pasta onde extraiu:" : "No terminal, na pasta onde extraiu:"} ele instala as
              skills de outros autores direto do repositório original e copia as skills autorais para{" "}
              <code className="inline">{PASTAS[ferramenta].skills}</code> e o time para{" "}
              <code className="inline">{PASTAS[ferramenta].agentes}</code>.
            </p>
            <BlocoCodigo rotulo={sistema === "win" ? "PowerShell" : "terminal"} texto={comando} />
          </div>
        </div>
        {exemplo && (
          <div className="passo">
            <span className="step-num" aria-hidden="true">3</span>
            <div>
              <h3>Ou instale uma skill de cada vez</h3>
              <p>O mesmo comando instala nos dois agentes de uma vez.</p>
              <BlocoCodigo
                rotulo="terminal"
                texto={`npx skills add ${exemplo.fonte} --skill ${exemplo.skill} -a claude-code -a codex -g -y`}
              />
            </div>
          </div>
        )}
        <div className="passo">
          <span className="step-num" aria-hidden="true">{exemplo ? 4 : 3}</span>
          <div>
            <h3>Abra de novo e confira</h3>
            <p>
              {ferramenta === "claude"
                ? "Feche e abra o Claude Code. Digite /agents para ver o time e peça uma tarefa citando o líder."
                : "Feche e abra o Codex. No Codex, cite o agente pelo nome no pedido, por exemplo: use o agente líder para planejar."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
