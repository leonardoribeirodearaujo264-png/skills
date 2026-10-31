import Link from "next/link";
import { Icone } from "@/components/Icone";
import { CONTATO, linkTelefone, linkWhatsApp } from "@/lib/contato";
import { Marca } from "./Marca";

export function Footer() {
  return (
    <footer className="vendas-rodape">
      <div className="wrap">
        <div className="rodape__grade">
          <div className="rodape__marca">
            <Marca />
            <p>Skills, agentes e prompts para Claude Code e Codex, em português.</p>
          </div>
          <nav aria-labelledby="rodape-contato">
            <h2 id="rodape-contato">Contato</h2>
            <ul>
              <li>
                <a href={`mailto:${CONTATO.email}`}>
                  <Icone nome="email" tamanho={18} />
                  {CONTATO.email}
                </a>
              </li>
              <li>
                <a href={linkWhatsApp} rel="noopener">
                  <Icone nome="conversa" tamanho={18} />
                  WhatsApp {CONTATO.telefoneTexto}
                </a>
              </li>
              <li>
                <a href={linkTelefone}>
                  <Icone nome="telefone" tamanho={18} />
                  Ligar {CONTATO.telefoneTexto}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-labelledby="rodape-legal">
            <h2 id="rodape-legal">Políticas</h2>
            <ul>
              <li>
                <Link href="/termos/">Termos de uso</Link>
              </li>
              <li>
                <Link href="/privacidade/">Política de privacidade</Link>
              </li>
              <li>
                <Link href="/reembolso/">Política de reembolso</Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="rodape__copia">
          © {new Date().getFullYear()} {CONTATO.marca}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
