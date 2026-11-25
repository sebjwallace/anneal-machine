// C138 · The trained filler. Read hypothesis.md first.
//
// Three arms (A as C137, B no fillers in the moments, C a transition closes the state it leaves), four probes each.
// The engine is C137's copy, unchanged; the learning and the moving rules below are the experiment's own, declared in
// the hypothesis. Run: node trained.js > out.txt

'use strict';

const { Memory, STATE, TRANSITION } = require('./engine');

const WORDS = ['put', 'in', 'shut', 'cat', 'dog', 'hen', 'fox', 'den'];
const FRAME = ['put', 'in', 'shut'];
const TRAINED = ['cat', 'dog', 'hen'];

// ---------------------------------------------------------------- learning

function build(arm) {
  const m = new Memory();
  for (const w of WORDS) m.declarePopulation(w, 1); // a word encoder: one member a word, the same cell everywhere
  const id = (w) => m.population(w).first;
  m.form(STATE, [id('fox'), id('den')]); // "fox" is known, elsewhere
  for (const x of TRAINED) {
    for (let i = 0; i < FRAME.length; i++) {
      // A and C: each moment is a state (what is active together is bound). B: nothing bound per moment.
      if (arm !== 'B') m.reuseOrFormExactly(STATE, [id(FRAME[i]), id(x)]);
      // only what changed: the frame word became the next one; the animal didn't change
      if (i > 0) m.reuseOrFormExactly(TRANSITION, [id(FRAME[i - 1]), id(FRAME[i])]);
    }
  }
  return m;
}

// ---------------------------------------------------------------- moving

// C137's hold and hand on: a member active now stays on unless it handed on (a transition carried activity forward
// from it) or an alternative of it (the engine's between) came on. Arm C adds: every state containing a member that
// handed on stops turning members on this moment.
function moment(m, names, arm) {
  const next = m.upcoming(names.map((n) => m.population(n)));
  const why = {};
  const handed = new Set();
  for (const list of next.gates.values()) for (const g of list) if ('from' in g) handed.add(g.from);

  if (arm === 'C') {
    for (const [member, list] of [...next.gates]) {
      const kept = list.filter((g) => 'from' in g || !g.a.members.some((x) => handed.has(x)));
      if (kept.length === list.length) continue;
      const closed = list.filter((g) => !kept.includes(g)).map((g) => `"${g.a.members.map((x) => name(m, x)).join('" "')}"`);
      why[name(m, member)] = `its state ${closed.join(', ')} closed`;
      if (kept.length) next.gates.set(member, kept);
      else { next.gates.delete(member); if (!next.arrived.has(member)) next.active.delete(member); }
    }
  }

  const fresh = new Set(next.active); // what gates and input bring on, before anything is held
  for (const x of m.active) {
    if (fresh.has(x)) continue;
    const n = name(m, x);
    const before = why[n] ? why[n] + ', then ' : '';
    if (handed.has(x)) { why[n] = before + 'handed on'; continue; }
    const rival = [...fresh].find((y) => y !== x && m.between(x, y));
    if (rival !== undefined) { why[n] = before + `displaced by "${name(m, rival)}"`; continue; }
    next.active.add(x);
    why[n] = before + 'held';
  }
  const mo = m.step(next);
  return { input: names, active: sortNames(mo.active.map((a) => name(m, a.m))), why, competitions: mo.competitions };
}

function name(m, member) { return m.popOf(member).name; }
function sortNames(list) { return list.sort((a, b) => WORDS.indexOf(a) - WORDS.indexOf(b)); }

function run(m, inputs, arm) {
  m.reset();
  m.moment = 0;
  const seq = inputs.concat([[], [], [], []]);
  const trace = [];
  for (let i = 0; i < seq.length; i++) {
    const t = moment(m, seq[i], arm);
    trace.push(t);
    const restEmpty = seq.slice(i + 1).every((s) => s.length === 0);
    if (t.active.length === 0 && restEmpty) break;
  }
  return trace;
}

// ---------------------------------------------------------------- probes

const PROBES = [
  { name: 'carry', inputs: [['put', 'fox']], right: { 2: ['in', 'fox'], 3: ['shut', 'fox'] } },
  { name: 'trained', inputs: [['put', 'cat']], right: { 2: ['in', 'cat'], 3: ['shut', 'cat'] } },
  { name: 'alone', inputs: [['put']], right: { 2: ['in'], 3: ['shut'] } },
  { name: 'replace', inputs: [['put', 'fox'], ['cat']], right: { 2: ['in', 'cat'], 3: ['shut', 'cat'] } },
];

function judge(trace, probe) {
  const got = {};
  let ok = true;
  for (const [at, right] of Object.entries(probe.right)) {
    const g = trace[at - 1] ? trace[at - 1].active : [];
    got[at] = g;
    if (!(g.length === right.length && right.every((w) => g.includes(w)))) ok = false;
  }
  return { ok, got };
}

const words = (list) => (list.length ? list.map((w) => `"${w}"`).join(' ') : '(nothing)');

function show(trace) {
  return trace.map((t, i) => {
    let line = `    moment ${i + 1}  input ${words(t.input).padEnd(14)} active ${words(t.active)}`;
    const whys = Object.entries(t.why).map(([w, r]) => `"${w}" ${r}`);
    if (whys.length) line += `   [${whys.join('; ')}]`;
    for (const c of t.competitions) {
      const held = c.filter((o) => o.outcome === 'held').length;
      if (held) line += `   [a tie held between ${held} openings]`;
    }
    return line;
  }).join('\n');
}

const ARMS = { A: 'as C137', B: 'no fillers in the moments', C: 'a transition closes the state it leaves' };
const results = [];
console.log('C138 · The trained filler\n');
for (const arm of Object.keys(ARMS)) {
  console.log(`== ${arm} · ${ARMS[arm]}`);
  for (const probe of PROBES) {
    const m = build(arm);
    const trace = run(m, probe.inputs, arm);
    const j = judge(trace, probe);
    results.push({ arm, probe: probe.name, ...j });
    console.log(`  ${probe.name}: ${j.ok ? 'PASS' : 'fail'}  (moment 2: ${words(j.got[2])}; moment 3: ${words(j.got[3])})`);
    console.log(show(trace));
  }
  console.log('');
}

console.log('== summary (moment 2 / moment 3: what was active)\n');
const head = ['arm', ...PROBES.map((p) => p.name)];
console.log('| ' + head.join(' | ') + ' |');
console.log('|' + head.map(() => '---').join('|') + '|');
for (const arm of Object.keys(ARMS)) {
  const row = [`${arm} · ${ARMS[arm]}`];
  for (const p of PROBES) {
    const r = results.find((x) => x.arm === arm && x.probe === p.name);
    row.push(`${r.ok ? '**pass**' : 'fail'}: ${words(r.got[2])} / ${words(r.got[3])}`);
  }
  console.log('| ' + row.join(' | ') + ' |');
}
