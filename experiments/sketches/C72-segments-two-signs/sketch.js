// Sketch 39: segments with two signs (hypothesis 07). Built on sketch 36 (copied here as sketch36-ref.js).
// One kind of segment, two signs, one growth rule:
//   - a cell that should have fired and wasn't cast (under-driven, hot)  -> grows an EXCITATORY segment (sketch 36's rule);
//   - a cell that was cast (the automaton's OWN prediction) and didn't happen (over-driven, hot) -> grows an INHIBITORY segment.
// Both sample SEGN units from everything active, fire as a soft AND (>= THETA of synapses active), strengthen when they fit
// and halve when they misfit, and are pruned below SMIN. Fit for excitatory = its cell happened; for inhibitory = its cell didn't.
//
//   MODE=exc      excitatory segments only (sketch 36)
//        word     excitatory segments + single-word inhibition (sketch 37's rule: every active unit -| a wrongly cast cell)
//        nand     excitatory segments + inhibitory segments on the whole cell ("not when these are together")
//        andnot   excitatory segments + inhibitory segments on one excitatory segment ("for this reason, unless ...")
//        nandug   control: nand without the own-prediction gate (inhibitory segments grow on EVERY outcome cell that
//                 didn't happen, i.e. learnt from the answer)
//   STOP=0|1      growth stop signal from heat: each cell keeps a temperature (running misfit); a hot cell grows a new segment
//                 of either sign only with probability = its temperature. STOP=0 is sketch 36's growth rule.
//   WORLD=a|b  SEGN=8 THETA=0.75  NEV=9000  SEEDS=101..110 (test; seed 1 = development)
'use strict';
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const env = process.env;
const MODE = env.MODE || 'nand', WORLD = env.WORLD || 'b', STOP = env.STOP === '1';
const SEGN = +(env.SEGN || 8), THETA = +(env.THETA || 0.75);
const SEEDS = (env.SEEDS || '101,102,103,104,105,106,107,108,109,110').split(',').map(Number);
const NEV = +(env.NEV || 9000), BLOCK = NEV / 12, TSW = NEV / 2;   // TSW: one exception ends, another begins
// ---- substrate: as sketch 36 (columns on) ----
const NCOL = 120, CPC = 8, NCELL = NCOL * CPC, K = 6, KOWN = 3, KL = K - KOWN;
const COLOFF = NCELL, NUNIT = NCELL + NCOL;
const ETA = 0.2, ETA_D = 0.2, ETA_FIT = 0.02, WMIN = 0.01;
const RW = 0.2, ROUNDS = 3, PUSH2 = 0.25;
const SEG_W = 2, S0 = 0.3, UP = 0.2, DOWN = 0.5, SMIN = 0.1;     // segments, both signs
const ADEC = 0.97, HYST = 1.2;
const ETAI = 0.1, INH_W = SEG_W, UTOK = 2 * K;                   // word mode (sketch 37's rule): one token's full links = one segment
const ALPHA = 0.1;                                               // STOP: temperature = running misfit of the cell
const NAND = MODE === 'nand' || MODE === 'nandug', ANDNOT = MODE === 'andnot', WORD = MODE === 'word';

// ---- worlds: sketch 36's a and b, plus exceptions of four kinds ----
// ind  : one individual breaks its kind's rule (colour x animal x context), from the start (sketch 36's b exceptions)
// ctx  : a colour x context pair overrides the rule for every animal: no single word identifies it
// end  : an individual exception that stops being one at TSW (unlearning)
// late : an individual exception that begins at TSW, when the rule is hard
function makeWorld(r) {
  const W = {};
  W.colours = ['grey', 'black', 'ginger', 'white', 'brown'];
  if (WORLD === 'a') {
    W.animals = ['cat', 'dog', 'bird'];
    W.andCtx = [['bowl', 'full'], ['bowl', 'empty'], ['door', 'shut']];
    W.oneCtx = [[['door', 'open'], 'leaving']];
    W.outs = ['eating', 'sleeping', 'calling', 'hiding', 'leaving'];      // "hiding" added: only exceptions produce it
    const sq = [[0, 2, 1], [1, 0, 2], [2, 1, 0]];
    W.kindRule = (ai, ci) => W.outs[sq[ai][ci]];
    W.exceptions = [
      { kind: 'ind', c: 'ginger', a: 0, x: 0, out: 'hiding', from: 0, to: Infinity },
      { kind: 'ind', c: 'white', a: 1, x: 2, out: 'eating', from: 0, to: Infinity },
      { kind: 'ctx', c: 'black', a: null, x: 1, out: 'leaving', from: 0, to: Infinity },
      { kind: 'end', c: 'brown', a: 2, x: 0, out: 'hiding', from: 0, to: TSW },
      { kind: 'late', c: 'grey', a: 1, x: 1, out: 'hiding', from: TSW, to: Infinity }];
  } else {
    W.animals = ['cat', 'dog', 'bird', 'goat'];
    W.andCtx = [['bowl', 'full'], ['bowl', 'empty'], ['door', 'shut'], ['light', 'off']];
    W.oneCtx = [[['door', 'open'], 'leaving'], [['light', 'on'], 'sleeping']];
    W.outs = ['eating', 'sleeping', 'calling', 'hiding', 'leaving'];
    const sq = [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2]];
    W.kindRule = (ai, ci) => W.outs[sq[ai][ci]];
    W.exceptions = [
      { kind: 'ind', c: 'ginger', a: 0, x: 0, out: 'hiding', from: 0, to: Infinity },
      { kind: 'ind', c: 'white', a: 1, x: 3, out: 'calling', from: 0, to: Infinity },   // sketch 36 had 'eating' here, which IS the dog x light-off rule
      { kind: 'ctx', c: 'black', a: null, x: 1, out: 'leaving', from: 0, to: Infinity },
      { kind: 'end', c: 'brown', a: 2, x: 0, out: 'eating', from: 0, to: TSW },
      { kind: 'late', c: 'grey', a: 3, x: 2, out: 'hiding', from: TSW, to: Infinity }];
  }
  for (const e of W.exceptions) for (let ai = 0; ai < W.animals.length; ai++)   // every exception really breaks the rule
    if ((e.a === null || e.a === ai) && W.kindRule(ai, e.x) === e.out) throw new Error('not an exception: ' + JSON.stringify(e));
  const matchEx = (e, c, ai, ci) => e.c === c && (e.a === null || e.a === ai) && e.x === ci;
  W.exAt = (c, ai, ci, t) => W.exceptions.find((e) => matchEx(e, c, ai, ci) && t >= e.from && t < e.to);
  W.exAny = (c, ai, ci) => W.exceptions.find((e) => matchEx(e, c, ai, ci));
  // the ctx exception's last animal is never shown with it: does "black" + "bowl empty" -> "leaving" transfer to it?
  const ce = W.exceptions.find((e) => e.kind === 'ctx');
  W.heldExc = [{ c: ce.c, ai: W.animals.length - 1, ci: ce.x }];
  // held out (rule only): per animal, 3 (colour, AND-context) combinations, distinct colours, never touching an exception
  W.held = [];
  W.animals.forEach((an, ai) => {
    const cols = W.colours.slice().sort(() => r() - 0.5);
    let n = 0;
    for (const c of cols) { if (n >= 3) break;
      const ci = Math.floor(r() * W.andCtx.length);
      if (W.exAny(c, ai, ci)) continue;
      W.held.push({ c, ai, ci }); n++; }
  });
  W.isHeld = (c, ai, ci) => W.held.some((h) => h.c === c && h.ai === ai && h.ci === ci) || W.heldExc.some((h) => h.c === c && h.ai === ai && h.ci === ci);
  W.outcome = (c, ai, ci, single, t) => {
    if (single !== undefined) return W.oneCtx[single][1];
    const ex = W.exAt(c, ai, ci, t);
    return ex ? ex.out : W.kindRule(ai, ci);
  };
  W.event = (t) => {
    for (;;) {
      const c = W.colours[Math.floor(r() * W.colours.length)], ai = Math.floor(r() * W.animals.length);
      const nctx = W.andCtx.length + W.oneCtx.length, k = Math.floor(r() * nctx);
      if (k >= W.andCtx.length) return { c, ai, single: k - W.andCtx.length, type: 'one' };
      if (W.isHeld(c, ai, k)) continue;
      const ex = W.exAny(c, ai, k);
      return { c, ai, ci: k, type: ex ? ex.kind : 'rule' };
    }
  };
  W.vocab = [...W.colours, ...W.animals, ...new Set([...W.andCtx.flat(), ...W.oneCtx.map((x) => x[0]).flat()]), ...W.outs, '<', '|', '>'];
  return W;
}

// ---- learnt codes on columns (sketch 36, unchanged) ----
function makeCodes(r, W) {
  const C = { own: {}, learnt: {}, aff: {}, cellOf: {}, used: new Int32Array(NCELL) };
  const cols = [...Array(NCOL).keys()];
  for (const t of W.vocab) {
    const sh = cols.slice().sort(() => r() - 0.5);
    C.own[t] = sh.slice(0, KOWN); C.learnt[t] = sh.slice(KOWN, K); C.aff[t] = new Float64Array(NCOL); C.cellOf[t] = {};
  }
  C.code = (t) => [...C.own[t], ...C.learnt[t]];
  C.cell = (t, col) => {
    if (C.cellOf[t][col] === undefined) { let best = col * CPC, bu = 1e9;
      for (let i = 0; i < CPC; i++) { const id = col * CPC + i; if (C.used[id] < bu) { bu = C.used[id]; best = id; } }
      C.cellOf[t][col] = best; C.used[best]++; }
    return C.cellOf[t][col];
  };
  C.cells = (t) => C.code(t).map((col) => C.cell(t, col));
  C.learn = (sent) => {
    for (let i = 1; i < sent.length - 1; i++) {
      const t = sent[i], a = C.aff[t];
      for (let j = 0; j < NCOL; j++) a[j] *= ADEC;
      for (const nb of [sent[i - 1], sent[i + 1]]) for (const col of C.own[nb]) a[col] += 1;
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

// ---- the automaton ----
function makeNet() {
  return { links: new Map(), inner: new Map(), inhW: new Map(), segs: [], temp: new Map(),
    grownE: 0, grownI: 0, cost: { ev: 0, act: 0, linkops: 0, inhops: 0, synchk: 0 } };
}
function activeUnits(C, toks, noise) {
  const A = new Set();
  for (const t of toks) for (const col of C.code(t)) { A.add(C.cell(t, col)); A.add(COLOFF + col); }
  if (noise) for (const u of noise) A.add(u);
  return [...A];
}
const flag = new Uint8Array(NUNIT);
const matchOf = (syn) => { let n = 0; for (const u of syn) n += flag[u]; return n / syn.length; };
function cast(drive, exclude) {
  const best = new Map();
  for (const [c, v] of drive) { if (v <= 0 || exclude.has(c)) continue; const col = (c / CPC) | 0, b = best.get(col);
    if (!b || v > b[1] || (v === b[1] && c < b[0])) best.set(col, [c, v]); }
  return [...best.values()].sort((x, y) => y[1] - x[1] || x[0] - y[0]).slice(0, K).map((x) => x[0]);
}
function predict(net, C, W, A, track) {
  for (const u of A) flag[u] = 1;
  const d1 = new Map(); const add = (c, v) => d1.set(c, (d1.get(c) || 0) + v);
  for (const a of A) { const L = net.links.get(a); if (L) for (const [c, w] of L) { add(c, w / A.length); if (track) net.cost.linkops++; } }
  if (WORD) for (const a of A) { const L = net.inhW.get(a); if (L) for (const [c, w] of L) { add(c, -INH_W * w / UTOK); if (track) net.cost.inhops++; } }
  const fired = [], firedInh = [], firedSub = [];
  for (const sg of net.segs) {
    const f = matchOf(sg.syn); if (track) net.cost.synchk += sg.syn.length;
    if (f < THETA - 1e-9) continue;
    if (sg.sign > 0) {
      let out = SEG_W * sg.s * f;
      if (ANDNOT) for (const sub of sg.inh) {          // sub-segments are checked only when their segment matches
        const fs = matchOf(sub.syn); if (track) net.cost.synchk += sub.syn.length;
        if (fs >= THETA - 1e-9) { out -= SEG_W * sub.s * fs; firedSub.push([sub, sg]); } }
      if (out > 0) { add(sg.cell, out); fired.push(sg); }
    } else { add(sg.cell, -SEG_W * sg.s * f); firedInh.push(sg); }
  }
  for (const u of A) flag[u] = 0;
  const ex = new Set(A.filter((u) => u < NCELL));
  let win = cast(d1, ex);
  for (let r = 1; r < ROUNDS; r++) {
    const d = new Map(); for (const [c, v] of d1) d.set(c, PUSH2 * v);
    for (const w of win) { const L = net.inner.get(w); if (L) for (const [c, v] of L) d.set(c, (d.get(c) || 0) + v / K); }
    const nw = cast(d, ex); if (nw.join() === win.join()) break; win = nw;
  }
  const ws = new Set(win); let bo = null, bn = 1, tie = false;
  for (const o of W.outs) { const n = C.cells(o).filter((c) => ws.has(c)).length; if (n > bn) { bn = n; bo = o; tie = false; } else if (n === bn && n > 1) tie = true; }
  return { out: tie ? null : bo, win, fired, firedInh, firedSub };
}
function learn(net, C, W, A, pr, out, ev, t, stats) {
  const actual = C.cells(out), act = new Set(actual), ws = new Set(pr.win);
  const hot = actual.filter((c) => !ws.has(c)), wrong = pr.win.filter((c) => !act.has(c));
  // plain links and assembly wiring: sketch 36, unchanged
  const upd = (a, c, f) => { let L = net.links.get(a); if (!L) net.links.set(a, (L = new Map())); const w = L.get(c) || 0; L.set(c, w + f * (1 - w)); };
  for (const c of hot) for (const a of A) upd(a, c, ETA);
  for (const c of actual) if (ws.has(c)) for (const a of A) upd(a, c, ETA_FIT);
  for (const c of wrong) for (const a of A) { const L = net.links.get(a); if (!L || !L.has(c)) continue;
    const w = L.get(c) * (1 - ETA_D); if (w < WMIN) L.delete(c); else L.set(c, w); }
  for (const x of actual) { let L = net.inner.get(x); if (!L) net.inner.set(x, (L = new Map()));
    for (const y of actual) if (y !== x) { const w = L.get(y) || 0; L.set(y, w + RW * (1 - w)); } }
  // temperature of every cell involved (actual or cast): running misfit. Used only by STOP.
  const hotSet = new Set(hot), wrongSet = new Set(wrong);
  for (const c of new Set([...actual, ...pr.win])) {
    const T = net.temp.has(c) ? net.temp.get(c) : 1; net.temp.set(c, (1 - ALPHA) * T + ALPHA * (hotSet.has(c) || wrongSet.has(c) ? 1 : 0)); }
  const mayGrow = (c) => !STOP || net.r() < (net.temp.has(c) ? net.temp.get(c) : 1);
  // keep: one rule for both signs. Excitatory fits when its cell happened, inhibitory when its cell didn't.
  const firedOn = new Set(), inhOn = new Set();
  for (const sg of pr.fired) { firedOn.add(sg.cell); if (act.has(sg.cell)) sg.s += UP * (1 - sg.s); else sg.s *= DOWN; }
  for (const sg of pr.firedInh) { inhOn.add(sg.cell); if (!act.has(sg.cell)) sg.s += UP * (1 - sg.s); else sg.s *= DOWN; }
  const subFired = new Set();
  for (const [sub, par] of pr.firedSub) { subFired.add(par); if (!act.has(par.cell)) sub.s += UP * (1 - sub.s); else sub.s *= DOWN; }
  net.segs = net.segs.filter((sg) => sg.s >= SMIN);
  if (ANDNOT) for (const sg of net.segs) if (sg.inh.length) sg.inh = sg.inh.filter((s) => s.s >= SMIN);
  const sample = () => { const pool = A.slice(), syn = [];
    while (syn.length < SEGN && pool.length) syn.push(pool.splice(Math.floor(net.r() * pool.length), 1)[0]); return syn; };
  const bump = (k) => { stats[k] = (stats[k] || 0) + 1; };
  // grow excitatory: a hot cell (should have been cast and wasn't) with no excitatory segment firing for it (sketch 36)
  for (const c of hot) {
    if (firedOn.has(c) || !mayGrow(c)) continue;
    net.segs.push({ sign: 1, cell: c, syn: sample(), s: S0, inh: [], born: t, type: ev.type });
    net.grownE++; bump('grownE ' + ev.type);
  }
  // grow inhibitory: a cell the automaton cast (its own prediction) that didn't happen
  if (NAND) {
    const gate = MODE === 'nandug' ? W.outs.flatMap((o) => C.cells(o)).filter((c) => !act.has(c)) : wrong;   // nandug: from the answer
    for (const c of new Set(gate)) {
      if (inhOn.has(c) || !mayGrow(c)) continue;
      net.segs.push({ sign: -1, cell: c, syn: sample(), s: S0, born: t, type: ev.type });
      net.grownI++; bump('grownI ' + ev.type);
    }
  }
  if (ANDNOT) for (const sg of pr.fired) {       // on each excitatory segment that drove a wrongly cast cell, if no sub-segment fired
    if (!wrongSet.has(sg.cell) || subFired.has(sg) || !mayGrow(sg.cell)) continue;
    sg.inh.push({ syn: sample(), s: S0, born: t, type: ev.type });
    net.grownI++; bump('grownI ' + ev.type);
  }
  if (WORD) {                                    // sketch 37's rule: every active unit -| the wrongly cast cell; hot cells unlearn
    const g = (a) => { let L = net.inhW.get(a); if (!L) net.inhW.set(a, (L = new Map())); return L; };
    for (const c of wrong) for (const a of A) { const L = g(a), w = L.get(c) || 0; if (!w) { net.grownI++; bump('grownI ' + ev.type); } L.set(c, w + ETAI * (1 - w)); }
    for (const c of hot) for (const a of A) { const L = net.inhW.get(a); if (!L || !L.has(c)) continue; const w = L.get(c) - ETAI; if (w <= 1e-9) L.delete(c); else L.set(c, w); }
  }
}
const inhCount = (net) => { if (WORD) { let n = 0; for (const L of net.inhW.values()) n += L.size; return n; }
  if (ANDNOT) return net.segs.reduce((s, sg) => s + (sg.inh ? sg.inh.length : 0), 0);
  return net.segs.filter((s) => s.sign < 0).length; };

// ---- run ----
const tot = {}; const push = (k, v) => { (tot[k] = tot[k] || []).push(v); };
const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
const blocks = NEV / BLOCK;
for (const seed of SEEDS) {
  const W = makeWorld(rng(seed * 7 + 1)), C = makeCodes(rng(seed * 13 + 5), W);
  const net = makeNet(); net.r = rng(seed * 31 + 3);
  const stats = {};
  const mkEv = (c, ai, ci, s, t) => {
    const toks = [c, W.animals[ai], ...(s !== undefined ? W.oneCtx[s][0] : W.andCtx[ci])];
    return { toks, out: W.outcome(c, ai, ci, s, t), c, ai, ci };
  };
  const probe = (ev, mod) => predict(net, C, W, activeUnits(C, mod ? mod.toks : ev.toks, mod && mod.noise), false);
  const lq = {};
  const after = { end: null, late: null }, nAfter = { end: 0, late: 0 };
  for (let t = 0; t < NEV; t++) {
    const e = W.event(t); const ev = mkEv(e.c, e.ai, e.ci, e.single, t); ev.type = e.type;
    const A = activeUnits(C, ev.toks);
    const pr = predict(net, C, W, A, true);
    net.cost.ev++; net.cost.act += A.length;
    const b = Math.floor(t / BLOCK), ok = pr.out === ev.out ? 1 : 0;
    push(`acc ${ev.type} b${b}`, ok); if (t >= NEV * 0.75) (lq[ev.type] = lq[ev.type] || []).push(ok);
    for (const k of ['end', 'late']) if (ev.type === k && t >= TSW) { nAfter[k]++; if (ok && after[k] === null) after[k] = nAfter[k]; }
    learn(net, C, W, A, pr, ev.out, ev, t, stats);
    C.learn(['<', ev.toks[0], ev.toks[1], '|', ev.toks[2], ev.toks[3], ev.out, '>']);
    if ((t + 1) % BLOCK === 0) {
      push(`exc alive b${b}`, net.segs.filter((s) => s.sign > 0).length); push(`inh alive b${b}`, inhCount(net));
      push(`exc new b${b}`, net.grownE - (net.pE || 0)); push(`inh new b${b}`, net.grownI - (net.pI || 0)); net.pE = net.grownE; net.pI = net.grownI;
      push(`held b${b}`, mean(W.held.map((h) => probe(mkEv(h.c, h.ai, h.ci, undefined, t)).out === W.kindRule(h.ai, h.ci) ? 1 : 0)));
    }
  }
  for (const k of ['rule', 'one', 'ind', 'ctx', 'end', 'late']) push(`last quarter (prequential): ${k}`, mean(lq[k] || []));
  push('end: occurrences after the switch until right (99 = never)', after.end ?? 99);
  push('late: occurrences after the switch until right (99 = never)', after.late ?? 99);
  // ---- final tests, learning off, world as it is at the end ----
  const T = NEV; const seen = [], held = [], exByKind = { ind: [], ctx: [], end: [], late: [] }, one = [];
  W.colours.forEach((c) => W.animals.forEach((an, ai) => {
    W.andCtx.forEach((x, ci) => { const ev = mkEv(c, ai, ci, undefined, T);
      if (W.heldExc.some((h) => h.c === c && h.ai === ai && h.ci === ci)) return;
      if (W.held.some((h) => h.c === c && h.ai === ai && h.ci === ci)) { held.push(ev); return; }
      const ex = W.exAny(c, ai, ci); if (ex) exByKind[ex.kind].push(ev); else seen.push(ev); });
    W.oneCtx.forEach((x, s) => one.push(mkEv(c, ai, undefined, s, T)));
  }));
  const acc = (list, mod) => mean(list.map((ev) => probe(ev, mod && mod(ev)).out === ev.out ? 1 : 0));
  if (env.DIAG) for (const ev of [...exByKind.ind, ...exByKind.late]) {    // diagnostic print (dev only): who wins on each exception
    const pr = probe(ev), ws = new Set(pr.win), kr = W.kindRule(ev.ai, ev.ci);
    const cnt = (o) => C.cells(o).filter((c) => ws.has(c)).length, on = (o, L) => L.filter((s) => C.cells(o).includes(s.cell)).map((s) => s.s.toFixed(2)).join(',');
    console.log(`seed ${seed} "${ev.toks.join(' ')}" want "${ev.out}" (${cnt(ev.out)} cells) got "${pr.out}"; kind rule "${kr}" (${cnt(kr)} cells);` +
      ` exc on want [${on(ev.out, pr.fired)}] exc on kind [${on(kr, pr.fired)}] inh on kind [${on(kr, pr.firedInh)}] subs fired ${pr.firedSub.length}`);
  }
  push('exceptions: individual (ind)', acc(exByKind.ind));
  push('exceptions: colour x context, every animal (ctx)', acc(exByKind.ctx));
  push('exceptions: late, began at the switch', acc(exByKind.late));
  push('ended exception now follows the rule', acc(exByKind.end));
  push('ctx exception on its never-seen animal -> exception outcome', acc(W.heldExc.map((h) => mkEv(h.c, h.ai, h.ci, undefined, T))));
  push('rule: seen non-exception combinations', acc(seen));
  push('rule: one input decides', acc(one));
  push('rule: held-out combinations', acc(held));
  // collateral: rule combinations sharing two of (colour, animal, context) with an exception (active or ended); "far" = the rest
  const sh = (ev, e) => [ev.c === e.c, e.a === null || ev.ai === e.a, ev.ci === e.x];
  const nb = { 'colour+animal': [], 'colour+context': [], 'animal+context': [] }, far = [];
  for (const ev of seen) { let any = false;
    for (const e of W.exceptions) { const [a, b, c] = sh(ev, e); if (a + b + c !== 2) continue; any = true;
      if (a && b) nb['colour+animal'].push(ev); else if (a && c) nb['colour+context'].push(ev); else nb['animal+context'].push(ev); }
    if (!any) far.push(ev); }
  for (const k in nb) push(`collateral: neighbours sharing ${k}`, acc([...new Set(nb[k])]));
  push('collateral: far from every exception', acc(far));
  // the exception combination with one word dropped: without the colour the kind rule is the answer
  const exAll = [...exByKind.ind, ...exByKind.late];
  push('ind/late exception, colour dropped -> kind rule', mean(exAll.map((ev) => probe(ev, { toks: ev.toks.slice(1) }).out === W.kindRule(ev.ai, ev.ci) ? 1 : 0)));
  push('ctx exception, animal dropped -> exception outcome', mean(exByKind.ctx.map((ev) => probe(ev, { toks: [ev.toks[0], ...ev.toks.slice(2)] }).out === ev.out ? 1 : 0)));
  push('ctx exception, colour dropped -> kind rule', mean(exByKind.ctx.map((ev) => probe(ev, { toks: ev.toks.slice(1) }).out === W.kindRule(ev.ai, ev.ci) ? 1 : 0)));
  push('rule: seen, colour dropped', acc(seen, (ev) => ({ toks: ev.toks.slice(1) })));
  // populations and cost
  push('excitatory segments alive at end', net.segs.filter((s) => s.sign > 0).length);
  push('inhibitory alive at end (segments, sub-segments or word links)', inhCount(net));
  push('excitatory grown total', net.grownE); push('inhibitory grown total', net.grownI);
  for (const k of ['ind', 'ctx', 'end', 'late', 'rule', 'one']) push(`inhibitory grown on ${k} events`, stats['grownI ' + k] || 0);
  if (NAND || ANDNOT) {
    const inhs = ANDNOT ? net.segs.flatMap((s) => s.inh) : net.segs.filter((s) => s.sign < 0);
    for (const k of ['ind', 'ctx', 'end', 'late', 'rule', 'one']) push(`inhibitory alive at end, grown on ${k} events`, inhs.filter((s) => s.type === k).length);
  }
  push('cost: active units per event', net.cost.act / net.cost.ev); push('cost: link reads per event', net.cost.linkops / net.cost.ev);
  push('cost: inhibitory word-link reads per event', net.cost.inhops / net.cost.ev);
  push('cost: segment synapse checks per event', net.cost.synchk / net.cost.ev);
}
// ---- report ----
console.log(`sketch 39  MODE=${MODE} STOP=${STOP ? 1 : 0} WORLD=${WORLD} SEGN=${SEGN} THETA=${THETA} NEV=${NEV} switch at ${TSW} seeds ${SEEDS.join(',')}`);
const f = (k) => (tot[k] ? mean(tot[k]) : NaN);
const row = (lab, pre) => console.log(lab.padEnd(30) + Array.from({ length: blocks }, (_, b) => { const v = f(`${pre} b${b}`); return isNaN(v) ? '    -' : (v < 10 ? v.toFixed(2) : v.toFixed(0)).padStart(5); }).join(' '));
console.log(`\nby block of ${BLOCK} events (prequential: predict, then learn); the switch is after block ${blocks / 2}`);
row('acc rule events', 'acc rule'); row('acc one-decides', 'acc one'); row('acc ind exceptions', 'acc ind'); row('acc ctx exceptions', 'acc ctx');
row('acc "end" (exc., then rule)', 'acc end'); row('acc "late" (rule, then exc.)', 'acc late'); row('held-out probe (no learn)', 'held');
row('excitatory alive', 'exc alive'); row('inhibitory alive', 'inh alive'); row('excitatory grown in block', 'exc new'); row('inhibitory grown in block', 'inh new');
console.log('\nfinal (learning off), mean over seeds [min..max]');
for (const k in tot) { if (/ b\d+$/.test(k)) continue; const a = tot[k];
  console.log(`  ${k.padEnd(66)} ${mean(a).toFixed(3).padStart(8)}   [${Math.min(...a).toFixed(2)}..${Math.max(...a).toFixed(2)}]`); }
