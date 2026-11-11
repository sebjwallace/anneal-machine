// C01 viewer: writes viewer.html, a self-contained page with the catalogue module inlined (one source of truth).
'use strict';
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../../world/catalogue.js'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pattern catalogue · columns track C01</title>
<style>
:root{--bg:#f7f6f2;--fg:#1d1d1b;--muted:#6f6e68;--ink:#1d1d1b;--empty:#e4e2da;--accent:#d9622b;--flip:#2b78d9;--line:#dcdad2;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#151514;--fg:#ecebe6;--muted:#9b9a93;--ink:#ecebe6;--empty:#2b2b28;--accent:#f08a50;--flip:#5ea2f2;--line:#34342f;--card:#1d1d1b}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1120px;margin:0 auto;padding:32px 20px 64px}
h1{font-size:23px;margin:0 0 4px;letter-spacing:-.01em}
.sub{color:var(--muted);margin:0 0 28px;max-width:70ch}
h2{font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:600}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:20px;margin-bottom:22px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:1px}
.g i{display:block;aspect-ratio:1;background:var(--empty);border-radius:1px}
.g i.on{background:var(--ink)}
.g i.sh{background:var(--accent)}
.g i.fl{box-shadow:inset 0 0 0 3px var(--flip)}
.flash{display:flex;gap:28px;flex-wrap:wrap;align-items:flex-start}
.big{width:170px}.big .g{gap:3px}.big .g i{border-radius:3px}
.cap{font-size:13px;color:var(--muted);margin-top:8px}
.cap b{color:var(--fg);font-weight:600}
.controls{display:flex;flex-direction:column;gap:12px;min-width:240px;flex:1}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
button{font:inherit;font-size:14px;padding:6px 14px;border-radius:7px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}
button:hover{border-color:var(--muted)}
input[type=range]{width:160px;accent-color:var(--accent)}
input[type=number]{width:70px;font:inherit;padding:4px 6px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}
.hist{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
.hist .g{width:30px;gap:0}.hist .g i{border-radius:0}
.legend{font-size:13px;color:var(--muted)}
.legend span{display:inline-block;width:11px;height:11px;vertical-align:-1px;margin-right:4px;border-radius:2px}
.fam{display:grid;grid-template-columns:120px 1fr;gap:14px;padding:12px 0;border-top:1px solid var(--line)}
.fam:first-of-type{border-top:0}
.fname{font-size:14px;font-weight:600}.fname small{display:block;color:var(--muted);font-weight:400}
.tiles{display:flex;flex-wrap:wrap;gap:12px}
.tile{width:66px;cursor:pointer;border-radius:6px;padding:4px;transition:opacity .15s}
.tile .g{width:58px}
.tile .nm{font-size:11px;line-height:1.25;color:var(--muted);margin-top:4px;word-break:break-word}
.tile .tag{font-size:10px;font-weight:600;color:var(--accent)}
.tile.sel{outline:2px solid var(--accent)}
.tile.dim{opacity:.28}
#info{min-height:24px;font-size:14px;margin-bottom:6px}
#info b{font-weight:600}
</style></head><body><main>
<h1>Pattern catalogue</h1>
<p class="sub" id="sub"></p>

<section>
<h2>What the machine will see: flashes</h2>
<div class="flash">
  <div class="big"><div class="g" id="clean"></div><div class="cap">the pattern: <b id="cname"></b></div></div>
  <div class="big"><div class="g" id="seen"></div><div class="cap">as flashed, with noise: <b id="flips"></b></div></div>
  <div class="controls">
    <div class="row"><button id="play">Pause</button><button id="step">Next flash</button><span class="cap" id="tcount" style="margin:0"></span></div>
    <div class="row"><label for="noise">Noise</label><input type="range" id="noise" min="0" max="30" step="1" value="5"><b id="nval">5%</b></div>
    <div class="row"><label for="speed">Speed</label><input type="range" id="speed" min="1" max="20" step="1" value="3"><span id="sval" class="cap" style="margin:0"></span></div>
    <div class="row"><label for="seed">Seed</label><input type="number" id="seed" value="1" min="1"><button id="reseed">Restart</button></div>
    <div class="legend"><span style="background:var(--ink)"></span>on &nbsp; <span style="box-shadow:inset 0 0 0 2px var(--flip)"></span>flipped by noise</div>
    <div><div class="cap" style="margin:0">recent flashes</div><div class="hist" id="hist"></div></div>
  </div>
</div>
</section>

<section>
<h2>The catalogue</h2>
<div id="info">Click any pattern to see what it shares with the others.</div>
<div id="fams"></div>
</section>
</main>
<script>
${src.replace(/<\/script/g, '<\\/script')}
</script>
<script>
const P = CATALOGUE.patterns;
const fams = [...new Set(P.map((p) => p.family))];
document.getElementById('sub').textContent = P.length + ' designed 5×5 patterns in ' + fams.length +
  ' families, built from shared parts (bars, corners, boxes, blocks) on purpose. No learning yet: this is only the input. ' +
  'The families are never shown to the machine; they are here for us and for scoring.';

function grid(el, bits, cls) { el.innerHTML = ''; for (let k = 0; k < SIZE; k++) { const i = document.createElement('i');
  if (bits[k]) i.className = 'on'; if (cls) cls(k, i); el.appendChild(i); } return el; }
const mk = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

// ---- flashes
let gen, timer = null, t = 0, noisePct = 5, speed = 3; const hist = [];
const noiseFn = () => noisePct / 100;
function restart() { gen = stream(P, { seed: +document.getElementById('seed').value || 1, noise: noiseFn }); t = 0; hist.length = 0; flash(); }
function flash() {
  const f = gen.next().value, p = P[f.id]; let n = 0;
  grid(document.getElementById('clean'), f.clean);
  grid(document.getElementById('seen'), f.bits, (k, i) => { if (f.bits[k] !== f.clean[k]) { i.classList.add('fl'); n++; } });
  document.getElementById('cname').textContent = '"' + p.name + '"';
  document.getElementById('flips').textContent = n + (n === 1 ? ' cell flipped' : ' cells flipped');
  document.getElementById('tcount').textContent = 'flash ' + (f.t + 1);
  hist.unshift(f.bits); if (hist.length > 24) hist.pop();
  const h = document.getElementById('hist'); h.innerHTML = ''; for (const b of hist) h.appendChild(grid(mk('div', 'g'), b));
}
function play(on) { clearInterval(timer); timer = on ? setInterval(flash, 1000 / speed) : null; document.getElementById('play').textContent = on ? 'Pause' : 'Play'; }
document.getElementById('play').onclick = () => play(!timer);
document.getElementById('step').onclick = () => { play(false); flash(); };
document.getElementById('reseed').onclick = restart;
document.getElementById('noise').oninput = (e) => { noisePct = +e.target.value; document.getElementById('nval').textContent = noisePct + '%'; };
const sv = () => document.getElementById('sval').textContent = speed + ' per second';
document.getElementById('speed').oninput = (e) => { speed = +e.target.value; sv(); if (timer) play(true); };
sv(); restart(); play(true);

// ---- catalogue, with sharing on click
const tiles = [];
const root = document.getElementById('fams');
for (const f of fams) {
  const ps = P.filter((p) => p.family === f), row = mk('div', 'fam'), nm = mk('div', 'fname'), ts = mk('div', 'tiles');
  nm.innerHTML = f + '<small>' + ps.length + '</small>'; row.append(nm, ts); root.appendChild(row);
  for (const p of ps) { const tl = mk('div', 'tile'), g = mk('div', 'g'), lab = mk('div', 'nm'), tag = mk('div', 'tag');
    lab.textContent = p.name; tl.append(g, lab, tag); ts.appendChild(tl); tl.onclick = () => select(sel === p.id ? null : p.id);
    tiles[p.id] = { tl, g, tag }; }
}
const shared = (a, b) => { let s = 0; for (let k = 0; k < SIZE; k++) s += a[k] & b[k]; return s; };
const within = (a, b) => { for (let k = 0; k < SIZE; k++) if (a[k] && !b[k]) return false; return true; };
let sel = null;
function select(id) {
  sel = id; const info = document.getElementById('info');
  let partOf = 0, holds = 0, near = 0;
  for (const p of P) { const T = tiles[p.id];
    if (id === null) { grid(T.g, p.bits); T.tl.className = 'tile'; T.tag.textContent = ''; continue; }
    const s = P[id].bits, n = shared(s, p.bits), me = p.id === id;
    grid(T.g, p.bits, (k, i) => { if (!me && s[k] && p.bits[k]) i.className = 'sh'; });
    T.tl.className = 'tile' + (me ? ' sel' : n === 0 ? ' dim' : '');
    T.tag.textContent = '';
    if (!me) { if (within(s, p.bits)) { T.tag.textContent = 'contains it'; partOf++; } else if (within(p.bits, s)) { T.tag.textContent = 'part of it'; holds++; }
      if (n >= 3) near++; }
  }
  info.innerHTML = id === null ? 'Click any pattern to see what it shares with the others.' :
    '<b>"' + P[id].name + '"</b>: a whole part of ' + partOf + ' other patterns · contains ' + holds +
    ' others · shares 3 or more cells with ' + near + '. Shared cells are shown in orange; faded patterns share nothing. Click again to clear.';
}
select(null);
</script></body></html>`;

fs.writeFileSync(path.join(__dirname, 'viewer.html'), html);
console.log('wrote', path.join(__dirname, 'viewer.html'), (html.length / 1024).toFixed(1) + ' KB');
