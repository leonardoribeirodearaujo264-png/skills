# Loja: notas para implementar em React

Abra `prototipos/loja/index.html`. A barra escura no topo de cada tela troca o estado (`?estado=`) e o tema. Ela não vai para produção.

## Tokens
Base: `public/assets/estilo.css` sem mudança (Bricolage Grotesque, Inter, JetBrains Mono, `--accent #2F5BFF`, `--bg #F6F5F1`, tema escuro por `prefers-color-scheme` e `data-theme`).
Novos, em `proto.css` (claro / escuro):
- `--ok-ink` #16714A / #5FD3A0 (o `--ok` atual tem 4,3:1 em texto pequeno, abaixo de AA)
- `--ok-soft` #E3F4EC / #10261D
- `--warn` #9A5B00 / #F2B65A, `--warn-soft` #FDF1DC / #2A1F0C
- `--danger` #B42318 / #FF8A7E, `--danger-soft` #FCE9E7 / #2C1513
- `--shell`, `--shell-line`, `--inner-hi` (casca dupla dos cartões)
- `--radius-lg` 22px, `--radius-sm` 10px, `--ease` cubic-bezier(.32,.72,0,1), `--head-h` 64px
Escala: espaçamento em múltiplos de 4 (4, 8, 12, 16, 20, 24, 32, 48, 64, 96). Títulos: h1 do estilo.css, h2 24px, h3 17 a 19px, corpo 16px, apoio 14px, mono 12 a 13px.

## Componentes
| Componente | Uso | Observação |
|---|---|---|
| `Cabecalho` | todas | sticky com blur, link ativo `aria-current` |
| `Casca` (`.shell > .core`) | cartões | casca 6px + núcleo com raio 16px |
| `Botao` | `variant`: primario, secundario, fantasma; `tamanho`: sm, lg; `carregando` | `aria-busy`, ícone em cápsula `.ico`; desativado com `aria-disabled` + texto de motivo ligado por `aria-describedby` |
| `Alerta` | `tipo`: info, warn, danger, ok | `role="alert"` só para erro |
| `Chip` | status | ok, warn, accent, danger, neutro |
| `Esqueleto` | carregando | `aria-busy` no contêiner + texto `sr-only` |
| `OpcaoOferta` | /loja/ | radio nativo escondido, `fieldset` + `legend` |
| `CartaoProduto` | /loja/ | checkbox (radio na oferta avulsa); estados `possui`, `fixo`, `fora`, `limite` |
| `ResumoPedido` | /loja/ | sticky no desktop; `BarraMovel` fixa abaixo de 1060px |
| `CampoEmail` | /entrar/ | `aria-invalid`, erro em `aria-describedby` |
| `CartaoMembro` | /membros/ | liberado, pendente, não incluído |
| `PlayerAula` | produto | `<video controls playsinline preload="none">` 16:9, `<track kind="captions">`, URL assinada pedida no clique |
| `BlocoCodigo` | produto | reaproveita `.code`, `.code-bar`, `.copy` e a função `copiar` de `pagina.js` |
| `SeletorSegmentado` | produto | Claude Code ou Codex, Windows ou macOS e Linux (`aria-pressed`) |
| `BotaoDownload` | produto | gera URL assinada, estados ocioso, gerando, iniciado, erro |
| `IndiceSecoes` | produto | sticky no desktop, rolagem horizontal no celular |

## Estados por tela
- `/loja/`: visitante, logado (produto já comprado marcado e bloqueado), carregando, erro ao carregar, falha ao abrir pagamento. Seleção incompleta mostra o motivo abaixo do botão. Oferta fixa em que o usuário já tem tudo fica bloqueada (bate com `ja_possui` em `dominio.ts`).
- `/entrar/`: formulário, e-mail inválido, enviando, enviado (reenvio liberado após 45 s), erro (limite), link expirado. Resposta igual exista ou não a conta. `?volta=loja&oferta=&produtos=` preserva o pedido.
- `/membros/`: com produtos, pagamento pendente (aviso + cartões "Aguardando pagamento" + consulta a cada 15 s), vazio (sugere entrar com outro e-mail), carregando, erro.
- `/membros/<produto>/`: liberado, carregando, aula com erro (URL expirada, botão recarregar), download com erro, bloqueado visitante, bloqueado logado com outro e-mail. O conteúdo pago não vai ao HTML quando bloqueado.
- `/loja/retorno/`: confirmando (aprovado na URL, webhook ainda não liberou; consulta o pedido no banco a cada 3 s até 60 s), aprovado, pendente, recusado (motivo do `status_detail` traduzido, "Tentar de novo" mantém a seleção).

## Dados
Tudo que tem `data-fonte="servidor"` vem da API. `dados.js` imita o catálogo; os nomes seguem `dominio.ts` (`tipo` escolha, fixa, todos). A tela não calcula preço; a economia ("Avulso sairia R$ 111,00") deve vir pronta do servidor (`referenciaCentavos`).

## Acessibilidade
Foco visível do estilo.css; foco movido para o título ao trocar de etapa (enviado, retorno, erro); `aria-live` no contador, no resumo e no aviso de cópia; `prefers-reduced-motion` respeitado; alvos de toque de 40px ou mais.
