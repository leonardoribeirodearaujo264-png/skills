import Link from "next/link";

// Marca do site: estrela de quatro pontas, "Leonardo" claro e "Skills" laranja
export function Marca() {
  return (
    <Link className="marca" href="/" aria-label="Leonardo Skills, página inicial">
      <span className="marca__icone" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" focusable="false">
          <path d="M12 2.5Q13.2 10.8 21.5 12 13.2 13.2 12 21.5 10.8 13.2 2.5 12 10.8 10.8 12 2.5Z" fill="currentColor" />
        </svg>
      </span>
      <span className="marca__nome">
        Leonardo <b>Skills</b>
      </span>
    </Link>
  );
}
