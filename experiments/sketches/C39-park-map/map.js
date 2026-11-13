// C39 · THE LEVEL ABOVE WALKS. C38 showed walks held whole come back from their two ends, but a route never walked
// can't: nothing above walks held walks together, and halves pinned by each end weren't drawn to join.
// Here the level above walks sees a whole Sunday (2-3 walks) at once, drawn as a MAP: each step is drawn in the direction
// it went (self-motion), so a place lands in the same spot whichever walk passes it, and walks that share a junction
// line up there. Drawn where the places really are: the same, up to a shift, as starting the drawing anywhere, and the
// engine learns the same at any shift. The engine is unchanged.
// Picture: each place is its 3 x 3 view; a path walked is the 2 pixels between two places.
// No single walk ever contains both the bench and the oak, and no Sunday's picture ever joins them.
// TEST: show only the two end views where they are, hide everything else, read, and look at what is filled in:
// is there a chain of real places and walked paths joining them? Pairs are split by whether any one Sunday's picture
// already joined them (recall of a seen map) or never (a route put together from different Sundays).
'use strict';
const path = require('path');
const W = 21; globalThis.WORLD_SIZE = W;
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), { Model } = require(S + 'engine/see.js');
const SUNDAYS = +(process.env.SUNDAYS || 60);

const names = ['bench', 'gate', 'fountain', 'pond', 'rose bed', 'junction A', 'bridge', 'junction B', 'hill', 'meadow', 'stream', 'oak'];
const xy = (i) => [i % 4, Math.floor(i / 4)], links = new Map(names.map((_, i) => [i, []]));
const missing = new Set(['1-5', '6-10', '2-3']);
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) { const [a, b] = xy(i), [c, d] = xy(j);
  if (Math.abs(a - c) + Math.abs(b - d) === 1 && !missing.has(i + '-' + j)) { links.get(i).push(j); links.get(j).push(i); } }
const vr = rng(7), views = [], vk = new Set();
while (views.length < 12) { const cells = []; while (cells.length < 4) { const c = Math.floor(vr() * 9); if (!cells.includes(c)) cells.push(c); } const k = cells.sort().join(); if (vk.has(k)) continue; vk.add(k); views.push(cells.map((c) => [c % 3, Math.floor(c / 3)])); }
const cellPx = (i) => { const [a, b] = xy(i); return views[i].map(([u, v]) => (1 + 5 * b + v) * W + 1 + 5 * a + u); };
const edgePx = (i, j) => { const [a, b] = xy(Math.min(i, j)), [c] = xy(Math.max(i, j)); return c !== a ? [(2 + 5 * b) * W + 4 + 5 * a, (2 + 5 * b) * W + 5 + 5 * a] : [(4 + 5 * b) * W + 2 + 5 * a, (5 + 5 * b) * W + 2 + 5 * a]; };
const allEdges = []; for (const [i, l] of links) for (const j of l) if (i < j) allEdges.push([i, j]);

function walk(r, banned) { for (;;) { const L = 3 + Math.floor(r() * 4); const w = [Math.floor(r() * 12)];
  while (w.length < L) { const here = w[w.length - 1], prev = w[w.length - 2], nx = links.get(here).filter((v) => v !== prev), next = nx.length ? nx : links.get(here); w.push(next[Math.floor(r() * next.length)]); }
  if (!banned(w)) return w; } }
const BENCH = 0, OAK = 11, inOne = new Set(), joinedOnADay = new Set();
const days = [], m = new Model(), r = rng(39 + +(process.env.SEED || 0)), t0 = Date.now(); let pics = 0;
for (let d = 0; d < SUNDAYS; d++) { let x, dayEdges, dayWalks, joins;
  for (;;) { const k = 2 + Math.floor(r() * 2); x = new Uint8Array(W * W); dayEdges = []; dayWalks = [];
    for (let n = 0; n < k; n++) { const w = walk(r, (w) => w.includes(BENCH) && w.includes(OAK)); dayWalks.push(w);
      w.forEach((v, i) => { for (const p of cellPx(v)) x[p] = 1; if (i) { for (const p of edgePx(w[i - 1], v)) x[p] = 1; dayEdges.push([w[i - 1], v]); } }); }
    // which places this day's picture joins (through its own drawn paths)
    const adj = new Map(); for (const [a, b] of dayEdges) { (adj.get(a) || adj.set(a, []).get(a)).push(b); (adj.get(b) || adj.set(b, []).get(b)).push(a); }
    joins = new Set(); for (const s of adj.keys()) { const seen = new Set([s]), q = [s]; while (q.length) { const u = q.shift(); for (const v of adj.get(u) || []) if (!seen.has(v)) { seen.add(v); q.push(v); } } for (const v of seen) joins.add(s + '|' + v); }
    if (!joins.has(BENCH + '|' + OAK)) break; }   // no Sunday's picture ever joins the bench and the oak
  for (const w of dayWalks) for (const a of w) for (const b of w) inOne.add(a + '|' + b); for (const j of joins) joinedOnADay.add(j);
  days.push(x); m.step(x); if (++pics % 98 === 0) m.rest(); }
m.rest();
const live = m.units.filter((u) => !u.loose);
console.log(`${SUNDAYS} Sundays learnt in ${((Date.now() - t0) / 1000).toFixed(0)} s · ${live.length} things (biggest ${Math.max(...live.map((u) => m.exp(u).length))} px)`);

const viewOn = (x, i) => cellPx(i).every((p) => x[p]) && (() => { const [a, b] = xy(i); let n = 0; for (let v = 0; v < 3; v++) for (let u = 0; u < 3; u++) n += x[(1 + 5 * b + v) * W + 1 + 5 * a + u]; return n === 4; })();
const edgeOn = (x, i, j) => edgePx(i, j).every((p) => x[p]);
function recall(a, b) { const x = new Uint8Array(W * W), hid = new Uint8Array(W * W).fill(1);
  for (const p of cellPx(a)) x[p] = 1; for (const p of cellPx(b)) x[p] = 1;
  for (const i of [a, b]) { const [c, d] = xy(i); for (let v = 0; v < 3; v++) for (let u = 0; u < 3; u++) hid[(1 + 5 * d + v) * W + 1 + 5 * c + u] = 0; }   // the two end places are seen as they are
  const q = m.read(x, hid), R = q.recon;
  const places = names.map((_, i) => viewOn(R, i)), edges = allEdges.filter(([i, j]) => edgeOn(R, i, j) && places[i] && places[j]);
  const adj = new Map(); for (const [i, j] of edges) { (adj.get(i) || adj.set(i, []).get(i)).push(j); (adj.get(j) || adj.set(j, []).get(j)).push(i); }
  const prev = new Map([[a, null]]), qq = [a]; while (qq.length) { const u = qq.shift(); for (const v of adj.get(u) || []) if (!prev.has(v)) { prev.set(v, u); qq.push(v); } }   // (scorer only)
  let route = null; if (prev.has(b)) { route = []; for (let v = b; v != null; v = prev.get(v)) route.unshift(v); }
  let wrongPx = 0; const truth = new Set(); for (let i = 0; i < 12; i++) if (places[i]) cellPx(i).forEach((p) => truth.add(p)); for (const [i, j] of allEdges) if (edgeOn(R, i, j)) edgePx(i, j).forEach((p) => truth.add(p));
  for (let p = 0; p < W * W; p++) if (R[p] && !truth.has(p)) wrongPx++;
  const sub = q.claims.map((c) => { const px = m.exp(c.c).map(([u, v]) => (v + c.dy) * W + u + c.dx); return days.some((d) => px.every((p) => d[p])) ? 'inside one Sunday' : 'not inside any one Sunday'; });
  return { sub, route, nPlaces: places.filter(Boolean).length, nEdges: edges.length, placements: q.claims.length, wrongPx, R }; }
const draw = (R) => { const out = []; for (let y = 0; y < 16; y++) out.push('      ' + [...R.slice(y * W, y * W + W)].map((v) => (v ? '#' : '.')).join('')); return out.join('\n'); };

const groups = { 'joined on some Sunday (a seen map)': [], 'never joined on any one Sunday (put together)': [] };
for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) if (!inOne.has(a + '|' + b)) groups[joinedOnADay.has(a + '|' + b) ? 'joined on some Sunday (a seen map)' : 'never joined on any one Sunday (put together)'].push([a, b]);
for (const [g, ps] of Object.entries(groups)) { let ok = 0, pl = 0, ed = 0, wr = 0;
  for (const [a, b] of ps) { const R = recall(a, b); if (R.route) ok++; pl += R.placements; ed += R.nEdges; wr += R.wrongPx;
    if (a === BENCH && b === OAK) console.log(`  bench to oak (${g}): ${R.route ? R.route.map((v) => names[v]).join(' → ') : 'not joined'} · filled ${R.nPlaces} places, ${R.nEdges} paths, ${R.placements} placements, ${R.wrongPx} stray px · the thing(s) used: ${R.sub.join(', ')}\n${draw(R.R)}`); }
  console.log(`${g}: ${ps.length} pairs never in one walk · joined by real places and paths ${ok}/${ps.length} · on average ${(pl / Math.max(1, ps.length)).toFixed(1)} placements, ${(ed / Math.max(1, ps.length)).toFixed(1)} paths filled, ${(wr / Math.max(1, ps.length)).toFixed(1)} stray px`); }
