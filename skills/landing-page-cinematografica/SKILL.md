---
name: landing-page-cinematografica
description: Camada de movimento e acabamento cinematográfico para site, landing page ou prévia de negócio local (loja, serviço, clínica, oficina), dentro de um padrão visual testado em negócio real - nome no hero, identidade real da marca, cantos vivos, movimento leve que não trava no celular. Use quando for construir ou refazer um site e quiser ritmo, escala tipográfica e animação com peso; normalmente chamada pela skill fazer-site, depois da frontend-design.
---

# Site cinematográfico

Você dá ao site a sensação de peça bem dirigida: cada rolagem revela algo, cada botão responde com peso, a tipografia tem escala de cartaz. O cliente final é dono de negócio local e quem visita está no celular, muitas vezes no 4G. Por isso o movimento é leve, nativo do navegador, e nunca atrapalha a leitura nem o clique no WhatsApp.

Referência viva do padrão: o template que vem com a skill `fazer-site` (`fazer-site/template/`). Na dúvida sobre ritmo, escala ou densidade, abra a referência e imite o acabamento, não o conteúdo.

## Axiomas

1. **A identidade é do cliente.** Cor e tipografia saem da logo, da fachada e do Instagram do negócio. Nada de paleta pronta de catálogo. Só quando não existe logo em lugar nenhum entra uma cor provisória, declarada como provisória.
2. **O nome do negócio está no hero, grande.** Hero sem o nome foi rejeitado.
3. **Foto é do negócio, nunca de banco.** Fachada, loja, produto, resultado. Sem foto real de alguma parte, o bloco fica marcado como ilustrativo ou sai.
4. **Movimento serve à leitura.** Se uma animação atrasa o conteúdo, trava a rolagem ou some com o botão, ela sai.
5. **Leve por padrão.** HTML, CSS e `IntersectionObserver` resolvem. Biblioteca de animação (GSAP e afins) só entra quando um efeito aprovado não sai sem ela, e nunca para algo que o CSS faz.

## Proibido (cada item já foi reprovado em projeto real)

- **Cartões que empilham ou descem ao rolar** (sticky stacking, `pin` com escala e desfoque). Não entra.
- **Recorte arredondado, em arco ou círculo em foto de loja, fachada, produto ou ambiente.** Contêineres com `border-radius` grande também saem. Cantos vivos ou corte diagonal (`clip-path`) são o padrão.
- **Foto de fundo atrás das avaliações.**
- **Serifado fino e itálico como título, e dourado como acento padrão.** Lê como "delicado". O tom pedido é masculino, agressivo, moderno, salvo quando a marca do cliente diz outra coisa.
- **Tabela de preços inventada e números inventados.** Preço, nota, prazo, depoimento e contagem só entram se forem públicos do próprio negócio.
- **Enfeite de software sem sentido para negócio local:** cards fingindo painel ao vivo, "System Operational", cursor que clica sozinho, máquina de escrever de log.

## O que faz o efeito cinematográfico

**Tipografia de cartaz.** Uma família condensada e pesada para títulos (ex.: Barlow Condensed 800 itálico), outra limpa para o corpo. Títulos grandes (`clamp()` até ~90-140 px no desktop), entrelinha curta, `text-wrap: balance`. O contraste de escala entre título e texto é o principal efeito; ele custa zero.

**Hero.** Nome do negócio enorme, uma frase concreta do que ele faz e onde, provas curtas (nota, avaliações, seguidores, horário) e o botão principal. No desktop, texto e foto lado a lado. No celular a ordem é: nome, frase, provas, botão, foto. A foto pode ter cantos cortados em diagonal e um zoom lento (`scale` 1 para 1.06 em ~20 s).

**Entrada escalonada.** Ao carregar, os elementos do hero sobem 16-40 px e aparecem em sequência (atraso de ~80 ms entre eles). Seções abaixo revelam com o mesmo movimento ao entrar na tela, por `IntersectionObserver` com `threshold` baixo.

**Textura.** Ruído SVG `<feTurbulence>` a 5% de opacidade sobre fundos chapados do hero e dos destaques, para tirar a cara de gradiente digital.

**Botões com peso.** `overflow: hidden` com uma camada que desliza para trocar a cor no hover, leve `scale(1.03)` com `cubic-bezier(0.25, 0.46, 0.45, 0.94)`. Alvo de toque mínimo de 44 px.

**Destaque de prova em tela larga.** Uma avaliação real em tamanho de manifesto, fundo escuro liso, com as palavras acendendo em sequência conforme a rolagem. Uma por site; o resto das avaliações em grade simples.

**Número que conta.** A nota ou outro número real conta de 0 até o valor ao entrar na tela.

**Faixa de serviços em contraste.** Uma seção clara no meio do site escuro (ou o inverso), com números grandes de ordem (01, 02...), corta o ritmo e marca a mudança de assunto.

**Faixa corrida (marquee)** com serviços ou categorias, na cor de acento, opcional.

## Regras técnicas

- Base: HTML estático com CSS no próprio arquivo, salvo quando o projeto já tem outra base. Em projeto existente, preserve a base e a copy aprovada; aplique só esta camada.
- Fontes pelo Google Fonts com `preconnect` e `display=swap`.
- Imagem do hero com `fetchpriority="high"`; o resto com `loading="lazy"`, `width` e `height` declarados.
- Tudo dentro de `@media (prefers-reduced-motion: reduce)` desliga animação e transição.
- Celular: barra fixa embaixo com WhatsApp e Ligar, que some quando um campo do formulário recebe foco e enquanto o botão do hero está visível. Sem rolagem horizontal em 360 px.

## Pronto quando

- Os prints de 360, 375 e 1440 px foram abertos e olhados, e nenhum item da lista de proibidos aparece.
- O nome do negócio está no hero e as fotos são do próprio negócio ou marcadas como ilustrativas.
- Com `prefers-reduced-motion` ligado, o site aparece inteiro e legível, sem conteúdo escondido esperando animação.
