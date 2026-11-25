// C139 · Attention learnt by heat. Read hypothesis.md first: it has the ledger of what is given and what is the engine.
//
// Everything marked GIVEN below is a crutch, declared in the hypothesis. The engine (C138's copy, unchanged) does two
// things only: it stores a procedure (declareWord) and it recalls and runs it from the operator alone (invoke).
// Run: node attention.js > out.txt

'use strict';

const { Memory } = require('./engine');

const OPS = {
  // GIVEN: each operator's hidden convention (which registers, in which order) and its arithmetic facts
  '-': { pair: [1, 2], fact: (a, b) => a - b },
  '+': { pair: [3, 1], fact: (a, b) => a + b },
  '*': { pair: [1, 3], fact: (a, b) => a * b },
};
const OP_NAMES = { '-': '−', '+': '+', '*': '×' };
const REGISTERS = [1, 2, 3];
const PAIRS = []; // GIVEN: the search order, every ordered pair of registers
for (const i of REGISTERS) for (const j of REGISTERS) if (i !== j) PAIRS.push([i, j]);
const SEEDS = 20, TRAIN_PER_OP = 10, TEST_PER_OP = 100;

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------- the engine's part

function newMemory() {
  const m = new Memory();
  for (const op of Object.keys(OPS)) m.declarePopulation(op, 4);
  for (const r of REGISTERS) m.declarePopulation('@r' + r, 8); // attention to register r
  return m;
}

// ENGINE: the operator alone is given to invoke; the attention that comes on, moment by moment, is what the engine's
// gates and competition bring on. One attention a moment for two moments is a procedure; anything else is no procedure
// (several at once is a tie, nothing is no recall).
function recall(m, op) {
  m.reset();
  m.moment = 0;
  const { moments } = m.invoke([[op]], { maxMoments: 4 });
  const attended = moments.slice(1).map((mo) => [...new Set(mo.active.map((a) => m.popOf(a.m).name).filter((n) => n.startsWith('@r')))]);
  const first = attended[0] || [], second = attended[1] || [];
  if (first.length === 1 && second.length === 1) return { pair: [+first[0].slice(2), +second[0].slice(2)], attended };
  return { pair: null, attended };
}

// ENGINE: binding what was active at the moment of cooling, in the order it happened: the operator, then attention to
// the first register, then to the second (a state and a chain, members chosen as the engine chooses them).
function bind(m, op, [i, j]) { m.declareWord([op, '@r' + i, '@r' + j]); }

// ---------------------------------------------------------------- the world

function problem(rand, op, convention) {
  const regs = { 1: Math.floor(rand() * 10), 2: Math.floor(rand() * 10), 3: Math.floor(rand() * 10) }; // GIVEN: written by the encoder
  const [i, j] = convention;
  return { op, regs, answer: OPS[op].fact(regs[i], regs[j]) };
}
const read = (p, i) => p.regs[i]; // GIVEN: attending to a register yields its number
const fits = (p, [i, j]) => OPS[p.op].fact(read(p, i), read(p, j)) === p.answer; // GIVEN: the fit test

// ---------------------------------------------------------------- one seed of one arm

function runSeed(seed, arm) {
  const rand = rng(seed * 7919 + 13);
  const m = newMemory();
  const instances = new Map(); // memorise control only
  const train = [];
  for (const op of Object.keys(OPS)) for (let k = 0; k < TRAIN_PER_OP; k++) train.push(op);
  for (let k = train.length - 1; k > 0; k--) { const r = Math.floor(rand() * (k + 1)); [train[k], train[r]] = [train[r], train[k]]; }

  const log = [];
  const seenPairs = { '-': new Set(), '+': new Set(), '*': new Set() };
  const learntAt = {}, chains = { '-': 0, '+': 0, '*': 0 };
  const counter = { '-': 0, '+': 0, '*': 0 };
  const held = { '-': null, '+': null, '*': null }; // open arms only: the candidates still held open, per operator
  for (const op of train) {
    counter[op]++;
    const convention = arm.startsWith('shuffled') ? PAIRS[Math.floor(rand() * PAIRS.length)] : OPS[op].pair;
    const p = problem(rand, op, convention);
    seenPairs[op].add(p.regs[OPS[op].pair[0]] + ',' + p.regs[OPS[op].pair[1]]);
    const entry = { op, n: counter[op], cooled: null, reads: 0 };
    if (arm === 'memorise') {
      instances.set(op + ':' + p.regs[1] + ',' + p.regs[2] + ',' + p.regs[3], p.answer);
      entry.cooled = 'stored';
    } else if (arm === 'none') {
      const found = PAIRS.filter((pr) => fits(p, pr));
      entry.reads = PAIRS.length * 2;
      entry.cooled = found.length === 1 ? 'search (not kept)' : 'tie held';
    } else {
      // learn and shuffled: recall first
      const r = recall(m, op);
      if (r.pair) entry.reads += 2;
      if (r.pair && fits(p, r.pair)) entry.cooled = 'recall';
      else if (arm.endsWith('open')) {
        // AFTER THE FIRST RUN (declared in findings): a tie is held open across examples. The candidates are the
        // pairs that have fitted every example since they were opened. One left: bound. Several left, and this whole
        // example didn't tell them apart: they are interchangeable on the evidence, and the first in search order is
        // bound. None left: the evidence conflicts, and the candidates start again from this example.
        const found = PAIRS.filter((pr) => fits(p, pr));
        entry.reads += PAIRS.length * 2;
        const key = (pr) => pr.join(',');
        const before = held[op];
        let now = before === null ? found : before.filter((c) => found.some((f) => key(f) === key(c)));
        let note = '';
        if (now.length === 0) { now = found; note = ', conflict: started again'; }
        const unchanged = before !== null && before.length === now.length && note === '';
        if (now.length === 1 || (now.length > 1 && unchanged)) {
          bind(m, op, now[0]);
          chains[op]++;
          entry.cooled = 'held tie settled, bound ' + now[0].map((x) => 'r' + x).join(' then ') + (now.length > 1 ? ` (${now.length} interchangeable)` : '');
          if (learntAt[op] === undefined) learntAt[op] = counter[op];
          held[op] = null;
        } else {
          held[op] = now;
          entry.cooled = `tie held open (${now.length} candidates${note})`;
        }
      } else {
        const found = PAIRS.filter((pr) => fits(p, pr));
        entry.reads += PAIRS.length * 2;
        if (found.length === 1) {
          bind(m, op, found[0]);
          chains[op]++;
          entry.cooled = 'search, bound ' + found[0].map((x) => 'r' + x).join(' then ');
          if (learntAt[op] === undefined) learntAt[op] = counter[op];
        } else entry.cooled = `tie held (${found.length} pairs fit), nothing bound`;
      }
    }
    log.push(entry);
  }

  // test: the answer is "?"
  const test = {};
  for (const op of Object.keys(OPS)) {
    let right = 0, wrong = 0, none = 0, made = 0, readsOther = 0;
    const r = arm.startsWith('learn') || arm.startsWith('shuffled') ? recall(m, op) : null;
    while (made < TEST_PER_OP) {
      const p = problem(rand, op, OPS[op].pair);
      const key = p.regs[OPS[op].pair[0]] + ',' + p.regs[OPS[op].pair[1]];
      if (seenPairs[op].has(key)) continue; // only operand pairs never seen with this operator
      made++;
      let answer = null;
      if (arm === 'memorise') { const k = op + ':' + p.regs[1] + ',' + p.regs[2] + ',' + p.regs[3]; if (instances.has(k)) answer = instances.get(k); }
      else if (r && r.pair) {
        answer = OPS[op].fact(read(p, r.pair[0]), read(p, r.pair[1]));
        const unused = REGISTERS.find((x) => !OPS[op].pair.includes(x));
        if (r.pair.includes(unused)) readsOther++;
      }
      if (answer === null) none++; else if (answer === p.answer) right++; else wrong++;
    }
    test[op] = { right, wrong, none, recalled: r ? r.attended.map((s) => s.join('+') || '-') : null, readsOther };
  }
  return { log, test, learntAt, chains };
}

// ---------------------------------------------------------------- report

const ARMS = ['learn', 'shuffled', 'memorise', 'none', 'learn-open', 'shuffled-open'];
const out = [];
const say = (s = '') => out.push(s);
say('C139 · Attention learnt by heat');
say(`${SEEDS} seeds; ${TRAIN_PER_OP} worked examples per operator in training; ${TEST_PER_OP} test problems per operator, each with an operand pair never seen with that operator.`);
say('');

const all = {};
for (const arm of ARMS) {
  all[arm] = [];
  for (let s = 1; s <= SEEDS; s++) all[arm].push(runSeed(s, arm));
}

// the first seed of learn and shuffled in full
for (const arm of ['learn', 'shuffled', 'learn-open', 'shuffled-open']) {
  const r = all[arm][0];
  say(`== ${arm}, seed 1: training, example by example`);
  for (const e of r.log) say(`  ${OP_NAMES[e.op]} #${String(e.n).padEnd(2)} cooled by ${e.cooled.padEnd(44)} reads ${e.reads}`);
  say(`  test, what the engine brought on from the operator alone (moment 2, moment 3):`);
  for (const op of Object.keys(OPS)) say(`    ${OP_NAMES[op]}: ${(r.test[op].recalled || []).join(' , ')}   right ${r.test[op].right}, wrong ${r.test[op].wrong}, no answer ${r.test[op].none}`);
  say('');
}

say('== summary over all seeds\n');
say('| arm | operator | test right | test wrong | no answer | seeds at 100% | learnt at example (min / median / max) | procedures bound (mean) | reads of the unused register |');
say('|---|---|---|---|---|---|---|---|---|');
const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : '-'; };
for (const arm of ARMS) for (const op of Object.keys(OPS)) {
  const rs = all[arm];
  const sum = (f) => rs.reduce((t, r) => t + f(r), 0);
  const total = SEEDS * TEST_PER_OP;
  const pct = (x) => `${(100 * x / total).toFixed(1)}%`;
  const at = rs.map((r) => r.learntAt[op]).filter((x) => x !== undefined);
  const learning = arm.startsWith('learn') || arm.startsWith('shuffled');
  const learnt = learning && at.length ? `${Math.min(...at)} / ${median(at)} / ${Math.max(...at)}${at.length < SEEDS ? ` (never in ${SEEDS - at.length})` : ''}` : learning ? 'never' : '-';
  const bound = learning ? (sum((r) => r.chains[op]) / SEEDS).toFixed(1) : '-';
  say(`| ${arm} | ${OP_NAMES[op]} | ${pct(sum((r) => r.test[op].right))} | ${pct(sum((r) => r.test[op].wrong))} | ${pct(sum((r) => r.test[op].none))} | ${rs.filter((r) => r.test[op].right === TEST_PER_OP).length} of ${SEEDS} | ${learnt} | ${bound} | ${arm.startsWith('learn') ? sum((r) => r.test[op].readsOther) : '-'} |`);
}

// heat over training, learn arm: how each worked example was cooled, by its place in the operator's sequence
for (const arm of ['learn', 'learn-open']) {
say(`\n== ${arm}: how the n-th worked example of an operator was cooled (all seeds, all operators)\n`);
say('| n | by recall | by search, bound | tie held | reads (mean) |');
say('|---|---|---|---|---|');
for (let n = 1; n <= TRAIN_PER_OP; n++) {
  const es = all[arm].flatMap((r) => r.log.filter((e) => e.n === n));
  const c = (f) => es.filter(f).length;
  say(`| ${n} | ${c((e) => e.cooled === 'recall')} | ${c((e) => (e.cooled.startsWith('search') || e.cooled.startsWith('held tie settled')))} | ${c((e) => e.cooled.startsWith('tie'))} | ${(es.reduce((t, e) => t + e.reads, 0) / es.length).toFixed(1)} |`);
}
const late = all[arm].flatMap((r) => r.log.filter((e) => r.learntAt[e.op] !== undefined && e.n > r.learntAt[e.op]));
say(`\n${arm}: after an operator's procedure was bound: ${late.length} later worked examples, ${late.filter((e) => e.cooled === 'recall').length} cooled by recall, ${late.filter((e) => e.cooled !== 'recall').length} searched.`);
const ties = all[arm].flatMap((r) => r.log.filter((e) => e.cooled.startsWith('tie')));
say(`${arm}: ties held (examples where more than one pair fitted by coincidence): ${ties.length} of ${all[arm].length * TRAIN_PER_OP * 3}.`);
}

console.log(out.join('\n'));

// diagnosis (printed only with DIAG=1): the seeds where learn-open did not reach 100% on an operator
if (process.env.DIAG) for (const [s, r] of all['learn-open'].entries()) for (const op of Object.keys(OPS)) if (r.test[op].right < TEST_PER_OP) {
  console.log(`seed ${s + 1} ${OP_NAMES[op]}: ` + r.log.filter((e) => e.op === op).map((e) => `#${e.n} ${e.cooled}`).join(' | ') + ` || test recalled ${(r.test[op].recalled || []).join(' , ')}`);
}
