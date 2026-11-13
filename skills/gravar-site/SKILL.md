---
name: gravar-site
description: >
  Grava um vídeo horizontal (computador, 1440x900, 30 fps) de um site, fluido e sem travar, com o mouse passando
  e clicando nas funções, para mandar ao cliente ou prospect que vai abrir o link no celular e quer ver também como
  fica no computador. Use sempre que o operador pedir "gravar o site", "vídeo do site", "demonstração do site no
  computador", "grava como ficou", "/gravar-site", ou quiser mostrar o site funcionando a alguém, mesmo sem citar a
  skill. Não serve para gravar tela do computador dele, vídeo vertical do celular, nem editar vídeo (use hyperframes
  ou video-use).
---

# Gravar site

O script abre o site num navegador invisível, avança o relógio quadro a quadro e entrega um mp4 que nunca engasga,
mesmo com animações pesadas. Quem grava é o script, não a IA: o modelo só escolhe o modo, roda um comando e olha uma
imagem no fim. Por isso rode esta skill no modelo mais barato que você tiver:

- **Claude Code:** Haiku (`/model haiku`) ou Sonnet em esforço baixo. Opus aqui é desperdício.
- **Codex / ChatGPT:** o modelo mini ou o de esforço baixo.
- **Outros agentes (Gemini CLI, Antigravity, Cursor):** o modelo rápido (Flash ou equivalente).

Não abra subagente nem delegue para outro agente: o custo de explicar a tarefa é maior que o de rodar o comando.

## Rodar

```bash
node "${CLAUDE_SKILL_DIR}/scripts/gravar.mjs" --url https://site.com --saida "C:/caminho/entregas/site-pc.mp4"
```

Primeira vez na máquina: `cd "${CLAUDE_SKILL_DIR}/scripts" && npm install`. O script acha sozinho o Chromium do
Playwright e o ffmpeg; se faltar um, a mensagem de erro diz o que instalar. Demora 1 a 3 minutos.

Saída: o mp4 e uma linha `RESULTADO {...}` com `ok`, duração, tamanho, verificações e `folha_de_contato`.

## Dois modos

- **Automático (padrão, sem roteiro):** mostra o topo e passa o mouse no botão do menu; desce seção por seção; em
  cada uma abre abas, abre perguntas e respostas, clica opções do formulário, digita o nome ("Maria") e uma mensagem
  curta, passa o mouse em botões e links; volta ao topo. Teto de 75 s (`--max 60` encurta). Serve na maioria dos
  sites; foi testado em duas estruturas diferentes.
- **Roteiro (`--roteiro roteiro.json`):** quando o operador quer uma sequência exata ou o automático errou algo.
  Formato e ações em [referencia/roteiro-exemplo.json](referencia/roteiro-exemplo.json). Seletores são os do
  Playwright (`#id`, `.classe`, `text=Agendar`, `role=button[name="X"]`).

Opções: `--viewport 1440x900`, `--fps 30`, `--bloquear dominio.com` (acrescenta bloqueios), `--sem-folha`.

## Regras que o script já cumpre

- Nunca envia formulário e nunca abre WhatsApp, Instagram ou outro site: links só recebem o mouse por cima.
- Libera a rede toda. Mapa, fontes e vídeo embutidos só carregam assim; bloquear tudo menos o domínio do site deixa o
  mapa quebrado e troca a fonte da marca.
- Espera o mapa e os iframes carregarem em tempo real antes de gravar a seção.
- Reprova (`ok: false`) se a rolagem der solavanco, se um formulário for enviado, se abrir janela ou sair do site.

## Conferir antes de entregar (obrigatório)

1. Ler a imagem em `folha_de_contato` (12 quadros do vídeo inteiro). Procurar: tela branca, imagem faltando, fonte
   trocada, mapa com erro, texto de teste visível (`XXXXXX`, "lorem", CRP ou telefone provisório), cursor perdido.
2. Se algo estiver errado, corrigir o site ou usar roteiro; não entregar com ressalva.
3. Apagar a folha (`rm` no caminho de `folha_de_contato`) e dizer ao operador o caminho do mp4, duração e tamanho.

O vídeo vai para a pasta `entregas/` do cliente. Mandar a ele é decisão do operador.

## Limites

- Só horizontal. Para vídeo vertical, `--viewport 390x844` muda o tamanho mas não simula toque: tratar como
  extensão futura, não prometer.
- Site que exige login ou só abre com dado real: usar roteiro e uma URL de prévia.
- Para regravar depois de mexer no site, publicar a mudança primeiro (o script grava o endereço público ou
  `http://localhost:porta` com o servidor de pé).
