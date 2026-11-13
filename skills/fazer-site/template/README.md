# Template cinemático (loja local)

Template de **uma página**, escuro, com acento laranja e movimento leve. Nasceu
da prévia de uma loja de motos seminovas em São Paulo, aprovada pelo dono, e é o
ponto de partida da skill `fazer-site`. Todo dado da loja saiu: o que está aqui
são placeholders `{{CHAVE}}`.

**Peso:** site ~40 KB sem fotos · **Stack:** HTML + CSS + JS puro, um arquivo ·
**Build:** nenhum · **Fontes:** Google Fonts (Barlow Condensed + Barlow)

---

## Para que serve

Categoria: **revenda de motos/carros e loja de veículos**. Serve também outras
**lojas de varejo com estoque** que vendem pelo WhatsApp (bicicletas, náutica,
peças, móveis usados, eletrônicos): troque os textos e as fotos, a estrutura
aguenta. Não serve para serviço puro (oficina, estética automotiva, lava-jato)
sem catálogo: ali os 8 cartões de estoque sobram; corte a seção ou troque por
serviços.

É leve, escuro, mobile-first e **já vem com tudo que converte no celular**: barra
fixa, CTA repetido, formulário que vira mensagem de WhatsApp.

## Seções (na ordem)

| # | Seção | O que faz |
|---|---|---|
| 0 | Selo de prévia + topo | Selo "Prévia de site"; logo em texto (primeira palavra na cor de destaque); menu + botão WhatsApp |
| 1 | Hero | Nome grande, frase, prova (nota, seguidores, horário), CTA específico + CTA secundário + *click trigger* embaixo. Foto com **cantos em diagonal** (corte por `clip-path`) e zoom lento |
| 2 | Faixa | Texto laranja em movimento contínuo (9 palavras) |
| 3 | Estoque | 8 cartões (foto quadrada, nome, ano/km, preço, botão "perguntar se está disponível" com a mensagem do item). No celular vira trilho horizontal com *snap*. CTA "pedir a lista completa" |
| 4 | Avaliação em destaque | Uma avaliação real, sem foto atrás, em letra grande; as **palavras acendem** uma a uma ao entrar na tela; palavras-chave em laranja. CTA específico + *trigger* |
| 5 | Como a loja trabalha | Zona clara, 5 serviços numerados + CTA no sexto espaço |
| 6 | A loja | Mosaico de 4 fotos (1 grande, 2 pequenas, 1 larga) |
| 7 | Avaliações | **Nota grande com contador** (conta até o valor ao entrar na tela) + 2 avaliações + CTA |
| 8 | Contato | **Formulário que monta a mensagem do WhatsApp** (botões de intenção e tipo + 2 campos, com prévia da mensagem ao vivo). Nada é gravado |
| 9 | Como chegar | Endereço, 3 linhas de horário, rota, Maps embutido |
| 10 | Rodapé + barra fixa mobile | Contatos; no celular, barra "WhatsApp + Ligar" fixa que some enquanto o CTA do hero está na tela |

Movimento: só CSS + `IntersectionObserver`, tudo desligado em
`prefers-reduced-motion`. Sem biblioteca, sem jQuery, sem GSAP.

## Como usar

```bash
cd <pasta-da-skill>/template
cp dados-modelo.txt ~/clientes/<slug>/dados-site.txt   # preencher com os dados do cliente
./personalizar.sh ~/clientes/<slug>/site '#2F6FED' 'Nome do Cliente' \
    --dados ~/clientes/<slug>/dados-site.txt
# opcional: --fonte-titulo 'Oswald' --fonte-corpo 'Inter'   |   CHAVE=valor direto na linha
```

O script copia `html/` para a pasta destino, troca a **cor de marca**
(`--laranja`, o hover derivado e o favicon), as **fontes** (opcional) e preenche
os placeholders (escapando `&`, `<`, aspas). Sozinho, deduz do nome: `MARCA_1`
(primeira palavra, no destaque), `MARCA_2` (o resto), `SIGLA` (primeira palavra,
até 3 letras), `MAPS_DESTINO` e `MAPS_URL` (nome + endereço). O original nunca é
alterado. No fim ele lista os placeholders que ficaram sem valor e o trabalho
manual (fotos, itens, avaliações).

Cores e fontes são **variáveis no topo do CSS** (`:root` em `html/index.html`):
`--fundo`, `--fundo2`, `--fundo3`, `--cartao`, `--linha`, `--texto`, `--suave`,
`--laranja`, `--laranja-claro`, `--claro`, `--tinta`, `--titulo`, `--corpo`. O
script troca só o acento e as fontes; os fundos escuros ficam. Escolha uma cor de
acento que aguente **texto branco por cima** (botões).

## Fotos

Não há foto no template. Cada foto é um **bloco cinza com o rótulo do que vai
ali** (CSS `.ph`). Coloque em `html/img/` (ou `img/` do cliente) o arquivo com o
nome esperado e ele cobre o bloco; sem o arquivo o cinza continua (o `onerror`
esconde o ícone quebrado). Nomes e tamanhos em `html/img/LEIA-ME.txt`:
`hero.jpg` (1200x900), `item-1.jpg` a `item-8.jpg` (640x640), `loja1.jpg`,
`loja2.jpg`, `fachada.jpg`, `loja3.jpg`. **Foto do próprio cliente**, nunca de
outro cliente nem de banco.

## Placeholders

137 no total, todos em `dados-modelo.txt` (com comentário do que vai em cada
um). Resumo por grupo:

| Grupo | Placeholders |
|---|---|
| Identidade | `NOME`, `MARCA_1`, `MARCA_2`, `SIGLA` (os quatro saem do nome), `AUTOR_PREVIA` (quem fez a prévia) |
| Contato | `WHATSAPP` (55+DDD+número, só dígitos), `TELEFONE` (`+55...`), `TELEFONE_EXIBIDO`, `INSTAGRAM` (sem @) |
| Endereço e horário | `ENDERECO_LINHA1`, `ENDERECO_LINHA2`, `ENDERECO_TITULO`, `HORARIO_1..3_DIAS`, `HORARIO_1..3_HORAS`, `HORARIO_FONTE`, `MAPS_DESTINO`, `MAPS_URL` |
| SEO e topo | `TITULO_SEO`, `DESCRICAO_SEO`, `NAV_ESTOQUE` |
| Hero | `HERO_LABEL`, `HERO_FRASE`, `HERO_LEAD`, `HERO_ALT`, `CTA_PRINCIPAL`, `CTA_SECUNDARIO`, `MSG_PRINCIPAL`, `HERO_TRIGGER`, `CTA_BARRA` |
| Provas | `NOTA` (ex.: `4,7`), `N_AVALIACOES`, `SEGUIDORES`, `PROVA_3_TITULO`, `PROVA_3_TEXTO` |
| Faixa | `FAIXA_1..9` |
| Estoque | `ESTOQUE_LABEL`, `ESTOQUE_TITULO`, `ESTOQUE_SUB`, `BTN_ITEM`, `CTA_LISTA`, `MSG_LISTA`, `ESTOQUE_FONTE`, e por item `ITEM_n_NOME`, `ITEM_n_DETALHE`, `ITEM_n_PRECO`, `ITEM_n_ALT` (n = 1..8) |
| Avaliação em destaque | `DOR_LABEL`, `AVALIACAO_DESTAQUE_TEXTO`, `AVALIACAO_DESTAQUE_PALAVRAS` (separadas por vírgula), `AVALIACAO_DESTAQUE_NOME`, `DOR_CTA`, `DOR_MSG`, `DOR_TRIGGER` |
| Serviços | `SERV_LABEL`, `SERV_TITULO`, `SERV_SUB`, `SERV_n_TITULO`, `SERV_n_TEXTO` (n = 1..5), `SERV_CTA`, `SERV_MSG`, `SERV_FONTE` |
| Loja | `LOJA_LABEL`, `LOJA_TITULO`, `LOJA_SUB`, `LOJA_1..4_ALT`, `LOJA_FONTE` |
| Avaliações | `AVAL_TITULO`, `AVALIACAO_1_TEXTO`, `AVALIACAO_1_NOME`, `AVALIACAO_2_TEXTO`, `AVALIACAO_2_NOME`, `AVAL_CTA`, `AVAL_MSG` |
| Formulário | `CONTATO_LABEL`, `INTENCAO_1..4`, `TIPO_LEGENDA`, `TIPO_1..4`, `CAMPO_ITEM_LABEL`, `CAMPO_ITEM_EXEMPLO`, `ITEM_ROTULO` |

Os links de WhatsApp com mensagem usam `data-msg`: o JS junta a abertura
("Olá! Vim pelo site da `NOME`.") com a mensagem e codifica. **Não escreva URL
codificada nos placeholders.** Sem JS o botão abre o chat sem texto.

Regras de conteúdo: `NOTA`, `N_AVALIACOES`, `SEGUIDORES`, preço, km, horário e
avaliação são **dado público conferido** (ficha do Google, Instagram do cliente),
com a origem dita em `*_FONTE`. Nome de cliente nas avaliações sempre abreviado
("Ana P."). Nada inventado: se não existe, apague o bloco em vez de preencher.

## O que é proibido neste padrão

- **Cartões empilhados que descem ao rolar** (sticky stacking).
- **Recorte arredondado em foto de loja ou de produto.** Cantos vivos; a única
  forma recortada é a diagonal do hero.
- **Foto atrás de avaliação.** A avaliação em destaque é texto sobre fundo liso.
- **Dourado e serifado como padrão.** Escuro neutro + um acento forte, fonte
  condensada em itálico para título.
- Hero sem o nome da loja; cor provisória sem avisar; reaproveitar foto, texto ou
  avaliação de um cliente em outro.

## Armadilhas

- **Prévia, não site oficial.** Vêm junto o selo de prévia, `noindex`,
  `robots.txt` e `vercel.json` (`X-Robots-Tag`). Ao virar site oficial, remover os
  4 itens marcados com `REMOVER AO VIRAR SITE OFICIAL` no `index.html` e apagar
  `robots.txt` e `vercel.json`.
- **8 cartões de estoque.** Para outra quantidade, copiar ou apagar um
  `<article class="moto">` inteiro e renumerar `ITEM_n` e `img/item-n.jpg`.
- **Destaque da avaliação:** o texto vai em um só placeholder; o JS separa as
  palavras. Palavra em `AVALIACAO_DESTAQUE_PALAVRAS` que não existe no texto é
  ignorada sem erro.
- **Sem foto o bloco cinza aparece em produção.** Não publicar com bloco cinza.
- **Os previews mostram os placeholders crus**: nomes longos quebram em várias
  linhas e `{{NOTA}}` aparece quebrado em letra gigante. Com valores reais isso
  não acontece (é a nota, ex. `4,7`).
- **Abrir por HTTP**, não por `file://`, para conferir (o Maps embutido e o
  `onerror` das imagens dependem disso):
  `cd html && python -m http.server 8899`.
- **Contador da nota** só anima se `NOTA` for número (`4,7`). Texto como "Nota 10"
  fica parado, sem erro.

## Como foi feito (skills)

Sequência da skill `fazer-site`, a mesma para clonar o padrão em outro cliente:
`frontend-design` → `landing-page-cinematografica` → `revenue-centric-design` →
`copywriting` → `adaptar-mobile`. Depois do `personalizar.sh`, rodar de novo ao
menos `copywriting` (texto do cliente) e `adaptar-mobile` (360 e 375 px, e
conferir 1440).

## Preview

Em [`preview/`](preview/):

| Arquivo | O que é |
|---|---|
| `template-1440.png`, `template-375.png` | O template **com placeholders**, página inteira, no computador e no celular |

## Origem

Prévia real de uma loja de motos, aprovada pelo dono. Mudanças em relação à
prévia: dados trocados por placeholders, fotos trocadas por blocos cinza,
`data-msg` + JS no lugar das URLs codificadas à mão, avaliação em destaque com
palavras separadas por JS, número da nota lido do próprio texto, cores e fontes
documentadas como variáveis, ajustes de `overflow-wrap` e `min-width` para
aguentar nome de loja longo.
