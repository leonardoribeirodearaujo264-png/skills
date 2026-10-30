// DADOS DE EXEMPLO. Na implementação tudo isto vem do servidor (loja_produtos, loja_ofertas,
// loja_oferta_itens, loja_acessos). A tela só exibe: preço, composição e economia são
// calculados e validados no backend. Valores em centavos.
const DADOS_SERVIDOR = Object.freeze({
  fonte: "servidor (exemplo)",
  produtos: [
    {
      slug: "design-copy-anuncios",
      titulo: "Design, copy, anúncios e velocidade",
      resumo: "Página com cara de produto, texto que vende, anúncio pronto para subir e site rápido no celular.",
      itens: ["Design premium e revisão visual da tela", "Copy de página de vendas e de anúncio", "Velocidade medida antes e depois"],
      skills: 6, prompts: 8, aula: "0:58",
    },
    {
      slug: "edicao-de-video",
      titulo: "Edição de vídeo por skills",
      resumo: "Do roteiro ao vídeo renderizado, com legenda e corte, sem abrir editor.",
      itens: ["Vídeo programático com HyperFrames", "Legenda, corte e trilha por prompt", "Render local em pasta que você escolhe"],
      skills: 5, prompts: 7, aula: "1:00",
    },
    {
      slug: "motion-mockup-fontes",
      titulo: "Motion, mockup e fontes",
      resumo: "Animação de interface, mockup de aparelho e pares de fonte que combinam.",
      itens: ["Motion com curvas e tempos certos", "Mockup de celular e notebook para anúncio", "Pares de fonte prontos do Google Fonts"],
      skills: 4, prompts: 6, aula: "0:52",
    },
    {
      slug: "programacao-sem-codigo",
      titulo: "Programação para quem não programa",
      resumo: "Peça em português e receba o projeto planejado, testado e revisado.",
      itens: ["Briefing que vira plano de execução", "Caçador de bugs e validador de build", "Revisão de segurança antes de publicar"],
      skills: 7, prompts: 9, aula: "0:59",
    },
    {
      slug: "times-de-agentes",
      titulo: "Times de agentes por área",
      resumo: "Equipes de agentes para marketing, vendas, finanças, qualidade e suporte, com você no comando.",
      itens: ["13 agentes com gerente geral", "Conselho de 4 Claudes para testar ideias", "Banca de revisão com três olhares"],
      skills: 5, prompts: 4, aula: "0:57",
    },
  ],
  ofertas: [
    { id: "avulso", titulo: "Avulso", descricao: "1 produto à sua escolha", modo: "escolha", quantidade: 1, precoCentavos: 3700, referenciaCentavos: 3700 },
    { id: "leve3", titulo: "Pague 2, leve 3", descricao: "3 produtos à sua escolha", modo: "escolha", quantidade: 3, precoCentavos: 6700, referenciaCentavos: 11100, selo: "Mais escolhida" },
    { id: "video", titulo: "Pacote de vídeo", descricao: "4 produtos para quem cria vídeo", modo: "fixo", itens: ["edicao-de-video", "motion-mockup-fontes", "design-copy-anuncios", "programacao-sem-codigo"], precoCentavos: 9700, referenciaCentavos: 14800 },
    { id: "combo", titulo: "Combo completo", descricao: "Os 5 produtos", modo: "todos", precoCentavos: 12700, referenciaCentavos: 18500, selo: "Melhor valor" },
  ],
});

function produtoPorSlug(slug) {
  return DADOS_SERVIDOR.produtos.find(p => p.slug === slug);
}
