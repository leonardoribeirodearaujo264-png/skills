// Bloco de oferta no fim das páginas. Preços, pacote do vídeo e links vêm de /api/loja/vitrine (banco);
// nada de preço fica escrito aqui. O mapa vídeo -> pacote está em src/lib/loja/paginas-videos.ts.
const CONFIG = {
  marca: "Leonardo Araujo",
  confianca: ["Pagamento único, sem mensalidade", "Acesso na hora, logo depois do pagamento"],
};

function preencherMarca() {
  document.querySelectorAll('[data-config="marca"]').forEach(el => { el.textContent = CONFIG.marca; });
  document.querySelectorAll('[data-config="ano"]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
}

// Cria um elemento com classe e texto (sempre textContent: nada vira HTML)
function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined && texto !== null) e.textContent = texto;
  return e;
}

function carregarEstiloOferta() {
  if (document.querySelector('link[data-estilo="oferta"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/assets/oferta.css";
  link.dataset.estilo = "oferta";
  document.head.append(link);
}

function cardPacote(p) {
  const card = el("div", "offer oferta-pacote");
  card.setAttribute("role", "group");
  card.setAttribute("aria-labelledby", "oferta-titulo");
  const titulo = el("h2", null, p.gancho);
  titulo.id = "oferta-titulo";
  const lista = el("ul", "oferta-confianca");
  lista.replaceChildren(...CONFIG.confianca.map(t => el("li", null, t)));
  const preco = el("p", "oferta-preco");
  preco.append(el("span", "oferta-preco-rotulo", "Por apenas"), el("span", "price", p.precoTexto));
  const cta = el("a", "cta", "Quero este pacote");
  cta.href = p.comprarUrl;
  card.append(el("span", "kicker", "PACOTE DO VÍDEO"), titulo, el("p", null, p.descricao), lista, preco, cta);
  return card;
}

function cardCombo(c, comoTitulo) {
  const card = el("div", "oferta-combo");
  card.setAttribute("role", "group");
  card.setAttribute("aria-labelledby", "combo-titulo");
  const titulo = el(comoTitulo ? "h2" : "h3", null, c.titulo);
  titulo.id = "combo-titulo";
  const lista = el("ul", "oferta-combo-itens");
  lista.replaceChildren(...c.itens.map(i => {
    const li = el("li");
    li.append(el("span", null, i.titulo), el("span", "oferta-combo-qtd", i.conteudo));
    return li;
  }));
  const precos = el("div", "oferta-combo-precos");
  if (c.somaTexto) {
    const de = el("s", "oferta-de");
    de.append(el("span", "sr-only", "de "), c.somaTexto);
    precos.append(de);
  }
  const por = el("span", "price");
  por.append(el("span", "sr-only", "por "), c.precoTexto);
  precos.append(por);
  const filhos = [el("span", "oferta-selo", "PACOTE COMPLETO"), titulo, el("p", "oferta-combo-desc", c.descricao), lista, precos];
  if (c.economiaTexto) filhos.push(el("p", "oferta-economia", "VOCÊ ECONOMIZA " + c.economiaTexto));
  const cta = el("a", "cta", "Quero o pacote completo");
  cta.href = c.comprarUrl;
  filhos.push(cta, el("p", "price-note", "Pagamento único. Acesso na hora, logo depois do pagamento."));
  card.append(...filhos);
  return card;
}

// Se a vitrine não responder, a página continua útil: um card simples leva à loja
function cardReserva() {
  const card = el("div", "offer");
  const titulo = el("h2", null, "Gostou? Os pacotes completos estão na loja.");
  titulo.id = "oferta-titulo";
  const cta = el("a", "cta", "Ver os pacotes");
  cta.href = "/loja/";
  card.append(el("span", "kicker", "PACOTES SKILLS + AGENTES"), titulo, cta);
  return card;
}

async function montarOferta() {
  const secao = document.querySelector("[data-oferta]");
  if (!secao) return;
  carregarEstiloOferta();
  const pagina = location.pathname.split("/").filter(Boolean)[0] || "";
  secao.classList.add("oferta-bloco");
  secao.setAttribute("aria-busy", "true");
  const carregando = el("p", "oferta-carregando", "Carregando a oferta");
  carregando.setAttribute("role", "status");
  secao.replaceChildren(carregando);
  try {
    const r = await fetch("/api/loja/vitrine?pagina=" + encodeURIComponent(pagina), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    const v = await r.json();
    if (!r.ok || !v.ok || (!v.pacote && !v.combo)) throw new Error("vitrine indisponível");
    const filhos = [];
    if (v.pacote) filhos.push(cardPacote(v.pacote));
    if (v.combo) filhos.push(cardCombo(v.combo, !v.pacote));
    secao.replaceChildren(...filhos);
  } catch {
    secao.replaceChildren(cardReserva());
  }
  secao.removeAttribute("aria-busy");
}

// Seleciona o texto e tenta o comando antigo de cópia (funciona fora de HTTPS)
function copiarPorSelecao(alvo) {
  const faixa = document.createRange();
  faixa.selectNodeContents(alvo);
  const selecao = getSelection();
  selecao.removeAllRanges();
  selecao.addRange(faixa);
  try { return document.execCommand("copy"); } catch { return false; }
}

async function copiar(botao) {
  const alvo = document.getElementById(botao.dataset.copy);
  const aviso = document.getElementById("aviso");
  let copiou = false;
  try {
    await navigator.clipboard.writeText(alvo.textContent);
    copiou = true;
  } catch {
    copiou = copiarPorSelecao(alvo);
  }
  if (copiou) {
    botao.dataset.state = "ok";
    botao.textContent = "Copiado";
    if (aviso) aviso.textContent = "Texto copiado.";
  } else {
    botao.dataset.state = "erro";
    botao.textContent = "Selecionado, use Ctrl+C";
    if (aviso) aviso.textContent = "Não foi possível copiar automaticamente. O texto foi selecionado.";
  }
  setTimeout(() => { delete botao.dataset.state; botao.textContent = "Copiar"; }, 2200);
}

preencherMarca();
montarOferta();
document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => copiar(b)));
