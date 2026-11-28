// C166 · An arrival from competition. Read hypothesis.md first. C165's circuit and arms, with the arrival made two ways:
// "code" (C165: the fixed machinery notices a phase 5 with no units digit and switches Stalled on) and "competition"
// (the clock's step after phase 5 has two alternatives, carrying on and Stalled; the found digit backs carrying on, and
// Stalled is backed by the phase alone, so it wins only when nothing is found; no code looks for absence).
// (C165's description follows.)
// C165 · A hand-over on an arrival.
//
// A small circuit, written for this test from C163's circuit (same places, rows, clock and write rule), with:
//   - frames held by their own running: each part is kept on by the clock's phases, and fades when the clock stops;
//   - a Stalled cell, switched on by the fixed machinery when a step reaches phase 5 with no units digit;
//   - a procedure cell P, held, whose one hand-over gate (P, Stalled, a sparse sample of frame A's parts) opens a
//     hand-over cell, which brings on frame B and starts the clock (the extra moment lets A's parts fade first);
//   - a copying family of facts (Ι: a digit gives itself) for frame B.
// Everything between giving the cue and reading the page is the engine's. Run: node handover.js > out.txt

'use strict';

const { Memory, GATE, TRANSITION } = require('./engine');
const { fact, PLACES, NP, MOVES, ROWS, COLS, at } = require('./circuit');

const P_ = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const SYMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+'];
const LINKS = { '+': 'Σ' };
// frame A: the reading frame (adds right to left, carrying the sign along)
const A = { name: 'A', reads: [P_(-2, 0), P_(-1, 0), P_(-3, 0)], s: P_(1, 0), u: P_(0, 0), k: P_(-3, -1), w: P_(1, -1), mv: 0 };
// frame B: walks back right, copying the answer digit one place to its right onto the row below; family fixed (copying)
const B = { name: 'B', reads: [P_(0, 1), P_(0, 1), P_(0, 1)], fam: 'Ι', u: P_(2, 1), k: P_(3, 1), mv: 1 };
const PHASES = ['Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5', 'Φ6'];

function partsOf(f) {
  return [`${f.name}:RA${f.reads[0]}`, `${f.name}:RB${f.reads[1]}`, `${f.name}:RK${f.reads[2]}`, ...(f.s !== undefined ? [`${f.name}:RS${f.s}`] : []),
    `${f.name}:WU${f.u}`, `${f.name}:WK${f.k}`, ...(f.w !== undefined ? [`${f.name}:WS${f.w}`] : []), ...(f.fam ? [`${f.name}:${f.fam}`] : []), `${f.name}:GO${MOVES[f.mv]}`];
}

// arm: 'procedure' | 'none' | 'no-sample'
function build(arm, arrival) {
  const m = new Memory();
  const frames = [A, B];
  const pops = ['=', 'P', 'Stalled', 'Handover', ...PHASES, 'Σ', 'Ι', 'S+'];
  for (let c = 0; c < COLS; c++) pops.push('F' + c);
  for (const f of frames) pops.push(...partsOf(f));
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`); for (const x of SYMS) pops.push(`X${r}_${c}=${x}`); }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d, 'T' + d);
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);

  // the cue starts frame A (and, if the procedure is held, P); P holds itself
  for (const x of partsOf(A)) gate(['='], x);
  gate(['='], 'Φ1');
  if (arm !== 'none') { gate(['='], 'P'); gate(['P'], 'P'); }
  // frames held by their own running: each part kept on while the clock runs
  for (const f of frames) for (const x of partsOf(f)) for (const ph of PHASES) gate([x, ph], x);
  // the clock
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  if (arrival === 'competition') {
    // the clock's step after phase 5, as two alternatives (what follows phase 5): carrying on, or Stalled. Stalled is
    // backed by phase 5 alone; carrying on by phase 5 and a found units digit, so it has more support whenever one is found
    m.form(TRANSITION, [id('Φ5'), id('Φ6')]);
    m.form(TRANSITION, [id('Φ5'), id('Stalled')]);
    gate(['Φ5'], 'Stalled');
  }
  // the hand-over: P, Stalled and a sparse sample of A's parts (two of them) open Handover, which brings on B
  const sample = arm === 'no-sample' ? [] : [`A:RA${A.reads[0]}`, `A:WK${A.k}`];
  if (arm !== 'none') gate(['P', 'Stalled', ...sample], 'Handover');
  for (const x of partsOf(B)) gate(['Handover'], x);
  gate(['Handover'], 'Φ1');
  // the focus: held while the clock runs, moved by each frame's move, and kept where it is through a stall and hand-over
  for (let c = 0; c < COLS; c++) {
    for (const ph of PHASES.slice(0, 5)) gate(['F' + c, ph], 'F' + c);
    gate(['F' + c, '='], 'F' + c);
    gate(['F' + c, 'Stalled'], 'F' + c);
    gate(['F' + c, 'Handover'], 'F' + c);
    for (const f of frames) {
      const go = `${f.name}:GO${MOVES[f.mv]}`, to = c + (f.mv === 0 ? -1 : 1);
      if (to >= 0 && to < COLS) gate(['Φ6', 'F' + c, go], 'F' + to);
    }
  }
  // reading, routing, writing: per frame, per column, per place
  for (const f of frames) for (let c = 0; c < COLS; c++) for (let p = 0; p < NP; p++) {
    const rc = at(c, p); if (!rc) continue;
    const [r, cc] = rc, part = (x) => `${f.name}:${x}${p}`;
    ['RA', 'RB', 'RK'].forEach((R, i) => {
      if (f.reads[i] !== p) return;
      gate(['Φ1', 'F' + c, part(R)], `Att${r}_${cc}`);
      for (let d = 0; d < 10; d++) gate(['Φ3', 'F' + c, part(R), `X${r}_${cc}=${d}`], R.slice(1) + d);
    });
    if (f.s === p) {
      gate(['Φ1', 'F' + c, part('RS')], `Att${r}_${cc}`);
      gate(['Φ3', 'F' + c, part('RS'), `X${r}_${cc}=+`], LINKS['+']);
      gate(['Φ3', 'F' + c, part('RS'), `X${r}_${cc}=+`], 'S+');
    }
    if (f.u === p) gate(['Φ4', 'F' + c, part('WU')], `WPU${r}_${cc}`);
    if (f.k === p) gate(['Φ4', 'F' + c, part('WK')], `WPK${r}_${cc}`);
    if (f.w === p) gate(['Φ4', 'F' + c, part('WS')], `WPS${r}_${cc}`);
  }
  gate(['S+', 'Φ4'], 'S+');
  // frame B's family is one of its parts
  gate([`B:Ι`, 'Φ3'], 'Ι');
  // the facts
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact('Σ', a, b, k);
    gate(['Σ', 'A' + a, 'B' + b, 'K' + k], 'U' + f.u);
    gate(['Σ', 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }
  for (let a = 0; a < 10; a++) gate(['Ι', 'A' + a], 'U' + a); // copying: a digit gives itself (no carry)

  const content = new Map();
  const write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`], `X${r}_${c}=${x}`); return true; };
  const log = { stalls: [], handovers: 0 };
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 10; t++) if (on.has('T' + t)) write(+mt[1], +mt[2], t);
      mt = /^WPS(\d+)_(\d+)$/.exec(n);
      if (mt && on.has('S+')) write(+mt[1], +mt[2], '+');
    }
    // the arrival. "code": the fixed machinery notices a phase 5 with no units digit and switches Stalled on (C165).
    // "competition": nothing is switched on here; Stalled comes on by itself, and is only recorded.
    const stalledNow = arrival === 'code' ? on.has('Φ5') && ![...Array(10).keys()].some((d) => on.has('U' + d)) : on.has('Stalled');
    if (stalledNow) {
      if (arrival === 'code') mem.active.add(id('Stalled'));
      const focus = [...on].find((n) => /^F\d+$/.test(n));
      log.stalls.push({ moment: mem.moment, focus: focus ? +focus.slice(1) : null, frame: [...on].some((n) => n.startsWith('A:')) ? 'A' : [...on].some((n) => n.startsWith('B:')) ? 'B' : '?' });
    }
    if (on.has('Handover')) log.handovers++;
  }];
  return { m, write, content, log };
}

function run(arm, arrival, top, bottom, edge, limit) {
  const { m, write, content, log } = build(arm, arrival);
  const W = Math.max(top.length, bottom.length) + 1;
  const pad = (ds) => [...Array(W - ds.length).fill(0), ...ds];
  pad(top).forEach((d, i) => write(1, edge - W + 1 + i, d));
  pad(bottom).forEach((d, i) => write(2, edge - W + 1 + i, d));
  write(0, edge, 0); write(4, edge, '+');
  m.reset(); m.moment = 0;
  const { moments, repeatsEvery } = m.invoke([['=', 'F' + edge]], { maxMoments: limit }); // ENGINE: everything
  const row = (r) => { const ds = []; for (let c = 0; c < COLS; c++) { const x = content.get(`${r},${c}`); ds.push(typeof x === 'number' ? x : null); } return ds; };
  const last = moments[moments.length - 1];
  const lastFocus = last ? last.active.map((a) => m.popOf(a.m).name).find((n) => /^F\d+$/.test(n)) : null;
  const leftOn = last ? last.active.map((a) => m.popOf(a.m).name) : [];
  return { row3: row(3), row5: row(5), moments: moments.length, repeatsEvery, log, stoppedQuiet: repeatsEvery === 0 && moments.length < limit, lastFocus, leftOn, W };
}

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);

const N = 200, EDGE = 9, LIMIT = 400;
const out = [];
out.push('C166 · An arrival from competition');
out.push(`${N} written additions, 3 to 6 digits, ending in column ${EDGE}; step limit ${LIMIT} moments.\n`);
out.push('| arrival | arm | A right | hand-overs (per sum) | B copied the answer | B ran out under the start column | how the run ended |');
out.push('|---|---|---|---|---|---|---|');
const examples = [];
for (const arrival of ['code', 'competition']) for (const arm of ['procedure', 'none', 'no-sample']) {
  const rand = rng(1234);
  let aRight = 0, copied = 0, back = 0; const hand = new Map(), ends = new Map();
  for (let i = 0; i < N; i++) {
    const n = 3 + (i % 4), top = digitsOf(rand, n), bottom = digitsOf(rand, n);
    const r = run(arm, arrival, top, bottom, EDGE, LIMIT);
    const ans = r.row3.filter((x) => x !== null);
    if (ans.length && value(ans) === value(top) + value(bottom)) aRight++;
    const cols = r.row3.map((x, c) => (x !== null ? c : -1)).filter((c) => c >= 0);
    if (cols.length && cols.every((c) => r.row5[c] === r.row3[c]) && r.row5.filter((x) => x !== null).length === cols.length) copied++;
    const bStall = r.log.stalls.filter((x) => x.frame === 'B').pop();
    if (bStall && bStall.focus === EDGE) back++; // where frame B ran out: under the column where the sum started
    hand.set(r.log.handovers, (hand.get(r.log.handovers) || 0) + 1);
    const end = r.repeatsEvery ? `a repeating cycle (every ${r.repeatsEvery})` : r.moments >= LIMIT ? 'the step limit' : 'went quiet by itself';
    ends.set(end, (ends.get(end) || 0) + 1);
    if (i === 0 && arrival === 'competition') examples.push({ arm, top, bottom, r });
  }
  out.push(`| ${arrival} | ${arm === 'procedure' ? 'procedure held' : arm === 'none' ? 'no procedure' : 'hand-over without A\'s sample'} | ${aRight} of ${N} | ${[...hand].map(([k, v]) => `${k}: ${v}`).join(', ')} | ${copied} of ${N} | ${back} of ${N} | ${[...ends].map(([k, v]) => `${k} ${v}`).join(', ')} |`);
}
out.push('');
for (const { arm, top, bottom, r } of examples) {
  out.push(`== competition, ${arm}, first sum: ${value(top)} + ${value(bottom)}`);
  out.push(`  answer row:     ${r.row3.map((x) => (x === null ? '.' : x)).join('')}`);
  out.push(`  copy row below: ${r.row5.map((x) => (x === null ? '.' : x)).join('')}`);
  out.push(`  stalls: ${r.log.stalls.map((s) => `moment ${s.moment} (frame ${s.frame}, focus at column ${s.focus})`).join('; ')}; hand-overs: ${r.log.handovers}; moments: ${r.moments}; still on at the end: ${r.leftOn.join(' ') || 'nothing'}`);
  out.push('');
}
console.log(out.join('\n'));
