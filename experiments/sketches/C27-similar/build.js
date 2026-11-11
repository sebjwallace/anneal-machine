// Builds the C27 page: the truth next to what exact memory (C26) and similar memory (C27) imagine, plus a close-up of
// one object: what it sees, how far it looked, and whether it recognised the situation exactly or recalled a similar one.
'use strict';
const fs = require('fs'), path = require('path');
const strip = (s) => s.replace(/<\/script/g, '<\\/script');
const src = ['world/catalogue.js', 'world/bumpers.js', 'models/clean.js', 'models/codes.js', 'models/reach.js', 'models/similar.js'].map((f) => `<script>${strip(fs.readFileSync(path.join(__dirname, '../..', f), 'utf8'))}</script>`).join('\n');
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Same or similar · C26 and C27</title>
<style>
:root{--bg:#f7f6f2;--fg:#1d1d1b;--muted:#6f6e68;--ink:#1d1d1b;--wall:#9b9a93;--empty:#e6e4dc;--line:#dcdad2;--card:#fff;--obj:#d9622b;--real:#2f8f6b;--bad:#d63c2f;--me:#2b78d9}
@media (prefers-color-scheme:dark){:root{--bg:#151514;--fg:#ecebe6;--muted:#9b9a93;--ink:#ecebe6;--wall:#6f6e68;--empty:#2b2b28;--line:#34342f;--card:#1d1d1b;--obj:#f08a50;--real:#4cc49a;--bad:#f0614f;--me:#5ea2f2}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:1240px;margin:0 auto;padding:20px}h1{font-size:20px;margin:0 0 4px}p.sub{color:var(--muted);margin:0 0 14px;max-width:980px}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px}button,select{font:inherit;padding:6px 10px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px}button{cursor:pointer}button:hover{border-color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:14px}.card h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px;color:var(--muted)}
.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}.g{display:grid;gap:1px}.g i{display:block;background:var(--empty);border-radius:1px}
.cap{color:var(--muted);font-size:12px;margin-top:6px;max-width:300px}.big{font-size:15px;font-weight:600}#msg{color:var(--muted)}
.say{max-width:420px;line-height:1.55}.tag{display:inline-block;padding:1px 8px;border-radius:10px;font-size:12px;border:1px solid var(--line)}
</style></head><body><main>
<h1>Same, or similar?</h1>
<p class="sub">The machine watched two-object demonstrations, as pictures only, in rooms whose walls are bricks. It learnt what happens next to each object from its surroundings, looking further out only when nearer didn't settle it. Then, from the first two pictures of a new start, it imagines the rest with no input. Two ways of using memory: <b>exact</b> (C26) only trusts situations seen exactly like this; <b>similar</b> (C27) trusts exact first, but when a situation is new it recalls the most similar one, where positions that are close count as alike. Objects in <span style="color:var(--bad)">red</span> are not where the truth has them.</p>
<div class="bar"><label>Objects <select id="n">${[2, 3, 4, 5, 6].map((v) => `<option${v === 5 ? ' selected' : ''}>${v}</option>`).join('')}</select></label><button id="fresh">New start</button><button id="play">▶ play</button><button id="one">one step</button>
<label>Speed <select id="speed"><option value="600">slow</option><option value="250" selected>normal</option><option value="90">fast</option></select></label><span id="msg">learning…</span></div>
<div class="card"><div class="row">
<div><div id="gT"></div><div class="cap"><b>What really happens</b></div></div>
<div><div id="gE"></div><div class="cap"><b>Exact memory imagines</b> <span id="sE"></span></div></div>
<div><div id="gS"></div><div class="cap"><b>Similar memory imagines</b> <span id="sS"></span></div></div>
</div><div class="cap" id="stepno" style="max-width:none;margin-top:10px"></div></div>
<div class="card"><h2>Close-up · one object in the similar-memory picture, about to move</h2>
<div class="bar"><label>Object <select id="pick"></select></label><span class="cap" style="margin:0">Picked automatically where the two memories disagree; choose any.</span></div>
<div class="row">
<div><div id="cNow"></div><div class="cap">what it sees: <span style="color:var(--me)">itself</span> (its last place outlined), others, bricks; the box is how far it had to look</div></div>
<div><div id="cMem"></div><div class="cap" id="cMemCap">the remembered situation it is using</div></div>
<div class="say" id="say"></div>
</div></div>
</main>
<script>globalThis.WORLD_SIZE = 24;</script>
${src}
<script>
const $ = (id) => document.getElementById(id), css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim(), GN = 24;
const M = new Model('FL', {}); let Cd = null, Lr = null, sim = [], E = null, S = null, t = 0, timer = null;
function vGrid(w, h, px, paint) { const d = document.createElement('div'); d.className = 'g'; d.style.gridTemplateColumns = 'repeat(' + w + ',' + px + 'px)'; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = document.createElement('i'); i.style.width = i.style.height = px + 'px'; paint(x, y, i); d.appendChild(i); } return d; }
const kindOf = (u) => (u.layer > 1 ? 'square' : u.pts.length === 4 ? 'diamond' : 'brick');
const runSim = (objs, n) => { const out = [objs]; for (let k = 0; k < n; k++) out.push(BUMP.step(out[out.length - 1], GN)); return out; };
const pixels = (u) => Cd.m.exp(u);
// one imagined step with a chosen way of using memory; keeps who came from whom
function stepWith(run, how) { const out = [];
  run.now.forEach((me, i) => { const b = how === 'exact' ? Reach.prototype.predictOne.call(Lr, Lr.context(i, run.now, run.prev)) : Lr.predictOne(Lr.context(i, run.now, run.prev));
    if (!b) { out.push({ ...me, from: i }); return; } if (b.after === 'gone') return;
    const [id, rest] = b.after.split('@'), [dx, dy] = rest.split(',').map(Number), u = Lr.units.get(+id), [cx, cy] = Cd.cen(u), x = me.x + dx, y = me.y + dy, ax = Math.floor((GN - 1) / 2);
    out.push({ u, x, y, px: x - cx + ax, py: y - cy + ax, from: i }); });
  return { prev: out.map((z) => run.now[z.from]), now: out }; }
const truthNext = () => sim[t + 1] || sim[sim.length - 1];
const okList = (run) => { const tr = truthNext(); return run.now.map((p) => kindOf(p.u) === 'brick' || tr.some((o) => o.shape === kindOf(p.u) && o.x === p.px && o.y === p.py)); };
function drawRun(el, run, label) { const ok = okList(run), cols = new Map();
  run.now.forEach((p, k) => { const c = kindOf(p.u) === 'brick' ? css('--wall') : ok[k] ? css('--obj') : css('--bad'); for (const [a, b] of pixels(p.u)) cols.set((p.px + a) + ',' + (p.py + b), c); });
  el.replaceChildren(vGrid(GN, GN, 9, (x, y, i) => { const c = cols.get(x + ',' + y); if (c) i.style.background = c; }));
  const objs = run.now.filter((p) => kindOf(p.u) !== 'brick'), right = objs.filter((p, k) => okList({ now: objs })[k]).length; label.textContent = '· ' + right + ' of ' + truthNext().length + ' right'; }
function draw() { const tp = BUMP.picture(truthNext(), GN), walls = new Set(BUMP.bricks(GN).flatMap(([a, b]) => [a + ',' + b, (a + 1) + ',' + b]));
  $('gT').replaceChildren(vGrid(GN, GN, 9, (x, y, i) => { if (tp[y * GN + x]) i.style.background = walls.has(x + ',' + y) ? css('--wall') : css('--real'); }));
  drawRun($('gE'), E, $('sE')); drawRun($('gS'), S, $('sS')); $('stepno').textContent = 'step ' + t + ' of imagining, from the first two pictures only'; fillPick(); closeUp(); }
// close-up of one object in the similar-memory run
const word = (after, me) => { if (!after) return 'nothing it knows'; if (after === 'gone') return 'disappears'; const [id, rest] = after.split('@'), [dx, dy] = rest.split(',').map(Number), u = Lr.units.get(+id), k = kindOf(u), [cx, cy] = Cd.cen(u), [mx, my] = Cd.cen(me.u);
  const px = dx - cx + mx, py = dy - cy + my, dir = px > 0 ? 'moves right' : px < 0 ? 'moves left' : py > 0 ? 'moves down' : py < 0 ? 'moves up' : 'stays put'; return (k !== kindOf(me.u) ? 'becomes a ' + k + ' and ' : '') + dir; };
function fillPick() { const objs = S.now.map((p, i) => [p, i]).filter(([p]) => kindOf(p.u) !== 'brick'), sel = $('pick'), keep = sel.dataset.user ? +sel.value : null;
  let auto = objs[0] ? objs[0][1] : 0; for (const [p, i] of objs) { const ctx = Lr.context(i, S.now, S.prev), a = Reach.prototype.predictOne.call(Lr, ctx), b = Lr.predictOne(ctx); if ((a && a.after) !== (b && b.after)) { auto = i; break; } }
  sel.innerHTML = objs.map(([p, i], k) => '<option value="' + i + '">' + (k + 1) + ': ' + kindOf(p.u) + '</option>').join(''); sel.value = String(keep !== null && objs.some(([, i]) => i === keep) ? keep : auto); }
function closeUp() { const i = +$('pick').value, me = S.now[i]; if (!me) return; const R = 6, W = 2 * R + 1 + 4, ctx = Lr.context(i, S.now, S.prev), b = Lr.predictOne(ctx), a = Reach.prototype.predictOne.call(Lr, ctx), reach = b ? b.reach : 0, [mx, my] = Cd.cen(me.u), half = Math.floor(W / 2);
  const cols = new Map(), outline = new Set(), put = (u, x, y, c) => { const [cx, cy] = Cd.cen(u); for (const [p, q] of pixels(u)) cols.set((x - cx + p) + ',' + (y - cy + q), c); };
  S.now.forEach((o, j) => put(o.u, o.x - me.x, o.y - me.y, j === i ? css('--me') : kindOf(o.u) === 'brick' ? css('--wall') : css('--ink')));
  if (S.prev[i]) { const pv = S.prev[i], [cx, cy] = Cd.cen(pv.u); for (const [p, q] of pixels(pv.u)) outline.add((pv.x - me.x - cx + p) + ',' + (pv.y - me.y - cy + q)); }
  const box = (x, y) => Math.max(Math.abs(x), Math.abs(y)) === reach + 2;
  $('cNow').replaceChildren(vGrid(W, W, 13, (x, y, el) => { const k = (x - half) + ',' + (y - half), c = cols.get(k); if (c) el.style.background = c; if (outline.has(k)) el.style.boxShadow = 'inset 0 0 0 2px ' + css('--me'); else if (box(x - half, y - half)) el.style.boxShadow = 'inset 0 0 0 1px ' + css('--muted'); }));
  // the remembered situation (from its stored key: what each item was, and where)
  let memNote = '';
  if (b && b.match !== undefined) { const mc = new Map(), mo = new Set();
    for (const id of (b.match === '' ? [] : b.match.split(',').map(Number))) { const nm = Lr.names ? Lr.names[id] : null; if (!nm) continue; const [type, rest] = nm.split(':'), [uid, off] = rest.split('@'), u = Lr.units.get(+uid); if (!u) continue;
      if (type === 'me') { const [cx, cy] = Cd.cen(u); for (const [p, q] of pixels(u)) mc.set((p - cx) + ',' + (q - cy), css('--me')); continue; }
      const [dx, dy] = off.split(',').map(Number), [cx, cy] = Cd.cen(u);
      if (type === 'was') { for (const [p, q] of pixels(u)) mo.add((dx - cx + p) + ',' + (dy - cy + q)); continue; }
      if (type === 'near') for (const [p, q] of pixels(u)) mc.set((dx - cx + p) + ',' + (dy - cy + q), kindOf(u) === 'brick' ? css('--wall') : css('--ink')); }
    $('cMem').replaceChildren(vGrid(W, W, 13, (x, y, el) => { const k = (x - half) + ',' + (y - half), c = mc.get(k); if (c) el.style.background = c; if (mo.has(k)) el.style.boxShadow = 'inset 0 0 0 2px ' + css('--me'); else if (box(x - half, y - half)) el.style.boxShadow = 'inset 0 0 0 1px ' + css('--muted'); }));
    memNote = b.how === 'similar' ? 'the most similar situation it remembers (' + Math.round(100 * b.sim) + '% of cells shared)' : 'the situation it remembers exactly like this'; }
  else $('cMem').replaceChildren(); $('cMemCap').textContent = memNote || 'nothing remembered';
  const outs = b && b.outcomes ? [...b.outcomes].sort((p, q) => q[1] - p[1]).map(([o, n]) => word(o, me) + ' (' + n + '×)').join(', ') : '';
  $('say').innerHTML = '<div class="big">It looked ' + (reach === 0 ? 'only at itself' : 'out to ' + reach + ' cell' + (reach > 1 ? 's' : '')) + '.</div>' +
    '<p>' + (b ? (b.how === 'similar' ? '<span class="tag">new situation</span> Nothing exactly like this was ever seen out there, so it recalled the most similar one.' : '<span class="tag">seen before</span> It has seen exactly this, out to that distance.') : 'It has nothing to go on.') + (outs ? ' What happened then: ' + outs + '.' : '') + '</p>' +
    '<p><b>Similar memory says:</b> ' + word(b && b.after, me) + '<br><b>Exact memory says:</b> ' + word(a && a.after, me) + (a && b && a.after !== b.after ? ' <span class="tag">they disagree</span>' : '') + '</p>';
}
function fresh() { const r = rng(Math.floor(Math.random() * 1e9)); BUMP.cfg.room = { x: 0, y: 0, w: GN, h: GN }; sim = runSim(BUMP.start(r, +$('n').value, GN), 400);
  const p0 = Lr.things(BUMP.picture(sim[0], GN)), p1 = Lr.things(BUMP.picture(sim[1], GN)), pf = Lr.follow(p0, p1), prev = p1.map(() => null); for (const [i, j] of pf) prev[j] = p0[i];
  E = { now: p1, prev }; S = { now: p1, prev: prev.slice() }; t = 0; $('pick').dataset.user = ''; draw(); }
function step() { E = stepWith(E, 'exact'); S = stepWith(S, 'similar'); t++; draw(); }
function play() { if (timer) { clearInterval(timer); timer = null; $('play').textContent = '▶ play'; return; } $('play').textContent = '❚❚ pause'; timer = setInterval(step, +$('speed').value); }
// learning: shapes from simple pictures, then demonstrations in rooms (chunked so the page stays responsive)
const r1 = rng(1), r2 = rng(2); let phase = 0, k = 0; const MEET = 480, ROAM = 120;
(function vLearn() {
  if (phase === 0) { BUMP.cfg.walls = false; for (let j = 0; j < 60 && k < 300; j++) { k++; const n = 1 + Math.floor(r1() * 3), o = BUMP.start(r1, n, GN), l = [], objs = []; for (const q of o) { if (r1() < 1 / 3) l.push([q.x, q.y + 1]); else objs.push(q); } M.step(BUMP.picture(objs, GN, l)); if (k % 98 === 0) M.rest(); }
    $('msg').textContent = 'learning shapes from pictures… ' + k + ' / 300'; if (k < 300) return setTimeout(vLearn, 0); M.rest(); Cd = new Codes(M, {}); Lr = new Similar(Cd); BUMP.cfg.walls = true; phase = 1; k = 0; return setTimeout(vLearn, 0); }
  if (phase === 1) { for (let j = 0; j < 12 && k < MEET + ROAM; j++) { k++; let s = null; if (k <= MEET) { while (!s) { BUMP.cfg.room = BUMP.randomRoom(r2, GN); s = BUMP.meeting(r2, GN); } Lr.learnRun(runSim(s, 12).map((o) => BUMP.picture(o, GN))); }
      else { BUMP.cfg.room = BUMP.randomRoom(r2, GN); Lr.learnRun(runSim(BUMP.start(r2, 2, GN), 30).map((o) => BUMP.picture(o, GN))); } }
    $('msg').textContent = 'watching two-object demonstrations in rooms… ' + k + ' / ' + (MEET + ROAM); if (k < MEET + ROAM) return setTimeout(vLearn, 0);
    $('msg').textContent = 'resting…'; return setTimeout(() => { Lr.rest(); $('msg').textContent = 'ready · shapes learnt: ' + M.units.filter((u) => !u.loose).map((u) => kindOf(u)).join(', ') + ' · ' + (MEET + ROAM) + ' demonstrations, never more than two objects'; fresh(); }, 0); }
})();
$('fresh').onclick = () => { if (Lr) fresh(); }; $('one').onclick = () => { if (Lr) step(); }; $('play').onclick = () => { if (Lr) play(); };
$('speed').onchange = () => { if (timer) { play(); play(); } }; $('n').onchange = () => { if (Lr) fresh(); };
$('pick').onchange = () => { $('pick').dataset.user = '1'; closeUp(); };
</script></body></html>`;
fs.writeFileSync(path.join(__dirname, 'viewer.html'), html); console.log('wrote viewer.html', (html.length / 1024).toFixed(1), 'KB');
