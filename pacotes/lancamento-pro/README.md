# Lançamento Pro

Depois de instalar, você pede em português e o Claude Code ou o Codex pesquisa o seu público, monta a oferta, escreve a página, os e-mails, os anúncios e os roteiros, planeja as peças para redes, prepara as respostas do atendimento e lê os números do lançamento. Tudo sai como rascunho para você aprovar: nenhum agente publica, envia, sobe campanha ou gasta verba sozinho.

## O que vem no pacote

- **15 agentes autorais**, para Claude Code e Codex, divididos em estratégia, copy, tráfego, páginas e design, e vendas e pós-venda.
- **50 skills autorais**, cada uma com passo a passo, formato de saída e erros comuns. Os agentes usam essas skills, e você também pode chamar qualquer uma direto.
- **8 prompts prontos** para as etapas de um lançamento.
- **Instaladores** para Windows, Mac e Linux.

Não há skill nem plugin de terceiros. Tudo o que o pacote usa já está dentro dele.

## Instalação no Claude Code

Você precisa do Node.js 22 ou mais novo, porque o instalador confere se ele existe antes de começar. Baixe e descompacte o pacote, abra o terminal dentro da pasta e rode:

Windows (PowerShell):

```text
powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
```

Mac ou Linux:

```text
bash instalar-claude.sh
```

O instalador copia as 50 skills para `~/.claude/skills` e os 15 agentes para `~/.claude/agents`. Ele não baixa nada da internet. Feche e abra o Claude Code de novo para ele carregar tudo.

## Instalação no Codex

O Codex lê skills de outra pasta: `~/.agents/skills`. Ele não enxerga `~/.claude/skills`, então rode o instalador do Codex mesmo que já tenha instalado no Claude Code.

Windows (PowerShell):

```text
powershell -ExecutionPolicy Bypass -File .\instalar-codex.ps1
```

Mac ou Linux:

```text
bash instalar-codex.sh
```

O instalador copia as skills para `~/.agents/skills` e os agentes para `~/.codex/agents`, um arquivo `.toml` por agente. Abra o Codex de novo depois de instalar.

## Como usar

O pacote não tem um agente líder: você escolhe os especialistas da etapa e a ordem, e cada um parte da entrega do anterior. Os prompts prontos já trazem a ordem certa para cada etapa.

- **No Claude Code:** escreva "Use o agente estrategista-de-oferta para..." e descreva o produto, o público e o que você já tem. Para encadear, liste os agentes na ordem, como no prompt `01-oferta-e-pagina.md`.
- **No Codex:** cite o agente pelo nome no pedido, por exemplo "Chame o agente copywriter-emails para...". O Codex só usa um agente quando ele é citado.
- **Skill direto:** para uma tarefa pequena, peça a skill pelo nome. Exemplo: "Use a skill calcular-cpa-maximo com estes números".
- **Antes de publicar:** passe qualquer peça pelo revisor-de-promessas.

Depoimentos, números, preços e prazos entram só se você fornecer. Onde faltar, o time deixa o espaço marcado, como `[DEPOIMENTO REAL]` ou `[NÚMERO REAL]`. Em saúde, direito e finanças, os agentes avisam quando um trecho pode ferir regra do conselho profissional.

## Agentes

### Estratégia

- **pesquisador-de-mercado:** levanta dores, desejos, objeções e frases reais do público antes de qualquer texto.
- **analista-de-concorrentes:** compara páginas, ofertas e anúncios de concorrentes e aponta onde você pode se diferenciar.
- **estrategista-de-oferta:** monta ângulo, entregáveis, bônus, garantia, preço, order bump e jornada até a compra.

### Copy

- **copywriter-pagina-vendas:** escreve o texto completo da página de vendas ou de captura, da headline ao FAQ.
- **copywriter-emails:** escreve as sequências de boas-vindas, lançamento, última chance, pós-venda e reembolso, com cronograma.
- **roteirista-video-curto:** roteiriza Reels, Shorts, TikTok e VSL curta com gancho, texto na tela, capa e legenda.
- **revisor-de-promessas:** barra promessa enganosa, número sem fonte, depoimento inventado e urgência falsa antes de publicar.

### Tráfego

- **gestor-anuncios-meta:** planeja campanhas, públicos, orçamento e testes no Meta Ads e lê relatórios exportados.
- **gestor-anuncios-google:** planeja campanhas de pesquisa no Google Ads, palavras-chave e anúncios de texto.
- **analista-metricas:** lê os números de anúncios, página, e-mail e checkout e mostra onde o funil perde gente.

### Páginas e design

- **web-designer-landing:** transforma o texto aprovado em layout responsivo, com paleta, tipografia e HTML e CSS.
- **designer-pecas-redes:** planeja posts, carrosséis, capas de Reels e artes de anúncio com o texto de cada tela.
- **criador-criativos:** cria conceitos de anúncio com texto, roteiro e direção de imagem em variações para teste A/B.

### Vendas e pós-venda

- **atendente-dm-comentarios:** escreve rascunhos de resposta para comentários e mensagens diretas, de dúvidas a objeções de preço.
- **recuperador-carrinho:** escreve as mensagens para quem abandonou o checkout, teve o cartão recusado ou não pagou o boleto ou o Pix.

## Skills

### Pesquisa e oferta

- **mapear-dores:** organiza as dores do público em camadas e prioriza as que mais pesam na compra.
- **extrair-linguagem-depoimentos:** tira de depoimentos e comentários as frases exatas que o cliente usa.
- **levantar-objecoes:** lista os motivos para não comprar, com resposta, prova e lugar de cada uma.
- **mapear-jornada-cliente:** desenha as etapas do cliente, do primeiro contato à indicação, e onde ele abandona.
- **analisar-pagina-concorrente:** estuda a estrutura e os argumentos de uma página concorrente sem copiar o texto.
- **definir-angulo-venda:** gera de três a cinco ângulos de venda, compara e escolhe um com justificativa.
- **montar-stack-bonus:** monta produto e bônus, cada um ligado à objeção que resolve, e corta o que só faz volume.
- **definir-garantia:** escolhe tipo, prazo e condições da garantia e escreve o texto respeitando os 7 dias do CDC.
- **calcular-preco-bump:** calcula a faixa de preço do order bump com a conta de cada passo.
- **validar-promessa:** exige prova ou mecanismo para cada promessa e reprova ou reescreve o que não tiver.

### Copy e roteiros

- **criar-10-angulos-dor:** cria 10 ângulos de dor com cena, frase do cliente e gancho de abertura.
- **escrever-headline:** escreve opções de headline com o motivo de cada uma e a recomendada.
- **escrever-subtitulo:** escreve o subtítulo que completa a headline com o que é, para quem e como funciona.
- **escrever-beneficios:** transforma características em benefícios concretos ligados ao recurso que os comprova.
- **escrever-cta:** escreve o texto do botão e o microtexto para cada ponto da página.
- **escrever-faq-objecoes:** transforma a lista de objeções em perguntas frequentes respondidas com fatos do produto.
- **reescrever-clareza:** reescreve texto confuso ou longo para ser entendido na primeira leitura.
- **adaptar-tom-voz:** ajusta um texto pronto à voz da marca, mantendo sentido e fatos.
- **escrever-script-vsl:** escreve o roteiro da VSL em blocos com tempo, fala e o que aparece na tela.
- **escrever-legenda-reels:** escreve a legenda de vídeo curto com gancho, corpo e CTA.

### E-mail e funil

- **sequencia-boas-vindas:** escreve de 3 a 5 e-mails para quem acabou de entrar na lista.
- **sequencia-lancamento:** escreve os e-mails do aquecimento à abertura e ao fechamento do carrinho.
- **sequencia-pos-venda:** escreve os e-mails do acesso ao primeiro resultado, ao depoimento e à próxima oferta.
- **email-ultima-chance:** escreve o aviso final antes de um prazo real e recusa quando o prazo não existe.
- **email-carrinho-abandonado:** escreve de 1 a 3 e-mails para quem começou a compra e não concluiu.
- **email-reembolso:** escreve a resposta a pedido de reembolso sem criar obstáculo.
- **assunto-alta-abertura:** gera assuntos e pré-cabeçalhos e elimina os que prometem demais ou parecem spam.
- **testar-assuntos:** desenha o teste A/B de assuntos com divisão da lista e critério de vitória.
- **segmentar-lista:** define os segmentos da lista com regra de entrada, de saída e o que cada um recebe.
- **cronograma-envios:** monta o calendário de envios sem sobreposição e com limite por contato.

### Tráfego e métricas

- **estrutura-campanha-meta:** desenha campanha, conjuntos e anúncios no Meta Ads com nomes, públicos e exclusões.
- **publicos-semelhantes:** planeja públicos semelhantes e de remarketing a partir das listas que você tem.
- **campanha-busca-google:** planeja a campanha de pesquisa no Google com grupos por intenção e negativas.
- **calcular-cpa-maximo:** calcula até quanto pagar por venda ou por lead, com a conta passo a passo.
- **calcular-roas-minimo:** calcula o ROAS de equilíbrio e o mínimo para o lucro que você quer.
- **montar-utms:** define o padrão de UTMs e gera as URLs rastreadas prontas para colar.
- **ler-relatorio-anuncios:** recalcula as métricas de um relatório e aponta onde o resultado se perde.
- **sugerir-pausa-conjunto:** classifica cada conjunto em manter, observar ou candidato a pausa com critério objetivo.
- **matriz-teste-ab:** monta o teste A/B com hipótese, uma variável por vez e critério de vitória definido antes.
- **briefing-criativo:** escreve o briefing de uma peça de anúncio para quem vai produzir.

### Página, peças e atendimento

- **estruturar-landing:** monta a ordem das seções da landing e o rascunho de cada bloco.
- **paleta-tipografia:** define cores com contraste calculado e escala de fontes, com um HTML de amostra.
- **checklist-responsividade:** confere a página em cinco larguras e aponta o que quebra no celular.
- **template-post:** especifica um post estático com grade, hierarquia e um HTML ou SVG editável.
- **criar-carrossel:** planeja um carrossel de 5 a 10 slides com roteiro e HTML para revisar e exportar.
- **capa-reels:** especifica a capa do Reels legível no feed e na grade do perfil.
- **responder-comentario-padrao:** classifica comentários e escreve rascunhos de resposta a partir de um banco aprovado.
- **responder-dm-interesse:** escreve rascunhos para quem pergunta no direct se o produto serve.
- **tratar-objecao-preco:** responde "está caro" com valor e condições reais, sem inventar desconto.
- **encaminhar-lead-checkout:** escreve a mensagem que leva o lead decidido ao link certo do checkout.

## Prompts prontos

Os prompts estão na pasta `prompts/`. Copie, troque o que está entre colchetes e cole no Claude Code ou no Codex.

- `01-oferta-e-pagina.md`: da pesquisa do público à oferta, ao texto e ao layout da página.
- `02-emails-do-lancamento.md`: sequências de e-mail com cronograma e assuntos para teste.
- `03-anuncios-meta.md`: estrutura de campanhas, públicos, UTMs e criativos no Meta Ads.
- `04-anuncios-google.md`: campanha de pesquisa no Google Ads e revisão de termos.
- `05-criativos-e-redes.md`: conceitos de anúncio, roteiros de vídeo curto e peças para redes.
- `06-atendimento-e-carrinho.md`: respostas a comentários e mensagens e recuperação de carrinho.
- `07-metricas.md`: leitura dos relatórios e onde o funil perde gente.
- `08-revisar-antes-de-publicar.md`: revisão de promessas de qualquer peça.

## Custos e requisitos

- **Assinatura do agente:** Claude Code ou Codex, cobrados pela Anthropic ou pela OpenAI conforme o seu plano.
- **Node.js 22 ou mais novo:** o instalador confere se ele existe antes de copiar os arquivos.
- **Git Bash ou WSL no Windows:** só se quiser rodar os arquivos `.sh`. No Windows, os `.ps1` bastam.
- **Fora daqui e pagos à parte:** a verba dos anúncios na Meta e no Google, a ferramenta de e-mail e a plataforma de checkout que você já usa. Os agentes não acessam essas contas: eles trabalham com o que você exporta ou cola na conversa.

## Créditos

Todo o conteúdo deste pacote é autoral. Veja `CREDITOS.md` e `LICENSES/`.
