// Sketch 26: learning what changes. Snapshot set/get by content, learnt kind codes, learnt per-column changeability.
// Settings fixed before running. Env: SEEDS, KIND=0 (random codes, no kind learning), CHG=0 (no changeability learning: prior 0.5 = sketch-25 majority fallback)
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const NCOL = 120, C = 32, KOWN = 3, KKIND = 3, K = KOWN + KKIND, FREEZE = 20, ETA = 0.3, ACHG = 0.1, CHG0 = 0.5, MATCHF = 0.8, NEV = 2000, PSAME = 0.2, EPS = 1e-3, GINGER_AT = 1700;
const KIND = process.env.KIND !== '0', UNIQ = process.env.UNIQ === '1', PRE = +(process.env.PRE ?? 300), CHG = process.env.CHG !== '0';
const SEEDS = (process.env.SEEDS ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
// ---- world (scoring only; automaton sees token lists) ----
const ENTS = [['grey', 'cat'], ['black', 'cat'], ['white', 'cat'], ['grey', 'dog'], ['black', 'dog'], ['brown', 'dog'], ['white', 'bird'], ['black', 'bird'], ['ginger', 'cat']];
const GINGER = 8, VALS = ['sleeping', 'walking', 'eating', 'awake', 'running', 'sitting'];
const KINDOF = t => ['grey', 'black', 'white', 'brown', 'ginger'].includes(t) ? 'colour' : ['cat', 'dog', 'bird'].includes(t) ? 'animal' : 'activity';
function world(seed) { const r = rng(seed * 7 + 1), ev = [], cur = ENTS.map(() => null);
  const push = (e, v, tag) => { ev.push({ e, v, tag, toks: [...ENTS[e], v] }); cur[e] = v; };
  push(0, 'sleeping', 'S0'); push(1, 'sleeping', 'S1'); push(0, 'walking', 'S2');           // scripted start (no experience)
  while (ev.length < NEV) { const n = ev.length;
    if (n === GINGER_AT) { push(0, 'sleeping', 'E0'); push(GINGER, 'sleeping', 'E1'); push(0, 'walking', 'E2'); continue; } // scripted end, ginger = held-out new entity
    const pool = n < GINGER_AT ? 8 : 9, e = (r() * pool) | 0;
    const v = (cur[e] && r() < PSAME) ? cur[e] : VALS.filter(x => x !== cur[e])[(r() * (VALS.length - (cur[e] ? 1 : 0))) | 0]; push(e, v); }
  return ev; }
// ---- substrate ----
function makeNet(seed) { const r = rng(seed); return { r, own: {}, aff: {}, seen: {}, kind: {}, W: new Map(), owner: new Int32Array(NCOL * C).fill(-1), use: new Float64Array(NCOL * C),
  ex: Float64Array.from({ length: NCOL * C }, () => r()), chg: new Float64Array(NCOL).fill(CHG0), ents: [], nextId: 0, st: { recruited: 0, changed: new Set() } }; }
const colOf = (i) => (i / C) | 0;
function ownOf(net, t) { if (!net.own[t]) { const s = new Set(); while (s.size < KOWN) s.add((net.r() * NCOL) | 0); net.own[t] = [...s]; } return net.own[t]; }
function colsOf(net, t) { const o = ownOf(net, t); let k = net.kind[t];
  if (!k) { const a = net.aff[t]; k = a ? [...a.entries()].filter(([c]) => !o.includes(c)).sort((p, q) => q[1] - p[1] || p[0] - q[0]).slice(0, KKIND).map(e => e[0]) : [];
    if (!KIND) { if (!net.kind_r) net.kind_r = {}; if (!net.kind_r[t]) { const s = new Set(); while (s.size < KKIND) { const c = (net.r() * NCOL) | 0; if (!o.includes(c)) s.add(c); } net.kind_r[t] = [...s]; } k = net.kind_r[t]; } }
  return [...o, ...k]; }
// learnt kind codes (sketch-19 style, simplified): affinity of a token to its neighbours' current columns, salted by side; top KKIND columns; frozen after FREEZE occurrences
function learnCodes(net, toks) { if (!KIND) return; for (let i = 0; i < toks.length; i++) { const t = toks[i]; if (net.kind[t]) continue; const a = net.aff[t] || (net.aff[t] = new Map());
  for (const [j, side] of [[i - 1, 0], [i + 1, 1]]) if (j >= 0 && j < toks.length) for (const c of colsOf(net, toks[j])) { const cc = (c + 17 + side * 36) % NCOL; /* bug fix: left side was unsalted */ a.set(cc, (a.get(cc) || 0) + 1); }
  net.seen[t] = (net.seen[t] || 0) + 1; if (net.seen[t] >= FREEZE) net.kind[t] = colsOf(net, t).slice(KOWN); } }
const w = (net, i, j) => net.W.get(i)?.get(j) || 0;
function setw(net, i, j, x) { let m = net.W.get(i); if (!m) net.W.set(i, m = new Map()); const o = m.get(j) || 0; if (Math.abs(o - x) > EPS) { net.st.changed.add(i); net.st.changed.add(j); } if (x === 0) m.delete(j); else m.set(j, x); }
function recruit(net, cols, eid) { net.st.recruited += cols.length; return cols.map(c => { let b = -1, bu = Infinity;
  for (let k = 0; k < C; k++) { const i = c * C + k, u = (net.owner[i] >= 0 ? 1e9 : 0) + net.use[i] + net.ex[i] * 1e-3; if (u < bu) { bu = u; b = i; } } net.use[b]++; net.owner[b] = eid; return b; }); }
function release(net, cells) { for (const i of cells) { const m = net.W.get(i); if (m) for (const j of [...m.keys()]) { setw(net, i, j, 0); setw(net, j, i, 0); } net.owner[i] = -1; } }
const allCells = (e) => e.parts.flatMap(p => p.cells);
function hardness(net, e, p) { const o = allCells(e).filter(i => !p.cells.includes(i)); if (!o.length) return 0; let s = 0; for (const i of p.cells) for (const j of o) s += w(net, i, j); return s / (p.cells.length * o.length); }
const pchg = (net, p) => p.cells.reduce((s, i) => s + net.chg[colOf(i)], 0) / p.cells.length;
// a part is matched by a token if >= MATCHF of its cells lie in that token's columns
const partMatches = (net, p, t) => { const cs = new Set(colsOf(net, t)); return p.cells.filter(i => cs.has(colOf(i))).length >= Math.ceil(MATCHF * p.cells.length); };
function analyse(net, e, toks) { const m = [], miss = [], used = new Set();
  for (const p of e.parts) { const t = toks.find(t => !used.has(t) && partMatches(net, p, t)); if (t) { m.push(p); used.add(t); } else miss.push(p); }
  return { m, miss, unmatched: toks.filter(t => !used.has(t)) }; }
// SELECTION: acceptable if >=1 matched, #matched >= #missing, and every missing part is changeable (chg >= 0.5).
// Score = sum over missing (1 - chg) (lower better); ties -> larger matched hardness. With chg at its prior 0.5 this is sketch 25's majority fallback.
function select(net, toks) { const cands = [];
  for (const e of net.ents) { const a = analyse(net, e, toks); if (!a.m.length || a.m.length < a.miss.length) continue; if (a.miss.some(p => pchg(net, p) < 0.5)) continue;
    cands.push({ e, ...a, score: a.miss.reduce((s, p) => s + 1 - pchg(net, p), 0), hm: a.m.reduce((s, p) => s + hardness(net, e, p), 0) }); }
  cands.sort((x, y) => x.score - y.score || y.hm - x.hm || x.e.id - y.e.id); return { best: cands[0] || null, tie: UNIQ ? cands.length > 1 : cands.length > 1 && Math.abs(cands[0].score - cands[1].score) < 1e-9 }; }
function set(net, toks) { net.st.changed = new Set(); const r0 = net.st.recruited; learnCodes(net, toks);
  const { best, tie } = select(net, toks); let e, isNew = false, replaced = [];
  if (!best) { e = { id: net.nextId++, parts: [] }; net.ents.push(e); isNew = true; }
  else { e = best.e; replaced = best.miss; for (const p of best.miss) release(net, p.cells); e.parts = best.m; }
  const unmatched = best ? best.unmatched : toks, added = [];
  const covered = new Set(allCells(e).map(colOf));
  for (const t of unmatched) { const cols = colsOf(net, t).filter(c => !covered.has(c)); if (!cols.length) continue; const p = { cells: recruit(net, cols, e.id), label: t }; e.parts.push(p); added.push(p); cols.forEach(c => covered.add(c)); }
  const A = allCells(e); for (const i of A) for (const j of A) if (i !== j) setw(net, i, j, w(net, i, j) + ETA * (1 - w(net, i, j)));
  // CHANGEABILITY: on a confident update (existing entity, exactly one part replaced, no tie) replaced/new columns go up, kept columns go down
  if (CHG && best && replaced.length === 1 && added.length === 1 && !tie) {
    const up = new Set([...replaced[0].cells, ...added[0].cells].map(colOf)), down = new Set(best.m.flatMap(p => p.cells.map(colOf)));
    for (const c of up) net.chg[c] += ACHG * (1 - net.chg[c]); for (const c of down) if (!up.has(c)) net.chg[c] -= ACHG * net.chg[c]; }
  return { e, isNew, replacedLabels: replaced.map(p => p.label), active: A.length, changed: net.st.changed.size, recruited: net.st.recruited - r0 }; }
// GET: entity whose parts match every cue token (ties -> harder); hold cue cells, one winner per non-cue column by summed input; read value (scoring vocab)
function get(net, cue) { let best = null, bh = -1;
  for (const e of net.ents) { const a = analyse(net, e, cue); if (a.unmatched.length) continue; const h = a.m.reduce((s, p) => s + hardness(net, e, p), 0); if (h > bh) { bh = h; best = { e, ...a }; } }
  if (!best) return null; const held = best.m.flatMap(p => p.cells), cueCols = new Set(cue.flatMap(t => colsOf(net, t))), inp = new Map();
  for (const i of held) { const m = net.W.get(i); if (m) for (const [j, x] of m) if (!held.includes(j)) inp.set(j, (inp.get(j) || 0) + x); }
  const bc = new Map(); for (const [j, x] of inp) { const c = colOf(j); if (cueCols.has(c)) continue; const b = bc.get(c); if (!b || x > b[1]) bc.set(c, [j, x]); }
  const out = [...bc.values()].map(b => b[0]); let v = null, bo = 0;
  for (const t of VALS) { const tc = new Set(colsOf(net, t)); const o = out.filter(i => tc.has(colOf(i))).length; if (o > bo) { bo = o; v = t; } }
  return bo >= Math.ceil(MATCHF * K) - 1 ? v : null; }
// ---- run ----
const agg = {}, add = (k, x, n = 1) => { agg[k] = agg[k] || [0, 0]; agg[k][0] += x; agg[k][1] += n; };
const BIN = 250, bins = {}; const addb = (k, b, x) => { const a = bins[k] = bins[k] || []; a[b] = a[b] || [0, 0]; a[b][0] += x; a[b][1]++; };
const label = (e) => e.parts.map(p => p.label);
for (const seed of SEEDS) { const net = makeNet(seed), ev = world(seed); for (const x of world(seed + 1000).slice(3, 3 + PRE)) if (ENTS.indexOf(ENTS[x.e]) !== GINGER) learnCodes(net, x.toks); for (const t of Object.keys(net.aff)) if (KIND && !net.kind[t]) net.kind[t] = colsOf(net, t).slice(KOWN);
  const _u = 0, cur = ENTS.map(() => null), hist = ENTS.map(() => []);
  const holders = (ei) => net.ents.filter(e => ENTS[ei].every(t => label(e).includes(t)) && label(e).length === 3);
  let mergeLog = []; const tags = {};
  for (let n = 0; n < ev.length; n++) { const x = ev[n], b = (n / BIN) | 0, name = ENTS[x.e], prev = cur[x.e];
    const before = ENTS.map((nm, i) => cur[i] !== null ? get(net, nm) : undefined);
    const preLabels = new Map(net.ents.map(e => [e.id, label(e)])); const hadHolder = holders(x.e).length > 0;
    const r = set(net, x.toks); const pl = preLabels.get(r.e.id);
    const kind = r.isNew ? (hadHolder ? 'spurious new' : 'right new') : (name.every(t => pl.includes(t)) ? 'right update' : 'wrong merge');
    for (const k of ['right update', 'right new', 'wrong merge', 'spurious new']) add('set: ' + k, +(kind === k));
    addb('wrong entity (merge or spurious new)', b, +(kind === 'wrong merge' || kind === 'spurious new'));
    if (kind === 'wrong merge') { add('wrong merges replacing an animal/colour (not activity)', +r.replacedLabels.some(l => KINDOF(l) !== 'activity')); mergeLog.push(n); }
    if (x.tag) tags[x.tag] = kind;
    const q = Math.min(3, (n * 4 / ev.length) | 0); for (const [k, v] of [['active', r.active], ['changed', r.changed], ['recruited', r.recruited]]) addb('cost ' + k, q, v);
    if (prev !== null && prev !== x.v) hist[x.e].push(prev); cur[x.e] = x.v;
    const after = ENTS.map((nm, i) => cur[i] !== null ? get(net, nm) : undefined);
    if (prev !== null && prev !== x.v) { add('T: changed entity -> new value', +(after[x.e] === x.v)); for (let o = 0; o < ENTS.length; o++) if (o !== x.e && cur[o] !== null) add('T: other entities unchanged', +(after[o] === before[o])); }
    for (let o = 0; o < ENTS.length; o++) if (cur[o] !== null) { const g = after[o], t = cur[o]; const cat = g === t ? 'correct' : g === null ? 'none' : hist[o].includes(g) ? 'stale' : ENTS.some((_, p) => p !== o && cur[p] === g) ? "other entity's" : 'other';
      for (const c of ['correct', 'stale', "other entity's", 'other', 'none']) addb('get ' + c, b, +(cat === c)); }
    if (x.tag === 'S2' || x.tag === 'E2') { const g0 = after[0], g1 = after[x.tag === 'S2' ? 1 : GINGER], sec = x.tag === 'S2' ? 'black' : 'ginger';
      add(`scripted ${x.tag[0] === 'S' ? 'START' : 'END  '}: grey cat -> "walking"`, +(g0 === 'walking')); add(`scripted ${x.tag[0] === 'S' ? 'START' : 'END  '}: ${sec} cat still "sleeping"`, +(g1 === 'sleeping'));
      add(`scripted ${x.tag[0] === 'S' ? 'START' : 'END  '}: 2nd cat created as new entity`, +(tags[x.tag[0] + '1'] === 'right new')); }
    if (n > GINGER_AT + 2 && x.e === GINGER) add('ginger (held-out) later sets: right update', +(kind === 'right update'));
    if (n === ev.length - 1) { for (let o = 0; o < ENTS.length; o++) add('end: true entity held by exactly one automaton entity', +(holders(o).length === 1)); add('end: automaton entities (true 9)', net.ents.length); }
  }
  // merges corrected? for each wrong merge, was the overwritten entity re-created (held again) later?
  // changeability per kind, kind-code overlap
  const toks = [...new Set(ENTS.flat().concat(VALS))];
  for (const t of toks) add(`changeability (mean over token columns): ${KINDOF(t)}`, colsOf(net, t).reduce((s, c) => s + net.chg[c], 0) / K);
  const ov = (a, c) => a.filter(i => c.includes(i)).length; for (const t of toks) for (const u of toks) if (t < u) add(`code overlap ${[KINDOF(t), KINDOF(u)].sort().join('x')} (of ${K})`, ov(colsOf(net, t), colsOf(net, u)));
  const gc = holders(0)[0], bc = holders(1)[0]; if (gc && bc) add('grey/black cat: shared cells', ov(allCells(gc), allCells(bc)));
  add('owned cells at end', [...net.owner].filter(o => o >= 0).length);
}
console.log(`UNIQ=${UNIQ} PRE=${PRE} KIND=${KIND} CHG=${CHG} seeds=${SEEDS} events/seed=${NEV}`);
for (const [k, [s, n]] of Object.entries(agg).sort()) if (n) console.log(k.padEnd(62), (s / n).toFixed(3), `(n=${n})`);
for (const [k, a] of Object.entries(bins)) console.log(k.padEnd(40), a.map(x => x ? (x[0] / x[1]).toFixed(k.startsWith('cost') ? 1 : 3) : '-').join(' '));
