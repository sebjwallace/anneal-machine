// C26: rules with no crutches, in rooms whose walls are drawn as bricks (no wall context). Shapes from shapes.js.
'use strict';
globalThis.WORLD_SIZE = +(process.env.SIZE || 24);
const path = require('path');
const { rng } = require(path.join(__dirname, '../../world/catalogue.js')), B = require(path.join(__dirname, '../../world/bumpers.js'));
const { Model } = require(path.join(__dirname, '../../models/clean.js')), { Codes } = require(path.join(__dirname, '../../models/codes.js')), { Reach } = require(path.join(__dirname, '../../models/reach.js')), { Similar } = require(path.join(__dirname, '../../models/similar.js'));
const load = require(path.join(__dirname, '../C26-clean/load.js')), KIND = process.env.KIND || 'similar';
const N = globalThis.WORLD_SIZE, DEMOS = +(process.env.DEMOS || 600), t0 = Date.now(); B.cfg.walls = true;
const m = load(Model, N), C = new Codes(m, {}), L = KIND === 'similar' ? new Similar(C) : new Reach(C);
const runSim = (objs, n) => { const out = [objs]; for (let k = 0; k < n; k++) out.push(B.step(out[out.length - 1], N)); return out; };
const shapeOf = (u) => (u.layer > 1 ? 'square' : u.pts.length === 4 ? 'diamond' : 'brick');
// demonstrations: two objects, each in a room of random size and place
const e = rng(2); let shown = 0;
for (let k = 0; k < DEMOS; k++) { let s = null; while (!s) { B.cfg.room = B.randomRoom(e, N); s = B.meeting(e, N); } L.learnRun(runSim(s, 12).map((o) => B.picture(o, N))); shown++; }
for (let k = 0; k < DEMOS / 4; k++) { B.cfg.room = B.randomRoom(e, N); L.learnRun(runSim(B.start(e, 2, N), 30).map((o) => B.picture(o, N))); shown++; }
const nl = L.rest();
console.log(`C27 [${KIND}] · ${shown} two-object demonstrations, ${L.obs.length} observations, ${nl} situations kept, reach used up to ${L.dists[L.levels.length - 1]} cells; ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
const match = (pred, objs) => objs.map((o) => pred.some((p) => shapeOf(p.u) === o.shape && p.px === o.x && p.py === o.y));
const objsOf = (P) => P.filter((p) => shapeOf(p.u) !== 'brick');
function onestep(label, n, k, steps, full) { const f = rng(3), tally = {}; let scenes = 0, ok = 0;
  for (let q = 0; q < n; q++) { B.cfg.room = full ? { x: 0, y: 0, w: N, h: N } : B.randomRoom(f, N); const S = runSim(B.start(f, k, N), steps), T = S.map((o) => L.things(B.picture(o, N)));
    for (let t = 1; t + 1 < S.length; t++) { const pf = L.follow(T[t - 1], T[t]), prev = T[t].map(() => null); for (const [i, j] of pf) prev[j] = T[t - 1][i];
      const P = L.step(T[t], prev), good = match(P, S[t + 1]); scenes++; if (good.every(Boolean) && objsOf(P).length === S[t + 1].length) ok++;
      S[t + 1].forEach((o, i) => { const a = S[t][i], what = o.shape !== a.shape ? 'changed shape' : o.dx === a.dx && o.dy === a.dy ? 'moving on' : 'turned round (wall or bump)'; tally[what] = tally[what] || [0, 0]; tally[what][0]++; if (good[i]) tally[what][1]++; }); } }
  console.log(`${label}: whole scene right ${(100 * ok / scenes).toFixed(0)}% of ${scenes} steps; ` + Object.entries(tally).map(([w, [a, b]]) => `${w} ${(100 * b / a).toFixed(0)}% (${a})`).join(', ')); }
onestep('next step, two objects, new rooms', 60, 2, 30);
onestep('next step, FIVE objects, full-size room (never shown)', 60, 5, 30, true);
{ const f = rng(4), STEPS = 40, right = Array(STEPS).fill(0), cnt = Array(STEPS).fill(0), fw = [];
  for (let q = 0; q < 30; q++) { B.cfg.room = { x: 0, y: 0, w: N, h: N }; const S = runSim(B.start(f, 5, N), STEPS + 1); let p0 = L.things(B.picture(S[0], N)), now = L.things(B.picture(S[1], N)); const pf = L.follow(p0, now); let prev = now.map(() => null); for (const [i, j] of pf) prev[j] = p0[i]; let first = null;
    for (let t = 1; t <= STEPS; t++) { const nx = L.step(now, prev), good = match(nx, S[t + 1]); const frac = good.filter(Boolean).length / S[t + 1].length; right[t - 1] += frac; cnt[t - 1]++; if (first === null && (frac < 1 || objsOf(nx).length !== S[t + 1].length)) first = t;
      prev = nx.map((z) => now[z.from]); now = nx; }
    fw.push(first === null ? STEPS + 1 : first); }
  fw.sort((a, b) => a - b);
  console.log(`\nimagining FIVE objects in a full-size room, ${STEPS} steps (30 starts): right at step 1 ${(100 * right[0] / cnt[0]).toFixed(0)}%, step 5 ${(100 * right[4] / cnt[4]).toFixed(0)}%, step 10 ${(100 * right[9] / cnt[9]).toFixed(0)}%, step 20 ${(100 * right[19] / cnt[19]).toFixed(0)}%, step 40 ${(100 * right[39] / cnt[39]).toFixed(0)}%; first difference: median ${fw[15]}, never in ${fw.filter((x) => x > STEPS).length} of 30`); }
