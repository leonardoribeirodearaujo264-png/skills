import { Icone, type NomeIcone } from "./Icone";

type Tipo = "info" | "warn" | "danger" | "ok";

const ICONE: Record<Tipo, NomeIcone> = { info: "info", warn: "relogio", danger: "erro", ok: "ok" };

export function Alerta({
  tipo = "info",
  titulo,
  children,
  acoes,
}: {
  tipo?: Tipo;
  titulo: string;
  children?: React.ReactNode;
  acoes?: React.ReactNode;
}) {
  return (
    <div className={`alert ${tipo === "info" ? "" : tipo}`} role={tipo === "danger" ? "alert" : undefined}>
      <Icone nome={ICONE[tipo]} tamanho={20} />
      <div>
        <strong>{titulo}</strong>
        {children && <p>{children}</p>}
      </div>
      {acoes && <div className="acoes">{acoes}</div>}
    </div>
  );
}
