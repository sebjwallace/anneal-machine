// C173 · The memory keeps what it finds (a taste). Read hypothesis.md first.
//
// One memory for the whole run: it works the worked examples, keeps what settles, recalls it on the next example, and
// is tested, without being rebuilt or copied. The first row starts at the cue (given). After it, a recall: the first
// row's end brings on one of the second-row ways of working the memory has kept, by competition (rivals from the same
// hand-over; copies count). A kept way of working is a frame cell bound to a shared vocabulary of parts (every part
// kind at every place in reach, wired in advance). Binding on settling: when a page settles, the frame that was on gets
// another copy of its recall link. When nothing's kept yet, the code's search proposes (reused from C172: same example,
// same trial circuit); what settled there is bound in as new frames. When a recall doesn't settle the page, the
// competition's other rivals are tried, one at a time (the memory's own offers; reading them is the code's).
// Run: node keep.js > out.txt

'use strict';

const fs = require('fs');
const { Memory, GATE, TRANSITION } = require('./engine');
const { fact, PLACES, NP, MOVES, ROWS, COLS, at } = require('./circuit');
const teacher = require('./teacher');
const { H, S, PHASES, SLOT, SYMS, rng, digitsOf, value, rowOf, valueOf } = teacher;

const EDGE = 10, LIMIT = 600, SHEETS = 320, FRAMES = 12;
const KINDS = ['HA', 'RA', 'RB', 'RK', 'RS', 'WU', 'WK'];
const partsOfX = (f) => [...f.reads.map((p, i) => `X:${f.hold === i ? 'H' : 'R'}${SLOT[i]}${p}`), `X:RS${f.s}`, `X:WU${f.u}`, `X:WK${f.k}`, `X:GO${MOVES[f.mv]}`];
const partsOfH = () => [...H.reads.map((p, i) => `H:${H.hold === i ? 'H' : 'R'}${SLOT[i]}${p}`), `H:RS${H.s}`, `H:WU${H.u}`, `H:WK${H.k}`, `H:WS${H.w}`, `H:GO${MOVES[H.mv]}`];

function buildMemory({ tieFirstFormed }) {
  const m = new Memory();
  m.poolCopies = true; // copies count (C148)
  m.tieFirstFormed = tieFirstFormed;
  const pops = ['=', 'P', 'Done', 'Stalled', 'Settled', 'H1', 'J1', 'H2', ...PHASES, 'Π', 'S×'];
  for (let c = 0; c < COLS; c++) pops.push('F' + c, 'S@' + c);
  pops.push(...partsOfH(), 'H:Pick', 'H:Pick2', 'H:Pick3', 'X:Pick', 'X:Pick2', 'X:Pick3');
  for (let d = 0; d < 10; d++) pops.push('H:Hv' + d, 'X:Hv' + d);
  for (let p = 0; p < NP; p++) for (const k of KINDS) pops.push(`X:${k}${p}`);
  pops.push('X:GO←', 'X:GO→', 'H:GO→');
  for (let i = 0; i < FRAMES; i++) pops.push('Fr' + i);
  for (let i = 0; i < SHEETS; i++) pops.push('Sheet' + i);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`, `Cool${r}_${c}`);
    for (const x of SYMS) pops.push(`X${r}_${c}=${x}`);
    for (let d = 0; d < 10; d++) pops.push(`Tgt${r}_${c}=${d}`);
  }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d, 'T' + d);
  for (const n of new Set(pops)) m.declarePopulation(n, 1);
  const id = (n) => { const p = m.population(n); if (!p) throw new Error('no population ' + n); return p.first; };
  const gate = (keys, t) => m.form(GATE, [...keys.map(id), id(t)]);

  // the cue, the first row (given), the procedure holding itself or letting go, the latch (as C171, C172)
  for (const x of partsOfH()) gate(['='], x);
  gate(['='], 'Φ1'); gate(['='], 'H:Pick');
  gate(['='], 'P'); gate(['P'], 'P');
  m.form(TRANSITION, [id('P'), id('P')]);
  m.form(TRANSITION, [id('P'), id('Done')]);
  for (let c = 0; c < COLS; c++) { gate(['=', 'F' + c], 'S@' + c); gate(['S@' + c, 'P'], 'S@' + c); }
  for (const x of partsOfH()) for (const ph of PHASES) gate([x, ph], x);
  for (let p = 0; p < NP; p++) for (const k of KINDS) for (const ph of PHASES) gate([`X:${k}${p}`, ph], `X:${k}${p}`);
  for (const g of MOVES) for (const ph of PHASES) gate([`X:GO${g}`, ph], `X:GO${g}`);
  for (const f of ['H', 'X']) {
    gate([`${f}:Pick`], `${f}:Pick2`); gate([`${f}:Pick2`], `${f}:Pick3`);
    for (let d = 0; d < 10; d++) for (const ph of PHASES) gate([`${f}:Hv${d}`, ph], `${f}:Hv${d}`);
    for (let d = 0; d < 10; d++) for (let p = 0; p < NP; p++) if (f === 'X' || p === H.reads[0]) gate(['Φ3', `${f}:Hv${d}`, `${f}:HA${p}`], 'A' + d);
  }
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  m.form(TRANSITION, [id('Φ5'), id('Φ6')]);
  m.form(TRANSITION, [id('Φ5'), id('Stalled')]);
  gate(['Φ5'], 'Stalled');
  // the hand-over's form (given, as C172): the first row ends -> H1 -> J1 -> H2. Which frame comes on, where the focus
  // jumps to and what H2 brings on are the kept frames' own (bound below)
  gate(['P', 'Stalled', `H:RB${H.reads[1]}`, `H:WU${H.u}`], 'H1');
  gate(['H1'], 'J1'); gate(['J1'], 'H2'); gate(['H2'], 'Φ1');
  for (let c = 0; c < COLS; c++) {
    for (const ph of PHASES.slice(0, 5)) gate(['F' + c, ph], 'F' + c);
    gate(['F' + c, '='], 'F' + c); gate(['F' + c, 'Stalled'], 'F' + c); gate(['F' + c, 'H2'], 'F' + c);
    for (const f of ['H', 'X']) {
      if (c - 1 >= 0) gate(['Φ6', 'F' + c, `${f}:GO←`], 'F' + (c - 1));
      if (c + 1 < COLS) gate(['Φ6', 'F' + c, `${f}:GO→`], 'F' + (c + 1));
    }
  }
  // reading, holding, the sign, writing: the first row's own parts, and the shared vocabulary at every place
  const wire = (nm, kind, p, c, r, cc) => {
    if (kind === 'HA') {
      gate([`${nm}:Pick`, 'F' + c, `${nm}:HA${p}`], `Att${r}_${cc}`);
      for (let d = 0; d < 10; d++) { gate([`${nm}:Pick3`, 'F' + c, `${nm}:HA${p}`, `X${r}_${cc}=${d}`], 'A' + d); gate([`${nm}:Pick3`, 'F' + c, `${nm}:HA${p}`, `X${r}_${cc}=${d}`], `${nm}:Hv${d}`); }
    } else if (kind === 'RA' || kind === 'RB' || kind === 'RK') {
      gate(['Φ1', 'F' + c, `${nm}:${kind}${p}`], `Att${r}_${cc}`);
      for (let d = 0; d < 10; d++) gate(['Φ3', 'F' + c, `${nm}:${kind}${p}`, `X${r}_${cc}=${d}`], kind[1] + d);
    } else if (kind === 'RS') {
      gate(['Φ1', 'F' + c, `${nm}:RS${p}`], `Att${r}_${cc}`);
      gate(['Φ3', 'F' + c, `${nm}:RS${p}`, `X${r}_${cc}=×`], 'Π'); gate(['Φ3', 'F' + c, `${nm}:RS${p}`, `X${r}_${cc}=×`], 'S×');
    } else if (kind === 'WU') { gate(['Φ4', 'F' + c, `${nm}:WU${p}`], `WPU${r}_${cc}`); gate(['Φ3', 'F' + c, `${nm}:WU${p}`], `Att${r}_${cc}`); }
    else if (kind === 'WK') { gate(['Φ4', 'F' + c, `${nm}:WK${p}`], `WPK${r}_${cc}`); gate(['Φ3', 'F' + c, `${nm}:WK${p}`], `Att${r}_${cc}`); }
    else if (kind === 'WS') gate(['Φ4', 'F' + c, `${nm}:WS${p}`], `WPS${r}_${cc}`);
  };
  const hParts = H.reads.map((p, i) => [H.hold === i ? 'HA' : 'R' + SLOT[i], p]).concat([['RS', H.s], ['WU', H.u], ['WK', H.k], ['WS', H.w]]);
  for (let c = 0; c < COLS; c++) for (let p = 0; p < NP; p++) {
    const rc = at(c, p); if (!rc) continue;
    for (const [kind, hp] of hParts) if (hp === p) wire('H', kind, p, c, ...rc);
    for (const kind of KINDS) wire('X', kind, p, c, ...rc);
  }
  gate(['S×', 'Φ4'], 'S×');
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact('Π', a, b, k);
    gate(['Π', 'A' + a, 'B' + b, 'K' + k], 'U' + f.u); gate(['Π', 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }
  // agreement, wired in advance at every place for every digit: the worked example's working is given as held
  // activity (the solution in view while working), and a write giving the target digit cools the place (C171's
  // agreement, made general)
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    for (let d = 0; d < 10; d++) {
      gate([`WPU${r}_${c}`, 'U' + d, `Tgt${r}_${c}=${d}`], `Cool${r}_${c}`); gate([`WPK${r}_${c}`, 'T' + d, `Tgt${r}_${c}=${d}`], `Cool${r}_${c}`);
      gate([`Tgt${r}_${c}=${d}`, 'P'], `Tgt${r}_${c}=${d}`); gate([`Tgt${r}_${c}=${d}`, '='], `Tgt${r}_${c}=${d}`);
    }
    for (const ph of [...PHASES, 'P']) gate([`Cool${r}_${c}`, ph], `Cool${r}_${c}`);
  }
  for (let i = 0; i < SHEETS; i++) { gate([`Sheet${i}`, 'P'], `Sheet${i}`); gate([`Sheet${i}`, '='], `Sheet${i}`); }

  // the memory's state across runs
  const mem = { m, gate, id, frames: [], sheet: 0, settledGates: 0 };
  // binding on settling (architecture, as C151's binding rule, now into the same memory): at the moment Settled comes
  // on, the kept frame that is on gets another copy of its recall link from the hand-over
  let wasSettled = false, run = null;
  m.bindRules = [(mm) => {
    const on = new Set([...mm.active].map((x) => mm.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) run.write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 10; t++) if (on.has('T' + t)) run.write(+mt[1], +mt[2], t);
      mt = /^WPS(\d+)_(\d+)$/.exec(n);
      if (mt && on.has('S×')) run.write(+mt[1], +mt[2], '×');
    }
    const s = on.has('Settled');
    if (s && !wasSettled) {
      run.log.settled = true;
      const fr = [...on].filter((n) => /^Fr\d+$/.test(n));
      for (const f of fr) m.form(TRANSITION, [id('H1'), id(f)]);
      run.log.bound = fr;
    }
    wasSettled = s;
    for (const f of [...on].filter((n) => /^Fr\d+$/.test(n))) run.log.frOn.add(f);
    if (on.has('H1') && run.log.h1At === null) run.log.h1At = mm.moment;
  }];
  mem.startRun = () => { wasSettled = false; run = { log: { settled: false, bound: [], frOn: new Set(), h1At: null } }; return run; };
  return mem;
}

// a kept frame: a frame cell, bound to its parts, its jump and its end (formed in the memory)
function keepFrame(mem, X) {
  const { m, gate } = mem;
  const fr = 'Fr' + mem.frames.length;
  if (mem.frames.length >= FRAMES) throw new Error('out of frame cells');
  for (const p of partsOfX(X)) gate(['H2', fr], p);
  if (X.hold === 0) gate(['H2', fr], 'X:Pick');
  for (let c = 0; c < COLS; c++) { const to = c + X.rel; if (to >= 0 && to < COLS) gate(['J1', 'P', 'S@' + c, fr], 'F' + to); }
  gate([fr, 'P'], fr); gate([fr, '='], fr);
  gate(['P', 'Stalled', fr, `X:${X.hold === 1 ? 'H' : 'R'}B${X.reads[1]}`, `X:WU${X.u}`], 'Done');
  m.form(TRANSITION, [mem.id('H1'), mem.id(fr)]); // the recall link, one copy
  mem.frames.push({ fr, X });
  return fr;
}

// one run of the memory on a page: a fresh sheet (a fresh piece of paper: the page's content is bound with it); the
// worked example's working, if any, given as held activity with the cue; optionally a frame cell given with the cue
// (trying an offer)
function runPage(mem, given, target, offer) {
  const { m, gate, id } = mem;
  const sheet = 'Sheet' + mem.sheet++;
  if (mem.sheet > SHEETS) throw new Error('out of sheets');
  const content = new Map();
  const run = mem.startRun();
  run.write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`, sheet], `X${r}_${c}=${x}`); return true; };
  for (const [k, x] of given) { const [r, c] = k.split(',').map(Number); run.write(r, c, x); }
  const cue = ['=', 'F' + EDGE, sheet];
  if (target) {
    for (const [k, d] of target) { const [r, c] = k.split(','); cue.push(`Tgt${r}_${c}=${d}`); }
    gate([sheet, ...[...target.keys()].map((k) => { const [r, c] = k.split(','); return `Cool${r}_${c}`; })], 'Settled');
  }
  if (offer) cue.push(offer);
  m.reset(); m.moment = 0;
  const res = m.invoke([cue], { maxMoments: LIMIT }); // ENGINE: everything after the cue
  // the recall's competition at the hand-over (for offers): the recall links that competed
  const linkIds = new Set();
  for (const mo of res.moments) for (const comp of mo.competitions || []) for (const o of comp) {
    const a = m.assemblies[o.id - 1];
    if (a.shape === TRANSITION && a.members[0] === id('H1')) linkIds.add(m.popOf(a.members[1]).name);
  }
  return { content, log: run.log, res, rivals: [...linkIds] };
}

// GIVEN, the encoder: the page as given, and the worked example's working for both rows (as C172)
function givenPage(top, mult) {
  const page = new Map();
  const T = [0, 0, ...top];
  T.forEach((d, j) => page.set(`1,${EDGE - T.length + 1 + j}`, d));
  mult.forEach((d, j) => page.set(`2,${EDGE - 1 + j}`, d));
  page.set('0,' + EDGE, 0); page.set(`5,${EDGE - 1}`, 0); page.set('7,' + EDGE, 0); page.set('6,' + EDGE, 0); page.set('4,' + EDGE, '×');
  return page;
}
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

const pl = (p) => `(${PLACES[p][0]},${PLACES[p][1]})`;
const say = (X) => `start ${X.rel === 0 ? 'at the start' : X.rel < 0 ? `${-X.rel} left` : `${X.rel} right`}; ${X.hold === 0 ? 'hold' : 'read'} ${pl(X.reads[0])}, read ${pl(X.reads[1])}, carry in ${pl(X.reads[2])}, sign ${pl(X.s)}, write ${pl(X.u)}, carry out ${pl(X.k)}, move ${MOVES[X.mv]}`;
const isHand = (X) => X.rel === -1 && X.hold === 0 && X.reads.join() === S.reads.join() && X.s === S.s && X.u === S.u && X.k === S.k && X.mv === S.mv;
const copiesOf = (mem, fr) => mem.m.assemblies.filter((a) => a.shape === TRANSITION && a.members[0] === mem.id('H1') && a.members[1] === mem.id(fr)).length;

// the code's search (C172's, on the same example in the same trial circuit): its settled candidates, reused
const SEARCHED = '525×67';
const searchResult = () => [0, 1].flatMap((i) => JSON.parse(fs.readFileSync(`stage-${i}.json`, 'utf8')).settled);

const rand = rng(1720);
const EXAMPLES = [[digitsOf(rand, 3), digitsOf(rand, 2)], [digitsOf(rand, 4), digitsOf(rand, 2)]];
const more = rng(1730);
for (let i = 0; i < 4; i++) EXAMPLES.push([digitsOf(more, 2 + (i % 4)), digitsOf(more, 2)]);
const tr = rng(5150);
const TESTS = Array.from({ length: 200 }, (_, i) => [digitsOf(tr, 2 + (i % 4)), digitsOf(tr, 2)]);

const out = ['C173 · The memory keeps what it finds (a taste)', ''];
const t0 = Date.now();
for (const [arm, tieFirstFormed] of [['no tie-break', false], ['tie-break: the first formed wins (a declared crutch)', true]]) {
  const mem = buildMemory({ tieFirstFormed });
  out.push(`== ${arm}`, '');
  out.push('| worked example | how it was settled | frames kept (copies of each recall link) |', '|---|---|---|');
  for (const [top, mult] of EXAMPLES) {
    const { given, target } = workedTarget(top, mult);
    const name = `${value(top)} × ${value(mult)}`;
    let how;
    const r = runPage(mem, given, target, null); // the memory tries what it has kept
    if (r.log.settled) how = `recalled ${r.log.bound.join(', ')}, settled`;
    else if (!mem.frames.length) {
      if (name.replace(' × ', '×') !== SEARCHED) throw new Error('search would be needed on ' + name);
      const found = searchResult();
      const kept = found.map((X) => keepFrame(mem, X));
      // check: each kept frame, given with the cue, settles this example in the memory itself (as it did in the trial)
      const again = kept.filter((fr) => runPage(mem, given, target, fr).log.settled);
      how = `nothing kept: the code's search (reused) settled ${found.length}, kept as ${kept.join(', ')}; given with the cue in the memory, ${again.length} of ${kept.length} settled again`;
    } else {
      const tried = r.rivals; // the memory's own offers: every recall link that competed at the hand-over
      const ok = [];
      for (const f of tried) if (runPage(mem, given, target, f).log.settled) ok.push(f);
      how = `recall ${r.log.frOn.size ? `brought on ${[...r.log.frOn].join(', ')}, didn't settle` : 'brought on nothing (a tie)'}; offers tried: ${tried.join(', ') || 'none'}; settled: ${ok.join(', ') || 'none'}`;
    }
    out.push(`| ${name} | ${how} | ${mem.frames.map((f) => `${f.fr} ×${copiesOf(mem, f.fr)}`).join(', ')} |`);
    process.stderr.write(`${arm}: ${name} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  out.push('', 'Frames kept:');
  for (const f of mem.frames) out.push(`  ${f.fr} (${copiesOf(mem, f.fr)} copies): ${say(f.X)}${isHand(f.X) ? '   <- the hand-written second-row frame' : ''}`);
  // the test, in the same memory: new long multiplications from the cue, page showing only the question
  let r1 = 0, r2 = 0, recalled = new Map();
  for (const [top, mult] of TESTS) {
    const r = runPage(mem, givenPage(top, mult), null, null);
    if (valueOf(rowOf(r.content, 3)) === value(top) * mult[1]) r1++;
    const row2 = rowOf(r.content, 6).map((x, c) => (c === EDGE ? null : x));
    if (valueOf(row2) === value(top) * mult[0]) r2++;
    const k = [...r.log.frOn].join('+') || 'nothing';
    recalled.set(k, (recalled.get(k) || 0) + 1);
  }
  out.push('', '| test (200 new long multiplications, the same memory) | first row right | second row right | recalled at the hand-over |', '|---|---|---|---|');
  out.push(`| ${arm} | ${r1} of 200 | ${r2} of 200 | ${[...recalled].map(([k, n]) => `${k} ${n}`).join(', ')} |`, '');
  process.stderr.write(`${arm}: tested (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}
console.log(out.join('\n'));
