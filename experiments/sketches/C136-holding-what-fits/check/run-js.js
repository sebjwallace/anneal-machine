// Runs scenarios.json on the JavaScript copy and prints every moment, in the same form as gocheck.
'use strict';
const { Memory, STATE } = require('../engine.js');
const scenarios = require('./scenarios.json');
const out = [];
for (const sc of scenarios) {
  out.push(`# ${sc.name}`);
  const mem = new Memory();
  mem.setRefractoryPeriod(sc.refractory);
  for (const p of sc.populations) mem.declarePopulation(p, sc.size);
  const named = new Map();
  const partMembers = (name) => { const ms = []; for (const a of named.get(name)) for (const m of a.members) if (!ms.includes(m)) ms.push(m); return ms; };
  for (const st of sc.steps) {
    if (st.word) named.set(st.word, mem.declareWord(st.letters));
    else if (st.reset) mem.reset();
    else if (st.anneal) {
      const r = mem.anneal(st.anneal.map(partMembers));
      out.push(r ? `anneal ${st.anneal.join(',')} shares ${r.shared.join('')}` : `anneal ${st.anneal.join(',')} refused`);
    } else if (st.invoke) {
      const inv = mem.invoke(st.invoke);
      for (const mo of inv.moments) {
        const act = mo.active.map((x) => `${mem.label(x.m)}${x.arrived ? '' : '+'}[${x.gates.map((g) => g.from !== undefined ? `#${g.a.id}<${mem.label(g.from)}` : `#${g.a.id}:${g.counted}`).join(' ')}]`).join(' ');
        const comp = mo.competitions.map((c) => c.map((r) => `#${r.id}:${r.counted}:${r.outcome}`).join('/')).join(' ; ');
        out.push(`${mo.number} | ${act} | ref ${mo.refractory.map((m) => mem.label(m)).join(' ')} | unexpl ${mo.unexplained.join('')} | ${comp}`);
      }
      out.push(`repeats ${inv.repeatsEvery}`);
    }
  }
  for (const a of mem.assemblies) out.push(`#${a.id} ${a.shape === STATE ? 'state' : 'transition'} ${a.members.map((m) => mem.label(m)).join(' ')}`);
}
console.log(out.join('\n'));
