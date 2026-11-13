---
name: fazer-site
description: Use SEMPRE que o operador pedir para fazer, criar, refazer, melhorar ou montar um site, landing page, página de vendas ou prévia de site para qualquer negócio (cliente, prospect ou o próprio negócio), mesmo sem citar skill. Define a sequência obrigatória de cinco skills e o ponto de partida no template incluído.
---

# Fazer site no padrão cinematográfico

Todo site novo sai de um padrão só, montado com cinco skills aplicadas nesta ordem, cada uma com um papel. Pular uma delas ou mudar a ordem produz um destes três resultados: bonito e sem conversão, convertendo e sem acabamento, ou quebrado no celular.

## Antes de começar

1. Leia o que existe sobre o negócio: `identidade.md`, `site.json`, `_memoria/` ou o briefing que o operador passar. Os fatos (nome, telefone, endereço, preços, nota, avaliações, fotos) vêm só dali e das fontes públicas do negócio. **Avaliação no site só se for 100% positiva**: fica de fora a que cita defeito, problema, reclamação, negócio desfeito ou qualquer ponto que gere dúvida, mesmo que termine elogiando. Na dúvida, não entra. Também não se cita, em outra parte do site, quem escreveu uma avaliação que ficou de fora.
2. **Cores da marca inteira, não só o destaque.** Se a logo ou a fachada usam duas cores (ex.: laranja e azul), as duas aparecem com presença no site, nos tons da própria fachada ou logo. Fundo quase preto não conta como a segunda cor.
3. **Logo definida vira ícone da guia.** Se o negócio tem logo (enviada pelo dono, Linktree, site, letreiro ou redesenhada e aprovada), ela é o favicon do site: arquivo `img/favicon.png` (quadrado, a partir da logo sem fundo, com respiro, 64 e 180 px) ligado no `<head>` por `<link rel="icon">` e `<link rel="apple-touch-icon">`. Logo larga demais para ficar legível em 16 px: use o elemento central dela (a etiqueta, o monograma, a inicial na letra da logo), nunca outra letra ou ícone inventado. Sem logo, o favicon fica a inicial nas cores da marca.
4. Comece do template incluído: `${CLAUDE_SKILL_DIR}/template/` (o `README.md` dele explica placeholders, fotos e o script `personalizar.sh`). Serve a qualquer loja ou serviço local; troque as seções que não fazem sentido para o nicho. Outro template só quando o nicho pedir uma estrutura que este não tem, e mesmo assim com o acabamento deste.
5. Base técnica: HTML estático (um `index.html` com CSS e JS no próprio arquivo, mais `img/`). Entrega o mesmo visual e as mesmas animações, gasta menos token, publica sem build e não quebra por dependência. Next.js só quando o site precisa de servidor: formulário que grava em banco ou dispara webhook com chave secreta, área de login, blog com muitas páginas geradas, ou quando o projeto já existe em Next (aí preserve a base).
6. Em site que já existe, guarde a versão atual (`versoes/vN-antes-vN+1/`) antes de mexer.

## A sequência (uma skill por vez, nesta ordem)

1. **`frontend-design`**: direção visual com a identidade real do negócio (cor da logo, tipografia de cartaz, contraste de seção). *Termina* quando paleta, fontes e estrutura de seções estão decididas.
2. **`landing-page-cinematografica`**: movimento e acabamento (entrada escalonada, ruído, botões com peso, destaque de avaliação, número que conta, cantos vivos ou diagonais). *Termina* quando nenhum item da lista de proibidos dela aparece.
3. **`revenue-centric-design`** (abra `references/conversion-and-landing-pages.md`): hero que passa no teste de 5 segundos, prova na primeira dobra do celular, CTA específico com uma linha de garantia embaixo, CTA a cada 1,5 seção, menos cliques para fora. *Termina* quando a promessa não é maior que a prova.
4. **`copywriting`** (base Eugene Schwartz): todos os textos, na língua do cliente final, sem inventar fato. *Termina* quando cada frase do site é verificável numa fonte do negócio.
5. **`adaptar-mobile`**, sempre por último: 360 e 375 px, e conferir que 1440 px não quebrou. *Termina* com os prints abertos e olhados.

## Fecho

- Sirva local e mande o link (`http://localhost:PORTA`). Publicar só quando o operador pedir.
- Na entrega, diga quais das cinco skills rodaram e o que ficou sem prova (fato não confirmado, teste só em emulação).
