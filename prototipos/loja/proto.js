// Comportamento compartilhado dos protótipos da loja. Não é código de produção.

const ICONES = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  seta: '<path d="M7 17L17 7M9 7h8v8"/>',
  direita: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  cadeado: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  email: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 6 8-6"/>',
  alerta: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  erro: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.7L16 9.6"/>',
  escudo: '<path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z"/>',
  raio: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5"/>',
  baixar: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
  github: '<path d="M9 19c-4 1.2-4-2-5.6-2.4M14.6 21v-3.2a2.8 2.8 0 0 0-.8-2.2c2.6-.3 5.4-1.3 5.4-5.8a4.5 4.5 0 0 0-1.2-3.1 4.2 4.2 0 0 0-.1-3.1s-1-.3-3.2 1.2a11 11 0 0 0-5.8 0C6.7 3.3 5.7 3.6 5.7 3.6a4.2 4.2 0 0 0-.1 3.1 4.5 4.5 0 0 0-1.2 3.1c0 4.5 2.8 5.5 5.4 5.8a2.8 2.8 0 0 0-.8 2.2V21"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  atualizar: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>',
  pacote: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  pix: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M8 12h8"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
};

function svg(nome, tamanho = 18) {
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONES[nome] || ""}</svg>`;
}

// <i data-i="check" data-t="16"></i> vira SVG
function montarIcones(raiz = document) {
  raiz.querySelectorAll("i[data-i]").forEach(el => {
    el.outerHTML = svg(el.dataset.i, Number(el.dataset.t) || 18);
  });
}

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function reais(centavos) { return fmtBRL.format(centavos / 100); }
function reaisCurto(centavos) { return String(Math.round(centavos / 100)); }

// ---------- Tema ----------
function aplicarTema(tema) {
  const raiz = document.documentElement;
  if (tema === "claro") raiz.dataset.theme = "light";
  else if (tema === "escuro") raiz.dataset.theme = "dark";
  else delete raiz.dataset.theme;
  try { localStorage.setItem("proto-tema", tema); } catch { /* sem storage */ }
}
function temaAtual() {
  try { return localStorage.getItem("proto-tema") || "sistema"; } catch { return "sistema"; }
}

// ---------- Estados ----------
// A barra lê data-estados="id:Rótulo,id2:Rótulo 2" e troca a classe .ativo nos blocos [data-estado~="id"].
let estadoAtual = "";
function irPara(estado, { gravar = true } = {}) {
  estadoAtual = estado;
  document.querySelectorAll("[data-estado]").forEach(el => {
    el.classList.toggle("ativo", el.dataset.estado.split(/\s+/).includes(estado));
  });
  document.querySelectorAll("[data-ir-estado]").forEach(b => {
    b.setAttribute("aria-pressed", String(b.dataset.irEstado === estado));
  });
  if (gravar) {
    const url = new URL(location.href);
    url.searchParams.set("estado", estado);
    history.replaceState(null, "", url);
  }
  document.dispatchEvent(new CustomEvent("estado", { detail: estado }));
}

function montarBarra() {
  const barra = document.querySelector(".proto-bar");
  if (!barra) return;
  const pares = (barra.dataset.estados || "").split(",").filter(Boolean).map(p => p.split(":"));
  const rotulo = document.createElement("strong");
  rotulo.textContent = "Protótipo, estado:";
  const botoes = pares.map(([id, nome]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.irEstado = id;
    b.textContent = nome;
    b.addEventListener("click", () => irPara(id));
    return b;
  });
  const sep = document.createElement("span");
  sep.className = "sep";
  const tema = document.createElement("button");
  tema.type = "button";
  const nomes = { sistema: "Tema: sistema", claro: "Tema: claro", escuro: "Tema: escuro" };
  const ordem = ["sistema", "claro", "escuro"];
  tema.textContent = nomes[temaAtual()];
  tema.addEventListener("click", () => {
    const prox = ordem[(ordem.indexOf(temaAtual()) + 1) % ordem.length];
    aplicarTema(prox);
    tema.textContent = nomes[prox];
  });
  const indice = document.createElement("a");
  indice.href = "index.html";
  indice.textContent = "Todas as telas";
  barra.replaceChildren(rotulo, ...botoes, sep, tema, indice);
  barra.setAttribute("aria-label", "Controles do protótipo");

  const pedido = new URL(location.href).searchParams.get("estado");
  const valido = pares.some(([id]) => id === pedido);
  irPara(valido ? pedido : (pares[0] ? pares[0][0] : ""), { gravar: false });
}

// ---------- Copiar ----------
function avisar(texto) {
  const aviso = document.getElementById("aviso");
  if (aviso) { aviso.textContent = ""; requestAnimationFrame(() => { aviso.textContent = texto; }); }
}
function copiarPorSelecao(alvo) {
  const faixa = document.createRange();
  faixa.selectNodeContents(alvo);
  const sel = getSelection();
  sel.removeAllRanges();
  sel.addRange(faixa);
  try { return document.execCommand("copy"); } catch { return false; }
}
async function copiar(botao) {
  const alvo = document.getElementById(botao.dataset.copy);
  if (!alvo) return;
  let ok = false;
  try { await navigator.clipboard.writeText(alvo.textContent); ok = true; } catch { ok = copiarPorSelecao(alvo); }
  botao.dataset.state = ok ? "ok" : "erro";
  botao.textContent = ok ? "Copiado" : "Use Ctrl+C";
  avisar(ok ? "Copiado para a área de transferência." : "Não deu para copiar sozinho. O texto ficou selecionado.");
  setTimeout(() => { delete botao.dataset.state; botao.textContent = "Copiar"; }, 2200);
}

// ---------- Entrada suave ----------
// Pode ser chamada de novo depois de renderizar conteúdo dinâmico.
function montarRevela() {
  const itens = document.querySelectorAll(".revela:not(.dentro):not([data-obs])");
  itens.forEach(i => { i.dataset.obs = ""; });
  if (!("IntersectionObserver" in window)) { itens.forEach(i => i.classList.add("dentro")); return; }
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add("dentro"); obs.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  itens.forEach((i, n) => { i.style.transitionDelay = `${Math.min(n % 6, 5) * 60}ms`; obs.observe(i); });
}

// ---------- Abas acessíveis (setas do teclado) ----------
function montarAbas() {
  document.querySelectorAll('[role="tablist"]').forEach(lista => {
    const abas = [...lista.querySelectorAll('[role="tab"]')];
    function selecionar(aba, focar) {
      abas.forEach(a => {
        const ativa = a === aba;
        a.setAttribute("aria-selected", String(ativa));
        a.tabIndex = ativa ? 0 : -1;
        document.getElementById(a.getAttribute("aria-controls")).hidden = !ativa;
      });
      if (focar) aba.focus();
      lista.dispatchEvent(new CustomEvent("aba", { detail: aba.dataset.valor }));
    }
    abas.forEach((a, i) => {
      a.addEventListener("click", () => selecionar(a, false));
      a.addEventListener("keydown", e => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { e.preventDefault(); selecionar(abas[(i + d + abas.length) % abas.length], true); }
      });
    });
  });
}

aplicarTema(temaAtual());
document.addEventListener("DOMContentLoaded", () => {
  montarIcones();
  montarBarra();
  montarAbas();
  montarRevela();
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copy]");
    if (b) copiar(b);
  });
});
