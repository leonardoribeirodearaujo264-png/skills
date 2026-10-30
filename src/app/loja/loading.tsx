export default function Carregando() {
  return (
    <main className="wrap" aria-busy="true">
      <p className="sr-only" role="status">
        Carregando ofertas e produtos.
      </p>
      <div aria-hidden="true">
        <span className="skel" style={{ height: 40, width: "60%", marginBottom: 16 }} />
        <span className="skel" style={{ height: 20, width: "80%" }} />
        <div className="section ofertas">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="skel" style={{ height: 170, borderRadius: 22 }} />
          ))}
        </div>
        <div className="section loja-grid">
          <div className="produtos">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="skel" style={{ height: 240, borderRadius: 22 }} />
            ))}
          </div>
          <span className="skel" style={{ height: 420, borderRadius: 22 }} />
        </div>
      </div>
    </main>
  );
}
