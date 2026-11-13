// C49's learner, general memory only: holds only assemblies with at least one slot. Shared by later experiments.
'use strict';
const path = require('path');
const { Learner } = require(path.join(__dirname, '../C43-item-learner/items.js'));
class GeneralOnly extends Learner {
  moves(window) { const out = super.moves(window).filter((m) => !/remember|undo kind|forget|thing \+ picture|^kind with|^widen$/.test(m.name));
    const pics = window.map(([p]) => p);
    // make a shape straight from two pictures that are the same except at some steps
    for (let i = 0; i < pics.length; i++) for (let j = i + 1; j < pics.length; j++) { const a = pics[i], b = pics[j]; if (a.size !== b.size || [...a.keys()].some((t) => !b.has(t))) continue;
      const same = [...a].filter(([t, s]) => b.get(t) === s), diff = [...a].filter(([t, s]) => b.get(t) !== s); if (!same.length || !diff.length) continue;
      if (this.kinds.some((K) => K.at.length === same.length && same.every(([t, s]) => K.at.some(([s2, t2]) => s2 === s && t2 === t)) && diff.every(([t]) => K.slots.some((sl) => sl.t === t)))) continue;
      out.push({ name: `make shape with ${diff.length} free place${diff.length > 1 ? 's' : ''}`, go: () => { this.kinds.push({ id: this.nid++, at: same.map(([t, s]) => [s, t]), slots: diff.map(([t, s]) => ({ t, fill: [s, b.get(t)] })) }); } }); }
    // drop a shape altogether
    for (const K of this.kinds) out.push({ name: 'drop shape', go: () => { this.kinds = this.kinds.filter((x) => x !== K); } });
    return out; } }
module.exports = { GeneralOnly };
