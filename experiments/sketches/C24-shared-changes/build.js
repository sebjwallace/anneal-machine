// Builds the C23 + C24 page: step through a world of changes, see the predicted next state against the real one.
'use strict';
const fs = require('fs'), path = require('path');
const strip = (s) => s.replace(/<\/script/g, '<\\/script');
const src = ['world/catalogue.js', 'models/flow.js', 'models/codes.js', 'models/transitions.js', 'models/shared.js'].map((f) => `<script>${strip(fs.readFileSync(path.join(__dirname, '../..', f), 'utf8'))}</script>`).join('\n');
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>States and transitions · C23 and C24</title>
<style>
:root{--bg:#f7f6f2;--fg:#1d1d1b;--muted:#6f6e68;--ink:#1d1d1b;--empty:#e6e4dc;--line:#dcdad2;--card:#fff;--pred:#d9622b;--real:#2f8f6b;--bad:#d63c2f;--ctr:#2b78d9}
@media (prefers-color-scheme:dark){:root{--bg:#151514;--fg:#ecebe6;--muted:#9b9a93;--ink:#ecebe6;--empty:#2b2b28;--line:#34342f;--card:#1d1d1b;--pred:#f08a50;--real:#4cc49a;--bad:#f0614f;--ctr:#5ea2f2}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:1180px;margin:0 auto;padding:20px}h1{font-size:20px;margin:0 0 4px}p.sub{color:var(--muted);margin:0 0 14px;max-width:920px}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px}button,select{font:inherit;padding:6px 10px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px}button{cursor:pointer}button:hover{border-color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:14px}.card h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px;color:var(--muted)}
.row{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start}.g{display:grid;gap:1px}.g i{display:block;background:var(--empty);border-radius:1px}
.cap{color:var(--muted);font-size:12px;margin-top:4px;max-width:240px}.big{font-size:22px;font-weight:600}.ok{color:var(--real)}.no{color:var(--bad)}
.col{border:1px solid var(--line);border-radius:8px;padding:8px}#msg{color:var(--muted)}
</style></head><body><main>
<h1>States and transitions</h1>
<p class="sub">C23 and C24. A state is a settled scene, held as its "where" cells (one cell per thing, in that thing's column, at its offset from the middle). A transition links a state to the state that settles next. <b>C23, exact memory</b>: each cell that changed is linked to the cell it became; it only knows the exact places it has seen. <b>C24, shared changes</b>: at rest, transitions are compared at every shift, as parts are; when the whole change of one lines up with the whole change of another, what they share (the change, plus what stayed put around it) is kept without its position, so it can happen anywhere. The exact memory is used when it knows the step; shared changes otherwise. A cue is one cell of the next state; a context is held from elsewhere.</p>
<div class="bar"><label>World <select id="world"></select></label><label>Memory <select id="mode"><option value="shared">C24, shared changes</option><option value="exact">C23, exact memory</option></select></label>
<label>Test in <select id="place"><option value="new">a place never seen</option><option value="trained">the trained place</option></select></label><label><input type="checkbox" id="cue"> give a cue</label>
<button id="go">Train and test</button><span id="msg">learning shapes…</span></div>
<div class="card"><h2>Step</h2><div class="bar"><button id="prev">◀ previous</button><button id="next">next ▶</button><span id="stepno" style="color:var(--muted)"></span><span id="score" style="margin-left:auto"></span></div>
<div class="row"><div><div id="now"></div><div class="cap" id="nowcap">now</div></div><div><div id="pred"></div><div class="cap">predicted next</div></div><div><div id="real"></div><div class="cap">what really came next</div></div><div><div class="big" id="verdict"></div><div class="cap" id="why" style="max-width:320px"></div></div></div></div>
<div class="card"><h2>Cells · columns that changed (● now, <span style="color:var(--pred)">●</span> predicted, <span style="color:var(--real)">○</span> real next)</h2><div class="row" id="cells"></div></div>
<div class="card"><h2>What the memory holds</h2><div class="row" id="held"></div></div>
</main>
${src}
<script>
const $ = (id) => document.getElementById(id), css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const Wd = new SceneWorld(CATALOGUE), M = new Model('FL', {}), S = Wd.shapes; let Cd = null, mem = null, runs = [], at = 0, tally = [0, 0], st = null;
const vScene = (list) => { const x = new Uint8Array(SW * SH); for (const [pts, ox, oy] of list) for (const [a, b] of pts) { const p = ox + a, q = oy + b; if (p >= 0 && q >= 0 && p < SW && q < SH) x[q * SW + p] = 1; } return x; };
const roof = ([px, py]) => (e) => { const out = []; let d = 0; for (let k = 0; k < 16; k++) { out.push([vScene([[S.chevron, px + d, py], [S.box, px + 1, py + 2]]), null]); d = d === 0 ? (e() < 0.5 ? -1 : 1) : 0; } return out; };
const move = (y) => () => Array.from({ length: 11 }, (_, x) => [vScene([[S.stick, x, y]]), null]);
const two = (y) => () => Array.from({ length: 8 }, (_, x) => [vScene([[S.stick, x, y], [S.stick, x + 4, y]]), null]);
const still = (y, sx, sy) => () => Array.from({ length: 11 }, (_, x) => [vScene([[S.stick, x, y], [S.stick, sx, sy]]), null]);
const bounce = (y, ctx) => (e) => { const out = []; let x = Math.floor(e() * 11), d = 1; for (let k = 0; k < 30; k++) { out.push([vScene([[S.stick, x, y]]), ctx ? (d > 0 ? 'right' : 'left') : null]); if (x + d < 0 || x + d > 10) d = -d; x += d; } return out; };
const WORLDS = [
  ['roof slides left or right and back', [[roof([1, 1]), 15], [roof([6, 5]), 15]], roof([2, 6])],
  ['one stick moving right', [[move(1), 1]], move(7)],
  ['two sticks moving together', [[two(2), 1]], two(6)],
  ['one moving, one staying', [[still(1, 8, 7), 1]], still(5, 2, 9)],
  ['bouncing stick, no context', [[bounce(4, false), 4]], bounce(8, false)],
  ['bouncing stick, direction held as context', [[bounce(4, true), 4]], bounce(8, true)],
  ['bouncing stick, context, trained on 2 rows', [[bounce(1, true), 4], [bounce(4, true), 4]], bounce(8, true)],
];
$('world').innerHTML = WORLDS.map((w, i) => '<option value="' + i + '">' + w[0] + '</option>').join('');
const key = (c) => c.col.id + '|' + c.x + ',' + c.y, isCtx = (c) => String(c.col.id).startsWith('ctx:'), sc = (L) => L.filter((c) => !isCtx(c));
const same = (P, T) => { const a = sc(P), b = sc(T); return a.length === b.length && a.every((c) => b.some((d) => key(d) === key(c))); };
function vGrid(w, h, px, paint) { const d = document.createElement('div'); d.className = 'g'; d.style.gridTemplateColumns = 'repeat(' + w + ',' + px + 'px)'; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = document.createElement('i'); i.style.width = i.style.height = px + 'px'; paint(x, y, i); d.appendChild(i); } return d; }
const AX = Math.floor((SW - 1) / 2), AY = Math.floor((SH - 1) / 2);
function vPic(cells, color) { const on = new Set(); for (const [x, y] of Cd.draw(sc(cells))) on.add((x + AX) + ',' + (y + AY)); return vGrid(SW, SH, 11, (a, b, i) => { if (on.has(a + ',' + b)) i.style.background = color || css('--ink'); }); }
function vShape(pts, px = 4) { let w = 1, h = 1; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const s = new Set(pts.map(([x, y]) => x + ',' + y)); return vGrid(w, h, px, (x, y, i) => { if (s.has(x + ',' + y)) i.style.background = css('--ink'); }); }
const ctxOf = (L) => L.filter(isCtx).map((c) => String(c.col.id).slice(4)).join(', ');
function train() {
  const [, trains, test] = WORLDS[+$('world').value], e = rng(1); runs = [];
  mem = $('mode').value === 'shared' ? new Shared(Cd) : new Transitions(Cd, 'changes'); const tr = [];
  for (const [gen, n] of trains) for (let k = 0; k < n; k++) tr.push(gen(e).map(([x, ctx]) => ({ x, ctx })));
  for (const run of tr) for (let k = 0; k + 1 < run.length; k++) mem.learn(stOf(run[k]), stOf(run[k + 1]));
  const n = mem.rest ? mem.rest() : null;
  runs = $('place').value === 'new' ? Array.from({ length: 2 }, () => test(e).map(([x, ctx]) => ({ x, ctx }))) : tr.slice(0, 2);
  st = runs.flatMap((run) => run.slice(0, -1).map((s, k) => [s, run[k + 1]])); at = 0; tally = [0, 0];
  $('msg').textContent = 'trained on ' + tr.length + ' run(s)' + (n !== null ? '; ' + n + ' shared change' + (n === 1 ? '' : 's') + ' found at rest' : '') + '. Testing in ' + ($('place').value === 'new' ? 'a place never seen' : 'the trained place') + '.';
  held(); show();
}
let ENC = null; const stOf = (s) => s.cells || (s.cells = (ENC || (ENC = new Transitions(Cd, 'changes'))).state(s.x, s.ctx));
function show() { if (!st || !st.length) return; const [a, b] = st[at], A = stOf(a), B = stOf(b), ka = new Set(A.map(key)), cue = $('cue').checked ? sc(B).filter((c) => !ka.has(key(c))).slice(0, 1) : [];
  const P = mem.predict(A, cue), ok = same(P, B);
  $('now').replaceChildren(vPic(A)); $('pred').replaceChildren(vPic(P, css('--pred'))); $('real').replaceChildren(vPic(B, css('--real')));
  $('nowcap').textContent = 'now' + (ctxOf(A) ? ' · context: ' + ctxOf(A) : ''); $('stepno').textContent = 'step ' + (at + 1) + ' of ' + st.length;
  $('verdict').textContent = ok ? '✓ right' : '✗ wrong'; $('verdict').className = 'big ' + (ok ? 'ok' : 'no');
  $('why').textContent = cue.length ? 'cue given: one cell of the real next state' : 'no cue';
  if (!tally.seen) tally.seen = new Set(); if (!tally.seen.has(at)) { tally.seen.add(at); tally[0]++; if (ok) tally[1]++; } $('score').textContent = 'right so far: ' + tally[1] + ' of ' + tally[0];
  const cols = new Map(); for (const c of [...sc(A), ...sc(P), ...sc(B)]) cols.set(c.col.id, c.col); const kp = new Set(sc(P).map(key)), kb = new Set(sc(B).map(key));
  $('cells').replaceChildren(...[...cols.values()].filter((col) => [...sc(A), ...sc(B), ...sc(P)].some((c) => c.col === col && !(ka.has(key(c)) && kp.has(key(c)) && kb.has(key(c))))).map((col) => { const R = 7, d = document.createElement('div'); d.className = 'col';
    d.appendChild(vShape(col.pts)); d.appendChild(vGrid(2 * R + 1, 2 * R + 1, 9, (x, y, i) => { const k = col.id + '|' + (x - R) + ',' + (y - R);
      if (ka.has(k)) i.style.background = css('--ink'); if (kp.has(k)) i.style.background = css('--pred'); if (kb.has(k)) i.style.boxShadow = 'inset 0 0 0 2px ' + css('--real'); if (x === R && y === R && !ka.has(k) && !kp.has(k)) i.style.background = css('--ctr'); })); return d; }));
}
function held() { const box = $('held'); box.replaceChildren();
  if (mem.shared) { if (!mem.shared.size) { box.textContent = 'no shared changes'; return; }
    for (const s of mem.shared.values()) { const d = document.createElement('div'); d.className = 'col'; const r = document.createElement('div'); r.className = 'row'; r.style.gap = '8px';
      const mini = (L, color) => { const on = new Set(); let mx = 0, my = 0; const pts = Cd.draw(sc(L)); for (const [x, y] of pts) { mx = Math.min(mx, x); my = Math.min(my, y); } return vShape(pts.map(([x, y]) => [x - mx + 1, y - my + 1]), 5); };
      r.appendChild(mini(s.bef)); r.appendChild(Object.assign(document.createElement('div'), { textContent: '→', style: 'align-self:center' })); r.appendChild(mini(s.aft)); d.appendChild(r);
      d.appendChild(Object.assign(document.createElement('div'), { className: 'cap', textContent: 'seen ' + s.n + '×' + (ctxOf(s.bef) ? ' · context ' + ctxOf(s.bef) : '') + ' · anywhere' })); box.appendChild(d); } }
  else box.textContent = mem.links.size + ' exact links (cell → cell), each tied to the place it was seen.'; }
let t = 0, rr = rng(4242); (function vLearn() { for (let k = 0; k < 25 && t < 600; k++) { t++; M.step(Wd.next(rr, 0).x); if (t % 98 === 0) M.rest(); }
  $('msg').textContent = 'learning shapes with C20… ' + t + ' / 600'; if (t < 600) return setTimeout(vLearn, 0); M.rest(); Cd = new Codes(M, {}); train(); })();
$('go').onclick = () => { if (Cd) train(); }; $('next').onclick = () => { if (st) { at = Math.min(st.length - 1, at + 1); show(); } }; $('prev').onclick = () => { if (st) { at = Math.max(0, at - 1); show(); } };
$('cue').onchange = () => { if (st) { tally = [0, 0]; show(); } };
for (const id of ['world', 'mode', 'place']) $(id).onchange = () => { if (Cd) train(); };
</script></body></html>`;
fs.writeFileSync(path.join(__dirname, 'viewer.html'), html); console.log('wrote viewer.html', (html.length / 1024).toFixed(1), 'KB');
