// Mascote em SVG (robô de cabeça quadrada) com poses e boca que mexe em cada palavra.
// Troque cores e formas à vontade, ou desenhe o seu personagem no mesmo esquema:
// braços em grupos que giram no ombro, mãos por pose, boca aberta e fechada.
// API: criarMascote(pai) -> { pose(tl, t, nome), fala(tl, tempos), piscar(tl, duracao) }
(function () {
  const C = { corpo: "#ff7a3d", sombra: "#d65a22", tela: "#14161f", olho: "#7df9ff", contorno: "#12131a" };
  const SW = 7;
  // ângulo de cada braço (0 = caído, positivo gira no sentido horário) e a mão que aparece
  const POSES = {
    parado: { E: [14, "nada"], D: [-14, "nada"] },
    aponta: { E: [140, "dedo"], D: [-14, "nada"] },
    joinha: { E: [14, "nada"], D: [-135, "polegar"] },
    aceno: { E: [14, "nada"], D: [-140, "palma"] },
  };
  const MAOS = {
    nada: "",
    dedo: `<circle r="22" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="${SW}"/><rect x="-7" y="-62" width="14" height="44" rx="7" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="${SW}" transform="rotate(-40)"/>`,
    polegar: `<rect x="-26" y="-20" width="52" height="44" rx="14" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="${SW}"/><rect x="-30" y="-60" width="18" height="44" rx="9" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="${SW}"/>`,
    palma: `<rect x="-28" y="-26" width="56" height="52" rx="18" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="${SW}"/>${[-21, -7, 7, 21].map((x) => `<rect x="${x - 6}" y="-62" width="12" height="40" rx="6" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="5"/>`).join("")}`,
  };
  const OMBRO = { E: [110, 330], D: [290, 330] };

  function braco(lado) {
    const [x, y] = OMBRO[lado];
    const maos = Object.entries(POSES)
      .filter(([, p]) => p[lado][1] !== "nada")
      .map(([nome, p]) => `<g class="mao mao-${nome}" opacity="0" transform="translate(0,170) rotate(${-p[lado][0]})">${MAOS[p[lado][1]]}</g>`)
      .join("");
    return `<g transform="translate(${x},${y})"><g class="braco-${lado}" transform="rotate(${POSES.parado[lado][0]})">
      <rect x="-24" y="0" width="48" height="160" rx="22" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="${SW}"/>${maos}</g></g>`;
  }

  window.criarMascote = function (pai) {
    const box = document.createElement("div");
    box.innerHTML = `<svg viewBox="-60 -20 520 600" width="520" height="600" overflow="visible">
      <g class="corpo">
        <rect x="100" y="300" width="200" height="230" rx="40" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="${SW}"/>
        <rect x="250" y="310" width="40" height="210" rx="18" fill="${C.sombra}" opacity=".5"/>
        ${braco("E")}${braco("D")}
        <rect x="190" y="250" width="20" height="60" fill="${C.sombra}" stroke="${C.contorno}" stroke-width="${SW}"/>
        <rect x="70" y="20" width="260" height="240" rx="48" fill="${C.corpo}" stroke="${C.contorno}" stroke-width="${SW}"/>
        <rect x="100" y="60" width="200" height="150" rx="30" fill="${C.tela}" stroke="${C.contorno}" stroke-width="${SW}"/>
        <g class="olhos"><rect x="140" y="95" width="30" height="42" rx="12" fill="${C.olho}"/><rect x="230" y="95" width="30" height="42" rx="12" fill="${C.olho}"/></g>
        <path class="boca-fechada" d="M165 170 Q200 192 235 170" stroke="${C.olho}" stroke-width="9" fill="none" stroke-linecap="round"/>
        <ellipse class="boca-aberta" cx="200" cy="178" rx="26" ry="18" fill="${C.olho}" opacity="0"/>
        <rect x="190" y="-10" width="20" height="34" rx="8" fill="${C.contorno}"/><circle cx="200" cy="-16" r="16" fill="${C.olho}" stroke="${C.contorno}" stroke-width="6"/>
      </g></svg>`;
    pai.appendChild(box);
    const q = (s) => box.querySelectorAll(s);
    let atual = "parado";
    return {
      pose(tl, t, nome, dur = 0.35) { // chame em ordem de tempo: a pose anterior some quando a nova entra
        const p = POSES[nome];
        for (const lado of ["E", "D"]) {
          tl.to(q(`.braco-${lado}`)[0], { attr: { transform: `rotate(${p[lado][0]})` }, duration: dur, ease: "back.out(1.6)" }, t);
          q(`.braco-${lado} .mao-${atual}`).forEach((m) => tl.set(m, { opacity: 0 }, t + dur * 0.4));
          q(`.braco-${lado} .mao-${nome}`).forEach((m) => tl.set(m, { opacity: 1 }, t + dur * 0.4));
        }
        atual = nome;
      },
      fala(tl, tempos) { // boca abre um instante em cada palavra
        const f = q(".boca-fechada")[0], a = q(".boca-aberta")[0];
        for (const t of tempos) {
          tl.set(a, { opacity: 1 }, t); tl.set(f, { opacity: 0 }, t);
          tl.set(a, { opacity: 0 }, t + 0.13); tl.set(f, { opacity: 1 }, t + 0.13);
        }
      },
      piscar(tl, duracao) {
        const o = q(".olhos")[0];
        for (let t = 1.7; t < duracao; t += 3.1) {
          tl.to(o, { scaleY: 0.1, transformOrigin: "50% 50%", duration: 0.06 }, t);
          tl.to(o, { scaleY: 1, duration: 0.08 }, t + 0.1);
        }
      },
    };
  };
})();
