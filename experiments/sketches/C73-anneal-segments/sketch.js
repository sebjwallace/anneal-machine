// Sketch 38: segments as assembly membership (hypothesis 06).
// Base: sketch 20 (copied here as sketch-settle-ref.js / sketch-asm-ref.js): finding 02's sentence world, sketch 19's learnt
//   column codes (4 own + 4 by affinity), one cell per (word, column) claimed by the least-owned rule = the word's assembly.
//   Those parts are copied verbatim (world extended with M episode objects; no chain consequences, no level 2).
// New: an EPISODE is a sentence. When it is experienced, the assemblies of its distinct words (all tokens except ".") are
//   co-active: their cells plus their column units (sketch 20's two-level presynaptic reading). Two ways to store it:
//   MODE=sum  summed Hebbian links unit -> cell among the co-active units (w += ETA(1-w)), read with fit-normalisation:
//             a cell's drive = (sum of links from active units) / (its total incoming link weight)   (sketch 29).
//             Completion = projection + casting: one winner per column, K columns, cue held, up to ROUNDS castings.
//   MODE=seg  membership segments: each co-active cell that has no segment fully matching the current co-active set grows ONE
//             segment of SEGN units sampled from the OTHER co-active units (not its own cell or column). Nothing chooses the
//             "true members": the sample is whatever was co-active. A cell fires when any of its segments has >= THETA of its
//             synapses active (soft AND per assembly, OR across assemblies). Completion: cue held, fired cells (and their
//             columns) join the active set, up to ROUNDS rounds. Only segments with an active input are checked (index unit ->
//             segments). No casting, no K.
//   SAMPLE=uniform (main) | rare: synapses sampled with weight 1/(times the unit has been active), the same homeostatic idea
//             as the learnt-code rule (ubiquitous contexts count for little).
// Scoring is identical for both: the final active cells are compared with every word's assembly (see score()).
//   CPC=8 MODE=seg node sketch.js        (seeds 101-105, M sweep 25,50,100,200,400; see PREREG.txt)
'use strict';
const env = process.env;
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// ---- settings (fixed in PREREG.txt) ----
const MODE = env.MODE || 'seg', SAMPLE = env.SAMPLE || 'uniform';
const NORM = env.NORM || 'fit';            // sum: 'fit' (divide by the cell's total link weight, sketch 29) | 'raw' (plain sums, sketch 20c)
const CAST = env.CAST === '1';
const ANNEAL = +(env.ANNEAL || 0);   // C73: Anneal's rule. A segment fires at >= 2 active synapses (the bar from the prices, not a fraction); in each column the cell whose best firing segment has the MOST active synapses wins, and a tie between the top cells refuses the column (no guess). ANNEAL=1: then the same K-column casting; ANNEAL=2: no K, every column with a sole winner joins.             // seg: fired cells compete in the same casting as sum (one per column, K columns)
const CPC = +(env.CPC || 8), N = 400, NCELL = N * CPC, NU = NCELL + N, K = 8, MAXU = NU + (1 << 20);
const CTX = env.CTX !== '0';              // the base's sequence (prev x cur) and subject (subject x cur) units join the co-active set
const SEGN = env.SEGN === 'all' ? 1e9 : +(env.SEGN || 16), THETA = +(env.THETA || 0.75), ETA = 0.2, ROUNDS = 5;
const MS = (env.MS || '25,50,100,200,400').split(',').map(Number);
const SEEDS = (env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const LEVEL = 0.75;
const NEPI = 100, NPART = 50;   // probes per seed: episodes sampled for recall; partial-cue probes and split pairs  // capacity: largest M before strict episode recall falls below this (fixed in advance)
const NSENT = 800, KOWN = 4, KL = 4, ADEC = 0.9, A0 = 0.05;
// ---- vocabulary (as sketch 20; XOBJ = the M episode objects) ----
const mk = (p, n) => Array.from({ length: n }, (_, i) => p + i);
const OBJ = mk('o', 24), CON = mk('c', 12), ROOM = mk('r', 4), SURF = mk('s', 6), PPL = mk('p', 8);
const FIXED = ['.', 'the', 'a', 'is', 'in', 'on', 'has', 'sat', 'opened'], AMB = ['j0'];
let XOBJ, NOUN, ALL;
function setVocab(M) { XOBJ = mk('x', M); NOUN = new Set([...OBJ, ...XOBJ, ...CON, ...ROOM, ...SURF, ...PPL, ...AMB]); ALL = [...FIXED, ...NOUN]; }
const kindOf = (w) => !w ? '-' : w[0] === 'x' ? 'o' : NOUN.has(w) ? w[0] : 'fixed';
const S = { inOC: (o, c) => ['.', 'the', o, 'is', 'in', 'the', c], inCR: (c, r) => ['.', 'the', c, 'is', 'in', 'the', r],
  onOS: (o, s) => ['.', 'the', o, 'is', 'on', 'the', s], has: (p, o) => ['.', 'the', p, 'has', 'a', o],
  sat: (p, s) => ['.', 'the', p, 'sat', 'on', 'the', s], opened: (p, c) => ['.', 'the', p, 'opened', 'the', c] };
// world: sketch 20's generator; chains = the M episode objects, each with one "x in c" (first 60%) and kind evidence (on / has).
// The train-chain consequences "x in z" are left out (they would give x two answers). The base 800 sentences come first in the
// rng stream, so they are identical for every M of a seed.
function world(seed) {
  const r = rng(seed * 101 + 7), pick = (a) => a[Math.floor(r() * a.length)];
  const roomOf = {}; for (const c of CON) roomOf[c] = pick(ROOM);
  const heldO = OBJ.slice(0, 4), heldC = CON.slice(0, 3), chainC = CON.slice(3);
  const sents = [];
  for (let i = 0; i < NSENT; i++) {
    const u = r();
    if (u < 0.25) sents.push(S.inOC(pick(OBJ.slice(4)), pick(CON)));
    else if (u < 0.40) { const c = pick(CON.slice(3)); sents.push(S.inCR(c, roomOf[c])); }
    else if (u < 0.60) sents.push(S.onOS(pick(OBJ), pick(SURF)));
    else if (u < 0.78) sents.push(S.has(pick(PPL), pick(OBJ)));
    else if (u < 0.89) sents.push(S.sat(pick(PPL), pick(SURF)));
    else sents.push(S.opened(pick(PPL), pick(CON)));
  }
  const chains = XOBJ.map((x) => ({ x, y: pick(chainC) }));
  const ins = (at, s) => sents.splice(Math.min(sents.length, Math.max(0, at)), 0, s);
  for (const ch of chains) { ins(Math.floor(r() * sents.length), S.onOS(ch.x, pick(SURF))); ins(Math.floor(r() * sents.length), S.has(pick(PPL), ch.x)); }
  for (const ch of chains) ins(Math.floor(r() * 0.6 * sents.length), S.inOC(ch.x, ch.y));
  const ra = rng(seed * 31 + 3), pa = (a) => a[Math.floor(ra() * a.length)], jRoom = pa(ROOM), jS = [];
  for (let i = 0; i < 7; i++) jS.push(S.onOS('j0', pa(SURF)), S.has(pa(PPL), 'j0'));
  for (let i = 0; i < 6; i++) jS.push(S.inOC('j0', pa(CON.slice(3))));
  for (let i = 0; i < 8; i++) jS.push(S.inOC(pa(OBJ.slice(4)), 'j0'));
  for (let i = 0; i < 6; i++) jS.push(S.opened(pa(PPL), 'j0'), S.inCR('j0', jRoom));
  for (const s of jS) sents.splice(Math.floor(ra() * sents.length), 0, s);
  return { r, roomOf, heldO, heldC, chainC, chains, sents };
}
// ---- learnt column codes + assembly cells: verbatim from sketch 20 (GROW=0) ----
const POOL = 1 << 24;
function conj(net, A, B, salt) { const out = new Set();
  for (const a of A) for (const b of B) { let h = Math.imul(a + 1, 0x9E3779B1) ^ Math.imul(b + 7, 0x85EBCA77) ^ net.hs ^ salt;
    h = Math.imul(h ^ (h >>> 15), 0x2C1B3C6D); h ^= h >>> 13; h >>>= 0; if ((h & 7) === 0) out.add((h >>> 3) % POOL); }
  return [...out]; }
function makeNet(seed) { const r = rng(seed), code = {}, idx = Array.from({ length: N }, () => []);
  for (const n of ALL) { const a = new Set(); while (a.size < K) a.add(Math.floor(r() * N)); code[n] = [...a]; for (const i of a) idx[i].push(n); }
  const re = rng(seed * 7 + 1), excit = Float64Array.from({ length: N }, () => re());
  const own = {}, aff = {}; for (const n of ALL) { own[n] = code[n].slice(0, KOWN); aff[n] = new Map(code[n].slice(KOWN).map(j => [j, A0])); }
  const excitC = Float64Array.from({ length: NCELL }, () => re()), colCells = Array.from({ length: N }, (_, c) => Array.from({ length: CPC }, (_, k) => c * CPC + k));
  const net = { cmap: new Map(), r, code, idx, own, aff, excit, excitC, colCells, owners: new Int32Array(NCELL), asm: {}, cnt: new Map(), hs: (seed * 2654435761) | 0 };
  for (const n of ALL) { net.asm[n] = new Map(); assign(net, n); } return net; }
function assign(net, w) { const A = net.asm[w], cols = new Set(net.code[w]);
  for (const [col, cell] of A) if (!cols.has(col)) { net.owners[cell]--; A.delete(col); }
  for (const col of net.code[w]) { if (A.has(col)) continue; const cs = net.colCells[col]; let b = cs[0];
    for (const i of cs) if (net.owners[i] < net.owners[b] || (net.owners[i] === net.owners[b] && net.excitC[i] > net.excitC[b])) b = i;
    net.owners[b]++; A.set(col, b); } }
const cellsOf = (net, w) => net.code[w].map(col => net.asm[w].get(col));
// a cue can show only some of a word's cells (net.mask = {w, keep}); its columns and conjunctions then use only those
const shownCells = (net, w) => { const a = cellsOf(net, w); return net.mask && net.mask.w.has(w) ? a.filter(i => net.mask.keep.has(i)) : a; };
const shownCols = (net, w) => net.mask && net.mask.w.has(w) ? net.code[w].filter(col => net.mask.keep.has(net.asm[w].get(col))) : net.code[w];
const ctxCells = (net, a, b, salt) => [...new Set(conj(net, net.code[a], net.code[b], salt).map(c => c % N))];
function learnCodes(net, sent) {
  for (let t = 0; t < sent.length; t++) { const w = sent[t]; if (!NOUN.has(w)) continue;
    const X = [...(t >= 2 ? ctxCells(net, sent[t - 2], sent[t - 1], 0x1EF7) : []), ...(t + 2 < sent.length ? ctxCells(net, sent[t + 1], sent[t + 2], 0x41647) : [])];
    const A = net.aff[w]; for (const [j, v] of A) A.set(j, v * ADEC);
    for (const j of X) { if (net.own[w].includes(j)) continue; const c = (net.cnt.get(j) || 0) + 1; net.cnt.set(j, c); A.set(j, (A.get(j) || 0) + 1 / c); }
    const top = [...A.entries()].sort((a, b) => (b[1] - a[1]) || (net.excit[b[0]] - net.excit[a[0]])).slice(0, KL).map(e => e[0]);
    const nc = [...net.own[w], ...top];
    for (const j of net.code[w]) net.idx[j] = net.idx[j].filter(n => n !== w);
    for (const j of nc) net.idx[j].push(w); net.code[w] = nc; assign(net, w);
    if (A.size > 64) { const keep = [...A.entries()].sort((a, b) => b[1] - a[1]).slice(0, 64); net.aff[w] = new Map(keep); } } }
// ---- the base's held states, verbatim from sketch 20c (TOPIC off): sequence (prev x cur) and subject (subject x cur)
// conjunctions, read at cell level and column level. These hashed units are presynaptic only (never targets).
function step(net, x, sym) {
  if (sym === '.') { x.subj = undefined; x.pos = 0; } else x.pos++;
  if (x.pos === 2 && x.prev === 'the' && NOUN.has(sym)) x.subj = sym;
  let c = x.prev !== undefined ? conj2(net, [x.prev], sym, 0x5EED) : [];
  if (x.subj !== undefined && sym !== x.subj) c = [...new Set([...c, ...conj2(net, [x.subj], sym, 0)])];
  x.prev = sym; return c; }
function conj2(net, held, sym, salt) { const a = conj(net, held.flatMap(h => shownCells(net, h)), shownCells(net, sym), salt);
  return [...new Set([...a, ...conj(net, held.flatMap(h => shownCols(net, h)), shownCols(net, sym), salt ^ 0xC01)])]; }
const colU = (i) => NCELL + Math.floor(i / CPC);
const cid = (net, h) => { let v = net.cmap.get(h); if (v === undefined) { v = NU + net.cmap.size; if (v >= MAXU) throw new Error('unit space'); net.cmap.set(h, v); } return v; };
// co-active units of a token sequence: every word's shown assembly cells + their column units (+ the held-state units)
function evUnits(net, toks, mask) { net.mask = mask || null; const x = {}, cells = new Set(), units = new Set();
  for (const w of toks) { const c = step(net, x, w); if (CTX) for (const h of c) units.add(cid(net, h)); if (w === '.') continue;
    for (const i of shownCells(net, w)) { cells.add(i); units.add(i); units.add(colU(i)); } }
  net.mask = null; return { cells: [...cells], units: [...units] }; }
// ===== version 1: summed Hebbian links, fit-normalised =====
function makeSum() { return { rows: [], tot: new Float64Array(NCELL), base: new Float64Array(NCELL), drv: new Float64Array(NCELL), nlinks: 0 }; }
function storeSum(m, ev, cost) {
  for (const u of ev.units) { let p = m.rows[u]; if (!p) m.rows[u] = p = { j: [], w: [], m: new Map() };
    for (const i of ev.cells) { if (i === u || colU(i) === u) continue; let q = p.m.get(i);
      if (q === undefined) { q = p.j.length; p.j.push(i); p.w.push(0); p.m.set(i, q); m.nlinks++; }
      const d = ETA * (1 - p.w[q]); p.w[q] += d; m.tot[i] += d; cost.ops++; } } }
function kcols(cands, val, cue) { const best = new Map();   // one winner per column, K columns
  for (const i of cands) { if (cue.has(i)) continue; const x = val(i); if (x <= 1e-9) continue; const col = Math.floor(i / CPC), b = best.get(col);
    if (!b || x > b[1] || (x === b[1] && i < b[0])) best.set(col, [i, x]); }
  return [...best.values()].sort((p, q) => q[1] - p[1] || p[0] - q[0]).slice(0, K).map(e => e[0]); }
function completeSum(m, cue, cost) {
  const cueCells = new Set(cue.cells), touched = new Set(), base = m.base;
  const add = (arr, u, f) => { const p = m.rows[u]; if (!p) return; for (let q = 0; q < p.j.length; q++) { const i = p.j[q]; if (!touched.has(i)) { touched.add(i); base[i] = 0; m.drv[i] = 0; } arr[i] += f * p.w[q]; } cost.ops += p.j.length; };
  for (const u of cue.units) add(base, u, 1);
  const val = (i) => m.tot[i] > 0 ? (base[i] + m.drv[i]) / (NORM === 'fit' ? m.tot[i] : 1) : 0;
  let st = kcols(touched, val, cueCells), r = 1;
  for (; r < ROUNDS; r++) {
    for (const i of touched) m.drv[i] = 0;
    const cueCols = new Set(cue.units.filter(u => u >= NCELL)), extra = [];
    for (const i of st) { extra.push(i); const c = colU(i); if (!cueCols.has(c)) { cueCols.add(c); extra.push(c); } }
    for (const u of extra) add(m.drv, u, 1);
    const nx = kcols(touched, val, cueCells); const same = nx.length === st.length && nx.every(i => st.includes(i)); st = nx; if (same) break; }
  for (const i of touched) { base[i] = 0; m.drv[i] = 0; }
  cost.rounds += r; return [...new Set([...cue.cells, ...st])]; }
// ===== version 2: membership segments =====
function makeSeg() { return { cell: [], need: [], syn: [], idx: [], byCell: new Array(NCELL), cnt: new Int32Array(1 << 16), nAct: new Float64Array(MAXU), grown: 0 }; }
function ensureCnt(m) { if (m.cnt.length < m.cell.length + 1) { const c = new Int32Array(m.cnt.length * 2); m.cnt = c; } }
function sampleUnits(m, pool, n, r) {
  if (SAMPLE === 'rare' && pool.length > n) { // weighted without replacement (Efraimidis-Spirakis), weight 1/(times active)
    return pool.map(u => [u, Math.log(r() + 1e-12) * (1 + m.nAct[u])]).sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]); }
  n = Math.min(n, pool.length); const a = pool.slice(); for (let k = 0; k < n; k++) { const j = k + Math.floor(r() * (a.length - k)); const t = a[k]; a[k] = a[j]; a[j] = t; } return a.slice(0, n); }
// count active inputs of every segment that has one (index unit -> segments); returns the touched segment list
function countSegs(m, units, touched, cost) { const cnt = m.cnt;
  for (const u of units) { const L = m.idx[u]; if (!L) continue; cost.ops += L.length;
    for (const s of L) { if (cnt[s] === 0) touched.push(s); cnt[s]++; } } }
function storeSeg(m, ev, r, cost) {
  // gate: does one of this cell's own segments match the co-active set fully? (checked on the cell's own segments)
  const on = m.flag || (m.flag = new Uint8Array(MAXU)); for (const u of ev.units) on[u] = 1;
  const grow = [];
  for (const i of ev.cells) { const L = m.byCell[i]; let full = false;
    if (L) for (const s of L) { cost.checked++; const y = m.syn[s]; let k = 0; while (k < y.length && on[y[k]]) k++; cost.ops += k + 1; if (k === y.length) { full = true; break; } }
    if (!full) grow.push(i); }
  for (const u of ev.units) on[u] = 0;
  for (const i of grow) { const own = colU(i), pool = ev.units.filter(u => u !== i && u !== own), syn = sampleUnits(m, pool, SEGN, r);
    const s = m.cell.length; m.cell.push(i); m.syn.push(syn); m.need.push(Math.max(1, Math.ceil(THETA * syn.length - 1e-9)));
    for (const u of syn) (m.idx[u] = m.idx[u] || []).push(s); (m.byCell[i] = m.byCell[i] || []).push(s); m.grown++; ensureCnt(m); }
  for (const u of ev.units) m.nAct[u]++; }
// CAST=1: a cell's drive = the active share of its best segment that reaches threshold; the same casting as sum decides.
// Cue counts are made once; each round adds the cast cells' units on top and takes them off again.
function segEval(m, lists) { const d = new Map();
  for (const L of lists) for (const s of L) if (m.cnt[s] >= m.need[s]) { const i = m.cell[s], f = m.cnt[s] / m.syn[s].length; if (!(d.get(i) >= f)) d.set(i, f); }
  return d; }
function completeSegCast(m, cue, cost) {
  ensureCnt(m); const cueCells = new Set(cue.cells), tc = []; countSegs(m, cue.units, tc, cost);
  let d = segEval(m, [tc]), st = kcols(d.keys(), (i) => d.get(i), cueCells), r = 1, extraT = new Set();
  const cueU = new Set(cue.units);
  for (; r < ROUNDS; r++) { const add = new Set(); for (const i of st) { if (!cueU.has(i)) add.add(i); const c = colU(i); if (!cueU.has(c)) add.add(c); }
    const te = []; for (const u of add) { const L = m.idx[u]; if (!L) continue; cost.ops += L.length; for (const s of L) { if (m.cnt[s] === 0) te.push(s); m.cnt[s]++; } }
    for (const s of te) extraT.add(s);
    d = segEval(m, [tc, te]); const nx = kcols(d.keys(), (i) => d.get(i), cueCells);
    for (const u of add) { const L = m.idx[u]; if (L) for (const s of L) m.cnt[s]--; }
    const same = nx.length === st.length && nx.every(i => st.includes(i)); st = nx; if (same) break; }
  for (const s of tc) m.cnt[s] = 0; for (const s of extraT) m.cnt[s] = 0;
  cost.checked += tc.length + extraT.size; cost.rounds += r; return [...new Set([...cue.cells, ...st])]; }
// C73 (ANNEAL=1|2): support = count of active synapses on a cell's best segment with >= 2; per column, a sole top cell wins,
// a tie between top cells means no winner there. ANNEAL=1 keeps the K strongest columns (K given, as in the cast arm); ANNEAL=2 keeps all.
function segEvalA(m, lists, cueCells) { const d = new Map();
  for (const L of lists) for (const s of L) if (m.cnt[s] >= 2) { const i = m.cell[s]; if (cueCells.has(i)) continue; const v = m.cnt[s]; if (!(d.get(i) >= v)) d.set(i, v); }
  const col = new Map(); for (const [i, v] of d) { const c = Math.floor(i / CPC), b = col.get(c); if (!b || v > b.v) col.set(c, { i, v, tie: false }); else if (v === b.v) b.tie = true; }
  let w = [...col.values()].filter(e => !e.tie).sort((p, q) => q.v - p.v || p.i - q.i);
  if (ANNEAL === 1) w = w.slice(0, K);
  return w.map(e => e.i); }
function completeSegAnneal(m, cue, cost) {
  ensureCnt(m); const cueCells = new Set(cue.cells), tc = []; countSegs(m, cue.units, tc, cost);
  let st = segEvalA(m, [tc], cueCells), r = 1, extraT = new Set(); const cueU = new Set(cue.units);
  for (; r < ROUNDS; r++) { const add = new Set(); for (const i of st) { if (!cueU.has(i)) add.add(i); const c = colU(i); if (!cueU.has(c)) add.add(c); }
    const te = []; for (const u of add) { const L = m.idx[u]; if (!L) continue; cost.ops += L.length; for (const s of L) { if (m.cnt[s] === 0) te.push(s); m.cnt[s]++; } }
    for (const s of te) extraT.add(s);
    const nx = segEvalA(m, [tc, te], cueCells);
    for (const u of add) { const L = m.idx[u]; if (L) for (const s of L) m.cnt[s]--; }
    const same = nx.length === st.length && nx.every(i => st.includes(i)); st = nx; if (same) break; }
  for (const s of tc) m.cnt[s] = 0; for (const s of extraT) m.cnt[s] = 0;
  cost.checked += tc.length + extraT.size; cost.rounds += r; return [...new Set([...cue.cells, ...st])]; }
function completeSeg(m, cue, cost) {
  if (ANNEAL) return completeSegAnneal(m, cue, cost);
  if (CAST) return completeSegCast(m, cue, cost);
  ensureCnt(m); const act = new Set(cue.units), on = new Set(cue.cells), touched = []; let fresh = cue.units.slice(), r = 0;
  for (; r < ROUNDS && fresh.length; r++) { const before = touched.length, cnt = m.cnt, next = [];
    for (const u of fresh) { const L = m.idx[u]; if (!L) continue; cost.ops += L.length;
      for (const s of L) { if (cnt[s] === 0) touched.push(s); cnt[s]++;
        if (cnt[s] === m.need[s]) { const i = m.cell[s]; if (!on.has(i)) { on.add(i); next.push(i); } } } }
    fresh = []; for (const i of next) { if (!act.has(i)) { act.add(i); fresh.push(i); } const c = colU(i); if (!act.has(c)) { act.add(c); fresh.push(c); } }
    void before; }
  cost.checked += touched.length; cost.rounds += r; for (const s of touched) m.cnt[s] = 0;
  return [...on]; }
// ---- scoring (identical for both versions) ----
// present(w) = share of w's assembly cells that are active. Candidates: every word not in the cue.
// readout = the candidate with the highest share, if >= 1/2 and strictly above every other candidate (a tie is no answer).
// blend = some other candidate w has >= 1/2 of its DISTINCTIVE cells active (cells not in the answer's assembly or the cue;
//   needs >= 2 such cells). Strict recall = right answer and no blend; lenient = right answer.
function score(net, active, cueWords, cueCells, Y) {
  const A = new Set(active), cue = new Set(cueWords), cc = new Set(cueCells), pres = [];
  for (const w of ALL) { if (cue.has(w) || w === '.') continue; const cs = cellsOf(net, w); let o = 0; for (const i of cs) if (A.has(i)) o++; pres.push([w, o / K, cs]); }
  pres.sort((a, b) => b[1] - a[1]);
  const top = pres[0], uniq = top && top[1] >= 0.5 && (pres.length < 2 || pres[1][1] < top[1]), rd = uniq ? top[0] : null;
  const ans = Y || rd, ansCells = ans ? new Set(cellsOf(net, ans)) : new Set();
  const blendWith = []; for (const [w, , cs] of pres) { if (w === ans) continue; const d = cs.filter(i => !ansCells.has(i) && !cc.has(i)); if (d.length < 2) continue;
    if (d.filter(i => A.has(i)).length / d.length >= 0.5) blendWith.push(w); }
  let newCells = 0; for (const i of A) if (!cc.has(i)) newCells++;
  return { rd, right: Y ? rd === Y : null, blend: blendWith.length > 0, blendWith, none: !rd, kind: kindOf(rd), newCells }; }
// ---- run ----
const out = {}; const push = (M, k, v) => { const o = (out[M] = out[M] || {}); (o[k] = o[k] || []).push(v); };
const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const t0 = Date.now();
for (const M of MS) { setVocab(M);
  for (const seed of SEEDS) {
    const W = world(seed), net = makeNet(seed), m = MODE === 'sum' ? makeSum() : makeSeg(), sr = rng(seed * 977 + 13);
    const tc = { ops: 0, checked: 0, act: 0, n: 0 }, distinct = new Set();
    for (const sent of W.sents) {
      const ev = evUnits(net, sent); distinct.add(sent.join(' '));
      if (MODE === 'sum') storeSum(m, ev, tc); else storeSeg(m, ev, sr, tc);
      tc.act += ev.cells.length; tc.n++;
      learnCodes(net, sent.concat('.'));
    }
    push(M, 'stored assemblies (distinct sentences)', distinct.size);
    push(M, 'train: cells active per event', tc.act / tc.n);
    push(M, 'train: work per event (link updates | gate synapse checks)', tc.ops / tc.n);
    if (MODE === 'seg') { push(M, 'train: own segments checked per event (growth gate)', tc.checked / tc.n); push(M, 'segments stored', m.cell.length); push(M, 'segments per assembly cell-event', m.cell.length / tc.act); }
    else push(M, 'links stored', m.nlinks);
    { let sh = 0, tot = 0; for (const w of ALL) if (w !== '.') for (const i of cellsOf(net, w)) { tot++; sh += net.owners[i] > 1; } push(M, 'assembly cells shared by >1 word', sh / tot); }
    const pc = { ops: 0, checked: 0, rounds: 0, n: 0 };
    const run = (cue) => { pc.n++; return MODE === 'sum' ? completeSum(m, cue, pc) : completeSeg(m, cue, pc); };
    const cueOf = (toks, mask) => evUnits(net, toks, mask), wordsOf = (toks) => [...new Set(toks.filter(w => w !== '.'))];
    const probe = (toks, Y, mask) => { const cue = cueOf(toks, mask); return score(net, run(cue), wordsOf(toks), cue.cells, Y); };
    const tally = (name, res) => { push(M, `${name}: lenient`, res.right ? 1 : 0); push(M, `${name}: strict`, res.right && !res.blend ? 1 : 0);
      push(M, `${name}: blend`, res.blend ? 1 : 0); push(M, `${name}: no answer`, res.none ? 1 : 0); push(M, `${name}: new cells`, res.newCells); };
    const frame = (x) => ['.', 'the', x, 'is', 'in', 'the'];   // the sentence so far; the completion should supply the last word
    // episode recall: "the x is in the" -> its container (one experience each)
    const pr0 = rng(seed * 313 + 1), sub = (a, n) => a.length <= n ? a : a.map(v => [v, pr0()]).sort((p, q) => p[1] - q[1]).slice(0, n).map(e => e[0]);
    const epi = sub(W.chains, NEPI), epiP = epi.slice(0, NPART);
    for (const ch of epi) tally('episode x -> Y', probe(frame(ch.x), ch.y));
    // fact recall: "the c is in the" -> its room (seen containers; the fact is repeated many times)
    for (const c of W.chainC) tally('fact c -> room', probe(frame(c), W.roomOf[c]));
    // kind transfer (kind of the read-out word)
    for (const c of W.heldC) { const s = probe(frame(c)); push(M, 'kind: new container -> room', s.kind === 'r' ? 1 : 0); push(M, 'kind: new container -> blend', s.blend ? 1 : 0); }
    for (const o of W.heldO) { const s = probe(frame(o)); push(M, 'kind: new object -> container', s.kind === 'c' ? 1 : 0); }
    for (const o of OBJ.slice(4)) { const s = probe(frame(o)); push(M, 'kind: seen object -> container', s.kind === 'c' ? 1 : 0); }
    // partial cues: x shows 4 of its 8 cells (its columns and conjunctions use only those); the bare cue "x in"
    const cr = rng(seed * 991 + 17), half = (x) => new Set(cellsOf(net, x).slice().sort(() => cr() - 0.5).slice(0, 4));
    for (const ch of epiP) {
      tally('partial: x at 4 of 8 cells', probe(frame(ch.x), ch.y, { w: new Set([ch.x]), keep: half(ch.x) }));
      tally('partial: cue "x in" only', probe([ch.x, 'in'], ch.y)); }
    // split cues: the frame with half of x_A's cells, together with the frame with half of x_B's cells (different answers)
    const ch = epi; let np = 0;
    for (let a = 0; a + 1 < ch.length && np < NPART; a += 2) { const A = ch[a], B = ch[a + 1]; if (A.y === B.y) continue; np++;
      const mask = { w: new Set([A.x, B.x]), keep: new Set([...half(A.x), ...half(B.x)]) };
      const cA = cueOf(frame(A.x), mask), cB = cueOf(frame(B.x), mask), cue = { cells: [...new Set([...cA.cells, ...cB.cells])], units: [...new Set([...cA.units, ...cB.units])] };
      const words = ['the', A.x, B.x, 'is', 'in'], cells = run(cue);
      const sa = score(net, cells, words, cue.cells, A.y), cs = new Set(cells), cc = new Set(cue.cells);
      const share = (y) => { const d = cellsOf(net, y).filter(i => !cc.has(i)); return d.length ? d.filter(i => cs.has(i)).length / d.length : 0; };
      const hA = share(A.y) >= 0.5, hB = share(B.y) >= 0.5;
      push(M, 'split: both answers (blend of the two)', hA && hB ? 1 : 0); push(M, 'split: exactly one answer', hA !== hB ? 1 : 0);
      push(M, 'split: neither answer', !hA && !hB ? 1 : 0); push(M, 'split: no word at all', sa.none ? 1 : 0); push(M, 'split: new cells', sa.newCells); }
    push(M, 'probe: work per probe (link reads | segment index hits)', pc.ops / pc.n);
    if (MODE === 'seg') push(M, 'probe: segments checked per probe', pc.checked / pc.n);
    push(M, 'probe: rounds', pc.rounds / pc.n);
  } }
// ---- report ----
console.log(`C73 (from sketch 38)  MODE=${MODE}${MODE === 'seg' ? ` SAMPLE=${SAMPLE} SEGN=${env.SEGN || 16} THETA=${THETA} CAST=${CAST ? 1 : 0} ANNEAL=${ANNEAL}` : ` NORM=${NORM} ETA=${ETA}`}  columns ${N} x ${CPC} cells = ${NCELL}  K=${K} ROUNDS=${ROUNDS}  seeds ${SEEDS.join(',')}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
const keys = Object.keys(out[MS[0]]);
console.log('M (episode objects)'.padEnd(58) + MS.map(M => String(M).padStart(9)).join(''));
const isCount = (k) => /new cells|per event|per probe|stored|rounds|per assembly/.test(k);
for (const k of keys) console.log(k.padEnd(58) + MS.map(M => { const v = mean(out[M][k]); return (isCount(k) ? (v >= 100 ? v.toFixed(0) : v.toFixed(2)) : (100 * v).toFixed(0) + '%').padStart(9); }).join(''));
for (const lv of [LEVEL, 0.5]) { let cap = 0; for (const M of MS) { if (mean(out[M]['episode x -> Y: strict']) >= lv) cap = M; else break; }
  console.log(`capacity (this run's M values): largest M before strict episode recall falls below ${lv * 100}%: ${cap ? cap : '< ' + MS[0]}`); }
for (const M of MS) { const v = out[M]['episode x -> Y: strict'], n = v.length / SEEDS.length;
  console.log(`  per seed, M=${M}, strict episode recall:`, SEEDS.map((_, si) => (100 * mean(v.slice(si * n, (si + 1) * n))).toFixed(0)).join(' ')); }
