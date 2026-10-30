# Configurar a loja

Passo a passo único para pôr a loja no ar. Nenhum segredo vai para o repositório: tudo fica no `.env.local` (máquina) e nas variáveis da Vercel.

## 1. Banco (Supabase, mesmo projeto da automação)

1. Abra o SQL Editor do projeto e rode `banco/0001_loja.sql` inteiro, uma vez. Ele cria só tabelas com prefixo `loja_`, as funções de liberação (executáveis só pela service_role), o RLS e os buckets privados `loja-aulas` e `loja-pacotes`. Não mexe nas tabelas da automação.
2. Preços: tabela `loja_ofertas` (`preco_centavos`: avulso 3700, leve 3 6700, combo 12700) e `loja_produtos.preco_avulso_centavos` (preço próprio no avulso; hoje só edição de vídeo, 4700). `loja_oferta_itens` serve para ofertas de composição fixa. Mudou ali, a loja muda; não há preço no código.
3. Desconto de cliente: a oferta `cliente` (um pacote, só para quem já comprou) nasce desativada. Para ligar:
   `update loja_ofertas set preco_centavos = <valor em centavos>, ativo = true where codigo = 'cliente';`
   Ela aparece na loja e na área de membros só para clientes, e o servidor recusa quem não é cliente.

## 2. Login (Supabase Auth)

Em Authentication:

- **URL Configuration**: Site URL `https://skills-sandy-seven.vercel.app`. Em Redirect URLs, adicione `https://skills-sandy-seven.vercel.app/entrar/confirmar/**` e `http://localhost:3000/entrar/confirmar/**`.
- **Email Templates > Magic Link**: troque o corpo por um que use o código e o link com `token_hash` (o site confirma o link por um clique, o que funciona mesmo abrindo o e-mail em outro aparelho):

```html
<h2>Seu acesso</h2>
<p>Código: <strong>{{ .Token }}</strong></p>
<p>Ou clique: <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">entrar na minha área</a></p>
```

- **E-mail de acesso pós-compra**: quando o pagamento é aprovado, o site manda pelo Supabase Auth o mesmo e-mail de acesso (código e link), uma única vez por pedido, criando a conta se não existir.
- **SMTP**: o envio padrão do Supabase tem limite baixo por hora e serve só para teste. Para vender, configure um SMTP próprio em Authentication > SMTP Settings.

## 3. Mercado Pago

1. Em Suas integrações > sua aplicação > Webhooks > Configurar notificações, use a URL `https://skills-sandy-seven.vercel.app/api/webhooks/mercadopago` e marque só o evento **Pagamentos**. Copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET`.
2. Credenciais de teste no Preview e no local; de produção só no ambiente Production da Vercel.
3. Pagamentos feitos com credenciais de teste podem não disparar notificação. A página de retorno e a reconciliação consultam o pagamento direto na API, então o acesso é liberado mesmo assim.

## 4. Variáveis de ambiente

| Variável | Onde pegar | Público? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API | sim (é só o endereço) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API, chave anon/publishable | sim (protegida pelo RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API, service_role (de preferência uma secret key nova só para o site) | **não** |
| `MERCADOPAGO_ACCESS_TOKEN` | Mercado Pago > Credenciais | **não** |
| `MERCADOPAGO_WEBHOOK_SECRET` | Mercado Pago > Webhooks | **não** |
| `SITE_URL` | `https://skills-sandy-seven.vercel.app` (local: `http://localhost:3000`) | sim |
| `CRON_SECRET` | gere um texto aleatório de 32+ caracteres | **não** |

`NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` não é usada: o Checkout Pro abre no site do Mercado Pago.

## 5. Vercel

- Settings > General > Framework Preset: **Next.js** (o `vercel.json` já fixa isso). Node 22.x. Sem override de Build e Output.
- Cadastre as variáveis do item 4. A reconciliação roda uma vez por dia pelo cron do `vercel.json` e usa o `CRON_SECRET`.
- Antes de promover para produção, rode o teste das páginas antigas contra o preview:
  `SITE_TESTE=https://<preview>.vercel.app npm test`

## 6. Publicar conteúdo, .zip e aulas

```bash
npm run pacotes:publicar
```

Lê `pacotes/<slug>/`, gera os .zip no D:, envia aula e legenda de `D:\automacao-leo\aulas\<slug>\` e atualiza o banco. Para conferir sem enviar nada: `node scripts/publicar-pacotes.mjs --seco`.
