// C02 viewer: the model runs live in the page. Left: every column (its learnt field, and its cells underneath). Right: the
// flash, what explained it and what was left over. Both modules are inlined, so the page runs exactly the code the runner ran.
'use strict';
const fs = require('fs'), path = require('path');
const strip = (s) => s.replace(/<\/script/g, '<\\/script');
const cat = strip(fs.readFileSync(path.join(__dirname, '../../world/catalogue.js'), 'utf8'));
// reusable by later sketches: MODEL (file in models/), OUTDIR, TITLE, ARM (default arm) and PRICES ("1,2,4": adds a control)
const MODEL = process.env.MODEL || 'explain.js', OUTDIR = process.env.OUTDIR || __dirname, ARM = process.env.ARM || 'B';
const TITLE = process.env.TITLE || 'Columns learning live · C02 explain and grow', PRICES = process.env.PRICES ? process.env.PRICES.split(',') : null;
const mod = strip(fs.readFileSync(path.join(__dirname, '../../models', MODEL), 'utf8'));
const priceCtl = PRICES ? `<label for="price">Price of structure</label><select id="price">${PRICES.map((p) => `<option value="${p}">${p}</option>`).join('')}</select>` : '';

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${TITLE}</title>
<style>
:root{--bg:#f7f6f2;--fg:#1d1d1b;--muted:#6f6e68;--ink:#1d1d1b;--empty:#e6e4dc;--heat:#d63c2f;--new:#2b78d9;--line:#dcdad2;--card:#fff;--cell:#b9b6aa;--on:#d9622b}
@media (prefers-color-scheme:dark){:root{--bg:#151514;--fg:#ecebe6;--muted:#9b9a93;--ink:#ecebe6;--empty:#2b2b28;--heat:#f0614f;--new:#5ea2f2;--line:#34342f;--card:#1d1d1b;--cell:#55534c;--on:#f08a50}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1280px;margin:0 auto;padding:22px 18px 40px}
h1{font-size:20px;margin:0 0 2px}
.sub{color:var(--muted);margin:0 0 14px;max-width:95ch}
.bar{display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin-bottom:14px}
.bar label{color:var(--muted)}
select,button,input[type=number]{font:inherit;font-size:13px;padding:5px 10px;border-radius:7px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}
button{cursor:pointer}button:hover{border-color:var(--muted)}
input[type=range]{width:110px;accent-color:var(--on)}
input[type=number]{width:62px}
.wrap{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;align-items:start}
@media (max-width:860px){.wrap{grid-template-columns:1fr}}
.panel{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}
.ph{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.ph h2{font-size:13px;margin:0;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:600}
.ph span{font-size:12px;color:var(--muted)}
#cv{display:block;width:100%}
.right{position:sticky;top:10px;display:flex;flex-direction:column;gap:14px}
.trio{display:flex;gap:12px}
.trio>div{flex:1;min-width:0}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:2px}
.g i{display:block;aspect-ratio:1;background:var(--empty);border-radius:2px;position:relative}
.cap{font-size:11.5px;color:var(--muted);margin-top:5px;line-height:1.3}
.name{font-size:15px;font-weight:600;margin-bottom:8px}
.stats{display:grid;grid-template-columns:1fr auto;gap:2px 10px;font-size:13px}
.stats span:nth-child(odd){color:var(--muted)}
.stats b{font-weight:600;font-variant-numeric:tabular-nums}
#spark{width:100%;height:46px;display:block;margin-top:6px}
.key{font-size:12px;color:var(--muted);line-height:1.7}
.key s{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px;text-decoration:none}
#tip{position:fixed;pointer-events:none;background:var(--card);border:1px solid var(--line);border-radius:7px;padding:6px 9px;font-size:12px;display:none;box-shadow:0 4px 14px rgba(0,0,0,.12);z-index:5}
</style></head><body><main>
<h1>${TITLE.replace(' · ', ': ')}</h1>
<p class="sub">Each flash, columns compete to <b>explain</b> it. What nothing explains is heat (red), and heat grows a new column from the leftover. A column that claims while some of its pixels are off loses those pixels. Cells inside a column say which whole that part belongs to. The six bar triples are held out: press <i>Show a held-out pattern</i> to see one met for the first time, with no learning.</p>
<div class="bar">
  <label for="arm">Arm</label><select id="arm"></select>${priceCtl}
  <label for="noise">Noise</label><input type="range" id="noise" min="0" max="20" value="5"><b id="nv">5%</b>
  <label for="speed">Speed</label><input type="range" id="speed" min="1" max="30" value="6"><span id="sv"></span>
  <button id="play">Pause</button><button id="step">Step</button><button id="ff">Skip 500</button><button id="held">Show a held-out pattern</button>
  <label for="seed">Seed</label><input type="number" id="seed" value="1" min="1"><button id="reset">Restart</button>
</div>
<div class="wrap">
  <div class="panel"><div class="ph"><h2>Columns</h2><span id="colhint">field on top · cells underneath · coloured border = explaining this flash</span></div><canvas id="cv"></canvas></div>
  <div class="right">
    <div class="panel">
      <div class="ph"><h2>Input</h2><span id="tno"></span></div>
      <div class="name" id="pname"></div>
      <div class="trio">
        <div><div class="g" id="gin"></div><div class="cap">as flashed</div></div>
        <div><div class="g" id="gex"></div><div class="cap">explained by column colour; red = heat</div></div>
        <div><div class="g" id="grc"></div><div class="cap">what the columns rebuild</div></div>
      </div>
      <div class="key" style="margin-top:8px"><s style="background:var(--heat)"></s>left over (heat) &nbsp; <s style="box-shadow:inset 0 0 0 2px var(--new)"></s>new column / new cell</div>
    </div>
    <div class="panel">
      <div class="ph"><h2>State</h2><span id="restflag"></span></div>
      <div class="stats" id="stats"></div>
      <div class="cap" style="margin-top:8px">heat per flash (share left over), last 300 flashes</div>
      <canvas id="spark"></canvas>
    </div>
  </div>
</div>
<div id="tip"></div>
</main>
<script>${cat}</script>
<script>${mod}</script>
<script>
const PAT = CATALOGUE.patterns, HELD = PAT.filter((p) => p.family === 'bar triples'), TRAIN = PAT.filter((p) => p.family !== 'bar triples');
const PAL = ['#d9622b', '#2f8f6b', '#7b5bd6', '#c8a020', '#c2417d', '#3a8fc4', '#7a8a2a', '#a8572e', '#5c6ad1', '#2a9a9a'];
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const $ = (id) => document.getElementById(id);
for (const k of Object.keys(ARMS)) { const o = document.createElement('option'); o.value = k; o.textContent = ARMS[k].label; $('arm').appendChild(o); }
$('arm').value = '${ARM}';
let M, R, order = [], oi = 0, timer = null, noise = 0.05, speed = 6, last = null, lastHeld = false; const spark = [];
function reset() { const pe = document.getElementById('price'); M = new Model($('arm').value, pe ? { price: +pe.value } : {}); R = rng((+$('seed').value || 1) * 7919 + 13); order = []; oi = 0; spark.length = 0; last = null; next(); }
function nextId() { if (oi >= order.length) { order = TRAIN.map((p) => p.id); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } oi = 0; } return order[oi++]; }
function next(draw = true) { const id = nextId(), x = noisy(PAT[id].bits, noise, R), out = M.step(x);
  let on = 0; for (const v of x) on += v; spark.push(on ? out.left.length / on : 0); if (spark.length > 300) spark.shift();
  last = { id, x, out, held: false }; if (draw) render(); }
function showHeld() { play(false); const p = HELD[Math.floor(Math.random() * HELD.length)], x = p.bits.slice(), q = M.read(x);
  last = { id: p.id, x, out: { ...q, born: null, rested: false }, held: true }; render(); }

// ---- the column canvas
const TW = 46, FS = 7, GAP = 8, CELL = 4, CPR = 9, CROWS = 4;   // tile width, field pixel, gap, cell pitch, cells per row, rows shown
let layout = [];
function drawCols() {
  const cv = $('cv'), W = cv.clientWidth, dpr = window.devicePixelRatio || 1, per = Math.max(1, Math.floor((W + GAP) / (TW + GAP)));
  const TH = 4 + 5 * FS + 6 + CROWS * CELL + 14, rowsN = Math.ceil(M.cols.length / per), H = Math.max(80, rowsN * (TH + GAP));
  cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const ink = css('--ink'), empty = css('--empty'), cellc = css('--cell'), nw = css('--new'), mut = css('--muted'), line = css('--line');
  const claim = new Map(), cellOn = new Map();
  if (last) { last.out.claims.forEach((q, k) => claim.set(q.c, PAL[k % PAL.length])); for (const z of last.out.cells || []) cellOn.set(z.cell, z.fresh); }
  const born = last && last.out.born; layout = [];
  if (!M.cols.length) { g.fillStyle = mut; g.font = '13px system-ui'; g.fillText('No columns yet: the first leftover will grow one.', 4, 20); }
  M.cols.forEach((c, k) => {
    const x0 = (k % per) * (TW + GAP), y0 = Math.floor(k / per) * (TH + GAP), fx = x0 + (TW - 5 * FS) / 2, fy = y0 + 4; layout.push([x0, y0, TW, TH, c]);
    const col = claim.get(c);
    g.strokeStyle = c === born ? nw : col || line; g.lineWidth = c === born || col ? 2 : 1; g.strokeRect(x0 + .5, y0 + .5, TW - 1, TH - 1);
    for (let i = 0; i < 25; i++) { const v = c.m[i], px = fx + (i % 5) * FS, py = fy + Math.floor(i / 5) * FS;
      g.fillStyle = empty; g.fillRect(px, py, FS - 1, FS - 1);
      if (v > 0) { g.globalAlpha = v >= K.CUT ? 1 : 0.25 + 0.5 * v; g.fillStyle = col && v >= K.CUT ? col : ink; g.fillRect(px, py, FS - 1, FS - 1); g.globalAlpha = 1; } }
    const cy = fy + 5 * FS + 5, cs = c.cells, show = Math.min(cs.length, CPR * CROWS - (cs.length > CPR * CROWS ? 1 : 0));
    let shownOn = false;
    for (let j = 0; j < show; j++) { const u = cs[j], px = fx + (j % CPR) * CELL, py = cy + Math.floor(j / CPR) * CELL;
      if (cellOn.has(u)) { g.fillStyle = cellOn.get(u) ? nw : col || ink; shownOn = true; } else g.fillStyle = cellc; g.fillRect(px, py, CELL - 1, CELL - 1); }
    if (cs.length > show) { // the active cell may be beyond the visible ones: show it in the last slot
      const px = fx + (show % CPR) * CELL, py = cy + Math.floor(show / CPR) * CELL; let act = null; for (const u of cs.slice(show)) if (cellOn.has(u)) act = u;
      g.fillStyle = act ? (cellOn.get(act) ? nw : col || ink) : mut; g.fillRect(px, py, CELL - 1, CELL - 1); }
    g.fillStyle = mut; g.font = '10px system-ui'; g.textAlign = 'center'; g.fillText(cs.length + (cs.length === 1 ? ' cell' : ' cells'), x0 + TW / 2, y0 + TH - 4); g.textAlign = 'left';
  });
}
$('cv').addEventListener('mousemove', (e) => { const r = $('cv').getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, t = $('tip');
  const hit = layout.find(([x0, y0, w, h]) => x >= x0 && x < x0 + w && y >= y0 && y < y0 + h);
  if (!hit) { t.style.display = 'none'; return; } const c = hit[4], px = [...c.m].filter((v) => v >= K.CUT).length;
  t.innerHTML = 'column ' + c.id + ' · ' + px + ' pixels<br>claimed ' + c.uses + ' times · ' + c.cells.length + ' cells<br>born at flash ' + c.born + ', last used ' + c.last;
  t.style.display = 'block'; t.style.left = (e.clientX + 14) + 'px'; t.style.top = (e.clientY + 12) + 'px'; });
$('cv').addEventListener('mouseleave', () => { $('tip').style.display = 'none'; });

// ---- the right-hand side
function grid(el, paint) { el.innerHTML = ''; for (let i = 0; i < 25; i++) { const d = document.createElement('i'); paint(i, d); el.appendChild(d); } }
function render() {
  drawCols(); if (!last) return; const { id, x, out } = last, ink = css('--ink'), heat = css('--heat');
  $('pname').textContent = (last.held ? 'held out, first sight: ' : '') + '"' + PAT[id].name + '"';
  $('tno').textContent = last.held ? 'no learning' : 'flash ' + M.t;
  grid($('gin'), (i, d) => { if (x[i]) d.style.background = ink; });
  const owner = new Array(25).fill(-1), miss = new Array(25).fill(-1);
  out.claims.forEach((q, k) => { for (let i = 0; i < 25; i++) if (q.c.m[i] >= K.CUT) { if (x[i] && owner[i] < 0) owner[i] = k; if (!x[i]) miss[i] = k; } });
  const left = new Set(out.left);
  grid($('gex'), (i, d) => { if (left.has(i)) d.style.background = heat; else if (owner[i] >= 0) d.style.background = PAL[owner[i] % PAL.length];
    else if (miss[i] >= 0) d.style.boxShadow = 'inset 0 0 0 2px ' + PAL[miss[i] % PAL.length];
    if (out.born && out.born.m[i] >= K.CUT) d.style.boxShadow = 'inset 0 0 0 2px ' + css('--new'); });
  grid($('grc'), (i, d) => { let on = false; for (const q of out.claims) if (q.c.m[i] >= K.CUT) on = true; if (on) d.style.background = ink; });
  const st = M.st, s = [['columns', M.cols.length], ['cells', M.cellCount()], ['parts in this flash', out.claims.length], ['left over now', out.left.length + ' px'],
    ['wrong now', (out.misses || 0) + ' px'], ['rest pressure', Math.round(100 * M.heat / K.PMAX) + '%']];
  const LBL = { rests: 'rests', grown: 'columns grown', retired: 'retired (unused)', redundant: 'removed (added nothing)', removed: 'removed (didn\\'t pay)', joined: 'joined', recycled: 'taken over' };
  for (const k of Object.keys(LBL)) if (st[k] !== undefined) s.push([LBL[k], st[k]]);
  if (M.tent) s.push(['leftovers waiting to recur', M.tent.length]);
  $('stats').innerHTML = s.map(([a, b]) => '<span>' + a + '</span><b>' + b + '</b>').join('');
  $('restflag').textContent = out.rested ? 'just rested' : '';
  const sc = $('spark'), dpr = window.devicePixelRatio || 1, W = sc.clientWidth, H = 46; sc.width = W * dpr; sc.height = H * dpr; const g = sc.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = heat; const bw = W / 300; spark.forEach((v, k) => { const h = Math.max(v > 0 ? 1 : 0, v * (H - 2)); g.fillRect(k * bw, H - h, Math.max(1, bw - .2), h); });
}
function play(on) { clearInterval(timer); timer = on ? setInterval(() => next(), 1000 / speed) : null; $('play').textContent = on ? 'Pause' : 'Play'; }
$('play').onclick = () => play(!timer);
$('step').onclick = () => { play(false); next(); };
$('ff').onclick = () => { for (let i = 0; i < 499; i++) next(false); next(); };
$('held').onclick = showHeld;
$('reset').onclick = reset; $('arm').onchange = reset; if (document.getElementById('price')) $('price').onchange = reset;
$('noise').oninput = (e) => { noise = e.target.value / 100; $('nv').textContent = e.target.value + '%'; };
const sv = () => { $('sv').textContent = speed + '/s'; }; sv();
$('speed').oninput = (e) => { speed = +e.target.value; sv(); if (timer) play(true); };
window.addEventListener('resize', () => render());
reset(); play(true);
</script></body></html>`;
fs.writeFileSync(path.join(OUTDIR, 'viewer.html'), html);
console.log('wrote viewer.html', (html.length / 1024).toFixed(1) + ' KB');
