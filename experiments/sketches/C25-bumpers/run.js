// C25: squares and diamonds that move and bump. The machine watches two-object demonstrations (pictures only), learns the
// rules at rest, then (1) predicts the next step, (2) imagines many objects running on their own, compared with the truth.
'use strict';
globalThis.WORLD_SIZE = +(process.env.SIZE || 16);
const path = require('path');
const { rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const B = require(path.join(__dirname, '../../world/bumpers.js'));
const { Model } = require(path.join(__dirname, '../../models/flow.js'));
const { Codes } = require(path.join(__dirname, '../../models/codes.js'));
const { Rules } = require(path.join(__dirname, '../../models/rules.js'));
const WALLS = !!+(process.env.WALLS || 0); B.cfg.walls = WALLS;
const N = globalThis.WORLD_SIZE, DEMOS = +(process.env.DEMOS || 600), t0 = Date.now();
// 1. shapes, from pictures
const r = rng(1), m = new Model('FL', {}); // with walls, the pictures also hold a few loose bricks, so the brick is seen as a thing of its own (as squares and diamonds are)
const loose = (r) => (WALLS ? Array.from({ length: 1 + Math.floor(r() * 3) }, () => [3 + Math.floor(r() * (N - 8)), 2 + Math.floor(r() * (N - 5))]) : []);
for (let t = 1; t <= 300; t++) { const o = B.start(r, Math.floor(r() * 3), N), l = loose(r).filter(([a, b]) => !o.some((q) => a >= q.x - 2 && a <= q.x + 3 && b >= q.y - 1 && b <= q.y + 3)); m.step(B.picture(o, N, l)); if (t % 98 === 0) m.rest(); } m.rest();
const C = new Codes(m, {}), L = new Rules(C, WALLS ? { R: +(process.env.R || 5), wall: 0, needWas: false } : { R: +(process.env.R || 5), wall: +(process.env.WALL || 2) });
// 2. demonstrations: two objects set up to meet (every side, shapes, still or moving target), plus two objects roaming (walls)
const runSim = (objs, n) => { const out = [objs]; for (let k = 0; k < n; k++) out.push(B.step(out[out.length - 1], N)); return out; };
const e = rng(2); let shown = 0;
for (let k = 0; k < DEMOS; k++) { let s = null; while (!s) s = B.meeting(e, N); L.learnRun(runSim(s, 12).map((o) => B.picture(o, N))); shown++; }
for (let k = 0; k < DEMOS / 4; k++) { L.learnRun(runSim(B.start(e, 2, N), 30).map((o) => B.picture(o, N))); shown++; }
const nr = L.rest();
console.log(`C25${WALLS ? 'b, walls drawn as bricks (no wall context, no filter)' : ''} · units learnt from pictures: ${m.units.map((u) => 'L' + u.layer + ':' + m.exp(u).length + 'px').join(', ')} (${m.units.length} units). ${shown} two-object demonstrations; ${L.obs.size} distinct observations; ${nr} rules after rest; ${((Date.now() - t0) / 1000).toFixed(1)} s\n`);
const shapeOf = (u) => (u.pts.length !== 4 ? 'other' : u.pts.some(([x, y]) => x === 2) ? 'diamond' : 'square');
const objsOf = (L2) => L2.filter((p) => shapeOf(p.u) !== 'other');
const match = (pred, objs) => objs.map((o) => pred.some((p) => shapeOf(p.u) === o.shape && p.px === o.x && p.py === o.y));
// what happened to each object in a true step: 'move', 'wall', 'bump'
const kind = (a, b) => (b.dx === a.dx && b.dy === a.dy ? 'move' : Math.abs(b.x - a.x) + Math.abs(b.y - a.y) === 1 && b.shape === a.shape && !B.DIRS.some(() => false) ? 'turn' : 'turn');
// 3. one step ahead, from true pictures
function onestep(label, gen, n, steps) { const f = rng(3), tally = {}; let scenes = 0, sceneOk = 0;
  for (let k = 0; k < n; k++) { const run = gen(f); if (!run) continue; const S = runSim(run, steps), T = S.map((o) => L.things(B.picture(o, N)));
    for (let t = 1; t + 1 < S.length; t++) { const pf = L.follow(T[t - 1], T[t]), prev = T[t].map(() => null); for (const [i, j] of pf) prev[j] = T[t - 1][i];
      const P = L.step(T[t], prev), ok = match(P, S[t + 1]); scenes++; if (ok.every(Boolean) && objsOf(P).length === S[t + 1].length) sceneOk++;
      S[t + 1].forEach((o, i) => { const a = S[t].find((z) => z === S[t][i]) && S[t][i], what = a && (o.dx === a.dx && o.dy === a.dy && a.dx !== 0 | a.dy !== 0 ? 'moving on' : o.shape !== a.shape ? 'bumped, changed shape' : 'turned round (wall or bump)');
        tally[what] = tally[what] || [0, 0]; tally[what][0]++; if (ok[i]) tally[what][1]++; }); } }
  console.log(`${label}: whole scene right ${(100 * sceneOk / scenes).toFixed(0)}% of ${scenes} steps; ` + Object.entries(tally).map(([k, [a, b]]) => `${k} ${(100 * b / a).toFixed(0)}% (${a})`).join(', ')); }
onestep('next step, new two-object meetings', (f) => B.meeting(f, N), 150, 12);
onestep('next step, new pairs roaming', (f) => B.start(f, 2, N), 40, 30);
onestep('next step, FIVE objects at once (never shown)', (f) => B.start(f, 5, N), 40, 30);
// 4. imagination: from the first two true pictures, the machine runs on its own; compared with the true run
{ const f = rng(4), STEPS = 40, right = Array(STEPS).fill(0), cnt = Array(STEPS).fill(0); let firstWrong = [], stalls = 0, count = 0;
  for (let k = 0; k < 30; k++) { const S = runSim(B.start(f, 5, N), STEPS + 1); let prevT = L.things(B.picture(S[0], N)), now = L.things(B.picture(S[1], N)); const pf = L.follow(prevT, now); let prev = now.map(() => null); for (const [i, j] of pf) prev[j] = prevT[i];
    let fw = null;
    for (let t = 1; t <= STEPS; t++) { const nx = L.step(now, prev); stalls += objsOf(nx).filter((z) => !z.rule).length; count += objsOf(nx).length; const ok = match(nx, S[t + 1]);
      const frac = ok.filter(Boolean).length / S[t + 1].length; right[t - 1] += frac; cnt[t - 1]++; if (fw === null && (frac < 1 || objsOf(nx).length !== S[t + 1].length)) fw = t; prev = now; now = nx; }
    firstWrong.push(fw === null ? STEPS + 1 : fw); }
  firstWrong.sort((a, b) => a - b);
  console.log(`\nimagining FIVE objects for ${STEPS} steps (30 starts): objects in the right place at step 1 ${(100 * right[0] / cnt[0]).toFixed(0)}%, step 5 ${(100 * right[4] / cnt[4]).toFixed(0)}%, step 10 ${(100 * right[9] / cnt[9]).toFixed(0)}%, step 20 ${(100 * right[19] / cnt[19]).toFixed(0)}%, step 40 ${(100 * right[39] / cnt[39]).toFixed(0)}%`);
  console.log(`  first step where anything differs from the truth: median ${firstWrong[15]}, ${firstWrong.filter((x) => x > STEPS).length} of 30 runs never differ; no rule fitted ${stalls} of ${count} times`); }
