<!-- Gerado por scripts/gerar-instaladores.mjs a partir do pacote.json. Não edite à mão. -->
# Comece aqui: como instalar o pacote "Lançamento Pro"

São 4 passos. Você não precisa saber programar: no passo 4, o próprio Claude instala e testa tudo por você.

## 1. Instale o app do Claude no seu computador

1. Abra **claude.ai/download** no navegador do seu PC ou Mac e baixe o app **Claude** para o seu sistema.
2. Instale e entre com a sua conta. O Claude Code (a aba **Code** do app) precisa de um plano pago do Claude, como o Pro ou o Max.

## 2. Instale o Node.js

O instalador do pacote usa o Node.js. Abra **nodejs.org**, baixe a versão LTS (22 ou mais nova) e instale com as opções padrão. Se já tiver, pule este passo.

## 3. Baixe e extraia o pacote

1. Na sua área de membros, clique em **Baixar o pacote**. Vem um arquivo `.zip`.
2. Clique com o botão direito no `.zip` e escolha **Extrair tudo** (no Mac, basta dar dois cliques).
3. Guarde a pasta extraída num lugar fácil, como **Documentos**.

## 4. Peça ao Claude para instalar e testar

1. Abra o app **Claude**, vá na aba **Code** e escolha a pasta extraída do pacote como pasta de trabalho.
2. Copie o pedido abaixo inteiro, cole na conversa e envie.
3. Quando o Claude pedir permissão para rodar o instalador, confira e aceite.

```text
Instale o pacote desta pasta no meu Claude Code e confira se deu certo.

1. Veja qual é o meu sistema. No Windows, rode: powershell -ExecutionPolicy Bypass -File .\instalar-claude.ps1
   No Mac ou no Linux, rode: bash ./instalar-claude.sh
2. Se aparecer "Node.js não encontrado", pare e me explique como instalar o Node.js 22.
3. Depois de instalar, confira se estas pastas existem:
   - em ~/.claude/skills: adaptar-tom-voz, analisar-pagina-concorrente, assunto-alta-abertura, briefing-criativo, calcular-cpa-maximo, calcular-preco-bump, calcular-roas-minimo, campanha-busca-google, capa-reels, checklist-responsividade, criar-10-angulos-dor, criar-carrossel, cronograma-envios, definir-angulo-venda, definir-garantia, email-carrinho-abandonado, email-reembolso, email-ultima-chance, encaminhar-lead-checkout, escrever-beneficios, escrever-cta, escrever-faq-objecoes, escrever-headline, escrever-legenda-reels, escrever-script-vsl, escrever-subtitulo, estrutura-campanha-meta, estruturar-landing, extrair-linguagem-depoimentos, ler-relatorio-anuncios, levantar-objecoes, mapear-dores, mapear-jornada-cliente, matriz-teste-ab, montar-stack-bonus, montar-utms, paleta-tipografia, publicos-semelhantes, reescrever-clareza, responder-comentario-padrao, responder-dm-interesse, segmentar-lista, sequencia-boas-vindas, sequencia-lancamento, sequencia-pos-venda, sugerir-pausa-conjunto, template-post, testar-assuntos, tratar-objecao-preco, validar-promessa
   - em ~/.claude/agents: analista-de-concorrentes.md, analista-metricas.md, atendente-dm-comentarios.md, copywriter-emails.md, copywriter-pagina-vendas.md, criador-criativos.md, designer-pecas-redes.md, estrategista-de-oferta.md, gestor-anuncios-google.md, gestor-anuncios-meta.md, pesquisador-de-mercado.md, recuperador-carrinho.md, revisor-de-promessas.md, roteirista-video-curto.md, web-designer-landing.md
4. Me mostre uma lista com o que foi instalado e o que faltou. Se algo falhou, rode de novo só o que faltou.
5. No fim, me diga para fechar e abrir o Claude de novo, e qual prompt da pasta prompts/ eu devo testar primeiro.
Não apague, não publique e não pague nada sem me perguntar.
```

## Depois de instalar

- Feche e abra o Claude de novo para ele carregar as skills e o time.
- Teste com o primeiro prompt da pasta `prompts/` (`01-oferta-e-pagina.md`): abra o arquivo, copie, troque o que estiver entre colchetes e envie.
- Usa o Codex? Na pasta do pacote, rode `instalar-codex.ps1` (Windows) ou `instalar-codex.sh` (Mac e Linux). O passo a passo completo está no `README.md`.

## O que este pacote instala

- Skills autorais: `adaptar-tom-voz`, `analisar-pagina-concorrente`, `assunto-alta-abertura`, `briefing-criativo`, `calcular-cpa-maximo`, `calcular-preco-bump`, `calcular-roas-minimo`, `campanha-busca-google`, `capa-reels`, `checklist-responsividade`, `criar-10-angulos-dor`, `criar-carrossel`, `cronograma-envios`, `definir-angulo-venda`, `definir-garantia`, `email-carrinho-abandonado`, `email-reembolso`, `email-ultima-chance`, `encaminhar-lead-checkout`, `escrever-beneficios`, `escrever-cta`, `escrever-faq-objecoes`, `escrever-headline`, `escrever-legenda-reels`, `escrever-script-vsl`, `escrever-subtitulo`, `estrutura-campanha-meta`, `estruturar-landing`, `extrair-linguagem-depoimentos`, `ler-relatorio-anuncios`, `levantar-objecoes`, `mapear-dores`, `mapear-jornada-cliente`, `matriz-teste-ab`, `montar-stack-bonus`, `montar-utms`, `paleta-tipografia`, `publicos-semelhantes`, `reescrever-clareza`, `responder-comentario-padrao`, `responder-dm-interesse`, `segmentar-lista`, `sequencia-boas-vindas`, `sequencia-lancamento`, `sequencia-pos-venda`, `sugerir-pausa-conjunto`, `template-post`, `testar-assuntos`, `tratar-objecao-preco`, `validar-promessa`
- Skills de terceiros (baixadas do autor na hora): nenhuma
- Agentes: `analista-de-concorrentes`, `analista-metricas`, `atendente-dm-comentarios`, `copywriter-emails`, `copywriter-pagina-vendas`, `criador-criativos`, `designer-pecas-redes`, `estrategista-de-oferta`, `gestor-anuncios-google`, `gestor-anuncios-meta`, `pesquisador-de-mercado`, `recuperador-carrinho`, `revisor-de-promessas`, `roteirista-video-curto`, `web-designer-landing`
- Prompts prontos: 8 arquivos na pasta `prompts/`
