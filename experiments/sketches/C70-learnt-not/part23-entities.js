// Sketch 37, parts 2 and 3: entities. Built from sketch 27 (copied as sketch27-ref.js) with sketch 26's changeability (sketch26-ref.js).
// ID=none     scenes are split on contradiction (as 27), but nothing is learnt about identity
// ID=count    sketch 27's bookkeeping: minimal-contrast identity evidence per column (reference)
// ID=not      learnt inhibition: when the automaton's OWN pick for a segment turns out to be another entity of the same scene
//             (co-presence contradiction), the segment's input columns grow inhibitory links onto that entity's cells ("when C, not this entity").
//             When an entity is selected while C is active, the inhibition from C onto it weakens.
// ID=ungated  inhibition grown between every co-present pair, whether or not the automaton mistook one for the other
// CHG=1       sketch 26's changeability learnt from confident updates (the lock-in loop). SCENE = scene rate (0 = sketch 26's world).
// BETA        balance (Vogels-style): on every potential link from an active input column to a driven candidate's cells,
//             w += BETA * (selected - RHO0). Applies in every ID mode when BETA > 0.
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const NCOL = 120, C = 32, KOWN = 3, KKIND = 3, K = KOWN + KKIND, FREEZE = 20, ETA = 0.3, MATCHF = 0.8, NEV = 2000, PSAME = 0.2, EPS = 1e-3, GINGER_AT = 1700, IDTH = 0.25, PRE = 300;
const ACHG = 0.1, CHG0 = 0.5, ETAI = 0.5, ETAU = 0.5, RHO0 = 0.5;
const SCENE = +(process.env.SCENE ?? 0.2), ID = process.env.ID || 'not', CHG = process.env.CHG === '1', BETA = +(process.env.BETA ?? 0);
const SEEDS = (process.env.SEEDS ?? '41,42,43,44,45,46,47,48,49,50').split(',').map(Number);
// ---- world (scoring only) — sketch 27's world; SCENE=0 gives sketch 26's distribution ----
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
// ---- substrate (sketch 27) ----
function makeNet(seed) { const r = rng(seed); return { r, own: {}, aff: {}, seen: {}, kind: {}, W: new Map(), owner: new Int32Array(NCOL * C).fill(-1), use: new Float64Array(NCOL * C),
  ex: Float64Array.from({ length: NCOL * C }, () => r()), idn: new Float64Array(NCOL), chg: new Float64Array(NCOL).fill(CHG0), WI: new Map(), WIin: new Map(), ents: [], nextId: 0,
  st: { recruited: 0, changed: new Set(), splits: 0, contra: 0, wiChanged: 0 } }; }
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
// inhibitory links: input column -> entity cell
const wi = (net, c, i) => net.WI.get(c)?.get(i) || 0;
function setwi(net, c, i, x) { x = Math.min(1, Math.max(0, x)); let m = net.WI.get(c); if (!m) net.WI.set(c, m = new Map()); const o = m.get(i) || 0; if (Math.abs(o - x) > EPS) net.st.wiChanged++;
  let r = net.WIin.get(i); if (x < EPS) { m.delete(i); if (r) r.delete(c); } else { m.set(i, x); if (!r) net.WIin.set(i, r = new Set()); r.add(c); } }
function recruit(net, cols, eid) { net.st.recruited += cols.length; return cols.map(c => { let b = -1, bu = Infinity;
  for (let k = 0; k < C; k++) { const i = c * C + k, u = (net.owner[i] >= 0 ? 1e9 : 0) + net.use[i] + net.ex[i] * 1e-3; if (u < bu) { bu = u; b = i; } } net.use[b]++; net.owner[b] = eid; return b; }); }
function release(net, cells) { for (const i of cells) { const m = net.W.get(i); if (m) for (const j of [...m.keys()]) { setw(net, i, j, 0); setw(net, j, i, 0); }
  const r = net.WIin.get(i); if (r) for (const c of [...r]) setwi(net, c, i, 0); net.owner[i] = -1; } }
const allCells = (e) => e.parts.flatMap(p => p.cells);
function hardness(net, e, p) { const o = allCells(e).filter(i => !p.cells.includes(i)); if (!o.length) return 0; let s = 0; for (const i of p.cells) for (const j of o) s += w(net, i, j); return s / (p.cells.length * o.length); }
const idc = (net, c) => net.idn[c] / (net.idn[c] + 1);
const pid = (net, p) => p.cells.reduce((s, i) => s + idc(net, colOf(i)), 0) / p.cells.length;
const pchg = (net, p) => p.cells.reduce((s, i) => s + net.chg[colOf(i)], 0) / p.cells.length;
const inCols = (net, toks) => [...new Set(toks.flatMap(t => colsOf(net, t)))];
// inhibition onto entity e from the input: sum over input columns of the mean link onto e's cells, per token (/K)
function inhib(net, cols, e) { const cs = allCells(e); if (!cs.length) return 0; let s = 0; for (const c of cols) { const m = net.WI.get(c); if (m) for (const i of cs) s += m.get(i) || 0; } return s / cs.length / K; }
const partMatches = (net, p, t) => { const cs = new Set(colsOf(net, t)); return p.cells.filter(i => cs.has(colOf(i))).length >= Math.ceil(MATCHF * p.cells.length); };
function analyse(net, e, toks) { const m = [], miss = [], used = new Set();
  for (const p of e.parts) { const t = toks.find(t => !used.has(t) && partMatches(net, p, t)); if (t) { m.push(p); used.add(t); } else miss.push(p); }
  return { m, miss, unmatched: toks.filter(t => !used.has(t)) }; }
// SELECTION. Base (sketch 27 baseline): >=1 matched, #matched >= #missing. CHG: every missing part changeable (26). ID=count: no missing part identity-bearing (27).
// Learnt NOT: inhibition from the input subtracts from the matched support: rejected unless #matched - I > 0 and >= #missing; I is added to the score (lower better). Ties -> harder matched, lower id.
function select(net, toks, exclude) { const cands = [], driven = [], cols = inCols(net, toks); let blocked = [];
  for (const e of net.ents) { if (exclude && exclude.has(e.id)) continue; const a = analyse(net, e, toks); if (!a.m.length || a.m.length < a.miss.length) continue;
    if (CHG && a.miss.some(p => pchg(net, p) < 0.5)) continue; if (ID === 'count' && a.miss.some(p => pid(net, p) >= IDTH)) continue;
    driven.push(e); const I = inhib(net, cols, e); if (a.m.length - I <= 0 || a.m.length - I < a.miss.length) { blocked.push(e.id); continue; }   // inhibition subtracts from the matched support
    const base = CHG ? a.miss.reduce((s, p) => s + 1 - pchg(net, p), 0) : a.miss.length + (ID === 'count' ? a.miss.reduce((s, p) => s + pid(net, p), 0) : 0);
    cands.push({ e, ...a, I, score: base + I, hm: a.m.reduce((s, p) => s + hardness(net, e, p), 0) }); }
  cands.sort((x, y) => x.score - y.score || y.hm - x.hm || x.e.id - y.e.id);
  return { best: cands[0] || null, tie: cands.length > 1 && Math.abs(cands[0].score - cands[1].score) < 1e-9, driven, blocked, cols }; }
function apply(net, toks, sel) { const best = sel.best; let e, isNew = false, replaced = [], added = [];
  if (!best) { e = { id: net.nextId++, parts: [] }; net.ents.push(e); isNew = true; }
  else { e = best.e; replaced = best.miss; for (const p of best.miss) release(net, p.cells); e.parts = best.m; }
  const unmatched = best ? best.unmatched : toks, covered = new Set(allCells(e).map(colOf));
  for (const t of unmatched) { const cols = colsOf(net, t).filter(c => !covered.has(c)); if (!cols.length) continue; const p = { cells: recruit(net, cols, e.id), label: t }; e.parts.push(p); added.push(p); cols.forEach(c => covered.add(c)); }
  const A = allCells(e); for (const i of A) for (const j of A) if (i !== j) setw(net, i, j, w(net, i, j) + ETA * (1 - w(net, i, j)));
  // CHANGEABILITY (sketch 26): confident update -> replaced/new columns up, kept columns down
  if (CHG && best && replaced.length === 1 && added.length === 1 && !sel.tie) {
    const up = new Set([...replaced[0].cells, ...added[0].cells].map(colOf)), down = new Set(best.m.flatMap(p => p.cells.map(colOf)));
    for (const c of up) net.chg[c] += ACHG * (1 - net.chg[c]); for (const c of down) if (!up.has(c)) net.chg[c] -= ACHG * net.chg[c]; }
  // UNLEARN: e happened while C active -> C -| e weakens (only existing links; kept cells)
  if (ID === 'not' || ID === 'ungated') for (const c of sel.cols) { const m = net.WI.get(c); if (m) for (const i of A) { const x = m.get(i); if (x) setwi(net, c, i, x * (1 - ETAU)); } }
  // BALANCE: driven candidates' cells; selected = active
  if (BETA) for (const d of sel.driven) { const act = d === e ? 1 : 0; for (const c of sel.cols) for (const i of allCells(d)) { const x = wi(net, c, i); if (x || act) setwi(net, c, i, x + BETA * (act - RHO0)); } }
  return { e, isNew, replaced }; }
// learn C -| E on a failed prediction: the automaton picked E for this segment, but E is a different, co-present entity
function learnNot(net, cols, e) { for (const c of cols) for (const i of allCells(e)) setwi(net, c, i, wi(net, c, i) + ETAI * (1 - wi(net, c, i))); }
function coEvidence(net, segs) { if (ID !== 'count') return; for (let a = 0; a < segs.length; a++) for (let b = a + 1; b < segs.length; b++) {
  const A = segs[a], B = segs[b], dA = A.filter(t => !B.includes(t)), dB = B.filter(t => !A.includes(t));
  if (dA.length === 1 && dB.length === 1) for (const t of [...dA, ...dB]) for (const c of colsOf(net, t)) net.idn[c] += 1; } }
function event(net, segsToks) { net.st.changed = new Set(); net.st.wiChanged = 0; const r0 = net.st.recruited; for (const t of segsToks) learnCodes(net, t);
  if (segsToks.length > 1) coEvidence(net, segsToks);
  const claimed = new Map(), out = [];
  for (const toks of segsToks) { const free = select(net, toks, null); let sel = free;
    if (free.best && claimed.has(free.best.e.id)) { net.st.contra++; if (ID === 'not') learnNot(net, free.cols, free.best.e);
      sel = select(net, toks, new Set(claimed.keys())); if (!sel.best) net.st.splits++; }
    const r = apply(net, toks, sel); r.blocked = free.blocked; claimed.set(r.e.id, free.cols); out.push(r); }
  if (ID === 'ungated' && out.length > 1) for (const [a, ca] of claimed) for (const [b] of claimed) if (a !== b) learnNot(net, ca, net.ents.find(e => e.id === b));
  return { out, changed: net.st.changed.size, recruited: net.st.recruited - r0, wiChanged: net.st.wiChanged }; }
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
  for (const x of world(seed + 1000, 0).slice(3, 3 + PRE)) if (x.segs[0].e !== GINGER) learnCodes(net, x.segs[0].toks);
  for (const t of Object.keys(net.aff)) if (!net.kind[t]) net.kind[t] = colsOf(net, t).slice(KOWN);
  const cur = ENTS.map(() => null), hist = ENTS.map(() => []), tags = {};
  const holders = (ei) => net.ents.filter(e => ENTS[ei].every(t => label(e).includes(t)) && label(e).length === 3);
  for (let n = 0; n < ev.length; n++) { const x = ev[n], b = (n / BIN) | 0, isScene = x.segs.length > 1;
    const before = ENTS.map((nm, i) => cur[i] !== null ? get(net, nm) : undefined);
    const preLabels = new Map(net.ents.map(e => [e.id, label(e)])), hadHolder = x.segs.map(s => holders(s.e).map(e => e.id));
    const c0 = net.st.contra, s0 = net.st.splits;
    const R = event(net, x.segs.map(s => s.toks));
    x.segs.forEach((s, k) => { const r = R.out[k], pl = preLabels.get(r.e.id);
      const kind = r.isNew ? (hadHolder[k].length ? 'spurious new' : 'right new') : (pl && ENTS[s.e].every(t => pl.includes(t)) ? 'right update' : 'wrong merge');
      const pre = isScene ? 'scene seg: ' : 'single: '; for (const kk of ['right update', 'right new', 'wrong merge', 'spurious new']) add(pre + kk, +(kind === kk));
      if (!isScene) { addb('single-snapshot wrong entity', b, +(kind === 'wrong merge' || kind === 'spurious new'));
        if (hadHolder[k].length) add('single: an entity holding the right name was blocked by inhibition', +hadHolder[k].some(id => r.blocked.includes(id))); }
      if (x.tag) tags[x.tag] = kind; if (n > GINGER_AT + 2 && s.e === GINGER) add('ginger later sets: right update', +(kind === 'right update')); });
    if (isScene) { add('scene: contradictions (per scene)', net.st.contra - c0); add('scene: splits -> new entity (per scene)', net.st.splits - s0); }
    const q = Math.min(3, (n * 4 / ev.length) | 0); addb('cost active', q, R.out.reduce((s, r) => s + allCells(r.e).length, 0)); addb('cost changed', q, R.changed); addb('cost recruited', q, R.recruited); addb('cost inhibitory links changed', q, R.wiChanged);
    for (const s of x.segs) { if (cur[s.e] !== null && cur[s.e] !== s.v) hist[s.e].push(cur[s.e]); }
    const changedE = x.segs.filter(s => cur[s.e] !== null && cur[s.e] !== s.v).map(s => s.e); for (const s of x.segs) cur[s.e] = s.v;
    const after = ENTS.map((nm, i) => cur[i] !== null ? get(net, nm) : undefined);
    for (const e of changedE) add('changed entity -> new value', +(after[e] === cur[e]));
    for (let o = 0; o < ENTS.length; o++) if (cur[o] !== null) { if (!x.segs.some(s => s.e === o) && before[o] !== undefined) add('other entities unchanged', +(after[o] === before[o]));
      const g = after[o], t = cur[o]; const cat = g === t ? 'correct' : g === null ? 'none' : hist[o].includes(g) ? 'stale' : ENTS.some((_, p) => p !== o && cur[p] === g) ? "other entity's" : 'other';
      for (const c of ['correct', 'stale', "other entity's", 'other', 'none']) { addb('get ' + c, b, +(cat === c)); add('get (whole stream): ' + c, +(cat === c)); } }
    if (x.tag === 'S2' || x.tag === 'E2') { const T = x.tag[0] === 'S' ? 'START' : 'END  ', sec = x.tag === 'S2' ? 1 : GINGER;
      add(`scripted ${T}: 2nd cat ("${ENTS[sec][0]} cat sleeping") created as new`, +(tags[x.tag[0] + '1'] === 'right new')); }
    if (n === ev.length - 1) { for (let o = 0; o < ENTS.length; o++) add('end: true entity held by exactly one automaton entity', +(holders(o).length === 1)); add('end: automaton entities (true 9)', net.ents.length); }
    if ((n + 1) % 500 === 0) { let nl = 0, tw = 0; for (const m of net.WI.values()) for (const v of m.values()) { nl++; tw += v; } addb('inhibitory links (count, at 500/1000/..)', (n + 1) / 500 - 1, nl); addb('inhibitory weight (total)', (n + 1) / 500 - 1, tw); }
  }
  const toks = [...new Set(ENTS.flat().concat(VALS))];
  if (CHG) for (const t of toks) add(`changeability (mean over token columns): ${KINDOF(t)}`, colsOf(net, t).reduce((s, c) => s + net.chg[c], 0) / K);
  // learnt NOT by kind: inhibition from a token onto entities that do NOT hold it, vs onto entities that do
  for (const t of toks) { const cols = colsOf(net, t); for (const e of net.ents) { const own = label(e).includes(t), v = inhib(net, cols, e);
    add(`learnt inhibition from token onto ${own ? 'entities holding it   ' : 'entities not holding it'}: ${KINDOF(t)}`, v); } }
  add('owned cells at end', [...net.owner].filter(o => o >= 0).length);
}
console.log(`parts 2/3 entities  ID=${ID} CHG=${CHG} SCENE=${SCENE} BETA=${BETA} seeds=${SEEDS} events/seed=${NEV}`);
for (const [k, [s, n]] of Object.entries(agg).sort()) if (n) console.log(k.padEnd(72), (s / n).toFixed(3), `(n=${n})`);
for (const [k, a] of Object.entries(bins)) console.log(k.padEnd(40), a.map(x => x ? (x[0] / x[1]).toFixed(k.startsWith('cost') || k.startsWith('inhib') ? 1 : 3) : '-').join(' '));
