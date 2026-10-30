// O botão da oferta leva para a loja. Preços ficam só na loja (vêm do banco), nunca aqui.
const CONFIG = {
  marca: "Leonardo Araujo",
  preco: null,
  precoNota: "Pagamento único. Acesso liberado logo após a compra.",
  checkoutUrl: "/loja/",
  ctaTexto: "Ver os pacotes",
  itens: [
    "Os 13 agentes da empresa, já configurados",
    "Skills de design, página de vendas, anúncios e vídeo",
    "Prompt pronto em português para cada skill",
  ],
};

function preencherMarca() {
  document.querySelectorAll('[data-config="marca"]').forEach(el => { el.textContent = CONFIG.marca; });
  document.querySelectorAll('[data-config="ano"]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
}

// Monta o bloco de oferta dentro de <section data-oferta>, igual em todas as páginas
function montarOferta() {
  const secao = document.querySelector("[data-oferta]");
  if (!secao) return;

  const kicker = document.createElement("span");
  kicker.className = "kicker";
  kicker.textContent = "PACOTE SKILLS + AGENTES";

  const titulo = document.createElement("h2");
  titulo.id = "oferta-titulo";
  titulo.textContent = secao.dataset.titulo || "Gostou? O pacote traz o resto pronto.";
  secao.setAttribute("aria-labelledby", titulo.id);

  const texto = document.createElement("p");
  texto.textContent = "Skills e agentes prontos para o Claude Code, explicados em português, cada um com o prompt para copiar e colar.";

  const lista = document.createElement("ul");
  lista.replaceChildren(...CONFIG.itens.map(item => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));

  const filhos = [kicker, titulo, texto, lista];
  if (CONFIG.preco) {
    const preco = document.createElement("p");
    preco.className = "price";
    preco.textContent = CONFIG.preco;
    const nota = document.createElement("p");
    nota.className = "price-note";
    nota.textContent = CONFIG.precoNota;
    filhos.push(preco, nota);
  }

  const cta = document.createElement("a");
  cta.className = "cta";
  if (CONFIG.checkoutUrl) {
    cta.href = CONFIG.checkoutUrl;
    cta.textContent = CONFIG.ctaTexto;
  } else {
    cta.textContent = "Em breve";
    cta.setAttribute("aria-disabled", "true");
  }
  filhos.push(cta);

  secao.classList.add("offer");
  secao.replaceChildren(...filhos);
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
