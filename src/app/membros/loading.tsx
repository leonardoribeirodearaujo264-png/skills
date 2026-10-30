export default function Carregando() {
  return (
    <main className="wrap" aria-busy="true">
      <p className="sr-only" role="status">
        Carregando a sua área.
      </p>
      <div aria-hidden="true" style={{ display: "grid", gap: 16 }}>
        <span className="skel" style={{ height: 40, width: "40%" }} />
        <div className="lista-membros">
          {[1, 2, 3].map((i) => (
            <span key={i} className="skel" style={{ height: 280, borderRadius: 22 }} />
          ))}
        </div>
      </div>
    </main>
  );
}
