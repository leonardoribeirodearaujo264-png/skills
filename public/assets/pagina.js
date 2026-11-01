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

// Logo depois do prompt: o card completo do pacote do vídeo (capa, título, preço e compra), igual ao do fim
// da página, com o link para a página do pacote. A pessoa acabou de ver o valor do prompt grátis.
function cardAposPrompt(p) {
  const passoDoPrompt = [...document.querySelectorAll("main .step")].find(s => s.querySelector(".code"));
  if (!passoDoPrompt) return;
  const card = cardPacote(p, "oferta-apos-prompt-titulo");
  card.classList.add("oferta-apos-prompt");
  const ver = el("a", "oferta-ver-pacote", "Ver o que vem no pacote");
  ver.href = "/pacotes/" + encodeURIComponent(p.slug) + "/";
  card.append(ver);
  passoDoPrompt.after(card);
}

// Páginas de venda: card pequeno do pacote logo abaixo do vídeo do topo (<div data-produto-topo>),
// com capa, nome, resumo, preço e compra. O card completo e o combo continuam no fim da página.
function cardTopo(p) {
  const alvo = document.querySelector("[data-produto-topo]");
  if (!alvo) return;
  const card = el("div", "produto-topo oferta-pacote");
  card.setAttribute("role", "group");
  card.setAttribute("aria-labelledby", "produto-topo-titulo");
  const titulo = el("h2", null, p.titulo);
  titulo.id = "produto-topo-titulo";
  const preco = el("p", "produto-topo-preco");
  preco.append(el("span", "oferta-preco-rotulo", "Pagamento único"), el("span", "price", p.precoTexto));
  const cta = el("a", "cta", "Quero este pacote");
  cta.href = p.comprarUrl;
  const mais = el("a", "produto-topo-mais", "Ver tudo o que vem");
  mais.href = "#vem";
  const filhos = [titulo, el("p", "produto-topo-desc", p.descricao), preco, cta, mais];
  if (p.capa) filhos.unshift(capa(p.capa, true));
  card.append(...filhos);
  alvo.replaceChildren(card);
}

// Barra fixa no celular com preço e botão. Some quando o card do pacote ou a chamada estão na tela,
// e o corpo ganha espaço embaixo para a barra não cobrir conteúdo nem o botão de copiar.
function barraFixa(p) {
  const barra = el("div", "barra-compra");
  barra.setAttribute("role", "region");
  barra.setAttribute("aria-label", "Comprar o pacote");
  const info = el("div", "barra-compra-info");
  info.append(el("span", "barra-compra-nome", p.titulo), el("span", "barra-compra-preco", p.precoTexto));
  const cta = el("a", "cta", "Quero este pacote");
  cta.href = p.comprarUrl;
  barra.append(info, cta);
  document.body.append(barra);
  document.body.classList.add("com-barra-compra");
  const alvos = document.querySelectorAll(".oferta-pacote");
  if (!("IntersectionObserver" in window) || !alvos.length) return;
  const visiveis = new Set();
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
    barra.classList.toggle("escondida", visiveis.size > 0);
  });
  alvos.forEach(a => obs.observe(a));
}

// idTitulo: o mesmo card aparece depois do prompt e no fim da página, cada um com o seu id
function cardPacote(p, idTitulo = "oferta-titulo") {
  const card = el("div", "offer oferta-pacote");
  card.setAttribute("role", "group");
  card.setAttribute("aria-labelledby", idTitulo);
  const titulo = el("h2", null, p.gancho);
  titulo.id = idTitulo;
  const lista = el("ul", "oferta-confianca");
  lista.replaceChildren(...CONFIG.confianca.map(t => el("li", null, t)));
  const preco = el("p", "oferta-preco");
  preco.append(el("span", "oferta-preco-rotulo", "Por apenas"), el("span", "price", p.precoTexto));
  const cta = el("a", "cta", "Quero este pacote");
  cta.href = p.comprarUrl;
  const filhos = [el("span", "kicker", "PACOTE DO VÍDEO"), titulo, el("p", null, p.descricao), lista, preco, cta];
  if (p.capa) filhos.unshift(capa(p.capa, false));
  card.append(...filhos);
  return card;
}

// Pague 2, leve 3: abre a loja com o pacote do vídeo marcado para escolher os outros
function cardLeve(l) {
  const card = el("div", "oferta-leve");
  card.setAttribute("role", "group");
  card.setAttribute("aria-labelledby", "leve-titulo");
  const titulo = el("h3", null, "Leve " + l.qtd + " pacotes por " + l.precoTexto);
  titulo.id = "leve-titulo";
  const precos = el("div", "oferta-combo-precos");
  precos.append(el("span", "price", l.precoTexto));
  const cta = el("a", "cta", "Escolher meus " + l.qtd + " pacotes");
  cta.href = l.escolherUrl;
  const outros = l.qtd - 1;
  const desc = l.comPacote
    ? "O pacote deste vídeo já vem marcado. Escolha os outros " + (outros === 2 ? "dois" : outros) + " na loja."
    : l.descricao;
  const filhos = [el("span", "oferta-selo", l.titulo.toUpperCase()), titulo, el("p", "oferta-leve-desc", desc), precos];
  // Comparação com os preços reais de cada pacote, sem preço riscado
  if (l.referenciaTexto && l.economiaTexto) {
    filhos.push(el("p", "oferta-comparacao", "Separados, os " + l.qtd + " sairiam " + l.referenciaTexto + ". Você economiza " + l.economiaTexto + "."));
  }
  filhos.push(cta);
  card.append(...filhos);
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
    const nome = el("span", "oferta-combo-nome");
    if (i.mini) {
      // Miniatura decorativa: o nome do pacote vem logo ao lado
      const img = document.createElement("img");
      Object.assign(img, { src: i.mini, alt: "", width: 240, height: 160, loading: "lazy", decoding: "async" });
      img.className = "oferta-combo-mini";
      nome.append(img);
    }
    nome.append(i.titulo);
    li.append(nome, el("span", "oferta-combo-qtd", i.conteudo));
    return li;
  }));
  const precos = el("div", "oferta-combo-precos");
  precos.append(el("span", "price", c.precoTexto));
  const filhos = [el("span", "oferta-selo", "PACOTE COMPLETO"), titulo, el("p", "oferta-combo-desc", c.descricao), lista, precos];
  if (c.somaTexto && c.economiaTexto) {
    filhos.push(el("p", "oferta-comparacao", "Separados, sairiam " + c.somaTexto + ". Você economiza " + c.economiaTexto + "."));
  }
  const cta = el("a", "cta", "Quero o pacote completo");
  cta.href = c.comprarUrl;
  filhos.push(cta, el("p", "price-note", "Pagamento único. Acesso na hora, logo depois do pagamento."));
  if (c.capa) filhos.unshift(capa(c.capa, false));
  card.append(...filhos);
  return card;
}

// ---------- Catálogo da página inicial (todos os pacotes à venda) ----------

const SVG = "http://www.w3.org/2000/svg";
// Ícones de traço iguais aos da loja (src/components/Icone.tsx)
const ICONES = {
  seta: ["M7 17L17 7M9 7h8v8"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  erro: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M9 9l6 6M15 9l-6 6"],
};

function icone(nome, tamanho) {
  const s = document.createElementNS(SVG, "svg");
  for (const [k, v] of Object.entries({ width: tamanho, height: tamanho, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" })) {
    s.setAttribute(k, String(v));
  }
  ICONES[nome].forEach(d => {
    const p = document.createElementNS(SVG, "path");
    p.setAttribute("d", d);
    s.append(p);
  });
  return s;
}

// Capa 3:2 em WebP com PNG de reserva; só o destaque carrega de imediato
function capa(c, imediata) {
  const pic = el("picture", "capa-img");
  if (!c) return pic;
  const src = document.createElement("source");
  src.srcset = c.webp;
  src.type = "image/webp";
  const img = document.createElement("img");
  Object.assign(img, { src: c.png, alt: c.alt, width: 1200, height: 800, decoding: "async", loading: imediata ? "eager" : "lazy" });
  pic.append(src, img);
  return pic;
}

function botaoComprar(href, texto, pequeno, nome) {
  const a = el("a", pequeno ? "btn sm" : "btn", texto);
  a.href = href;
  // Vários "Comprar" na mesma página: o leitor de tela ouve qual pacote
  a.setAttribute("aria-label", texto + ": " + nome);
  if (!pequeno) {
    const ico = el("span", "ico");
    ico.setAttribute("aria-hidden", "true");
    ico.append(icone("seta", 16));
    a.append(ico);
  }
  return a;
}

function titulo3(texto, href, id) {
  const h = el("h3");
  h.id = id;
  const a = el("a", null, texto);
  a.href = href;
  h.append(a);
  return h;
}

function cartaoCatalogo(p, tipo) {
  const li = el("li", tipo === "destaque" ? "largo" : null);
  const art = el("article", "cat-card" + (tipo === "destaque" ? " destaque" : ""));
  art.setAttribute("aria-labelledby", "cat-" + p.slug);
  const corpo = el("div", "cat-corpo");
  if (tipo === "destaque") corpo.append(el("span", "cat-marcador", "Pacote principal"));
  corpo.append(titulo3(p.titulo, p.paginaUrl, "cat-" + p.slug), el("p", "cat-resumo", p.resumo));
  if (tipo === "destaque" && p.numeros.length) {
    const nums = el("ul", "cat-numeros");
    nums.setAttribute("aria-label", "O que vem");
    nums.replaceChildren(...p.numeros.map(x => {
      const item = el("li");
      item.append(el("b", null, String(x.n)), " " + x.rotulo);
      return item;
    }));
    corpo.append(nums);
  }
  const rodape = el("div", "cat-rodape");
  const preco = el("div");
  if (tipo === "destaque") preco.append(el("span", "cat-preco-rotulo", "Pacote avulso"));
  preco.append(el("span", "cat-preco", p.precoTexto));
  rodape.append(preco, botaoComprar(p.comprarUrl, "Comprar", tipo !== "destaque", p.titulo));
  if (tipo === "destaque") {
    const lado = el("div", "cat-lado");
    lado.append(corpo, rodape);
    art.append(capa(p.capa, true), lado);
  } else {
    art.append(capa(p.capa, false), corpo, rodape);
  }
  li.append(art);
  return li;
}

function cartaoComboCatalogo(c) {
  const li = el("li", "largo");
  const art = el("article", "cat-card combo");
  art.setAttribute("aria-labelledby", "cat-combo");
  const corpo = el("div", "cat-corpo");
  const h = el("h3", null, c.titulo);
  h.id = "cat-combo";
  const itens = el("ul", "cat-combo-itens");
  itens.replaceChildren(...c.itens.map(t => {
    const item = el("li");
    item.append(icone("check", 16), t);
    return item;
  }));
  corpo.append(h, el("p", "cat-resumo", c.resumo), itens);
  const rodape = el("div", "cat-rodape");
  const preco = el("div");
  preco.append(el("span", "cat-preco-rotulo", "Os " + c.itens.length + " pacotes"), el("span", "cat-preco", c.precoTexto));
  rodape.append(preco, botaoComprar(c.comprarUrl, "Comprar o completo", false, c.titulo));
  const lado = el("div", "cat-lado");
  lado.append(corpo, rodape);
  art.append(capa(c.capa, false), lado);
  li.append(art);
  return li;
}

function topoCatalogo() {
  const topo = el("header", "cat-topo");
  const h = el("h2", null, "Skills e agentes prontos para instalar");
  h.id = "cat-titulo";
  topo.append(el("span", "badge", "pacotes pagos"), h, el("p", null, "Para Claude Code e Codex, com instalador e guia em português."));
  return topo;
}

function montarCatalogo(secao, c) {
  const lista = el("ul", "cat-lista");
  const itens = [];
  if (c.destaque) itens.push(cartaoCatalogo(c.destaque, "destaque"));
  c.pacotes.forEach(p => itens.push(cartaoCatalogo(p, "padrao")));
  if (c.combo) itens.push(cartaoComboCatalogo(c.combo));
  if (!itens.length) {
    const vazio = el("div", "cat-vazio");
    vazio.append(el("h3", null, "Os pacotes voltam em breve"), el("p", null, "Enquanto isso, os prompts grátis dos vídeos continuam logo acima."));
    secao.replaceChildren(topoCatalogo(), vazio);
    return;
  }
  lista.replaceChildren(...itens);
  const nota = el("p", "cat-nota", "Quer escolher três? ");
  const loja = el("a", null, "Monte o seu pedido na loja");
  loja.href = "/loja/";
  nota.append(loja, ".");
  secao.replaceChildren(topoCatalogo(), lista, nota);
}

function catalogoCarregando(secao) {
  const status = el("span", "sr-only", "Carregando os pacotes");
  status.setAttribute("role", "status");
  const lista = el("ul", "cat-lista");
  lista.setAttribute("aria-hidden", "true");
  lista.replaceChildren(...[0, 1, 2].map(i => {
    const li = el("li", i === 0 ? "largo" : null);
    const card = el("div", "cat-card");
    card.append(el("span", "cat-skel capa"), el("span", "cat-skel linha"), el("span", "cat-skel linha curta"));
    li.append(card);
    return li;
  }));
  secao.replaceChildren(topoCatalogo(), status, lista);
}

// Preço não carregou: não mostra valor inventado nem botão de compra, só o motivo e como tentar de novo
function catalogoErro(secao) {
  const alerta = el("div", "cat-alerta");
  alerta.setAttribute("role", "alert");
  alerta.append(icone("erro", 18));
  const texto = el("div");
  const tentar = el("button", "btn sm", "Tentar de novo");
  tentar.type = "button";
  tentar.addEventListener("click", () => {
    // O botão some ao recarregar: o foco fica na seção, não no começo da página
    secao.tabIndex = -1;
    secao.focus();
    montarOferta();
  });
  const loja = el("a", null, "abrir a loja");
  loja.href = "/loja/";
  const p = el("p", null, "Nada foi cobrado. Tente de novo ou ");
  p.append(loja, ".");
  texto.append(el("strong", null, "Não conseguimos carregar os pacotes agora."), p, tentar);
  alerta.append(texto);
  secao.replaceChildren(topoCatalogo(), alerta);
}

function carregarEstiloCatalogo() {
  if (document.querySelector('link[data-estilo="catalogo"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/assets/catalogo.css";
  link.dataset.estilo = "catalogo";
  document.head.append(link);
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
  const pagina = location.pathname.split("/").filter(Boolean)[0] || "";
  // A página inicial mostra o catálogo inteiro; as dos vídeos, o pacote do vídeo e o combo
  const inicial = pagina === "";
  secao.setAttribute("aria-busy", "true");
  if (inicial) {
    carregarEstiloCatalogo();
    secao.classList.add("catalogo");
    secao.setAttribute("aria-labelledby", "cat-titulo");
    catalogoCarregando(secao);
  } else {
    carregarEstiloOferta();
    secao.classList.add("oferta-bloco");
    const carregando = el("p", "oferta-carregando", "Carregando a oferta");
    carregando.setAttribute("role", "status");
    secao.replaceChildren(carregando);
  }
  try {
    const r = await fetch("/api/loja/vitrine?pagina=" + encodeURIComponent(pagina), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    const v = await r.json();
    if (inicial) {
      if (!r.ok || !v.ok || !v.catalogo) throw new Error("catálogo indisponível");
      montarCatalogo(secao, v.catalogo);
      secao.removeAttribute("aria-busy");
      return;
    }
    if (!r.ok || !v.ok || (!v.pacote && !v.combo)) throw new Error("vitrine indisponível");
    // Ordem pedida pelo dono: o combo primeiro, depois o pacote do vídeo e o leve 3
    const filhos = [];
    if (v.combo) filhos.push(cardCombo(v.combo, true));
    if (v.pacote) filhos.push(cardPacote(v.pacote));
    if (v.leve) filhos.push(cardLeve(v.leve));
    secao.replaceChildren(...filhos);
    if (v.pacote) {
      cardTopo(v.pacote);
      cardAposPrompt(v.pacote);
      barraFixa(v.pacote);
    }
  } catch {
    if (inicial) catalogoErro(secao);
    else secao.replaceChildren(cardReserva());
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
