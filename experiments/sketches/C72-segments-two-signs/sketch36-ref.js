// Sketch 36: AND as learnt segments (hypothesis 04).
// A cell can grow SEGMENTS: small sets of presynaptic units that fire together as a soft AND (>= THETA of its synapses
// active). Grown only when the cell is hot (it should have been driven and wasn't), sampled from ALL units active then.
// A segment that fires and its cell fits strengthens; one that fires and misfits weakens and goes. Several segments on a
// cell = OR of ANDs. Compared with plain links (OR only) and the hashed-pair shortcut (sketch 20c's conjunctive pool).
//
//   MODE=plain|hash|hashtok|seg   (default seg)   WORLD=a|b (default a)
//   SEGN=8 THETA=0.75 (segment size / soft-AND threshold)   COLS=1 (column units presynaptic as well as cells)
//   SEEDS=101,...,110 (test; seed 1 = development)   NEV=3000 events per seed
'use strict';
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const env = process.env;
const MODE = env.MODE || 'seg', WORLD = env.WORLD || 'a', COLS = env.COLS !== '0';
const SEGN = +(env.SEGN || 8), THETA = +(env.THETA || 0.75);
const SEEDS = (env.SEEDS || '101,102,103,104,105,106,107,108,109,110').split(',').map(Number);
const NEV = +(env.NEV || 3000), BLOCK = NEV / 12;   // always 12 blocks
// ---- substrate (fixed before running) ----
const NCOL = 120, CPC = 8, NCELL = NCOL * CPC, K = 6, KOWN = 3, KL = K - KOWN;
const POOL = 4000, HASHK = 8;                       // hashed-pair shortcut: each pair -> 8 units of a separate pool
const COLOFF = NCELL, HOFF = NCELL + NCOL, NUNIT = HOFF + POOL;
const ETA = 0.2, ETA_D = 0.2, ETA_FIT = 0.02, WMIN = 0.01;   // plain links: hot cells strengthen, wrong winners weaken
const RW = 0.2, ROUNDS = 3, PUSH2 = 0.25;                    // internal (assembly) wiring and settling
const SEG_W = 2, S0 = 0.3, UP = 0.2, DOWN = 0.5, SMIN = 0.1; // segments
const ADEC = 0.97, HYST = 1.2;                              // learnt codes: affinity decay, switching margin

// ---- worlds ----
function makeWorld(r) {
  const pick = (a) => a[Math.floor(r() * a.length)];
  const W = {};
  if (WORLD === 'a') {
    W.colours = ['grey', 'black', 'ginger', 'white', 'brown'];
    W.animals = ['cat', 'dog', 'bird'];
    W.andCtx = [['bowl', 'full'], ['bowl', 'empty'], ['door', 'shut']];
    W.oneCtx = [[['door', 'open'], 'leaving']];
    W.outs = ['eating', 'sleeping', 'calling', 'leaving'];
    const sq = [[0, 2, 1], [1, 0, 2], [2, 1, 0]];          // Latin square: animal x context -> outcome
    W.kindRule = (ai, ci) => W.outs[sq[ai][ci]];
    W.exceptions = [];
  } else {
    W.colours = ['grey', 'black', 'ginger', 'white', 'brown'];
    W.animals = ['cat', 'dog', 'bird', 'goat'];
    W.andCtx = [['bowl', 'full'], ['bowl', 'empty'], ['door', 'shut'], ['light', 'off']];
    W.oneCtx = [[['door', 'open'], 'leaving'], [['light', 'on'], 'sleeping']];
    W.outs = ['eating', 'sleeping', 'calling', 'hiding', 'leaving'];
    const sq = [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2]];
    W.kindRule = (ai, ci) => W.outs[sq[ai][ci]];
    // two individual exceptions: a three-way combination overrides the kind rule
    W.exceptions = [{ c: 'ginger', a: 0, x: 0, out: 'hiding' }, { c: 'white', a: 1, x: 3, out: 'eating' }];
  }
  // held out: per animal, 3 (colour, AND-context) combinations, distinct colours, never an exception
  W.held = [];
  W.animals.forEach((an, ai) => {
    const cols = W.colours.slice().sort(() => r() - 0.5);
    let n = 0;
    for (const c of cols) { if (n >= 3) break;
      const ci = Math.floor(r() * W.andCtx.length);
      if (W.exceptions.some((e) => e.c === c && e.a === ai && e.x === ci)) continue;
      W.held.push({ c, ai, ci }); n++; }
  });
  W.isHeld = (c, ai, ci) => W.held.some((h) => h.c === c && h.ai === ai && h.ci === ci);
  W.outcome = (c, ai, ci, single) => {
    if (single !== undefined) return W.oneCtx[single][1];
    const ex = W.exceptions.find((e) => e.c === c && e.a === ai && e.x === ci);
    return ex ? ex.out : W.kindRule(ai, ci);
  };
  W.event = () => {                          // training stream: held-out combinations never appear
    for (;;) {
      const c = pick(W.colours), ai = Math.floor(r() * W.animals.length);
      const nctx = W.andCtx.length + W.oneCtx.length, k = Math.floor(r() * nctx);
      if (k >= W.andCtx.length) { const s = k - W.andCtx.length;
        return { c, ai, ci: -1, single: s, toks: [c, W.animals[ai], ...W.oneCtx[s][0]], out: W.outcome(c, ai, -1, s), type: 'one' }; }
      if (W.isHeld(c, ai, k)) continue;
      const ex = W.exceptions.some((e) => e.c === c && e.a === ai && e.x === k);
      return { c, ai, ci: k, toks: [c, W.animals[ai], ...W.andCtx[k]], out: W.outcome(c, ai, k), type: ex ? 'exc' : 'and' };
    }
  };
  W.vocab = [...W.colours, ...W.animals, ...new Set([...W.andCtx.flat(), ...W.oneCtx.map((x) => x[0]).flat()]), ...W.outs, '<', '|', '>'];
  return W;
}

// ---- learnt codes on columns: KOWN own random columns + KL columns learnt from neighbours; one cell per (token, column) ----
function makeCodes(r, W) {
  const C = { own: {}, learnt: {}, aff: {}, cellOf: {}, used: new Int32Array(NCELL) };
  const cols = [...Array(NCOL).keys()];
  for (const t of W.vocab) {
    const sh = cols.slice().sort(() => r() - 0.5);
    C.own[t] = sh.slice(0, KOWN); C.learnt[t] = sh.slice(KOWN, K); C.aff[t] = new Float64Array(NCOL); C.cellOf[t] = {};
  }
  C.code = (t) => [...C.own[t], ...C.learnt[t]];
  C.cell = (t, col) => {                                    // claim the least-used cell in that column, once
    if (C.cellOf[t][col] === undefined) { let best = col * CPC, bu = 1e9;
      for (let i = 0; i < CPC; i++) { const id = col * CPC + i; if (C.used[id] < bu) { bu = C.used[id]; best = id; } }
      C.cellOf[t][col] = best; C.used[best]++; }
    return C.cellOf[t][col];
  };
  C.cells = (t) => C.code(t).map((col) => C.cell(t, col));
  C.learn = (sent) => {                                     // sent: ['<', tokens..., '>'] neighbours define usage
    for (let i = 1; i < sent.length - 1; i++) {
      const t = sent[i], a = C.aff[t];
      for (let j = 0; j < NCOL; j++) a[j] *= ADEC;
      for (const nb of [sent[i - 1], sent[i + 1]]) for (const col of C.own[nb]) a[col] += 1;
      // replace the weakest learnt column by the strongest candidate only if clearly better (hysteresis)
      const own = new Set(C.own[t]);
      for (let rep = 0; rep < KL; rep++) {
        const L = C.learnt[t]; let wi = 0; for (let k = 1; k < L.length; k++) if (a[L[k]] < a[L[wi]]) wi = k;
        let bc = -1, bv = -1; for (let col = 0; col < NCOL; col++) if (!own.has(col) && !L.includes(col) && a[col] > bv) { bv = a[col]; bc = col; }
        if (bc >= 0 && bv > HYST * a[L[wi]] + 1e-9) L[wi] = bc; else break;
      }
    }
  };
  return C;
}

function hashUnits(str) {
  let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  const r = rng(h >>> 0), s = new Set(); while (s.size < HASHK) s.add(HOFF + Math.floor(r() * POOL)); return [...s];
}

// ---- the automaton ----
function makeNet() {
  return { links: new Map(), inner: new Map(), segs: [], grown: 0, cost: { ev: 0, act: 0, linkops: 0, synchk: 0, segs: 0 } };
}
function activeUnits(C, toks, extra, noise) {
  const A = new Set();
  for (const t of toks) for (const col of C.code(t)) { A.add(C.cell(t, col)); if (COLS) A.add(COLOFF + col); }
  if (noise) for (const u of noise) A.add(u);
  if (MODE === 'hash' && extra) for (const u of hashUnits(itemOf(toks, extra))) A.add(u);
  if (MODE === 'hashtok') for (let i = 0; i < toks.length; i++) for (let j = i + 1; j < toks.length; j++) {
    const p = [toks[i], toks[j]].sort().join('+'); for (const u of hashUnits(p)) A.add(u); }
  return [...A];
}
// the hashed item pair is (entity phrase x context phrase), built from the tokens actually present
const itemOf = (toks, ev) => toks.filter((t) => ev.toks.indexOf(t) < 2 && ev.toks.includes(t)).join(' ') + '#' + toks.filter((t) => !(ev.toks.indexOf(t) < 2 && ev.toks.includes(t))).join(' ');
const flag = new Uint8Array(NUNIT);
function cast(drive, exclude) {
  const best = new Map();                                   // column -> [cell, value]
  for (const [c, v] of drive) { if (v <= 0 || exclude.has(c)) continue; const col = (c / CPC) | 0, b = best.get(col);
    if (!b || v > b[1] || (v === b[1] && c < b[0])) best.set(col, [c, v]); }
  return [...best.values()].sort((x, y) => y[1] - x[1] || x[0] - y[0]).slice(0, K).map((x) => x[0]);
}
function predict(net, C, W, A, track) {
  for (const u of A) flag[u] = 1;
  const d1 = new Map(); const add = (m, c, v) => m.set(c, (m.get(c) || 0) + v);
  for (const a of A) { const L = net.links.get(a); if (L) for (const [c, w] of L) { add(d1, c, w / A.length); if (track) net.cost.linkops++; } }
  const fired = [];
  if (MODE === 'seg') for (const sg of net.segs) {
    let n = 0; for (const u of sg.syn) n += flag[u]; if (track) net.cost.synchk += sg.syn.length;
    const f = n / sg.syn.length; if (f >= THETA - 1e-9) { fired.push(sg); add(d1, sg.cell, SEG_W * sg.s * f); }
  }
  for (const u of A) flag[u] = 0;
  const ex = new Set(A.filter((u) => u < NCELL));
  let win = cast(d1, ex);
  for (let r = 1; r < ROUNDS; r++) {
    const d = new Map(); for (const [c, v] of d1) d.set(c, PUSH2 * v);
    for (const w of win) { const L = net.inner.get(w); if (L) for (const [c, v] of L) add(d, c, v / K); }
    const nw = cast(d, ex); if (nw.join() === win.join()) break; win = nw;
  }
  // read out: the outcome whose assembly holds most winners (>= 2, no tie)
  const ws = new Set(win); let bo = null, bn = 1, tie = false;
  for (const o of W.outs) { const n = C.cells(o).filter((c) => ws.has(c)).length; if (n > bn) { bn = n; bo = o; tie = false; } else if (n === bn && n > 1) tie = true; }
  return { out: tie ? null : bo, win, fired };
}
function learn(net, C, A, pr, out, ev, t, stats) {
  const actual = C.cells(out), act = new Set(actual), ws = new Set(pr.win);
  const hot = actual.filter((c) => !ws.has(c)), wrong = pr.win.filter((c) => !act.has(c));
  const upd = (a, c, f) => { let L = net.links.get(a); if (!L) net.links.set(a, (L = new Map())); const w = L.get(c) || 0; L.set(c, w + f * (1 - w)); };
  for (const c of hot) for (const a of A) upd(a, c, ETA);
  for (const c of actual) if (ws.has(c)) for (const a of A) upd(a, c, ETA_FIT);
  for (const c of wrong) for (const a of A) { const L = net.links.get(a); if (!L || !L.has(c)) continue;
    const w = L.get(c) * (1 - ETA_D); if (w < WMIN) L.delete(c); else L.set(c, w); }
  for (const x of actual) { let L = net.inner.get(x); if (!L) net.inner.set(x, (L = new Map()));
    for (const y of actual) if (y !== x) { const w = L.get(y) || 0; L.set(y, w + RW * (1 - w)); } }
  if (MODE !== 'seg') return;
  const firedOn = new Set();
  for (const sg of pr.fired) { firedOn.add(sg.cell);
    if (act.has(sg.cell)) { sg.s += UP * (1 - sg.s); sg.fits++; } else { sg.s *= DOWN; sg.misfits++; } }
  net.segs = net.segs.filter((sg) => sg.s >= SMIN);
  for (const c of hot) {
    if (firedOn.has(c)) continue;                        // a segment already fired for it: strengthening is its job
    const pool = A.slice(), syn = [];
    while (syn.length < SEGN && pool.length) syn.push(pool.splice(Math.floor(net.r() * pool.length), 1)[0]);
    net.segs.push({ cell: c, syn, s: S0, born: t, combo: ev.key, kind: ev.kindKey, type: ev.type, fits: 0, misfits: 0 });
    net.grown++; stats.grownType[ev.type] = (stats.grownType[ev.type] || 0) + 1;
  }
}

// ---- run ----
const tot = {}; const push = (k, v) => { (tot[k] = tot[k] || []).push(v); };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const blocks = NEV / BLOCK;
for (const seed of SEEDS) {
  const r = rng(seed), W = makeWorld(rng(seed * 7 + 1)), C = makeCodes(rng(seed * 13 + 5), W);
  const net = makeNet(); net.r = rng(seed * 31 + 3);
  const keyOf = (c, ai, ci, s) => `${c} ${W.animals[ai]}|${s !== undefined ? W.oneCtx[s][0].join(' ') : W.andCtx[ci].join(' ')}`;
  const stats = { grownType: {} };
  const mkEv = (c, ai, ci, s) => {
    const toks = [c, W.animals[ai], ...(s !== undefined ? W.oneCtx[s][0] : W.andCtx[ci])];
    return { toks, out: W.outcome(c, ai, ci, s), key: keyOf(c, ai, ci, s), item: `${c} ${W.animals[ai]}#${toks.slice(2).join(' ')}`,
      kindKey: s !== undefined ? 'one:' + s : `${ai}x${ci}` };
  };
  const probe = (ev, mod) => { const A = activeUnits(C, mod ? mod.toks : ev.toks, ev, mod && mod.noise); return predict(net, C, W, A, false); };
  // single-input ceilings measured on the stream
  const cnt = {}; const tally = (k, o) => { cnt[k] = cnt[k] || {}; cnt[k][o] = (cnt[k][o] || 0) + 1; };
  const andEvents = [];
  for (let t = 0; t < NEV; t++) {
    const e = W.event(); const ev = mkEv(e.c, e.ai, e.ci >= 0 ? e.ci : undefined, e.single); ev.type = e.type;
    const A = activeUnits(C, ev.toks, ev);
    const pr = predict(net, C, W, A, true);
    net.cost.ev++; net.cost.act += A.length; net.cost.segs += net.segs.length;
    const b = Math.floor(t / BLOCK);
    push(`acc ${ev.type} b${b}`, pr.out === ev.out ? 1 : 0);
    if (ev.type !== 'one') { andEvents.push(ev); ev.toks.forEach((tk, i) => tally(i + ':' + tk, ev.out)); tally('pair:' + ev.toks[1] + ev.toks[3], ev.out); }
    learn(net, C, A, pr, ev.out, ev, t, stats);
    C.learn(['<', ev.toks[0], ev.toks[1], '|', ev.toks[2], ev.toks[3], ev.out, '>']);
    if ((t + 1) % BLOCK === 0) {
      push(`segs alive b${b}`, net.segs.length); push(`segs grown b${b}`, net.grown); push(`segs new b${b}`, net.grown - (net.grownPrev || 0)); net.grownPrev = net.grown;
      const hp = W.held.map((h) => probe(mkEv(h.c, h.ai, h.ci)).out === W.outcome(h.c, h.ai, h.ci) ? 1 : 0);
      push(`held b${b}`, mean(hp));
    }
  }
  // ceilings: majority outcome per single token position / per (animal, state) pair, on combination events
  const ceil = (pre) => { let ok = 0, n = 0; for (const k in cnt) if (k.startsWith(pre)) { const v = Object.values(cnt[k]); ok += Math.max(...v); n += v.reduce((x, y) => x + y, 0); } return ok / n; };
  push('ceiling colour', ceil('0:')); push('ceiling animal', ceil('1:')); push('ceiling object', ceil('2:')); push('ceiling state', ceil('3:')); push('ceiling animal+state', ceil('pair:'));
  // ---- final tests, learning off ----
  const seen = [], held = [], exc = [], one = [];
  W.colours.forEach((c) => W.animals.forEach((an, ai) => {
    W.andCtx.forEach((x, ci) => { const ev = mkEv(c, ai, ci); if (W.isHeld(c, ai, ci)) held.push(ev);
      else if (W.exceptions.some((e) => e.c === c && e.a === ai && e.x === ci)) exc.push(ev); else seen.push(ev); });
    W.oneCtx.forEach((x, s) => one.push(mkEv(c, ai, undefined, s)));
  }));
  const accOn = (list, mod) => mean(list.map((ev) => probe(ev, mod && mod(ev)).out === ev.out ? 1 : 0));
  push('final seen', accOn(seen)); push('final held-out', accOn(held)); push('final one-decides', accOn(one));
  if (exc.length) push('final exceptions', accOn(exc));
  // a held-out combination's kind-mates: the same animal x context with other colours, for "would a fresh lookup know?"
  const otherTok = (ev, i) => W.vocab.filter((v) => !['<', '|', '>'].includes(v) && !W.outs.includes(v) && !ev.toks.includes(v));
  const noiseUnits = (n) => { const u = []; for (let i = 0; i < n; i++) { const col = Math.floor(r() * NCOL); u.push(col * CPC + Math.floor(r() * CPC)); if (COLS) u.push(COLOFF + col); } return u; };
  const names = ['colour', 'animal', 'object', 'state'];   // order of ev.toks
  for (let i = 0; i < 4; i++) {
    push(`drop ${names[i]}`, accOn(seen, (ev) => ({ toks: ev.toks.filter((_, j) => j !== i) })));
    push(`noise ${names[i]}`, accOn(seen, (ev) => ({ toks: ev.toks.filter((_, j) => j !== i), noise: noiseUnits(K) })));
  }
  push('extra token', accOn(seen, (ev) => { const o = otherTok(ev); return { toks: [...ev.toks, o[Math.floor(r() * o.length)]] }; }));
  // segment-level measures
  if (MODE === 'seg') {
    const firesRight = (ev, mod) => { const pr = probe(ev, mod); const cs = new Set(C.cells(ev.out));
      return [pr.fired.some((sg) => cs.has(sg.cell)) ? 1 : 0, pr.fired.some((sg) => !cs.has(sg.cell)) ? 1 : 0, pr.fired]; };
    let hf = [], hw = [], src = [];
    for (const ev of held) { const [a, b, fired] = firesRight(ev); hf.push(a); hw.push(b);
      const cs = new Set(C.cells(ev.out)); const right = fired.filter((sg) => cs.has(sg.cell));
      if (right.length) src.push(mean(right.map((sg) => sg.kind === ev.kindKey ? 1 : 0))); }
    push('held: a right-outcome segment fires', mean(hf)); push('held: a wrong-outcome segment fires', mean(hw));
    if (src.length) push('held: firing right segments grown on the same animal x context', mean(src));
    const sf = [], sw = []; for (const ev of seen) { const [a, b] = firesRight(ev); sf.push(a); sw.push(b); }
    push('seen: right segment fires', mean(sf)); push('seen: wrong segment fires', mean(sw));
    for (let i = 0; i < 4; i++) { const f = seen.map((ev) => firesRight(ev, { toks: ev.toks.filter((_, j) => j !== i) })[0]); push(`drop ${names[i]}: right segment fires`, mean(f)); }
    // economy
    const nOutCells = W.outs.length * K;
    push('segments alive at end', net.segs.length); push('segments grown total', net.grown);
    push('alive per outcome cell', net.segs.length / nOutCells);
    const kinds = {}; for (const sg of net.segs) if (sg.type !== 'one') kinds[sg.kind] = (kinds[sg.kind] || 0) + 1;
    const nKind = W.animals.length * W.andCtx.length;
    push('alive per animal x context, per cell', Object.values(kinds).reduce((x, y) => x + y, 0) / nKind / K);
    push('alive grown on one-decides events', net.segs.filter((sg) => sg.type === 'one').length);
    push('grown on combination events', (stats.grownType.and || 0) + (stats.grownType.exc || 0));
    push('grown on one-decides events', stats.grownType.one || 0);
    push('grown per combination event seen', ((stats.grownType.and || 0) + (stats.grownType.exc || 0)) / andEvents.length);
    push('mean strength alive', net.segs.length ? mean(net.segs.map((s) => s.s)) : 0);
    push('alive segments: share of synapses on column units', net.segs.length ? mean(net.segs.map((s) => mean(s.syn.map((u) => u >= COLOFF && u < HOFF ? 1 : 0)))) : 0);
  }
  // code overlaps (columns shared) within / across kinds
  const ov = (a, b) => C.code(a).filter((x) => C.code(b).includes(x)).length;
  const pairs = (L) => { const v = []; for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) v.push(ov(L[i], L[j])); return mean(v); };
  push('columns shared: colours', pairs(W.colours)); push('columns shared: animals', pairs(W.animals));
  push('columns shared: bowl states', ov('full', 'empty')); push('columns shared: colour vs animal', mean(W.colours.map((c) => ov(c, 'cat'))));
  const cellsShared = (a, b) => C.cells(a).filter((x) => C.cells(b).includes(x)).length;
  push('cells shared: full vs empty', cellsShared('full', 'empty'));
  // cost
  push('cost: active units per event', net.cost.act / net.cost.ev); push('cost: link reads per event', net.cost.linkops / net.cost.ev);
  push('cost: segment synapse checks per event', net.cost.synchk / net.cost.ev); push('cost: segments alive (mean over events)', net.cost.segs / net.cost.ev);
  let nl = 0; for (const L of net.links.values()) nl += L.size; push('links at end', nl);
}
// ---- report ----
console.log(`sketch 36  MODE=${MODE} WORLD=${WORLD} SEGN=${SEGN} THETA=${THETA} COLS=${COLS ? 1 : 0} NEV=${NEV} seeds ${SEEDS.join(',')}`);
const f = (k) => (tot[k] ? mean(tot[k]) : NaN);
const row = (lab, pre) => console.log(lab.padEnd(26) + Array.from({ length: blocks }, (_, b) => { const v = f(`${pre} b${b}`); return isNaN(v) ? '   -' : (v < 10 ? v.toFixed(2) : v.toFixed(0)).padStart(5); }).join(' '));
console.log(`\nby block of ${BLOCK} events (prequential: predict, then learn)`);
row('acc combination events', 'acc and'); if (WORLD === 'b') row('acc exception events', 'acc exc'); row('acc one-decides events', 'acc one');
row('held-out probe (no learn)', 'held'); if (MODE === 'seg') { row('segments alive', 'segs alive'); row('segments grown (cum.)', 'segs grown'); row('segments grown in block', 'segs new'); }
console.log('\nfinal (learning off), mean over seeds [min..max]');
for (const k in tot) { if (/ b\d+$/.test(k)) continue; const a = tot[k];
  console.log(`  ${k.padEnd(58)} ${mean(a).toFixed(3).padStart(8)}   [${Math.min(...a).toFixed(2)}..${Math.max(...a).toFixed(2)}]`); }
