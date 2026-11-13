# Site Demonstração: do site pronto ao vídeo para o cliente

> Plugin em português para Claude Code. Sete skills e um template para o
> agente fazer o site de um negócio local, com cara de peça bem dirigida, texto
> que vende e celular sem defeito, e depois gravar o vídeo de demonstração para
> mandar ao cliente.

Você pede "faz uma prévia de site para a oficina do João" e o agente não sai
escrevendo HTML. Ele segue uma ordem: primeiro a direção visual, depois o
movimento, depois a conversão, depois o texto e, por último, o celular. Cada
etapa tem um critério de pronto. Pular uma dá um destes três resultados: site
bonito que não vende, site que vende com cara de amador, ou site quebrado no
celular. No fim, a `gravar-site` transforma o resultado num vídeo que o dono
assiste no celular e vê como o site fica no computador.

Veja o template: [no computador](skills/fazer-site/template/preview/template-1440.png) · [no celular](skills/fazer-site/template/preview/template-375.png).

---

## As skills, na ordem em que rodam

| # | Skill | Papel | Termina quando |
|---|---|---|---|
| 0 | **`fazer-site`** | O maestro: lê os dados do negócio, parte do template e chama as cinco seguintes na ordem | as cinco rodaram e os prints foram olhados |
| 1 | **`frontend-design`** | Direção visual com a identidade real do negócio: cor da logo, tipografia de cartaz, contraste de seção | paleta, fontes e seções estão decididas |
| 2 | **`landing-page-cinematografica`** | Movimento e acabamento: entrada escalonada, textura, botões com peso, avaliação em destaque, número que conta | nenhum item da lista de proibidos aparece |
| 3 | **`revenue-centric-design`** | Conversão: hero que passa no teste de 5 segundos, prova na primeira dobra, CTA específico a cada 1,5 seção | a promessa não é maior que a prova |
| 4 | **`copywriting`** | Todos os textos, pelo método de resposta direta do Eugene Schwartz | cada frase é verificável numa fonte do negócio |
| 5 | **`adaptar-mobile`** | Revisão de celular em 360 e 375 px, com conferência em 1440 px | os prints foram abertos e olhados |
| 6 | **`gravar-site`** | Vídeo horizontal (1440×900, 30 fps) do site, com o mouse passeando e clicando | a folha de contato foi conferida |

Cada uma também funciona sozinha. Precisa só de texto de anúncio? Peça para a
`copywriting`. Tem um site pronto que quebra no celular? Chame a
`adaptar-mobile`. Quer só o vídeo de um site que já existe? `gravar-site`.

### Como cada uma pensa

**`fazer-site`** começa pelos fatos. Nome, telefone, endereço, nota e
avaliações vêm só dos dados do negócio e das fontes públicas dele; nada é
inventado. Avaliação só entra se for 100% positiva. As duas cores da marca
aparecem, não só o destaque. A logo vira o ícone da aba do navegador. O site
sai em HTML estático (um arquivo, sem build), e só vira Next.js quando precisa
de servidor.

**`frontend-design`** é a skill oficial de design de interface da Anthropic.
Ela foge da "cara de IA" (gradiente roxo, fonte genérica, cartão arredondado
igual a todo SaaS) e obriga uma direção visual com personalidade.

**`landing-page-cinematografica`** dá ritmo de filme sem pesar. O visitante
está no celular, muitas vezes no 4G, então o movimento é CSS e
`IntersectionObserver`, sem biblioteca. Ela tem uma lista de proibidos que já
foram reprovados em projeto real: cartão que empilha ao rolar, foto de loja
recortada em círculo, dourado com serifa fina como padrão, painel falso de
software em site de negócio local.

**`revenue-centric-design`** traz o playbook de conversão do designer Richard
([@richardrx](https://x.com/richardrx)): teste de 5 segundos no hero, prova
antes da promessa, CTA específico com garantia embaixo, menos atrito no
formulário. Está em inglês, como no original.

**`copywriting`** monta o texto em vez de "escrever bonito". A base é o Eugene
Schwartz (*Breakthrough Advertising*): nível de consciência do público,
sofisticação do mercado, a força da venda está no produto. Por cima entram
Kennedy, Hopkins, Ogilvy, Halbert e a escola brasileira de resposta direta.
Serve para qualquer nicho e qualquer peça: site, anúncio, e-mail, VSL,
WhatsApp.

**`adaptar-mobile`** parte do princípio de que a primeira impressão é no
celular. Ela varre 10 pontos (primeira tela, área de toque, WhatsApp à mão,
tipografia, imagens, menu, formulário, rolagem horizontal, ordem das seções,
jornada completa) com print de verdade, corrige na raiz e confere que o
desktop não quebrou.

**`gravar-site`** não grava a tela em tempo real. Um script em Node abre o
site num navegador invisível e **avança o relógio da página quadro a quadro**:
cada quadro só é capturado quando a página terminou de desenhá-lo, então o
vídeo nunca engasga, nem com animação pesada. No modo automático ela mostra o
topo e desce seção por seção, abrindo abas, clicando opções do formulário,
digitando um nome e passando o mouse nos botões (até 75 s). No modo roteiro
você define a sequência num JSON (`skills/gravar-site/referencia/roteiro-exemplo.json`).
Ela nunca envia formulário nem abre WhatsApp ou outro site, e reprova sozinha
o vídeo se a rolagem der solavanco. No fim gera uma folha de contato (12
quadros numa imagem) para conferir sem assistir.

### Use um modelo barato na `gravar-site`

Quem grava é o script, não a IA. O agente só escolhe o modo, roda um comando e
olha uma imagem. Então **não gaste modelo caro nela**:

| Ferramenta | Modelo recomendado |
|---|---|
| Claude Code | Haiku (`/model haiku`) ou Sonnet em esforço baixo |
| Codex / ChatGPT | o modelo mini, ou esforço baixo |
| Gemini CLI, Antigravity, Cursor | o modelo rápido (Flash ou equivalente) |

O resultado é o mesmo com qualquer um deles. Também não vale delegar para
subagente: explicar a tarefa custa mais que rodar o comando. Para o site em
si (as outras seis skills), aí sim vale um modelo forte: é trabalho de design
e de texto.

---

## O template

Em `skills/fazer-site/template/` vem um site de uma página, escuro, com um
acento de cor e movimento leve. Nasceu da prévia de uma loja de motos aprovada
pelo dono e serve a qualquer loja ou serviço local que vende pelo WhatsApp.

- **~40 KB** sem fotos, HTML + CSS + JS puro, sem build, sem biblioteca.
- **11 seções:** hero com o nome grande, faixa corrida, vitrine de produtos,
  avaliação em destaque com palavras que acendem, serviços, fotos da loja,
  nota que conta até o valor, formulário que monta a mensagem do WhatsApp,
  como chegar com mapa, e barra fixa de WhatsApp e Ligar no celular.
- **137 placeholders** (`{{NOME}}`, `{{WHATSAPP}}`, `{{NOTA}}`…) preenchidos
  pelo script `personalizar.sh`, que também troca a cor da marca, as fontes e
  o favicon.
- Vem marcado como **prévia** (selo, `noindex`, `robots.txt`). O README do
  template diz o que remover quando virar site oficial.

Detalhes em [`skills/fazer-site/template/README.md`](skills/fazer-site/template/README.md).

---

## Como instalar

**Como plugin** (recomendado, instala as sete de uma vez). No Claude Code:

```
/plugin marketplace add mkttpierre/site-demonstracao
/plugin install site-demonstracao@site-demonstracao
```

Ou, numa linha só, pelo terminal:

```bash
claude plugin install site-demonstracao --marketplace mkttpierre/site-demonstracao
```

As skills aparecem como `/site-demonstracao:fazer-site`,
`/site-demonstracao:gravar-site` e assim por diante.

**Sem plugin**, copiando as pastas para a sua pasta de skills:

```bash
git clone https://github.com/mkttpierre/site-demonstracao
cp -r site-demonstracao/skills/* ~/.claude/skills/
```

No Windows (PowerShell):

```powershell
git clone https://github.com/mkttpierre/site-demonstracao
Copy-Item -Recurse site-demonstracao\skills\* "$env:USERPROFILE\.claude\skills\"
```

No Codex, copie para `~/.codex/skills/`.

### O que precisa ter na máquina

- **Para a `gravar-site`:** Node.js 18 ou mais novo; um Chromium (o do
  Playwright, com `npx playwright install chromium`, ou o Google Chrome
  instalado); e o ffmpeg (`winget install Gyan.FFmpeg` no Windows,
  `brew install ffmpeg` no Mac, `sudo apt install ffmpeg` no Linux). Na
  primeira vez, rode `npm install` dentro de `skills/gravar-site/scripts/`
  (ou na pasta onde a skill ficou instalada).
- **Para a `adaptar-mobile`:** um navegador controlável pelo agente
  (Playwright MCP ou Claude in Chrome) para tirar os prints. Sem ele, a
  revisão de celular fica só no código, e o agente avisa.
- **Para o `personalizar.sh` do template:** Bash (no Windows, o Git Bash serve).

## Como usar

- "Faz uma prévia de site para a Padaria Bom Dia. Os dados estão em `dados.md`."
- "Refaz a landing page do meu curso nesse padrão."
- "Grava o vídeo do site https://meusite.com.br para eu mandar ao cliente."

Depois do site, o agente sobe uma cópia local, te passa o link e diz quais
skills rodaram e o que ficou sem prova. Publicar e mandar ao cliente fica
com você.

A `gravar-site` também roda sem agente nenhum:

```bash
node skills/gravar-site/scripts/gravar.mjs --url https://meusite.com.br --saida site-pc.mp4
```

Opções: `--roteiro roteiro.json`, `--max 60` (encurta), `--viewport 1440x900`,
`--fps 30`, `--bloquear dominio.com`, `--sem-folha`. Leva de 1 a 3 minutos.

---

## Licenças e créditos

- **`fazer-site`, `landing-page-cinematografica`, `copywriting`,
  `adaptar-mobile`, `gravar-site` e o template:** MIT ([LICENSE](LICENSE)).
- **`frontend-design`:** © Anthropic, Apache 2.0, copiada sem alteração de
  [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design).
  Licença em [`skills/frontend-design/LICENSE.txt`](skills/frontend-design/LICENSE.txt).
- **`revenue-centric-design`:** ideias de Richard ([@richardrx](https://x.com/richardrx)),
  curadoria de [heliocosta-dev/revenue-centric-design](https://github.com/heliocosta-dev/revenue-centric-design).
  Licença *source-available* em [`skills/revenue-centric-design/LICENSE`](skills/revenue-centric-design/LICENSE):
  exige atribuição e **proíbe uso em produtos de aposta, cassino ou jogos de
  azar**. Essa restrição vale para qualquer cópia.
- **`copywriting`** usa o método do Eugene Schwartz e de outros redatores
  citados, com palavras próprias e sem ligação com eles.
