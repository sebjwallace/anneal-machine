// C171 · Learning the hand-overs. Read hypothesis.md first.
//
// The learner's circuit: the procedure starts with the first-row frame at the cue (given). Its hand-overs are not
// written: a pair of continuations (a known frame, started at a relation to the start latch, then another) is tried on
// a worked page; agreement gates cool each written place that a frame's write meets with the same digit; a Settled gate
// comes on only when all the page's working has cooled. The pair that settles is bound as the procedure's hand-overs,
// jumps and Done (the binding rule). New long multiplications then run from the cue in a fresh circuit with those
// learned hand-overs. Run: node learn.js > out.txt

'use strict';

const { Memory, GATE, TRANSITION } = require('./engine');
const { fact, NP, MOVES, ROWS, COLS, at } = require('./circuit');
const teacher = require('./teacher');
const { H, S, F, partsOf, PHASES, SLOT, SYMS, rng, digitsOf, value, rowOf, valueOf } = teacher;

const FRAMES = { H, S, F };
const RELS = [-2, -1, 0, 1, 2];
const EDGE = 10, LIMIT = 900;
const sampleOf = (f) => [`${f.name}:${f.hold === 1 ? 'H' : 'R'}B${f.reads[1]}`, `${f.name}:WU${f.u}`];

// chain: [{ frame, rel }, { frame, rel }] after the first frame; learn: agreement and Settled over the page's working
function build(chain, hot, target) {
  const m = new Memory();
  const frames = [...new Map([H, ...chain.map((x) => FRAMES[x.frame])].map((f) => [f.name, f])).values()];
  const pops = ['=', 'P', 'Done', 'Stalled', 'Settled', 'H1', 'J1', 'H2', 'H3', 'J2', 'H4', ...PHASES, 'Π', 'Σ', 'S×'];
  for (let c = 0; c < COLS; c++) pops.push('F' + c, 'S@' + c);
  for (const f of frames) { pops.push(...partsOf(f), `${f.name}:Pick`, `${f.name}:Pick2`, `${f.name}:Pick3`); for (let d = 0; d < 10; d++) pops.push(`${f.name}:Hv${d}`); }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`, `Cool${r}_${c}`); for (const x of SYMS) pops.push(`X${r}_${c}=${x}`); }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d, 'T' + d);
  for (const n of pops) m.declarePopulation(n, 1);
  const id = (n) => m.population(n).first;
  const gate = (keys, target) => m.form(GATE, [...keys.map(id), id(target)]);

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
    if (f.fam) gate([`${f.name}:fam${f.fam}`, 'Φ3'], f.fam);
  }
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  m.form(TRANSITION, [id('Φ5'), id('Φ6')]);
  m.form(TRANSITION, [id('Φ5'), id('Stalled')]);
  gate(['Φ5'], 'Stalled');
  // the hand-overs (learned, or being tried): ended frame -> H(2k-1) -> J(k) -> focus to the latch plus its relation ->
  // H(2k) -> the next frame; the last frame's end -> Done
  const seq = [H, ...chain.map((x) => FRAMES[x.frame])];
  chain.forEach((x, k) => {
    const prev = seq[k], next = seq[k + 1], hA = 'H' + (2 * k + 1), J = 'J' + (k + 1), hB = 'H' + (2 * k + 2);
    gate(['P', 'Stalled', ...sampleOf(prev)], hA);
    gate([hA], J); gate([J], hB);
    for (let c = 0; c < COLS; c++) { const to = c + x.rel; if (to >= 0 && to < COLS) gate([J, 'P', 'S@' + c], 'F' + to); }
    for (const p of partsOf(next)) gate([hB], p);
    gate([hB], 'Φ1');
    if (next.hold === 0) gate([hB], `${next.name}:Pick`);
  });
  gate(['P', 'Stalled', ...sampleOf(seq[seq.length - 1])], 'Done');
  for (let c = 0; c < COLS; c++) {
    for (const ph of PHASES.slice(0, 5)) gate(['F' + c, ph], 'F' + c);
    gate(['F' + c, '='], 'F' + c);
    gate(['F' + c, 'Stalled'], 'F' + c);
    for (const hB of ['H2', 'H4']) gate(['F' + c, hB], 'F' + c);
    for (const f of frames) if (c - 1 >= 0) gate(['Φ6', 'F' + c, `${f.name}:GO←`], 'F' + (c - 1));
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
    // writes; and, on a worked page, attending the place written so that agreement can be seen
    if (f.u === p) { gate(['Φ4', 'F' + c, nm('WU')], `WPU${r}_${cc}`); gate(['Φ3', 'F' + c, nm('WU')], `Att${r}_${cc}`); }
    if (f.k === p) { gate(['Φ4', 'F' + c, nm('WK')], `WPK${r}_${cc}`); gate(['Φ3', 'F' + c, nm('WK')], `Att${r}_${cc}`); }
    if (f.w === p) gate(['Φ4', 'F' + c, nm('WS')], `WPS${r}_${cc}`);
  }
  for (const f of frames.filter((x) => x.hold === 0)) for (let d = 0; d < 10; d++) gate(['Φ3', `${f.name}:Hv${d}`, `${f.name}:HA${f.reads[0]}`], 'A' + d);
  gate(['S×', 'Φ4'], 'S×');
  for (const fam of ['Π', 'Σ']) for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact(fam, a, b, k);
    gate([fam, 'A' + a, 'B' + b, 'K' + k], 'U' + f.u);
    gate([fam, 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }
  // agreement (as the trial lanes): a write meeting the same digit already there cools the place; cool places held while
  // the procedure is held; Settled when all of the page's working (the hot places) has cooled
  if (hot) {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (target) {
        // the working as a target (added after the first run): a write giving the target digit cools the place
        const want = target.get(`${r},${c}`);
        if (want !== undefined) { gate([`WPU${r}_${c}`, 'U' + want], `Cool${r}_${c}`); gate([`WPK${r}_${c}`, 'T' + want], `Cool${r}_${c}`); }
      } else for (let d = 0; d < 10; d++) { gate([`WPU${r}_${c}`, 'U' + d, `X${r}_${c}=${d}`], `Cool${r}_${c}`); gate([`WPK${r}_${c}`, 'T' + d, `X${r}_${c}=${d}`], `Cool${r}_${c}`); }
      for (const ph of [...PHASES, 'P']) gate([`Cool${r}_${c}`, ph], `Cool${r}_${c}`);
    }
    gate([...hot].map((k) => { const [r, c] = k.split(','); return `Cool${r}_${c}`; }), 'Settled');
  }
  const content = new Map();
  const write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`], `X${r}_${c}=${x}`); return true; };
  const log = { settled: false, done: 0 };
  m.bindRules = [(mem) => {
    const on = new Set([...mem.active].map((x) => mem.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 10; t++) if (on.has('T' + t)) write(+mt[1], +mt[2], t);
      mt = /^WPS(\d+)_(\d+)$/.exec(n);
      if (mt && on.has('S×')) write(+mt[1], +mt[2], '×');
    }
    if (on.has('Settled')) log.settled = true;
    if (on.has('Done')) log.done++;
  }];
  return { m, write, content, log };
}

// GIVEN, the encoder: the page as given (no working), as C170
function givenPage(top, mult) {
  const page = new Map();
  const T = [0, 0, ...top];
  T.forEach((d, j) => page.set(`1,${EDGE - T.length + 1 + j}`, d));
  mult.forEach((d, j) => page.set(`2,${EDGE - 1 + j}`, d));
  page.set('0,' + EDGE, 0); page.set(`5,${EDGE - 1}`, 0); page.set('7,' + EDGE, 0); page.set('6,' + EDGE, 0); page.set('4,' + EDGE, '×');
  return page;
}
// GIVEN, the encoder: a worked page (written out by running the teacher, C170's hand-written procedure); its working
// (the hot places) is everything written beyond the given page except the carried sign. firstRowOnly: only the first
// row's working kept
function workedPage(top, mult, firstRowOnly) {
  const t = teacher.build('start');
  const given = givenPage(top, mult);
  for (const [k, x] of given) { const [r, c] = k.split(',').map(Number); t.write(r, c, x); }
  t.m.reset(); t.m.moment = 0;
  t.m.invoke([['=', 'F' + EDGE]], { maxMoments: LIMIT });
  const page = new Map(), hot = new Set();
  for (const [k, x] of t.content) {
    const r = +k.split(',')[0];
    if (given.has(k)) { page.set(k, x); continue; }
    if (r === 4) continue; // the carried sign isn't shown
    if (firstRowOnly && ![0, 3].includes(r)) continue;
    page.set(k, x); hot.add(k);
  }
  return { page, hot };
}
function runOn(chain, page, hot, target) {
  const { m, write, content, log } = build(chain, hot, target);
  for (const [k, x] of page) { const [r, c] = k.split(',').map(Number); write(r, c, x); }
  m.reset(); m.moment = 0;
  const res = m.invoke([['=', 'F' + EDGE]], { maxMoments: LIMIT }); // ENGINE: everything after the cue
  return { content, log, res };
}
const key = (chain) => chain.map((x) => `${x.frame}@${x.rel >= 0 ? '+' : ''}${x.rel}`).join(' then ');
const CANDIDATES = [];
for (const f1 of Object.keys(FRAMES)) for (const r1 of RELS) for (const f2 of Object.keys(FRAMES)) for (const r2 of RELS) CANDIDATES.push([{ frame: f1, rel: r1 }, { frame: f2, rel: r2 }]);

const out = ['C171 · Learning the hand-overs', `Candidates per worked example: ${CANDIDATES.length} pairs of continuations (each of H, S, F at a start relation of ${RELS.join(', ')} columns from the start latch). Test: 200 new long multiplications (2- to 5-digit tops by 2-digit multipliers) from the cue, with the learned hand-overs.\n`];
const NAMES = { H: 'first-row frame', S: 'second-row frame', F: 'adding frame' };
const settledNames = [];
out.push('| arm | per worked example: pairs that settled | learned | test: final sum = product | test: first row right |');
out.push('|---|---|---|---|---|');
for (const [label, nEx, firstRowOnly, asTarget] of [['learn from 3 worked examples', 3, false, false], ['learn from 1 worked example', 1, false, false], ['learn from 3 worked first rows only (control)', 3, true, false],
  ['working as a target: learn from 3 worked examples', 3, false, true], ['working as a target: learn from 1 worked example', 1, false, true], ['working as a target: first rows only (control)', 3, true, true]]) {
  const rand = rng(424242);
  const per = [], found = new Map();
  for (let e = 0; e < nEx; e++) {
    const top = digitsOf(rand, 2 + e % 3), mult = digitsOf(rand, 2);
    const { page, hot } = workedPage(top, mult, firstRowOnly);
    // the working as a target: the page shows only what's given; the working is the target the agreement gates hold
    const target = asTarget ? new Map([...hot].map((k) => [k, page.get(k)])) : null;
    const shown = asTarget ? new Map([...page].filter(([k]) => !hot.has(k))) : page;
    const settled = CANDIDATES.filter((ch) => runOn(ch, shown, hot, target).log.settled); // ENGINE judges: the Settled gate
    if (asTarget && e === 0) settledNames.push(`${label}: ${settled.map(key).slice(0, 6).join(' | ')}${settled.length > 6 ? ' | ...' : ''}`);
    per.push(settled.length);
    if (settled.length === 1) { const k = key(settled[0]); found.set(k, { chain: settled[0], n: (found.get(k)?.n || 0) + 1 }); } // the binding rule
  }
  // what is learned: a pair bound by every example (one pair settling each, the same each time); otherwise nothing
  const learned = found.size === 1 && [...found.values()][0].n === nEx ? [...found.values()][0].chain : null;
  const tr = rng(5150);
  let right = 0, first = 0;
  for (let i = 0; i < 200; i++) {
    const top = digitsOf(tr, 2 + (i % 4)), mult = digitsOf(tr, 2);
    const r = runOn(learned || [], givenPage(top, mult), null);
    if (valueOf(rowOf(r.content, 8)) === value(top) * value(mult)) right++;
    if (valueOf(rowOf(r.content, 3)) === value(top) * mult[1]) first++;
  }
  out.push(`| ${label} | ${per.join(', ')} | ${learned ? learned.map((x) => `${NAMES[x.frame]} at ${x.rel === 0 ? 'the start' : x.rel < 0 ? `${-x.rel} left of the start` : `${x.rel} right of the start`}`).join(', then ') : 'nothing (no single pair settled every example)'} | ${right} of 200 | ${first} of 200 |`);
  process.stderr.write(label + ' done\n');
}
out.push('', 'Which pairs settled the first worked example (working as a target):', ...settledNames.map((x) => '  ' + x), '', 'For the first three arms (working readable on the page), the pairs are in which.txt.');
console.log(out.join('\n'));
