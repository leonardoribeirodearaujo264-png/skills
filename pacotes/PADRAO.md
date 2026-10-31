# Padrão dos pacotes

Cada pacote vive em `pacotes/<slug>/` e é a fonte única do que o comprador recebe: o site lê esta pasta para montar a área de membros e o `.zip`.

## Estrutura

```
pacotes/<slug>/
  pacote.json            dados do pacote e das skills de terceiros (fonte dos instaladores e do CREDITOS.md)
  README.md              guia em português (é o texto da área de membros)
  skills/<nome>/SKILL.md skills autorais
  agents/claude/<nome>.md   time autoral no formato do Claude Code
  agents/codex/<nome>.toml  o mesmo time no formato do Codex
  prompts/NN-<nome>.md   prompts prontos, um por arquivo
  aula/roteiro.md        roteiro da aula (até 210 palavras, cerca de 80 s: abertura, instalação pelo app do Claude e uso)
  LICENSES/              licença do conteúdo autoral
  instalar-claude.ps1 / instalar-claude.sh   gerados por scripts/gerar-instaladores.mjs
  instalar-codex.ps1 / instalar-codex.sh     gerados
  CREDITOS.md            gerado
```

Não edite à mão os arquivos marcados como gerados. Rode `node scripts/gerar-instaladores.mjs`.

## pacote.json

```json
{
  "slug": "design-copy-anuncios",
  "titulo": "Design, copy, anúncios e velocidade",
  "terceiros": [
    {
      "fonte": "coreyhaines31/marketingskills",
      "url": "https://github.com/coreyhaines31/marketingskills",
      "licenca": "MIT",
      "skills": ["copywriting", "cro"],
      "codex": true,
      "observacao": "opcional, curta"
    }
  ]
}
```

- `fonte` é o `owner/repo` usado em `npx skills add <fonte> --skill <nome> -a claude-code -a codex -g -y`.
- Plugins (só quando a fonte é distribuída como plugin, como wshobson/agents) vão em `"plugins": [{ "fonte", "url", "licenca", "nome", "comandoClaude", "comandoCodex" }]`. Eles entram no CREDITOS.md e no README como comando manual; os instaladores não rodam plugin. `comandoCodex` fica vazio quando não há versão Codex.
- `codex: false` quando a skill não funciona no Codex (o instalador do Codex pula).
- Só use fontes e nomes que estão em `C:\Users\leona\skills\pacotes\PESQUISA.md`. Não invente repositório nem skill.
- Nunca copie arquivo de terceiro para dentro do pacote. Terceiros entram só como comando de instalação.

## Times de agentes

Cada pacote tem um time autoral: um líder, de 2 a 4 especialistas e um revisor. Cada agente existe nos dois formatos, com o mesmo nome e o mesmo papel.

Claude Code (`agents/claude/<nome>.md`):

```markdown
---
name: lider-design
description: Quando usar, em uma frase que comece com o gatilho ("Use quando...").
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

Instruções do papel, em português, no imperativo.
```

Codex (`agents/codex/<nome>.toml`):

```toml
name = "lider-design"
description = "Quando usar, em uma frase."
developer_instructions = """
Instruções do papel, iguais às da versão Claude, adaptadas: o Codex não restringe ferramentas por agente,
então escreva no texto o que o agente não deve fazer.
"""
```

- Nomes em minúsculas com hífen, prefixados pelo papel (`lider-`, `revisor-`).
- O líder recebe o pedido, divide entre os especialistas, chama o revisor e só entrega o que passou na revisão.
- O revisor não edita, aponta problemas com arquivo e motivo.
- Nenhum agente publica, envia, compra ou gasta crédito de API sem aprovação explícita do usuário.

## Skills autorais

`skills/<nome>/SKILL.md` com frontmatter `name` e `description` (o gatilho em uma frase) e corpo com: quando usar, passo a passo, regras de qualidade e um exemplo de pedido. Siga a skill writing-for-agents. A mesma pasta serve ao Claude Code (`~/.claude/skills/`) e ao Codex (`~/.agents/skills/`).

## Prompts

`prompts/NN-<nome>.md`: primeira linha `# Título`, uma linha de quando usar, depois o prompt dentro de um bloco de código ```text. Campos para o usuário preencher entre colchetes, em maiúsculas: `[SEU PRODUTO]`. De 5 a 8 prompts por pacote. Pelo menos um prompt mostra como acionar o time pelo líder, no Claude Code e no Codex (no Codex o agente precisa ser citado pelo nome).

## README.md

Seções, nesta ordem e com estes títulos exatos (o site depende deles):

1. `# <Título>` e um parágrafo do que a pessoa consegue fazer depois de instalar.
2. `## O que vem no pacote` (lista curta: skills de terceiros, skills autorais, time, prompts).
3. `## Instalação no Claude Code` (Windows e Mac/Linux, chamando os instaladores, e o comando manual de uma skill como exemplo).
4. `## Instalação no Codex` (idem, explicando a pasta `~/.agents/skills` e `~/.codex/agents`).
5. `## Como usar o time de agentes`.
6. `## Skills incluídas` (tabela: skill, para que serve, fonte, licença).
7. `## Prompts prontos` (lista apontando para a pasta prompts/).
8. `## Custos e requisitos` (o que é pago fora daqui, Node 22+, FFmpeg, Git Bash no Windows para os .sh).
9. `## Créditos` (aponta para CREDITOS.md; deixe claro que as skills de terceiros são gratuitas e de código aberto e que o pacote é curadoria, guia, instalador e time autoral, sem parceria com os autores).

## Aula

`aula/roteiro.md`: título, até 210 palavras de fala dividida em 7 ou 8 cenas curtas (cada cena com a fala e o texto que aparece na tela). Cobre: o que o pacote faz, o que instalar antes (app do Claude, plano Pro ou Max, Node.js), baixar e abrir a pasta no Claude, o pedido do `COMECE-AQUI.md` que instala e testa, como dar instrução ao time, uma skill em uso e onde estão os prompts. Narração com a ElevenLabs (voz Eric, modelo multilíngue).

## Regras de texto

- Português do Brasil, frases curtas, sem travessão (o caractere "—" e "–"), sem emojis, sem promessa de resultado.
- Não copie texto de clubedasskills.com.br nem de nenhum concorrente.
- Não cite o editor VOX.
- Sem logos e sem sugerir parceria com autores de terceiros.
