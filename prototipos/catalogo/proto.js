// Só do protótipo: estado pela URL (?estado=), tema, marcação dos dados do servidor e entradas suaves.
(() => {
  const params = new URLSearchParams(location.search);
  const estado = params.get("estado") || "normal";
  const raiz = document.documentElement;

  // ?limpo=1 esconde a barra do protótipo (para medir a dobra)
  if (params.has("limpo")) document.querySelector(".proto-barra")?.remove();

  // Tema
  const tema = params.get("tema");
  if (tema === "claro") raiz.dataset.theme = "light";
  if (tema === "escuro") raiz.dataset.theme = "dark";

  // Barra do protótipo: marca o estado atual e mantém o tema nos links
  document.querySelectorAll("[data-estado-link]").forEach((a) => {
    const alvo = a.getAttribute("data-estado-link");
    const u = new URL(a.href, location.href);
    u.searchParams.set("estado", alvo);
    if (tema) u.searchParams.set("tema", tema);
    a.href = u.pathname + u.search;
    if (alvo === estado) a.setAttribute("aria-current", "page");
  });
  document.querySelectorAll("[data-tema]").forEach((b) => {
    const alvo = b.getAttribute("data-tema");
    b.setAttribute("aria-pressed", String((tema || "sistema") === alvo));
    b.addEventListener("click", () => {
      const u = new URL(location.href);
      if (alvo === "sistema") u.searchParams.delete("tema"); else u.searchParams.set("tema", alvo);
      location.href = u.toString();
    });
  });
  const marcar = document.querySelector("[data-marcar-servidor]");
  if (marcar) {
    marcar.addEventListener("click", () => {
      const on = document.body.classList.toggle("marcar-servidor");
      marcar.setAttribute("aria-pressed", String(on));
    });
  }

  // Blocos por estado: data-mostrar="normal erro" aparece só nesses estados
  document.querySelectorAll("[data-mostrar]").forEach((el) => {
    el.hidden = !el.getAttribute("data-mostrar").split(" ").includes(estado);
  });

  // Erro ao carregar preço: a tela não inventa valor e bloqueia a compra
  if (estado === "erro") {
    document.querySelectorAll("[data-fonte='servidor'].preco").forEach((p) => {
      const s = document.createElement("span");
      s.className = "preco-indisp";
      s.textContent = "Preço indisponível";
      p.replaceWith(s);
    });
    document.querySelectorAll("[data-comprar]").forEach((b) => {
      b.setAttribute("aria-disabled", "true");
      b.removeAttribute("href");
      b.setAttribute("role", "link");
      b.setAttribute("aria-describedby", "motivo-erro");
      const t = b.querySelector("[data-texto]");
      if (t) t.textContent = "Compra indisponível";
    });
  }

  // Entradas suaves
  const revela = document.querySelectorAll(".revela");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((itens) => {
      itens.forEach((i) => { if (i.isIntersecting) { i.target.classList.add("dentro"); io.unobserve(i.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    revela.forEach((el) => io.observe(el));
  } else {
    revela.forEach((el) => el.classList.add("dentro"));
  }

  // Barra fixa de compra (celular): aparece quando o botão do painel e o CTA final estão fora da tela
  const barra = document.querySelector(".barra-compra");
  const alvos = [...document.querySelectorAll("[data-observa-compra]")];
  if (barra && alvos.length && "IntersectionObserver" in window) {
    // Mostra só depois que o botão do painel passou para cima da tela e enquanto o CTA final não aparece
    const atualizar = () => {
      const [painel, ...outros] = alvos.map((el) => el.getBoundingClientRect());
      const passou = painel.bottom < 0;
      const outroVisivel = outros.some((r) => r.top < innerHeight && r.bottom > 0);
      const mostrar = passou && !outroVisivel;
      barra.classList.toggle("visivel", mostrar);
      barra.toggleAttribute("inert", !mostrar);
      barra.setAttribute("aria-hidden", String(!mostrar));
    };
    const io = new IntersectionObserver(atualizar, { threshold: [0, 1] });
    alvos.forEach((a) => io.observe(a));
  }
})();
