---
name: publicos-semelhantes
description: Planeja públicos semelhantes (lookalike) e públicos de dados próprios a partir das fontes que o usuário já tem, com qualidade da fonte, tamanho, exclusões, nomenclatura e cuidados de consentimento. Use quando o usuário quiser criar públicos parecidos com compradores ou leads, escolher a lista de origem ou organizar públicos de remarketing para um lançamento.
---

# Públicos semelhantes

Resultado: um plano de públicos em tabela, com a fonte de cada um, o tamanho informado pelo usuário, a faixa de semelhança, as exclusões e o nome padronizado. O usuário cria os públicos na plataforma. A skill não recebe nem processa a lista de clientes.

## Quando usar

- Antes de um lançamento, para sair do público frio genérico.
- Quando o usuário tem compradores, leads ou engajamento e não sabe qual usar como fonte.
- Para organizar exclusões e evitar que comprador veja anúncio de venda.

Para distribuir esses públicos em campanhas e conjuntos, use estrutura-campanha-meta. Para testar um público contra outro com regra de decisão, use matriz-teste-ab.

## O que pedir antes

- Fontes disponíveis e o tamanho de cada uma, só em número: compradores, leads, visitantes da página, quem assistiu vídeo, quem engajou no perfil.
- Período de cada fonte (últimos 30, 90, 180 dias).
- Se a lista de clientes foi coletada com consentimento para uso em publicidade, conforme a LGPD.
- Plataforma. O recurso existe com nomes e regras diferentes em cada uma, e algumas trocaram o modelo por sinais de público usados pela automação. O usuário confirma o que a conta dele oferece hoje.
- País ou região do público.

Peça ao usuário para **não colar a lista de clientes na conversa**. Basta o tamanho e a origem.

## Passo a passo

1. **Inventarie as fontes.** Tabela com fonte, tamanho, período e qualidade. Qualidade alta: compradores, especialmente os de maior valor. Média: leads e visitantes do checkout. Baixa: engajamento amplo. Pronto quando cada fonte tem as quatro colunas.
2. **Cheque o tamanho mínimo.** Cada plataforma exige um tamanho mínimo de fonte, que muda. Peça para o usuário confirmar o mínimo atual; fonte abaixo dele não serve. Pronto quando cada fonte está marcada como "serve" ou "pequena".
3. **Escolha a fonte principal.** A de maior qualidade que passa no mínimo. Se compradores forem poucos, combine com leads qualificados e diga que a mistura dilui a qualidade. Pronto quando há uma fonte principal e uma reserva.
4. **Defina as faixas de semelhança.** Faixa estreita (mais parecida, menor) e faixa ampla (menos parecida, maior). Uma faixa por conjunto, para poder comparar. Pronto quando cada faixa tem nome e fonte.
5. **Monte as exclusões.** Compradores excluídos das campanhas de venda do mesmo produto. Leads já capturados excluídos da campanha de captura, se o objetivo for lead novo. Pronto quando cada público tem a lista do que exclui.
6. **Planeje a atualização.** Lista de clientes envelhece. Defina com o usuário de quanto em quanto tempo ela é reenviada. Pronto quando a frequência está escrita.
7. **Padronize os nomes.** Formato: [plataforma]_[tipo]_[fonte]_[período]_[faixa]. Pronto quando nenhum público fica sem nome padrão.

## Saída

```text
Fontes
| Fonte | Tamanho | Período | Qualidade | Serve? |

Públicos planejados
| Nome | Tipo | Fonte | Faixa | Exclui | Uso (captura/venda/remarketing) |

Atualização da lista: [frequência]
Consentimento: [confirmado pelo usuário / pendente]
A confirmar na plataforma: [tamanho mínimo, faixas disponíveis, nome atual do recurso]
```

## Erros comuns

- Usar engajamento amplo como fonte quando há compradores suficientes.
- Esquecer de excluir quem já comprou e pagar para vender de novo a mesma coisa.
- Colocar várias faixas no mesmo conjunto e não saber qual entregou.
- Subir lista sem base legal de consentimento.
- Prometer o nome exato do menu. O recurso muda de lugar e de nome.

## Exemplo de pedido

> Use a publicos-semelhantes. Tenho 1.800 compradores dos últimos 180 dias, 9.000 leads e o perfil tem bastante engajamento. A lista foi coletada com consentimento.
