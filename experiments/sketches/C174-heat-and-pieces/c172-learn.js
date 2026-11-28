// C172 · Learning the second row by doing and checking (a taste). Read hypothesis.md first.
//
// The learner's circuit: the first-row frame at the cue (given, as before), then one hand-over to a candidate second
// frame started at a relation to the start latch. Neither the second frame's shape nor where it starts is written:
// candidates are tried on a page that shows only what's given; the worked example's working (both rows) is held as a
// target by agreement gates (C171); the frames read only what's given and what they have written themselves. Stage 1
// keeps candidates whose first units write cooled a target place; stage 2 gives each keeper every carry place, every
// move and a hold or none, and keeps what settles the whole page (the Settled gate). What settles every worked example
// is bound; then new long multiplications' two rows run from the cue in a fresh circuit with it.
// Run: SHARD=i/n node learn.js (each shard writes stage results), then REPORT=1 node learn.js > out.txt

'use strict';

const fs = require('fs');
const { Memory, GATE, TRANSITION } = require('./engine');
const { fact, PLACES, NP, MOVES, ROWS, COLS, at } = require('./circuit');
const teacher = require('./teacher');
const { H, S, PHASES, SLOT, SYMS, rng, digitsOf, value, rowOf, valueOf } = teacher;

const RELS = [-2, -1, 0, 1, 2];
const EDGE = 10, LIMIT = 600;
// a frame's parts; the carry write, the sign write and the move may be absent (stage 1 has no carry write and no move)
const partsOf = (f) => [...f.reads.map((p, i) => `${f.name}:${f.hold === i ? 'H' : 'R'}${SLOT[i]}${p}`), `${f.name}:RS${f.s}`, `${f.name}:WU${f.u}`,
  ...(f.k !== undefined ? [`${f.name}:WK${f.k}`] : []), ...(f.w !== undefined ? [`${f.name}:WS${f.w}`] : []), ...(f.mv !== undefined ? [`${f.name}:GO${MOVES[f.mv]}`] : [])];
const sampleOf = (f) => [`${f.name}:${f.hold === 1 ? 'H' : 'R'}B${f.reads[1]}`, `${f.name}:WU${f.u}`];

// X: the candidate second frame (named X), with X.rel its start relation to the latch; X null: the first row alone
function build(X, hot, target) {
  const m = new Memory();
  const frames = X ? [H, X] : [H];
  const pops = ['=', 'P', 'Done', 'Stalled', 'Settled', 'H1', 'J1', 'H2', ...PHASES, 'Π', 'S×'];
  for (let c = 0; c < COLS; c++) pops.push('F' + c, 'S@' + c);
  for (const f of frames) {
    pops.push(...new Set([...partsOf(f), `${f.name}:GO←`, `${f.name}:GO→`]), `${f.name}:Pick`, `${f.name}:Pick2`, `${f.name}:Pick3`);
    for (let d = 0; d < 10; d++) pops.push(`${f.name}:Hv${d}`);
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`, `Cool${r}_${c}`); for (const x of SYMS) pops.push(`X${r}_${c}=${x}`); }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d, 'T' + d);
  for (const n of new Set(pops)) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, t) => m.form(GATE, [...keys.map(id), id(t)]);

  // the cue: the first frame (given) and the procedure; holding itself, or letting go
  for (const x of partsOf(H)) gate(['='], x);
  gate(['='], 'Φ1'); gate(['='], 'H:Pick');
  gate(['='], 'P'); gate(['P'], 'P');
  m.form(TRANSITION, [id('P'), id('P')]);
  m.form(TRANSITION, [id('P'), id('Done')]);
  for (let c = 0; c < COLS; c++) { gate(['=', 'F' + c], 'S@' + c); gate(['S@' + c, 'P'], 'S@' + c); }
  for (const f of frames) {
    for (const x of partsOf(f)) for (const ph of PHASES) gate([x, ph], x);
    gate([`${f.name}:Pick`], `${f.name}:Pick2`); gate([`${f.name}:Pick2`], `${f.name}:Pick3`);
    for (let d = 0; d < 10; d++) for (const ph of PHASES) gate([`${f.name}:Hv${d}`, ph], `${f.name}:Hv${d}`);
  }
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  m.form(TRANSITION, [id('Φ5'), id('Φ6')]);
  m.form(TRANSITION, [id('Φ5'), id('Stalled')]);
  gate(['Φ5'], 'Stalled');
  // the hand-over (C171's form): the first row ends -> H1 -> J1 -> focus to the latch plus X's relation -> H2 -> X
  if (X) {
    gate(['P', 'Stalled', ...sampleOf(H)], 'H1');
    gate(['H1'], 'J1'); gate(['J1'], 'H2');
    for (let c = 0; c < COLS; c++) { const to = c + X.rel; if (to >= 0 && to < COLS) gate(['J1', 'P', 'S@' + c], 'F' + to); }
    for (const p of partsOf(X)) gate(['H2'], p);
    gate(['H2'], 'Φ1');
    if (X.hold === 0) gate(['H2'], 'X:Pick');
    gate(['P', 'Stalled', ...sampleOf(X)], 'Done');
  } else gate(['P', 'Stalled', ...sampleOf(H)], 'Done');
  for (let c = 0; c < COLS; c++) {
    for (const ph of PHASES.slice(0, 5)) gate(['F' + c, ph], 'F' + c);
    gate(['F' + c, '='], 'F' + c);
    gate(['F' + c, 'Stalled'], 'F' + c);
    gate(['F' + c, 'H2'], 'F' + c);
    for (const f of frames) {
      if (c - 1 >= 0) gate(['Φ6', 'F' + c, `${f.name}:GO←`], 'F' + (c - 1));
      if (c + 1 < COLS) gate(['Φ6', 'F' + c, `${f.name}:GO→`], 'F' + (c + 1));
    }
  }
  for (const f of frames) for (let c = 0; c < COLS; c++) for (let p = 0; p < NP; p++) {
    const rc = at(c, p); if (!rc) continue;
    const [r, cc] = rc, nm = (x) => `${f.name}:${x}${p}`;
    f.reads.forEach((rp, i) => {
      if (rp !== p) return;
      if (f.hold === i) {
        gate([`${f.name}:Pick`, 'F' + c, nm('H' + SLOT[i])], `Att${r}_${cc}`);
        for (let d = 0; d < 10; d++) { gate([`${f.name}:Pick3`, 'F' + c, nm('H' + SLOT[i]), `X${r}_${cc}=${d}`], SLOT[i] + d); gate([`${f.name}:Pick3`, 'F' + c, nm('H' + SLOT[i]), `X${r}_${cc}=${d}`], `${f.name}:Hv${d}`); }
      } else {
        gate(['Φ1', 'F' + c, nm('R' + SLOT[i])], `Att${r}_${cc}`);
        for (let d = 0; d < 10; d++) gate(['Φ3', 'F' + c, nm('R' + SLOT[i]), `X${r}_${cc}=${d}`], SLOT[i] + d);
      }
    });
    if (f.s === p) {
      gate(['Φ1', 'F' + c, nm('RS')], `Att${r}_${cc}`);
      gate(['Φ3', 'F' + c, nm('RS'), `X${r}_${cc}=×`], 'Π');
      gate(['Φ3', 'F' + c, nm('RS'), `X${r}_${cc}=×`], 'S×');
    }
    if (f.u === p) { gate(['Φ4', 'F' + c, nm('WU')], `WPU${r}_${cc}`); gate(['Φ3', 'F' + c, nm('WU')], `Att${r}_${cc}`); }
    if (f.k === p) { gate(['Φ4', 'F' + c, nm('WK')], `WPK${r}_${cc}`); gate(['Φ3', 'F' + c, nm('WK')], `Att${r}_${cc}`); }
    if (f.w === p) gate(['Φ4', 'F' + c, nm('WS')], `WPS${r}_${cc}`);
  }
  for (const f of frames.filter((x) => x.hold === 0)) for (let d = 0; d < 10; d++) gate(['Φ3', `${f.name}:Hv${d}`, `${f.name}:HA${f.reads[0]}`], 'A' + d);
  gate(['S×', 'Φ4'], 'S×');
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact('Π', a, b, k);
    gate(['Π', 'A' + a, 'B' + b, 'K' + k], 'U' + f.u);
    gate(['Π', 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }
  // the working as a target (C171): a write giving the target digit cools the place; cool places held while the
  // procedure is held; Settled when every target place has cooled
  if (hot) {
    for (const k of hot) {
      const [r, c] = k.split(',').map(Number), want = target.get(k);
      gate([`WPU${r}_${c}`, 'U' + want], `Cool${r}_${c}`); gate([`WPK${r}_${c}`, 'T' + want], `Cool${r}_${c}`);
      for (const ph of [...PHASES, 'P']) gate([`Cool${r}_${c}`, ph], `Cool${r}_${c}`);
    }
    gate([...hot].map((k) => { const [r, c] = k.split(','); return `Cool${r}_${c}`; }), 'Settled');
  }
  const content = new Map();
  const write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`], `X${r}_${c}=${x}`); return true; };
  const log = { settled: false, done: 0, cooled: new Set(), coolAt: new Map(), h2At: null };
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 10; t++) if (on.has('T' + t)) write(+mt[1], +mt[2], t);
      mt = /^WPS(\d+)_(\d+)$/.exec(n);
      if (mt && on.has('S×')) write(+mt[1], +mt[2], '×');
      mt = /^Cool(\d+)_(\d+)$/.exec(n);
      if (mt) { log.cooled.add(`${mt[1]},${mt[2]}`); if (!log.coolAt.has(`${mt[1]},${mt[2]}`)) log.coolAt.set(`${mt[1]},${mt[2]}`, mem.moment); }
    }
    if (on.has('Settled')) log.settled = true;
    if (on.has('Done')) log.done++;
    if (on.has('H2') && log.h2At === null) log.h2At = mem.moment;
  }];
  return { m, write, content, log };
}

// GIVEN, the encoder: the page as given (no working), as C170 and C171
function givenPage(top, mult) {
  const page = new Map();
  const T = [0, 0, ...top];
  T.forEach((d, j) => page.set(`1,${EDGE - T.length + 1 + j}`, d));
  mult.forEach((d, j) => page.set(`2,${EDGE - 1 + j}`, d));
  page.set('0,' + EDGE, 0); page.set(`5,${EDGE - 1}`, 0); page.set('7,' + EDGE, 0); page.set('6,' + EDGE, 0); page.set('4,' + EDGE, '×');
  return page;
}
// GIVEN, the encoder: the worked example's working for the two rows (rows 0 and 3, the first row and its carries; rows 5
// and 6, the second row and its carries), written out by running the teacher (C170's procedure)
function workedTarget(top, mult) {
  const t = teacher.build('start');
  const given = givenPage(top, mult);
  for (const [k, x] of given) { const [r, c] = k.split(',').map(Number); t.write(r, c, x); }
  t.m.reset(); t.m.moment = 0;
  t.m.invoke([['=', 'F' + EDGE]], { maxMoments: 900 });
  const target = new Map();
  for (const [k, x] of t.content) { const r = +k.split(',')[0]; if (!given.has(k) && [0, 3, 5, 6].includes(r)) target.set(k, x); }
  return { given, target };
}
function runOn(X, given, target, limit) {
  const { m, write, content, log } = build(X, target ? new Set(target.keys()) : null, target);
  for (const [k, x] of given) { const [r, c] = k.split(',').map(Number); write(r, c, x); }
  m.reset(); m.moment = 0;
  const res = m.invoke([['=', 'F' + EDGE]], { maxMoments: limit }); // ENGINE: everything after the cue
  return { content, log, res };
}

// what the page holds where the second frame starts, after the first row has run (for the outcome-equivalent filter:
// a read of an empty place, or a sign read of a place with no sign, gives nothing and the step can't go on; a units
// write to a place already holding something is refused and can't cool anything)
function pageAtHandOver(given) {
  const r = runOn(null, given, null, LIMIT);
  return r.content;
}
const ring = (p) => Math.max(Math.abs(PLACES[p][0]), Math.abs(PLACES[p][1]));
function stage1Candidates(given, maxRing) {
  const pg = pageAtHandOver(given), out = [];
  for (const rel of RELS) {
    const c0 = EDGE + rel, holds = (p, want) => { const rc = at(c0, p); if (!rc) return false; const x = pg.get(rc.join(',')); return want === 'digit' ? typeof x === 'number' : want === 'sign' ? x === '×' : x === undefined; };
    const digits = [], signs = [], empties = [];
    for (let p = 0; p < NP; p++) { if (holds(p, 'digit') && ring(p) <= maxRing) digits.push(p); if (holds(p, 'sign')) signs.push(p); if (holds(p, 'empty')) empties.push(p); }
    // A and B in either order (the hold is on A; which read is held is tried in stage 2 by order), K any other
    for (const a of digits) for (const b of digits) if (b !== a) for (const k of digits) if (k !== a && k !== b)
      for (const s of signs) for (const u of empties) out.push({ name: 'X', reads: [a, b, k], hold: 0, s, u, rel });
  }
  return out;
}

const shard = (process.env.SHARD || '0/1').split('/').map(Number);
const MAX_RING = +(process.env.RING || 2);
const xkey = (X) => `rel${X.rel} A${X.reads[0]}${X.hold === 0 ? 'h' : ''} B${X.reads[1]} K${X.reads[2]} s${X.s} u${X.u} k${X.k} mv${X.mv}`;
const pl = (p) => `(${PLACES[p][0]},${PLACES[p][1]})`;
const say = (X) => `start ${X.rel === 0 ? 'at the start' : X.rel < 0 ? `${-X.rel} left of the start` : `${X.rel} right of the start`}; ${X.hold === 0 ? 'hold' : 'read'} ${pl(X.reads[0])}, read ${pl(X.reads[1])}, carry in ${pl(X.reads[2])}, sign ${pl(X.s)}, write ${pl(X.u)}, carry out ${pl(X.k)}, move ${MOVES[X.mv]}`;

// the worked examples (seeded): searched on the first, checked on the second
const rand = rng(1720);
const EXAMPLES = [[digitsOf(rand, 3), digitsOf(rand, 2)], [digitsOf(rand, 4), digitsOf(rand, 2)]];

if (!process.env.REPORT) {
  const [i, n] = shard;
  const [top, mult] = EXAMPLES[0];
  const { given, target } = workedTarget(top, mult);
  const all = stage1Candidates(given, MAX_RING);
  const mine = all.filter((_, j) => j % n === i);
  // stage 1: the first units write; limit: the first row's run plus one column of the second frame
  const h = runOn({ ...S, name: 'X', rel: -1 }, given, target, LIMIT).log.h2At;
  const L1 = h + 12;
  const keep1 = [];
  let t0 = Date.now();
  mine.forEach((X, j) => {
    const r = runOn(X, given, target, L1);
    const [ur, uc] = at(EDGE + X.rel, X.u);
    if (r.log.cooled.has(`${ur},${uc}`)) keep1.push(X);
    if (j % 2000 === 0) process.stderr.write(`shard ${i}: stage 1 ${j}/${mine.length} (${((Date.now() - t0) / 1000).toFixed(0)}s), kept ${keep1.length}\n`);
  });
  // stage 2: each keeper with a hold or none, every carry place and both moves; kept if the whole page settles
  const settled = [];
  let tried2 = 0;
  for (const X of keep1) for (const hold of [0, undefined]) for (let k = 0; k < NP; k++) for (let mv = 0; mv < 2; mv++) {
    if (k === X.u) continue;
    const Y = { ...X, hold, k, mv };
    tried2++;
    if (runOn(Y, given, target, LIMIT).log.settled) settled.push(Y); // ENGINE judges: the Settled gate
  }
  fs.writeFileSync(`stage-${i}.json`, JSON.stringify({ total: all.length, mine: mine.length, L1, keep1, tried2, settled }));
  process.stderr.write(`shard ${i}: done; stage 1 kept ${keep1.length} of ${mine.length}; stage 2 tried ${tried2}, settled ${settled.length}\n`);
} else {
  const [, n] = shard;
  const parts = Array.from({ length: n }, (_, i) => JSON.parse(fs.readFileSync(`stage-${i}.json`, 'utf8')));
  const keep1 = parts.flatMap((p) => p.keep1), settled = parts.flatMap((p) => p.settled), tried2 = parts.reduce((t, p) => t + p.tried2, 0);
  const out = ['C172 · Learning the second row by doing and checking (a taste)', ''];
  out.push(`Worked example searched: ${value(EXAMPLES[0][0])} × ${value(EXAMPLES[0][1])}; checked on: ${value(EXAMPLES[1][0])} × ${value(EXAMPLES[1][1])}. The page shows only what's given; both rows' working is the target.`);
  out.push(`Candidates for the second frame (reads within ${MAX_RING} rows of the focus): ${parts[0].total} in stage 1 (start relation, three reads, sign read, units write); stage 1 kept ${keep1.length}; stage 2 tried ${tried2} (each keeper with hold or none, ${NP - 1} carry places, two moves); settled the whole page: ${settled.length}.`);
  out.push('', 'What settled the searched example:');
  for (const X of settled) out.push('  ' + say(X));
  // checking on the second worked example: each that settled the first, run on the second
  const { given: g2, target: t2 } = workedTarget(...EXAMPLES[1]);
  const both = settled.filter((X) => runOn(X, g2, t2, LIMIT).log.settled);
  out.push('', `Settled the second worked example as well: ${both.length}`);
  for (const X of both) out.push('  ' + say(X) + (xkey(X) === xkey({ ...S, name: 'X', rel: -1 }) ? '   <- the hand-written second-row frame' : ''));
  // the binding rule: one that settles every example is bound; then new long multiplications' two rows from the cue
  const learned = both.length === 1 ? both[0] : null;
  const tr = rng(5150);
  const tests = Array.from({ length: 200 }, (_, i) => [digitsOf(tr, 2 + (i % 4)), digitsOf(tr, 2)]);
  const score = (X) => {
    let r1 = 0, r2 = 0;
    for (const [top, mult] of tests) {
      const r = runOn(X, givenPage(top, mult), null, LIMIT);
      if (valueOf(rowOf(r.content, 3)) === value(top) * mult[1]) r1++;
      const row2 = rowOf(r.content, 6).map((x, c) => (c === EDGE ? null : x));
      if (valueOf(row2) === value(top) * mult[0]) r2++;
    }
    return [r1, r2];
  };
  out.push('', '| what runs after the first row | first row right | second row right |', '|---|---|---|');
  if (learned) { const [a, b] = score(learned); out.push(`| the learned second frame | ${a} of 200 | ${b} of 200 |`); }
  else for (const X of both.slice(0, 6)) { const [a, b] = score(X); out.push(`| tied: ${say(X)} | ${a} of 200 | ${b} of 200 |`); }
  const [a, b] = score({ ...S, name: 'X', rel: -1 }); out.push(`| the hand-written second-row frame (reference) | ${a} of 200 | ${b} of 200 |`);
  out.push('', learned ? `Learned: ${say(learned)}` : `Learned: nothing (${both.length} settled every example)`);
  console.log(out.join('\n'));
}
