#!/usr/bin/env node
// gravar-site: grava um site em navegador invisivel, quadro a quadro, e entrega um mp4 fluido.
// Uso: node gravar.mjs --url https://site.com [--saida video.mp4] [--roteiro roteiro.json] [--viewport 1440x900]
// Sem --roteiro, faz o passeio automatico. Ver SKILL.md.
import { chromium } from 'playwright-core';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { once } from 'node:events';

// ---------- argumentos ----------
const A = {};
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i];
  if (!k.startsWith('--')) continue;
  const n = process.argv[i + 1];
  if (n === undefined || n.startsWith('--')) A[k.slice(2)] = true;
  else { A[k.slice(2)] = n; i++; }
}
const roteiro = A.roteiro ? JSON.parse(fs.readFileSync(A.roteiro, 'utf8').replace(/^\uFEFF/, '')) : {};
const URL_ALVO = A.url || roteiro.url;
if (!URL_ALVO) { console.error('Faltou --url (ou "url" no roteiro).'); process.exit(2); }
const SAIDA = path.resolve(A.saida || roteiro.saida || 'site-pc.mp4');
const [W, H] = String(A.viewport || roteiro.viewport || '1440x900').split('x').map(Number);
const FPS = Number(A.fps || roteiro.fps || 30), DT = 1000 / FPS;
const MAX_SEG = Number(A.max || roteiro.max || 75); // teto de duracao do passeio automatico
const BLOQUEAR = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com', ...String(A.bloquear || '').split(',').filter(Boolean), ...(roteiro.bloquear || [])];

// ---------- ferramentas ----------
function acharChrome() {
  if (A.chrome) return A.chrome;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const raizes = [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(process.env.LOCALAPPDATA || '', 'ms-playwright'), path.join(os.homedir(), '.cache', 'ms-playwright'), path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')].filter(Boolean);
  for (const r of raizes) {
    if (!fs.existsSync(r)) continue;
    const pastas = fs.readdirSync(r).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]));
    for (const p of pastas) for (const rel of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'])
      if (fs.existsSync(path.join(r, p, rel))) return path.join(r, p, rel);
  }
  for (const c of ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']) if (fs.existsSync(c)) return c;
  console.error('Chromium nao encontrado. Rode: npx playwright-core install chromium'); process.exit(2);
}
function acharFfmpeg() {
  if (A.ffmpeg) return A.ffmpeg;
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  const wg = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(wg)) for (const d of fs.readdirSync(wg).filter(d => /ffmpeg/i.test(d))) {
    const base = path.join(wg, d);
    for (const s of fs.readdirSync(base)) { const f = path.join(base, s, 'bin', 'ffmpeg.exe'); if (fs.existsSync(f)) return f; }
  }
  console.error('ffmpeg nao encontrado. Instale (winget install Gyan.FFmpeg) ou passe --ffmpeg caminho.'); process.exit(2);
}
const CHROME = acharChrome(), FFMPEG = acharFfmpeg();

// ---------- navegador ----------
const ORIGEM = new URL(URL_ALVO).origin;
fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
const ff = spawn(FFMPEG, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', SAIDA], { stdio: ['pipe', 'inherit', 'inherit'], windowsHide: true });
const ffFim = once(ff, 'close');
ff.stdin.on('error', () => {});

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'pt-BR' });
let bloqueados = 0, foraDoSite = 0, popups = 0, frame = 0, maxVel = 0, maxSolavanco = 0, prevScroll = 0, prevD = 0, y = 0;
let cursor = { x: W / 2, y: Math.round(H * 0.72) };
const rolagem = [], saltos = [];
let page = null;
await context.route('**/*', async r => {
  const rq = r.request(); let u; try { u = new URL(rq.url()); } catch { return r.continue(); }
  if (BLOQUEAR.some(h => u.hostname === h || u.hostname.endsWith('.' + h))) { bloqueados++; return r.abort(); }
  if (rq.isNavigationRequest() && page && rq.frame() === page.mainFrame() && u.origin !== ORIGEM && frame > 0) { foraDoSite++; return r.abort(); }
  return r.continue();
});
context.on('page', p => { if (page && p !== page) { popups++; p.close().catch(() => {}); } });
await context.addInitScript(() => {
  window.__animStarts = new WeakMap(); window.__submitted = 0;
  document.addEventListener('submit', e => { window.__submitted++; e.preventDefault(); e.stopImmediatePropagation(); }, true);
  window.__drawFrame = (t, x, y) => {
    document.documentElement.style.scrollBehavior = 'auto';
    let el = document.getElementById('__demo_cursor');
    if (!el) {
      el = document.createElement('div'); el.id = '__demo_cursor';
      Object.assign(el.style, { position: 'fixed', left: '0', top: '0', width: '22px', height: '26px', zIndex: '2147483647', pointerEvents: 'none', filter: 'drop-shadow(0px 1px 1px #0007)' });
      el.innerHTML = '<svg width="22" height="26" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 L2 19 L6.5 15 L10.2 23 L13.4 21.5 L9.8 13.8 L16.2 13.4 Z" fill="#111" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>';
      document.documentElement.appendChild(el);
    }
    el.style.transform = `translate(${x}px, ${y}px)`;
    for (const a of document.getAnimations()) { try { if (!window.__animStarts.has(a)) { window.__animStarts.set(a, t); a.pause(); } a.currentTime = Math.max(0, t - window.__animStarts.get(a)); } catch {} }
  };
  window.__clique = (x, y) => {
    const r = document.createElement('div');
    Object.assign(r.style, { position: 'fixed', left: (x - 22) + 'px', top: (y - 22) + 'px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #e11d74', pointerEvents: 'none', zIndex: '2147483646', opacity: '0' });
    document.documentElement.appendChild(r);
    r.animate([{ transform: 'scale(.35)', opacity: .9 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 520, fill: 'forwards', easing: 'ease-out' });
    setTimeout(() => r.remove(), 1500);
  };
});
page = await context.newPage();
await page.clock.install();

// ---------- primitivas ----------
const esperaReal = ms => new Promise(r => setTimeout(r, ms));
const ease = p => p * p * (3 - 2 * p);
async function quadro() {
  await page.clock.runFor(DT);
  await page.mouse.move(cursor.x, cursor.y);
  await page.evaluate(({ y, t, x, cy }) => { window.scrollTo(0, y); window.__drawFrame(t, x, cy); }, { y, t: frame * DT, x: cursor.x, cy: cursor.y });
  const real = await page.evaluate(() => scrollY);
  const d = real - prevScroll, sol = Math.abs(d - prevD); prevD = d; if (sol > 14) saltos.push(`quadro ${frame} (${(frame / FPS).toFixed(1)}s): rolagem ${prevScroll}->${real}, alvo y=${Math.round(y)}`); maxSolavanco = Math.max(maxSolavanco, sol); maxVel = Math.max(maxVel, Math.abs(d)); rolagem.push(real); prevScroll = real;
  const buf = await page.screenshot({ type: 'jpeg', quality: 92, animations: 'allow' });
  frame++;
  if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');
}
async function anima(seg, alvoY = y, alvoCursor = cursor) {
  const n = Math.max(1, Math.round(seg * FPS)), sy = y, sx = cursor.x, scy = cursor.y;
  for (let i = 1; i <= n; i++) {
    const p = ease(i / n);
    y = sy + (alvoY - sy) * p; cursor = { x: sx + (alvoCursor.x - sx) * p, y: scy + (alvoCursor.y - scy) * p };
    await quadro();
  }
}
const segura = seg => anima(seg);
const noFim = () => frame / FPS >= MAX_SEG;
const maxScroll = () => page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
async function pronto() {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(i => i.decode().catch(() => {}))));
  const novos = await page.evaluate(() => { const s = window.__vistos || (window.__vistos = new Set()); let n = 0; for (const f of document.querySelectorAll('iframe')) { const r = f.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight && !s.has(f)) { s.add(f); n++; } } return n; });
  if (novos) await esperaReal(4500); // mapas e videos embutidos precisam de tempo real de rede
}
async function rolarPara(alvo) {
  alvo = Math.max(0, Math.min(alvo, await maxScroll()));
  const dist = Math.abs(alvo - y);
  if (dist > 2) await anima(Math.min(4.2, Math.max(0.5, dist / 520)), alvo);
  await pronto();
}
async function offsetFixo() {
  return page.evaluate(() => { let h = 0; for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if (cs.position !== 'fixed' && cs.position !== 'sticky') continue; const r = e.getBoundingClientRect(); if (r.top < 40 && r.bottom < 170 && r.width > innerWidth * 0.4) h = Math.max(h, r.bottom); } return h; });
}
let OFF = 0;
const L = sel => page.locator(sel).first();
async function aVista(loc) {
  let b = await loc.boundingBox(); if (!b) throw new Error('Elemento invisivel: ' + loc);
  if (b.y < OFF + 8 || b.y + b.height > H - 8) { await rolarPara(y + b.y + b.height / 2 - H / 2); b = await loc.boundingBox(); }
  return b;
}
async function mover(loc, seg = 0.7) {
  const b = await aVista(loc);
  await anima(seg, y, { x: Math.max(6, Math.min(W - 6, b.x + b.width / 2)), y: Math.max(6, Math.min(H - 6, b.y + b.height / 2)) });
}
async function clicar(loc) {
  await mover(loc);
  await page.evaluate(({ x, y }) => window.__clique(x, y), cursor);
  const antes = page.url();
  await page.mouse.click(cursor.x, cursor.y);
  await quadro();
  if (page.url() !== antes && new URL(page.url()).origin === ORIGEM && !String(page.url()).startsWith(antes.split('#')[0] + '#')) { await page.waitForLoadState('domcontentloaded'); await esperaReal(1800); y = 0; prevScroll = 0; prevD = 0; await pronto(); }
}
async function digitar(loc, texto) {
  await clicar(loc);
  for (const ch of texto) { await page.keyboard.type(ch); await segura(4 / FPS); }
}

// ---------- passeio automatico ----------
async function blocos() {
  return page.evaluate(({ vh }) => {
    const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.height > 180 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
    const tenta = sel => { let c = [...document.querySelectorAll(sel)].filter(vis); c = c.filter(e => !c.some(o => o !== e && o.contains(e))); return c; };
    let c = tenta('section, footer');
    if (c.length < 3) c = tenta('main > *, body > main > * > *');
    if (c.length < 3) c = tenta('body > div > *, body > div > div > *');
    return c.map((e, i) => { e.setAttribute('data-gs', i); const r = e.getBoundingClientRect(); return { i, top: r.top + scrollY, h: r.height }; }).sort((a, b) => a.top - b.top);
  }, { vh: H });
}
async function interacoes(i) {
  // marca os candidatos visiveis do bloco (so o que e seguro: abas, acordeoes, chips, campos de texto; links so recebem hover)
  const c = await page.evaluate(({ i, off, vh }) => {
    const root = document.querySelector(`[data-gs="${i}"]`); let n = window.__n || 0;
    const tag = e => { const k = 'c' + (n++); e.setAttribute('data-gc', k); window.__n = n; return k; };
    const naTela = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 8 && r.height > 8 && r.top >= off && r.bottom <= vh - 8 && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none'; };
    const existe = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 8 && r.height > 8 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const tabs = [...root.querySelectorAll('[role=tab]')].filter(naTela).slice(0, 4).map(tag);
    const acordeoes = [...root.querySelectorAll('summary:not([open]), [aria-expanded="false"]')].filter(e => !e.closest('nav,header') && naTela(e)).slice(0, 2).map(tag);
    const chips = []; const grupos = new Set();
    for (const e of root.querySelectorAll('[aria-pressed="false"], [role=radio][aria-checked="false"]')) { if (!existe(e) || grupos.has(e.parentElement)) continue; grupos.add(e.parentElement); chips.push(tag(e)); if (chips.length >= 2) break; }
    const campos = [];
    for (const e of root.querySelectorAll('input:not([type]),input[type=text],input[type=search],textarea')) {
      if (!existe(e) || campos.length >= 2) continue;
      const dica = [e.name, e.id, e.placeholder, e.autocomplete, e.getAttribute('aria-label')].join(' ').toLowerCase();
      let texto = null;
      if (/nome|name/.test(dica)) texto = 'Maria';
      else if (e.tagName === 'TEXTAREA' || /mensagem|message|assunto|obs/.test(dica)) texto = 'Quero agendar um horário.';
      if (texto) campos.push({ k: tag(e), texto });
    }
    const dentroForm = e => !!e.closest('form');
    const hover = [...root.querySelectorAll('a[href],button')].filter(e => naTela(e) && !e.closest('nav,header,[role=tablist]') && !e.matches('[aria-pressed],[aria-expanded]') && !dentroForm(e)).filter((e, k, a) => a.findIndex(o => Math.abs(o.getBoundingClientRect().top - e.getBoundingClientRect().top) < 40 && Math.abs(o.getBoundingClientRect().left - e.getBoundingClientRect().left) < 40) === k).slice(0, 2).map(tag);
    return { tabs, acordeoes, chips, campos, hover };
  }, { i, off: OFF + 8, vh: H });
  const sel = k => L(`[data-gc="${k}"]`);
  for (const k of c.tabs) { if (noFim()) break; await clicar(sel(k)); await segura(1.1); }
  for (const k of c.acordeoes) { if (noFim()) break; await clicar(sel(k)); await segura(1.1); }
  for (const k of c.chips) { if (noFim()) break; await clicar(sel(k)); await segura(0.7); }
  for (const f of c.campos) { if (noFim()) break; await digitar(sel(f.k), f.texto); await segura(0.8); }
  for (const k of c.hover) { if (noFim()) break; await mover(sel(k), 0.6); await segura(0.4); }
}
async function passeioAutomatico() {
  OFF = await offsetFixo() + 12;
  await segura(2.5);
  const cab = await page.evaluate(() => [...document.querySelectorAll('header a[href], header button, nav a[href]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 20 && r.top >= 0 && r.bottom < 170; }).slice(-1).map(e => { e.setAttribute('data-gc', 'cta0'); return 'cta0'; }));
  if (cab.length) { await mover(L('[data-gc="cta0"]'), 0.9); await segura(0.6); }
  const bs = (await blocos()).filter(b => b.top > H * 0.6);
  for (const b of bs) {
    if (noFim()) break;
    await rolarPara(b.top - OFF); await segura(1.2);
    await interacoes(b.i);
    if (b.h > H * 1.5 && !noFim()) { await rolarPara(Math.min(b.top + b.h - H + 20, y + H * 0.8)); await segura(1.0); }
  }
  await rolarPara(0); await segura(2);
}

// ---------- roteiro manual ----------
async function executaPassos(passos) {
  OFF = await offsetFixo() + 12;
  for (const p of passos) {
    switch (p.acao) {
      case 'segurar': await segura(p.seg ?? 1.5); break;
      case 'esperar': await esperaReal((p.seg ?? 2) * 1000); break;
      case 'rolar': await rolarPara(p.para === 'topo' ? 0 : p.para === 'fim' ? await maxScroll() : Number(p.para)); break;
      case 'secao': await rolarPara(await L(p.alvo).evaluate(e => e.getBoundingClientRect().top + scrollY) - (p.topo ?? OFF)); break;
      case 'mover': await mover(L(p.alvo), p.seg ?? 0.7); break;
      case 'clicar': await clicar(L(p.alvo)); break;
      case 'digitar': await digitar(L(p.alvo), p.texto); break;
      default: throw new Error('Acao desconhecida no roteiro: ' + p.acao);
    }
  }
}

// ---------- execucao ----------
let resultado, erro;
try {
  await page.goto(URL_ALVO, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await esperaReal(2500);
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await pronto();
  if (roteiro.passos?.length) await executaPassos(roteiro.passos); else await passeioAutomatico();
} catch (e) { erro = e; }
ff.stdin.end(); await ffFim;
const submissions = await page.evaluate(() => window.__submitted || 0).catch(() => 0);
const urlFinal = page.url();
await context.close(); await browser.close();

// ---------- verificacao e folha de contato ----------
const dur = frame / FPS;
const falhas = [];
if (erro) falhas.push('erro: ' + erro.message);
if (maxSolavanco > 14) falhas.push(`rolagem com solavanco de ${maxSolavanco.toFixed(1)}px/quadro (limite 14): ${saltos.slice(0, 3).join(" | ")}`);
if (submissions) falhas.push('formulario foi enviado');
if (popups) falhas.push('abriu janela nova');
if (foraDoSite) falhas.push('tentou sair do site');
if (!frame) falhas.push('nenhum quadro gravado');
let folha = null;
if (frame && !A['sem-folha']) {
  folha = path.join(os.tmpdir(), `gravar-site-folha-${Date.now()}.png`);
  try { execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', SAIDA, '-vf', `fps=${(12 / dur).toFixed(4)},scale=480:-1,tile=4x3`, '-frames:v', '1', folha], { windowsHide: true }); } catch { folha = null; }
}
const tam = fs.existsSync(SAIDA) ? (fs.statSync(SAIDA).size / 1048576).toFixed(1) + ' MB' : 'sem arquivo';
console.log('RESULTADO ' + JSON.stringify({ ok: !falhas.length, saida: SAIDA, duracao_s: +dur.toFixed(1), quadros: frame, tamanho: tam, viewport: `${W}x${H}`, fps: FPS, velocidade_max_px_quadro: +maxVel.toFixed(1), solavanco_max: +maxSolavanco.toFixed(1), bloqueados_whatsapp: bloqueados, formularios_enviados: submissions, janelas_abertas: popups, saidas_do_site: foraDoSite, url_final: urlFinal, folha_de_contato: folha, falhas }));
process.exit(falhas.length ? 1 : 0);
