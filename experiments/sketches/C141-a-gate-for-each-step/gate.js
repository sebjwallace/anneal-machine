// C141 · A gate for each step. Read hypothesis.md first: it has the ledger of what is given and what is the engine.
// The engine is C140's copy plus one new shape, GATE (see engine.js). GIVEN marks crutches; ENGINE marks the engine.
// Run: node gate.js > out.txt

'use strict';

const { Memory, GATE } = require('./engine');

const COLS = 16, ROWS = 8;
const out = [];
const say = (s = '') => out.push(s);
const cols = (m, mo) => [...new Set(mo.active.map((a) => m.popOf(a.m).name).filter((n) => /^C\d+$/.test(n)))];

// ---------------------------------------------------------------- the walk

// GIVEN: the walk, and the rule that binds each step as it happens (where it was, the move, where it arrived).
function walkRow(m, shape, from = 0, to = COLS - 1) {
  const id = (n) => m.population(n).first;
  for (let c = from; c < to; c++) bindStep(m, shape, c, '→', c + 1, id);
  for (let c = to; c > from; c--) bindStep(m, shape, c, '←', c - 1, id);
}
function bindStep(m, shape, c, move, d, id) {
  if (shape === 'old') m.declareWord(['C' + c, move, 'C' + d]); // C140's shapes: a set and a chain
  else m.form(GATE, [id('C' + c), id(move), id('C' + d)]); // ENGINE: a gate, key {where it was, the move}, target where it arrived
}
function declareRow(m, shape) {
  for (let c = 0; c < COLS; c++) m.declarePopulation('C' + c, 1);
  const size = shape === 'old' ? COLS : 1; // the old shapes need fresh move members per step, as in C140
  m.declarePopulation('→', size); m.declarePopulation('←', size);
}

// ENGINE: the column and the first move arrive together; each later move arrives the moment after. Returns the columns
// on at every moment after the first.
function move(m, col, moves) {
  m.reset(); m.moment = 0;
  const seq = [['C' + col, moves[0]], ...moves.slice(1).map((x) => [x]), []];
  const { moments } = m.invoke(seq, { maxMoments: seq.length });
  const trace = [];
  for (let i = 1; i <= moves.length; i++) trace.push(moments[i] ? cols(m, moments[i]) : []);
  return trace;
}
function expected(col, moves) {
  const path = [];
  let c = col;
  for (const x of moves) { if (c === null) { path.push(null); continue; } c += x === '→' ? 1 : -1; if (c < 0 || c >= COLS) c = null; path.push(c); }
  return path;
}

// ---------------------------------------------------------------- part 1

say('C141 · A gate for each step\n');
say('== part 1: single steps, from every column, both moves\n');
const p1 = {};
for (const shape of ['old', 'gate']) {
  const m = new Memory();
  declareRow(m, shape);
  walkRow(m, shape);
  let exact = 0, total = 0, offRow = 0, offRowClean = 0;
  const shown = [];
  for (let c = 0; c < COLS; c++) for (const x of ['→', '←']) {
    const want = expected(c, [x])[0];
    const got = move(m, c, [x])[0];
    if (want === null) { offRow++; if (got.length === 0) offRowClean++; }
    else { total++; if (got.length === 1 && got[0] === 'C' + want) exact++; }
    if ((c === 0 || c === 5 || c === COLS - 1)) shown.push(`  ${shape}: from C${c}, ${x}: ${got.join(' ') || '(no column)'}   (right: ${want === null ? 'no column, off the row' : 'C' + want})`);
  }
  p1[shape] = { exact, total, offRow, offRowClean };
  for (const s of shown) say(s);
  say(`  ${shape}: exactly the right column, and only it: ${exact} of ${total}; moves off the row bringing on no column: ${offRowClean} of ${offRow}\n`);
}

say('== part 1: chains of moves (gate only)\n');
{
  const m = new Memory();
  declareRow(m, 'gate');
  walkRow(m, 'gate');
  const paths = [['→', '→'], ['→', '→', '→'], ['→', '→', '→', '→'], ['→', '→', '→', '→', '→'], ['←', '←'], ['←', '←', '←', '←', '←'],
    ['→', '→', '←'], ['→', '←', '→', '←'], ['←', '→', '→', '→'], ['→', '←', '←', '→', '→']];
  let onRow = 0, onRowExact = 0, offRow = 0, offRowClean = 0;
  for (const path of paths) for (let c = 0; c < COLS; c++) {
    const want = expected(c, path), got = move(m, c, path);
    const leaves = want.some((x) => x === null);
    if (!leaves) {
      onRow++;
      if (want.every((w, i) => got[i].length === 1 && got[i][0] === 'C' + w)) onRowExact++;
      else say(`  MISS from C${c}, ${path.join(' ')}: got ${got.map((g) => g.join('+') || '-').join(' , ')}`);
    } else {
      offRow++;
      const firstOff = want.indexOf(null);
      const okBefore = want.slice(0, firstOff).every((w, i) => got[i].length === 1 && got[i][0] === 'C' + w);
      if (okBefore && got.slice(firstOff).every((g) => g.length === 0)) offRowClean++;
    }
  }
  const ex = [[5, ['→', '→', '←']], [2, ['←', '→', '→', '→']], [13, ['→', '→', '→', '→']]];
  for (const [c, path] of ex) say(`  from C${c}, ${path.join(' ')}: ${move(m, c, path).map((g) => g.join('+') || '(no column)').join(' , ')}`);
  say(`\n  paths that stay on the row: ${onRowExact} of ${onRow} exact at every moment (one column on, the right one)`);
  say(`  paths that leave the row: ${offRowClean} of ${offRow} exact until they leave, then no column on`);
  p1.chains = { onRow, onRowExact, offRow, offRowClean };
}

// ---------------------------------------------------------------- part 2: C140 rerun

const SEEDS = 20, TRAIN = 6, TEST = 100;
const TRAIN_ANCHORS = [3, 4, 5, 6, 7, 8], TEST_ANCHORS = [10, 11, 12];
const OFFSETS = [-2, -1, 1, 2, 3];
const fact = (a, b) => a - b; // GIVEN: the arithmetic facts
function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function problem(rand, anchors, open) { // GIVEN: the space and its contents (as C140)
  const grid = [];
  for (let r = 0; r < ROWS; r++) { grid.push([]); for (let c = 0; c < COLS; c++) grid[r].push(Math.floor(rand() * 10)); }
  const r = Math.floor(rand() * ROWS), c = anchors[Math.floor(rand() * anchors.length)];
  const a = Math.floor(rand() * 10), b = Math.floor(rand() * 10);
  grid[r][c - 1] = a; grid[r][c] = '−'; grid[r][c + 1] = b; grid[r][c + 2] = '='; grid[r][c + 3] = open ? '?' : fact(a, b);
  return { grid, r, c, a, b, answer: fact(a, b) };
}
const isNumber = (v) => typeof v === 'number';
const oname = (o) => '@' + (o > 0 ? '+' : '') + o;

function makeMemory(walkTo) {
  const m = new Memory();
  declareRow(m, 'gate');
  walkRow(m, 'gate', 0, walkTo);
  m.declarePopulation('−', 4);
  for (const o of OFFSETS) m.declarePopulation(oname(o), 4);
  return m;
}
// GIVEN: "+2" means two right moves. ENGINE: each move, and so the column reached.
function reach(m, col, o) {
  const moves = Array(Math.abs(o)).fill(o > 0 ? '→' : '←');
  const trace = move(m, col, moves);
  const last = trace[trace.length - 1];
  return last.length === 1 ? +last[0].slice(1) : null;
}
const readAt = (p, m, o) => { const c = reach(m, p.c, o); return c === null ? null : p.grid[p.r][c]; }; // GIVEN: reading the cell
const fits = (p, m, [x, y]) => { const u = readAt(p, m, x), v = readAt(p, m, y); return isNumber(u) && isNumber(v) && fact(u, v) === p.answer; };
function recall(m) { // ENGINE: from "−" alone (as C139, C140)
  m.reset(); m.moment = 0;
  const { moments } = m.invoke([['−']], { maxMoments: 4 });
  const att = moments.slice(1).map((mo) => [...new Set(mo.active.map((a) => m.popOf(a.m).name).filter((n) => n.startsWith('@')))]);
  const f = att[0] || [], s = att[1] || [];
  return f.length === 1 && s.length === 1 ? { pair: [+f[0].slice(1), +s[0].slice(1)], att } : { pair: null, att };
}
const key = (pr) => JSON.stringify(pr);

function runSeed(seed, walkTo) {
  const rand = rng(seed * 104729 + 7); // the same seeds as C140
  const m = makeMemory(walkTo);
  const candidates = []; for (const i of OFFSETS) for (const j of OFFSETS) if (i !== j) candidates.push([i, j]);
  const seenPairs = new Set();
  let held = null, learntAt = null, bound = 0;
  const log = [];
  for (let n = 1; n <= TRAIN; n++) {
    const p = problem(rand, TRAIN_ANCHORS, false);
    seenPairs.add(p.a + ',' + p.b);
    const r = recall(m);
    let cooled;
    if (r.pair && fits(p, m, r.pair)) cooled = 'recall';
    else { // C139's held-open rule, unchanged (GIVEN)
      const found = candidates.filter((pr) => fits(p, m, pr));
      const before = held;
      let now = before === null ? found : before.filter((c) => found.some((f) => key(f) === key(c)));
      let note = '';
      if (now.length === 0) { now = found; note = ', conflict: started again'; }
      const unchanged = before !== null && before.length === now.length && note === '';
      if (now.length === 1 || (now.length > 1 && unchanged)) {
        m.declareWord(['−', oname(now[0][0]), oname(now[0][1])]); bound++; learntAt = learntAt || n; held = null; // ENGINE: bind
        cooled = 'held tie settled, bound ' + now[0].map(oname).join(' then ');
      } else { held = now; cooled = `tie held open (${now.length} candidates${note})`; }
    }
    log.push(`  example ${n} (row ${p.r}, "−" in column ${p.c}): cooled by ${cooled}`);
  }
  let right = 0, wrong = 0, none = 0, made = 0;
  const r = recall(m);
  while (made < TEST) {
    const p = problem(rand, TEST_ANCHORS, true);
    if (seenPairs.has(p.a + ',' + p.b)) continue;
    made++;
    let answer = null;
    if (r.pair) { const u = readAt(p, m, r.pair[0]), v = readAt(p, m, r.pair[1]); if (isNumber(u) && isNumber(v)) answer = fact(u, v); }
    if (answer === null) none++; else if (answer === p.answer) right++; else wrong++;
  }
  return { log, right, wrong, none, learntAt, bound, recalled: r.att.map((s) => s.join('+') || '-') };
}

say('\n== part 2: C140 rerun, places reached by the engine\'s moves\n');
const ARMS2 = { 'walk learned everywhere': COLS - 1, 'walk learned only where training happened (columns 0 to 10)': 10 };
const rows2 = [];
for (const [name, walkTo] of Object.entries(ARMS2)) {
  const rs = [];
  for (let s = 1; s <= SEEDS; s++) rs.push(runSeed(s, walkTo));
  say(`-- ${name}, seed 1`);
  for (const l of rs[0].log) say(l);
  say(`  test: from "−" alone the engine brought on ${rs[0].recalled.join(' , ')}; right ${rs[0].right}, wrong ${rs[0].wrong}, no answer ${rs[0].none}\n`);
  const total = SEEDS * TEST, sum = (f) => rs.reduce((t, r) => t + f(r), 0);
  const at = rs.map((r) => r.learntAt).filter((x) => x !== null).sort((a, b) => a - b);
  const pct = (x) => `${(100 * x / total).toFixed(1)}%`;
  rows2.push(`| ${name} | ${pct(sum((r) => r.right))} | ${pct(sum((r) => r.wrong))} | ${pct(sum((r) => r.none))} | ${rs.filter((r) => r.right === TEST).length} of ${SEEDS} | ${at.length ? `${at[0]} / ${at[Math.floor((at.length - 1) / 2)]} / ${at[at.length - 1]}` : 'never'}${at.length < SEEDS ? ` (never in ${SEEDS - at.length})` : ''} | ${(sum((r) => r.bound) / SEEDS).toFixed(1)} |`);
}

say('== summary\n');
say(`Part 1, single steps: old shapes ${p1.old.exact} of ${p1.old.total} exact; gate ${p1.gate.exact} of ${p1.gate.total} exact; moves off the row bringing on nothing: old ${p1.old.offRowClean} of ${p1.old.offRow}, gate ${p1.gate.offRowClean} of ${p1.gate.offRow}.`);
say(`Part 1, chains (gate): staying on the row ${p1.chains.onRowExact} of ${p1.chains.onRow} exact; leaving the row ${p1.chains.offRowClean} of ${p1.chains.offRow} exact until they leave, then nothing.\n`);
say('| part 2 arm | right | wrong | no answer | seeds at 100% | learnt at example (min / median / max) | procedures bound (mean) |');
say('|---|---|---|---|---|---|---|');
for (const r of rows2) say(r);
console.log(out.join('\n'));
