// C168 · A latch. Read hypothesis.md first. C167's circuit, with the start place held as a latch (held activity) instead
// of bound as a bond, and two sums run straight on in one memory with nothing reset between them. (C167's description
// follows.)
// C167 · A jump, and letting go.
//
// C166's circuit (frames held by their own running, the arrival from competition, hand-overs on arrivals keyed on the
// procedure and a sparse sample of the frame that ended), with:
//   - the binding rule: when the cue is given at a place, form one gate {P, Jump} -> that place;
//   - three ways of working in a chain: A (reading frame, leftwards), J (the jump), C (copying the answer onto the row
//     below, leftwards from where it starts);
//   - letting go: what follows P is P or Done (alternatives, so rivals); Done is backed by P, Stalled and a sample of C.
// Everything between a cue and reading the page is the engine's. Run: node jump.js > out.txt

'use strict';

const { Memory, GATE, TRANSITION } = require('./engine');
const { fact, PLACES, NP, MOVES, ROWS, COLS, at } = require('./circuit');

const P_ = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const SYMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+'];
const A = { name: 'A', reads: [P_(-2, 0), P_(-1, 0), P_(-3, 0)], s: P_(1, 0), u: P_(0, 0), k: P_(-3, -1), w: P_(1, -1), mv: 0 };
const C = { name: 'C', reads: [P_(0, 0), P_(0, 0), P_(0, 0)], fam: 'Ι', u: P_(2, 0), k: P_(3, 0), mv: 0 };
const PHASES = ['Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5', 'Φ6'];
const partsOf = (f) => [`${f.name}:RA${f.reads[0]}`, `${f.name}:RB${f.reads[1]}`, `${f.name}:RK${f.reads[2]}`, ...(f.s !== undefined ? [`${f.name}:RS${f.s}`] : []),
  `${f.name}:WU${f.u}`, `${f.name}:WK${f.k}`, ...(f.w !== undefined ? [`${f.name}:WS${f.w}`] : []), ...(f.fam ? [`${f.name}:${f.fam}`] : []), `${f.name}:GO${MOVES[f.mv]}`];

// binding: 'bond' (C167) | 'latch'; letGo: whether Done exists
function build(binding, letGo) {
  const m = new Memory();
  const frames = [A, C];
  const pops = ['=', 'P', 'Done', 'Stalled', 'H1', 'Jump', 'H2', ...PHASES, 'Σ', 'Ι', 'S+'];
  for (let c = 0; c < COLS; c++) pops.push('F' + c, 'S@' + c);
  for (const f of frames) pops.push(...partsOf(f));
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`); for (const x of SYMS) pops.push(`X${r}_${c}=${x}`); }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d, 'T' + d);
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);

  // the cue starts A and the procedure; the procedure holds itself
  for (const x of partsOf(A)) gate(['='], x);
  gate(['='], 'Φ1');
  gate(['='], 'P'); gate(['P'], 'P');
  // letting go: what follows P is P or Done (alternatives, so rivals); Done backed by P, Stalled and a sample of C
  if (letGo) {
    m.form(TRANSITION, [id('P'), id('P')]);
    m.form(TRANSITION, [id('P'), id('Done')]);
    gate(['P', 'Stalled', `C:RA${C.reads[0]}`, `C:WU${C.u}`], 'Done');
  }
  // frames held by their own running
  for (const f of frames) for (const x of partsOf(f)) for (const ph of PHASES) gate([x, ph], x);
  // the clock, with the arrival from competition (C166)
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  m.form(TRANSITION, [id('Φ5'), id('Φ6')]);
  m.form(TRANSITION, [id('Φ5'), id('Stalled')]);
  gate(['Φ5'], 'Stalled');
  // the latch (architecture, the same for every place, set up in advance): the cue at a place brings on its start
  // marker; the marker is held only while the procedure is held; the jump brings on the place whose marker is on
  if (binding === 'latch') for (let c = 0; c < COLS; c++) {
    gate(['=', 'F' + c], 'S@' + c);
    gate(['S@' + c, 'P'], 'S@' + c);
    gate(['Jump', 'P', 'S@' + c], 'F' + c);
  }
  // the chain: A ends -> H1 -> Jump; Jump with P brings on the bound start place (gate formed by the binding rule) and
  // -> H2 -> C, which starts where the focus now is
  gate(['P', 'Stalled', `A:RA${A.reads[0]}`, `A:WK${A.k}`], 'H1');
  gate(['H1'], 'Jump');
  gate(['Jump'], 'H2');
  for (const x of partsOf(C)) gate(['H2'], x);
  gate(['H2'], 'Φ1');
  // the focus: held while the clock runs; moved by each frame's move; kept through a stall and the first hand-over
  // moment (so the jump starts from a known place); after the jump, kept where the jump put it
  for (let c = 0; c < COLS; c++) {
    for (const ph of PHASES.slice(0, 5)) gate(['F' + c, ph], 'F' + c);
    gate(['F' + c, '='], 'F' + c);
    gate(['F' + c, 'Stalled'], 'F' + c);
    gate(['F' + c, 'H2'], 'F' + c);
    for (const f of frames) {
      const go = `${f.name}:GO${MOVES[f.mv]}`, to = c + (f.mv === 0 ? -1 : 1);
      if (to >= 0 && to < COLS) gate(['Φ6', 'F' + c, go], 'F' + to);
    }
  }
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
      gate(['Φ3', 'F' + c, part('RS'), `X${r}_${cc}=+`], 'Σ');
      gate(['Φ3', 'F' + c, part('RS'), `X${r}_${cc}=+`], 'S+');
    }
    if (f.u === p) gate(['Φ4', 'F' + c, part('WU')], `WPU${r}_${cc}`);
    if (f.k === p) gate(['Φ4', 'F' + c, part('WK')], `WPK${r}_${cc}`);
    if (f.w === p) gate(['Φ4', 'F' + c, part('WS')], `WPS${r}_${cc}`);
  }
  gate(['S+', 'Φ4'], 'S+');
  gate(['C:Ι', 'Φ3'], 'Ι');
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact('Σ', a, b, k);
    gate(['Σ', 'A' + a, 'B' + b, 'K' + k], 'U' + f.u);
    gate(['Σ', 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }
  for (let a = 0; a < 10; a++) gate(['Ι', 'A' + a], 'U' + a);

  const content = new Map();
  const write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`], `X${r}_${c}=${x}`); return true; };
  const log = { stalls: [], jumps: [], done: 0, starts: [] };
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
    // the binding rule (architecture): a cue given at a place binds that place into the procedure it starts
    if (on.has('=') && binding === 'bond') for (const n of on) if (/^F\d+$/.test(n)) { gate(['P', 'Jump'], n); log.starts.push(+n.slice(1)); }
    // observation only
    const foci = [...on].filter((n) => /^F\d+$/.test(n)).map((n) => +n.slice(1));
    if (on.has('Stalled')) log.stalls.push({ moment: mem.moment, foci, frame: [...on].some((n) => n.startsWith('A:')) ? 'A' : [...on].some((n) => n.startsWith('C:')) ? 'C' : '?' });
    if (on.has('H2')) log.jumps.push({ moment: mem.moment, foci });
    if (on.has('Done')) log.done++;
  }];
  return { m, write, content, log };
}

// a cue: the first in a memory starts from nothing; a later one arrives on whatever is still active (no reset)
const runCue = (m, edge, limit, first) => { if (first) { m.reset(); m.moment = 0; } return m.invoke([['=', 'F' + edge]], { maxMoments: limit }); };
function writeSum(write, top, bottom, edge) {
  const W = Math.max(top.length, bottom.length) + 1, pad = (ds) => [...Array(W - ds.length).fill(0), ...ds];
  pad(top).forEach((d, i) => write(1, edge - W + 1 + i, d));
  pad(bottom).forEach((d, i) => write(2, edge - W + 1 + i, d));
  write(0, edge, 0); write(4, edge, '+');
  return W;
}
const rowAt = (content, r, from, to) => { const ds = []; for (let c = from; c <= to; c++) { const x = content.get(`${r},${c}`); ds.push(typeof x === 'number' ? x : null); } return ds; };
const ended = (res, limit) => (res.repeatsEvery ? `held on, repeating every ${res.repeatsEvery}` : res.moments.length >= limit ? 'the step limit' : 'went quiet by itself');

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);

const N = 200, N2 = 100, EDGE = 9, LIMIT = 400;
const out = [];
out.push('C168 · A latch');
out.push(`Two 3-digit additions run straight on in one memory (columns 8 to 11, then 3 to 6), the second cue arriving on whatever is still active (${N2} pairs per arm); and ${N} single sums (3 to 6 digits). Step limit ${LIMIT}.\n`);
out.push('| arm | first sum worked and copied | second jump: only its own start / more than one place / none | second sum worked and copied | how the second run ended (and what was on in its last recorded moment) |');
out.push('|---|---|---|---|---|');
const examples = [];
for (const [label, binding, letGo] of [['bond, two sums', 'bond', true], ['latch, two sums', 'latch', true], ['latch, two sums, no letting go', 'latch', false]]) {
  const rand = rng(99);
  let first = 0, second = 0, own = 0, many = 0, none = 0; const left = new Map();
  for (let i = 0; i < N2; i++) {
    const { m, write, content, log } = build(binding, letGo);
    const s1 = [digitsOf(rand, 3), digitsOf(rand, 3)], s2 = [digitsOf(rand, 3), digitsOf(rand, 3)];
    const E1 = 11, E2 = 6;
    writeSum(write, s1[0], s1[1], E1);
    runCue(m, E1, LIMIT, true);
    const j1 = log.jumps.length;
    writeSum(write, s2[0], s2[1], E2);
    const res = runCue(m, E2, LIMIT, false);
    const okCopy = (E) => { const a = rowAt(content, 3, E - 3, E), c = rowAt(content, 5, E - 3, E); return a.every((x, j) => x !== null && c[j] === x); };
    const ansOk = (s, E) => value(rowAt(content, 3, E - 3, E).map((x) => x ?? 0)) === value(s[0]) + value(s[1]);
    if (ansOk(s1, E1) && okCopy(E1)) first++;
    if (ansOk(s2, E2) && okCopy(E2)) second++;
    const jump2 = log.jumps[j1];
    if (!jump2 || jump2.foci.length === 0) none++; else if (jump2.foci.length === 1 && jump2.foci[0] === E2) own++; else many++;
    const last = res.moments[res.moments.length - 1];
    const k = last ? last.active.map((a) => m.popOf(a.m).name).filter((n) => n === 'P' || n.startsWith('S@')).join(' ') || 'nothing' : 'nothing';
    const how = res.repeatsEvery ? 'held on' : res.moments.length >= LIMIT ? 'step limit' : 'went quiet';
    left.set(`${how}; last moment: ${k}`, (left.get(`${how}; last moment: ${k}`) || 0) + 1);
    if (i === 0) examples.push({ label, log, content, s1, s2, jump2 });
  }
  out.push(`| ${label} | ${first} of ${N2} | ${own} / ${many} / ${none} | ${second} of ${N2} | ${[...left].map(([k, v]) => `${k} (${v})`).join(', ')} |`);
}
{
  const rand = rng(1234);
  let ok = 0, landed = 0, quiet = 0;
  for (let i = 0; i < N; i++) {
    const n = 3 + (i % 4), top = digitsOf(rand, n), bottom = digitsOf(rand, n);
    const { m, write, content, log } = build('latch', true);
    const W = writeSum(write, top, bottom, EDGE);
    const res = runCue(m, EDGE, LIMIT, true);
    const ans = rowAt(content, 3, EDGE - W + 1, EDGE), copy = rowAt(content, 5, EDGE - W + 1, EDGE);
    if (ans.every((x, j) => x !== null && copy[j] === x) && value(ans) === value(top) + value(bottom)) ok++;
    if (log.jumps.length === 1 && log.jumps[0].foci.length === 1 && log.jumps[0].foci[0] === EDGE) landed++;
    if (!res.repeatsEvery && res.moments.length < LIMIT) quiet++;
  }
  out.push(`| latch, one sum (${N}) | worked and copied ${ok} of ${N} | jump to its own start ${landed} of ${N} | | went quiet by itself ${quiet} of ${N} |`);
}
out.push('');
for (const e of examples) {
  out.push(`== ${e.label}, first pair: ${value(e.s1[0])} + ${value(e.s1[1])} at columns 8 to 11, then ${value(e.s2[0])} + ${value(e.s2[1])} at columns 3 to 6`);
  for (const r of [3, 5]) out.push(`  row ${r}: ${rowAt(e.content, r, 0, COLS - 1).map((x) => (x === null ? '.' : x)).join('')}`);
  out.push(`  jumps: ${e.log.jumps.map((j) => `moment ${j.moment} -> column ${j.foci.join(' and ') || 'none'}`).join('; ')}; Done: ${e.log.done}`);
  out.push('');
}
console.log(out.join('\n'));
