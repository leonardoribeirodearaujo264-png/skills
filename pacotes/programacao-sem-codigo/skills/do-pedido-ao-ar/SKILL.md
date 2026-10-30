---
name: do-pedido-ao-ar
description: Use quando alguém que não programa quiser tirar uma ideia do papel (site, sistema simples, automação ou SaaS) e chegar ao projeto publicado, ou quando pedir ajuda para "começar do zero" sem saber por onde ir.
---

# Do pedido ao ar

Conduz uma pessoa que nunca programou da ideia ao projeto publicado, em etapas pequenas. Cada etapa termina com algo que a pessoa vê e aprova. Nada avança sem o sim dela.

## Quando usar

- A pessoa descreve o que quer em linguagem comum e não sabe qual tecnologia usar.
- O projeto ainda não existe, ou existe e ela quer chegar até a publicação com segurança.
- Para corrigir um erro isolado, use direto o diagnóstico de bugs; esta skill é para o caminho inteiro.

## Como falar

Escreva como um professor paciente. Toda vez que um termo técnico aparecer pela primeira vez, explique em uma linha, entre parênteses ou logo depois. Exemplos:

- **Terminal**: a janela onde se digitam comandos para o computador.
- **Repositório**: a pasta do projeto com o histórico de todas as mudanças, guardado pelo Git.
- **Deploy**: colocar o projeto no ar, num endereço que qualquer pessoa abre.
- **Variável de ambiente**: um valor secreto, como uma chave de API, guardado fora do código.
- **Banco de dados**: onde o sistema guarda as informações de forma organizada.
- **API**: a porta pela qual um sistema conversa com outro.

## Passo a passo

### 1. Entrevista

Faça uma pergunta por vez, no máximo 7, e espere a resposta:

1. O que o projeto faz, em uma frase?
2. Quem vai usar?
3. Qual é a única coisa que precisa funcionar na primeira versão?
4. Precisa de login? Guarda dados de clientes? Recebe pagamento?
5. Tem algum exemplo de site ou sistema parecido?
6. Já existe alguma parte pronta (pasta, conta, domínio)?
7. Tem orçamento para serviços pagos, ou começa só com planos gratuitos?

Pronto quando você escreve um resumo de 3 a 5 frases e a pessoa diz que está certo.

### 2. Plano em linguagem simples

Escreva o plano com:

- O que entra na **versão mínima** (a menor versão que já resolve o problema principal) e o que fica para depois.
- A tecnologia escolhida e o motivo em uma frase. Prefira a mais comum e bem documentada.
- As etapas numeradas, cada uma com o que a pessoa vai ver no fim.
- Tudo que tem custo ou exige conta externa, marcado como "precisa da sua aprovação".

Pronto quando a pessoa responde sim a "Posso começar a etapa 1?".

### 3. Versão mínima

1. Crie a pasta do projeto e inicie o Git (o programa que guarda o histórico de mudanças) antes de qualquer código.
2. Crie o `.gitignore` com `.env` dentro, e um `.env.example` só com os nomes das variáveis.
3. Construa só o caminho principal. Uma etapa por vez, mostrando o resultado no fim de cada uma.
4. Guarde cada etapa que funcionou num commit (um ponto salvo no histórico, para poder voltar se algo quebrar).

Pronto quando a pessoa consegue abrir o projeto no próprio computador e fazer o caminho principal do começo ao fim.

### 4. Teste como cliente

1. Rode build, lint e testes que existirem (verificações automáticas de que o código está inteiro).
2. Faça o caminho principal como um cliente faria, e depois erre de propósito: campo vazio, dado inválido, clique duplo.
3. Confira os estados da tela: carregando, vazio, erro e sucesso.
4. Peça para a pessoa fazer o mesmo caminho sozinha e contar o que estranhou.

Pronto quando cada item tem resultado anotado (passou, falhou ou não testado com motivo) e as falhas foram corrigidas.

### 5. Checklist de segurança

Passe por todos os itens antes de publicar. Cada um termina como ok, problema ou não se aplica.

- Nenhuma chave, senha ou token escrito no código nem no histórico do Git.
- Nenhuma chave secreta no código que roda no navegador.
- Cada cliente só vê os próprios dados, mesmo trocando um número na URL.
- Todo formulário e webhook é validado no servidor.
- Valor de pagamento calculado no servidor, nunca vindo da tela.
- Mensagens de erro sem detalhe interno.

Pronto quando não sobra nenhum item como problema grave.

### 6. Publicação

1. Explique onde vai publicar, o que é gratuito e o que pode passar a cobrar.
2. Liste as variáveis de ambiente que precisam ser cadastradas no serviço de hospedagem (só os nomes).
3. Pergunte: "Posso publicar agora?". Publique só depois do sim.
4. Abra o endereço publicado e repita o caminho principal lá.

Pronto quando o endereço público abre e o caminho principal funciona nele.

## Regras de qualidade

- Etapas pequenas: cada uma cabe numa conversa e termina com algo visível.
- O que já funciona continua funcionando. Teste antes e depois de cada mudança.
- Pergunte antes de apagar arquivo, instalar biblioteca, criar conta, gastar crédito de API, mudar banco de dados ou publicar.
- Diga que terminou só depois de testar. Se algo ficou sem teste, diga o quê.
- Quando o pedido mudar no meio do caminho, volte ao plano, ajuste e peça aprovação de novo.

## Exemplo de pedido

> Quero um site para minha confeitaria onde o cliente vê o cardápio e faz a encomenda pelo WhatsApp. Nunca programei.

Resposta esperada: uma pergunta da entrevista por vez, depois um plano com versão mínima (página de cardápio e botão que abre o WhatsApp com a mensagem pronta), sem login nem banco nesta versão, e a pergunta "Posso começar a etapa 1?".
