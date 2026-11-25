// C140 · Places, not values. Read hypothesis.md first: it has the ledger of what is given and what is the engine.
// Everything marked GIVEN is a crutch, declared there. ENGINE marks what the engine (C139's copy, unchanged) does.
// Run: node space.js > out.txt

'use strict';

const { Memory } = require('./engine');

const ROWS = 8, COLS = 16, SEEDS = 20, TRAIN = 6, TEST = 100;
const TRAIN_ANCHORS = [3, 4, 5, 6, 7, 8], TEST_ANCHORS = [10, 11, 12];
const OFFSETS = [-2, -1, 1, 2, 3];
const fact = (a, b) => a - b; // GIVEN: the arithmetic facts

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------- the world

// GIVEN: the space and its contents, written by the experiment
function problem(rand, anchors, open) {
  const grid = [];
  for (let r = 0; r < ROWS; r++) { grid.push([]); for (let c = 0; c < COLS; c++) grid[r].push(Math.floor(rand() * 10)); }
  const r = Math.floor(rand() * ROWS), c = anchors[Math.floor(rand() * anchors.length)];
  const a = Math.floor(rand() * 10), b = Math.floor(rand() * 10);
  grid[r][c - 1] = a; grid[r][c] = '−'; grid[r][c + 1] = b; grid[r][c + 2] = '='; grid[r][c + 3] = open ? '?' : fact(a, b);
  return { grid, r, c, a, b, answer: fact(a, b) };
}
const read = (p, [r, c]) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? p.grid[r][c] : null); // GIVEN: reading a cell
const isNumber = (v) => typeof v === 'number';

// ---------------------------------------------------------------- places, per arm

// A place is named by what is bound. Relative: an offset from the "−". Absolute: the cell.
const ARMS = {
  relative: {
    candidates: () => { const out = []; for (const i of OFFSETS) for (const j of OFFSETS) if (i !== j) out.push([i, j]); return out; },
    cell: (p, o) => [p.r, p.c + o], // GIVEN: turning an offset into a cell (the declared relative coordinates)
    name: (o) => '@' + (o > 0 ? '+' : '') + o,
    rule: 'open',
  },
  'absolute, held open': {
    candidates: (p) => { const cells = OFFSETS.map((o) => [p.r, p.c + o]); const out = []; for (const i of cells) for (const j of cells) if (i !== j) out.push([i, j]); return out; },
    cell: (p, x) => x,
    name: (x) => `@r${x[0]}c${x[1]}`,
    rule: 'open',
  },
  'absolute, first fit': {
    candidates: (p) => ARMS['absolute, held open'].candidates(p),
    cell: (p, x) => x,
    name: (x) => `@r${x[0]}c${x[1]}`,
    rule: 'first',
  },
};

function fits(p, arm, [x, y]) {
  const u = read(p, arm.cell(p, x)), v = read(p, arm.cell(p, y));
  return isNumber(u) && isNumber(v) && fact(u, v) === p.answer; // GIVEN: the fit test
}

// ---------------------------------------------------------------- the engine's part

function newMemory(arm) {
  const m = new Memory();
  m.declarePopulation('−', 4);
  const names = new Set();
  if (arm === ARMS.relative) for (const o of OFFSETS) names.add(arm.name(o));
  else for (let r = 0; r < ROWS; r++) for (let c = -2; c < COLS + 3; c++) names.add(arm.name([r, c]));
  for (const n of names) m.declarePopulation(n, 4);
  m.byPlaceName = new Map();
  if (arm === ARMS.relative) for (const o of OFFSETS) m.byPlaceName.set(arm.name(o), o);
  else for (let r = 0; r < ROWS; r++) for (let c = -2; c < COLS + 3; c++) m.byPlaceName.set(arm.name([r, c]), [r, c]);
  return m;
}
// ENGINE: from the operator alone, the attention that comes on, moment by moment
function recall(m) {
  m.reset(); m.moment = 0;
  const { moments } = m.invoke([['−']], { maxMoments: 4 });
  const att = moments.slice(1).map((mo) => [...new Set(mo.active.map((a) => m.popOf(a.m).name).filter((n) => n.startsWith('@')))]);
  const f = att[0] || [], s = att[1] || [];
  if (f.length === 1 && s.length === 1) return { pair: [m.byPlaceName.get(f[0]), m.byPlaceName.get(s[0])], att };
  return { pair: null, att };
}
// ENGINE: bind the operator and the two places, in order
function bind(m, arm, [x, y]) { m.declareWord(['−', arm.name(x), arm.name(y)]); }

// ---------------------------------------------------------------- one seed of one arm

const key = (pr) => JSON.stringify(pr);
function runSeed(seed, armName) {
  const arm = ARMS[armName];
  const rand = rng(seed * 104729 + 7);
  const m = newMemory(arm);
  const log = [];
  const seenPairs = new Set();
  let held = null, learntAt = null, bound = 0;
  for (let n = 1; n <= TRAIN; n++) {
    const p = problem(rand, TRAIN_ANCHORS, false);
    seenPairs.add(p.a + ',' + p.b);
    const e = { n, at: `row ${p.r}, "−" in column ${p.c}`, cooled: '' };
    const r = recall(m);
    if (r.pair && fits(p, arm, r.pair)) e.cooled = 'recall';
    else {
      const found = arm.candidates(p).filter((pr) => fits(p, arm, pr));
      if (arm.rule === 'first') {
        if (found.length === 1) { bind(m, arm, found[0]); bound++; learntAt = learntAt || n; e.cooled = 'search, bound ' + found[0].map(arm.name).join(' then '); }
        else e.cooled = `tie held (${found.length} fit), nothing bound`;
      } else {
        // C139's held-open rule
        const before = held;
        let now = before === null ? found : before.filter((c) => found.some((f) => key(f) === key(c)));
        let note = '';
        if (now.length === 0) { now = found; note = ', conflict: started again'; }
        const unchanged = before !== null && before.length === now.length && note === '';
        if (now.length === 1 || (now.length > 1 && unchanged)) {
          bind(m, arm, now[0]); bound++; learntAt = learntAt || n; held = null;
          e.cooled = 'held tie settled, bound ' + now[0].map(arm.name).join(' then ') + (now.length > 1 ? ` (${now.length} interchangeable)` : '');
        } else { held = now; e.cooled = `tie held open (${now.length} candidates${note})`; }
      }
    }
    log.push(e);
  }
  let right = 0, wrong = 0, none = 0, made = 0;
  const r = recall(m);
  while (made < TEST) {
    const p = problem(rand, TEST_ANCHORS, true);
    if (seenPairs.has(p.a + ',' + p.b)) continue;
    made++;
    let answer = null;
    if (r.pair) { const u = read(p, arm.cell(p, r.pair[0])), v = read(p, arm.cell(p, r.pair[1])); if (isNumber(u) && isNumber(v)) answer = fact(u, v); }
    if (answer === null) none++; else if (answer === p.answer) right++; else wrong++;
  }
  return { log, right, wrong, none, learntAt, bound, recalled: r.att.map((s) => s.join('+') || '-') };
}

// ---------------------------------------------------------------- side probe: moves by the engine

function movesProbe() {
  const m = new Memory();
  for (let c = 0; c < COLS; c++) m.declarePopulation('C' + c, 1);
  m.declarePopulation('→', COLS); m.declarePopulation('←', COLS);
  // ENGINE: the walk, each step bound as it happens: the column it was in, the move, the column it reached
  for (let c = 0; c + 1 < COLS; c++) m.declareWord(['C' + c, '→', 'C' + (c + 1)]);
  for (let c = COLS - 1; c > 0; c--) m.declareWord(['C' + c, '←', 'C' + (c - 1)]);
  const rows = [];
  let exact = 0, total = 0;
  for (let c = 0; c < COLS; c++) for (const dir of ['→', '←']) {
    const target = dir === '→' ? c + 1 : c - 1;
    if (target < 0 || target >= COLS) continue;
    total++;
    m.reset(); m.moment = 0;
    // ENGINE: the column and the move arrive together; what comes on afterwards is the engine's
    const { moments } = m.invoke([['C' + c, dir]], { maxMoments: 3 });
    const cols = moments.slice(1).map((mo) => [...new Set(mo.active.map((a) => m.popOf(a.m).name).filter((n) => n.startsWith('C')))]);
    const after = cols[0] || [];
    const ok = after.length === 1 && after[0] === 'C' + target;
    if (ok) exact++;
    if (c === 5 || c === 0 || c === COLS - 1) rows.push(`  from C${c}, move ${dir}: next moment ${after.join(' ') || '(no column)'}${cols[1] ? `; then ${cols[1].join(' ') || '(no column)'}` : ''}   ${ok ? 'exactly the right column' : 'not exactly the right column'}`);
  }
  return { rows, exact, total };
}

// ---------------------------------------------------------------- report

const out = [];
const say = (s = '') => out.push(s);
say('C140 · Places, not values');
say(`Space ${ROWS} rows by ${COLS} columns, every other cell a random digit. ${TRAIN} worked examples per seed with the "−" in columns ${TRAIN_ANCHORS[0]}-${TRAIN_ANCHORS[TRAIN_ANCHORS.length - 1]}; ${TEST} test problems with the "−" in columns ${TEST_ANCHORS[0]}-${TEST_ANCHORS[TEST_ANCHORS.length - 1]} and operand pairs never seen; ${SEEDS} seeds.`);
say('');
const all = {};
for (const name of Object.keys(ARMS)) {
  all[name] = [];
  for (let s = 1; s <= SEEDS; s++) all[name].push(runSeed(s, name));
  const r = all[name][0];
  say(`== ${name}, seed 1`);
  for (const e of r.log) say(`  example ${e.n} (${e.at}): cooled by ${e.cooled}`);
  say(`  test: the engine brought on from "−" alone: ${r.recalled.join(' , ')}; right ${r.right}, wrong ${r.wrong}, no answer ${r.none}`);
  say('');
}
say('== summary over all seeds\n');
say('| arm | right | wrong | no answer | seeds at 100% | learnt at example (min / median / max) | procedures bound (mean) |');
say('|---|---|---|---|---|---|---|');
for (const name of Object.keys(ARMS)) {
  const rs = all[name], total = SEEDS * TEST;
  const sum = (f) => rs.reduce((t, r) => t + f(r), 0);
  const at = rs.map((r) => r.learntAt).filter((x) => x !== null).sort((a, b) => a - b);
  const learnt = at.length ? `${at[0]} / ${at[Math.floor((at.length - 1) / 2)]} / ${at[at.length - 1]}${at.length < SEEDS ? ` (never in ${SEEDS - at.length})` : ''}` : 'never';
  const pct = (x) => `${(100 * x / total).toFixed(1)}%`;
  say(`| ${name} | ${pct(sum((r) => r.right))} | ${pct(sum((r) => r.wrong))} | ${pct(sum((r) => r.none))} | ${rs.filter((r) => r.right === TEST).length} of ${SEEDS} | ${learnt} | ${(sum((r) => r.bound) / SEEDS).toFixed(1)} |`);
}
say('\n== the absolute arms, by how many procedures were bound in a seed\n');
say('| arm | bound | seeds | right | wrong | no answer |');
say('|---|---|---|---|---|---|');
for (const name of ['absolute, held open', 'absolute, first fit']) {
  const by = new Map();
  for (const r of all[name]) { const k = r.bound; if (!by.has(k)) by.set(k, { n: 0, right: 0, wrong: 0, none: 0 }); const b = by.get(k); b.n++; b.right += r.right; b.wrong += r.wrong; b.none += r.none; }
  for (const k of [...by.keys()].sort((a, b) => a - b)) { const b = by.get(k), t = b.n * TEST; say(`| ${name} | ${k} | ${b.n} | ${(100 * b.right / t).toFixed(1)}% | ${(100 * b.wrong / t).toFixed(1)}% | ${(100 * b.none / t).toFixed(1)}% |`); }
}
const mp = movesProbe();
say('\n== side probe: moves by the engine (a few starts shown)\n');
for (const row of mp.rows) say(row);
say(`\nExactly the right column the moment after the move: ${mp.exact} of ${mp.total} starts.`);
console.log(out.join('\n'));
