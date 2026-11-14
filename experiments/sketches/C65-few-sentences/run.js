// C65 · FRAMES FROM A HANDFUL OF SENTENCES. The owner's question: can comparison find constants, frames and the groups
// in their variables from just a few sentences, after one rest, where statistical learning needs a great deal of text?
// The branch engine (C56), abstract region over items (o.atoms), unchanged.
// GIVEN BY HAND (declared; results are not evidence for these):
//   G1 words are given as items: one item per word, in order (a region below that finds words, C62-C63, is skipped);
//   G2 the sentences (12, about energy flowing from one thing to another, one pattern: the X verb the Y);
//   G3 each sentence is seen once, in order; then one rest.
// THE ONE CHOICE TESTED BOTH WAYS: how sentences are kept.
//   ENERGY: as the engine is: kept only if energy falls (C60 found one-offs never are).
//   HELD: each sentence is kept at once, as an experience is (CAP-11), and so takes part in rest; rest itself is
//     unchanged (the energy rule decides every change). Done with the engine's own option o.remember = 1 (keep whatever
//     isn't already fully explained).
// Measured after the rest: the constants (shared parts), the frames (the code's kinds) and what their variables hold;
// how much the rest compressed what is kept; and whether a sentence never seen is explained as one placement of a frame.
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 8;
const S = ['the sun warms the sea', 'the sea warms the air', 'the fire heats the pot', 'the pot heats the water', 'the rain feeds the river', 'the river feeds the field',
  'the sun warms the field', 'the wind turns the mill', 'the field feeds the plant', 'the fire warms the room', 'the sun heats the stone', 'the stream turns the wheel'];
const NEW = ['the sun warms the river', 'the fire heats the sea', 'the rain feeds the plant'];   // never seen
const VOC = [...new Set([...S, ...NEW].join(' ').split(' '))]; globalThis.WORLD_VALUES = VOC.length + 2;
const E = require('../C56-integrated/engine/see.js');
const pic = (s) => { const x = new Uint8Array(64); s.split(' ').forEach((w, i) => { x[i] = VOC.indexOf(w) + 2; }); return x; };
const str = (m, u) => { const p = m.exp(u).filter((q) => q[1] === 0).sort((a, b) => a[0] - b[0]); return p.map((q, i) => (i && q[0] > p[i - 1][0] + 1 ? '… ' : '') + VOC[q[2] - 2]).join(' '); };
const out = {};
for (const keep of ['energy', 'held']) for (const n of [2, 4, 6, 8, 12]) {
  const m = new E.Model('FL', { atoms: true, ...(keep === 'held' ? { remember: 1 } : {}) });
  for (const s of S.slice(0, n)) m.step(pic(s));
  const before = m.measure().E, kept = m.items.length; m.rest(); const after = m.measure().E;
  const parts = m.units.filter((u) => u.layer > 1 && !u.kind && !u.loose && !u.virtual).map((u) => str(m, u));
  const frames = m.units.filter((u) => u.kind).map((K) => ({ constant: K.place.map((p) => str(m, p.u)).join(' + '), vars: (K.slots || [K.slot]).map((sl) => sl.set.fillers.map((f) => str(m, f.u))) }));
  const novel = NEW.map((s) => { const r = m.read(pic(s)); return { s, placements: r.claims.length, left: r.left.length, by: r.claims.map((c) => (c.c.virtual ? 'frame' : c.c.layer > 1 ? 'part' : 'word')).join('+') }; });
  out[`${keep}-${n}`] = { kept, before, after, parts, frames, novel };
  console.log(`\n${keep.toUpperCase()} · ${n} sentences · kept ${kept} · energy ${before.toFixed(1)} → ${after.toFixed(1)} after one rest`);
  console.log(`  constants and parts: ${parts.length ? parts.map((p) => JSON.stringify(p)).join(' ') : 'none'}`);
  for (const f of frames) console.log(`  frame: ${JSON.stringify(f.constant)} with variable${f.vars.length > 1 ? 's' : ''} ${f.vars.map((v) => '[' + v.join(' / ') + ']').join(' ')}`);
  console.log(`  never-seen sentences: ${novel.map((v) => `"${v.s}" → ${v.placements} placement${v.placements === 1 ? '' : 's'} (${v.by || 'none'})${v.left ? `, ${v.left} unexplained` : ''}`).join(' · ')}`);
}
require('fs').writeFileSync(path.join(__dirname, 'out.json'), JSON.stringify(out, null, 1));
