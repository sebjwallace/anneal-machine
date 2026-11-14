// Sketch 27: identity from co-presence. Sketch 26 baseline (learnt kind codes + warm-up, strict 80% match, NO changeability-from-self).
// New: scenes with 2-3 entities (segments separated by "."); co-present segments must be different entities.
// Evidence (independent of selection): for each co-present pair, if they differ in exactly ONE token each ("minimal contrast"),
// the columns of those two tokens gain identity evidence. Selection rejects an entity if any missing part is identity-bearing.
// Settings fixed before running. Env: SEEDS, SCENE (rate, default 0.2), IDL=0 (no identity learning; scenes still split), CREDIT=share (literal variant)
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const NCOL = 120, C = 32, KOWN = 3, KKIND = 3, K = KOWN + KKIND, FREEZE = 20, ETA = 0.3, MATCHF = 0.8, NEV = 2000, PSAME = 0.2, EPS = 1e-3, GINGER_AT = 1700, IDTH = 0.25, PRE = 300;
const NEG = process.env.NEG === '1', SCENE = +(process.env.SCENE ?? 0.2), IDL = process.env.IDL !== '0', CREDIT = process.env.CREDIT || 'minimal';
const SEEDS = (process.env.SEEDS ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
// ---- world (scoring only) ----
const ENTS = [['grey', 'cat'], ['black', 'cat'], ['white', 'cat'], ['grey', 'dog'], ['black', 'dog'], ['brown', 'dog'], ['white', 'bird'], ['black', 'bird'], ['ginger', 'cat']];
const GINGER = 8, VALS = ['sleeping', 'walking', 'eating', 'awake', 'running', 'sitting'];
const KINDOF = t => ['grey', 'black', 'white', 'brown', 'ginger'].includes(t) ? 'colour' : ['cat', 'dog', 'bird'].includes(t) ? 'animal' : 'activity';
function world(seed, scene = SCENE) { const r = rng(seed * 7 + 1), ev = [], cur = ENTS.map(() => null);
  const nv = (e) => (cur[e] && r() < PSAME) ? cur[e] : VALS.filter(x => x !== cur[e])[(r() * (VALS.length - (cur[e] ? 1 : 0))) | 0];
  const one = (e, v, tag) => { cur[e] = v; ev.push({ tag, segs: [{ e, v, toks: [...ENTS[e], v] }] }); };
  one(0, 'sleeping', 'S0'); one(1, 'sleeping', 'S1'); one(0, 'walking', 'S2');
  while (ev.length < NEV) { const n = ev.length, pool = n < GINGER_AT ? 8 : 9;
    if (n === GINGER_AT) { one(0, 'sleeping', 'E0'); one(GINGER, 'sleeping', 'E1'); one(0, 'walking', 'E2'); continue; }
    if (r() < scene) { const m = r() < 0.7 ? 2 : 3, es = []; while (es.length < m) { const e = (r() * pool) | 0; if (!es.includes(e)) es.push(e); }
      ev.push({ segs: es.map(e => { const v = nv(e); cur[e] = v; return { e, v, toks: [...ENTS[e], v] }; }) }); }
    else { const e = (r() * pool) | 0; one(e, nv(e)); } }
  return ev; }
// ---- substrate (from sketch 26) ----
function makeNet(seed) { const r = rng(seed); return { r, own: {}, aff: {}, seen: {}, kind: {}, W: new Map(), owner: new Int32Array(NCOL * C).fill(-1), use: new Float64Array(NCOL * C),
  ex: Float64Array.from({ length: NCOL * C }, () => r()), idn: new Float64Array(NCOL), neg: new Float64Array(NCOL), ents: [], nextId: 0, st: { recruited: 0, changed: new Set(), splits: 0, contra: 0 } }; }
const colOf = (i) => (i / C) | 0;
function ownOf(net, t) { if (!net.own[t]) { const s = new Set(); while (s.size < KOWN) s.add((net.r() * NCOL) | 0); net.own[t] = [...s]; } return net.own[t]; }
function colsOf(net, t) { const o = ownOf(net, t); let k = net.kind[t];
  if (!k) { const a = net.aff[t]; k = a ? [...a.entries()].filter(([c]) => !o.includes(c)).sort((p, q) => q[1] - p[1] || p[0] - q[0]).slice(0, KKIND).map(e => e[0]) : []; }
  return [...o, ...k]; }
function learnCodes(net, toks) { for (let i = 0; i < toks.length; i++) { const t = toks[i]; if (net.kind[t]) continue; const a = net.aff[t] || (net.aff[t] = new Map());
  for (const [j, side] of [[i - 1, 0], [i + 1, 1]]) if (j >= 0 && j < toks.length) for (const c of colsOf(net, toks[j])) { const cc = (c + 17 + side * 36) % NCOL; a.set(cc, (a.get(cc) || 0) + 1); }
  net.seen[t] = (net.seen[t] || 0) + 1; if (net.seen[t] >= FREEZE) net.kind[t] = colsOf(net, t).slice(KOWN); } }
const w = (net, i, j) => net.W.get(i)?.get(j) || 0;
function setw(net, i, j, x) { let m = net.W.get(i); if (!m) net.W.set(i, m = new Map()); const o = m.get(j) || 0; if (Math.abs(o - x) > EPS) { net.st.changed.add(i); net.st.changed.add(j); } if (x === 0) m.delete(j); else m.set(j, x); }
function recruit(net, cols, eid) { net.st.recruited += cols.length; return cols.map(c => { let b = -1, bu = Infinity;
  for (let k = 0; k < C; k++) { const i = c * C + k, u = (net.owner[i] >= 0 ? 1e9 : 0) + net.use[i] + net.ex[i] * 1e-3; if (u < bu) { bu = u; b = i; } } net.use[b]++; net.owner[b] = eid; return b; }); }
function release(net, cells) { for (const i of cells) { const m = net.W.get(i); if (m) for (const j of [...m.keys()]) { setw(net, i, j, 0); setw(net, j, i, 0); } net.owner[i] = -1; } }
const allCells = (e) => e.parts.flatMap(p => p.cells);
function hardness(net, e, p) { const o = allCells(e).filter(i => !p.cells.includes(i)); if (!o.length) return 0; let s = 0; for (const i of p.cells) for (const j of o) s += w(net, i, j); return s / (p.cells.length * o.length); }
const idc = (net, c) => NEG ? net.idn[c] / (net.idn[c] + net.neg[c] + 1) : net.idn[c] / (net.idn[c] + 1);            // identity of a column, saturating in evidence
const pid = (net, p) => p.cells.reduce((s, i) => s + idc(net, colOf(i)), 0) / p.cells.length;
const tid = (net, t) => colsOf(net, t).reduce((s, c) => s + idc(net, c), 0) / K;
const partMatches = (net, p, t) => { const cs = new Set(colsOf(net, t)); return p.cells.filter(i => cs.has(colOf(i))).length >= Math.ceil(MATCHF * p.cells.length); };
function analyse(net, e, toks) { const m = [], miss = [], used = new Set();
  for (const p of e.parts) { const t = toks.find(t => !used.has(t) && partMatches(net, p, t)); if (t) { m.push(p); used.add(t); } else miss.push(p); }
  return { m, miss, unmatched: toks.filter(t => !used.has(t)) }; }
// SELECTION: >=1 matched, #matched >= #missing, no missing part identity-bearing (pid >= IDTH). Score = #missing + sum pid(missing); ties -> harder matched.
function select(net, toks, exclude) { const cands = [];
  for (const e of net.ents) { if (exclude && exclude.has(e.id)) continue; const a = analyse(net, e, toks); if (!a.m.length || a.m.length < a.miss.length) continue;
    if (a.miss.some(p => pid(net, p) >= IDTH)) continue;
    cands.push({ e, ...a, score: a.miss.length + a.miss.reduce((s, p) => s + pid(net, p), 0), hm: a.m.reduce((s, p) => s + hardness(net, e, p), 0) }); }
  cands.sort((x, y) => x.score - y.score || y.hm - x.hm || x.e.id - y.e.id); return cands[0] || null; }
function apply(net, toks, best) { let e, isNew = false, replaced = [];
  if (!best) { e = { id: net.nextId++, parts: [] }; net.ents.push(e); isNew = true; }
  else { e = best.e; replaced = best.miss; for (const p of best.miss) release(net, p.cells); e.parts = best.m; }
  const unmatched = best ? best.unmatched : toks, covered = new Set(allCells(e).map(colOf));
  for (const t of unmatched) { const cols = colsOf(net, t).filter(c => !covered.has(c)); if (!cols.length) continue; e.parts.push({ cells: recruit(net, cols, e.id), label: t }); cols.forEach(c => covered.add(c)); }
  const A = allCells(e); for (const i of A) for (const j of A) if (i !== j) setw(net, i, j, w(net, i, j) + ETA * (1 - w(net, i, j)));
  return { e, isNew, replaced }; }
// co-presence evidence: from the scene's tokens alone (never from selection)
function coEvidence(net, segs) { if (!IDL) return; for (let a = 0; a < segs.length; a++) for (let b = a + 1; b < segs.length; b++) {
  const A = segs[a], B = segs[b], dA = A.filter(t => !B.includes(t)), dB = B.filter(t => !A.includes(t)), d = [...dA, ...dB];
  if (CREDIT === 'minimal') { if (dA.length === 1 && dB.length === 1) { for (const t of d) for (const c of colsOf(net, t)) net.idn[c] += 1;
    if (NEG) { const dc = new Set(d.flatMap(t => colsOf(net, t))); for (const t of A.filter(t => B.includes(t))) for (const c of colsOf(net, t)) if (!dc.has(c)) net.neg[c] += 1; } } }
  else for (const t of d) for (const c of colsOf(net, t)) net.idn[c] += 1 / d.length; } }
// process one event (single snapshot or scene); segments must go to distinct entities
function event(net, segsToks) { net.st.changed = new Set(); const r0 = net.st.recruited; for (const t of segsToks) learnCodes(net, t);
  if (segsToks.length > 1) coEvidence(net, segsToks);
  const claimed = new Set(), out = [];
  for (const toks of segsToks) { const free = select(net, toks, null); let best = free;
    if (free && claimed.has(free.e.id)) { net.st.contra++; best = select(net, toks, claimed); if (!best) net.st.splits++; }
    const r = apply(net, toks, best); claimed.add(r.e.id); out.push(r); }
  return { out, changed: net.st.changed.size, recruited: net.st.recruited - r0 }; }
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
for (const seed of SEEDS) { const net = makeNet(seed), ev = world(seed);
  for (const x of world(seed + 1000, 0).slice(3, 3 + PRE)) if (x.segs[0].e !== GINGER) learnCodes(net, x.segs[0].toks);   // warm-up: kind codes only
  for (const t of Object.keys(net.aff)) if (!net.kind[t]) net.kind[t] = colsOf(net, t).slice(KOWN);
  const cur = ENTS.map(() => null), hist = ENTS.map(() => []), tags = {};
  const holders = (ei) => net.ents.filter(e => ENTS[ei].every(t => label(e).includes(t)) && label(e).length === 3);
  for (let n = 0; n < ev.length; n++) { const x = ev[n], b = (n / BIN) | 0, isScene = x.segs.length > 1;
    const before = ENTS.map((nm, i) => cur[i] !== null ? get(net, nm) : undefined);
    const preLabels = new Map(net.ents.map(e => [e.id, label(e)])), hadHolder = x.segs.map(s => holders(s.e).length > 0);
    const c0 = net.st.contra, s0 = net.st.splits;
    const R = event(net, x.segs.map(s => s.toks));
    x.segs.forEach((s, k) => { const r = R.out[k], pl = preLabels.get(r.e.id);
      const kind = r.isNew ? (hadHolder[k] ? 'spurious new' : 'right new') : (pl && ENTS[s.e].every(t => pl.includes(t)) ? 'right update' : 'wrong merge');
      const pre = isScene ? 'scene seg: ' : 'single: '; for (const kk of ['right update', 'right new', 'wrong merge', 'spurious new']) add(pre + kk, +(kind === kk));
      if (!isScene) addb('single-snapshot wrong entity', b, +(kind === 'wrong merge' || kind === 'spurious new'));
      if (x.tag) tags[x.tag] = kind; if (n > GINGER_AT + 2 && s.e === GINGER) add('ginger later sets: right update', +(kind === 'right update')); });
    addb('scenes', b, +isScene); if (isScene) { add('scene: contradictions (per scene)', net.st.contra - c0); add('scene: splits -> new entity (per scene)', net.st.splits - s0); }
    const q = Math.min(3, (n * 4 / ev.length) | 0); addb('cost active', q, R.out.reduce((s, r) => s + allCells(r.e).length, 0)); addb('cost changed', q, R.changed); addb('cost recruited', q, R.recruited);
    for (const s of x.segs) { if (cur[s.e] !== null && cur[s.e] !== s.v) hist[s.e].push(cur[s.e]); }
    const changedE = x.segs.filter(s => cur[s.e] !== null && cur[s.e] !== s.v).map(s => s.e); for (const s of x.segs) cur[s.e] = s.v;
    const after = ENTS.map((nm, i) => cur[i] !== null ? get(net, nm) : undefined);
    for (const e of changedE) add('changed entity -> new value', +(after[e] === cur[e]));
    for (let o = 0; o < ENTS.length; o++) if (cur[o] !== null) { if (!x.segs.some(s => s.e === o) && before[o] !== undefined) add('other entities unchanged', +(after[o] === before[o]));
      const g = after[o], t = cur[o]; const cat = g === t ? 'correct' : g === null ? 'none' : hist[o].includes(g) ? 'stale' : ENTS.some((_, p) => p !== o && cur[p] === g) ? "other entity's" : 'other';
      for (const c of ['correct', 'stale', "other entity's", 'other', 'none']) addb('get ' + c, b, +(cat === c)); }
    if (x.tag === 'S2' || x.tag === 'E2') { const T = x.tag[0] === 'S' ? 'START' : 'END  ', sec = x.tag === 'S2' ? 1 : GINGER;
      add(`scripted ${T}: 2nd cat ("${ENTS[sec][0]} cat sleeping") created as new`, +(tags[x.tag[0] + '1'] === 'right new'));
      add(`scripted ${T}: get grey cat -> "walking"`, +(after[0] === 'walking')); add(`scripted ${T}: get ${ENTS[sec][0]} cat -> "sleeping"`, +(after[sec] === 'sleeping')); }
    if (n === ev.length - 1) { for (let o = 0; o < ENTS.length; o++) add('end: true entity held by exactly one automaton entity', +(holders(o).length === 1)); add('end: automaton entities (true 9)', net.ents.length); }
  }
  for (const t of [...new Set(ENTS.flat().concat(VALS))]) add(`learnt identity (per token, mean over columns): ${KINDOF(t)}${t === 'ginger' ? ' (ginger)' : ''}`, tid(net, t));
  add('identity-bearing tokens (tid >= IDTH): activity', VALS.filter(t => tid(net, t) >= IDTH).length / VALS.length);
  add('identity-bearing tokens (tid >= IDTH): colour+animal', ['grey', 'black', 'white', 'brown', 'cat', 'dog', 'bird'].filter(t => tid(net, t) >= IDTH).length / 7);
  add('end: grey/black cat shared cells', (() => { const g = holders(0)[0], k = holders(1)[0]; return g && k ? allCells(g).filter(i => allCells(k).includes(i)).length : 0; })());
  add('owned cells at end', [...net.owner].filter(o => o >= 0).length);
}
console.log(`NEG=${NEG} SCENE=${SCENE} IDL=${IDL} CREDIT=${CREDIT} seeds=${SEEDS} events/seed=${NEV}`);
for (const [k, [s, n]] of Object.entries(agg).sort()) if (n) console.log(k.padEnd(66), (s / n).toFixed(3), `(n=${n})`);
for (const [k, a] of Object.entries(bins)) console.log(k.padEnd(32), a.map(x => x ? (x[0] / x[1]).toFixed(k.startsWith('cost') ? 1 : 3) : '-').join(' '));
