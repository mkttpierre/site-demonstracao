---
name: adaptar-mobile
description: >
  Use quando o operador pedir "/adaptar-mobile", revisão de celular, "adapta pro mobile", "ajusta pro celular",
  ou antes de entregar/publicar qualquer site, landing ou página nova. Varre 10 pontos em 360px e 375px,
  aplica as correções e confere que o desktop (1440px) não quebrou.
---

# /adaptar-mobile

Premissa: a **primeira impressão do site é no celular** (o dono abre o link no dele; o cliente vem do
Instagram). Desktop é a exceção. É o mesmo site respondendo, não um layout paralelo.

## Entrada

Pasta do projeto. Se o operador não disser, usar a pasta da sessão. Ler o `_memoria/` do negócio carregado
(marca, WhatsApp, vocabulário) e `identidade/design-guide.md` se existir. Antes de mexer: subir o site local
(dev server ou arquivo) e anotar a URL.

## Regras de ouro

- Não criar layout mobile paralelo.
- Não esconder conteúdo importante no celular para "caber".
- Não mexer no desktop além do que a correção mobile exigir.
- Corrigir na raiz (CSS responsivo, `min-width: 0`, `flex-wrap`, `clamp()`), não com `overflow-x: hidden`
  no `body` para mascarar. `overflow-x: hidden` só como cinto de segurança depois de achar a causa.

## Como medir

Usar Playwright (`mcp__playwright__browser_resize` + `browser_take_screenshot` de página inteira) em
**360×800** e **375×812**, e conferir em 1440×900 no fim. Olhar as imagens de verdade; não aprovar só pelo código.
Detector de rolagem horizontal, rodar em cada largura via `browser_evaluate`:

```js
[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth + 1)
  .map(e => e.tagName + '.' + e.className).slice(0, 20)
// e: document.documentElement.scrollWidth > innerWidth
```

Detector de alvo de toque pequeno:

```js
[...document.querySelectorAll('a,button,input,select,textarea,[role=button]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44) })
  .map(e => e.outerHTML.slice(0, 80))
```

## Os 10 pontos (seção por seção)

1. **Primeira tela.** Antes de rolar: promessa legível + botão de ação visível. Hero que ocupa duas telas ou
   título que vira sopa de quebras: corrigir (`min-height: 100svh` com limite, `clamp()` no título, menos padding).
2. **Dedo, não cursor.** Todo clicável com área mínima de 44px e espaço entre vizinhos. Nada de dois links grudados.
3. **WhatsApp sempre à mão.** Botão fixo e discreto no canto inferior, sem cobrir conteúdo (dar `padding-bottom`
   ao rodapé) e sem brigar com o teclado aberto (esconder ou subir quando um campo tem foco). Usar o número do
   `_memoria/` do negócio.
4. **Tipografia.** Corpo mínimo 16px (abaixo disso o iOS dá zoom nos campos); títulos que quebram bem
   (`text-wrap: balance`, sem palavra órfã gigante); `line-height` confortável (1.5 no corpo).
5. **Imagens.** Proporção certa (`object-fit`, `object-position` para não decapitar a foto, `aspect-ratio`),
   `loading="lazy"` abaixo da dobra, `srcset`/WebP, nada pesado em 4G (alvo: hero < 200 KB; avisar o que passar).
6. **Menu.** Abre e fecha redondo, itens com folga para o dedo, fecha ao navegar para uma âncora. Sem menu: "limpo".
7. **Formulário.** Coluna única; teclado certo por campo (`type="tel"` + `inputmode="numeric"`, `type="email"`,
   `autocomplete`); erro legível sem zoom. Sem formulário: "limpo".
8. **Rolagem.** Só vertical. Caçar tabela, card, imagem ou palavra comprida que empurra a página
   (`overflow-wrap: anywhere`, `max-width: 100%`, `min-width: 0` em filho de flex/grid).
9. **Seções empilhadas.** O que era lado a lado empilha em ordem que faz sentido: texto da promessa **antes**
   da imagem decorativa (`order` ou ordem do HTML).
10. **Gesto real.** Simular a jornada inteira em 375px: chegar, rolar até o fim, clicar no WhatsApp. Cada
    atrito conta. Conferir também que o link do WhatsApp abre com a mensagem certa.

## Saída

Tabela ponto a ponto, depois aplicar tudo:

| nº | achado | correção aplicada | (ou "limpo") |
|---|---|---|---|

Se o projeto tem versionamento próprio (ex.: `vN-oficial` do site da agência), seguir a regra dele antes de mexer.

## Pronto significa

- Os 10 pontos verificados em 360px **e** 375px, com screenshot olhado.
- Jornada completa sem atrito.
- Zero rolagem horizontal (detector devolvendo vazio nas duas larguras).
- Desktop em 1440px conferido e intacto.
- Se algo não pôde ser verificado, dizer exatamente o quê. Não publicar: deploy só quando o operador pedir.
