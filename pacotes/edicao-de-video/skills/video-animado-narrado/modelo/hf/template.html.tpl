<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Vídeo animado narrado</title>
<script src="node_modules/gsap/dist/gsap.min.js"></script>
<script src="mascote.js"></script>
<style>
/* Fontes: coloque arquivos .ttf de licença livre (OFL) em fonts/ e declare aqui com @font-face.
   Sem isso, o render usa a fonte do sistema. */
body { margin: 0; background: #14161f; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Arial Black", system-ui, sans-serif; background: #14161f; }
#fundo { position: absolute; inset: 0; background: #14161f; }
.cena { position: absolute; inset: 0; opacity: 0; }
.faixa { position: absolute; left: 70px; right: 70px; top: 150px; padding: 24px 20px; text-align: center; background: #f4efe3; color: #1d1a17;
  font-size: 66px; line-height: 1.05; box-shadow: 0 8px 18px rgba(0,0,0,.35); }
.cartao { position: absolute; background: #fff; color: #14161f; border: 6px solid #12131a; border-radius: 22px; box-shadow: 12px 12px 0 #12131a;
  padding: 28px 32px; font-size: 40px; }
#legenda { position: absolute; left: 40px; right: 40px; top: 1280px; height: 110px; }
#legenda .g { position: absolute; left: 0; right: 0; top: 0; text-align: center; white-space: nowrap; }
#legenda span { display: inline-block; margin: 0 10px; font-size: 64px; color: #fff; -webkit-text-stroke: 12px #12131a; paint-order: stroke fill; }
#legenda span.on { color: #ffd23f; }
#mascote { position: absolute; left: 300px; top: 1420px; width: 520px; height: 600px; transform: scale(.85); transform-origin: 50% 100%; }
</style>
</head>
<body>
<div id="root" data-composition-id="video" data-start="0" data-width="1080" data-height="1920" data-duration="__DURACAO__">
  <div id="fundo"></div>
  <div id="cenas"></div>
  <div id="legenda"></div>
  <div id="mascote"></div>
</div>
<script>
const FALAS = __FALAS__;
const PALAVRAS = __PALAVRAS__;
const CENAS = __CENAS__;
const DUR = __DURACAO__;
const tl = gsap.timeline({ paused: true });
const $ = (s) => document.querySelector(s);
const F = Object.fromEntries(FALAS.map((f) => [f.cena, f]));
const T = Object.fromEntries(CENAS.map((c) => [c.id, c.t]));
const FIM = Object.fromEntries(CENAS.map((c, i) => [c.id, i + 1 < CENAS.length ? CENAS[i + 1].t : DUR]));
const px = (n) => n + "px";

function el(tag, cls, pai, css = {}, html = "") {
  const e = document.createElement(tag); if (cls) e.className = cls; Object.assign(e.style, css); if (html) e.innerHTML = html; pai.appendChild(e); return e;
}
// Tempo da n-ésima palavra que começa com `termo` na fala da cena. Erro claro se a âncora não existir.
function tw(cena, termo, n = 1) {
  const f = F[cena]; let k = 0;
  for (const w of PALAVRAS) if (w.fala === f.i && w.texto.toLowerCase().replace(/[^\p{L}\d-]/gu, "").startsWith(termo.toLowerCase()) && ++k === n) return w.t;
  throw new Error(`palavra '${termo}' não achada na fala ${cena}`);
}
// Animações reutilizáveis. Tudo entra no timeline: o render quadro a quadro fica sempre igual.
const pop = (e, t, r = 0) => { gsap.set(e, { scale: 0, rotation: r - 12 }); tl.to(e, { scale: 1, rotation: r, duration: .38, ease: "back.out(2.4)" }, t); };
const sobe = (e, t) => { gsap.set(e, { y: 80, opacity: 0 }); tl.to(e, { y: 0, opacity: 1, duration: .35, ease: "power3.out" }, t); };
function digita(e, t, dur) {
  gsap.set(e, { clipPath: "inset(0 100% 0 0)" });
  tl.to(e, { clipPath: "inset(0 0% 0 0)", duration: dur, ease: `steps(${Math.max(4, e.textContent.length)})` }, t);
}
const CORES = { escuro: "#14161f", claro: "#eceff6" };
function cena(id, titulo) {
  const c = CENAS.find((x) => x.id === id);
  const d = el("div", "cena", $("#cenas"));
  if (titulo) { const f = el("div", "faixa", d, {}, titulo); pop(f, c.t + .05, -2); }
  tl.set(d, { opacity: 1 }, c.t); tl.set(d, { opacity: 0 }, FIM[id]);
  tl.set($("#fundo"), { backgroundColor: CORES[c.fundo] }, c.t);
  tl.fromTo(d, { scale: 1.04 }, { scale: 1, duration: .25, ease: "power2.out" }, c.t);
  return d;
}

// ---------- mascote: entra, respira, pisca e mexe a boca em cada palavra ----------
const m = criarMascote($("#mascote"));
gsap.set("#mascote svg", { y: 700 }); tl.to("#mascote svg", { y: 0, duration: .5, ease: "back.out(1.4)" }, .05);
m.piscar(tl, DUR);
m.fala(tl, PALAVRAS.map((w) => w.t));

// ---------- cenas: troque pelo seu roteiro (uma por fala ou por palavra-chave) ----------
{ const d = cena("c1", "EDITAR NA MÃO?");
  const linha = el("div", "cartao", d, { left: "110px", top: "520px", width: "860px", textAlign: "center" }, "timeline · keyframe · corte · legenda");
  sobe(linha, T.c1 + .3);
  tl.to(linha, { textDecoration: "line-through", color: "#c0392b", duration: .01 }, tw("abertura", "arrastando"));
  m.pose(tl, T.c1 + .4, "aponta"); }

{ const d = cena("c2", "SÓ PEDE");
  const pedido = el("div", "cartao", d, { left: "110px", top: "480px", width: "860px" }, "&gt; faz um Reels com legenda e gancho");
  digita(pedido, T.c2 + .2, .8);
  const pronto = el("div", "cartao", d, { left: "260px", top: "760px", background: "#3ddc84" }, "✓ vídeo pronto");
  pop(pronto, tw("virada", "pronto"));
  m.pose(tl, tw("virada", "pronto"), "joinha"); }

{ const d = cena("c3", "COMENTA VIDEO");
  const com = el("div", "cartao", d, { left: "110px", top: "520px", width: "860px" }, "Adicione um comentário: <b>VIDEO</b>");
  sobe(com, tw("cta", "comenta"));
  m.pose(tl, T.c3 + .2, "aceno"); }

// ---------- legenda: até 3 palavras por vez, a palavra falada fica amarela ----------
const grupos = []; let g = [];
PALAVRAS.forEach((w, i) => { g.push(w); if (/[.,?!:]$/.test(w.texto) || g.length === 3 || (PALAVRAS[i + 1] && PALAVRAS[i + 1].fala !== w.fala)) { grupos.push(g); g = []; } });
if (g.length) grupos.push(g);
grupos.forEach((gr, gi) => {
  const fimG = gi + 1 < grupos.length ? grupos[gi + 1][0].t : DUR;
  const box = el("div", "g", $("#legenda"), { opacity: 0 });
  const sp = gr.map((w) => el("span", "", box, {}, w.texto.replace(/[.,?!:]$/, "")));
  tl.set(box, { opacity: 1 }, gi === 0 ? 0 : gr[0].t); tl.set(box, { opacity: 0 }, fimG);
  gr.forEach((w, k) => { tl.set(sp[k], { attr: { class: "on" } }, w.t); if (k + 1 < gr.length) tl.set(sp[k], { attr: { class: "" } }, gr[k + 1].t); });
});

tl.to({}, { duration: DUR }, 0);
window.__timelines = window.__timelines || {};
window.__timelines["video"] = tl;
</script>
</body>
</html>
