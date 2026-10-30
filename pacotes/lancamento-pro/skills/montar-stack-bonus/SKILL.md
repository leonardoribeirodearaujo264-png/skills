---
name: montar-stack-bonus
description: Monta a pilha da oferta (produto principal mais bônus), escolhendo cada bônus pela objeção ou etapa que ele resolve, com custo de entrega e valor apresentado justificado, e corta o que só faz volume. Use quando a oferta precisa de bônus, quando a lista de bônus atual parece aleatória ou antes de escrever a seção de oferta da página.
---

# Montar stack de bônus

Pilha da oferta organizada: o produto principal e cada bônus com a função que cumpre, o custo de entregar, o valor apresentado com base declarada e a ordem em que aparece. O resultado é uma oferta em que cada item responde a uma pergunta do cliente, sem bônus de enfeite e sem valor inventado.

## Quando usar

- Ao fechar a oferta de um lançamento, depois de saber dores e objeções.
- Quando a oferta atual tem bônus demais ou bônus que ninguém usa.
- Antes de escrever a seção "o que você recebe".

Para escolher a garantia, use definir-garantia. Para o produto extra oferecido no checkout, use calcular-preco-bump. Para a lista de objeções que os bônus devem cobrir, use levantar-objecoes antes desta.

Esta skill decide a composição da oferta. Para escrever os benefícios de cada item na página, use escrever-beneficios; para posicionar a seção na landing, use estruturar-landing.

## O que pedir antes

- Produto principal: o que entrega, preço e formato.
- Lista de objeções ou etapas difíceis do cliente. Sem ela, peça ou rode levantar-objecoes.
- Materiais que o dono já tem ou pode produzir (planilhas, aulas extras, modelos, grupo, sessão ao vivo).
- Custo de cada item: horas do dono, ferramenta, entrega física, suporte.
- Valor da hora do dono em reais (o que ele cobra ou deixa de ganhar por hora). Sem ele, o custo em horas fica em horas e o alerta de margem não pode ser feito.
- Se algum bônus tem prazo ou limite de vagas e se esse limite é real.

## Passo a passo

1. **Liste lacunas.** Para o produto principal, escreva o que o cliente ainda precisa para ter resultado: começar rápido, não travar numa etapa, tirar dúvida, aplicar no caso dele, manter o resultado. Ligue cada lacuna a uma objeção quando houver. Se a lacuna é da essência do produto (o curso não ensina o que promete, falta a etapa central), não tape com bônus: marque "corrigir no produto" e registre em Alertas. Pronto quando há lista de lacunas com objeção ligada e as de essência estão marcadas.
2. **Proponha um bônus por lacuna.** Use primeiro o que o dono já tem. Cada bônus recebe nome descritivo (o que é e para que serve). Pronto quando cada lacuna tem um candidato ou a marca "sem bônus possível".
3. **Calcule o custo de entrega.** Para cada bônus, custo por cliente e custo fixo, em reais. Horas viram reais pela conta horas x valor da hora do dono; mostre a conta. Bônus com custo por cliente alto (sessão individual, envio físico) precisa de limite. Pronto quando todo bônus tem custo, mesmo que zero.
4. **Defina o valor apresentado com base.** Valor só pode vir de preço já praticado, de venda avulsa real ou de horas do serviço equivalente. Sem base, não mostre valor; escreva [VALOR REAL] ou deixe sem número. Total da pilha só pode ser mostrado somando itens que têm base; nunca some [VALOR REAL] nem estimativa. Se menos da metade dos itens tem base, não mostre total. Pronto quando cada valor tem a base escrita e o total está calculado ou marcado "não mostrar".
5. **Corte.** Retire bônus que não resolvem lacuna, que repetem outro ou que o cliente não terá tempo de usar. Recomende no máximo de três a cinco. Pronto quando a pilha final está listada e os cortes têm motivo.
6. **Ordene a apresentação.** Produto principal primeiro, depois bônus na ordem da jornada (começo, meio, manutenção). Escassez só se for real e verificável. Pronto quando a ordem está definida.

## Saída

```text
Produto principal: [nome] | Preço: [valor informado]

Valor da hora do dono: R$ [valor informado] ou [VALOR REAL]

| Ordem | Item | Lacuna/objeção que resolve | Custo por cliente | Custo fixo | Valor apresentado | Base do valor |
|---|---|---|---|---|---|---|
| 1 | [bônus] | ... | R$ 0 | 6 h x R$ [hora] = R$ [total] | R$ [VALOR REAL] | venda avulsa |

Total apresentado: R$ [soma só dos itens com base] (itens somados: [lista]) ou "não mostrar"
Corrigir no produto: [lacunas de essência] ou nenhuma

Cortados: [item] porque [motivo]
Limites reais: [vagas, prazo] ou nenhum
Alertas: [valor sem base, custo que come a margem]
Próxima etapa sugerida: definir-garantia, depois calcular-preco-bump
```

Teste rápido de cada bônus: se o cliente perguntar "para que isso serve para mim?", a resposta precisa estar na coluna de lacuna. Se não estiver, o bônus é candidato a corte.

## Erros comuns

- Somar valores inventados para mostrar "mais de R$ 5.000 em bônus".
- Colocar bônus que pesa mais que o produto principal e confunde a decisão.
- Criar escassez falsa ("só 10 vagas") que não se sustenta. Isso fere o Código de Defesa do Consumidor.
- Esquecer o custo de bônus com atendimento individual, que cresce com cada venda.
- Nome de bônus genérico ("Bônus 1: Material exclusivo") que não diz o que resolve.
