// Builds C21's page: the model (C20) learns in the page, then any scene is shown as cells in the primitive columns.
'use strict';
const fs = require('fs'), path = require('path');
const strip = (s) => s.replace(/<\/script/g, '<\\/script');
const src = ['world/catalogue.js', 'models/flow.js', 'models/codes.js'].map((f) => `<script>${strip(fs.readFileSync(path.join(__dirname, '../..', f), 'utf8'))}</script>`).join('\n');
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cells as coordinates · C21, sparse codes on primitive columns</title>
<style>
:root{--bg:#f7f6f2;--fg:#1d1d1b;--muted:#6f6e68;--ink:#1d1d1b;--empty:#e6e4dc;--line:#dcdad2;--card:#fff;--on:#d9622b;--obj:#2f8f6b;--ctr:#2b78d9}
@media (prefers-color-scheme:dark){:root{--bg:#151514;--fg:#ecebe6;--muted:#9b9a93;--ink:#ecebe6;--empty:#2b2b28;--line:#34342f;--card:#1d1d1b;--on:#f08a50;--obj:#4cc49a;--ctr:#5ea2f2}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:1180px;margin:0 auto;padding:20px}h1{font-size:20px;margin:0 0 4px}p.sub{color:var(--muted);margin:0 0 14px;max-width:900px}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 14px}button{font:inherit;padding:6px 12px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px;cursor:pointer}button:hover{border-color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:14px}.card h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px;color:var(--muted)}
.row{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}.g{display:grid;gap:1px}.g i{display:block;background:var(--empty);border-radius:1px}
.col{border:1px solid var(--line);border-radius:8px;padding:8px}.cap{color:var(--muted);font-size:12px;margin-top:4px;max-width:220px}
#msg{color:var(--muted)}.k s{display:inline-block;width:10px;height:10px;border-radius:2px;vertical-align:middle;margin:0 4px 0 10px}
</style></head><body><main>
<h1>Cells as coordinates</h1>
<p class="sub">C21. The only columns are the primitives C20 learnt; composites (house, flag, ...) are not columns any more. Each column's cells form a grid of offsets. Floor 0 says where an instance is, measured from the centre of attention (the middle of the scene). The floors above hold assemblies: a composite is one cell per part, at that part's offset from the composite's own centre, so the same thing anywhere gives the same assembly. A composite of composites takes a sample of 3 cells from each child. Scenes are explained with the best (cheapest) explanation, not just the greedy one.</p>
<div class="bar"><button id="b1">Two sticks side by side</button><button id="b2">Two houses side by side</button><button id="b3">A house somewhere</button><button id="b4">A random scene</button><button id="b5">Never-seen object</button><span id="msg">learning…</span></div>
<div class="card"><h2>Scene</h2><div class="row"><div><div id="scene"></div><div class="cap" id="sname"></div></div><div><div id="rebuilt"></div><div class="cap">rebuilt from the floor-0 cells</div></div><div class="cap" id="sum" style="max-width:520px"></div></div></div>
<div class="card"><h2>Floor 0 · where each instance is (one cell per instance)</h2><div class="k" style="margin-bottom:8px"><s style="background:var(--on)"></s>active cell<s style="background:var(--ctr)"></s>centre of attention (0,0)</div><div class="row" id="where"></div></div>
<div class="card"><h2>Assemblies · what each recognised thing is (position-free)</h2><div class="row" id="things"></div></div>
<div class="card"><h2>All assemblies learnt</h2><div class="row" id="all"></div></div>
</main>
${src}
<script>
const $ = (id) => document.getElementById(id), css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const W = new SceneWorld(CATALOGUE), M = new Model('FL', {}); let Cd = null, r = rng(4242);
function vGrid(w, h, px, paint) { const d = document.createElement('div'); d.className = 'g'; d.style.gridTemplateColumns = 'repeat(' + w + ',' + px + 'px)';
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = document.createElement('i'); i.style.width = i.style.height = px + 'px'; paint(x, y, i); d.appendChild(i); } return d; }
const vShape = (pts, px = 6) => { let w = 1, h = 1; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const s = new Set(pts.map(([x, y]) => x + ',' + y)); return vGrid(w, h, px, (x, y, i) => { if (s.has(x + ',' + y)) i.style.background = css('--ink'); }); };
// a column's cell grid (offsets -R..R), with its active cells
function vCells(list, color, R = 7) { const s = new Set(list.map((c) => c.x + ',' + c.y)); return vGrid(2 * R + 1, 2 * R + 1, 7, (x, y, i) => { const k = (x - R) + ',' + (y - R); if (s.has(k)) i.style.background = color; else if (x === R && y === R) i.style.background = css('--ctr'); }); }
function vBox(title, kids, cap) { const d = document.createElement('div'); d.className = 'col'; const t = document.createElement('div'); t.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px'; t.innerHTML = '<b style="font-weight:600">' + title + '</b>'; d.appendChild(t);
  const row = document.createElement('div'); row.className = 'row'; row.style.gap = '8px'; kids.forEach((k) => row.appendChild(k)); d.appendChild(row); if (cap) { const c = document.createElement('div'); c.className = 'cap'; c.textContent = cap; d.appendChild(c); } return d; }
function vByCol(list) { const g = new Map(); for (const c of list) { if (!g.has(c.col)) g.set(c.col, []); g.get(c.col).push(c); } return g; }
function vShow(x, name) {
  const e = Cd.encode(x); $('scene').replaceChildren(vGrid(SW, SH, 13, (a, b, i) => { if (x[b * SW + a]) i.style.background = css('--ink'); }));
  const re = new Set(Cd.draw(e.where).map(([a, b]) => (a + Math.floor((SW - 1) / 2)) + ',' + (b + Math.floor((SH - 1) / 2))));
  $('rebuilt').replaceChildren(vGrid(SW, SH, 13, (a, b, i) => { if (re.has(a + ',' + b)) i.style.background = css('--ink'); })); $('sname').textContent = name;
  const heat = e.q.on ? (e.q.left.length + e.q.misses) / e.q.on : 0;
  $('sum').innerHTML = e.q.on + ' pixels → <b>' + e.where.length + '</b> cells on floor 0 (where) + <b>' + e.things.reduce((a, t) => a + t.code.length, 0) + '</b> assembly cells. Recognised: ' + e.things.map((t) => t.unit.layer > 1 ? 'a composite' : 'a primitive').join(', ') + '. Heat ' + heat.toFixed(2) + '.';
  $('where').replaceChildren(...[...vByCol(e.where)].map(([col, l]) => vBox('', [vShape(col.pts), vCells(l, css('--on'))], l.length + (l.length === 1 ? ' instance' : ' instances') + ' of this primitive: ' + l.map((c) => '(' + c.x + ',' + c.y + ')').join(' '))));
  const things = e.things.filter((t) => t.code.length), seen = new Map();
  $('things').replaceChildren(...(things.length ? things.map((t) => { const k = t.code.map((c) => Cd.key(c)).sort().join(' '); const again = seen.has(k); seen.set(k, 1);
    return vBox('', [vShape(M.exp(t.unit)), ...[...vByCol(t.code)].map(([col, l]) => vBox('', [vShape(col.pts, 4), vCells(l, css('--obj'), 5)]))], t.code.length + ' cells (floor ' + t.code[0].f + ')' + (again ? ' — identical to the one before: same kind of thing' : '')); }) : [Object.assign(document.createElement('div'), { className: 'cap', textContent: 'only primitives here: nothing above floor 0' })]));
}
function vAll() { $('all').replaceChildren(...M.units.filter((u) => u.layer > 1).sort((a, b) => a.layer - b.layer).map((u) => { const c = Cd.code(u); return vBox('', [vShape(M.exp(u)), ...[...vByCol(c)].map(([col, l]) => vBox('', [vShape(col.pts, 4), vCells(l, css('--obj'), 5)]))], 'layer ' + u.layer + ' in C20 · ' + c.length + ' cells on floor ' + c[0].f); })); }
const vPut = (list) => { const x = new Uint8Array(SW * SH); for (const [pts, ox, oy] of list) for (const [a, b] of pts) x[(oy + b) * SW + ox + a] = 1; return x; };
let t = 0; (function vLearn() { for (let k = 0; k < 25 && t < 600; k++) { t++; M.step(W.next(r, 0).x); if (t % 98 === 0) M.rest(); }
  $('msg').textContent = 'learning with C20… ' + t + ' / 600 scenes'; if (t < 600) return setTimeout(vLearn, 0);
  M.rest(); Cd = new Codes(M, {}); $('msg').textContent = 'learnt: ' + M.parts.length + ' primitive columns, ' + (M.units.length - M.parts.length) + ' composites held as assemblies'; vAll(); $('b1').click(); })();
const ready = (f) => () => { if (Cd) f(); };
$('b1').onclick = ready(() => vShow(vPut([[W.shapes.stick, 4, 4], [W.shapes.stick, 6, 4]]), 'two sticks, side by side'));
$('b2').onclick = ready(() => vShow(vPut([[W.objects.house, 1, 3], [W.objects.house, 7, 3]]), 'two houses, side by side'));
$('b3').onclick = ready(() => { const s = W.place(rng(Math.floor(Math.random() * 1e6)), [['house', W.objects.house]]); vShow(s.x, 'a house, at a random place'); });
$('b4').onclick = ready(() => { const s = W.next(rng(Math.floor(Math.random() * 1e6)), 0); vShow(s.x, '"' + s.name + '"'); });
$('b5').onclick = ready(() => { const h = Object.entries(W.heldObjects), p = h[Math.floor(Math.random() * h.length)]; vShow(vPut([[p[1], 3, 3]]), 'never seen: ' + p[0]); });
</script></body></html>`;
fs.writeFileSync(path.join(__dirname, 'viewer.html'), html); console.log('wrote viewer.html', (html.length / 1024).toFixed(1), 'KB');
