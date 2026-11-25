// C137 · A filler carried. Read hypothesis.md first.
//
// Two ways of learning the frame ("whole", "change") times three ways of moving ("core", "hold", "handon"), four
// probes each. The engine is C136's copy, unchanged: the learning and the holding rules below are the experiment's own,
// declared in the hypothesis. Run: node carry.js > out.txt

'use strict';

const { Memory, STATE, TRANSITION } = require('./engine');

const WORDS = ['put', 'in', 'cat', 'dog', 'hen', 'fox', 'den'];
const TRAINED = ['cat', 'dog', 'hen'];

// ---------------------------------------------------------------- learning

function build(way) {
  const m = new Memory();
  for (const w of WORDS) m.declarePopulation(w, 1); // a word encoder: one member a word, the same cell everywhere
  const id = (w) => m.population(w).first;
  m.form(STATE, [id('fox'), id('den')]); // "fox" is known, elsewhere
  for (const x of TRAINED) {
    const first = [id('put'), id(x)], second = [id('in'), id(x)];
    // each moment is a state: what is active together is bound
    m.reuseOrFormExactly(STATE, first);
    m.reuseOrFormExactly(STATE, second);
    if (way === 'change') {
      // only what changed: "put" became "in"; the animal didn't change
      m.reuseOrFormExactly(TRANSITION, [id('put'), id('in')]);
    } else {
      // whole states: every member of the first moment to every member of the second
      for (const a of first) for (const b of second) m.reuseOrFormExactly(TRANSITION, [a, b]);
    }
  }
  return m;
}

// ---------------------------------------------------------------- moving

// One moment. core: the engine's own upcoming and step. hold: a member active now stays on unless an alternative of it
// (the engine's between) comes on through the gates or the input. handon: as hold, and a member a transition carried
// activity forward from lets go.
function moment(m, names, move) {
  const next = m.upcoming(names.map((n) => m.population(n)));
  const why = {};
  if (move !== 'core') {
    const fresh = new Set(next.active); // what gates and input bring on, before anything is held
    const handed = new Set();
    for (const list of next.gates.values()) for (const g of list) if ('from' in g) handed.add(g.from);
    for (const x of m.active) {
      if (fresh.has(x)) continue;
      if (move === 'handon' && handed.has(x)) { why[name(m, x)] = 'handed on'; continue; }
      const rival = [...fresh].find((y) => y !== x && m.between(x, y));
      if (rival !== undefined) { why[name(m, x)] = `displaced by "${name(m, rival)}"`; continue; }
      next.active.add(x);
      why[name(m, x)] = 'held';
    }
  }
  const mo = m.step(next);
  return { input: names, active: sortNames(mo.active.map((a) => name(m, a.m))), why, competitions: mo.competitions };
}

function name(m, member) { return m.popOf(member).name; }
function sortNames(list) { return list.sort((a, b) => WORDS.indexOf(a) - WORDS.indexOf(b)); }

function run(m, inputs, move) {
  m.reset();
  m.moment = 0;
  const seq = inputs.concat([[], [], [], []]);
  const trace = [];
  for (let i = 0; i < seq.length; i++) {
    const t = moment(m, seq[i], move);
    trace.push(t);
    const restEmpty = seq.slice(i + 1).every((s) => s.length === 0);
    if (t.active.length === 0 && restEmpty) break;
  }
  return trace;
}

// ---------------------------------------------------------------- probes

const PROBES = [
  { name: 'carry', inputs: [['put', 'fox']], judgeAt: 2, right: ['in', 'fox'] },
  { name: 'trained', inputs: [['put', 'cat']], judgeAt: 2, right: ['in', 'cat'] },
  { name: 'alone', inputs: [['put']], judgeAt: 2, right: ['in'] },
  { name: 'replace', inputs: [['put', 'fox'], [], ['cat']], judgeAt: 4, right: ['in', 'cat'] },
];

function judge(trace, probe) {
  const at = trace[probe.judgeAt - 1];
  const got = at ? at.active : [];
  const ok = got.length === probe.right.length && probe.right.every((w) => got.includes(w));
  return { ok, got };
}

function show(trace) {
  const lines = [];
  trace.forEach((t, i) => {
    const input = t.input.length ? t.input.map((w) => `"${w}"`).join(' ') : '(nothing)';
    const active = t.active.length ? t.active.map((w) => `"${w}"`).join(' ') : '(nothing)';
    let line = `    moment ${i + 1}  input ${input.padEnd(14)} active ${active}`;
    const whys = Object.entries(t.why).map(([w, r]) => `"${w}" ${r}`);
    if (whys.length) line += `   [${whys.join('; ')}]`;
    for (const c of t.competitions) {
      const held = c.filter((o) => o.outcome === 'held').length;
      if (held) line += `   [a tie held between ${held} openings]`;
    }
    lines.push(line);
  });
  return lines.join('\n');
}

const results = [];
console.log('C137 · A filler carried\n');
for (const way of ['whole', 'change']) {
  for (const move of ['core', 'hold', 'handon']) {
    console.log(`== learning: ${way} · moving: ${move}`);
    for (const probe of PROBES) {
      const m = build(way);
      const trace = run(m, probe.inputs, move);
      const j = judge(trace, probe);
      results.push({ way, move, probe: probe.name, ...j });
      const got = j.got.length ? j.got.map((w) => `"${w}"`).join(' ') : '(nothing)';
      console.log(`  ${probe.name}: ${j.ok ? 'PASS' : 'fail'}  (moment ${probe.judgeAt}: ${got})`);
      console.log(show(trace));
    }
    console.log('');
  }
}

console.log('== summary (moment judged: what was active)\n');
const head = ['learning', 'moving', ...PROBES.map((p) => p.name)];
console.log('| ' + head.join(' | ') + ' |');
console.log('|' + head.map(() => '---').join('|') + '|');
for (const way of ['whole', 'change']) for (const move of ['core', 'hold', 'handon']) {
  const row = [way, move];
  for (const p of PROBES) {
    const r = results.find((x) => x.way === way && x.move === move && x.probe === p.name);
    const got = r.got.length ? r.got.map((w) => `"${w}"`).join(' ') : '(nothing)';
    row.push(`${r.ok ? '**pass**' : 'fail'}: ${got}`);
  }
  console.log('| ' + row.join(' | ') + ' |');
}
