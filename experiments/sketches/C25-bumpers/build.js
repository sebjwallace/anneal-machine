// Builds C25's page: the machine learns shapes and rules from pictures, then imagines objects running, next to the truth.
'use strict';
const fs = require('fs'), path = require('path');
const strip = (s) => s.replace(/<\/script/g, '<\\/script');
const src = ['world/catalogue.js', 'world/bumpers.js', 'models/flow.js', 'models/codes.js', 'models/rules.js'].map((f) => `<script>${strip(fs.readFileSync(path.join(__dirname, '../..', f), 'utf8'))}</script>`).join('\n');
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Imagining squares and diamonds · C25</title>
<style>
:root{--bg:#f7f6f2;--fg:#1d1d1b;--muted:#6f6e68;--ink:#1d1d1b;--empty:#e6e4dc;--line:#dcdad2;--card:#fff;--img:#d9622b;--real:#2f8f6b;--bad:#d63c2f}
@media (prefers-color-scheme:dark){:root{--bg:#151514;--fg:#ecebe6;--muted:#9b9a93;--ink:#ecebe6;--empty:#2b2b28;--line:#34342f;--card:#1d1d1b;--img:#f08a50;--real:#4cc49a;--bad:#f0614f}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:1180px;margin:0 auto;padding:20px}h1{font-size:20px;margin:0 0 4px}p.sub{color:var(--muted);margin:0 0 14px;max-width:940px}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px}button,select{font:inherit;padding:6px 10px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px}button{cursor:pointer}button:hover{border-color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:14px}.card h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px;color:var(--muted)}
.row{display:flex;flex-wrap:wrap;gap:22px;align-items:flex-start}.g{display:grid;gap:1px}.g i{display:block;background:var(--empty);border-radius:1px}
.cap{color:var(--muted);font-size:12px;margin-top:6px}.big{font-size:20px;font-weight:600}#msg{color:var(--muted)}
ul{margin:6px 0 0 18px;padding:0;color:var(--muted)}
</style></head><body><main>
<h1>Imagining squares and diamonds</h1>
<p class="sub">C25. The machine only ever sees pictures. First it learns the two shapes. Then it watches two-object demonstrations (every side, off-centre, moving or still) and, at rest, keeps as rules what the surroundings of each identical change share. Then it is given the first two pictures of a new start with several objects and <b>imagines</b> the rest on its own, with no input, drawing each step back onto the grid. Next to it, what really happens. The true rules: everything moves one cell a step; at a wall it turns round; when two come within one cell they both turn round, and the one hit from below flips (square ↔ diamond), the one hit from above becomes a square.</p>
<div class="bar"><label>Objects <select id="n">${[2, 3, 4, 5, 6, 8].map((v) => `<option${v === 5 ? ' selected' : ''}>${v}</option>`).join('')}</select></label><button id="fresh">New start</button><button id="play">▶ play</button><button id="one">one step</button>
<label>Speed <select id="speed"><option value="500">slow</option><option value="220" selected>normal</option><option value="80">fast</option></select></label><span id="msg">learning…</span></div>
<div class="card"><div class="row">
<div><div id="imag"></div><div class="cap">imagined (no input after the first two pictures)</div></div>
<div><div id="real"></div><div class="cap">what really happens</div></div>
<div style="max-width:300px"><div class="big" id="stepno">step 0</div><div id="match" style="margin-top:6px"></div><div id="first" class="cap"></div>
<div class="cap" style="margin-top:14px">In "imagined", an object drawn in <span style="color:var(--bad)">red</span> is not where the truth has it.</div><div id="info" class="cap" style="margin-top:14px"></div></div>
</div></div>
<div class="card"><h2>What it learnt</h2><div id="learnt" class="cap"></div></div>
</main>
<script>globalThis.WORLD_SIZE = 24;</script>
${src}
<script>
const $ = (id) => document.getElementById(id), css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim(), GN = 24;
const M = new Model('FL', {}); let Cd = null, Lr = null, sim = [], now = null, prev = null, t = 0, timer = null, firstWrong = null;
function vGrid(paint) { const d = document.createElement('div'); d.className = 'g'; d.style.gridTemplateColumns = 'repeat(' + GN + ',11px)'; for (let y = 0; y < GN; y++) for (let x = 0; x < GN; x++) { const i = document.createElement('i'); i.style.width = i.style.height = '11px'; paint(x, y, i); d.appendChild(i); } return d; }
const shapeOf = (u) => (u.pts.some(([x]) => x === 2) ? 'diamond' : 'square');
const runSim = (objs, n) => { const out = [objs]; for (let k = 0; k < n; k++) out.push(BUMP.step(out[out.length - 1], GN)); return out; };
function draw() {
  const truth = sim[t + 1] || sim[sim.length - 1], ok = now.map((p) => truth.some((o) => o.shape === shapeOf(p.u) && o.x === p.px && o.y === p.py));
  const im = new Map(); now.forEach((p, k) => { for (const [a, b] of p.u.pts) im.set((p.px + a) + ',' + (p.py + b), ok[k] ? css('--img') : css('--bad')); });
  const rp = BUMP.picture(truth, GN);
  $('imag').replaceChildren(vGrid((x, y, i) => { const c = im.get(x + ',' + y); if (c) i.style.background = c; }));
  $('real').replaceChildren(vGrid((x, y, i) => { if (rp[y * GN + x]) i.style.background = css('--real'); }));
  const right = ok.filter(Boolean).length; if (firstWrong === null && (right < truth.length || now.length !== truth.length)) firstWrong = t;
  $('stepno').textContent = 'step ' + t; $('match').textContent = right + ' of ' + truth.length + ' objects where the truth has them';
  $('first').textContent = firstWrong === null ? 'no difference from the truth yet' : 'first difference at step ' + firstWrong;
}
function fresh() { const r = rng(Math.floor(Math.random() * 1e9)); sim = runSim(BUMP.start(r, +$('n').value, GN), 400);
  const p0 = Lr.things(BUMP.picture(sim[0], GN)), p1 = Lr.things(BUMP.picture(sim[1], GN)), pf = Lr.follow(p0, p1); prev = p1.map(() => null); for (const [i, j] of pf) prev[j] = p0[i]; now = p1; t = 0; firstWrong = null; draw(); }
function step() { const nx = Lr.step(now, prev); prev = now; now = nx; t++; draw(); }
function play() { if (timer) { clearInterval(timer); timer = null; $('play').textContent = '▶ play'; return; } $('play').textContent = '❚❚ pause'; timer = setInterval(step, +$('speed').value); }
// learning, in chunks so the page stays responsive
const r1 = rng(1), r2 = rng(2); let phase = 0, k = 0;
(function vLearn() {
  if (phase === 0) { for (let j = 0; j < 30 && k < 300; j++) { k++; M.step(BUMP.picture(BUMP.start(r1, 1 + Math.floor(r1() * 3), GN), GN)); if (k % 98 === 0) M.rest(); }
    $('msg').textContent = 'learning the shapes from pictures… ' + k + ' / 300'; if (k < 300) return setTimeout(vLearn, 0); M.rest(); Cd = new Codes(M, {}); Lr = new Rules(Cd, { R: 5, wall: 2 }); phase = 1; k = 0; return setTimeout(vLearn, 0); }
  if (phase === 1) { for (let j = 0; j < 40 && k < 1875; j++) { k++; if (k <= 1500) { let s = null; while (!s) s = BUMP.meeting(r2, GN); Lr.learnRun(runSim(s, 12).map((o) => BUMP.picture(o, GN))); } else Lr.learnRun(runSim(BUMP.start(r2, 2, GN), 30).map((o) => BUMP.picture(o, GN))); }
    $('msg').textContent = 'watching two-object demonstrations… ' + k + ' / 1875'; if (k < 1875) return setTimeout(vLearn, 0);
    const n = Lr.rest(); $('msg').textContent = 'ready'; $('info').textContent = 'Learnt from ' + k + ' two-object demonstrations; it has never seen more than two objects at once.';
    $('learnt').innerHTML = 'Shapes: ' + M.units.length + ' units, learnt from pictures (' + M.units.map((u) => shapeOf(u)).join(' and ') + '). ' + Lr.obs.size + ' different situations seen; ' + n + ' rules kept after rest.' +
      '<ul><li>For each object, at each step: where it was a moment ago, what it is now, anything within 5 cells (now and a moment ago), and any wall within 2 cells.</li><li>At rest: situations that led to exactly the same change are compared; what they share becomes a rule (anything that didn\\'t matter drops out).</li><li>To predict: the rule that fits and has never been wrong, with the most detail; otherwise the least wrong.</li></ul>';
    fresh(); }
})();
$('fresh').onclick = () => { if (Lr) fresh(); }; $('one').onclick = () => { if (Lr) step(); }; $('play').onclick = () => { if (Lr) play(); };
$('speed').onchange = () => { if (timer) { play(); play(); } }; $('n').onchange = () => { if (Lr) fresh(); };
</script></body></html>`;
fs.writeFileSync(path.join(__dirname, 'viewer.html'), html); console.log('wrote viewer.html', (html.length / 1024).toFixed(1), 'KB');
